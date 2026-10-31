# Grand Bandhan — Gmail API OAuth 2.0 Hardening & Integration Guide

## 1. Overview & Security Architecture

The Grand Bandhan platform integrates directly with the **Google Gmail API** using **OAuth 2.0** with offline access and AES-256-GCM authenticated encryption at rest. This infrastructure allows the platform to dispatch real, high-deliverability luxury wedding communications (such as bespoke client proposals, enquiry confirmations, vendor RFPs, and milestone payment receipts) from verified email addresses.

### Core Security & Hardening Policies

1. **Zero Access Tokens in URLs (OWASP A07 Compliance):**
   - Access tokens (JWTs) are **strictly prohibited** from URL query parameters (`?token=...`).
   - Authentication is strictly accepted only via the `Authorization: Bearer <token>` HTTP header or secure HTTP-only cookies (`accessToken`).
   - Browser navigation for cross-origin SPAs uses a **short-lived (60s), single-use authorization handoff ticket** (`POST /api/email/oauth/handoff` ➔ `/api/email/oauth/start?ticket=...`).

2. **Authorized Scope:**
   - Strictly limited to a single minimal-privilege scope:
     `https://www.googleapis.com/auth/gmail.send`
   - Access mode: `offline` with `prompt=consent` to obtain a persistent `refresh_token`.

3. **CSRF Protection & Context Binding:**
   - Cryptographically random 64-character hex state nonce persisted in Neon PostgreSQL (`OAuthState`).
   - Expired after 15 minutes, single-use consumed upon callback to prevent replay attacks.
   - State nonce is bound to the initiating administrator (`userId`) and agency (`agencyId`).
   - During callback, the server verifies that the initiating admin account is active and that the associated agency is not suspended.

4. **AES-256-GCM Authenticated Envelope Encryption at Rest:**
   - Refresh tokens and access tokens are encrypted before being written to Neon PostgreSQL.
   - Envelope format: `enc:<version>:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>`.
   - Protects confidentiality and guarantees ciphertext integrity (tamper detection).
   - Encryption key is stored exclusively in Render environment variables (`GMAIL_TOKEN_ENCRYPTION_KEY`).

5. **Multi-Tenant Hybrid Sender Architecture:**
   - **Global Platform Concierge Sender (`id: 'default'`):** Platform-level fallback account (e.g. `concierge@grandbandhan.com` or `shreyanshsharma049@gmail.com`) used across platform operations.
   - **Dedicated Agency Sender (`id: 'agency_<agencyId>'`):** Each verified wedding agency can connect their own dedicated Google account for branded communications.
   - Automatic fallback: When sending emails, the engine checks for the agency's dedicated sender first, gracefully falling back to the platform concierge sender.

6. **Credential Sanitization & Zero Leakage:**
   - Client secrets, access tokens, refresh tokens, and encryption keys are never written to logs, never returned in API payloads, and never embedded in HTML responses.

---

## 2. Required Render Environment Variables

Configure these variables in the Render Dashboard (**Dashboard ➔ Service ➔ Environment Variables**):

| Variable Name | Required / Optional | Description |
| :--- | :--- | :--- |
| **`GOOGLE_CLIENT_ID`** | **Required** | Google Cloud Console OAuth 2.0 Client ID. |
| **`GOOGLE_CLIENT_SECRET`** | **Required** | Google Cloud Console OAuth 2.0 Client Secret (kept private in Render env). |
| **`GOOGLE_REDIRECT_URI`** | **Required** | Authorized redirect URI configured in Google Cloud Console (`https://grand-bandhan.onrender.com/api/email/oauth2/callback`). |
| **`GMAIL_SENDER_EMAIL`** | **Required** | Default sender address (e.g., `shreyanshsharma049@gmail.com`). |
| **`GMAIL_TOKEN_ENCRYPTION_KEY`** | **Required (Prod)** | 256-bit (64-character hex or string) key used for AES-256-GCM token encryption at rest. |
| **`GMAIL_REFRESH_TOKEN`** | *Optional* | Pre-generated refresh token fallback if OAuth flow has not been triggered yet. |
| **`GMAIL_TOKEN_KEY_VERSION`** | *Optional* | Active key version for key rotation (`v1` by default, set to `v2` during rotation). |
| **`GMAIL_TOKEN_ENCRYPTION_KEY_V2`**| *Optional* | Secondary key for zero-downtime key rotation. |

---

## 3. Key Rotation Procedure (Zero-Downtime)

Grand Bandhan supports cryptographic key rotation without database migration or service interruption:

1. **Generate a new 256-bit key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **Add to Render Environment Variables:**
   - Set `GMAIL_TOKEN_ENCRYPTION_KEY_V2=<new_hex_key>`.
   - Set `GMAIL_TOKEN_KEY_VERSION=v2`.
   - Keep existing `GMAIL_TOKEN_ENCRYPTION_KEY` active.
3. **Automatic Upgrade:**
   - Existing tokens encrypted under `v1` continue to decrypt seamlessly using the version tag `enc:v1:...`.
   - All newly generated or refreshed tokens will automatically be encrypted using `v2` (`enc:v2:...`).
