// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ Redirect if not logged in
    if (!token) {
      alert("Please log in first");
      window.location.href = "/login";
      return;
    }

    // ✅ Fetch user profile securely
    fetch("http://localhost:4000/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          // Token invalid or expired
          localStorage.removeItem("token");
          alert("Session expired. Please log in again.");
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch user data.");
        }

        return res.json();
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch((err) => {
        console.error("Failed to load user:", err);
        setErrorMsg("Could not load your profile. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out");
    window.location.href = "/login";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Dashboard</h2>

        {loading ? (
          <p style={styles.loading}>Loading your details...</p>
        ) : errorMsg ? (
          <p style={{ color: "#ffb3b3", textAlign: "center" }}>{errorMsg}</p>
        ) : !user ? (
          <p style={styles.loading}>No user data found.</p>
        ) : (
          <div style={styles.details}>
            <div style={styles.detailRow}>
              <span style={styles.label}>Account Number:</span>
              <span style={styles.value}>{user.accountNumber}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Full Name:</span>
              <span style={styles.value}>{user.fullName}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{user.email || "N/A"}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Balance:</span>
              <span style={styles.value}>R {user.balance?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        )}

        <button style={styles.logoutButton} onClick={handleLogout}>
          Log Out
        </button>
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
    maxWidth: "500px",
    color: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  loading: {
    textAlign: "center",
    fontSize: "1rem",
    color: "#aaa",
  },
  details: {
    marginBottom: "20px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #444",
  },
  label: {
    color: "#aaa",
  },
  value: {
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    background: "#ff4a4a",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
    fontSize: "1rem",
  },
};
