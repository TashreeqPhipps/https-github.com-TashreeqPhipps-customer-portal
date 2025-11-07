/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getEnv } from '../utils/env';

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {}
});

export function AuthProvider({ children }) {
  const API = getEnv('REACT_APP_API', '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMe = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        signal
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        setUser(json.user || null);
      } else {
        // Not authenticated or other client error — treat as logged out
        setUser(null);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // fetch aborted — ignore
      } else {
        // network or other error
        setError('Failed to fetch session');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [API]);

  // initial load: check session
  useEffect(() => {
    const controller = new AbortController();
    fetchMe(controller.signal);
    return () => controller.abort();
  }, [fetchMe]);

  // Exposed login helper: posts credentials to /api/login and refreshes session
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const msg = j.error || j.message || `Login failed (${res.status})`;
        setError(msg);
        setUser(null);
        setLoading(false);
        return { ok: false, error: msg };
      }

      // On success, refresh /api/me to obtain user details (server should set HttpOnly cookie)
      await fetchMe();
      return { ok: true };
    } catch (err) {
      setError('Network error during login');
      setUser(null);
      return { ok: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, [API, fetchMe]);

  // Exposed logout helper: call server logout and clear client state
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      // ignore response body; treat as logged out in any case
      setUser(null);
      setLoading(false);
      return { ok: res.ok };
    } catch (err) {
      setError('Network error during logout');
      setLoading(false);
      setUser(null);
      return { ok: false, error: 'Network error' };
    }
  }, [API]);

  // Manual refresh function available to consumers
  const refreshUser = useCallback(async () => {
    const controller = new AbortController();
    await fetchMe(controller.signal);
  }, [fetchMe]);

  const value = {
    user,
    setUser,
    loading,
    error,
    login,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// custom hook for convenience
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
