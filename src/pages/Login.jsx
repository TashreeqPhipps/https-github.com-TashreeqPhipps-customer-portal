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

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

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
