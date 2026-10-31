# Grand Bandhan — Agency Registration, Onboarding & Multi-Tenant Governance

## 1. Overview & Architecture

Grand Bandhan is designed as a premier multi-tenant wedding operations platform. Each wedding planning agency operates within an isolated tenant partition with its own dedicated users, clients, vendor relationships, quotation comparisons, dynamic timelines, and payment milestone books.

To preserve the uncompromising luxury standards expected by high-net-worth couples and heritage venues, the platform enforces an **Agency Approval Lifecycle**. Independent wedding agencies cannot immediately begin transacting upon sign-up; their credentials, GSTIN, and business profiles are submitted for verification by the **Grand Bandhan Super Admin**.

---

## 2. Agency State Machine

```
                      ┌────────────────────────────┐
                      │    Agency Registration     │
                      │ (POST /api/agencies/reg)   │
                      └─────────────┬──────────────┘
                                    │
                                    ▼
                      ┌────────────────────────────┐
                      │      PENDING_APPROVAL      │
                      │  Admin account suspended   │
                      └─────────────┬──────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
             Super Admin                     Super Admin
              Approves                        Rejects
                    │                               │
                    ▼                               ▼
       ┌────────────────────────┐      ┌────────────────────────┐
       │        APPROVED        │      │        REJECTED        │
       │ Admin account active   │      │ Rejection reason logged│
       └────────────┬───────────┘      └────────────────────────┘
                    │
           Breach / Governance
                    │
                    ▼
       ┌────────────────────────┐
       │       SUSPENDED        │
       │ All agency users locked│
       └────────────────────────┘
```

### Agency Status Enum (`packages/shared/src/index.ts`)
```typescript
export enum AgencyStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}
```

### Account Status Enum
```typescript
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}
```

---

## 3. Database Schema (`packages/database/prisma/schema.prisma`)

```prisma
model Agency {
  id                  String            @id @default(uuid())
  name                String
  slug                String            @unique
  logoUrl             String?
  contactEmail        String
  contactPhone        String?
  ownerName           String?
  address             String?
  city                String?
  state               String?
  country             String?           @default("India")
  website             String?
  gstin               String?
  businessDescription String?
  rejectionReason     String?
  status              AgencyStatus      @default(APPROVED)
  approvedAt          DateTime?
  suspendedAt         DateTime?
  settings            Json?
  users               User[]
  weddings            Wedding[]
  enquiries           CustomerEnquiry[]
  proposals           WeddingProposal[]
  vendors             Vendor[]
  auditLogs           AuditLog[]
  emailLogs           EmailLog[]
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

model User {
  id                   String                @id @default(uuid())
  agencyId             String
  agency               Agency                @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  email                String                @unique
  passwordHash         String
  role                 UserRole              @default(CLIENT)
  name                 String
  phone                String?
  avatarUrl            String?
  isActive             Boolean               @default(true)
  accountStatus        AccountStatus         @default(ACTIVE)
  department           String?
  specialization       String?
  lastLoginAt          DateTime?
  emailVerified        Boolean               @default(false)
  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt
}
```

---

## 4. API Endpoints

### 4.1. Public Agency Registration
- **Route:** `POST /api/agencies/register`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "agencyName": "Rajputana Royal Weddings",
    "ownerName": "Vikramaditya Rathore",
    "email": "director@rajputanaweddings.com",
    "phone": "+91 98200 12345",
    "password": "RoyalSecretPassword@2026",
    "confirmPassword": "RoyalSecretPassword@2026",
    "address": "Suite 401, Heritage Towers, Lake Palace Road",
    "city": "Udaipur",
    "state": "Rajasthan",
    "country": "India",
    "website": "https://rajputanaweddings.com",
    "gstin": "08AAAAA0000A1Z5",
    "businessDescription": "Bespoke destination palatial celebrations across Udaipur & Jaipur."
  }
  ```
- **Execution Logic:**
  1. Validates inputs via `registerAgencySchema` (Zod).
  2. Generates unique agency slug (`slugify(agencyName)` with deduplication counter).
  3. Hashes password using salted `bcryptjs` (cost factor 10).
  4. Runs an **atomic Prisma transaction** creating the `Agency` (status: `PENDING_APPROVAL`) and initial `User` (role: `AGENCY_ADMIN`, accountStatus: `PENDING_APPROVAL`, isActive: `false`).
  5. Emits `NotificationEvent.AGENCY_REGISTERED` to the transactional email outbox (`EmailLog`).
  6. Returns HTTP 201 with `{ status: 'PENDING_APPROVAL', message: 'Registration submitted successfully...' }`.

### 4.2. Super Admin Agency Applications List
- **Route:** `GET /api/agencies/applications`
- **Auth:** Authenticated, Role `SUPER_ADMIN`
- **Query Params:** `status` (`PENDING_APPROVAL` | `APPROVED` | `REJECTED` | `SUSPENDED`), `page`, `limit`
- **Response:** Paginated list of agencies with their primary admin user details and wedding counts.

### 4.3. Super Admin Status Mutation
- **Route:** `PATCH /api/agencies/:id/status`
- **Auth:** Authenticated, Role `SUPER_ADMIN`
- **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "rejectionReason": null
  }
  ```
- **Execution Logic:**
  - If `status === APPROVED`: Sets `approvedAt = new Date()`, updates admin user `accountStatus = ACTIVE`, `isActive = true`. Emits `AGENCY_APPROVED` email notification.
  - If `status === REJECTED`: Logs `rejectionReason`. Emits `AGENCY_REJECTED` email notification.
  - If `status === SUSPENDED`: Sets `suspendedAt = new Date()`, cascades `accountStatus = SUSPENDED` and `isActive = false` to all users in that agency.

### 4.4. Agency Admin Self-Service Profile
- **Route:** `GET /api/agencies/me`
- **Auth:** Authenticated, Role `AGENCY_ADMIN` or `SUPER_ADMIN`
- **Response:** Agency profile, settings, and staff count.

- **Route:** `PATCH /api/agencies/me`
- **Auth:** Authenticated, Role `AGENCY_ADMIN`
- **Request Body:** `{ name?, contactPhone?, address?, city?, state?, website?, gstin?, businessDescription?, logoUrl? }`

---

## 5. Security & Authentication Guardrails

1. **Pending Agency Login Interception:**
   When an agency admin tries to log in at `POST /api/auth/login`:
   ```typescript
   if (user.role === UserRole.AGENCY_ADMIN) {
     if (user.agency.status === 'PENDING_APPROVAL') {
       res.status(403).json({
         success: false,
         status: 'PENDING_APPROVAL',
         message: 'Your agency application is under Super Admin review. You will receive an email once approved.',
       });
       return;
     }
     if (user.agency.status === 'SUSPENDED') {
       res.status(403).json({
         success: false,
         status: 'SUSPENDED',
         message: 'Agency operations are currently suspended. Please contact concierge support.',
       });
       return;
     }
   }
   ```
2. **Tenant Isolation:**
   All Prisma queries across enquiries, weddings, tasks, quotations, and verifications automatically enforce:
   `where: { agencyId: req.user.agencyId }`
   Unless the caller holds the `SUPER_ADMIN` role.
