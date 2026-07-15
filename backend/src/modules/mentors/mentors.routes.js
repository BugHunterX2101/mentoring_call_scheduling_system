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

module.exports = router;
