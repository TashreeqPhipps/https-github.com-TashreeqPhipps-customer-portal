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
