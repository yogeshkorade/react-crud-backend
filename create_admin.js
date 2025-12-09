// create_admin.js (run with: node create_admin.js)
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const password = 'Admin@123'; // change
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query('INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)', ['Admin', 'admin@example.com', '9876543210', hash]);
  console.log('User created with id', result.insertId);
  process.exit(0);
})();
