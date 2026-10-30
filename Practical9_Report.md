# Practical 9 — Designing Test Suites and Estimating Test Coverage Metrics with Structural Complexity

**Subject:** Advanced Web Technology (AWT)
**Practical No.:** 9
**Project:** MediLink — Emergency Healthcare Coordination Platform
**Technology Stack:** React (Frontend), Node.js + Express (Backend), MongoDB (Database)
**Test Execution Date:** July 2026

---

## Aim

To design a test suite for the MediLink web application, execute the test cases against a live backend server, record actual results, and estimate test coverage metrics including Cyclomatic Complexity using the control-flow graph of a real function.

---

## Application Overview

MediLink is an emergency blood coordination platform with five user roles:

| Role | Description |
|------|-------------|
| Patient | Searches blood availability, submits emergency blood requests |
| Donor | Views and responds to nearby blood donation requests |
| Hospital | Manages blood inventory, doctors, and emergency requests |
| Blood Bank | Manages blood stock with expiry dates and prices |
| Admin | Approves/rejects hospital, blood bank, and donor registrations |

**Backend API Base URL:** `http://localhost:5000/api`
**Authentication:** JWT tokens (sent as `Authorization: Bearer <token>` header)

---

## Section 1 — Test Suite

The test suite contains **12 test scenarios**, each with one positive test case and one negative test case — **24 test cases total**.

Each test case was executed by sending real HTTP requests to the running MediLink backend at `http://localhost:5000`. No mock data was used.

---

### TS01 — Patient Registration

**Description:** Verify that a new patient can register with all required fields, and that registration is rejected when required fields are missing.
**API Under Test:** `POST /api/auth/register`
**File:** `server/controllers/authController.js`

---

#### TC01.1 — Positive: Valid patient registration

| Field | Details |
|-------|---------|
| **Test Case ID** | TC01.1 |
| **Type** | Positive |
| **Test Steps** | 1. Send POST to `/api/auth/register`  2. Provide all required fields |
| **Test Input** | `{ name: "Test Patient", email: "p9_patient@test.com", password: "Test@1234", role: "patient" }` |
| **Expected Result** | HTTP 201, JWT token returned in response body |
| **Actual Result** | HTTP 201, JWT token received |
| **Pass/Fail** | ✅ PASS |

#### TC01.2 — Negative: Registration with missing name

| Field | Details |
|-------|---------|
| **Test Case ID** | TC01.2 |
| **Type** | Negative |
| **Test Steps** | 1. Send POST to `/api/auth/register`  2. Omit the `name` field |
| **Test Input** | `{ email: "p9_patient2@test.com", password: "Test@1234", role: "patient" }` |
| **Expected Result** | HTTP 400, message: "Name, email, password, and role are required." |
| **Actual Result** | HTTP 400, message: "Name, email, password, and role are required." |
| **Pass/Fail** | ✅ PASS |

---

### TS02 — Login with Role Verification

**Description:** Verify that a user can log in by selecting the correct role, and that login is blocked when the wrong role is selected.
**API Under Test:** `POST /api/auth/login`
**File:** `server/controllers/authController.js`

---

#### TC02.1 — Positive: Valid login with correct role

| Field | Details |
|-------|---------|
| **Test Case ID** | TC02.1 |
| **Type** | Positive |
| **Test Steps** | 1. Send POST to `/api/auth/login`  2. Use correct email, password, and matching role |
| **Test Input** | `{ email: "p9_patient@test.com", password: "Test@1234", role: "patient" }` |
| **Expected Result** | HTTP 200, JWT token returned |
| **Actual Result** | HTTP 200, JWT token received |
| **Pass/Fail** | ✅ PASS |

#### TC02.2 — Negative: Login with wrong role

| Field | Details |
|-------|---------|
| **Test Case ID** | TC02.2 |
| **Type** | Negative |
| **Test Steps** | 1. Send POST to `/api/auth/login`  2. Select "admin" role for a patient account |
| **Test Input** | `{ email: "p9_patient@test.com", password: "Test@1234", role: "admin" }` |
| **Expected Result** | HTTP 403, code: "ROLE_MISMATCH" |
| **Actual Result** | HTTP 403, code: "ROLE_MISMATCH", message: "The selected role does not match your account." |
| **Pass/Fail** | ✅ PASS |

---

### TS03 — Blood Bank Registration with Approval Workflow

**Description:** Verify that a blood bank registers with pending status and cannot log in before admin approval.
**API Under Test:** `POST /api/auth/register`
**File:** `server/controllers/authController.js`, `server/models/User.js`

---

#### TC03.1 — Positive: Blood bank registration accepted with pending status

| Field | Details |
|-------|---------|
| **Test Case ID** | TC03.1 |
| **Type** | Positive |
| **Test Steps** | 1. Send POST to `/api/auth/register` with `role: "bloodbank"` |
| **Test Input** | `{ name: "P9 Blood Bank", email: "p9_bloodbank@test.com", password: "Test@1234", role: "bloodbank", city: "Mumbai" }` |
| **Expected Result** | HTTP 201, `approvalStatus: "pending"`, no token issued |
| **Actual Result** | HTTP 201, `approvalStatus: "pending"` confirmed, no token |
| **Pass/Fail** | ✅ PASS |

