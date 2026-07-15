require('dotenv').config();
const db = require('./db');

async function updateSchema() {
  try {
    console.log('Adding new columns to mentor_profiles...');
    
    // Add quote column if it doesn't exist
    await db.query(`
      ALTER TABLE mentor_profiles 
      ADD COLUMN IF NOT EXISTS quote TEXT,
      ADD COLUMN IF NOT EXISTS ai_rationale TEXT,
      ADD COLUMN IF NOT EXISTS network_health INTEGER DEFAULT 94;
    `);

    // Backfill some dummy data for existing mentors to make the UI look good
    await db.query(`
      UPDATE mentor_profiles
      SET quote = 'Focused on high-fidelity system design and scalable microservices architectures.',
          ai_rationale = 'Excellent technical fit based on overlapping backend experience.',
          network_health = floor(random() * 10 + 90) -- 90 to 99
      WHERE quote IS NULL;
    `);

    console.log('Creating call_types table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS call_types (
        id SERIAL PRIMARY KEY,
        value VARCHAR(50) UNIQUE NOT NULL,
        label VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // Insert default call types
    await db.query(`
      INSERT INTO call_types (value, label) VALUES 
        ('resume_revamp', 'Resume Revamp'),
        ('career_pivot', 'Career Pivot'),
        ('system_architecture', 'System Architecture'),
        ('mock_interview', 'Mock Interview')
      ON CONFLICT (value) DO NOTHING;
    `);

    console.log('Schema updated successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    process.exit();
  }
}

updateSchema();
