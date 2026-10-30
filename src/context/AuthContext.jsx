import { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const ROLE_ROUTES = {
  patient:   "/dashboard",
  hospital:  "/hospital/dashboard",
  admin:     "/admin/dashboard",
  donor:     "/donor/dashboard",
  bloodbank: "/bloodbank/dashboard",
};

/* ── Persist / load user (includes token) ── */
const saveUser  = (u) => localStorage.setItem("ml_user", JSON.stringify(u));
const clearUser = ()  => localStorage.removeItem("ml_user");
const loadUser  = () => {
  try { return JSON.parse(localStorage.getItem("ml_user")); }
  catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUser());

  /**
   * login(name, email, role)
   *   — kept for the fallback offline flow (used by the mock auth in Login/Signup)
   *   — real API path goes through loginWithApi()
   */
  const login = useCallback((name, email, role, extra = {}) => {
    const u = { name, email, role, ...extra };
    setUser(u);
    saveUser(u);
    return ROLE_ROUTES[role] ?? "/dashboard";
  }, []);

  /**
   * loginWithApi(email, password, role)
   * Calls POST /api/auth/login with the selected role, stores token + user,
   * and returns the redirect path for that role.
   * Throws on error so the caller can display the message.
   */
  const loginWithApi = useCallback(async (email, password, role) => {
    const data = await authApi.login({ email, password, role });
    const u    = { ...data.user, token: data.token };
    setUser(u);
    saveUser(u);
    return ROLE_ROUTES[data.user.role] ?? "/dashboard";
  }, []);

  /**
   * registerWithApi(formData)
   * Calls POST /api/auth/register.
   * For hospitals: returns { approvalPending: true, message }.
   * For others:    stores token + user, returns redirect path.
   */
  const registerWithApi = useCallback(async (formData) => {
    const data = await authApi.register(formData);

    /* Hospital / blood bank / donor registration returns a message, no token */
    if (!data.token && (data.approvalStatus === "pending" || data.donorStatus === "pending")) {
      return { approvalPending: true, message: data.message };
    }

    const u = { ...data.user, token: data.token };
    setUser(u);
    saveUser(u);
    return { approvalPending: false, redirect: ROLE_ROUTES[data.user.role] ?? "/dashboard" };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithApi, registerWithApi, logout, ROLE_ROUTES }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
