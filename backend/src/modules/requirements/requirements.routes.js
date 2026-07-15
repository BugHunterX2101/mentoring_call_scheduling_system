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

router.post('/batch-match', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Missing requirements ids' });
    }
    
    // Simulating batch matching - update all to "matched"
    // In reality this might trigger an async job or multiple /recommendation calls
    const query = `UPDATE requirements SET status = 'matched' WHERE id = ANY($1) RETURNING *`;
    const result = await db.query(query, [ids]);
    
    res.json({ message: 'Batch match successful', updated: result.rows.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
