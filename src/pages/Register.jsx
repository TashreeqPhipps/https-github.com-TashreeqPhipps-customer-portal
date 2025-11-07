import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
let api = null;

try {
  api = require("../services/api").default; // CommonJS require to avoid bundler errors if missing
} catch (e) {
  api = null;
}

let patterns;
try {
  patterns = require("../utils/validators").patterns;
} catch (e) {
  patterns = {
    fullName: /^[A-Za-zÀ-ÖØ-öø-ÿ'’\-\s]{2,100}$/, 
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,128}$/,
  };
}

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // clear server error when user types
    if (serverError) setServerError(null);
  }, [form.name, form.email, form.password]);

  const validateField = (name, value) => {
    if (!value) return "This field is required";
    if (name === "name") {
      return patterns.fullName.test(value) ? null : "Please enter a valid full name";
    }
    if (name === "email") {
      return patterns.email.test(value) ? null : "Please enter a valid email address";
    }
    if (name === "password") {
      return patterns.password.test(value)
        ? null
        : "Password must be at least 12 characters and include uppercase, lowercase, number and symbol";
    }
    return null;
  };

  const sanitize = (value) => {
    // Allow only text content
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // sanitize on input (defense in depth)
    const clean = sanitize(value);
    setForm((prev) => ({ ...prev, [name]: clean }));

    // live-validate this field
    setErrors((prev) => ({ ...prev, [name]: validateField(name, clean) }));
  };

  const focusFirstError = (errs) => {
    const first = Object.keys(errs).find((k) => errs[k]);
    if (first) {
      const el = document.querySelector(`[name="${first}"]`);
      if (el) el.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    // Run validations
    const newErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      focusFirstError(newErrors);
      return;
    }

    // Prepare payload 
    const payload = {
      fullName: form.name,
      email: form.email,
      password: form.password,
    };

    setSubmitting(true);
    try {
      if (api && typeof api.post === "function") {
        await api.post("/pages/register", payload);
        setForm({ name: "", email: "", password: "" });
        setServerError(null);
        alert("Registration request submitted — proceed to login.");
      } else {
        console.log("Register submitted (local fallback):", payload);
        setForm({ name: "", email: "", password: "" });
        alert("Registration (local fallback) complete — check console.");
      }
    } catch (err) {
      // try to surface server error message
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      setServerError(msg);
      focusFirstError({ server: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        {/* server error / top-level alert */}
        {serverError && (
          <div role="alert" style={{ color: "#ffb4b4", marginBottom: 12 }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.inputGroup}>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              style={{ ...styles.input, borderColor: errors.name ? "#ff6b6b" : styles.input.border }}
              autoComplete="name"
              inputMode="text"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "err-name" : undefined}
              required
            />
            {errors.name && (
              <div id="err-name" style={styles.errorText}>
                {errors.name}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{ ...styles.input, borderColor: errors.email ? "#ff6b6b" : styles.input.border }}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "err-email" : undefined}
              required
            />
            {errors.email && (
              <div id="err-email" style={styles.errorText}>
                {errors.email}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              style={{ ...styles.input, borderColor: errors.password ? "#ff6b6b" : styles.input.border }}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "err-password" : undefined}
              required
            />
            {errors.password && (
              <div id="err-password" style={styles.errorText}>
                {errors.password}
              </div>
            )}
            <small style={styles.hintText}>At least 12 characters, uppercase, lowercase, number and symbol</small>
          </div>

          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? "Submitting…" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 80px)",
    background: "#1e1e1e",
    padding: "24px",
    width: "100%",
    boxSizing: "border-box",
  },
  card: {
    background: "#2b2b2b",
    padding: "30px",
    borderRadius: "12px",
    width: "350px",
    color: "white",
  },
  title: {
    marginBottom: "20px",
    textAlign: "center",
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
  },
  errorText: {
    marginTop: 6,
    color: "#ffb4b4",
    fontSize: 13,
  },
  hintText: {
    marginTop: 6,
    color: "#cfcfcf",
    fontSize: 12,
  },
};
