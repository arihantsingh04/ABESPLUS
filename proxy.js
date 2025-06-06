const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

const BASE_URL = 'https://abes.platform.simplifii.com';

// Add a handler for the root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the ABES Plus Proxy Server',
    availableRoutes: [
      '/api/login (POST)',
      '/api/attendance (GET)',
      '/api/all-attendance (GET)',
      '/api/quiz (GET)',
    ],
  });
});

app.post('/api/login', async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/login`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/attendance', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/attendance`, {
      headers: { Authorization: `Bearer ${req.headers.authorization}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

app.get('/api/all-attendance', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/all-attendance`, {
      headers: { Authorization: `Bearer ${req.headers.authorization}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all attendance' });
  }
});

app.get('/api/quiz', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/quiz`, {
      headers: { Authorization: `Bearer ${req.headers.authorization}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz data' });
  }
});

app.listen(3001, () => {
  console.log('Proxy server running on port 3001');
});

module.exports = app;