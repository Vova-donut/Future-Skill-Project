# 🎓 Future Skill Project – Graduation Form System

## 📌 Overview

Every year, hundreds of students graduate from university in New Zealand. To manage the graduation event more efficiently, this project automates the process of collecting attendance and meal preference information from students.

One month before the graduation, teachers receive an Excel spreadsheet containing:
- Student names
- Student IDs
- Emails
- Faculties

This system sends an automated email to each student with a unique link to a registration website. On that site, the student enters their ID and fills out a form.

## 📋 Student Form Includes
(*Note: these fields may change — handled by frontend team*)

- Attendance confirmation (Yes/No)
- Number of guests
- Food preference (Vegan, Vegetarian, Regular)

## 🧑‍🏫 Admin Features

- Ability to view all student responses
- Sort/filter data (e.g., by faculty, food type)
- Export data to Excel or another database format

## 👥 Team Members & Responsibilities

| Name     | Role                   | Responsibilities                                  |
|----------|------------------------|---------------------------------------------------|
| Daasha   | Team Leader, Email Dev | Email sending, form submission logic              |
| Vova     | Database Developer     | MySQL schema, backend integration, data export    |
| Vraj     | Frontend Developer     | Form UI/UX design                                 |
| Muskan   | Frontend Developer     | Form UI/UX design                                 |

## 🛠️ Tech Stack

- MySQL (Database)
- Node.js / Express (Backend)
- HTML/CSS/JavaScript (Frontend)
- Nodemailer (Email service)
- GitHub (Version control)
- Excel (Import/Export)
