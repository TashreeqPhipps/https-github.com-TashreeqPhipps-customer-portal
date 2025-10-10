import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first");
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or failed to fetch");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error("Failed to load user:", err);
        alert("Session expired or invalid. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
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

        {!user ? (
          <p style={styles.loading}>Loading your details...</p>
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
              <span style={styles.value}>
                R {user.balance?.toFixed(2) || "0.00"}
              </span>
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