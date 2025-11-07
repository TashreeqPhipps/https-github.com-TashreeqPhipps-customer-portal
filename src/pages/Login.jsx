<<<<<<< HEAD
/* eslint-disable no-unused-vars */
import React, { useState, useContext } from 'react';
import { getEnv } from '../utils/env';
import AuthContext from '../contexts/AuthContext'; 
import { sanitizeInput } from '../utils/sanitize';

export default function Login() {
  const API = getEnv('REACT_APP_API', '');
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
=======
import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({ accountNumber: "", password: "" });

  const accountRegex = /^\d{10}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
>>>>>>> origin/main

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

<<<<<<< HEAD
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      username: sanitizeInput(form.username),
      password: sanitizeInput(form.password)
    };

    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        credentials: 'include',               
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const json = await res.json().catch(()=>({}));
        setError(json.error || 'Login failed');
        setLoading(false);
        return;
      }

      const me = await fetch(`${API}/api/me`, { credentials: 'include' });
      if (me.ok) {
        const j = await me.json();
        setUser(j.user || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError('Network error — try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} autoComplete="off">
        <div>
          <label>Username</label><br/>
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            autoComplete="off"
            required
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Password</label><br/>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            required
          />
        </div>
=======
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ RegEx validation
    if (!accountRegex.test(form.accountNumber)) {
      alert("Invalid account number. Must be exactly 10 digits.");
      return;
    }
    if (!passwordRegex.test(form.password)) {
      alert("Invalid password. Must be at least 8 characters with letters and numbers.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Login successful!");
        console.log("JWT token:", data.token);
        // TODO: Store token and redirect to dashboard
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              placeholder="Enter your 10-digit account number"
              style={styles.input}
              required
            />
          </div>
>>>>>>> origin/main

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>

        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
      <div style={{ marginTop: 12, color: '#666' }}>
        Registration is disabled. Contact your branch to open a customer account.
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 80px)",
    width: "100%",
    background: "#1e1e1e",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    background: "#2b2b2b",
    padding: "30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    color: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #555",
    background: "#1e1e1e",
    color: "white",
    marginTop: "5px",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    background: "#4a67ff",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
    fontSize: "1rem",
  },
};
>>>>>>> origin/main
