# Grand Bandhan — Profile & Account Management Specification

## 1. Overview & Multi-Role Architecture

Grand Bandhan provides personalized profile management, credential security, and notification preference controls across all **6 system roles**:

| Role | Operational Scope & Capabilities |
| :--- | :--- |
| **`SUPER_ADMIN`** | Platform oversight, multi-tenant agency approval, system email outbox monitoring, Neon database health. |
| **`AGENCY_ADMIN`** | Agency profile configuration, staff assignment, revenue reports, multi-wedding operations. |
| **`WEDDING_PLANNER`** | Client relationship management, 25+ automated task generation, 3-vendor RFP comparison tables. |
| **`COORDINATOR`** | On-ground day-of execution, vendor arrival logging, real-time schedule adjustments, QR verifications. |
| **`VENDOR`** | Quotation submission, milestone deliverable confirmations, payment reconciliation, settlement audits. |
| **`CLIENT`** | Dedicated couple portal, proposal acceptance, digital agreement signing, milestone payment tracking. |

---

## 2. Data Models (`packages/database/prisma/schema.prisma`)

### User Account Attributes
```prisma
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
  notificationPreference NotificationPreference?
  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt
}

model NotificationPreference {
  id                  String   @id @default(uuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactionalEmails Boolean  @default(true)
  weddingUpdates      Boolean  @default(true)
  paymentAlerts       Boolean  @default(true)
  taskAlerts          Boolean  @default(true)
  marketingEmails     Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

---

## 3. Profile Management API Endpoints

All profile endpoints are mounted under `/api/profile` and require standard JWT bearer authentication (`authenticate` middleware).

### 3.1. Fetch User Profile
- **Route:** `GET /api/profile/me`
- **Auth:** Any authenticated user
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "usr_9423fa8c-...",
      "name": "Aanya Singhania",
      "email": "planner@grandbandhan.com",
      "role": "WEDDING_PLANNER",
      "phone": "+91 98200 00002",
      "department": "Operations",
      "specialization": "Destination Heritage Palaces",
      "accountStatus": "ACTIVE",
      "agency": {
        "id": "agency_1001",
        "name": "Grand Bandhan Imperial Weddings",
        "slug": "grand-bandhan-imperial",
        "status": "APPROVED"
      }
    }
  }
  ```

### 3.2. Update Profile Information
- **Route:** `PATCH /api/profile/me`
- **Auth:** Any authenticated user
- **Validation Schema:** `updateProfileSchema`
- **Request Body:**
  ```json
  {
    "name": "Aanya Singhania-Kapoor",
    "phone": "+91 98200 99999",
    "department": "Senior Luxury Operations",
    "specialization": "Lake Palaces & Fortresses",
    "avatarUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
  }
  ```
- **Response:** Updated user record sanitized of password hashes.

### 3.3. Change Account Password
- **Route:** `POST /api/profile/change-password`
- **Auth:** Any authenticated user
- **Validation Schema:** `changePasswordSchema`
  - Current password required.
  - New password minimum 8 characters.
  - Password and confirmPassword must match.
- **Request Body:**
  ```json
  {
    "currentPassword": "CurrentPassword@2025",
    "newPassword": "NewRoyalPassword@2026",
    "confirmPassword": "NewRoyalPassword@2026"
  }
  ```
- **Execution Logic:**
  1. Compares `currentPassword` against `user.passwordHash` using `bcrypt.compare`.
  2. Generates new salt and hash with `bcrypt.hash(newPassword, 10)`.
  3. Increments `tokenVersion` to invalidate active refresh tokens on other devices.
  4. Emits `PASSWORD_CHANGED` transactional email via Resend to the user's registered address.

### 3.4. Get & Update Email Preferences
- **Route:** `GET /api/profile/preferences`
  - Returns boolean toggles for each notification category.
- **Route:** `PATCH /api/profile/preferences`
  - **Request Body:**
    ```json
    {
      "transactionalEmails": true,
      "weddingUpdates": true,
      "paymentAlerts": true,
      "taskAlerts": true,
      "marketingEmails": false
    }
    ```
  - **Execution Logic:** Performs an atomic Prisma `upsert` on the `NotificationPreference` model linked by `userId`.

---

## 4. Web User Interface (`apps/web/src/app/dashboard/profile/page.tsx`)

The dashboard features an integrated Profile & Security control panel:
- **Identity & Agency Header:** Displays role badge, account persistence status, and agency association.
- **Profile Details Card:** Live form to update legal name, phone, department, and operational focus.
- **Password Security Card:** Secure self-service password update with immediate feedback.
- **Notification Preference Matrix:** Direct toggle controls for 5 email categories linked to Resend transactional outbox.
- **Sidebar Integration:** Permanent shortcut in `DashboardSidebar` and interactive user pill in `DashboardNavbar`.
