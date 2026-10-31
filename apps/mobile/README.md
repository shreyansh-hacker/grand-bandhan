# Grand Bandhan — Native Mobile Application

The official native mobile application for **Grand Bandhan**, a luxury Wedding Planning & Operations Management Platform.

---

## 1. Non-Negotiable Architecture Requirements

- **100% Bare React Native CLI** (Version 0.76.5). **NO EXPO** (no Expo Go, no Expo Router, no Expo libraries).
- **TypeScript Strict Mode**: Fully typed across all models, navigators, components, stores, and API requests/responses.
- **Native Android Studio & Gradle**: AGP 8.6.0, Gradle 8.10.2, JDK 22 compatible, targeting Android API 36 / 34+.
- **Secure Hardware Keystore**: Session tokens stored with AES-256 hardware-backed encryption via `react-native-keychain` (no plaintext JWT storage or AsyncStorage).
- **Direct Cloud Integration**: Connects via HTTPS to the live Render backend (`https://grand-bandhan.onrender.com`), querying remote Neon PostgreSQL through REST APIs. Android never connects directly to Neon.

---

## 2. Technology Stack

| Layer | Library / Tool | Purpose |
|---|---|---|
| **Framework** | React Native 0.76.5 | Bare native Android mobile framework |
| **Navigation** | React Navigation 7.x | Native Stack & Bottom Tab navigators |
| **State Management** | Zustand 5.x | Client state, user profile, auth session |
| **Server State** | TanStack Query 5.x | Asynchronous query caching & background revalidation |
| **Forms & Validation** | React Hook Form 7.x + Zod 3.x | Type-safe form inputs and contract validation |
| **Networking** | Axios 1.7.x | HTTP client with Keystore Bearer auth interceptors |
| **Animations** | React Native Reanimated 3.16.x | Native performance 60FPS UI transitions |
| **Gestures** | React Native Gesture Handler 2.20.x | Native touch gesture recognition |
| **Graphics** | React Native SVG 15.8.x | Scalable vector graphics and badges |
| **Secure Storage** | React Native Keychain 8.2.x | Android Keystore cryptographic credential storage |

---

## 3. Imperial Luxury Design System

Curated for an opulent, royal wedding aesthetic:

- **Imperial Navy**: `#0A2540` (Primary brand foundation)
- **Imperial Navy Dark**: `#06182B` (Header and status surfaces)
- **Secondary Blue**: `#1E3A8A` (Interactive accents)
- **Imperial Gold**: `#C9A96A` (Primary CTA and prestige highlights)
- **Light Gold**: `#E6D6B8` (Subtle borders & badges)
- **Cream Warm**: `#F7F4ED` / `#F3EFE6` (Background surfaces)
- **Charcoal Text**: `#1F2937` (High-contrast typography)

---

## 4. Six Distinct User Roles & Navigation

The mobile application strictly separates all six roles with dedicated navigation tabs and permissions:

1. **Super Admin (`SUPER_ADMIN`)**: System-wide operations, agency oversight, platform transaction volume, and live Neon PostgreSQL health monitor.
2. **Agency Admin (`AGENCY_ADMIN`)**: Agency lead pipeline, wedding assignments, planner staff performance tracking.
3. **Wedding Planner (`WEDDING_PLANNER`)**: Assigned wedding operations, task lead times, quotation vendor comparisons, event agendas.
4. **On-ground Coordinator (`COORDINATOR`)**: Live event run sheet, vendor arrival timeline check-in, real-time service verification audits.
5. **Vendor Partner (`VENDOR`)**: RFP quotation invitations, scheduled arrival setup windows, milestone payout tracking.
6. **Royal Couple / Client (`CLIENT`)**: Celebration countdown, wedding details, vendor proposal approvals, digital milestone payments.

---

## 5. Directory Structure

```
apps/mobile/
├── android/               # Native Android Gradle project (AGP 8.6, Gradle 8.10.2)
├── ios/                   # Native iOS project structure
├── src/
│   ├── api/               # Axios client, endpoints registry, auth & health services
│   ├── components/        # ImperialButton, ImperialCard, ImperialBadge, ImperialInput, LoadingSkeleton, EmptyState, ErrorView, ImperialHeader
│   ├── navigation/        # RootNavigator, AuthNavigator, 6 role tab navigators
│   ├── screens/
│   │   ├── admin/         # Super Admin screens & health monitors
│   │   ├── agency/        # Agency Admin pipeline screens
│   │   ├── auth/          # LoginScreen with Zod validation & role autofill
│   │   ├── client/        # Client & Couple wedding portal
│   │   ├── common/        # ProfileScreen, ApiHealthScreen
│   │   ├── coordinator/   # Coordinator live field operations
│   │   ├── planner/       # Wedding Planner desk
│   │   └── vendor/        # Vendor partner screens
│   ├── store/             # Zustand authStore with 401 session expiry auto-clearing
│   ├── theme/             # Colors, typography, spacing, shadows
│   ├── types/             # Strictly typed navigation params & shared model re-exports
│   └── utils/             # Android Keystore storage & Indian Rupee currency formatters
├── App.tsx                # App root provider container
├── metro.config.js        # Monorepo-aware Metro bundler configuration
└── package.json           # Mutually compatible dependencies
```

---

## 6. How to Build & Run on Android

### Prerequisites
- JDK 17 or JDK 22
- Android SDK with Build Tools 34.0.0+ and Platform 34+
- Android Device or Emulator connected via `adb`

### Steps
1. Install dependencies at monorepo root:
   ```bash
   pnpm install
   ```
2. Build Android Debug APK:
   ```bash
   cd apps/mobile/android
   ./gradlew assembleDebug
   ```
3. Install and Launch on connected Android device:
   ```bash
   adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
   adb shell am start -n com.grandbandhan.mobile/.MainActivity
   ```
4. Start Metro bundler:
   ```bash
   cd apps/mobile
   adb reverse tcp:8081 tcp:8081
   pnpm start
   ```
