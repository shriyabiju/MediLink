/**
 * MediLink — centralised API client
 *
 * Base URL comes from the Vite env variable VITE_API_URL.
 * Default: http://localhost:5000/api
 *
 * Add  VITE_API_URL=https://your-production-api.com/api
 * to your .env file at the project root (next to package.json).
 */

/* In dev, Vite proxies /api → http://localhost:5000 so we use a relative path.
   In production, set VITE_API_URL to your deployed API origin. */
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

/** Read the JWT stored by AuthContext */
const getToken = () => {
  try {
    const u = JSON.parse(localStorage.getItem("ml_user") || "null");
    return u?.token ?? null;
  } catch {
    return null;
  }
};

/** Core fetch wrapper */
async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const tok = token ?? getToken();
  if (tok) headers["Authorization"] = `Bearer ${tok}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.code   = data.code;
    throw err;
  }
  return data;
}

/* ──────────────────────────────────────────
   AUTH
────────────────────────────────────────── */
export const authApi = {
  register: (body)  => request("/auth/register", { method: "POST", body }),
  login:    (body)  => request("/auth/login",    { method: "POST", body }),
  me:       (token) => request("/auth/me",       { token }),
};

/* ──────────────────────────────────────────
   ADMIN
────────────────────────────────────────── */
export const adminApi = {
  getStats:       ()               => request("/admin/stats"),
  getHospitals:   (status = "all") => request(`/admin/hospitals?status=${status}`),
  getHospital:    (id)             => request(`/admin/hospitals/${id}`),
  approveHospital:(id)             => request(`/admin/hospitals/${id}/approve`, { method: "PATCH" }),
  rejectHospital: (id, reason="") => request(`/admin/hospitals/${id}/reject`,  { method: "PATCH", body: { reason } }),
  getUsers:       (params = {})   => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/users${q ? "?" + q : ""}`);
  },
  deactivateUser: (id)             => request(`/admin/users/${id}/deactivate`, { method: "PATCH" }),
  getDonors:      (status = "all") => request(`/admin/donors?status=${status}`),
  approveDonor:   (id)             => request(`/admin/donors/${id}/approve`, { method: "PATCH" }),
  rejectDonor:    (id)             => request(`/admin/donors/${id}/reject`,  { method: "PATCH" }),
};

/* ──────────────────────────────────────────
   DONOR
────────────────────────────────────────── */
export const donorApi = {
  /* Profile */
  getProfile:    ()     => request("/donor/profile"),
  updateProfile: (body) => request("/donor/profile", { method: "PATCH", body }),

  /* Password */
  changePassword: (body) => request("/donor/change-password", { method: "POST", body }),

  /* Settings */
  getSettings:  ()     => request("/donor/settings"),
  saveSettings: (body) => request("/donor/settings", { method: "PATCH", body }),

  /* Dashboard stats */
  getDashboard: () => request("/donor/dashboard"),

  /* Donations */
  submitDonation:  (body) => request("/donor/donations",            { method: "POST", body }),
  getMyDonations:  ()     => request("/donor/donations"),
  getDonationById: (id)   => request(`/donor/donations/${id}`),
  cancelDonation:  (id, reason = "") =>
    request(`/donor/donations/${id}/cancel`, { method: "PATCH", body: { reason } }),

  /* Blood requests */
  getBloodRequests: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "All"))
    ).toString();
    return request(`/donor/blood-requests${q ? "?" + q : ""}`);
  },
  respondToRequest: (id) =>
    request(`/donor/blood-requests/${id}/respond`, { method: "POST" }),

  /* Notifications */
  getNotifications: (filter = "all") =>
    request(`/donor/notifications${filter !== "all" ? `?filter=${filter}` : ""}`),
  markRead:         (id) => request(`/donor/notifications/${id}/read`,  { method: "PATCH" }),
  markAllRead:      ()   => request("/donor/notifications/read-all",    { method: "PATCH" }),
  deleteNotification:(id)=> request(`/donor/notifications/${id}`,       { method: "DELETE" }),
};

/* ──────────────────────────────────────────
   BLOOD REQUESTS (shared — hospital/admin post, anyone reads)
────────────────────────────────────────── */
export const bloodRequestApi = {
  getAll:  (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "All"))
    ).toString();
    return request(`/blood-requests${q ? "?" + q : ""}`);
  },
  create: (body) => request("/blood-requests", { method: "POST", body }),
};
