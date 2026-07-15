require('dotenv').config();
const db = require('./db');

async function seedAvailability() {
  try {
    const mentorRes = await db.query("SELECT id FROM users WHERE name = 'Alex Johnson'");
    const userRes = await db.query("SELECT id FROM users WHERE name = 'Sarah Chen'");
    
    if (mentorRes.rows.length === 0 || userRes.rows.length === 0) {
      console.log('Mentor or User not found');
      process.exit(1);
    }

    const mentorId = mentorRes.rows[0].id;
    const userId = userRes.rows[0].id;

    // Clear old
    await db.query("DELETE FROM availability WHERE owner_id IN ($1, $2)", [mentorId, userId]);

    // Insert new availability (e.g. Wednesday and Thursday overlapping)
    const slots = [
      { owner: mentorId, day: 3, start: '10:00:00', end: '13:00:00' },
      { owner: mentorId, day: 4, start: '11:00:00', end: '14:00:00' },
      { owner: userId, day: 3, start: '11:00:00', end: '15:00:00' }, // overlap 11-13 on Wed
      { owner: userId, day: 4, start: '09:00:00', end: '12:00:00' }, // overlap 11-12 on Thu
    ];

    for (const s of slots) {
      await db.query(
        "INSERT INTO availability (owner_id, day_of_week, start_time, end_time, timezone, is_recurring) VALUES ($1, $2, $3, $4, 'UTC', true)",
        [s.owner, s.day, s.start, s.end]
      );
    }
    
    console.log('Seeded availability for overlap analysis!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seedAvailability();
