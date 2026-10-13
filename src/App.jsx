import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute   from "./auth/ProtectedRoute";

import Home               from "./pages/user/Home";
import Login              from "./pages/auth/Login";
import Signup             from "./pages/auth/Signup";
import Dashboard          from "./pages/user/dashboard/Dashboard";
import HospitalDashboard  from "./pages/hospital/HospitalDashboard";

/* Admin dashboard placeholder until the real one is built */
const AdminPlaceholder = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12, fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>
    <div style={{ fontSize: "3rem" }}>🛡️</div>
    <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>Admin Dashboard</h2>
    <p>Coming soon — administrator portal is under construction.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"       element={<Home />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Protected — Patient ── */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute allowedRole="patient" element={<Dashboard />} />}
          />

          {/* ── Protected — Hospital ── */}
          <Route
            path="/hospital/dashboard"
            element={<ProtectedRoute allowedRole="hospital" element={<HospitalDashboard />} />}
          />

          {/* ── Protected — Admin ── */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute allowedRole="admin" element={<AdminPlaceholder />} />}
          />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