#### TC03.2 — Negative: Blood bank login before approval

| Field | Details |
|-------|---------|
| **Test Case ID** | TC03.2 |
| **Type** | Negative |
| **Test Steps** | 1. Register a blood bank  2. Immediately attempt to log in (not yet approved) |
| **Test Input** | `{ email: "p9_bloodbank@test.com", password: "Test@1234", role: "bloodbank" }` |
| **Expected Result** | HTTP 403, code: "BLOODBANK_PENDING" |
| **Actual Result** | HTTP 403, code: "BLOODBANK_PENDING" |
| **Pass/Fail** | ✅ PASS |

---

### TS04 — Admin Blood Bank Approval

**Description:** Verify that the admin can approve a pending blood bank, and that approving an already-approved bank is rejected.
**API Under Test:** `PATCH /api/admin/bloodbanks/:id/approve`
**File:** `server/controllers/adminController.js`

---

#### TC04.1 — Positive: Admin approves a pending blood bank

| Field | Details |
|-------|---------|
| **Test Case ID** | TC04.1 |
| **Type** | Positive |
| **Test Steps** | 1. Log in as admin  2. Send PATCH to `/api/admin/bloodbanks/:id/approve` |
| **Test Input** | Admin JWT token, blood bank user ID |
| **Expected Result** | HTTP 200, message: `Blood bank "P9 Blood Bank" approved.` |
| **Actual Result** | HTTP 200, blood bank approved |
| **Pass/Fail** | ✅ PASS |

#### TC04.2 — Negative: Approving an already-approved blood bank

| Field | Details |
|-------|---------|
| **Test Case ID** | TC04.2 |
| **Type** | Negative |
| **Test Steps** | 1. Approve a blood bank  2. Send the same approval request again |
| **Test Input** | Admin JWT token, same blood bank ID |
| **Expected Result** | HTTP 400, message: "Already approved." |
| **Actual Result** | HTTP 400, message: "Already approved." |
| **Pass/Fail** | ✅ PASS |

---

### TS05 — Blood Bank Inventory: Add Stock

**Description:** Verify that a blood bank can add valid blood stock, and that stock with a past expiry date is rejected.
**API Under Test:** `POST /api/bloodbank/stock`
**File:** `server/controllers/bloodBankController.js`

---

#### TC05.1 — Positive: Add valid blood stock

| Field | Details |
|-------|---------|
| **Test Case ID** | TC05.1 |
| **Type** | Positive |
| **Test Steps** | 1. Log in as an approved blood bank  2. POST to `/api/bloodbank/stock` |
| **Test Input** | `{ bloodGroup: "O+", units: 10, pricePerUnit: 500, expiresOn: "2027-06-15" }` |
| **Expected Result** | HTTP 201, message: "Stock added." |
| **Actual Result** | HTTP 201, message: "Stock added." |
| **Pass/Fail** | ✅ PASS |

#### TC05.2 — Negative: Add stock with past expiry date

| Field | Details |
|-------|---------|
| **Test Case ID** | TC05.2 |
| **Type** | Negative |
| **Test Steps** | 1. Log in as blood bank  2. POST stock with an expiry date in the past |
| **Test Input** | `{ bloodGroup: "O+", units: 10, pricePerUnit: 500, expiresOn: "2020-01-01" }` |
| **Expected Result** | HTTP 400, message: "Expiry date must be in the future." |
| **Actual Result** | HTTP 400, message: "Expiry date must be in the future." |
| **Pass/Fail** | ✅ PASS |

---

### TS06 — Patient Blood Search

**Description:** Verify that a patient can search blood availability across hospitals and blood banks, and that an invalid blood group returns empty results without crashing.
**API Under Test:** `GET /api/patient/blood-search`
**File:** `server/routes/patient.js`

---

#### TC06.1 — Positive: Blood search returns results

| Field | Details |
|-------|---------|
| **Test Case ID** | TC06.1 |
| **Type** | Positive |
| **Test Steps** | 1. Log in as patient  2. GET `/api/patient/blood-search` with no filters |
| **Test Input** | Patient JWT token, no query parameters |
| **Expected Result** | HTTP 200, `results` is an array |
| **Actual Result** | HTTP 200, 2 results returned |
| **Pass/Fail** | ✅ PASS |

#### TC06.2 — Negative: Search with invalid blood group value

| Field | Details |
|-------|---------|
| **Test Case ID** | TC06.2 |
| **Type** | Negative |
| **Test Steps** | 1. Log in as patient  2. GET `/api/patient/blood-search?bloodGroup=ZZ` |
| **Test Input** | Patient JWT token, `bloodGroup=ZZ` |
| **Expected Result** | HTTP 200, empty results array (graceful handling, no crash) |
| **Actual Result** | HTTP 200, empty results array |
| **Pass/Fail** | ✅ PASS |

---

### TS07 — Emergency Blood Request Submission

**Description:** Verify that a patient can submit an emergency blood request, and that a blank hospital name is rejected.
**API Under Test:** `POST /api/patient/emergency`
**File:** `server/routes/patient.js`

---

#### TC07.1 — Positive: Valid emergency blood request

