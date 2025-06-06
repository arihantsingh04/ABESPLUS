const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

const BASE_URL = 'https://abes.platform.simplifii.com';

// Root route
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

// Login route (POST)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const form = new URLSearchParams({ username, password });

    const response = await axios.post(`${BASE_URL}/api/v1/admin/authenticate`, form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://abes.web.simplifii.com',
        'Referer': 'https://abes.web.simplifii.com/',
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Login failed',
      details: error.response?.data || error.message,
    });
  }
});

// Attendance route (GET)
app.get('/api/attendance', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/admin/attendance`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization}`,
        'Origin': 'https://abes.web.simplifii.com',
        'Referer': 'https://abes.web.simplifii.com/',
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch attendance',
      details: error.response?.data || error.message,
    });
  }
});

// All Attendance route (GET)
app.get('/api/all-attendance', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/admin/all-attendance`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization}`,
        'Origin': 'https://abes.web.simplifii.com',
        'Referer': 'https://abes.web.simplifii.com/',
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch all attendance',
      details: error.response?.data || error.message,
    });
  }
});

// Quiz route (GET)
app.get('/api/quiz', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/admin/quiz`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization}`,
        'Origin': 'https://abes.web.simplifii.com',
        'Referer': 'https://abes.web.simplifii.com/',
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch quiz data',
      details: error.response?.data || error.message,
    });
  }
});

// Fallback route for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.url} not found`,
    availableRoutes: [
      '/api/login (POST)',
      '/api/attendance (GET)',
      '/api/all-attendance (GET)',
      '/api/quiz (GET)',
    ],
  });
});

module.exports = app;