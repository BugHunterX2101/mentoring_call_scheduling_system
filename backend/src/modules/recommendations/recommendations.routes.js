const express = require('express');
const db = require('../../config/db');
const { requireAuth } = require('../../middleware/auth.middleware');
const { requireRole: rbac } = require('../../middleware/rbac.middleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY);

router.post('/:requirementId', requireAuth, rbac(['admin']), async (req, res) => {
  try {
    const requirementId = req.params.requirementId;
    const reqRes = await db.query(
      `SELECT r.*, u.name as user_name, p.tags as user_tags 
       FROM requirements r 
       JOIN users u ON r.user_id = u.id 
       LEFT JOIN user_profiles p ON u.id = p.user_id 
       WHERE r.id = $1`, [requirementId]
    );
    
    if (reqRes.rows.length === 0) return res.status(404).json({ error: 'Requirement not found' });
    const requirement = reqRes.rows[0];

    // 1. Structured Filter (Call Type rules)
    let tagFilter = '';
    if (requirement.call_type === 'resume_revamp') tagFilter = 'Big company';
    if (requirement.call_type === 'job_market_guidance') tagFilter = 'Good communication';
    // For mock_interview, we need to match user domain tag. Assuming user has 'Tech' or 'Non-tech'.
    if (requirement.call_type === 'mock_interview') {
      const uTags = requirement.user_tags || [];
      if (uTags.includes('Tech')) tagFilter = 'Tech';
      if (uTags.includes('Non-tech')) tagFilter = 'Non-tech';
    }

    // Fetch candidate mentors (vectorless fallback mode active as we haven't generated embeddings yet)
    let candidateQuery = `
      SELECT u.id, u.name, p.tags, p.description, p.rating_avg, p.rating_count 
      FROM users u 
      JOIN mentor_profiles p ON u.id = p.user_id 
      WHERE u.role = 'mentor' AND p.is_active = true
    `;
    const candidateRes = await db.query(candidateQuery);
    let candidates = candidateRes.rows;

    // Apply hard filter
    if (tagFilter) {
      candidates = candidates.filter(c => (c.tags || []).includes(tagFilter));
    }

    if (candidates.length === 0) {
      return res.json({ matches: [] }); // Empty state
    }

    // 2. LLM Ranking & Rationale 
    // We send candidates to Gemini to score them out of 100 and write a 1-2 sentence rationale.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
    
    const prompt = `
      You are an expert matchmaking assistant. Rank the following mentor candidates for a user's requirement.
      
      User Requirement:
      Call Type: ${requirement.call_type}
      Description: ${requirement.description}
      Tags: ${(requirement.user_tags || []).join(', ')}
      
      Candidates:
      ${candidates.map(c => `ID: ${c.id}, Name: ${c.name}, Tags: ${(c.tags || []).join(', ')}, Description: ${c.description}`).join('\n\n')}
      
      Output JSON in this format:
      [
        { "mentor_id": "...", "fit_score": 95, "rationale": "Strong fit..." }
      ]
      Sort by fit_score descending. Provide a 1-2 sentence rationale per mentor. Keep it concise.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    let ranked;
    try {
      ranked = JSON.parse(text);
    } catch (e) {
      // Fallback parser if JSON is dirty
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      ranked = JSON.parse(text.substring(jsonStart, jsonEnd));
    }

    // Format final response and persist to DB
    const finalMatches = [];
    for (const r of ranked) {
      const mentor = candidates.find(c => c.id === r.mentor_id);
      if (mentor) {
        // Persist
        await db.query(
          `INSERT INTO recommendations (requirement_id, mentor_id, fit_score, rationale) VALUES ($1, $2, $3, $4)`,
          [requirementId, r.mentor_id, r.fit_score, r.rationale]
        );
        finalMatches.push({
          ...mentor,
          fit_score: r.fit_score,
          rationale: r.rationale
        });
      }
    }

    res.json({ matches: finalMatches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
