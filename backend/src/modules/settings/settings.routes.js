const express = require('express');
const db = require('../../config/db');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requireRole: rbac } = require('../../middleware/rbac.middleware');

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

// GET /api/settings
router.get('/', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    const result = await db.query("SELECT value FROM admin_settings WHERE key = 'platform_config'");
    if (result.rows.length > 0) {
      res.json(result.rows[0].value);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/settings
router.patch('/', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    const settings = req.body;
    await db.query(
      "UPDATE admin_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = 'platform_config'",
      [JSON.stringify(settings)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/settings/backup
router.post('/backup', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    // Stub for backup functionality
    res.json({ success: true, file: `backup_${new Date().getTime()}.sql` });
  } catch (error) {
    console.error('Error backing up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/settings/clear-cache
router.post('/clear-cache', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    // Stub for cache clearing functionality
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