| Field | Details |
|-------|---------|
| **Test Case ID** | TC07.1 |
| **Type** | Positive |
| **Test Steps** | 1. Log in as patient  2. POST to `/api/patient/emergency` with all required fields |
| **Test Input** | `{ hospitalName: "P9 Test Hospital", hospitalCity: "Mumbai", bloodGroup: "O+", unitsNeeded: 2, urgency: "High" }` |
| **Expected Result** | HTTP 201, message: "Emergency request submitted successfully." |
| **Actual Result** | HTTP 201, message: "Emergency request submitted successfully." |
| **Pass/Fail** | ✅ PASS |

#### TC07.2 — Negative: Emergency request with blank hospital name

| Field | Details |
|-------|---------|
| **Test Case ID** | TC07.2 |
| **Type** | Negative |
| **Test Steps** | 1. Log in as patient  2. POST emergency request with `hospitalName: ""` |
| **Test Input** | `{ hospitalName: "", bloodGroup: "O+", unitsNeeded: 2 }` |
| **Expected Result** | HTTP 400, message: "Hospital name is required." |
| **Actual Result** | HTTP 400, message: "Hospital name is required." |
| **Pass/Fail** | ✅ PASS |

---

### TS08 — Donor Nearby Blood Requests with City Filter

**Description:** Verify that requests from the donor's city are returned and that requests from other cities are excluded.
**API Under Test:** `GET /api/donor/blood-requests?city=...`
**File:** `server/controllers/bloodRequestController.js`

**Note on original failure (TC08.1 in first run):** The first test run submitted the emergency request without `hospitalCity`. The backend stores city in the `BloodRequest.hospitalCity` field; without it, the `?city=Mumbai` filter found nothing. The fix was to include `hospitalCity: "Mumbai"` in the POST body. The filter logic itself was always correct — confirmed by the retest.

---

#### TC08.1 — Positive: Donor sees requests from their city

| Field | Details |
|-------|---------|
| **Test Case ID** | TC08.1 |
| **Type** | Positive |
| **Test Steps** | 1. Create a blood request with `hospitalCity: "Mumbai"`  2. Log in as a donor  3. GET `/api/donor/blood-requests?city=Mumbai` |
| **Test Input** | `hospitalCity: "Mumbai"` in request creation; `?city=Mumbai` in donor query |
| **Expected Result** | HTTP 200, the Mumbai request appears in the results |
| **Actual Result** | HTTP 200, 1 result returned, hospital found in Mumbai results: **true** |
| **Pass/Fail** | ✅ PASS *(retested with corrected input)* |

#### TC08.2 — Negative: Donor does not see requests from a different city

| Field | Details |
|-------|---------|
| **Test Case ID** | TC08.2 |
| **Type** | Negative |
| **Test Steps** | 1. Filter with `?city=Delhi`  2. Verify the Mumbai request does NOT appear |
| **Test Input** | Donor token, `?city=Delhi` |
| **Expected Result** | The Mumbai request is not returned |
| **Actual Result** | 0 results returned for Delhi; hospital not found (city filter working correctly) |
| **Pass/Fail** | ✅ PASS |

---

### TS09 — Donor Response to Blood Request

**Description:** Verify that a donor can register interest in a request and that duplicate responses are blocked.
**API Under Test:** `POST /api/donor/blood-requests/:id/respond`
**File:** `server/controllers/bloodRequestController.js`

---

#### TC09.1 — Positive: Donor responds to a request

| Field | Details |
|-------|---------|
| **Test Case ID** | TC09.1 |
| **Type** | Positive |
| **Test Steps** | 1. Log in as donor  2. POST to `/api/donor/blood-requests/:id/respond` |
| **Test Input** | Donor JWT token, valid blood request ID |
| **Expected Result** | HTTP 200, message: "Thank you! Your interest has been registered." |
| **Actual Result** | HTTP 200, message: "Thank you! Your interest has been registered. A coordinator will contact you." |
| **Pass/Fail** | ✅ PASS |

#### TC09.2 — Negative: Donor responds to the same request twice

| Field | Details |
|-------|---------|
| **Test Case ID** | TC09.2 |
| **Type** | Negative |
| **Test Steps** | 1. Respond to a request  2. Send the same respond request again |
| **Test Input** | Same donor token, same request ID |
| **Expected Result** | HTTP 409, `alreadyResponded: true` |
| **Actual Result** | HTTP 409, `alreadyResponded: true` |
| **Pass/Fail** | ✅ PASS |

---

### TS10 — Hospital Settings Persistence

**Description:** Verify that notification preferences are saved to MongoDB and that an unauthenticated request is rejected.
**API Under Test:** `PATCH /api/hospital/settings`
**File:** `server/controllers/hospitalController.js`

---

#### TC10.1 — Positive: Save notification preferences

| Field | Details |
|-------|---------|
| **Test Case ID** | TC10.1 |
| **Type** | Positive |
| **Test Steps** | 1. Log in as an approved hospital  2. PATCH `/api/hospital/settings` with preferences |
| **Test Input** | `{ notifications: { email: false, sms: true, criticalBlood: false, lowMedicine: true, bedUpdates: false, emergency: true } }` |
| **Expected Result** | HTTP 200, message: "Settings saved successfully." |
| **Actual Result** | HTTP 200, message: "Settings saved successfully." |
| **Pass/Fail** | ✅ PASS |

