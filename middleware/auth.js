// backend/middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, jwtSecret, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid/expired token' });
    // attach user info from token
    req.user = payload;
    next();
  });
}

module.exports = authenticateToken;
