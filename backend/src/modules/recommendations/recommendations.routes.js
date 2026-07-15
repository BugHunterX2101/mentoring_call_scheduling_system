const express = require('express');
const db = require('../../config/db');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requireRole: rbac } = require('../../middleware/rbac.middleware');
const Groq = require('groq-sdk');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const { getRecommendationsForRequirement } = require('./groqService');

router.post('/:requirementId', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    const requirementId = req.params.requirementId;
    
    // Check if req exists
    const reqRes = await db.query('SELECT id FROM requirements WHERE id = $1', [requirementId]);
    if (reqRes.rows.length === 0) return res.status(404).json({ error: 'Requirement not found' });
    
    // Clear old recommendations for this req
    await db.query('DELETE FROM recommendations WHERE requirement_id = $1', [requirementId]);

    const finalMatches = await getRecommendationsForRequirement(requirementId);

    // Persist new recommendations
    for (const r of finalMatches) {
      await db.query(
        `INSERT INTO recommendations (requirement_id, mentor_id, fit_score, rationale) VALUES ($1, $2, $3, $4)`,
        [requirementId, r.id, r.fit_score, r.rationale]
      );
    }

    res.json({ matches: finalMatches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/summary', requireAuth, async (req, res) => {
  try {
    // Generate some dynamic mock stats for the Mentee Dashboard AI Helper
    const mentorRes = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['mentor']);
    const availRes = await db.query('SELECT COUNT(DISTINCT mentor_id) as overlap_count FROM availability');
    
    res.json({
      summary: `Based on your recent availability, we found ${availRes.rows[0].overlap_count || 3} mentors matching your timezone specializing in your requested fields.`,
      matchCount: parseInt(availRes.rows[0].overlap_count) || 3,
      totalMentors: parseInt(mentorRes.rows[0].count) || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
