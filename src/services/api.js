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
  deactivateUser:  (id) => request(`/admin/users/${id}/deactivate`, { method: "PATCH" }),
  reactivateUser:  (id) => request(`/admin/users/${id}/reactivate`, { method: "PATCH" }),
  getDonors:      (status = "all") => request(`/admin/donors?status=${status}`),
  getDonor:       (id)             => request(`/admin/donors/${id}`),
  approveDonor:   (id)             => request(`/admin/donors/${id}/approve`, { method: "PATCH" }),
  rejectDonor:    (id)             => request(`/admin/donors/${id}/reject`,  { method: "PATCH" }),
  /* Blood bank management */
  getBloodBanks:    (status = "all") => request(`/admin/bloodbanks?status=${status}`),
  approveBloodBank: (id)             => request(`/admin/bloodbanks/${id}/approve`, { method: "PATCH" }),
  rejectBloodBank:  (id)             => request(`/admin/bloodbanks/${id}/reject`,  { method: "PATCH" }),
  /* Blood request oversight */
  getBloodRequests: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "all"))
    ).toString();
    return request(`/admin/blood-requests${q ? "?" + q : ""}`);
  },
  updateBloodRequestStatus: (id, status) =>
    request(`/admin/blood-requests/${id}/status`, { method: "PATCH", body: { status } }),
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

/* ──────────────────────────────────────────
   HOSPITAL
────────────────────────────────────────── */
export const hospitalApi = {
  /* Profile */
  getProfile:    ()     => request("/hospital/profile"),
  updateProfile: (body) => request("/hospital/profile", { method: "PATCH", body }),

  /* Dashboard stats */
  getStats: () => request("/hospital/stats"),

  /* Blood stock */
  getBloodStock:    ()          => request("/hospital/blood-stock"),
  upsertBloodStock: (body)      => request("/hospital/blood-stock",      { method: "POST",   body }),
  deleteBloodStock: (id)        => request(`/hospital/blood-stock/${id}`, { method: "DELETE" }),

  /* Doctors */
  getDoctors:    ()             => request("/hospital/doctors"),
  createDoctor:  (body)         => request("/hospital/doctors",           { method: "POST",   body }),
  updateDoctor:  (id, body)     => request(`/hospital/doctors/${id}`,     { method: "PATCH",  body }),
  deleteDoctor:  (id)           => request(`/hospital/doctors/${id}`,     { method: "DELETE" }),

  /* Medicines */
  getMedicines:   ()            => request("/hospital/medicines"),
  createMedicine: (body)        => request("/hospital/medicines",         { method: "POST",   body }),
  updateMedicine: (id, body)    => request(`/hospital/medicines/${id}`,   { method: "PATCH",  body }),
  deleteMedicine: (id)          => request(`/hospital/medicines/${id}`,   { method: "DELETE" }),

  /* Emergency requests */
  getRequests:         (status) => request(`/hospital/requests${status && status !== "All" ? `?status=${status}` : ""}`),
  updateRequestStatus: (id, status) => request(`/hospital/requests/${id}/status`, { method: "PATCH", body: { status } }),

  /* Notifications */
  getNotifications: (filter = "all") =>
    request(`/hospital/notifications${filter !== "all" ? `?filter=${filter}` : ""}`),
  markRead:         (id) => request(`/hospital/notifications/${id}/read`,  { method: "PATCH"  }),
  markAllRead:      ()   => request("/hospital/notifications/read-all",    { method: "PATCH"  }),
  deleteNotif:      (id) => request(`/hospital/notifications/${id}`,       { method: "DELETE" }),

  /* Settings */
  changePassword: (body) => request("/hospital/change-password", { method: "POST", body }),
  getSettings:    ()     => request("/hospital/settings"),
  saveSettings:   (body) => request("/hospital/settings", { method: "PATCH", body }),

  /* Bed management */
  getBeds:    ()     => request("/hospital/beds"),
  updateBeds: (body) => request("/hospital/beds", { method: "PUT", body }),

  /* Reports */
  getReports: () => request("/hospital/reports"),

  /* Other hospitals directory */
  getOtherHospitals: () => request("/hospital/other-hospitals"),

  /* Donors (read-only) */
  getDonors: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "all"))
    ).toString();
    return request(`/hospital/donors${q ? "?" + q : ""}`);
  },

  /* All blood requests (platform-wide) */
  getAllBloodRequests: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "all"))
    ).toString();
    return request(`/hospital/all-requests${q ? "?" + q : ""}`);
  },
};

/* ──────────────────────────────────────────
   PATIENT
────────────────────────────────────────── */
export const patientApi = {
  getProfile:       ()     => request("/patient/profile"),
  updateProfile:    (body) => request("/patient/profile",         { method: "PATCH", body }),
  changePassword:   (body) => request("/patient/change-password", { method: "POST",  body }),
  getStats:         ()     => request("/patient/stats"),
  getHospitals:     (search = "") => request(`/patient/hospitals${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getBloodAvailability: ()  => request("/patient/blood-availability"),
  getBloodRequests: ()     => request("/patient/blood-requests"),
  submitEmergency:  (body) => request("/patient/emergency",       { method: "POST",  body }),
  getNotifications: (filter = "all") =>
    request(`/patient/notifications${filter !== "all" ? `?filter=${filter}` : ""}`),
  markNotifRead:    (id)   => request(`/patient/notifications/${id}/read`, { method: "PATCH" }),
  /* Blood bank directory */
  getBloodBanks:    (search = "") => request(`/patient/blood-banks${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  /* Unified blood search */
  bloodSearch: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== "all"))
    ).toString();
    return request(`/patient/blood-search${q ? "?" + q : ""}`);
  },
};

/* ──────────────────────────────────────────
   BLOOD BANK
────────────────────────────────────────── */
export const bloodBankApi = {
  getProfile:  ()     => request("/bloodbank/profile"),
  getStats:     ()     => request("/bloodbank/stats"),

  /* Stock CRUD */
  getStock:     ()              => request("/bloodbank/stock"),
  addStock:     (body)          => request("/bloodbank/stock",     { method: "POST",  body }),
  updateStock:  (id, body)      => request(`/bloodbank/stock/${id}`, { method: "PATCH", body }),
  deleteStock:  (id)            => request(`/bloodbank/stock/${id}`, { method: "DELETE" }),

  /* Requests */
  getRequests:      (status) => request(`/bloodbank/requests${status && status !== "all" ? `?status=${status}` : ""}`),
  fulfillRequest:   (id, body) => request(`/bloodbank/requests/${id}/fulfill`, { method: "PATCH", body }),
  cancelRequest:    (id)       => request(`/bloodbank/requests/${id}/cancel`,  { method: "PATCH" }),

  /* Notifications */
  getNotifications: (filter = "all") =>
    request(`/bloodbank/notifications${filter !== "all" ? `?filter=${filter}` : ""}`),
  markRead:         (id) => request(`/bloodbank/notifications/${id}/read`,  { method: "PATCH" }),
  markAllRead:      ()   => request("/bloodbank/notifications/read-all",    { method: "PATCH" }),

  /* Settings */
  changePassword: (body) => request("/bloodbank/change-password", { method: "POST", body }),
};
