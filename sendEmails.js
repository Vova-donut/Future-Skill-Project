const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
require('dotenv').config();

(async () => {
  try {
    const db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [students] = await db.query('SELECT * FROM students');

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const student of students) {
      const link = `http://localhost:3000/form?student_id=${student.student_id}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: '🎓 Future Skills Graduation Registration',
        text: `Hi ${student.first_name},\n\nYou’ve been selected for the Future Skills Graduation Ceremony 2025!\n\nPlease complete your graduation registration form at the link below:\n\n${link}\n\nThanks,\nFuture Skills Team`
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to: ${student.email}`);
    }

    console.log('✅ All emails sent!');
  } catch (error) {
    console.error('❌ Failed to send emails:', error.message);
  }
})();
