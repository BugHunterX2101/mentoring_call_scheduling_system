const bcrypt = require('bcrypt');
const db = require('../config/db');

async function seed() {
  console.log('Starting seed...');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mentorque.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
  const adminName = process.env.ADMIN_NAME || 'Super Admin';
  
  const defaultPassword = 'password123';
  const saltRounds = 10;
  
  try {
    // Check if admin exists to prevent double seeding
    const adminCheck = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    if (adminCheck.rows.length > 0) {
      console.log('Database already seeded. Exiting.');
      process.exit(0);
    }
    
    const adminHash = await bcrypt.hash(adminPassword, saltRounds);
    const defaultHash = await bcrypt.hash(defaultPassword, saltRounds);

    // 1. Insert Admin
    await db.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      [adminName, adminEmail, adminHash, 'admin']
    );

    // 2. Insert 5 Mentors
    const mentorTags = [
      ['Big company', 'Tech', 'Senior Developer'],
      ['Good communication', 'Non-tech', 'India'],
      ['Big company', 'Tech', 'Ireland'],
      ['Good communication', 'Tech'],
      ['Non-tech', 'Senior Developer', 'Ireland']
    ];
    
    for (let i = 1; i <= 5; i++) {
      const userRes = await db.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
        [`Mentor ${i}`, `mentor${i}@example.com`, defaultHash, 'mentor']
      );
      const mentorId = userRes.rows[0].id;
      
      const tags = JSON.stringify(mentorTags[i-1]);
      const description = `I am mentor ${i} with experience in ${mentorTags[i-1].join(', ')}.`;
      
      await db.query(
        `INSERT INTO mentor_profiles (user_id, tags, description, rating_avg, rating_count) VALUES ($1, $2, $3, $4, $5)`,
        [mentorId, tags, description, 4.5 + (i * 0.1), 10 + i * 5]
      );
    }

    // 3. Insert 10 Users
    for (let i = 1; i <= 10; i++) {
      const userRes = await db.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
        [`User ${i}`, `user${i}@example.com`, defaultHash, 'user']
      );
      const userId = userRes.rows[0].id;
      
      const userTags = (i % 2 === 0) ? ['Tech'] : ['Non-tech'];
      const tags = JSON.stringify(userTags);
      const description = `I am user ${i} looking for help in ${userTags[0]}.`;
      
      await db.query(
        `INSERT INTO user_profiles (user_id, tags, description) VALUES ($1, $2, $3)`,
        [userId, tags, description]
      );
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
