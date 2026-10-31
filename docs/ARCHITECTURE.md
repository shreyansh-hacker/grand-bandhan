# Grand Bandhan – Technical Architecture & Engineering Specification

## 1. System Overview
**Grand Bandhan** is engineered as a high-performance **modular monolith monorepo** utilizing `pnpm` workspaces. It provides an end-to-end luxury wedding planning and operations management platform designed to withstand complex real-world workflows—from multi-channel lead acquisition to post-event financial settlement.

```
                    ┌─────────────────────────────────┐
                    │       Next.js 15 Web Client     │
                    │   (App Router, React 19, Tailwind)│
                    └───────────────┬─────────────────┘
                                    │ HTTP / WebSocket
                                    ▼
                    ┌─────────────────────────────────┐
                    │      Express.js REST + Socket   │
                    │       Modular API Server        │
                    └───────────────┬─────────────────┘
                                    │ Prisma ORM
                                    ▼
                    ┌─────────────────────────────────┐
                    │      PostgreSQL Database        │
                    │     (Neon Cloud / Local)        │
                    └─────────────────────────────────┘
```

---

## 2. Monorepo Organization

- **`apps/web`**: Next.js 15 application utilizing App Router, Server/Client components, Framer Motion, and Tailwind CSS themed in the Imperial Blue & Gold design palette.
- **`apps/api`**: Node.js & Express application hosting modular REST endpoints, Socket.IO real-time hub, and Prisma ORM integration.
- **`apps/mobile`**: Reserved workspace for future React Native iOS & Android client, sharing `@grand-bandhan/shared` and consuming the same backend API.
- **`packages/shared`**: Universal TypeScript definitions, enums, DTO interfaces, and Socket.IO event keys.
- **`packages/validation`**: Universal Zod validation schemas shared identically across frontend forms and backend request parsers.
- **`packages/config`**: Base TypeScript configurations and shared tooling presets.

---

## 3. Core Business Modules & Workflows

### A. Multi-Channel Enquiry & Customer Management
- Captures leads across 5 sources: Website forms, WhatsApp concierge, Instagram showcases, phone calls, and manual intake.
- Implements the optional, skippable field **Wedding Planning For**: Bride Side, Groom Side, or Joint/Unspecified.
- Tracks lead status transitions (`NEW` → `CONTACTED` → `CONSULTATION_SCHEDULED` → `PROPOSAL_SENT` → `CONVERTED` → `LOST`).
- One-click lead conversion into a confirmed wedding project with an auto-generated digital agreement.

### B. Digital Agreements & Signatures
- Enforces proper legal digital execution with an HTML5 drawing canvas rather than treated typed names.
- Captures signer legal name, signature PNG data URL, client IP address, user agent, and ISO timestamp into an immutable audit trail.

### C. "Three Vendors, One Decision" Quotation Comparison
- Mandatory core workflow for categories such as royal banquet catering, floral production, and cinematography.
- Receives multi-vendor quotes and displays them side-by-side.
- Normalizes comparisons by price per plate, base production fee, extra-hour rates, and included menu items.
- Couple retains the authoritative final selection; selection automatically binds the contract to the wedding and closes competing quotes while preserving bid history.

### D. Instant Wedding Planning (25+ Auto-Generated Tasks)
- Calculates dynamic deadlines using the confirmed wedding date and configurable lead times (`T-minus X days`).
- Tailored templates for **Full-Service Royal Weddings** (26 tasks) vs **Partial / Day-of Execution** (11 tasks).
- Idempotent generation logic prevents duplicate tasks upon regeneration.

### E. Live Event Timeline & Vendor Arrival Gate Radar
- Minute-by-minute day-of execution run-sheet (Baraat procession, Varmala, Pheras, Sangeet after-party).
- Real-time logging of vendor arrivals at loading docks with on-time vs delay categorization.
- Real-time Socket.IO broadcasts (`join:wedding` rooms) for cross-staff coordination.

### F. Service Verification System
- Operationally verifies scheduled services (e.g. DJ scheduled at 7:00 PM) before funds disbursement.
- Provides 4 explicit responses: Completed, Incomplete, Not Delivered, Report Issue.
- Disputed issues escalate directly to agency admin and vendor for rebuttal notes and auditable resolution.

### G. Financial Ledger & Post-Wedding Settlement
- Client milestone disbursements (25% booking advance, 50% production advance, 25% final balance).
- Post-wedding reconciliation calculates actual plate counts against minimum guarantees, extended vendor hours, and unexpected expenses to compute final agency gross profit.

---

## 4. Security & Role-Based Access Control (RBAC)

1. **Authentication**: Custom JWT authentication utilizing short-lived access tokens (15 minutes) and rotating refresh tokens (7 days). Passwords hashed using bcrypt/Argon2id with 12 salt rounds.
2. **Role Enforcement**:
   - `SUPER_ADMIN`: Cross-agency platform administrator.
   - `AGENCY_ADMIN`: Agency owner with full wedding and financial authority.
   - `WEDDING_PLANNER`: Project lead managing tasks, RFPs, and vendors.
   - `COORDINATOR`: On-ground staff managing gate arrivals and verification checks.
   - `VENDOR`: Restricted portal access to submit quotes and confirm arrival times.
   - `CLIENT`: Restricted portal access to sign agreements, choose vendors, and confirm services.
3. **Privileged Expiring Portal Links**: Cryptographically signed access tokens providing time-bounded, permission-restricted portal access without exposing administrative dashboards.
