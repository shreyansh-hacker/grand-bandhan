# Grand Bandhan — Notification Architecture Report & Technical Evaluation

**Date**: 2026-11-01  
**Target Environment**: Production (Bare React Native CLI 0.76.5, Android SDK 34/35, Render API, Neon PostgreSQL, Socket.IO)  
**Author**: Antigravity Engineering  

---

## 1. Executive Summary & Objective

The objective of this milestone is to establish a **high-reliability, cost-effective, and independent notification architecture** for Grand Bandhan, eliminating mandatory external dependencies on Firebase Cloud Messaging (FCM) while retaining forward compatibility for optional remote push integration.

This report evaluates Firebase alternatives, details Android OS restrictions (Android 13–15), and presents the technical blueprint for the **Grand Bandhan Hybrid Notification Architecture**.

---

## 2. Phase 1 — Technical Inspection of Firebase Alternatives

We evaluated five candidate approaches for delivering notifications on Bare React Native CLI `0.76.5` with Android Target SDK 34 and Compile SDK 35:

| Architecture Candidate | RN 0.76+ Compatibility | Android 14/15 Support | External Cost | Offline Reliability | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`@notifee/react-native`** | ⚠️ **Broken / Deprecated** | Unstable (Invertase halted maintenance) | Free | Medium | **REJECTED**: No longer actively maintained by Invertase; incompatible with RN 0.76 New Architecture and Gradle 8.10. |
| **`react-native-push-notification`** | ❌ **Abandoned** | Broken (API level 30 max) | Free | Low | **REJECTED**: Abandoned repository; fails to compile on modern Android toolchains. |
| **Expo Notifications (`expo-notifications`)** | N/A | High | Free | High | **REJECTED**: Strictly disallowed by project constraints ("Do not use Expo"). |
| **Firebase Cloud Messaging (FCM standalone)** | High | High | Free (Tier limits/complexity) | Fails offline | **GATED**: Requires active Google Services credentials and internet connectivity. |
| **Grand Bandhan Native Android Module + AlarmManager (Recommended)** | 🟢 **100% Native & Clean** | Full SDK 34/35 support | **$0 / Zero** | **High (Local)** | **RECOMMENDED**: Direct Kotlin module leveraging Android platform APIs (`NotificationManagerCompat`, `AlarmManager`, `BroadcastReceiver`). |

### Why Notifee is Incompatible
`@notifee/react-native` was officially deprecated and archived by Invertase. In React Native 0.76 (which utilizes CMake 3.22+, Kotlin 1.9+, and New Architecture C++ codegen), Notifee introduces build breaks, duplicate JNI symbols, and runtime permission crashes on Android 14 (API 34) due to unresolved `POST_NOTIFICATIONS` and `SCHEDULE_EXACT_ALARM` requirements.

### Why a Custom Native Android Module is the Superior Path
Building a dedicated Kotlin module (`GrandBandhanNotificationModule`) directly inside `apps/mobile/android/app/src/main/java/com/grandbandhan/mobile/` provides:
1. **Zero External Dependencies**: Eliminates third-party deprecation risks and build instability.
2. **First-Party Android Platform APIs**:
   - `NotificationChannel` with custom royal gold accents and high-importance sound.
   - `AlarmManager.setExactAndAllowWhileIdle()` to wake the device from Android Doze mode.
   - `NotificationAlarmReceiver` to build and present the notification when the alarm fires.
   - `BootReceiver` (`RECEIVE_BOOT_COMPLETED`) to automatically re-register scheduled alarms upon device reboot.
   - `SharedPreferences` persistent schedule store so scheduled alarms survive app termination.
3. **Deep Link Intents**: Tapping a notification opens the app directly to the relevant wedding or service verification screen.

---

## 3. Comparative Architecture Analysis

