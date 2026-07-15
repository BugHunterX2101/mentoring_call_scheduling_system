const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function fixPasswords() {
  const adminHash = await bcrypt.hash('adminpassword', 10);
  const defaultHash = await bcrypt.hash('password123', 10);
  
  await db.query("UPDATE users SET password_hash = $1 WHERE role = 'admin'", [adminHash]);
  await db.query("UPDATE users SET password_hash = $1 WHERE role != 'admin'", [defaultHash]);
  
  console.log('Passwords fixed');
  process.exit(0);
}

fixPasswords();
