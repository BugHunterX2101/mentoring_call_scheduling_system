const express = require('express');
const db = require('../../config/db');

const router = express.Router();

router.get('/call-types', async (req, res) => {
  try {
    const result = await db.query('SELECT value, label FROM call_types WHERE is_active = true ORDER BY id ASC');
    res.json({ callTypes: result.rows });
  } catch (error) {
    console.error('Error fetching call types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
