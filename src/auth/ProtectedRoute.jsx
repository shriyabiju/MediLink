import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps a dashboard route.
 * allowedRole — the role string that may access this route.
 * If not logged in  → /login
 * If wrong role     → their own dashboard
 */
export default function ProtectedRoute({ element, allowedRole }) {
  const { user, ROLE_ROUTES } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) return <Navigate to={ROLE_ROUTES[user.role] ?? "/"} replace />;
  return element;
}
