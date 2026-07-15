const express = require('express');
const db = require('../../config/db');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');
const { requireRole: rbac } = require('../../middleware/rbac.middleware');
const { calculateOverlap } = require('./overlap.util');

const router = express.Router();

// GET /api/availability/me (user, mentor)
router.get('/me', requireAuth, rbac(['user', 'mentor']), async (req, res) => {
  try {
    const availRes = await db.query('SELECT * FROM availability WHERE owner_id = $1', [req.user.id]);
    res.json({ slots: availRes.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/availability/me (user, mentor)
router.put('/me', requireAuth, rbac(['user', 'mentor']), async (req, res) => {
  const { slots } = req.body;
  
  try {
    await db.query('BEGIN');
    await db.query('DELETE FROM availability WHERE owner_id = $1', [req.user.id]);
    
    for (const slot of slots) {
      await db.query(
        'INSERT INTO availability (owner_id, day_of_week, start_time, end_time, timezone, is_recurring) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.id, slot.day_of_week, slot.start_time, slot.end_time, slot.timezone, slot.is_recurring]
      );
    }
    
    await db.query('COMMIT');
    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/availability/overlap (admin)
router.get('/overlap', requireAuth, rbac(['admin']), async (req, res) => {
  const { userId, mentorId } = req.query;
  try {
    const userSlots = await db.query('SELECT * FROM availability WHERE owner_id = $1', [userId]);
    const mentorSlots = await db.query('SELECT * FROM availability WHERE owner_id = $1', [mentorId]);
    
    // Using a utility to calculate overlap handling timezones.
    const overlap = calculateOverlap(userSlots.rows, mentorSlots.rows);
    res.json({ overlap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
