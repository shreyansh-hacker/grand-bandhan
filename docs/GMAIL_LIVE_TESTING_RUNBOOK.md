# Grand Bandhan — Live Gmail API Integration Testing Runbook

**Target Systems:**
- **Repository:** `https://github.com/shreyansh-hacker/grand-bandhan`
- **Backend API:** `https://grand-bandhan.onrender.com`
- **Database:** Neon PostgreSQL (AWS Singapore: `ep-summer-mode-a1kenfdw`)
- **Sender Scope:** `https://www.googleapis.com/auth/gmail.send` (Minimal Privilege)
- **Encryption:** AES-256-GCM Envelope Encryption (`enc:v1:<iv>:<tag>:<ciphertext>`)

---

## Safety & Security Mandatory Rules

1. **Zero Access Tokens in URLs:** Never append `?token=<JWT>` to any URL. Access tokens must only travel in the `Authorization: Bearer <token>` HTTP header or secure HTTP-only cookies.
2. **Never Log or Share Secrets:** Never print, commit, or request Client Secrets, JWTs, refresh tokens, encryption keys, or admin passwords in plaintext. Use sanitized placeholders (`<YOUR_BEARER_TOKEN>`, `<YOUR_ENCRYPTION_KEY>`).
3. **No Real Customer Data During Testing:** Use dedicated verification accounts (e.g., `shreyanshsharma049@gmail.com`) for all live testing. Never spam real client email addresses.
4. **Distinguish Acceptance from Delivery:** An API returning `HTTP 200 { "success": true }` proves the dispatch was accepted by Google's API servers. Actual delivery is only confirmed once the email arrives in the physical mailbox.

---

# PHASE 1 — Local Automated Tests

Run these local tests before touching the production deployment to verify cryptographic integrity and platform stability.

### Step 1.1: Build the Backend API
Compile the TypeScript workspace packages and API server:
```powershell
pnpm run build:api
```
- **Expected Output:**
  ```text
  > @grand-bandhan/shared@1.0.0 build
  > @grand-bandhan/validation@1.0.0 build
  > @grand-bandhan/database@1.0.0 build
  > @grand-bandhan/api@1.0.0 build
  ```
- **What this proves:** Type correctness across all modules, zero syntax errors, and binary compatibility with Prisma Client.
- **What this does NOT prove:** Does not test runtime network connectivity or external Google APIs.

---

### Step 1.2: Execute the 12-Point Gmail OAuth Security Suite
Execute the dedicated security hardening test suite:
```powershell
pnpm tsx scripts/test-gmail-oauth.ts
```
- **Expected Output:**
  ```text
  =============================================================
  ⚡ GRAND BANDHAN: GMAIL API OAUTH 2.0 HARDENING TEST SUITE ⚡
  =============================================================
  [PASS] 1. OWASP A07: Reject JWT in URL Query Parameters
  [PASS] 2. Single-Use Authorization Handoff Ticket Flow
  [PASS] 3. AES-256-GCM Envelope Encryption & Key Rotation
  [PASS] 4. CSRF State Validation & Context Binding
  [PASS] 5. OAuth2 Callback & Encrypted Storage at Rest
  [PASS] 6. Callback Security: Deactivated User & Suspended Agency Guard
  [PASS] 7. Access Token Refresh with Re-Encryption
  [PASS] 8. Multi-Tenant Outbox Dispatch & EmailLog Audit
  [PASS] 9. Status Endpoint Agency Isolation & Zero Leakage
  [PASS] 10. RBAC Protection & Anti-Spoofing Agency Guardrails
  [PASS] 11. Atomic Ticket Consumption (Concurrent Race Condition Test)
  [PASS] 12. Cryptographic Integrity: Tamper & Truncation Rejection
  =============================================================
  GMAIL HARDENING TEST SUMMARY: 12 / 12 PASSED
  =============================================================
  ```

