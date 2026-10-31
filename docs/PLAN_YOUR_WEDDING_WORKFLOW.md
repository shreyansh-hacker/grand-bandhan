# Grand Bandhan — "Plan Your Wedding" End-to-End Workflow Specification

## 1. Overview & Vision

Grand Bandhan transforms wedding planning from fragmented spreadsheets, WhatsApp threads, and opaque pricing into an **integrated, auditable 11-step enterprise operations lifecycle**. 

From the moment a prospective bride, groom, or family member submits their celebration vision on the public portal to post-wedding vendor settlement, every state change is recorded on **Neon PostgreSQL** and broadcasted via transactional notifications.

---

## 2. The 11-Step Wedding Lifecycle

```
[1. Public Enquiry] ──────► [2. Reference Code] ──────► [3. Agency Triage]
 (GB-ENQ-2026-XXXX)       (Public Tracking Link)        (CRM Lead Inbox)
                                                               │
                                                               ▼
[6. Couple Decision] ◄───── [5. Bespoke Proposal] ◄───── [4. Planner Assigned]
 (ACCEPT / REVISE)          (Payment Milestones)         (Auto-Email Dispatch)
        │
        ▼
[7. Digital Agreement] ────► [8. Booking Deposit] ────► [9. Wedding Conversion]
 (Legal e-Signature)        (Payment Verification)      (Enquiry ➔ Wedding)
                                                               │
                                                               ▼
[11. Vendor RFPs & Ops] ◄────────────────────────────── [10. Instant 25+ Plan]
 (Three Vendors One Decision)                            (Dynamic Lead-Times)
```

---

## 3. Step-by-Step Technical Execution

### Step 1: Public Enquiry Submission
- **Trigger:** Prospective couple completes `EnquiryModal.tsx` on the landing page or portal.
- **Endpoint:** `POST /api/enquiries/public`
- **Payload:**
  ```json
  {
    "customerName": "Rhea Kapoor",
    "partnerName": "Siddharth Malhotra",
    "email": "couple@grandbandhan.com",
    "phone": "+91 98200 12345",
    "preferredContactMethod": "WHATSAPP",
    "weddingDate": "2026-12-18",
    "isDateFlexible": false,
    "location": "Jagmandir Island Palace, Udaipur",
    "guestCount": 400,
    "theme": "Royal Rajputana Heritage & Gold",
    "packageType": "FULL_SERVICE",
    "minBudget": 3500000,
    "maxBudget": 5000000,
    "source": "WEBSITE",
    "planningFor": "NOT_SPECIFIED",
    "notes": "Lake boat Baraat arrival with pure Rajasthani vegetarian catering."
  }
  ```
- **Prisma Persistence:** Created in Neon `CustomerEnquiry` table with status `NEW`.
- **Reference Code Generation:** Generates an official, non-guessable alphanumeric tracking code:
  `GB-ENQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` (e.g. `GB-ENQ-2026-1049`).

### Step 2: Customer Reference Tracking
- **Public URL:** `/enquiry/GB-ENQ-2026-1049`
- **Endpoint:** `GET /api/enquiries/reference/:referenceNumber`
- **Access Model:** Completely public, no authentication required.
- **Display:** Shows real-time lifecycle progress stepper, confirmed guest count, budget range, and assigned planner contact card.

### Step 3: Agency Lead Triage
- **Dashboard View:** `/dashboard/enquiries`
- **Endpoint:** `GET /api/enquiries`
- **Access Model:** Authenticated (`SUPER_ADMIN`, `AGENCY_ADMIN`, `WEDDING_PLANNER`). Scoped to current agency tenant.
- **Capabilities:** Filter by status (`NEW`, `CONTACTED`, `PROPOSAL_SENT`, `BOOKING_PENDING`, `CONVERTED`), budget, and destination.

