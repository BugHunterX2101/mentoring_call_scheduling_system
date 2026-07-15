require('dotenv').config({ path: '../../.env' });
const db = require('./db');

const mentorNames = [
  "Sarah Chen", "David Miller", "Elena Rodriguez", "James Wilson", "Michael Chang"
];

const userNames = [
  "Alex Johnson", "Emily Davis", "Ryan Patel", "Sophia Martinez", "Ethan Wright",
  "Olivia Kim", "Daniel Smith", "Ava Thompson", "Lucas Garcia", "Mia Robinson"
];

async function seedNames() {
  try {
    const res = await db.query('SELECT id, name, role FROM users');
    const users = res.rows;
    
    let mentorIndex = 0;
    let userIndex = 0;

    for (const u of users) {
      if (u.role === 'admin') continue;

      let newName = u.name;
      if (u.role === 'mentor' && mentorIndex < mentorNames.length) {
        newName = mentorNames[mentorIndex++];
      } else if (u.role === 'user' && userIndex < userNames.length) {
        newName = userNames[userIndex++];
      }

      if (newName !== u.name) {
        await db.query('UPDATE users SET name = $1 WHERE id = $2', [newName, u.id]);
        console.log(`Updated ${u.role} (${u.name}) -> ${newName}`);
      }
    }
    console.log('Seeding names completed successfully.');
  } catch (err) {
    console.error('Error seeding names:', err);
  } finally {
    process.exit(0);
  }
}

seedNames();
