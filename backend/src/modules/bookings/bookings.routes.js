const express = require('express');
const db = require('../../config/db');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requireRole: rbac } = require('../../middleware/rbac.middleware');

const router = express.Router();

router.post('/', requireAuth, rbac(['admin']), async (req, res) => {
  const { requirementId, userId, mentorId, startTime, endTime } = req.body;
  
  try {
    await db.query('BEGIN');
    
    // Create booking
    const bookingRes = await db.query(
      `INSERT INTO bookings (requirement_id, user_id, mentor_id, admin_id, start_time, end_time, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed') RETURNING *`,
      [requirementId, userId, mentorId, req.user.id, startTime, endTime]
    );
    
    // Update requirement status
    await db.query(`UPDATE requirements SET status = 'booked' WHERE id = $1`, [requirementId]);
    
    // Remove slots from both pools (In a real system, you'd match by date/time, 
    // for this v1 we might just delete overlap slots or assume fixed windows.
    // For simplicity, we just clear the matching day_of_week slots for both.)
    const day = new Date(startTime).getDay();
    await db.query(`DELETE FROM availability WHERE owner_id IN ($1, $2) AND day_of_week = $3`, [userId, mentorId, day]);
    
    await db.query('COMMIT');
    res.json(bookingRes.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const roleCol = req.user.role === 'user' ? 'user_id' : (req.user.role === 'mentor' ? 'mentor_id' : 'admin_id');
    const result = await db.query(
      `SELECT b.*, 
              u.name as user_name, u.email as user_email, 
              p.tags as user_tags,
              m.name as mentor_name, m.email as mentor_email 
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       LEFT JOIN user_profiles p ON u.id = p.user_id
       JOIN users m ON b.mentor_id = m.id
       WHERE b.${roleCol} = $1
       ORDER BY b.start_time ASC`, [req.user.id]
    );
    res.json({ bookings: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/all', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, 
              u.name as user_name, u.email as user_email, 
              m.name as mentor_name, m.email as mentor_email 
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN users m ON b.mentor_id = m.id
       ORDER BY b.start_time DESC`
    );
    res.json({ bookings: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const booking = result.rows[0];
    
    // Auth check: Admin can delete any, user can delete their own, mentor can delete their own
    if (req.user.role !== 'admin' && req.user.id !== booking.user_id && req.user.id !== booking.mentor_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await db.query('BEGIN');
    await db.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    await db.query('UPDATE requirements SET status = $1 WHERE id = $2', ['pending', booking.requirement_id]);
    await db.query('COMMIT');
    
    res.json({ success: true });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
