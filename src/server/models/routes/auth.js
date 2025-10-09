const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// RegEx patterns
const nameRegex = /^[A-Za-z\s]{2,}$/; // Full name: letters and spaces only
const idRegex = /^\d{13}$/;           // SA ID: exactly 13 digits
const accountRegex = /^\d{10}$/;      // Account number: exactly 10 digits
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
// Password: min 8 chars, at least one letter and one number

// Register
router.post('/register', async (req, res) => {
  const { fullName, idNumber, accountNumber, password } = req.body;

  // Validate inputs
  if (!nameRegex.test(fullName)) return res.status(400).json({ error: 'Invalid full name' });
  if (!idRegex.test(idNumber)) return res.status(400).json({ error: 'Invalid ID number' });
  if (!accountRegex.test(accountNumber)) return res.status(400).json({ error: 'Invalid account number' });
  if (!passwordRegex.test(password)) return res.status(400).json({ error: 'Weak password' });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({ fullName, idNumber, accountNumber, passwordHash });
  await user.save();

  res.status(201).json({ message: 'User registered securely' });
});

// Login
router.post('/login', async (req, res) => {
  const { accountNumber, password } = req.body;

  // Validate login inputs
  if (!accountRegex.test(accountNumber)) return res.status(400).json({ error: 'Invalid account number format' });
  if (!passwordRegex.test(password)) return res.status(400).json({ error: 'Invalid password format' });

  const user = await User.findOne({ accountNumber });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

module.exports = router;