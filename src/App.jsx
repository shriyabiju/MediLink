import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute   from "./auth/ProtectedRoute";

import Home              from "./pages/user/Home";
import Login             from "./pages/auth/Login";
import Signup            from "./pages/auth/Signup";
import PatientDashboard  from "./pages/patient/PatientDashboard";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import DonorDashboard    from "./pages/donor/DonorDashboard";
import AdminDashboard    from "./pages/admin/AdminDashboard";
import BloodBankDashboard from "./pages/bloodbank/BloodBankDashboard";

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
            element={<ProtectedRoute allowedRole="patient" element={<PatientDashboard />} />}
          />

          {/* ── Protected — Hospital ── */}
          <Route
            path="/hospital/dashboard"
            element={<ProtectedRoute allowedRole="hospital" element={<HospitalDashboard />} />}
          />

          {/* ── Protected — Donor ── */}
          <Route
            path="/donor/dashboard"
            element={<ProtectedRoute allowedRole="donor" element={<DonorDashboard />} />}
          />

          {/* ── Protected — Admin ── */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute allowedRole="admin" element={<AdminDashboard />} />}
          />

          {/* ── Protected — Blood Bank ── */}
          <Route
            path="/bloodbank/dashboard"
            element={<ProtectedRoute allowedRole="bloodbank" element={<BloodBankDashboard />} />}
          />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
