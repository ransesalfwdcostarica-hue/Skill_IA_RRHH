const express = require('express');
const cors = require('cors');
const { handleChat } = require('./Controllers/chatController');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint de salud (Health Check)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Garnier HR Assistant'
  });
});

// Endpoint principal del chatbot
app.post('/chat', handleChat);

module.exports = app;
