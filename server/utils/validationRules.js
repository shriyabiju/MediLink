/**
 * MediLink — server-side validation rules.
 * Keep in sync with src/utils/validationRules.js.
 * These run AFTER the client and act as the authoritative layer.
 */

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

/**
 * Collect validation errors for the register endpoint.
 * Returns an object { field: "message" } — empty means valid.
 * @param {object} body — req.body
 * @param {string} role
 */
function validateRegisterBody(body, role) {
  const e = {};

  /* ── Full Name ── */
  const name = (body.name || "").trim();
  if (!name)              e.name = "Full name is required.";
  else if (name.length < 3)  e.name = "Name must be at least 3 characters.";
  else if (name.length > 50) e.name = "Name must be at most 50 characters.";
  else if (/\d/.test(name))  e.name = "Name must not contain numbers.";
  else if (/[^A-Za-z\s]/.test(name)) e.name = "Name must contain only letters and spaces.";

  /* ── Email ── */
  const email = (body.email || "").trim().toLowerCase();
  if (!email)                                               e.email = "Email address is required.";
  else if (/\s/.test(email))                                e.email = "Email must not contain spaces.";
  else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email))
    e.email = "Enter a valid email address.";

  /* ── Password ── */
  const pw = body.password || "";
  if (!pw)               e.password = "Password is required.";
  else if (/\s/.test(pw)) e.password = "Password must not contain spaces.";
  else if (pw.length < 8) e.password = "Password must be at least 8 characters.";
  else if (!/[a-z]/.test(pw)) e.password = "Include at least one lowercase letter.";
  else if (!/[A-Z]/.test(pw)) e.password = "Include at least one uppercase letter.";
  else if (!/\d/.test(pw))    e.password = "Include at least one digit.";
  else if (!/[@#$%^&*!_\-+=?<>.,;:'"/\\|~`(){}[\]]/.test(pw))
    e.password = "Include at least one special character (@, #, $, %, etc.).";

  /* ── Hospital-specific ── */
  if (role === "hospital" || role === "bloodbank") {
    const facilityName = (body.hospitalName || "").trim();
    const label = role === "hospital" ? "Hospital name" : "Blood bank name";
    if (!facilityName)              e.hospitalName = `${label} is required.`;
    else if (facilityName.length < 3)  e.hospitalName = `${label} must be at least 3 characters.`;
    else if (facilityName.length > 100) e.hospitalName = `${label} must be at most 100 characters.`;
    else if (/[^A-Za-z0-9\s&'.\-]/.test(facilityName))
      e.hospitalName = `${label} may only contain letters, numbers, spaces, &, -, ', and .`;

    const phone = (body.phone || "").trim().replace(/\s/g, "");
    if (!phone) {
      e.phone = "Contact number is required.";
    } else if (/[a-zA-Z]/.test(phone)) {
      e.phone = "Contact number must not contain letters.";
    } else {
      const digits = phone.startsWith("+91") ? phone.slice(3) : phone.startsWith("91") && phone.length === 12 ? phone.slice(2) : phone;
      if (!/^\d{10}$/.test(digits)) e.phone = "Enter exactly 10 digits (optionally with +91).";
      else if (!/^[6-9]/.test(digits)) e.phone = "Mobile number must start with 6, 7, 8, or 9.";
    }

    const city = (body.city || "").trim();
    if (!city)             e.city = "City is required.";
    else if (city.length < 2)  e.city = "City must be at least 2 characters.";
    else if (city.length > 50) e.city = "City must be at most 50 characters.";
    else if (/\d/.test(city))  e.city = "City must not contain numbers.";
    else if (/[^A-Za-z\s]/.test(city)) e.city = "City must contain only letters and spaces.";

    const state = (body.state || "").trim();
    if (!state)                       e.state = "State is required.";
    else if (!INDIAN_STATES.includes(state)) e.state = "Please select a valid Indian state or union territory.";
  }

  /* ── Donor-specific ── */
  if (role === "donor") {
    if (!body.bloodGroup) e.bloodGroup = "Blood group is required.";
    else if (!["A+","A-","B+","B-","O+","O-","AB+","AB-"].includes(body.bloodGroup))
      e.bloodGroup = "Invalid blood group.";

    const phone = (body.phone || "").trim().replace(/\s/g, "");
    if (!phone) {
      e.phone = "Phone number is required.";
    } else if (/[a-zA-Z]/.test(phone)) {
      e.phone = "Phone number must not contain letters.";
    } else {
      const digits = phone.startsWith("+91") ? phone.slice(3) : phone.startsWith("91") && phone.length === 12 ? phone.slice(2) : phone;
      if (!/^\d{10}$/.test(digits)) e.phone = "Enter exactly 10 digits (optionally with +91).";
      else if (!/^[6-9]/.test(digits)) e.phone = "Mobile number must start with 6, 7, 8, or 9.";
    }

    if (!body.dob) {
      e.dob = "Date of birth is required.";
    } else {
      const age = Math.floor((Date.now() - new Date(body.dob)) / (365.25 * 24 * 60 * 60 * 1000));
      if (isNaN(age))    e.dob = "Invalid date of birth.";
      else if (age < 18) e.dob = "Donors must be at least 18 years old.";
      else if (age > 65) e.dob = "Donors must be 65 years old or younger.";
    }

    const city = (body.city || "").trim();
    if (!city)             e.city = "City is required.";
    else if (city.length < 2)  e.city = "City must be at least 2 characters.";
    else if (city.length > 50) e.city = "City must be at most 50 characters.";
    else if (/\d/.test(city))  e.city = "City must not contain numbers.";
    else if (/[^A-Za-z\s]/.test(city)) e.city = "City must contain only letters and spaces.";

    /* State is required for donors and must be an Indian state */
    const state = (body.state || "").trim();
    if (!state)                       e.state = "State is required.";
    else if (!INDIAN_STATES.includes(state)) e.state = "Please select a valid Indian state or union territory.";

    /* Weight — optional; if provided must be parseable */
    if (body.weight && body.weight.trim()) {
      if (!/^\d{2,3}(\.\d)?\s*(kg|lbs)?$/i.test(body.weight.trim()))
        e.weight = "Enter a valid weight (e.g. 65 kg or 65.5 kg).";
    }
  }

  return e;
}

module.exports = { validateRegisterBody, INDIAN_STATES };