#### TC10.2 — Negative: Settings access without a valid token

| Field | Details |
|-------|---------|
| **Test Case ID** | TC10.2 |
| **Type** | Negative |
| **Test Steps** | 1. Send PATCH to `/api/hospital/settings` with a fake token |
| **Test Input** | `Authorization: Bearer fake_token_12345` |
| **Expected Result** | HTTP 401, "Invalid or expired token." |
| **Actual Result** | HTTP 401 |
| **Pass/Fail** | ✅ PASS |

---

### TS11 — Expired Stock Exclusion

**Description:** Verify that expired blood stock is blocked at entry and does not appear in patient blood search results.
**API Under Test:** `GET /api/bloodbank/stock`, `GET /api/patient/blood-search`
**File:** `server/controllers/bloodBankController.js`, `server/routes/patient.js`

---

#### TC11.1 — Positive: Active stock appears in inventory

| Field | Details |
|-------|---------|
| **Test Case ID** | TC11.1 |
| **Type** | Positive |
| **Test Steps** | 1. Log in as blood bank  2. GET `/api/bloodbank/stock` |
| **Test Input** | Blood bank JWT token |
| **Expected Result** | HTTP 200, no expired items in the returned list |
| **Actual Result** | HTTP 200, zero expired items in stock list |
| **Pass/Fail** | ✅ PASS |

#### TC11.2 — Negative: Expired stock cannot be added and is excluded from patient search

| Field | Details |
|-------|---------|
| **Test Case ID** | TC11.2 |
| **Type** | Negative |
| **Test Steps** | 1. Attempt to POST stock with `expiresOn: "2020-01-01"`  2. Verify the blood search does not show expired A+ stock |
| **Test Input** | `{ bloodGroup: "A+", units: 5, pricePerUnit: 300, expiresOn: "2020-01-01" }` |
| **Expected Result** | POST rejected with 400; expired stock absent from patient blood search |
| **Actual Result** | HTTP 400 on POST; expired A+ stock not returned in search |
| **Pass/Fail** | ✅ PASS |

---

### TS12 — Role-Based Access Control

**Description:** Verify that an approved hospital can access its own routes and that a patient cannot access hospital-protected routes.
**API Under Test:** `GET /api/hospital/blood-stock` with `requireRole` middleware
**File:** `server/middleware/auth.js`

---

#### TC12.1 — Positive: Hospital accesses its own blood stock

| Field | Details |
|-------|---------|
| **Test Case ID** | TC12.1 |
| **Type** | Positive |
| **Test Steps** | 1. Log in as approved hospital  2. GET `/api/hospital/blood-stock` |
| **Test Input** | Hospital JWT token |
| **Expected Result** | HTTP 200, blood stock data returned |
| **Actual Result** | HTTP 200 |
| **Pass/Fail** | ✅ PASS |

#### TC12.2 — Negative: Patient attempts to access a hospital-only route

| Field | Details |
|-------|---------|
| **Test Case ID** | TC12.2 |
| **Type** | Negative |
| **Test Steps** | 1. Log in as patient  2. GET `/api/hospital/blood-stock` using the patient token |
| **Test Input** | Patient JWT token |
| **Expected Result** | HTTP 403, "Access denied. Requires role: hospital." |
| **Actual Result** | HTTP 403 |
| **Pass/Fail** | ✅ PASS |

---

## Section 2 — Test Execution Summary

> All tests were executed using a Node.js script that sent real HTTP requests to the running MediLink server at `http://localhost:5000`. Test data was created at the start and deleted after each run. MongoDB was live throughout.

| Scenario | TC | Type | Status |
|----------|----|------|--------|
| TS01 — Patient Registration | TC01.1 | Positive | ✅ PASS |
| TS01 — Patient Registration | TC01.2 | Negative | ✅ PASS |
| TS02 — Login + Role Verification | TC02.1 | Positive | ✅ PASS |
| TS02 — Login + Role Verification | TC02.2 | Negative | ✅ PASS |
| TS03 — Blood Bank Registration | TC03.1 | Positive | ✅ PASS |
| TS03 — Blood Bank Registration | TC03.2 | Negative | ✅ PASS |
| TS04 — Admin Approval | TC04.1 | Positive | ✅ PASS |
| TS04 — Admin Approval | TC04.2 | Negative | ✅ PASS |
| TS05 — Add Blood Stock | TC05.1 | Positive | ✅ PASS |
| TS05 — Add Blood Stock | TC05.2 | Negative | ✅ PASS |
| TS06 — Patient Blood Search | TC06.1 | Positive | ✅ PASS |
| TS06 — Patient Blood Search | TC06.2 | Negative | ✅ PASS |
| TS07 — Emergency Request | TC07.1 | Positive | ✅ PASS |
| TS07 — Emergency Request | TC07.2 | Negative | ✅ PASS |
| TS08 — Donor City Filter | TC08.1 | Positive | ✅ PASS *(retested)* |
| TS08 — Donor City Filter | TC08.2 | Negative | ✅ PASS |
| TS09 — Donor Response | TC09.1 | Positive | ✅ PASS |
| TS09 — Donor Response | TC09.2 | Negative | ✅ PASS |
| TS10 — Hospital Settings | TC10.1 | Positive | ✅ PASS |
| TS10 — Hospital Settings | TC10.2 | Negative | ✅ PASS |
| TS11 — Expired Stock | TC11.1 | Positive | ✅ PASS |
| TS11 — Expired Stock | TC11.2 | Negative | ✅ PASS |
| TS12 — Role-Based Access | TC12.1 | Positive | ✅ PASS |
| TS12 — Role-Based Access | TC12.2 | Negative | ✅ PASS |

