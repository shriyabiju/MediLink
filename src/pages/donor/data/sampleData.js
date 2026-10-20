/**
 * SAMPLE DATA — Donor Dashboard
 * Replace these with real API responses when the backend is ready.
 * All data is frontend-only and does not persist across sessions.
 */

export const DONOR_PROFILE = {
  name:             "Arjun Mehta",
  email:            "arjun.mehta@example.com",
  phone:            "+91 98765 43210",
  bloodGroup:       "O+",
  dob:              "1995-03-14",
  age:              31,
  city:             "Bengaluru",
  state:            "Karnataka",
  address:          "42 Indiranagar, Bengaluru, Karnataka 560038",
  emergencyContact: "+91 91234 56789",
  emergencyName:    "Sunita Mehta (Spouse)",
  weight:           "72 kg",
  occupation:       "Software Engineer",
  verificationStatus: "verified",     // 'verified' | 'pending' | 'unverified'
};

export const DONOR_STATS = {
  totalDonations:      6,
  livesImpacted:       18,   // roughly 3× total donations
  lastDonationDate:    "20 Jul 2026",
  nextEligibleDate:    "20 Oct 2026",
  eligibilityStatus:   "eligible",   // 'eligible' | 'not-eligible' | 'unknown'
  eligibilityDaysLeft: 0,
  upcomingAppointments: 1,
};

export const DONATION_HISTORY = [
  {
    id: 1,
    date:        "20 Jul 2026",
    centre:      "Apollo Blood Bank, Bengaluru",
    bloodGroup:  "O+",
    units:       1,
    status:      "Completed",
    certificate: true,
  },
  {
    id: 2,
    date:        "15 Jan 2026",
    centre:      "Red Cross Donation Centre, Bengaluru",
    bloodGroup:  "O+",
    units:       1,
    status:      "Completed",
    certificate: true,
  },
  {
    id: 3,
    date:        "10 Jul 2025",
    centre:      "Fortis Hospital, Bengaluru",
    bloodGroup:  "O+",
    units:       1,
    status:      "Completed",
    certificate: false,
  },
  {
    id: 4,
    date:        "05 Jan 2025",
    centre:      "Manipal Blood Bank, Bengaluru",
    bloodGroup:  "O+",
    units:       1,
    status:      "Completed",
    certificate: true,
  },
  {
    id: 5,
    date:        "18 Jul 2024",
    centre:      "Victoria Hospital, Bengaluru",
    bloodGroup:  "O+",
    units:       1,
    status:      "Completed",
    certificate: false,
  },
  {
    id: 6,
    date:        "22 Jan 2024",
    centre:      "Apollo Blood Bank, Bengaluru",
    bloodGroup:  "O+",
    units:       1,
    status:      "Completed",
    certificate: true,
  },
];

export const NEARBY_BLOOD_REQUESTS = [
  {
    id: 1,
    bloodGroup:  "O+",
    hospital:    "Apollo Hospital",
    location:    "Bannerghatta Road, Bengaluru",
    distance:    "3.2 km",
    urgency:     "Critical",
    status:      "Open",
    postedAt:    "2 hrs ago",
    unitsNeeded: 2,
    patientAge:  45,
    contact:     "+91 80 2682 0000",
  },
  {
    id: 2,
    bloodGroup:  "O-",
    hospital:    "Fortis Hospital",
    location:    "Cunningham Road, Bengaluru",
    distance:    "5.1 km",
    urgency:     "High",
    status:      "Open",
    postedAt:    "4 hrs ago",
    unitsNeeded: 1,
    patientAge:  32,
    contact:     "+91 80 6621 4444",
  },
  {
    id: 3,
    bloodGroup:  "A+",
    hospital:    "Manipal Hospital",
    location:    "HAL Airport Road, Bengaluru",
    distance:    "7.8 km",
    urgency:     "Medium",
    status:      "Open",
    postedAt:    "8 hrs ago",
    unitsNeeded: 1,
    patientAge:  28,
    contact:     "+91 80 2502 4444",
  },
  {
    id: 4,
    bloodGroup:  "B+",
    hospital:    "Narayana Health City",
    location:    "Electronic City, Bengaluru",
    distance:    "12.4 km",
    urgency:     "Medium",
    status:      "Partially Filled",
    postedAt:    "1 day ago",
    unitsNeeded: 2,
    patientAge:  56,
    contact:     "+91 80 7122 2200",
  },
  {
    id: 5,
    bloodGroup:  "AB+",
    hospital:    "Sakra World Hospital",
    location:    "Marathahalli, Bengaluru",
    distance:    "9.0 km",
    urgency:     "Low",
    status:      "Open",
    postedAt:    "2 days ago",
    unitsNeeded: 1,
    patientAge:  63,
    contact:     "+91 80 4969 4969",
  },
  {
    id: 6,
    bloodGroup:  "O+",
    hospital:    "St. John's Medical College Hospital",
    location:    "Koramangala, Bengaluru",
    distance:    "4.5 km",
    urgency:     "High",
    status:      "Open",
    postedAt:    "3 hrs ago",
    unitsNeeded: 3,
    patientAge:  41,
    contact:     "+91 80 2206 5000",
  },
];

export const UPCOMING_APPOINTMENTS = [
  {
    id: 1,
    centre:  "Apollo Blood Bank",
    address: "Bannerghatta Road, Bengaluru",
    date:    "25 Oct 2026",
    time:    "10:00 AM",
    type:    "Whole Blood Donation",
    status:  "Confirmed",
  },
];

export const NOTIFICATIONS = [
  {
    id: 1,
    type:    "request",
    title:   "Urgent Blood Request Nearby",
    message: "Apollo Hospital needs O+ blood urgently (3.2 km away). Your blood group matches.",
    time:    "2 hrs ago",
    read:    false,
  },
  {
    id: 2,
    type:    "appointment",
    title:   "Appointment Reminder",
    message: "Your donation appointment at Apollo Blood Bank is on 25 Oct 2026 at 10:00 AM.",
    time:    "Yesterday",
    read:    false,
  },
  {
    id: 3,
    type:    "eligible",
    title:   "You're Now Eligible to Donate",
    message: "It has been 90 days since your last donation. You are now eligible to donate again.",
    time:    "3 days ago",
    read:    false,
  },
  {
    id: 4,
    type:    "verified",
    title:   "Profile Verified",
    message: "Your donor profile has been verified by MediLink. You can now receive blood requests.",
    time:    "1 week ago",
    read:    true,
  },
  {
    id: 5,
    type:    "donation",
    title:   "Donation Certificate Available",
    message: "Your donation certificate from Apollo Blood Bank (20 Jul 2026) is ready to download.",
    time:    "20 Jul 2026",
    read:    true,
  },
  {
    id: 6,
    type:    "request",
    title:   "Blood Request Fulfilled",
    message: "The O+ request from Fortis Hospital you responded to has been fulfilled. Thank you!",
    time:    "2 weeks ago",
    read:    true,
  },
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
export const URGENCY_LEVELS = ["All", "Critical", "High", "Medium", "Low"];
export const STATUSES = ["All", "Open", "Partially Filled", "Fulfilled"];

/** Eligibility disclaimer — shown anywhere medical rules are displayed */
export const ELIGIBILITY_DISCLAIMER =
  "Eligibility information shown here is indicative only and based on general guidelines. " +
  "Actual eligibility must always be confirmed by a qualified healthcare professional before donation.";
