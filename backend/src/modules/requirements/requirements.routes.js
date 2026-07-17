const express = require('express');
const db = require('../../config/db');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requireRole: rbac } = require('../../middleware/rbac.middleware');

const router = express.Router();

router.post('/', requireAuth, rbac(['user']), async (req, res) => {
  const { callType, description, tags } = req.body;
  const validCallTypes = ['resume_revamp', 'career_pivot', 'system_architecture', 'job_market_guidance', 'mock_interview'];
  
  if (!validCallTypes.includes(callType)) {
    return res.status(400).json({ error: 'Invalid call type provided' });
  }

  try {
    const result = await db.query(
      `INSERT INTO requirements (user_id, call_type, description, status) 
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [req.user.id, callType, description]
    );
    
    // For v1, tags might just be updated on user_profiles if needed, or stored in requirement.
    // The schema didn't have tags on requirements table, so we use user_profiles tags as requested.
    if (tags) {
      await db.query('UPDATE user_profiles SET tags = $1 WHERE user_id = $2', [JSON.stringify(tags), req.user.id]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT r.*, u.name as user_name, p.tags as user_tags FROM requirements r JOIN users u ON r.user_id = u.id LEFT JOIN user_profiles p ON u.id = p.user_id WHERE r.user_id = $1 ORDER BY r.created_at DESC', 
      [req.user.id]
    );
    res.json({ requirements: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', requireAuth, rbac(['admin']), async (req, res) => {
  const { status, urgency } = req.query;
  try {
    let query = 'SELECT r.*, u.name as user_name, p.tags as user_tags FROM requirements r JOIN users u ON r.user_id = u.id LEFT JOIN user_profiles p ON u.id = p.user_id WHERE 1=1';
    const params = [];
    if (status) {
      params.push(status);
      query += ` AND r.status = $${params.length}`;
    }
    if (urgency) {
      params.push(urgency);
      query += ` AND r.urgency = $${params.length}`;
    }
    query += ' ORDER BY r.created_at DESC';
    
    const result = await db.query(query, params);
    res.json({ requirements: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT r.*, u.name as user_name, p.tags as user_tags FROM requirements r JOIN users u ON r.user_id = u.id LEFT JOIN user_profiles p ON u.id = p.user_id WHERE r.id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    // Auth check: Admin can view any, user can view their own
    if (req.user.role !== 'admin' && req.user.id !== result.rows[0].user_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/status', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.query('UPDATE requirements SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const { getRecommendationsForRequirement } = require('../recommendations/groqService');

router.post('/batch-match', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Missing requirements ids' });
    }
    
    // Ensure assigned_mentor_id column exists
    await db.query(`ALTER TABLE requirements ADD COLUMN IF NOT EXISTS assigned_mentor_id UUID REFERENCES users(id)`);
    
    let matchedCount = 0;
    for (const id of ids) {
       try {
          const reqRes = await db.query('SELECT * FROM requirements WHERE id = $1', [id]);
          if (reqRes.rows.length === 0) continue;
          
          // Use AI to get recommendations
          const matches = await getRecommendationsForRequirement(id);
          
          if (matches && matches.length > 0) {
             const topMatch = matches[0];
             // Assign the top mentor to the requirement and mark as matched
             await db.query(
                `UPDATE requirements SET status = 'matched', assigned_mentor_id = $1 WHERE id = $2`,
                [topMatch.id, id]
             );
             matchedCount++;
          } else {
             // Mark as failed if no matches
             await db.query(`UPDATE requirements SET status = 'failed' WHERE id = $1`, [id]);
          }
       } catch (err) {
          console.error(`Error matching requirement ${id}:`, err);
       }
    }
    
    res.json({ message: 'Batch match completed', updated: matchedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM requirements WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const reqData = result.rows[0];
    
    // Auth check: Admin can delete any, user can delete their own
    if (req.user.role !== 'admin' && req.user.id !== reqData.user_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Prevent postgres foreign key error if bookings exist
    const bookingRes = await db.query('SELECT id FROM bookings WHERE requirement_id = $1', [req.params.id]);
    if (bookingRes.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete requirement with active bookings. Please cancel the booking first.' });
    }
    
    await db.query('DELETE FROM requirements WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
