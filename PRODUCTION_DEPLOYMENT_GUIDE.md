# Grand Bandhan — Production Deployment & Release Guide

**Version**: 1.0  
**Generated**: 2026-11-01  
**Target Architecture**: Production Monorepo (Next.js Web + Express API + Neon PostgreSQL + Bare React Native Android)  
**Git Repository**: [https://github.com/shreyansh-hacker/grand-bandhan](https://github.com/shreyansh-hacker/grand-bandhan)

---

## 1. Official Production Endpoints

| Service | Platform / Host | Production URL | Status |
| :--- | :--- | :--- | :--- |
| **Web Application** | Vercel | [https://grand-bandhan-theta.vercel.app/](https://grand-bandhan-theta.vercel.app/) | **LIVE (200 OK)** |
| **Backend API & WebSockets** | Render | [https://grand-bandhan.onrender.com](https://grand-bandhan.onrender.com) | **LIVE (200 OK)** |
| **Primary Database** | Neon PostgreSQL | `ep-summer-mode-a1kenfdw` (ap-southeast-1 AWS) | **HEALTHY** |
| **Neon Console** | Neon Cloud | [https://console.neon.tech/](https://console.neon.tech/) | **MANAGED** |
| **GitHub Repository** | GitHub | [https://github.com/shreyansh-hacker/grand-bandhan](https://github.com/shreyansh-hacker/grand-bandhan) | **MAIN BRANCH** |

---

## 2. Complete Application Synchronization

Both Mobile and Web frontends are synchronized with the unified Render backend and Neon PostgreSQL database. Neither frontend maintains isolated business databases or uncoordinated mock stores.

### 2.1 Mobile Application (`apps/mobile`)
* **API Base URL**: `https://grand-bandhan.onrender.com` (configured in `apps/mobile/src/api/endpoints.ts`).
* **Authentication**: JWT access token stored in Android Keystore via `@react-native-keychain`. Automatic 401 interceptor clears session on token expiration.
* **Socket.IO Real-time Connection**: Connects to `https://grand-bandhan.onrender.com` on app launch; receives live updates for service verifications, enquiry updates, and notifications.
* **Notification Subsystem**:
  * Native Kotlin module (`AlarmManager` + `BroadcastReceiver` + `NotificationManagerCompat`).
  * Backend schedule reconciliation via `GET /api/notifications/schedules` triggers local heads-up notifications.
  * Central In-App Inbox (`NotificationInboxScreen.tsx`) synchronizes read/unread badges with the server.
* **Offline Resilience**:
  * Local read-only caching in `offlineCache.ts` enables dashboard viewing when disconnected.
  * Security purge: All cached records and scheduled alarms are wiped upon logout.

### 2.2 Web Application (`apps/web`)
* **API Base URL**: `process.env.NEXT_PUBLIC_API_URL` (points to `https://grand-bandhan.onrender.com` in production).
* **Socket.IO Real-time Connection**: Configured via `NEXT_PUBLIC_SOCKET_URL`.
* **Central Notification Inbox**: Accessible at `/dashboard/notifications`, reflecting real-time unread counts in navbar and sidebar.
* **Admin Command Center**: Accessible at `/dashboard/command-center` for high-level multi-agency visibility.

### 2.3 Backend API (`apps/api`)
* **Deployment**: Render Web Service (`grand-bandhan-api`).
* **Database Driver**: `@prisma/client` with pooled and direct connection strings.
* **Multi-Tenant Security**: Strict agency-level isolation (`WHERE agencyId = req.user.agencyId`) enforced on all wedding, enquiry, task, and financial queries. Super Admin maintains platform-wide governance.
* **Background Verification Scheduler**: 60-second cron loop (`apps/api/src/modules/verifications/verification.scheduler.ts`) with a 15-minute duplicate throttle and 30-minute escalation alert pipeline.

---

## 3. Database Architecture & Neon PostgreSQL Configuration

### 3.1 Connection String Separation
Neon PostgreSQL requires distinct connection endpoints for optimal concurrency and migration stability:

1. **Application Connection (Pooled)**:
   * **Environment Variable**: `DATABASE_URL`
   * **Host**: `ep-summer-mode-a1kenfdw-pooler.ap-southeast-1.aws.neon.tech`
   * **Port**: `5432`
   * **Parameters**: `?sslmode=require&channel_binding=require`
   * **Purpose**: Used by the Express API runtime for high-throughput connection pooling via Neon PgBouncer.
2. **Migration & DDL Connection (Unpooled / Direct)**:
   * **Environment Variable**: `DATABASE_URL_UNPOOLED`
   * **Host**: `ep-summer-mode-a1kenfdw.ap-southeast-1.aws.neon.tech`
   * **Port**: `5432`
   * **Parameters**: `?sslmode=require&channel_binding=require`
   * **Purpose**: Used by Prisma CLI for migrations (`prisma migrate deploy`, `prisma migrate status`) and DDL transactions that require direct schema locking.

### 3.2 Migration & Baselining Procedures

To maintain production database integrity without data loss:

* **Check Migration Status**:
  ```bash
  npx prisma migrate status --schema=packages/database/prisma/schema.prisma
  ```
* **Apply Migrations in Production (CI/CD / Render)**:
  ```bash
  npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma
  ```
* **Baseline Existing Schema**:
  ```bash
  npx prisma migrate resolve --applied 0_init --schema=packages/database/prisma/schema.prisma
  ```
* **Regenerate Prisma Client**:
  ```bash
  pnpm --filter @grand-bandhan/database run prisma:generate
  ```

> [!CAUTION]
> Never execute `prisma db push --force-reset` or `prisma migrate reset` against the production database.

---

## 4. Android Build, Release & Packaging Management

### 4.1 Native Android Specifications
* **Package / Application ID**: `com.grandbandhan.mobile`
* **Version Code**: `1`
* **Version Name**: `1.0`
* **Compile SDK**: `35`
* **Target SDK**: `34`
* **Minimum SDK**: `24` (Android 7.0+)
* **JS Engine**: Hermes Bytecode Enabled (`hermesEnabled=true`)
* **New Architecture**: Disabled (`newArchEnabled=false`)
* **Architectures**: `arm64-v8a`, `x86_64`

### 4.2 Verified Build Artifacts

| Artifact | Build Command | Output Path | File Size | JS Bundle Packaging |
| :--- | :--- | :--- | :--- | :--- |
| **Debug APK** | `cd apps/mobile/android && ./gradlew assembleDebug` | `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk` | **117.00 MB** (122,683,729 bytes) | Metro Dev Server Bridge |
| **Release APK** | `cd apps/mobile/android && ./gradlew assembleRelease` | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` | **52.36 MB** (54,901,432 bytes) | **Standalone Embedded Hermes Bytecode** (`assets/index.android.bundle`, 2.50 MB, Header `c61fbc03`) |
| **Production AAB** | `cd apps/mobile/android && ./gradlew bundleRelease` | `apps/mobile/android/app/build/outputs/bundle/release/app-release.aab` | **22.79 MB** (23,901,428 bytes) | **Standalone Embedded Hermes Bytecode** (`base/assets/index.android.bundle`, 2.50 MB) |

### 4.3 Standalone Physical Device Launch Verification
The Release APK (`app-release.apk`) was installed and tested on a physical **Samsung Galaxy A14 5G (`SM-A146B`)** running **Android 15**:

* **Installation Status**: Streamed install via ADB succeeded.
* **Launch State**: `COLD` start completed in **386 ms**.
* **Metro Dependency**: Zero. The app started without Metro dev server running.
* **Logcat Verification**:
  ```
  ReactNativeJS: Running "GrandBandhan"
  ReactNative: [GESTURE HANDLER] Initialize gesture handler for root view
  ```
* **"Unable to load script" Prevention**:
  The React Native Gradle Plugin automatically compiles the JS bundle during `createBundleReleaseJsAndAssets` and packages Hermes bytecode into `assets/index.android.bundle`. ProGuard rules in `apps/mobile/android/app/proguard-rules.pro` preserve Hermes and native reflection classes.

---

## 5. Deployment Configurations (Render & Vercel)

### 5.1 Render Backend Configuration (`render.yaml`)
* **Service Name**: `grand-bandhan-api`
* **Service Type**: Web Service (Node.js)
* **Region**: Oregon
* **Build Command**: `pnpm install && pnpm run build:api`
* **Start Command**: `pnpm run start:api` (`node apps/api/dist/server.js`)
* **Health Check Path**: `/health`
* **Auto-Deploy**: Enabled on `main` branch push.

#### Required Environment Variables on Render
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<Neon_Pooled_Connection_String>
DATABASE_URL_UNPOOLED=<Neon_Direct_Connection_String>
NEON_BRANCH=production
FRONTEND_URL=https://grand-bandhan-theta.vercel.app
API_URL=https://grand-bandhan.onrender.com
JWT_ACCESS_SECRET=<Cryptographically_Secure_Random_String>
JWT_REFRESH_SECRET=<Cryptographically_Secure_Random_String>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RESEND_API_KEY=<Resend_API_Key>
EMAIL_FROM=Grand Bandhan <notifications@grandbandhan.com>
```

### 5.2 Vercel Frontend Configuration (`apps/web/vercel.json`)
* **Framework**: Next.js
* **Root Directory**: `apps/web` (monorepo root with `pnpm --filter @grand-bandhan/web`)
* **Build Command**: `pnpm run build:web`
* **Output Directory**: `.next`

#### Required Environment Variables on Vercel
```env
NEXT_PUBLIC_API_URL=https://grand-bandhan.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://grand-bandhan.onrender.com
```

---

## 6. End-to-End Acceptance Test Results

Automated verification was executed against the live Neon PostgreSQL database:

### Suite 1: Core Platform E2E (`scripts/test-core-product-e2e.ts`)
* **Result**: **34 PASSED, 0 FAILED**
* **Workflows Verified**:
  1. Agency registration and Super Admin approval.
  2. Public enquiry creation and reference code tracking.
  3. Planner consultation scheduling and proposal revisions.
  4. Enquiry-to-Wedding conversion with 26 automated tasks and 3 payment milestones.
  5. Digital legal agreement e-signing with audit IP logging.
  6. Vendor RFP, quotation comparison matrix, and awarded contract lock-in.
  7. Day-of event operations, timeline checkpoints, and service verification ledger.
  8. Milestone invoice payments and ledger balances.
  9. Post-wedding financial settlement and net agency profit (P&L) calculation.
  10. Multi-tenant data isolation: Agency B strictly cannot access Agency A records.

### Suite 2: Hybrid Notification System (`scripts/test-notification-system.ts`)
* **Result**: **16 PASSED, 0 FAILED**
* **Workflows Verified**:
  1. Central Notification model creation and persistence in Neon DB.
  2. Paginated fetching, category filtering, unread counting.
  3. Single notification mark-as-read and bulk mark-all-read.
  4. User notification preferences persistence.
  5. Schedule synchronization engine for upcoming verifications and task deadlines.
  6. Admin Command Center real-time aggregation queries.
  7. Offline cache and alarm purge simulation upon user logout.

---

## 7. Troubleshooting & Operational Notes

### 7.1 Samsung Modes & Routines (Sleep Mode)
* **Symptom**: `am start` reports `Activity: android/com.android.internal.app.SuspendedAppActivity`.
* **Cause**: Samsung One UI "Sleep Mode" automatically suspends newly installed apps during designated sleep hours (e.g. 10 PM – 7 AM).
* **Resolution**: The app is automatically unsuspended once the user wakes their phone or turns off Sleep Mode. Alternatively, test on a secondary Android profile (e.g., `user 95`) or add Grand Bandhan to the Sleep Mode allowed app list in device settings.

### 7.2 Render Free Tier Cold Spins
* **Behavior**: Render free instances spin down after 15 minutes of inactivity. The initial wake-up HTTP request may take 30–50 seconds.
* **Mitigation**: The background verification scheduler automatically runs a recovery sweep (`setTimeout(..., 5000)`) upon instance restart to claim any pending verifications missed during spin-down.

### 7.3 Android 12–15 Exact Alarm Permission
* **Behavior**: Google Play restricts `SCHEDULE_EXACT_ALARM` unless strictly classified as an alarm/clock app.
* **Implementation**: Grand Bandhan uses a dual-path check:
  ```kotlin
  if (alarmManager.canScheduleExactAlarms()) {
      alarmManager.setExactAndAllowWhileIdle(...)
  } else {
      alarmManager.setAndAllowWhileIdle(...)
  }
  ```
  This guarantees zero crashes and ensures notifications fire reliably across all OEM battery profiles.
