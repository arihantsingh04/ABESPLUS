const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Proxy for /api/login
app.post("/api/login", async (req, res) => {
  console.log("Proxy /api/login request:", req.body, req.headers);
  try {
    const response = await fetch("https://abes.platform.simplifii.com/api/v1/admin/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://abes.web.simplifii.com",
        Referer: "https://abes.web.simplifii.com/",
      },
      body: new URLSearchParams(req.body).toString(),
    });
    const data = await response.json();
    console.log("Proxy /api/login response:", data);
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy /api/login error:", err);
    res.status(500).json({ error: "Proxy error: " + err.message });
  }
});

// Proxy for /api/attendance
app.post("/api/attendance", async (req, res) => {
  console.log("Proxy /api/attendance request:", req.body, req.headers);
  try {
    const response = await fetch("https://attendance-jkkwj.ondigitalocean.app/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    console.log("Proxy /api/attendance response:", data);
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy /api/attendance error:", err);
    res.status(500).json({ error: "Proxy error: " + err.message });
  }
});

// Proxy for /api/all-attendance
app.get("/api/all-attendance", async (req, res) => {
  console.log("Proxy /api/all-attendance request:", req.headers);
  try {
    const response = await fetch("https://attendance-jkkwj.ondigitalocean.app/api/all-attendance", {
      headers: { Authorization: req.headers.authorization },
    });
    const data = await response.json();
    console.log("Proxy /api/all-attendance response:", data);
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy /api/all-attendance error:", err);
    res.status(500).json({ error: "Proxy error: " + err.message });
  }
});

// Proxy for /api/quiz
app.get("/api/quiz", async (req, res) => {
  console.log("Proxy /api/quiz request:", req.headers);
  try {
    const response = await fetch("https://attendance-jkkwj.ondigitalocean.app/api/quiz", {
      headers: { Authorization: req.headers.authorization },
    });
    const data = await response.json();
    console.log("Proxy /api/quiz response:", data);
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy /api/quiz error:", err);
    res.status(500).json({ error: "Proxy error: " + err.message });
  }
});

app.listen(3001, () => console.log("Proxy running on http://localhost:3001"));