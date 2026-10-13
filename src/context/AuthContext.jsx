import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const ROLE_ROUTES = {
  patient:  "/dashboard",
  hospital: "/hospital/dashboard",
  admin:    "/admin/dashboard",
};

/* ── Helpers ── */
const saveUser = (user) => localStorage.setItem("ml_user", JSON.stringify(user));
const loadUser = () => {
  try { return JSON.parse(localStorage.getItem("ml_user")); }
  catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUser());

  const login = useCallback((name, email, role) => {
    const u = { name, email, role };
    setUser(u);
    saveUser(u);
    return ROLE_ROUTES[role] ?? "/dashboard";
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("ml_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, ROLE_ROUTES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
