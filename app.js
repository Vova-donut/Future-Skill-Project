<<<<<<< HEAD
<<<<<<< HEAD
// ✅ Graduation Portal System Backend
const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Login Page (Student)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Login Authenticator (using username + password)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await db.query(
      'SELECT * FROM students WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).send('Invalid username or password');
    }

    const student = rows[0];
    res.redirect(`/form?student_id=${student.student_id}`);
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// ✅ Prefilled Form Route
app.get('/form', async (req, res) => {
  const student_id = req.query.student_id;
  if (!student_id) return res.status(400).send('Missing student_id');

  try {
    const db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await db.query('SELECT * FROM students WHERE student_id = ?', [student_id]);

    if (rows.length === 0) return res.status(404).send('Student not found');

    res.sendFile(path.join(__dirname, 'public', 'form.html'));
  } catch (err) {
    console.error('❌ Failed to load form:', err.message);
    res.status(500).send('Server error');
  }
});

// ✅ Handle Form Submission
app.post('/form', async (req, res) => {
  const {
    student_id,
    mid_name,
    faculty,
    gender,
    attending,
    guest_count,
    food_pref,
    date_time
  } = req.body;

  try {
    const db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await db.query(
      `UPDATE students SET
        mid_name = ?,
        faculty = ?,
        gender = ?,
        attending = ?,
        guest_count = ?,
        food_pref = ?,
        date_time = ?
      WHERE student_id = ?`,
      [mid_name, faculty, gender, attending, guest_count, food_pref, date_time, student_id]
    );

    res.send('✅ Your graduation details have been updated!');
  } catch (err) {
    console.error('❌ Failed to update form:', err.message);
    res.status(500).send('Failed to update your details.');
  }
});

// ✅ API to fetch student for JS prefill
app.get('/api/student', async (req, res) => {
  const student_id = req.query.student_id;
  if (!student_id) return res.status(400).json({ error: 'Missing student_id' });

  try {
    const db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await db.query('SELECT * FROM students WHERE student_id = ?', [student_id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Failed to fetch student:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Import Excel
app.get('/import-excel', async (req, res) => {
  try {
    const db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const workbook = xlsx.readFile('FutureSkillsList.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const { studentID, FirstName, LastName, CourseName, Email, Password, username } = row;

      await db.query(
        `INSERT INTO students (
          student_id, first_name, last_name, course_name, email, password, username
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          course_name = VALUES(course_name),
          email = VALUES(email),
          password = VALUES(password),
          username = VALUES(username)`,
        [studentID, FirstName, LastName, CourseName, Email, Password, username]
      );
    }

    res.send('✅ Excel imported successfully with usernames and passwords!');
  } catch (err) {
    console.error('❌ Excel import failed:', err.message);
    res.status(500).send('Failed to import Excel.');
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
=======
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
>>>>>>> d3f0cec4fdc70a3012e82302cdb905334d1ab7b6
=======
// app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine (optional if using EJS)
// app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', (req, res) => {
  const formData = req.body;
  console.log('Form submitted:', formData);
  res.send('Form submitted successfully');
});

// Start server
app.listen(PORT, () => {
  console.log(`Node app running on http://localhost:${PORT}`);
});

>>>>>>> d794c9b4f43dcf9d6aff6c0b7c310b56d7c796bd