**Total: 24 test cases | Passed: 24 | Failed: 0**

---

## Section 3 — Test Coverage Metrics

### 3.1 Definitions

| Term | Definition |
|------|-----------|
| **Execution Coverage** | Percentage of identified test cases that were actually executed (run) |
| **Pass Rate** | Percentage of executed test cases that produced the expected result |
| **Feature Coverage** | Percentage of application features that have at least one test case |

These three metrics are **distinct**. A test can be executed (execution coverage = 100%) but still fail (pass rate < 100%). Feature coverage measures breadth, not correctness.

---

### 3.2 Execution Coverage

Measures how many of the planned test cases were actually run.

$$\text{Execution Coverage (\%)} = \frac{\text{Test Cases Executed}}{\text{Test Cases Identified}} \times 100$$

$$\text{Execution Coverage} = \frac{24}{24} \times 100 = \mathbf{100\%}$$

All 24 identified test cases were executed.

---

### 3.3 Pass Rate (Test Success Rate)

Measures what fraction of executed tests produced the expected result.

$$\text{Pass Rate (\%)} = \frac{\text{Test Cases Passed}}{\text{Test Cases Executed}} \times 100$$

$$\text{Pass Rate} = \frac{24}{24} \times 100 = \mathbf{100\%}$$

All 24 test cases passed (including TC08.1 after correcting the test input to include `hospitalCity`).

---

### 3.4 Feature Coverage

Measures how many of the application's distinct features are covered by at least one test case.

$$\text{Feature Coverage (\%)} = \frac{\text{Features with At Least One Test Case}}{\text{Total Identifiable Features}} \times 100$$

| Feature | Test Cases |
|---------|-----------|
| Patient Registration | TC01.1, TC01.2 |
| Login with Role Selection | TC02.1, TC02.2 |
| Blood Bank Registration + Pending Approval | TC03.1, TC03.2 |
| Admin Blood Bank Approval | TC04.1, TC04.2 |
| Blood Bank Stock Management | TC05.1, TC05.2, TC11.1, TC11.2 |
| Patient Blood Search | TC06.1, TC06.2 |
| Emergency Blood Request | TC07.1, TC07.2 |
| Donor City-Based Filtering | TC08.1, TC08.2 |
| Donor Response to Request | TC09.1, TC09.2 |
| Hospital Settings Persistence | TC10.1, TC10.2 |
| JWT Authentication | TC10.2, TC12.1, TC12.2 |
| Role-Based Access Control (Middleware) | TC12.1, TC12.2 |
| Admin User Management | *(not tested)* |
| Hospital Doctor Management | *(not tested)* |

$$\text{Feature Coverage} = \frac{12}{14} \times 100 \approx \mathbf{85.7\%}$$

---

### 3.5 Defect Density

$$\text{Defect Density} = \frac{\text{Defects Found}}{\text{Test Cases Executed}} = \frac{0}{24} = \mathbf{0}$$

No defects were found in the final test run. (The city filter defect found in the first run was a test-data input error, not an application bug.)

---

### 3.6 Coverage Summary Table

| Metric | Formula | Result |
|--------|---------|--------|
| Execution Coverage | 24 ÷ 24 × 100 | **100%** |
| Pass Rate | 24 ÷ 24 × 100 | **100%** |
| Feature Coverage | 12 ÷ 14 × 100 | **85.7%** |
| Defect Density | 0 ÷ 24 | **0** |

---

## Section 4 — Cyclomatic Complexity

### 4.1 What is Cyclomatic Complexity?

Cyclomatic Complexity (V(G)) is a software metric introduced by Thomas J. McCabe in 1976. It counts the number of **independent execution paths** through a piece of code. More paths means the code is harder to test and maintain.

**Two equivalent formulas:**

$$\boxed{V(G) = E - N + 2P}$$

| Symbol | Meaning |
|--------|---------|
| E | Number of **edges** (arrows) in the control-flow graph |
| N | Number of **nodes** (processing steps/decisions) |
| P | Number of **connected components** (= 1 for a single function) |

$$\boxed{V(G) = D + 1}$$

| Symbol | Meaning |
|--------|---------|
| D | Number of **decision points** (each `if`, `else if` statement) |

Both formulas must give the **same result** when applied consistently. A discrepancy in the previous report (13 vs 15) was caused by inconsistently counting compound boolean operators and the catch block. The corrected calculation below resolves this.

---

### 4.2 Function Selected: `login()` in `authController.js`

This is the most critical function in the application. It validates credentials and controls access for all five roles.

#### Exact source code:

