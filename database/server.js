// backend/server.js
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

// Чтобы Express умел читать JSON из тела запроса
app.use(express.json());

// Получить все ответы студентов — /responses
app.get('/responses', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        s.faculty,
        f.attending,
        f.guests,
        f.food_preference,
        f.submission_time
      FROM forms f
      JOIN students s ON f.student_id = s.student_id
      ORDER BY f.submission_time DESC
    `);

    res.json(results);
  } catch (err) {
    console.error('Ошибка при получении /responses:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint для приёма формы
app.post('/submit', async (req, res) => {
  try {
    const { student_id, attending, guests, food_preference } = req.body;

    // Проверим, что student_id существует
    const [students] = await pool.query(
      'SELECT 1 FROM students WHERE student_id = ?', [student_id]
    );
    if (students.length === 0) {
      return res.status(400).json({ error: 'Invalid student_id' });
    }

    // Сохраняем запись в таблицу forms
    await pool.query(
      `INSERT INTO forms
        (student_id, attending, guests, food_preference)
      VALUES (?, ?, ?, ?)`,
      [ student_id, attending, guests, food_preference ]
    );

    res.json({ message: 'Form submitted successfully' });
  } catch (err) {
    console.error('Error in /submit:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

// Export all form responses as CSV
app.get('/export', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        s.faculty,
        f.attending,
        f.guests,
        f.food_preference,
        f.submission_time
      FROM forms f
      JOIN students s ON f.student_id = s.student_id
      ORDER BY f.submission_time DESC
    `);

    const fields = [
      'student_id',
      'full_name',
      'email',
      'faculty',
      'attending',
      'guests',
      'food_preference',
      'submission_time'
    ];

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(results);

    // Автоматически отдаём как файл
    res.header('Content-Type', 'text/csv');
    res.attachment('graduation_responses.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    res.status(500).json({ error: 'Server error while exporting' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});