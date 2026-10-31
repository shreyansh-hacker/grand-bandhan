# Grand Bandhan — Gmail API OAuth 2.0 Integration & Setup Guide

## 1. Overview & Architectural Specifications

The Grand Bandhan backend integrates directly with the **Google Gmail API** using **OAuth 2.0** with offline access. This allows the platform to dispatch real, high-deliverability luxury wedding communications (such as bespoke client proposals, enquiry notifications, vendor RFPs, and milestone payment receipts) from the verified concierge address.

### Security & Scope Policy
- **Authorized Scope:** Strictly limited to a single minimal-privilege scope:
  `https://www.googleapis.com/auth/gmail.send`
- **Access Mode:** `offline` with `prompt=consent` to obtain a persistent `refresh_token`.
- **CSRF Protection:** Cryptographic 64-hex-character state nonce persisted in Neon PostgreSQL (`OAuthState`) with a 15-minute expiration window and single-use consumption.
- **Persistence:** Stored in Neon PostgreSQL (`GmailOAuthToken`). Zero storage in local JSON files or ephemeral disk caches.
- **Credential Sanitization:** Client secret, access tokens, and refresh tokens are strictly hidden from API responses, client payloads, and public logs.

---

## 2. Required Render Environment Variables

To activate Gmail API email dispatch on your Render backend (`https://grand-bandhan.onrender.com`), configure these environment variables in the Render Dashboard (**Dashboard ➔ Service ➔ Environment Variables**):

| Variable Name | Required Value | Description |
| :--- | :--- | :--- |
| **`GOOGLE_CLIENT_ID`** | `781792527808-0ccmt0hbs9qmqvcudsklnnm660shg8fq.apps.googleusercontent.com` | Google Cloud Console OAuth 2.0 Client ID. |
| **`GOOGLE_CLIENT_SECRET`** | `(Your Google Cloud Client Secret from Console)` | Google Cloud Console OAuth 2.0 Client Secret (Configure in Render Dashboard environment variables; never commit secret strings to Git). |
| **`GOOGLE_REDIRECT_URI`** | `https://grand-bandhan.onrender.com/api/email/oauth2/callback` | Authorized redirect URI configured in Google Cloud Console. |
| **`GMAIL_SENDER_EMAIL`** | `shreyanshsharma049@gmail.com` | The Google account authorized to send emails. |
| **`GMAIL_REFRESH_TOKEN`** | *(Optional)* | Initial refresh token if pre-generated, or automatically stored in Neon DB upon completing OAuth flow. |

---

## 3. API Endpoints Reference

### 3.1. Initiate OAuth 2.0 Flow
- **Route:** `GET /api/email/oauth/start`
- **Access:** Authenticated (`SUPER_ADMIN` or `AGENCY_ADMIN`).
- **Supports:** Bearer Header, `accessToken` cookie, or `?token=<JWT>` query parameter.
- **Behavior:**
  - Generates CSRF state nonce and saves to Neon `OAuthState` table.
  - In a browser: Redirects (HTTP 302) directly to Google's consent screen.
  - In an API client (`Accept: application/json`): Returns `{ success: true, data: { url, state, scope } }`.

### 3.2. Google OAuth Callback
- **Route:** `GET /api/email/oauth2/callback`
- **Access:** Public (Called by Google redirect with `?code=...&state=...`).
- **Behavior:**
  - Validates `state` against Neon `OAuthState` and consumes the nonce immediately to prevent replay / CSRF.
  - Exchanges `code` with `https://oauth2.googleapis.com/token` for tokens.
  - Persists `refresh_token` and cached `access_token` into Neon `GmailOAuthToken`.
  - Displays a branded Grand Bandhan Imperial Gold/Navy confirmation screen in the browser.

### 3.3. Email Status Check
- **Route:** `GET /api/email/status`
- **Access:** Authenticated (`SUPER_ADMIN` or `AGENCY_ADMIN`).
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "connected": true,
      "senderEmail": "shreyanshsharma049@gmail.com",
      "scope": "https://www.googleapis.com/auth/gmail.send",
      "redirectUri": "https://grand-bandhan.onrender.com/api/email/oauth2/callback",
      "tokenSource": "database",
      "tokenExpiresAt": "2026-10-31T23:55:00.000Z",
      "clientIdConfigured": true,
      "clientSecretConfigured": true,
      "activeTransport": "GMAIL_API"
    }
  }
  ```
  *(Note: Credentials and secret tokens are strictly sanitized).*

### 3.4. Send Test Email
- **Route:** `POST /api/email/test`
- **Access:** Authenticated (`SUPER_ADMIN` or `AGENCY_ADMIN`).
- **Request Body (Optional):**
  ```json
  {
    "to": "shreyanshsharma049@gmail.com",
    "subject": "👑 Grand Bandhan — Gmail API Verification Test",
    "message": "Testing automated wedding operations dispatch from Grand Bandhan."
  }
  ```
- **Behavior:** Constructs an RFC 2822 MIME message, base64url encodes it, dispatches via `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, and logs the dispatch to Neon `EmailLog`.

---

## 4. Exact Step-by-Step Instructions to Connect Gmail and Send a Test Email

Follow these instructions to connect your Gmail account to the live Render deployment:

### Step 1: Obtain a Super Admin Access Token
Log in via the Command Portal or make a POST request:
```bash
curl -X POST https://grand-bandhan.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@grandbandhan.com","password":"GrandBandhan@2025"}'
```
Copy the `accessToken` from the response.

### Step 2: Open the OAuth Flow in Your Web Browser
Paste this URL into your browser (replacing `<YOUR_ACCESS_TOKEN>` with the token from Step 1):
```text
https://grand-bandhan.onrender.com/api/email/oauth/start?token=<YOUR_ACCESS_TOKEN>
```
*Note: If you are already logged in to the Grand Bandhan portal in the same browser, your HTTP-only cookie is automatically passed, so you can simply visit `https://grand-bandhan.onrender.com/api/email/oauth/start`.*

### Step 3: Grant Permission on Google Consent Screen
1. Sign in with **`shreyanshsharma049@gmail.com`**.
2. Review the requested permission:
   - **"Send email on your behalf"** (`https://www.googleapis.com/auth/gmail.send`).
3. Click **Continue** / **Allow**.

### Step 4: Automatic Authorization & Persistent Storage
1. Google redirects back to `https://grand-bandhan.onrender.com/api/email/oauth2/callback`.
2. The server consumes the CSRF state nonce, exchanges the authorization code with Google for tokens, and writes the `refresh_token` to **Neon PostgreSQL**.
3. You will see the **👑 Gmail API Connected Successfully** screen with status confirmation.

### Step 5: Verify Connection Status
Verify the connection using curl or Postman:
```bash
curl -X GET https://grand-bandhan.onrender.com/api/email/status \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```
Expected output:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "senderEmail": "shreyanshsharma049@gmail.com",
    "scope": "https://www.googleapis.com/auth/gmail.send",
    "activeTransport": "GMAIL_API"
  }
}
```

### Step 6: Dispatch a Test Email
Send an official test email through Gmail API:
```bash
curl -X POST https://grand-bandhan.onrender.com/api/email/test \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "shreyanshsharma049@gmail.com",
    "subject": "👑 Grand Bandhan — Live Gmail API Verification Test",
    "message": "Congratulations! The Gmail API OAuth 2.0 integration is fully operational on Render."
  }'
```
You will immediately receive the branded Imperial Gold/Navy test email in your inbox at `shreyanshsharma049@gmail.com`!
