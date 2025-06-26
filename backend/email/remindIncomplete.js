// backend/email/remindIncomplete.js
//http://localhost:3000/vova/student-form.html?student_id=${student.student_id}
const nodemailer = require('nodemailer');
const pool = require('../db');
require('dotenv').config();

async function remindIncomplete() {
  try {
    const [students] = await pool.query(`
      SELECT s.*
      FROM students s
      LEFT JOIN forms f ON s.student_id = f.student_id
      WHERE f.student_id IS NULL
    `);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    for (const student of students) {
      const mailOptions = {
        from: `"Future Skills" <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: '⏰ Reminder: Please fill the graduation form',
        html: `
          <p>Hi ${student.full_name},</p>
          <p>This is a gentle reminder to fill your graduation registration form:</p>
          <a href="http://172.20.10.7:3000/vova/student-form.html?student_id=${student.student_id}">Click here to complete it</a>
          <p>Thanks!</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SENT] Reminder sent to ${student.email}`);
    }

  } catch (err) {
    console.error('[REMIND FUNCTION] Error sending reminders:', err.message);
    throw err; // пробрасываем выше для API
  }
}


module.exports = remindIncomplete;