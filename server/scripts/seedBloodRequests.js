/**
 * Seeds sample blood requests for manual testing.
 * Run once: node scripts/seedBloodRequests.js
 *
 * Requires at least one hospital user with approvalStatus="approved" in the DB.
 * If none found, an admin user is used as the poster instead.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose    = require("mongoose");
const User        = require("../models/User");
const BloodRequest = require("../models/BloodRequest");

const SAMPLES = [
  { hospitalName: "Apollo Hospital",        hospitalCity: "Bengaluru",  hospitalState: "Karnataka",    bloodGroup: "O+",  unitsNeeded: 2, urgency: "Critical" },
  { hospitalName: "Fortis Healthcare",      hospitalCity: "Bengaluru",  hospitalState: "Karnataka",    bloodGroup: "O-",  unitsNeeded: 1, urgency: "High"     },
  { hospitalName: "Manipal Hospital",       hospitalCity: "Bengaluru",  hospitalState: "Karnataka",    bloodGroup: "A+",  unitsNeeded: 1, urgency: "Medium"   },
  { hospitalName: "Narayana Health City",   hospitalCity: "Bengaluru",  hospitalState: "Karnataka",    bloodGroup: "B+",  unitsNeeded: 2, urgency: "Medium"   },
  { hospitalName: "Sakra World Hospital",   hospitalCity: "Bengaluru",  hospitalState: "Karnataka",    bloodGroup: "AB+", unitsNeeded: 1, urgency: "Low"      },
  { hospitalName: "AIIMS",                  hospitalCity: "New Delhi",  hospitalState: "Delhi",        bloodGroup: "O+",  unitsNeeded: 3, urgency: "Critical" },
  { hospitalName: "Ruby Hall Clinic",       hospitalCity: "Pune",       hospitalState: "Maharashtra",  bloodGroup: "A-",  unitsNeeded: 1, urgency: "High"     },
  { hospitalName: "Medanta",                hospitalCity: "Gurugram",   hospitalState: "Haryana",      bloodGroup: "B-",  unitsNeeded: 1, urgency: "Medium"   },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected:", process.env.MONGO_URI);

  /* Find a suitable poster user */
  let poster = await User.findOne({ role: "hospital", approvalStatus: "approved" });
  if (!poster) poster = await User.findOne({ role: "admin" });
  if (!poster) { console.error("No hospital or admin user found. Register one first."); process.exit(1); }

  const existing = await BloodRequest.countDocuments();
  if (existing > 0) {
    console.log(`⚠  ${existing} blood request(s) already exist — skipping seed.`);
    process.exit(0);
  }

  const docs = SAMPLES.map((s) => ({ ...s, postedBy: poster._id, status: "open" }));
  await BloodRequest.insertMany(docs);
  console.log(`✅  Seeded ${docs.length} blood requests posted by "${poster.name}" (${poster.role}).`);
  process.exit(0);
})().catch((err) => { console.error("Seed failed:", err.message); process.exit(1); });
