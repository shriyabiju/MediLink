/**
 * MediLink — shared client-side validation rules.
 * Keep in sync with server/utils/validationRules.js.
 */

/* ── Indian states and union territories ── */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  /* Union Territories */
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

/* ── Regex patterns ── */
export const RE = {
  /** Full name: only alphabets and spaces, 3–50 chars */
  name:         /^[A-Za-z][A-Za-z\s]{1,48}[A-Za-z]$|^[A-Za-z]{3}$/,
  /** Email: standard format, no spaces */
  email:        /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  /** Password: min 8, uppercase, lowercase, digit, special char, no spaces */
  password:     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!_\-+=?<>.,;:'"/\\|~`(){}[\]])[^\s]{8,}$/,
  /** Phone: optional +91, then 10 digits starting with 6–9 */
  phone:        /^(\+91[\s-]?)?[6-9]\d{9}$/,
  /** City: only alphabets and spaces, 2–50 chars */
  city:         /^[A-Za-z][A-Za-z\s]{0,48}$/,
  /** Hospital/Blood-bank name: alphabets, digits, spaces, &-'.  3–100 chars */
  facilityName: /^[A-Za-z0-9][A-Za-z0-9\s&'\-.]{1,98}[A-Za-z0-9\s&'\-.]$/,
};

/**
 * Validate Full Name.
 * @param {string} value
 * @returns {string} empty string if valid, else error message
 */
export function validateName(value) {
  const v = value.trim();
  if (!v)           return "Full name is required.";
  if (v.length < 3) return "Name must be at least 3 characters.";
  if (v.length > 50) return "Name must be at most 50 characters.";
  if (/\d/.test(v)) return "Name must not contain numbers.";
  if (/[^A-Za-z\s]/.test(v)) return "Name must contain only letters and spaces.";
  return "";
}

/**
 * Validate Email Address.
 * @param {string} value
 * @returns {string}
 */
export function validateEmail(value) {
  const v = value.trim();
  if (!v) return "Email address is required.";
  if (/\s/.test(v)) return "Email must not contain spaces.";
  if (!RE.email.test(v)) return "Enter a valid email address (e.g. user@example.com).";
  return "";
}

/**
 * Validate Password.
 * @param {string} value
 * @returns {string}
 */
export function validatePassword(value) {
  if (!value) return "Password is required.";
  if (/\s/.test(value)) return "Password must not contain spaces.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(value)) return "Include at least one lowercase letter (a–z).";
  if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter (A–Z).";
  if (!/\d/.test(value)) return "Include at least one digit (0–9).";
  if (!/[@#$%^&*!_\-+=?<>.,;:'"/\\|~`(){}[\]]/.test(value))
    return "Include at least one special character (@, #, $, %, etc.).";
  return "";
}

/**
 * Validate Confirm Password.
 * @param {string} confirm
 * @param {string} password
 * @returns {string}
 */
export function validateConfirm(confirm, password) {
  if (!confirm) return "Please confirm your password.";
  if (confirm !== password) return "Passwords do not match.";
  return "";
}

/**
 * Validate Hospital / Blood Bank Name.
 * @param {string} value
 * @param {string} label e.g. "Hospital name"
 * @returns {string}
 */
export function validateFacilityName(value, label = "Facility name") {
  const v = value.trim();
  if (!v)            return `${label} is required.`;
  if (v.length < 3)  return `${label} must be at least 3 characters.`;
  if (v.length > 100) return `${label} must be at most 100 characters.`;
  if (/[^A-Za-z0-9\s&'.\-]/.test(v))
    return `${label} may only contain letters, numbers, spaces, &, -, ', and .`;
  return "";
}

/**
 * Validate Indian Phone Number.
 * Accepts: +91XXXXXXXXXX, +91 XXXXXXXXXX, 10-digit starting with 6–9.
 * @param {string} value
 * @returns {string}
 */
export function validatePhone(value) {
  const v = value.trim().replace(/\s/g, "");
  if (!v) return "Contact number is required.";
  if (/[a-zA-Z]/.test(v)) return "Contact number must not contain letters.";
  /* Strip optional +91 prefix */
  const digits = v.startsWith("+91") ? v.slice(3) : v.startsWith("91") && v.length === 12 ? v.slice(2) : v;
  if (!/^\d{10}$/.test(digits)) return "Enter exactly 10 digits (optionally with +91).";
  if (!/^[6-9]/.test(digits)) return "Mobile number must start with 6, 7, 8, or 9.";
  return "";
}

/**
 * Validate City.
 * @param {string} value
 * @returns {string}
 */
export function validateCity(value) {
  const v = value.trim();
  if (!v)            return "City is required.";
  if (v.length < 2)  return "City must be at least 2 characters.";
  if (v.length > 50) return "City must be at most 50 characters.";
  if (/\d/.test(v))  return "City must not contain numbers.";
  if (/[^A-Za-z\s]/.test(v)) return "City must contain only letters and spaces.";
  return "";
}

/**
 * Validate Indian State (must be one of the approved list).
 * @param {string} value
 * @returns {string}
 */
export function validateState(value) {
  if (!value || !value.trim()) return "Please select a state / union territory.";
  if (!INDIAN_STATES.includes(value.trim())) return "Please select a valid Indian state or union territory.";
  return "";
}
