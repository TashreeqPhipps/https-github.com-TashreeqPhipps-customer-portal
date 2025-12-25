// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    accountNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // RegEx patterns
  const nameRegex = /^[A-Za-z\s]{2,}$/;
  const idRegex = /^\d{13}$/;
  const accountRegex = /^\d{10}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // ✅ Validate inputs
    if (!nameRegex.test(form.fullName)) {
      setErrorMsg("Invalid name. Use letters and spaces only.");
      return;
    }
    if (!idRegex.test(form.idNumber)) {
      setErrorMsg("Invalid ID number. Must be exactly 13 digits.");
      return;
    }
    if (!accountRegex.test(form.accountNumber)) {
      setErrorMsg("Invalid account number. Must be exactly 10 digits.");
      return;
    }
    if (!passwordRegex.test(form.password)) {
      setErrorMsg("Weak password. Must be at least 8 characters with letters and numbers.");
      return;
    }

    setLoading(true);
    try {
      // Map accountNumber -> username to match server expectations
      const payload = {
        username: form.accountNumber,
        password: form.password,
        fullName: form.fullName,
        idNumber: form.idNumber,
      };

      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setErrorMsg(data.error || "Too many registration attempts. Please try again later.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // success
      alert("Registration successful! Please sign in.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMsg("Something went wrong — check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>ID Number</label>
            <input
              type="text"
              name="idNumber"
              value={form.idNumber}
              onChange={handleChange}
              placeholder="13-digit SA ID number"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              placeholder="10-digit account number"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing up…" : "Sign Up"}
          </button>

          {errorMsg && <div style={{ color: "#ffb3b3", marginTop: 12 }}>{errorMsg}</div>}
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
};
