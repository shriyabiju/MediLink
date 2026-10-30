/**
 * Constants used by the Donor Dashboard.
 * Only static arrays and text remain here — all data shown in
 * the UI comes from real API responses via donorApi.
 */

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
export const URGENCY_LEVELS = ["All", "Critical", "High", "Medium", "Low"];
export const STATUSES = ["All", "Open", "Partially Filled", "Fulfilled"];

/** Eligibility disclaimer — shown anywhere medical rules are displayed */
export const ELIGIBILITY_DISCLAIMER =
  "Eligibility to donate blood depends on medical guidelines. " +
  "Registration on this platform does not guarantee eligibility. " +
  "Always consult a healthcare professional.";