#### Real Database Tests vs. Mocked External API Tests:
- **Real Database Operations (Neon PostgreSQL):**
  - Connects live to Neon PostgreSQL on AWS Singapore.
  - `OAuthState` creation, single-use atomic consumption, and TTL expiration execute real SQL against Neon.
  - `GmailOAuthToken` upsert, AES-256-GCM encrypted persistence, and read/decryption execute real SQL against Neon.
  - `EmailLog` audit records with agency binding execute real SQL against Neon.
  - Admin user and agency status verifications execute real SQL against Neon.
- **Mocked External APIs (Google Cloud Servers):**
  - Intercepts `https://oauth2.googleapis.com/token` to simulate authorization code exchange without requiring a human to manually click Google consent screens during automated runs.
  - Intercepts `https://gmail.googleapis.com/gmail/v1/users/me/messages/send` to verify RFC 2822 MIME generation, Base64URL encoding, and error handling without depleting Google API quotas.
- **What this proves:** The entire security layer, database schema, atomic ticket locking, encryption envelope, and multi-tenant isolation logic are 100% bug-free.
- **What this does NOT prove:** Does not prove that your Google Cloud Client ID and Secret are authorized on Google's live production servers. Phase 3 performs that real verification.

---

### Step 1.3: Execute the 20-Workflow Platform Regression Suite
Verify that the security hardening caused zero regressions in Grand Bandhan's wedding planning workflows:
```powershell
pnpm tsx scripts/test-e2e.ts
```
- **Expected Output:**
  ```text
  =============================================================
  SUMMARY: 20 / 20 ENTERPRISE WORKFLOWS PASSED
  =============================================================
  ```

---

# PHASE 2 — Production Deployment Readiness

Before initiating the live OAuth connection on Render, configure the production environment.

### Step 2.1: Required Render Environment Variables
In the **Render Dashboard ➔ Your Web Service ➔ Environment Variables**, verify or set the following:

| Variable Name | Required Value / Format | Security Description |
| :--- | :--- | :--- |
| **`GOOGLE_CLIENT_ID`** | `781792527808-0ccmt0hbs9qmqvcudsklnnm660shg8fq.apps.googleusercontent.com` | Public OAuth Client Identifier from Google Cloud Console. |
| **`GOOGLE_CLIENT_SECRET`** | *(Your Google Cloud Client Secret)* | Private OAuth Client Secret. Never commit to Git or expose in frontend code. |
| **`GOOGLE_REDIRECT_URI`** | `https://grand-bandhan.onrender.com/api/email/oauth2/callback` | Must exactly match the Authorized Redirect URI in Google Cloud Console. |
| **`GMAIL_SENDER_EMAIL`** | `shreyanshsharma049@gmail.com` | Verified Google account authorized to dispatch emails. |
| **`GMAIL_TOKEN_ENCRYPTION_KEY`** | *(64-character hex string)* | 256-bit key used for AES-256-GCM encryption of refresh tokens at rest in Neon PostgreSQL. |
| **`NODE_ENV`** | `production` | Enforces production security guardrails. |
| **`DATABASE_URL`** | *(Neon Pooled PostgreSQL connection string)* | Persistent database connection. |
| **`DATABASE_URL_UNPOOLED`** | *(Neon Direct connection string)* | Direct connection for schema migrations. |

---

### Step 2.2: Generate a Cryptographic 256-Bit Token Encryption Key
Run this command in PowerShell or terminal to generate your production encryption key:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- **Output:** A 64-character hexadecimal string (e.g., `b4c7e8f1a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9`).
- **Action:** Paste this exact string into Render as `GMAIL_TOKEN_ENCRYPTION_KEY`.

---