```javascript
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {                        // D1
      return res.status(400).json({ ... });
    }

    const user = await User.findOne({ ... });
    if (!user) {                                       // D2
      return res.status(401).json({ ... });
    }

    const match = await user.comparePassword(password);
    if (!match) {                                      // D3
      return res.status(401).json({ ... });
    }

    if (role && user.role !== role) {                  // D4
      return res.status(403).json({ code: "ROLE_MISMATCH" });
    }

    if (user.role === "hospital") {                    // D5
      if (user.approvalStatus === "pending") {         // D6
        return res.status(403).json({ code: "HOSPITAL_PENDING" });
      }
      if (user.approvalStatus === "rejected") {        // D7
        return res.status(403).json({ code: "HOSPITAL_REJECTED" });
      }
    }

    if (user.role === "bloodbank") {                   // D8
      if (user.approvalStatus === "pending") {         // D9
        return res.status(403).json({ code: "BLOODBANK_PENDING" });
      }
      if (user.approvalStatus === "rejected") {        // D10
        return res.status(403).json({ code: "BLOODBANK_REJECTED" });
      }
    }

    if (!user.isActive) {                              // D11
      return res.status(403).json({ ... });
    }

    sendAuth(user, 200, res);                          // success path

  } catch (err) {
    res.status(500).json({ ... });                     // exception handler
  }
};
```

---

### 4.3 Decision Point Count (for D + 1)

> **Rule applied:** Each `if` statement counts as **one** decision point. Compound conditions (`&&`, `||`) within a single `if` are treated as one decision. The `catch` block is an **exception handler**, not an `if` decision — it is NOT counted as D.

| # | Statement | Decision |
|---|-----------|----------|
| D1 | `if (!email \|\| !password)` | 1 |
| D2 | `if (!user)` | 1 |
| D3 | `if (!match)` | 1 |
| D4 | `if (role && user.role !== role)` | 1 |
| D5 | `if (user.role === "hospital")` | 1 |
| D6 | `if (user.approvalStatus === "pending")` (hospital) | 1 |
| D7 | `if (user.approvalStatus === "rejected")` (hospital) | 1 |
| D8 | `if (user.role === "bloodbank")` | 1 |
| D9 | `if (user.approvalStatus === "pending")` (bloodbank) | 1 |
| D10 | `if (user.approvalStatus === "rejected")` (bloodbank) | 1 |
| D11 | `if (!user.isActive)` | 1 |
| — | `catch (err)` — exception handler, **not a decision** | 0 |

**Total D = 11**

$$V(G) = D + 1 = 11 + 1 = \mathbf{12}$$

---

### 4.4 Control-Flow Graph (for E − N + 2P)

The CFG follows the standard McCabe convention: **all `return` statements, `sendAuth` (success), and the `catch` block are merged into a single EXIT node.**

#### Node Construction Rule

Only nodes where flow can branch or join are listed as separate nodes. Pure sequential statements between two decisions are collapsed into the preceding decision node. This is McCabe's minimal CFG.

**Nodes (N = 13):**

| Node | Type | What it represents in the code |
|------|------|---------------------------------|
| N1 | Entry | Start of try block — destructure `{ email, password, role }` from `req.body` |
| N2 | Decision (D1) | `if (!email \|\| !password)` |
| N3 | Decision (D2) | Result of `User.findOne(...)` → `if (!user)` |
| N4 | Decision (D3) | Result of `comparePassword(...)` → `if (!match)` |
| N5 | Decision (D4) | `if (role && user.role !== role)` |
| N6 | Decision (D5) | `if (user.role === "hospital")` |
| N7 | Decision (D6) | `if (user.approvalStatus === "pending")` — inside hospital block |
| N8 | Decision (D7) | `if (user.approvalStatus === "rejected")` — inside hospital block |
| N9 | Decision (D8) | `if (user.role === "bloodbank")` |
| N10 | Decision (D9) | `if (user.approvalStatus === "pending")` — inside bloodbank block |
| N11 | Decision (D10) | `if (user.approvalStatus === "rejected")` — inside bloodbank block |
| N12 | Decision (D11) | `if (!user.isActive)` |
| EXIT | Exit | All returns (400/401/403/200/500) + `sendAuth` + `catch` block |

> N1 is kept as a separate entry node because it does not contain a decision itself — it is the function entry before the first branch. This is a standard convention and is why N=13, not 12.

**N = 13**

**Edges (E = 23) — every possible flow between nodes:**

| # | From → To | When this edge is taken |
|---|-----------|------------------------|
| 1 | N1 → N2 | Sequential (entry into first decision) |
| 2 | N2 → EXIT | D1 **true** — missing email or password → 400 |
| 3 | N2 → N3 | D1 **false** — fields are present |
| 4 | N3 → EXIT | D2 **true** — no user found → 401 |
| 5 | N3 → N4 | D2 **false** — user found |
| 6 | N4 → EXIT | D3 **true** — password incorrect → 401 |
| 7 | N4 → N5 | D3 **false** — password correct |
| 8 | N5 → EXIT | D4 **true** — role mismatch → 403 |
| 9 | N5 → N6 | D4 **false** — role matches (or no role supplied) |
| 10 | N6 → N7 | D5 **true** — user is a hospital |
| 11 | N6 → N9 | D5 **false** — user is not a hospital |
| 12 | N7 → EXIT | D6 **true** — hospital pending approval → 403 |
| 13 | N7 → N8 | D6 **false** — hospital not in pending state |
| 14 | N8 → EXIT | D7 **true** — hospital rejected → 403 |
| 15 | N8 → N9 | D7 **false** — hospital not rejected → fall through to bloodbank check |
| 16 | N9 → N10 | D8 **true** — user is a bloodbank |
| 17 | N9 → N12 | D8 **false** — user is not a bloodbank |
| 18 | N10 → EXIT | D9 **true** — bloodbank pending approval → 403 |
| 19 | N10 → N11 | D9 **false** — bloodbank not in pending state |
| 20 | N11 → EXIT | D10 **true** — bloodbank rejected → 403 |
| 21 | N11 → N12 | D10 **false** — bloodbank not rejected → fall through |
| 22 | N12 → EXIT | D11 **true** — account deactivated → 403 |
| 23 | N12 → EXIT | D11 **false** — all checks passed → `sendAuth` → 200 |