| Evaluation Dimension | 1. Local Notifications Only | 2. Remote FCM Only | 3. Hybrid Architecture (Recommended) |
| :--- | :--- | :--- | :--- |
| **Cost** | **$0** (Zero third-party infrastructure). | Free tier, but requires Google Cloud project management and token refresh sync. | **$0** (Local + Socket.IO + Neon DB; FCM optional). |
| **Foreground Reliability** | Requires polling or timers. | High (via FCM data message). | **100% Instant** via Socket.IO WebSocket. |
| **Background / Terminated Reliability** | **High** for pre-scheduled events (ceremony timelines, verifications). Fails on unexpected real-time events. | **High** for unexpected events, but delayed by Android Doze and network loss. | **Highest Resilience**: Pre-scheduled events fire locally even offline; unexpected events delivered when connected. |
| **Offline Operation** | **Works without internet** once scheduled. | **Fails completely** without active cellular/Wi-Fi. | **Works offline** for all scheduled milestones and timeline checkpoints. |
| **Android Battery / Doze Restrictions** | Subject to `AlarmManager` wake locks and exact alarm quota. | Subject to FCM High-Priority quota (Doze throttling). | Balances both: exact alarms for time-critical milestones, Socket.IO when awake. |
| **Required Permissions** | `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`. | `POST_NOTIFICATIONS`, `INTERNET`. | `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `INTERNET`. |
| **Maintenance Complexity** | Low (Internal native Kotlin code). | Medium (Google Services Gradle plugin, service account keys). | Low to Medium (Clean separation of concerns). |

---

## 4. Android Operating System Restrictions & Permissions

### 4.1 Android 13+ (API 33) Runtime Permission
* Android 13 introduced `android.permission.POST_NOTIFICATIONS`.
* Our native module checks `NotificationManagerCompat.from(context).areNotificationsEnabled()`. If disabled, it triggers the native permission prompt or directs the user to app notification settings.

### 4.2 Android 12+ (API 31) and Android 14+ (API 34) Exact Alarms
* Google restricted `SCHEDULE_EXACT_ALARM` to prevent battery drain.
* The module verifies `alarmManager.canScheduleExactAlarms()`:
  * If granted: Uses `alarmManager.setExactAndAllowWhileIdle()`.
  * If restricted: Falls back gracefully to `alarmManager.setAndAllowWhileIdle()` to avoid OS security exceptions.

### 4.3 Doze Mode & OEM Battery Optimization Disclaimer
* Even with `setExactAndAllowWhileIdle()`, extreme battery-saving profiles on specific manufacturer skins (Xiaomi MIUI, Samsung OneUI, OnePlus OxygenOS) may batch alarms by 1–5 minutes.
* This is an Android OS hardware constraint and is transparently documented for production operations.

---

## 5. Architectural Blueprint for Implementation

```
   ┌──────────────────────────────────────────────────────────────┐
   │                    Grand Bandhan Backend                     │
   │           (Express API on Render + Neon PostgreSQL)           │
   └───────────────┬───────────────────────────────┬──────────────┘
                   │                               │
       Socket.IO Real-Time              REST Schedule Sync API
      (Foreground Delivery)             (/api/notifications/schedules)
                   │                               │
                   ▼                               ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                 Grand Bandhan Mobile Client                  │
   │               (Bare React Native CLI 0.76.5)                 │
   │                                                              │
   │  ┌──────────────────────┐        ┌─────────────────────────┐ │
   │  │  useNotificationStore│◄───────┤    Offline Cache Layer  │ │
   │  │   (Central Inbox)    │        │  (AsyncStorage / JSON)  │ │
   │  └──────────┬───────────┘        └─────────────────────────┘ │
   │             │                                 ▲              │
   │             ▼                                 │              │
   │  ┌────────────────────────────────────────────┴───────────┐  │
   │  │       Native Kotlin Bridge Module                      │  │
   │  │       (GrandBandhanNotificationModule.kt)              │  │
   │  └──────────┬─────────────────────────┬───────────────────┘  │
   └─────────────┼─────────────────────────┼──────────────────────┘
                 ▼                         ▼
   ┌───────────────────────────┐ ┌────────────────────────────────┐
   │  Android Notification     │ │   Android AlarmManager         │
   │  Channels & System Tray   │ │   + BootReceiver (Reboot Sync) │
   └───────────────────────────┘ └────────────────────────────────┘
```

### 5.1 Sub-System Plan

1. **Native Android Subsystem**:
   - `NotificationHelper.kt`: Creates high-priority notification channels with royal gold branding and vibration patterns.
   - `NotificationAlarmReceiver.kt`: Listens to alarm intents, extracts metadata, builds `NotificationCompat.Builder`, and posts to tray.
   - `BootReceiver.kt`: Intercepts `BOOT_COMPLETED`, parses stored schedules from `SharedPreferences`, and re-arms `AlarmManager`.
   - `GrandBandhanNotificationModule.kt`: Exposes `@ReactMethod` bindings (`scheduleNotification`, `cancelNotification`, `syncSchedules`, `checkPermissions`).
   - `GrandBandhanPackage.kt`: Registers the native module in `MainApplication.kt`.

2. **Backend Central Notification Inbox & Schedules Sync**:
   - Add `Notification` model to Prisma schema for full in-app inbox persistence.
   - Add endpoints:
     - `GET /api/notifications` (inbox with category filter & pagination).
     - `PATCH /api/notifications/:id/read`.
     - `POST /api/notifications/mark-all-read`.
     - `GET /api/notifications/schedules` (returns active verification deadlines and ceremony milestones for device local scheduling).
     - `GET /api/analytics/command-center` (aggregated operational overview for administrators).

3. **Mobile Client Integration**:
   - Central Notification Inbox screen with category filters, unread badge, and direct deep-linking.
   - Smart Schedule Synchronization service reconciling local device alarms with the Neon backend.
   - Offline Cache Layer storing read-only wedding data, tasks, timelines, and contacts with a prominent "Cached Mode" indicator.

---

## 6. Verification & Rollout Plan

- [x] Phase 1: Investigation & compatibility evaluation complete.
- [ ] Phase 2: Implement Native Android Notification Module & AlarmManager.
- [ ] Phase 3: Implement Smart Schedule Sync on device connection.
- [ ] Phase 4: Implement Central Notification Inbox (Backend + Mobile UI).
- [ ] Phase 5: Implement Admin Command Center API & Screen.
- [ ] Phase 6: Implement Read-Only Offline Cache Layer with visual indicators.
- [ ] Phase 7: Execute lifecycle testing (Foreground, Background, Terminated, Reboot).
- [ ] Phase 8: Final Report sign-off.
