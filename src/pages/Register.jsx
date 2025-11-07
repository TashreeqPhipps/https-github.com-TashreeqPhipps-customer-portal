/* eslint-disable no-unused-vars */
// src/pages/Register.jsx
import React, { useState } from 'react';
import { getEnv } from '../utils/env'; // safe env getter
import { validate } from '../utils/validation'; // centralized REGEX validation
import { sanitizeInput } from '../utils/sanitize'; // DOMPurify wrapper

export default function Register() {
  // Feature flag: use env var REACT_APP_ALLOW_SELF_REGISTRATION === "true" to allow
  const ALLOW_REG = String(getEnv('REACT_APP_ALLOW_SELF_REGISTRATION', 'false')) === 'true';
  const API = getEnv('REACT_APP_API', '');

  const [form, setForm] = useState({
    fullName: '',
    idNumber: '',
    accountNumber: '',
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validation function for form fields using central validate() utility
  function validateAll() {
    const e = {};
    // fullName -> validation key 'fullName'
    const f1 = validate('fullName', form.fullName);
    if (!f1.ok) e.fullName = 'Please enter a valid full name (letters, spaces, - and \').';

    const f2 = validate('idNumber', form.idNumber);
    if (!f2.ok) e.idNumber = 'Please enter a valid ID number (13 digits).';

    const f3 = validate('accountNumber', form.accountNumber);
    if (!f3.ok) e.accountNumber = 'Please enter a valid account number (8–20 digits).';

    const f4 = validate('username', form.username);
    if (!f4.ok) e.username = 'Username must be 4–50 characters and may contain letters, numbers, . _ -';

    const f5 = validate('password', form.password);
    if (!f5.ok) e.password = 'Password must be at least 12 characters and include upper, lower, digit and special character.';

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null })); // clear inline error on change
    setMessage(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!ALLOW_REG) {
      setMessage('Self-registration is disabled. Please contact your branch or admin.');
      return;
    }

    if (!validateAll()) {
      setMessage('Please fix validation errors and try again.');
      return;
    }

    setLoading(true);

    // Sanitize all fields before sending — server MUST still validate server-side.
    const payload = {
      fullName: sanitizeInput(form.fullName),
      idNumber: sanitizeInput(form.idNumber),
      accountNumber: sanitizeInput(form.accountNumber),
      username: sanitizeInput(form.username),
      password: sanitizeInput(form.password) // password sanitized as plain text (no tags)
    };

    try {
      const res = await fetch(`${API}/api/register`, {
        method: 'POST',
        credentials: 'include', // use secure HttpOnly cookie auth if server returns it later
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Try to parse server error message
        const json = await res.json().catch(() => ({}));
        const errMsg = json.error || json.message || `Registration failed (status ${res.status})`;
        setMessage(errMsg);
        setLoading(false);
        return;
      }

      // Success
      setMessage('Registration successful. Please check your email or contact support for activation (if required).');
      setForm({ fullName: '', idNumber: '', accountNumber: '', username: '', password: '' });
      setErrors({});
    } catch (err) {
      setMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  if (!ALLOW_REG) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Registration Disabled</h2>
        <p>
          Self-registration is disabled for security reasons. To open a customer account,
          please contact your branch or the authorised onboarding channel.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>Create Customer Account</h2>
      <form onSubmit={onSubmit} autoComplete="off" noValidate>
        <div style={{ marginBottom: 12 }}>
          <label>Full name</label><br />
          <input
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            autoComplete="name"
            placeholder="e.g. Jane Doe"
            aria-invalid={!!errors.fullName}
            required
          />
          {errors.fullName && <div style={{ color: 'red' }}>{errors.fullName}</div>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>ID number</label><br />
          <input
            name="idNumber"
            value={form.idNumber}
            onChange={onChange}
            inputMode="numeric"
            autoComplete="off"
            placeholder="13 digits"
            aria-invalid={!!errors.idNumber}
            required
          />
          {errors.idNumber && <div style={{ color: 'red' }}>{errors.idNumber}</div>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Account number</label><br />
          <input
            name="accountNumber"
            value={form.accountNumber}
            onChange={onChange}
            inputMode="numeric"
            autoComplete="off"
            placeholder="8–20 digits"
            aria-invalid={!!errors.accountNumber}
            required
          />
          {errors.accountNumber && <div style={{ color: 'red' }}>{errors.accountNumber}</div>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Username</label><br />
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            autoComplete="off"
            placeholder="Choose a username"
            aria-invalid={!!errors.username}
            required
          />
          {errors.username && <div style={{ color: 'red' }}>{errors.username}</div>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label><br />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            placeholder="Strong password (min 12 chars)"
            aria-invalid={!!errors.password}
            required
          />
          {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </div>

        {message && <div style={{ marginTop: 12, color: message.toLowerCase().includes('success') ? 'green' : 'red' }}>{message}</div>}
      </form>
      <div style={{ marginTop: 14, color: '#666' }}>
        Note: This form must only be enabled in controlled environments. In production, prefer admin/HR-created accounts.
      </div>
    </div>
  );
}
