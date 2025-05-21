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
  const { student_id, password } = req.body; // получаем логин и код

  // Временная проверка: админ
  if (student_id === 'admin' && password === 'admin123') {
    return res.json({ role: 'admin', message: 'Admin logged in' });
  }

  // Здесь позже будет SELECT из базы
  res.status(401).json({ error: 'Invalid credentials' });
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


const csv = require('csv-parser'); // читаем CSV-файл
const generatePassword = (length = 6) => {
  // Генерация случайного пароля
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

app.post('/import-students', async (req, res) => {
  const results = []; // Массив всех студентов из CSV
  const filePath = path.join(__dirname, 'import', 'students.csv'); // Путь к файлу

  try {
    fs.createReadStream(filePath) // Читаем файл
      .pipe(csv())
      .on('data', row => {
        const password = generatePassword(); // Создаём пароль
        console.log(`Generated for ${row.student_id}: ${password}`); // Показываем в консоли
        results.push({ ...row, password }); // Добавляем в массив
      })
      .on('end', async () => {
        for (const student of results) {
          await pool.query(
            // Добавляем нового студента или обновляем данные
            `INSERT INTO students (student_id, full_name, email, faculty, password)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               full_name = VALUES(full_name),
               email = VALUES(email),
               faculty = VALUES(faculty)`,
            [
              student.student_id,
              student.full_name,
              student.email,
              student.faculty,
              student.password // ВНИМАНИЕ: используется ТОЛЬКО при первом добавлении
            ]
          );
        }

        // Отдаём обратно список студентов с паролями (для логов/рассылки)
        res.json({ message: 'Imported students (passwords only for new ones)', students: results });
      });
  } catch (err) {
    console.error('Error importing students:', err);
    res.status(500).json({ error: 'Server error during import' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});