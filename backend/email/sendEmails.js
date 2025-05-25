// backend/email/sendEmails.js
const nodemailer = require('nodemailer');
const pool = require('../db');
require('dotenv').config();

async function sendEmails() {
  const [students] = await pool.query('SELECT * FROM students');

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
      subject: '🎓 Graduation Registration Link',
      html: `
        <p>Hi ${student.full_name},</p>
        <p>You're invited to register for graduation. Use the link below:</p>
        <p>
          <a href="http://localhost:3000/muskan/index.html?student_id=${student.student_id}">
            Complete Your Graduation Form
          </a>
        </p>
        <p><strong>Your login:</strong> ${student.student_id}<br>
        <strong>Your password:</strong> ${student.password}</p>
        <p>— Future Skills Team</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Sent to ${student.email}`);
    } catch (err) {
      console.error(`❌ Error sending to ${student.email}:`, err.message);
    }
  }

  console.log('🎉 All emails sent.');
}

module.exports = sendEmails;


