const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const validRole = ['user', 'mentor'].includes(role) ? role : 'user';
    
    const userRes = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, validRole]
    );
    
    const user = userRes.rows[0];
    
    // Create empty profile
    if (validRole === 'user') {
      await db.query('INSERT INTO user_profiles (user_id, tags) VALUES ($1, $2)', [user.id, JSON.stringify([])]);
    } else {
      await db.query('INSERT INTO mentor_profiles (user_id, description, tags, is_active) VALUES ($1, $2, $3, $4)', [user.id, '', JSON.stringify([]), true]);
    }
    
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const userRes = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    let profile = null;
    if (req.user.role === 'user') {
      const pRes = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id]);
      profile = pRes.rows[0];
    } else if (req.user.role === 'mentor') {
      const pRes = await db.query('SELECT * FROM mentor_profiles WHERE user_id = $1', [req.user.id]);
      profile = pRes.rows[0];
    }
    
    res.json({
      user: userRes.rows[0],
      profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