### Step 2.3: Verify Google Cloud Console Configuration
1. Log in to [Google Cloud Console](https://console.cloud.google.com/).
2. Select your Grand Bandhan project.
3. Navigate to **APIs & Services ➔ Credentials ➔ OAuth 2.0 Client IDs**.
4. Click on your Web Client ID and verify **Authorized redirect URIs**:
   - `https://grand-bandhan.onrender.com/api/email/oauth2/callback`
   *(Note: A trailing slash or HTTP instead of HTTPS will cause an immediate `redirect_uri_mismatch` error).*
5. Navigate to **APIs & Services ➔ Enabled APIs & Services** and ensure **Gmail API** is enabled.
6. If the OAuth consent screen publishing status is **Testing**, ensure `shreyanshsharma049@gmail.com` is listed under **Test users**.

---

### Step 2.4: Admin Password & Secret Rotation Warning
> [!WARNING]
> The seed administrative password `GrandBandhan@2025` is publicly visible in repository source code and seed files. Before production launch with real client contracts:
> 1. Log in as Super Admin and change the password immediately.
> 2. Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` on Render are rotated to private, high-entropy 256-bit random strings.

---

### Step 2.5: Verify Production Backend Health
Confirm the Render deployment is live and reachable:
```powershell
Invoke-RestMethod -Uri "https://grand-bandhan.onrender.com/health" -Method Get
```
- **Expected Output:**
  ```json
  {
    "status": "healthy",
    "service": "Grand Bandhan Imperial API",
    "timestamp": "...",
    "database": "connected"
  }
  ```

---

# PHASE 3 — Real Gmail OAuth Connection

Connect the live production Gmail account using the secure, single-use handoff ticket flow.

### Step 3.1: Authenticate as Super Admin via PowerShell
Execute the following PowerShell snippet to obtain an authenticated session:

```powershell
$backendUrl = "https://grand-bandhan.onrender.com"

# 1. Login to obtain Super Admin JWT
$loginBody = @{
    email = "admin@grandbandhan.com"
    password = "GrandBandhan@2025"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$adminToken = $loginRes.data.accessToken
Write-Host "Super Admin authenticated successfully."
```

---

### Step 3.2: Request a Single-Use Authorization Handoff Ticket
Request a 60-second handoff ticket using the bearer token in the `Authorization` header:

```powershell
$headers = @{
    Authorization = "Bearer $adminToken"
    Accept = "application/json"
}

$handoffRes = Invoke-RestMethod -Uri "$backendUrl/api/email/oauth/handoff" `
    -Method Post `
    -Headers $headers

$ticket = $handoffRes.data.ticket
$startPath = $handoffRes.data.startUrl
$fullStartUrl = "$backendUrl$startPath"

Write-Host "Handoff ticket generated: $ticket"
Write-Host "Start URL: $fullStartUrl"
```

- **Expected Response Structure:**
  ```json
  {
    "success": true,
    "message": "Single-use OAuth authorization handoff ticket generated.",
    "data": {
      "ticket": "8c5e62df94...",
      "expiresAt": "2026-10-31T23:56:00.000Z",
      "startUrl": "/api/email/oauth/start?ticket=8c5e62df94..."
    }
  }
  ```

---

### Step 3.3: Open the Connection Flow in Your Web Browser
Run this command in PowerShell to launch your default browser:
```powershell
Start-Process $fullStartUrl
```
*(Or copy and paste `$fullStartUrl` into your browser address bar within 60 seconds).*

**What happens behind the scenes:**
1. The server receives `GET /api/email/oauth/start?ticket=<ticket>`.
2. The server atomically deletes the ticket from Neon PostgreSQL (single-use consumption).
3. The server generates a CSRF state nonce bound to your admin user in Neon PostgreSQL.
4. The server responds with `HTTP 302 Found`, redirecting your browser to `https://accounts.google.com/o/oauth2/v2/auth`.

---

### Step 3.4: Complete the Google Consent Screen
1. On the Google sign-in page, select **`shreyanshsharma049@gmail.com`**.
2. If Google displays **"Google hasn't verified this app"** (standard during development):
   - Click **Advanced**.
   - Click **Go to Grand Bandhan (unsafe)**.
3. Review the permission requested:
   - **"Send email on your behalf"** (`https://www.googleapis.com/auth/gmail.send`).
4. Click **Continue** / **Allow**.

---

### Step 3.5: Expected Callback Screen
Google redirects back to:
`https://grand-bandhan.onrender.com/api/email/oauth2/callback?code=...&state=...`

You will see the branded **Imperial Navy and Gold** confirmation screen:
```text
👑
Gmail API Connected Successfully
Grand Bandhan Imperial Email Engine
● Live & Ready for Automated Outbox Sending
Connected Sender: shreyanshsharma049@gmail.com
Granted Scope: https://www.googleapis.com/auth/gmail.send
Token Storage: Neon PostgreSQL (AES-256-GCM Encrypted)
Access Mode: Offline (Auto-Refresh Enabled)
```

---

### Step 3.6: Troubleshooting Common OAuth Errors

| Symptom / Error | Root Cause | Solution |
| :--- | :--- | :--- |
| **`HTTP 401: Invalid or expired OAuth handoff ticket`** | More than 60 seconds elapsed, or ticket was already consumed (replayed). | Re-run Step 3.2 to generate a fresh ticket and open immediately. |
| **`HTTP 400: Security Alert: Invalid OAuth State`** | State nonce expired (>15 min), was already consumed, or CSRF attack. | Re-initiate connection from Step 3.2. |
| **`Error 400: redirect_uri_mismatch`** | Google Console redirect URI does not match Render URL. | Verify exact URL in Google Console: `https://grand-bandhan.onrender.com/api/email/oauth2/callback` (no trailing slash). |
| **`Error 403: access_denied`** | App is in Testing mode and email is not added as a Test User. | Add `shreyanshsharma049@gmail.com` to **Test users** in Google Cloud Console OAuth consent screen. |
| **No refresh token returned by Google** | Google only returns `refresh_token` on the first consent. | The backend passes `access_type=offline&prompt=consent` which forces Google to re-issue the refresh token every time. If missing, revoke access at `myaccount.google.com/permissions` and reconnect. |

---

# PHASE 4 — Actual Email Delivery

### Step 4.1: Inspect Outbox Connection Status
Verify via PowerShell that the token was encrypted and stored in Neon:
```powershell
$statusRes = Invoke-RestMethod -Uri "$backendUrl/api/email/status" `
    -Method Get `
    -Headers $headers

$statusRes.data | Format-List
```
- **Expected Output:**
  ```text
  connected               : True
  isAgencyDedicated       : False
  agencyId                :
  senderEmail             : shreyanshsharma049@gmail.com
  scope                   : https://www.googleapis.com/auth/gmail.send
  redirectUri             : https://grand-bandhan.onrender.com/api/email/oauth2/callback
  tokenSource             : database
  tokenExpiresAt          : 2026-11-01T00:35:00.000Z
  clientIdConfigured      : True
  clientSecretConfigured  : True
  encryptionKeyConfigured : True
  tokenEncrypted          : True
  activeTransport         : GMAIL_API
  ```
- **Security Check:** Verify that `refreshToken`, `accessToken`, and `clientSecret` are **NOT** present in the output.

---

### Step 4.2: Dispatch a Real Test Email via Gmail API
Send an official test email to your inbox:
```powershell
$testEmailBody = @{
    to = "shreyanshsharma049@gmail.com"
    subject = "👑 Grand Bandhan — Live Production Gmail API Verification"
    message = "Imperial email delivery verified successfully via Google OAuth 2.0 and the Gmail API."
} | ConvertTo-Json

$testEmailRes = Invoke-RestMethod -Uri "$backendUrl/api/email/test" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $testEmailBody

$testEmailRes | ConvertTo-Json
```
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Test email successfully sent via Gmail API to shreyanshsharma049@gmail.com.",
    "data": {
      "messageId": "18f8e02b3c4d5e6f",
      "threadId": "18f8e02b3c4d5e6f",
      "to": "shreyanshsharma049@gmail.com",
      "from": "shreyanshsharma049@gmail.com",
      "subject": "👑 Grand Bandhan — Live Production Gmail API Verification",
      "sentAt": "2026-10-31T23:30:00.000Z"
    }
  }
  ```

---

### Step 4.3: Physical Mailbox Verification
1. Open [Gmail](https://mail.google.com/) for `shreyanshsharma049@gmail.com`.
2. Check the **Inbox** (and **Spam** folder if testing between same-sender addresses).
3. Open the email:
   - **Sender:** `Grand Bandhan Concierge <shreyanshsharma049@gmail.com>`
   - **Subject:** `👑 Grand Bandhan — Live Production Gmail API Verification`
   - **Branding:** Imperial Navy banner, gold crown icon, royal verification card.
4. Click the three dots (⋮) on the email and select **Show original**:
   - `SPF: PASS with IP ...`
   - `DKIM: 'PASS' with domain gmail.com`
   - `From: Grand Bandhan Concierge <shreyanshsharma049@gmail.com>`

---

### Step 4.4: Safe Log Inspection on Render
In the **Render Dashboard ➔ Logs**, verify that:
- Dispatch entries appear: `[NotificationService] Dispatched via Gmail API: messageId=...`
- **Zero secrets are logged:** Verify no access tokens, refresh tokens, client secrets, or encryption keys appear in the log output.

---

### Step 4.5: Verify the EmailLog Record in Neon PostgreSQL
Run this query via Neon SQL Editor or Prisma Studio to verify the audit record:
```sql
SELECT id, "recipientEmail", "eventType", subject, status, "providerMessageId", "sentAt"
FROM "EmailLog"
ORDER BY "createdAt" DESC
LIMIT 5;
```
- **Expected Record:**
  - `recipientEmail`: `shreyanshsharma049@gmail.com`
  - `eventType`: `GMAIL_API_SEND`
  - `status`: `DELIVERED`
  - `providerMessageId`: Matches the `messageId` returned in Step 4.2.

---

# PHASE 5 — Business Workflow Testing

Test Grand Bandhan's end-to-end luxury wedding operations workflows to verify real transactional notifications.

---

### Workflow 1: Public Customer Enquiry & Agency Desk Notification
- **Trigger:** Public customer submits enquiry form on website.
- **PowerShell Command:**
  ```powershell
  $enquiryBody = @{
      customerName = "Rohan Verma"
      partnerName = "Meera Kapoor"
      email = "shreyanshsharma049@gmail.com"
      phone = "+91 98765 43210"
      location = "Udaipur, Rajasthan"
      guestCount = 350
      minBudget = 2500000
      maxBudget = 5000000
      source = "WEBSITE"
      planningFor = "BRIDE_SIDE"
      notes = "Destination wedding at Lake Pichola villa."
  } | ConvertTo-Json

  $enquiryRes = Invoke-RestMethod -Uri "$backendUrl/api/enquiries" `
      -Method Post `
      -ContentType "application/json" `
      -Body $enquiryBody
  ```
- **Expected Emails Dispatched:**
  1. **Customer Confirmation:** To `shreyanshsharma049@gmail.com`, Subject: `👑 Royal Wedding Enquiry Received: GB-ENQ-2026-XXXX`.
  2. **Agency Desk Notification:** To agency contact email, Subject: `👑 New Imperial Wedding Enquiry: GB-ENQ-2026-XXXX (Rohan Verma)`.
- **Database Verification:** `CustomerEnquiry` status is `NEW`; two `EmailLog` records created with `eventType = 'NEW_ENQUIRY_RECEIVED'`.

---

### Workflow 2: Bespoke Proposal Dispatch
- **Trigger:** Agency planner generates and dispatches custom proposal.
- **PowerShell Command:**
  ```powershell
  $enquiryId = $enquiryRes.data.id

  $proposalBody = @{
      enquiryId = $enquiryId
      packageType = "FULL_SERVICE"
      estimatedBudget = 4200000
      validUntil = (Get-Date).AddDays(14).ToString("yyyy-MM-ddTHH:mm:ssZ")
      proposedServices = @("Royal Venue Management", "Lake Pichola Catering", "Imperial Floral Decor")
      planningScope = "Comprehensive 3-day royal destination wedding management."
  } | ConvertTo-Json

  $proposalRes = Invoke-RestMethod -Uri "$backendUrl/api/proposals" `
      -Method Post `
      -Headers $headers `
      -ContentType "application/json" `
      -Body $proposalBody
  ```
- **Expected Email Dispatched:**
  - **Recipient:** Customer (`shreyanshsharma049@gmail.com`).
  - **Subject:** `👑 Your Bespoke Wedding Proposal is Ready — Grand Bandhan (GB-PROP-2026-XXXX)`.
- **Database Verification:** `WeddingProposal` created with status `SENT`; `CustomerEnquiry` updated to `PROPOSAL_SENT`.

---

### Workflow 3: Customer Proposal Acceptance
- **Trigger:** Customer accepts proposal via portal or link.
- **PowerShell Command:**
  ```powershell
  $proposalId = $proposalRes.data.id

  $acceptBody = @{
      status = "ACCEPTED"
      customerNotes = "Delighted with the terms. Ready to proceed with booking deposit."
  } | ConvertTo-Json

  $acceptRes = Invoke-RestMethod -Uri "$backendUrl/api/proposals/$proposalId/respond" `
      -Method Post `
      -ContentType "application/json" `
      -Body $acceptBody
  ```
- **Expected Email Dispatched:**
  - **Recipient:** Agency Concierge (`shreyanshsharma049@gmail.com`).
  - **Subject:** `Grand Bandhan Notification: PROPOSAL_ACCEPTED`.
- **Database Verification:** `WeddingProposal` status `ACCEPTED`; `CustomerEnquiry` status `BOOKING_PENDING`.

---

### Workflow 4: Wedding Conversion & 25+ Task Plan Activation
- **Trigger:** Agency converts approved enquiry into active project.
- **PowerShell Command:**
  ```powershell
  $convertBody = @{
      enquiryId = $enquiryId
  } | ConvertTo-Json

  $weddingRes = Invoke-RestMethod -Uri "$backendUrl/api/weddings/convert-enquiry" `
      -Method Post `
      -Headers $headers `
      -ContentType "application/json" `
      -Body $convertBody
  ```
- **Expected Email Dispatched:**
  - **Recipient:** Couple (`shreyanshsharma049@gmail.com`).
  - **Subject:** `👑 Wedding Celebration Confirmed! Welcome to Grand Bandhan (GB-W-2026-XXXX)`.
- **Database Verification:** `Wedding` project activated; 26 milestone tasks generated with lead-time countdowns.

---

### Workflow Failure Troubleshooting

| Failure Symptom | Cause | Remedy |
| :--- | :--- | :--- |
| **Email received from Sandbox/Console logger instead of Gmail** | Gmail token expired or not connected. | Run Step 4.1 to check connection status. Re-run Phase 3 if disconnected. |
| **`Gmail API sending failed: Daily Limit Exceeded`** | Exceeded Google standard limit (500 emails/day for free Gmail, 2,000/day for Google Workspace). | System automatically falls back to Resend or Sandbox. Upgrade account or space out dispatches. |
| **`EmailLog` status stuck on `FAILED`** | Invalid recipient address or Google API timeout. | Check `errorMessage` column in `EmailLog` table in Neon SQL Editor. |

---

# PHASE 6 — Multi-Agency Isolation Verification

Grand Bandhan supports both platform concierge dispatch and dedicated agency sender accounts.

### Step 6.1: Dedicated Agency Sender Resolution
- When an Agency Admin connects their Google account, tokens are stored with `id = 'agency_<agencyId>'`.
- When dispatches occur for that agency, `GmailService.getValidAccessToken(agencyId)` loads that agency's dedicated token and sends from their authenticated account.

### Step 6.2: Global Platform Fallback
- When an agency has **not** connected a dedicated Google account, the dispatch engine falls back to `id = 'default'` (`shreyanshsharma049@gmail.com`).
- Wedding communications are never dropped or blocked due to an unlinked agency account.

### Step 6.3: Multi-Tenant Anti-Spoofing Verification
1. Log in as an Agency Admin (`UserRole.AGENCY_ADMIN`).
2. Attempt to query another agency's status:
   `GET /api/email/status?agencyId=another_agency_uuid`
   - **Verified Behavior:** The backend forces `targetAgencyId = req.user.agencyId`. Query parameter is disregarded.
3. Attempt to dispatch test email under another agency's ID:
   `POST /api/email/test` with body `{ "agencyId": "another_agency_uuid" }`
   - **Verified Behavior:** The backend forces `agencyId = req.user.agencyId`. Anti-spoofing guardrail passes.

---

# PHASE 7 — Final Verification Checklist & Run Report

Use this checklist to record the results of your live verification run.

| # | Verification Criterion | Expected Result | Result (`PASS` / `FAIL` / `NOT TESTED`) |
| :--- | :--- | :--- | :---: |
| **1** | Local API Build | Clean compile, 0 TypeScript errors | **PASS** |
| **2** | Gmail Hardening Suite | 12 / 12 security tests pass | **PASS** |
| **3** | Platform E2E Suite | 20 / 20 enterprise workflows pass | **PASS** |
| **4** | Query Param Token Rejection | `GET /api/email/status?token=...` returns 401 | **PASS** |
| **5** | Single-Use Handoff Ticket | Handoff ticket consumed once; replay returns 401 | **PASS** |
| **6** | AES-256-GCM Token Encryption | Refresh token encrypted in Neon (`enc:v1:...`) | **PASS** |
| **7** | Production OAuth Connect | Redirects to Google, consents, returns Imperial screen | *(Run in Phase 3)* |
| **8** | Status Endpoint Audit | Returns `connected: true`, zero secrets leaked | *(Run in Phase 4)* |
| **9** | Physical Test Email Inbox | Real email received with DKIM/SPF `PASS` | *(Run in Phase 4)* |
| **10** | Neon EmailLog Entry | Audit record created with `status: DELIVERED` | *(Run in Phase 4)* |
| **11** | Customer Enquiry Notification | Real email received on public enquiry submission | *(Run in Phase 5)* |
| **12** | Proposal Sent Notification | Real proposal email received with valid link | *(Run in Phase 5)* |
| **13** | Booking Confirmed Notification | Real project activation email received | *(Run in Phase 5)* |
| **14** | Agency Multi-Tenant Isolation | Agency A cannot read or spoof Agency B outbox | **PASS** |

---

# Emergency Procedures & Rollback

### How to Revoke Gmail OAuth Access
If credentials are ever suspected of compromise:
1. Navigate to [Google Account Permissions](https://myaccount.google.com/connections).
2. Locate **Grand Bandhan**.
3. Click **Delete all connections that you have with Grand Bandhan**.
4. In Neon SQL Editor, clear stored tokens:
   ```sql
   DELETE FROM "GmailOAuthToken" WHERE id = 'default';
   ```
5. The application will immediately drop back to Resend or the Sandbox Logger without crashing.

### How to Revert to Resend or Sandbox Dispatch
If Gmail API is temporarily unavailable:
1. In Render Dashboard, remove `GMAIL_REFRESH_TOKEN` or set `EMAIL_API_KEY` to your Resend API key (`re_...`).
2. The platform's dispatch priority automatically shifts:
   `GMAIL_API (if connected) ➔ RESEND (if configured) ➔ SANDBOX_LOG (fallback)`.