**E = 23**

$$V(G) = E - N + 2P = 23 - 13 + 2 \times 1 = \mathbf{12}$$

#### CFG Diagram

```
        [N1: ENTRY]
             |
             v
        [N2: if !email||!password] ----true----> [EXIT: 400]
             |
           false
             |
             v
        [N3: if !user] ----------------true----> [EXIT: 401]
             |
           false
             |
             v
        [N4: if !match] ---------------true----> [EXIT: 401]
             |
           false
             |
             v
        [N5: if role && role!=user.role] -true-> [EXIT: 403 ROLE_MISMATCH]
             |
           false
             |
             v
        [N6: if user.role==="hospital"]
          /        \
       true        false
        |            \
        v             \
  [N7: if pending]    |
    /      \          |
  true    false       |
   |        |         |
  EXIT    [N8: if rejected]
  (403)    /     \
         true   false
          |       |
        EXIT      |
        (403)     |
                  +------------+
                               |
                               v
                     [N9: if user.role==="bloodbank"]
                          /          \
                       true          false
                        |              |
                        v              v
                  [N10: if pending]  [N12: if !isActive]
                    /       \          /          \
                  true     false     true         false
                   |          |       |              |
                  EXIT  [N11: if rejected]        EXIT
                  (403)   /        \             (200 sendAuth)
                        true      false
                         |          |
                        EXIT      [N12: if !isActive]
                        (403)      /          \
                                 true         false
                                  |              |
                                EXIT           EXIT
                                (403)         (200 sendAuth)
```

> **Note:** N12 (`if !isActive`) appears at two convergence points (after the hospital block exits and after the bloodbank block exits) but it is the **same node** in the graph — both paths join at N12 before the final check.

**Simplified linear flow representation:**

```
ENTRY → D1 → D2 → D3 → D4 → D5 ─┬─(hospital)→ D6 → D7 ─┐
                                  │                        │
                                  └────────────────────────┤
                                                           ↓
                                                D8 ─┬─(bloodbank)→ D9 → D10 ─┐
                                                    │                          │
                                                    └──────────────────────────┤
                                                                               ↓
                                                                        D11 → EXIT (200)
```

---

### 4.5 Why Both Formulas Now Give 12

| Formula | Calculation | Result |
|---------|------------|--------|
| V(G) = D + 1 | 11 + 1 | **12** |
| V(G) = E − N + 2P | 23 − 13 + 2 | **12** |

Both give the same answer ✅

**Why the earlier report had a discrepancy (13 vs 15):**

- The D+1 formula incorrectly included the `catch` block as a decision (D=12 instead of 11).
- The E−N+2P formula used inflated node and edge counts by not merging exit points into a single EXIT node, which is required by the McCabe CFG convention.

With both fixes applied, both formulas consistently give **V(G) = 12**.

---

### 4.6 Interpretation

| Cyclomatic Complexity | Risk Level | Meaning |
|-----------------------|-----------|---------|
| 1 – 5 | Low | Simple, easy to test |
| 6 – 10 | Moderate | Moderate complexity |
| **11 – 15** | **High** | **Complex — thorough testing needed** |
| > 25 | Very High | Very risky, hard to maintain |

**login() → V(G) = 12 → High Complexity**

V(G) = 12 means the **minimum number of test cases required to cover all branches** is 12 — one per independent path in the basis set. This is a lower bound; the actual number of distinct paths from entry to exit can be larger due to nested decisions.

---

### 4.7 All Distinct Exit Paths and Test Coverage

By tracing every unique route from ENTRY to EXIT through the CFG, the following 13 distinct paths exist (V(G) = 12 basis paths; one additional path arises from the structural nesting of the deactivated-account check after both the hospital and bloodbank blocks):

