const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  idNumber: String,
  accountNumber: String,
  passwordHash: String,
  role: { type: String, default: 'customer' }
});

module.exports = mongoose.model('User', userSchema);