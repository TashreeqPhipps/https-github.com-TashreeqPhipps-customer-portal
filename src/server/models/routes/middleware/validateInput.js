// server/middleware/validateInput.js

module.exports = function (req, res, next) {
  const { fullName, idNumber, accountNumber } = req.body;

  const nameRegex = /^[A-Za-z\s]{2,50}$/;
  const idRegex = /^\d{13}$/;
  const accountRegex = /^\d{10}$/;

  if (fullName && !nameRegex.test(fullName)) {
    return res.status(400).json({ error: 'Invalid full name format' });
  }

  if (idNumber && !idRegex.test(idNumber)) {
    return res.status(400).json({ error: 'Invalid ID number format' });
  }

  if (accountNumber && !accountRegex.test(accountNumber)) {
    return res.status(400).json({ error: 'Invalid account number format' });
  }

  next();
};