| Path | Decision sequence | Outcome | HTTP | Covered by |
|------|-------------------|---------|------|-----------|
| **P1** | D1=T | Missing email/password | 400 | ❌ Not tested (no login test omits credentials) |
| **P2** | D1=F, D2=T | User not found | 401 | ❌ Not tested (no test sends a non-existent email to login) |
| **P3** | D1=F, D2=F, D3=T | Wrong password | 401 | ❌ Not tested (all login tests use the correct password) |
| **P4** | D1=F, D2=F, D3=F, D4=T | Role mismatch | 403 | ✅ **TC02.2** |
| **P5** | D1=F, D2=F, D3=F, D4=F, D5=T, D6=T | Hospital — pending | 403 | ❌ Not tested (TC03.2 tests blood bank pending, not hospital pending via login directly) |
| **P6** | D1=F, D2=F, D3=F, D4=F, D5=T, D6=F, D7=T | Hospital — rejected | 403 | ❌ Not tested |
| **P7** | D1=F, D2=F, D3=F, D4=F, D5=T, D6=F, D7=F, D8=F, D11=T | Hospital approved — deactivated | 403 | ❌ Not tested |
| **P8** | D1=F, D2=F, D3=F, D4=F, D5=T, D6=F, D7=F, D8=F, D11=F | Hospital approved — success | 200 | ✅ **TC10** (hospital login during setup) |
| **P9** | D1=F, D2=F, D3=F, D4=F, D5=F, D8=T, D9=T | Bloodbank — pending | 403 | ✅ **TC03.2** |
| **P10** | D1=F, D2=F, D3=F, D4=F, D5=F, D8=T, D9=F, D10=T | Bloodbank — rejected | 403 | ❌ Not tested |
| **P11** | D1=F, D2=F, D3=F, D4=F, D5=F, D8=T, D9=F, D10=F, D11=T | Bloodbank approved — deactivated | 403 | ❌ Not tested |
| **P12** | D1=F, D2=F, D3=F, D4=F, D5=F, D8=F, D11=T | Patient/Donor — deactivated | 403 | ❌ Not tested |
| **P13** | D1=F, D2=F, D3=F, D4=F, D5=F, D8=F, D11=F | Patient/Donor — success | 200 | ✅ **TC02.1** |

> **Note on P8 and D8:** When a hospital user reaches D8 (`if user.role === "bloodbank"`), the condition is always false because `user.role` is "hospital". The path therefore goes directly to N12. This is structurally correct — D5 and D8 are mutually exclusive for any given user.

**Paths covered: P4, P8, P9, P13 = 4 out of 13 distinct paths**

$$\text{Login Path Coverage} = \frac{4}{13} \approx 30.8\%$$

This is the **honest measured result** from the 24 test cases. The function has high structural complexity (V(G) = 12) but the test suite was designed to cover features, not exhaustive paths through a single function. The untested paths (P1–P3, P5–P7, P10–P12) would require additional dedicated unit tests for the login function.

---

## Section 5 — Final Summary

### Test Coverage Report

| Metric | Formula | Value |
|--------|---------|-------|
| Execution Coverage | 24 ÷ 24 × 100 | **100%** |
| Pass Rate | 24 ÷ 24 × 100 | **100%** |
| Feature Coverage | 12 ÷ 14 × 100 | **85.7%** |
| Defect Density | 0 ÷ 24 | **0** |

### Cyclomatic Complexity Report

| Item | Value |
|------|-------|
| Function analysed | `login()` in `server/controllers/authController.js` |
| Decision points (D) | 11 (catch block excluded — it is not an if-decision) |
| **V(G) = D + 1** | **12** |
| **V(G) = E − N + 2P** | 23 − 13 + 2 = **12** |
| Risk level | High (range 11–15) |
| Distinct exit paths through function | 13 |
| Paths covered by this test suite | 4 of 13 (≈ 30.8%) |
| Paths not covered | P1, P2, P3, P5, P6, P7, P10, P11, P12 |

---

## Section 6 — Viva Explanation (Simple)

**Q: What is a Test Suite?**
A: A test suite is a collection of test cases grouped to verify whether an application works correctly. In this practical, we designed 12 test scenarios with 24 test cases covering login, registration, blood search, donor responses, settings, and role-based access.

**Q: What is the difference between Execution Coverage and Pass Rate?**
A: Execution Coverage is simply whether a test was *run* — it says nothing about the outcome. Pass Rate measures how many of the tests that *were run* actually produced the correct result. You can run all tests (100% execution) and still fail half of them (50% pass rate). They are two separate metrics.

**Q: What is Cyclomatic Complexity?**
A: It is a number that tells you how many independent paths exist through a function. The formula is `V(G) = D + 1` where D is the number of `if` statements. Our login function has 11 `if` statements, so V(G) = 12, which is "High" complexity. It means you need at least 12 test cases to cover all branches of that one function.

**Q: Why did you exclude the catch block from D?**
A: A `catch` block is an exception handler — it runs when something unexpected goes wrong, not when a programmer-written condition is true or false. McCabe's original definition counts only predicate nodes (binary decisions made by the programmer). Exception handlers are not programmer decisions in the same sense.

**Q: Why did TC08.1 fail the first time?**
A: The test submitted an emergency blood request without including the `hospitalCity` field. The city filter in the backend matches against `hospitalCity` on the stored blood request. Without it, the filter found nothing. After adding `hospitalCity: "Mumbai"` to the test input, the test passed correctly. The filter code itself was always right — it was a test data error.

**Q: What is Feature Coverage?**
A: Feature coverage measures what percentage of the application's features have been tested. We tested 12 out of 14 identified features (85.7%). The two untested features are Admin User Management and Hospital Doctor Management.

---

*Report prepared for Advanced Web Technology (AWT) — Practical 9*
*Tests executed against live MediLink backend at http://localhost:5000*
*All test data created and cleaned up during execution — no permanent changes made to the database*
