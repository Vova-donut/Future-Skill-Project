// backend/server.js
const express = require('express');
const pool = require('./db');

pool.query('SELECT 1')
  .then(() => console.log('✅ MySQL connected successfully!'))
  .catch(err => console.error('❌ MySQL connection failed:', err));

const app = express();
const PORT = 3000;

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    attending = VALUES(attending),
    guests = VALUES(guests),
    food_preference = VALUES(food_preference),
    submission_time = CURRENT_TIMESTAMP`,
      [student_id, attending, guests, food_preference]
    );


    res.json({ message: 'Form submitted successfully' });
  } catch (err) {
    console.error('Error in /submit:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/login', async (req, res) => {
  const { student_id, password } = req.body;

  // 👉 Временная проверка для админа
  if (student_id === 'admin' && password === 'admin123') {
    return res.json({ role: 'admin', message: 'Admin logged in successfully' });
  }

  // 👉 Поиск студента в базе
  try {
    const [rows] = await pool.query(
      'SELECT * FROM students WHERE student_id = ? AND password = ?',
      [student_id, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid student ID or password' });
    }

    res.json({ role: 'student', student: rows[0], message: 'Student logged in successfully' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});


const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

// Показываем все файлы из папки frontend
app.use(express.static(path.join(__dirname, '../frontend')));

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


app.post('/import-students', upload.single('file'), async (req, res) => {
  const filePath = req.file.path; // 🧭 путь к загруженному файлу
  const results = [];
  const fs = require('fs');
  const csv = require('csv-parser'); // читаем CSV-файл

  const generatePassword = (length = 6) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  try {
    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ''),
      }))
      .on('data', (row) => {
        const sid = String(row.student_id).replace(/[^\d]/g, '').trim();

        if (!sid) {
          console.warn('⚠️ Пропущена строка с неправильным student_id:', row);
          return; // пропускаем строку
        }

        const password = generatePassword();

        results.push({
          ...row,
          student_id: sid, // очищенный student_id
          password
        });
      })
      .on('end', async () => {
        for (const student of results) {
          await pool.query(
            `INSERT INTO students (student_id, full_name, email, faculty, password)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               full_name = VALUES(full_name),
               email = VALUES(email),
               faculty = VALUES(faculty),
               password = IF(password IS NULL OR password = '', VALUES(password), password)`,
            [
              student.student_id,
              student.full_name,
              student.email,
              student.faculty,
              student.password
            ]
          );
        }

        // 🧹 Удалим временный файл после импорта
        fs.unlinkSync(filePath);

        res.json({
          message: '✅ Students imported successfully',
          importedCount: results.length
        });
      });
  } catch (err) {
    console.error('❌ Error importing students:', err);
    res.status(500).json({ error: 'Server error during import' });
  }
});

const sendEmails = require('./email/sendEmails');

// POST /send-emails
app.post('/send-emails', async (req, res) => {
  try {
    await sendEmails(); // функция уже есть
    res.json({ message: 'Emails sent successfully' });
  } catch (err) {
    console.error('Error sending emails:', err);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

// POST /reset-database 
app.post('/reset-database', async (req, res) => {
  try {
    // Сначала удаляем записи из зависимой таблицы (forms)
    await pool.query('DELETE FROM forms');
    await pool.query('DELETE FROM students');

    res.json({ message: '🧹 Database cleared successfully' });
  } catch (err) {
    console.error('❌ Error resetting database:', err);
    res.status(500).json({ error: 'Server error during reset' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});