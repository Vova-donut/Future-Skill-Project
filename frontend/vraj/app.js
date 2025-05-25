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

