// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// REGISTER (optional; good for testing)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Name, email and password are required' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ error: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, hash]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ token, user: { id: userId, name, email, phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = rows[0];
    if (!user.password_hash) return res.status(400).json({ error: 'No password set for this account' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // respond with token and some user data (omit password)
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
