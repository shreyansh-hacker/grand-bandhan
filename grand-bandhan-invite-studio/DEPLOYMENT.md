# Grand Bandhan Invite Studio · Vercel Production Deployment Guide

This guide provides end-to-end instructions for deploying **Grand Bandhan Invite Studio** to **Vercel** with custom subdomains (e.g. `invite.grandbandhan.com`), Supabase/PostgreSQL database migrations, environment variables, and zero-downtime rollback procedures.

---

## 1. Architecture & Deployment Options

You have two primary deployment architectures:

### Option A: Standalone Vercel Project (Recommended for `invite.domain.com`)
Deploy `grand-bandhan-invite-studio` as its own top-level project on Vercel.
- **Root Directory in Vercel:** `grand-bandhan-invite-studio`
- **Framework Preset:** `Vite`
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`

### Option B: Monorepo Deployment
Deploy from the root of `Grand-Bandhan` where Next.js web app (`apps/web`) and Invite Studio coexist.
- **Root Directory:** `./`
- **Build Command:** `pnpm --filter grand-bandhan-invite-studio run build`
- **Output Directory:** `grand-bandhan-invite-studio/dist`

---

## 2. Vercel Dashboard Step-by-Step Setup

1. **Log in to Vercel**: Open [vercel.com](https://vercel.com) and go to your dashboard.
2. **Add New Project**:
   - Click **Add New...** > **Project**.
   - Import your Git repository (GitHub, GitLab, or Bitbucket).
3. **Configure Project Settings**:
   - **Project Name:** `grand-bandhan-invite-studio`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and select `grand-bandhan-invite-studio`.
   - **Build and Output Settings:**
     - Build Command: `pnpm run build` (or leave default Vite override)
     - Output Directory: `dist`
     - Install Command: `pnpm install`
4. **Environment Variables**:
   Under **Environment Variables**, add the keys from your `.env.example`:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `AI_API_KEY` | `AIzaSy...` | Gemini or LLM API key for the copy assistant |
   | `DATABASE_URL` | `postgresql://postgres:...@db...supabase.co:5432/postgres` | Optional Postgres connection string |
   | `SUPABASE_URL` | `https://xyz.supabase.co` | Optional Supabase project endpoint |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase service role secret |
   | `VITE_APP_URL` | `https://invite.grandbandhan.com` | Canonical public URL for invitation links |
   | `VITE_DEFAULT_LANGUAGE` | `en` | Default UI locale (`en` or `hi`) |
5. **Deploy**:
   - Click **Deploy**. Vercel will bundle the TypeScript code, run Vite build, and deploy the serverless functions (`api/ai.ts`, `api/rsvp.ts`, `api/publish.ts`).

---

## 3. Custom Domain Setup (`invite.grandbandhan.com`)

1. In the Vercel project dashboard, navigate to **Settings** > **Domains**.
2. Enter your desired subdomain: `invite.grandbandhan.com` (or your chosen brand domain) and click **Add**.
3. Vercel will display DNS instructions:
   - **Type:** `CNAME`
   - **Name:** `invite`
   - **Value:** `cname.vercel-dns.com`
4. Log in to your domain registrar (e.g. GoDaddy, Namecheap, Cloudflare) and create the CNAME record.
5. Vercel automatically provisions a free SSL/TLS certificate within 60 seconds once DNS propagates.

---

## 4. Database Schema & Supabase Migrations (Optional Persistent Storage)

The client application includes durable browser storage and sync out-of-the-box. To enable persistent cloud multi-user PostgreSQL storage, run the following SQL migration in your Supabase SQL Editor or Postgres database:

```sql
-- Migration: 001_create_invite_studio_tables.sql

-- 1. Organizer Drafts Table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Frozen Published Snapshots
CREATE TABLE IF NOT EXISTS public.published_invitations (
    slug TEXT PRIMARY KEY,
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
    organizer_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Guest RSVP Responses
CREATE TABLE IF NOT EXISTS public.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    guest_name TEXT NOT NULL,
    phone_or_email TEXT NOT NULL,
    attending BOOLEAN NOT NULL,
    party_size INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    dietary_preferences TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast slug lookup and RSVP aggregation
CREATE INDEX IF NOT EXISTS idx_published_slug ON public.published_invitations(slug);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON public.rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_contact ON public.rsvps(invitation_id, phone_or_email);
```

---

## 5. Post-Deployment Verification Checklist

Verify your live deployment by testing each of the following:

- [ ] **English-first UI**: Visit `https://your-deployment.vercel.app`. Verify the headline is *"What are you celebrating?"* with English event cards.
- [ ] **Language Switcher**: Click `हिन्दी` in the top right. Verify the text changes to *"आप किस इवेंट के लिए निमंत्रण बना रहे हैं?"*.
- [ ] **All 4 Event Templates**:
  - Wedding: Click *Royal Wedding Book* demo. Tap *Open Book*, unroll scroll, swipe festivities.
  - Birthday: Open *Birthday Surprise Box* demo. Verify 3D lid open, confetti burst, party schedule.
  - Corporate: Open *Corporate Event Pass* demo. Verify 3D badge flip, speaker cards, agenda.
  - Custom Event: Open *Custom Floral Arch* demo. Verify 3D toran arch doors opening, occasion details.
- [ ] **Drafting & Publishing**:
  - Click *Use this template* on any card.
  - Edit the venue or celebrant name in the Properties panel.
  - Click *Publish* in the toolbar. Copy the public link (`/i/<slug>`).
  - Open the public link in a private/incognito window. Verify the published card renders without login.
- [ ] **Draft Freeze Test**:
  - Change the celebrant name or venue in the studio editor.
  - Refresh the incognito window with `/i/<slug>`. Verify the old text remains unchanged until you click *Publish Update*.
- [ ] **RSVP Deduplication**:
  - In the guest view, fill out the RSVP form with name and phone number. Submit.
  - Submit again with the same phone number but updated party size.
  - Open the Organizer Dashboard (`#/dashboard`). Verify the guest count updated rather than creating a duplicate entry.
- [ ] **Social Share Metadata**:
  - Open `https://your-deployment.vercel.app/api/invites/<slug>` or test in WhatsApp/Facebook Debugger. Verify title, description, and cover image metadata are populated.

---

## 6. Zero-Downtime Rollback Procedure

If an issue occurs in production:

### Method 1: Instant Rollback via Vercel Dashboard
1. Go to **Deployments** in your Vercel project.
2. Locate the previous healthy deployment.
3. Click the three dots (`...`) next to the healthy deployment.
4. Select **Instant Rollback** (or **Promote to Production**).
5. Vercel immediately redirects traffic to the previous build in under 2 seconds.

### Method 2: Command Line (PowerShell)
If you have Vercel CLI installed:
```powershell
# List recent deployments:
vercel ls

# Rollback to specific deployment URL or ID:
vercel rollback [DEPLOYMENT-ID] --yes
```

---

## 7. Disaster Recovery & Backup Restoration

- **Exporting JSON Backup**: In the Organizer Dashboard (`#/dashboard`) or Studio toolbar, click **Export Draft (JSON)**. This downloads a complete portable JSON containing all copy, themes, images, and scene orders.
- **Restoring JSON Backup**: In the Organizer Dashboard, click **Import Draft (JSON)** and select your saved `.json` file. The draft is immediately restored with 100% fidelity.
