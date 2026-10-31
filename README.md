# 👑 GRAND BANDHAN – Imperial Wedding Planning & Operations Management Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-shreyansh--hacker%2Fgrand--bandhan-0A2540?logo=github&style=for-the-badge)](https://github.com/shreyansh-hacker/grand-bandhan)
[![Tech Stack](https://img.shields.io/badge/Next.js%2015%20%7C%20Express%20%7C%20Prisma%20%7C%20Socket.IO-C9A96A?style=for-the-badge)](https://github.com/shreyansh-hacker/grand-bandhan)
[![License](https://img.shields.io/badge/License-MIT-1E3A8A?style=for-the-badge)](LICENSE)

> **Grand Bandhan** is a premium, scalable Wedding Planning & Operations Management Platform crafted in an **Imperial Blue & Gold** aesthetic. Designed **Web First, Mobile Ready**, it manages the complete wedding lifecycle—from multi-channel customer enquiries and legally binding digital agreements to side-by-side vendor quotation comparison ("Three Vendors, One Decision"), instant automated 25+ milestone planning, real-time wedding-day live execution with vendor arrival radar, operational service verification, and post-wedding financial reconciliation.

---

## 🏛️ Imperial Blue & Gold Design System

| Token | Hex Code | Visual Application |
|---|---|---|
| **Primary Navy** | `#0A2540` | Deep imperial background, high-contrast structural accents, command center headers |
| **Secondary Blue** | `#1E3A8A` | Interactive states, primary button elements, status indicator borders |
| **Accent Gold** | `#C9A96A` | Metallic crest badges, primary CTAs, luxury highlights, gold metallic gradients |
| **Light Gold** | `#E6D6B8` | Soft card borders, muted luxury highlights, subtle dividers |
| **Background Cream** | `#F7F4ED` | Warm luxury background, subtle surface texture, high readability |
| **Dark Text** | `#1F2937` | High-contrast readable typography |

---

## 🚀 1-Click Demo Evaluation Credentials

The login portal (`/login`) includes **1-Click Role Evaluator Buttons** allowing instant switching between all roles:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **👑 Super Admin** | `admin@grandbandhan.com` | `GrandBandhan@2025` | Full cross-agency governance, database audits, and platform settings |
| **📋 Wedding Planner** | `planner@grandbandhan.com` | `GrandBandhan@2025` | Lead intake, vendor selection RFPs, 25+ task scheduling, and live timeline |
| **📍 On-ground Staff** | `coordinator@grandbandhan.com` | `GrandBandhan@2025` | Loading dock vendor arrivals, day-of run-sheets, service verifications |
| **💍 Client / Couple** | `client@grandbandhan.com` | `GrandBandhan@2025` | Quotation decision matrix, digital canvas signing, service confirmations |
| **🤝 Vendor Partner** | `caterer1@grandbandhan.com` | `GrandBandhan@2025` | Sealed quotation submission, plate pricing, gate check-in, dispute response |

---

## 📦 Monorepo Architecture

Grand Bandhan is organized as a clean **modular monolith** via a `pnpm` monorepo:

```
grand-bandhan/
├── apps/
│   ├── web/                    # Next.js 15 App Router frontend (React 19, Tailwind, Framer Motion)
│   ├── api/                    # Express.js REST API + Socket.IO real-time hub + Prisma ORM
│   └── mobile/                 # Reserved for React Native iOS/Android client consuming the same API
├── packages/
│   ├── shared/                 # Universal TypeScript enums, DTO interfaces, socket event contracts
│   ├── validation/             # Shared Zod validation schemas across web and api
│   └── config/                 # Base TypeScript configs
├── docs/
│   ├── ARCHITECTURE.md         # Architecture diagrams, data isolation, security & RBAC
│   ├── API_SPECIFICATION.md    # Comprehensive REST endpoints and Socket.IO payloads
│   └── DEPLOYMENT_GUIDE.md     # Progressive deployment guide (Vercel, Render, Neon, Cloudinary)
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 🎯 Mandatory Core Business Modules

### 1. Enquiry & Customer Management (CRM)
- Captures enquiries across 5 multi-channel inputs: **Website forms, WhatsApp concierge, Instagram, Phone calls, and Manual entries**.
- Implements the optional, skippable field **Wedding Planning For**:
  - Bride Side 👰
  - Groom Side 🤵
  - Skip / Joint 👑
- Tracks pipeline stages (`NEW`, `CONTACTED`, `CONSULTATION_SCHEDULED`, `PROPOSAL_SENT`, `CONVERTED`, `LOST`).
- 1-Click conversion of qualified leads into active weddings with an auto-generated digital agreement.

### 2. Digital Service Agreements
- Enforces proper legal digital execution with an **HTML5 interactive drawing canvas** (does not treat typed names as verified signatures).
- Binds signer legal name, signature PNG data URL, client IP address, user agent, and timestamp into an immutable audit trail.

### 3. "Multiple Vendor" – Quotation Comparison Matrix
- Example: 400-guest royal banquet catering RFP.
- Side-by-side comparison matrix evaluating:
  - **Price per plate** (with computed totals for 400 guests)
  - **Base production fees**
  - **Extra-hour charges**
  - **Menu depth and included items** (live stations, passed appetizers, butler staff)
- Planner flags recommendations (★), but the couple makes the final decision.
- Selecting the winning vendor **immediately awards the contract, links the vendor to the wedding, and automatically closes competing quotes** while preserving quotation history.

### 4. Instant Wedding Planning (25+ Auto-Generated Tasks)
- Automatically generates **25+ milestone tasks** upon booking deposit recording.
- Deadlines are dynamically calculated from the wedding date and lead times (`T-minus X days`).
- Tailored templates for **Full-Service Royal Weddings** (26 tasks) vs **Partial / Day-of Execution** (11 tasks).
- Idempotent generation logic prevents duplicate task creation upon regeneration.

### 5. Wedding-Day Live Timeline & Vendor Arrival Gate Radar
- Minute-by-minute day-of execution run-sheet (Baraat boat procession, Varmala, Pheras, Sangeet after-party).
- Real-time logging of vendor arrivals at loading docks with on-time vs delay categorization.
- Real-time **Socket.IO** synchronization across wedding team members.

### 6. Service Verification System
- Proactive operational check for critical services (e.g. *DJ scheduled at 7:00 PM*).
- Four explicit verification choices:
  - `Yes, completed.`
  - `Started but incomplete.`
  - `No, service not delivered.`
  - `Report an issue.`
- Issues escalate directly to agency admin and vendor for rebuttal notes and mutual sign-off before funds disbursement.

### 7. Financial Ledger & Post-Wedding Settlement
- Client milestone disbursements (25% booking advance, 50% production advance, 25% post-wedding settlement).
- Anti-duplicate payment recording with bank reference numbers (NEFT/RTGS).
- **Post-Wedding Settlement Calculator**: Reconciles actual plate counts against guarantees, extended vendor hours, and unexpected expenses to calculate the final net agency profit.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Framer Motion, Recharts, React Hook Form, Zod.
- **Backend**: Node.js, Express.js, TypeScript, Socket.IO, Zod validation, Helmet, CORS, CookieParser.
- **Database**: PostgreSQL, Prisma ORM, Neon Serverless PostgreSQL hosting support.
- **Authentication**: Custom JWT authentication, short-lived access tokens, refresh token rotation, bcrypt hashing (12 rounds), RBAC.
- **Deployment**: Next.js on Vercel, Express on Render, Database on Neon, Media on Cloudinary.

---

## 💻 Local Development Quickstart

### Prerequisites
- Node.js `v20+` or `v22+`
- `pnpm` `v10+`

### 1. Clone & Install
```bash
git clone https://github.com/shreyansh-hacker/grand-bandhan.git
cd grand-bandhan
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 3. Build Shared Packages & Start
```bash
# Build shared contracts and validation libraries
pnpm --filter @grand-bandhan/shared run build
pnpm --filter @grand-bandhan/validation run build

# Start both API (port 4000) and Web (port 3000) concurrently
pnpm dev
```

- **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 📖 Technical Documentation

- [Architecture & Data Isolation](docs/ARCHITECTURE.md)
- [REST API & Socket.IO Specification](docs/API_SPECIFICATION.md)
- [Production Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

---

## ⚖️ License
Grand Bandhan is crafted under the MIT License.
