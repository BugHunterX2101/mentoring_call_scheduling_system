const express = require('express');
const db = require('../../config/db');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requireRole: rbac } = require('../../middleware/rbac.middleware');

const router = express.Router();

router.get('/', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, p.tags, p.description, p.is_active, p.rating_avg, p.rating_count, p.quote, p.ai_rationale, p.network_health 
       FROM users u 
       JOIN mentor_profiles p ON u.id = p.user_id 
       WHERE u.role = 'mentor' ORDER BY u.name`
    );
    res.json({ mentors: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', requireAuth, rbac(['admin']), async (req, res) => {
  const { tags, description, isActive } = req.body;
  try {
    // Dynamically build the update query
    let updates = [];
    let params = [];
    let idx = 1;
    
    if (tags !== undefined) {
      updates.push(`tags = $${idx++}`);
      params.push(JSON.stringify(tags));
    }
    if (description !== undefined) {
      updates.push(`description = $${idx++}`);
      params.push(description);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${idx++}`);
      params.push(isActive);
    }
    
    if (updates.length === 0) return res.json({ message: 'No changes provided' });
    
    params.push(req.params.id);
    const query = `UPDATE mentor_profiles SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING *`;
    
    const result = await db.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me/performance', requireAuth, rbac(['mentor']), async (req, res) => {
  try {
    // A simple real-time compatibility metric:
    // What % of all pending requirements match this mentor's tags?
    
    // 1. Get mentor's tags
    const mentorRes = await db.query('SELECT tags FROM mentor_profiles WHERE user_id = $1', [req.user.id]);
    if (mentorRes.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    
    const mentorTags = mentorRes.rows[0].tags || [];
    
    // 2. Get all pending requirements
    const reqRes = await db.query("SELECT user_tags FROM requirements WHERE status = 'pending'");
    const totalPending = reqRes.rows.length;
    
    if (totalPending === 0) {
      return res.json({ score: 85, metric: 'Base compatibility rating' }); // fallback
    }

    // 3. Count matches (a requirement matches if the mentor has AT LEAST ONE tag requested)
    let matchCount = 0;
    reqRes.rows.forEach(req => {
      const requestedTags = req.user_tags || [];
      if (requestedTags.length === 0) {
        matchCount++; // If no tags requested, it's a general match
      } else {
        const hasOverlap = requestedTags.some(t => mentorTags.includes(t));
        if (hasOverlap) matchCount++;
      }
    });

    // 4. Calculate score (base 70% + up to 30% based on match density)
    const matchRatio = matchCount / totalPending;
    const dynamicScore = Math.round(70 + (matchRatio * 30));

    res.json({ score: dynamicScore, metric: 'Compatibility based on active mentee demand' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
