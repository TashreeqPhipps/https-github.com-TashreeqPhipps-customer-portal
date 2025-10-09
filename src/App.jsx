// src/App.jsx
import { Link, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <>
      {/* ✅ Navbar container only */}
      <header style={{ borderBottom: "1px solid #eee" }}>
        <nav
          style={{
            display: "flex",
            gap: 16,
            padding: "12px 24px",
            maxWidth: 960,
            margin: "0 auto",
          }}
        >
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      {/* ✅ Full-width content container */}
      <main style={{ minHeight: "calc(100vh - 60px)", width: "100%" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<p style={{ padding: 24 }}>Page not found</p>} />
        </Routes>
      </main>
    </>
  );
}