### Step 4: Planner Assignment
- **Endpoint:** `PATCH /api/enquiries/:id/assign-planner`
- **Payload:** `{ "plannerId": "usr_planner_101" }`
- **Logic:** Updates enquiry status to `CONTACTED`.
- **Event Outbox:** Emits `NotificationEvent.ENQUIRY_ASSIGNED` to `EmailLog`, triggering an email alert to the assigned wedding specialist.

### Step 5: Bespoke Proposal Generation
- **Endpoint:** `POST /api/proposals`
- **Payload:**
  ```json
  {
    "enquiryId": "enq_7862...",
    "packageType": "FULL_SERVICE",
    "estimatedBudget": 4200000,
    "proposedServices": ["Catering RFP", "Palace Decor", "Live Shehnai", "Royal Bar"],
    "planningScope": "Complete multi-day coordination covering Mehndi, Sangeet, Pheras and Reception.",
    "paymentMilestones": [
      { "name": "Booking Deposit", "percent": 25, "amount": 1050000 },
      { "name": "Vendor Lock-in", "percent": 50, "amount": 2100000 },
      { "name": "Final Settlement", "percent": 25, "amount": 1050000 }
    ],
    "validUntil": "2026-11-30T00:00:00.000Z"
  }
  ```
- **Outbox:** Emits `PROPOSAL_SENT` to couple's email address with link to review.

### Step 6: Customer Proposal Decision
- **Endpoint:** `POST /api/proposals/:id/respond`
- **Payload:** `{ "status": "ACCEPTED", "customerNotes": "Approved with lake boat arrival confirmed." }`
- **Logic:** Updates proposal status to `ACCEPTED` and updates linked enquiry to `BOOKING_PENDING`.

### Step 7: Digital Service Agreement
- **Endpoint:** `POST /api/agreements/:id/sign`
- **Payload:** SVG/Canvas signature, signatory IP address, and legal name.
- **Prisma Persistence:** Stored in `DigitalAgreement` table with status `SIGNED`.

### Step 8: Booking Deposit Verification
- **Endpoint:** `POST /api/payments/transactions`
- **Payload:** Records bank transfer/UPI reference for 25% deposit milestone.

### Step 9: Formal Wedding Project Conversion
- **Endpoint:** `POST /api/weddings/convert-enquiry/:enquiryId`
- **Atomic Transaction:**
  1. Creates active `Wedding` record with unique code `GB-${year}-${slug}`.
  2. Creates 3 default client milestone schedules (Booking Deposit, Vendor Lock-in, Final Balance).
  3. Updates enquiry status to `CONVERTED`.
  4. Automatically invokes **Step 10**.

### Step 10: Instant 25+ Task Plan Initialization
- **Service:** `generateInstantWeddingPlan(weddingId, weddingDate, packageType, tx)`
- **Dynamic Calculation:** Every task deadline is calculated relative to `weddingDate`:
  $$\text{Deadline} = \text{WeddingDate} - (\text{leadTimeDaysBeforeWedding} \times 24 \times 60 \times 60 \times 1000)$$
- **Full-Service Package:** Spawns 26 high-priority operational milestones across 7 phases:
  - Phase 1: Strategy & Theme (120-105 days before)
  - Phase 2: Vendor Selection & RFP Comparisons (90-60 days before)
  - Phase 3: Production & Guest Experience (45-30 days before)
  - Phase 4: Final Technical Alignment (21-7 days before)
  - Phase 5: Rehearsal & Setup (2-1 days before)
  - Phase 6: Day-of Live Execution (Day 0)
  - Phase 7: Post-Event Settlement & Plate Count Audit (Day +1)

### Step 11: "Three Vendors One Decision" Quotation Comparisons
- **Dashboard View:** `/dashboard/quotations`
- **Feature:** Planner floats categorical RFPs (Catering, Decor, Photography, Entertainment).
- **Comparison Engine:** Exactly 3 verified vendor quotes are compared side-by-side with per-guest unit pricing, menu breakdowns, and portfolio ratings before client lock-in.
