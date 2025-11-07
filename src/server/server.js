<<<<<<< HEAD
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

//Security middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

//Rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Try again later."
}));

//Regex validation (example placeholders)
const REGEX = {
  username: /^[A-Za-z0-9._-]{4,50}$/,
  password: /^(?=.{12,128}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/,
};

// Login route
app.post("/pages/login", (req, res) => {
  const { username, password } = req.body;

  if (!REGEX.username.test(username) || !REGEX.password.test(password)) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
});

// Get current session
app.get("/api/me", (req, res) => {
  const token = req.cookies.session_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
});

// Registration is disabled
app.post("/api/register", (req, res) => {
  return res.status(403).json({ error: "Registration is disabled" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
=======
const fs = require('fs');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();

// ✅ Security Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ✅ Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// ✅ Routes
app.use('/api/auth', authRoutes);

// ✅ Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ✅ HTTPS Server Setup (for dev/testing)
const sslOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem')
};

const PORT = process.env.PORT || 443;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🔒 HTTPS server running on port ${PORT}`);
});
>>>>>>> origin/main
