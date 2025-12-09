const authenticateToken = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET user by id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// CREATE user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone || null]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const id = req.params.id;
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
