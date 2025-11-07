const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const validateInput = require('../middleware/validateInput'); // ✅ Import added

const router = express.Router();

// RegEx patterns
const nameRegex = /^[A-Za-z\s]{2,}$/;       // Full name: letters and spaces only
const idRegex = /^\d{13}$/;                 // SA ID: exactly 13 digits
const accountRegex = /^\d{10}$/;            // Account number: exactly 10 digits
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
// Password: min 8 chars, at least one letter and one number

// 🔐 Login only — no registration
router.post('/login', validateInput, async (req, res) => {
  const { accountNumber, password } = req.body;

  const user = await User.findOne({ accountNumber });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// ✅ Profile (for dashboard)
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json(user);
});

module.exports = router;