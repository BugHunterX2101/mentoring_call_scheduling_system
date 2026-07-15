require('dotenv').config({ path: '../../.env' });
const db = require('./db');

async function seedReq() {
  try {
    const res = await db.query("SELECT id, name FROM users WHERE role = 'user' LIMIT 1");
    if (res.rows.length === 0) {
      console.log('No users found');
      return;
    }
    const userId = res.rows[0].id;
    
    await db.query(`
      INSERT INTO requirements (user_id, call_type, description, status) 
      VALUES ($1, 'resume_revamp', 'Looking to transition from Marketing Operations to Product Management. Needs a mentor with experience in top-tier tech firms who can review current resume and provide strategic structural feedback.', 'pending')
    `, [userId]);
    
    await db.query("UPDATE user_profiles SET tags = '[\"RESUME REVAMP\", \"TECH INDUSTRY\"]' WHERE user_id = $1", [userId]);
    
    console.log(`Requirement seeded successfully for user ${res.rows[0].name}`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
seedReq();
