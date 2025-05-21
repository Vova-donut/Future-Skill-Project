// backend/db.js
const mysql = require('mysql2/promise');

// setting of connection — change user/password like you need
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin123',    // your root-password
  database: 'graduation_system',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;