4. **Retire Old Key:**
   - Once all tokens are refreshed or re-encrypted, remove `GMAIL_TOKEN_ENCRYPTION_KEY`.

---

## 4. API Endpoints Reference

### 4.1. Generate Single-Use OAuth Handoff Ticket
- **Route:** `POST /api/email/oauth/handoff`
- **Access:** Authenticated (`SUPER_ADMIN` or `AGENCY_ADMIN`).
- **Response:**
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

### 4.2. Initiate OAuth 2.0 Flow
- **Route:** `GET /api/email/oauth/start`
- **Access:** Active Admin session (Cookie / Bearer) OR valid single-use ticket in `?ticket=...`.
- **Note:** Never accepts `?token=<JWT>`. Unauthenticated requests without a ticket receive `401 Unauthorized`.
- **Behavior:**
  - Consumes the single-use ticket immediately.
  - Generates CSRF state nonce bound to the initiating admin and agency in Neon `OAuthState`.
  - In a browser: Redirects (HTTP 302) to Google's consent screen.
  - In an API client (`Accept: application/json`): Returns `{ success: true, data: { url, state, scope } }`.

### 4.3. Google OAuth Callback
- **Route:** `GET /api/email/oauth2/callback`
- **Access:** Public (Redirect endpoint called by Google).
- **Behavior:**
  - Validates `state` against Neon `OAuthState` and deletes it immediately to eliminate replay windows.
  - Checks that the initiating administrator is active and that the bound agency is not suspended.
  - Exchanges `code` for tokens and encrypts the tokens with AES-256-GCM before saving to `GmailOAuthToken`.
  - Renders the branded Imperial confirmation screen.

### 4.4. Email Connection Status
- **Route:** `GET /api/email/status`
- **Access:** Authenticated (`SUPER_ADMIN` or `AGENCY_ADMIN`).
- **Agency Isolation:** Agency Admins receive status scoped to their agency; Super Admins can query globally or by `?agencyId=...`.
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "connected": true,
      "isAgencyDedicated": false,
      "agencyId": null,
      "senderEmail": "shreyanshsharma049@gmail.com",
      "scope": "https://www.googleapis.com/auth/gmail.send",
      "redirectUri": "https://grand-bandhan.onrender.com/api/email/oauth2/callback",
      "tokenSource": "database",
      "tokenEncrypted": true,
      "encryptionKeyConfigured": true,
      "tokenExpiresAt": "2026-10-31T23:55:00.000Z",
      "clientIdConfigured": true,
      "clientSecretConfigured": true,
      "activeTransport": "GMAIL_API"
    }
  }
  ```

### 4.5. Send Test Email
- **Route:** `POST /api/email/test`
- **Access:** Authenticated (`SUPER_ADMIN` or `AGENCY_ADMIN`).
- **Agency Isolation:** Agency Admins can only dispatch test emails bound to their authenticated agency.
- **Request Body:**
  ```json
  {
    "to": "shreyanshsharma049@gmail.com",
    "subject": "👑 Grand Bandhan — Gmail API Hardening Verification",
    "message": "Testing automated wedding operations dispatch from Grand Bandhan."
  }
  ```

---

## 5. Step-by-Step Production Connection Procedure

### Step 1: Obtain Admin Session Token
Log in to acquire your bearer token:
```bash
curl -X POST https://grand-bandhan.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@grandbandhan.com","password":"GrandBandhan@2025"}'
```

### Step 2: Request a Single-Use Handoff Ticket
```bash
curl -X POST https://grand-bandhan.onrender.com/api/email/oauth/handoff \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Accept: application/json"
```
The response returns:
```json
{
  "data": {
    "startUrl": "/api/email/oauth/start?ticket=a1b2c3..."
  }
}
```

### Step 3: Open Start URL in Web Browser
Navigate to:
```text
https://grand-bandhan.onrender.com/api/email/oauth/start?ticket=<TICKET>
```
The server validates and deletes the ticket, then redirects you directly to Google's consent screen.

### Step 4: Grant Consent on Google Consent Screen
1. Sign in with **`shreyanshsharma049@gmail.com`**.
2. Review the requested permission:
   - **"Send email on your behalf"** (`https://www.googleapis.com/auth/gmail.send`).
3. Click **Continue** / **Allow**.

### Step 5: Encrypted Token Persistence
1. Google redirects back to `https://grand-bandhan.onrender.com/api/email/oauth2/callback`.
2. The server consumes the CSRF state nonce, checks user & agency status, encrypts the refresh token using AES-256-GCM, and persists it into **Neon PostgreSQL**.
3. You will see the **👑 Gmail API Connected Successfully** screen.

### Step 6: Dispatch Verification Test Email
```bash
curl -X POST https://grand-bandhan.onrender.com/api/email/test \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "shreyanshsharma049@gmail.com",
    "subject": "👑 Grand Bandhan — Security Hardening Test",
    "message": "Gmail API OAuth 2.0 security hardening verified successfully."
  }'
```
You will receive the branded Imperial Gold/Navy test email directly in your inbox.
