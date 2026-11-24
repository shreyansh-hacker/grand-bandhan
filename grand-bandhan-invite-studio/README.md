# Grand Bandhan Invite Studio (ग्रांड बंधन इनवाइट स्टूडियो)

> **A Multi-Event 3D Digital Invitation Studio & Publishing Platform for Indian Celebrations.**  
> Features full editorial control, realistic 3D tactile invitations, English-first UI with seamless Hindi translation, real RSVP tracking, AI copy assistance, and zero-downtime Vercel deployment.

---

## ⚡ Quick Start (Windows PowerShell Instructions)

### 1. Install Dependencies
```powershell
# From the grand-bandhan-invite-studio directory:
cd grand-bandhan-invite-studio
pnpm install

# Or from the repository root:
pnpm --filter grand-bandhan-invite-studio install
```

### 2. Start Local Development Server
```powershell
pnpm --filter grand-bandhan-invite-studio run dev
```
Open your browser at: **`http://localhost:5173`**

### 3. Run Production Build
```powershell
pnpm --filter grand-bandhan-invite-studio run build
```
Production assets are generated in **`grand-bandhan-invite-studio/dist/`**.

### 4. Run Local Production Preview
```powershell
pnpm --filter grand-bandhan-invite-studio run preview
```
Open your browser at: **`http://localhost:4173`**

### 5. Run Automated Acceptance Tests
```powershell
node scripts/run-acceptance-tests.cjs
```

---

## 📁 First 3 Files to Open for Manual Customization

If you prefer editing clean source code rather than using the visual browser studio, start with these 3 files:

1. **[`src/templates/royal-wedding-book/template.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/royal-wedding-book/template.ts)**
   - *What's inside:* Couple names, parents' names, "॥ श्री गणेशाय नमः ॥" blessing, wedding date, muhurat, festivities (Haldi, Mehendi, Sangeet, Phere), venue address, map directions, and RSVP settings.
2. **[`src/templates/royal-wedding-book/theme.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/royal-wedding-book/theme.ts)**
   - *What's inside:* Core palette (velvet wine `#6e1f2f`, champagne gold `#dfba6a`, ivory paper `#faf7f2`), heading fonts, and Devanagari typography styles.
3. **[`src/config/brand.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/config/brand.ts)**
   - *What's inside:* Studio brand name, tagline, wordmark logo path, and organizer contact details.

---

## 🌟 Key Features in This Release

1. **English-First UI & Visible Language Switcher**:
   - Opens in English by default (*"What are you celebrating?"*).
   - Prominent `English | हिन्दी` switch in the top-right header, accessible on mobile down to 360px.
   - Studio UI language and Invitation Content language are completely independent — design a pure Hindi wedding card using an English editor without text distortion.
2. **Finished Multi-Event 3D Experiences**:
   - **Wedding**: Royal Wedding Book — 3D perspective velvet cover opening, draggable date-scroll unroll, swipeable festivities cards, directions, and calendar download.
   - **Birthday**: Birthday Surprise Box — 3D opening gift box lid with confetti burst, celebrant name and age, party activities, venue, and RSVP.
   - **Corporate**: Corporate Event Pass — 3D double-sided lanyard pass flip around Y-axis, keynote speakers, session agenda, venue / live-stream links, and attendee pass registration.
   - **Custom Event**: Custom Floral Arch — 3D marigold toran arch opening for housewarmings, anniversaries, sacred milestones, and custom celebrations.
   - Every template includes **"View full demo"** (zero sign-in required) and **"Use this template"**.
3. **Cloud Drafts, Publishing & Draft Freeze**:
   - Drafts are saved with automatic local and cloud persistence.
   - **Draft Freeze Guarantee**: Clicking *Publish* freezes a public snapshot at `/i/<slug>`. Subsequent draft edits in the Studio remain strictly private until the organizer clicks *Publish Update*.
   - Organizer Dashboard (`#/dashboard`) displays all drafts, published status, guest RSVP stats, and CSV export.
   - Unpublish support switches live links to a branded offline state.
4. **Real RSVP Tracking & Deduplication**:
   - Interactive guest RSVP with attendance status, party size, and dietary notes.
   - Unique guest tokens prevent duplicate counts; re-submissions update existing guest party sizes.
5. **AI Copy Assistant with Preview Diff**:
   - Serverless AI endpoint (`api/ai.ts`) supporting Gemini, OpenAI, and Claude with an intelligent deterministic fallback rule engine.
   - Shows before/after diffs before applying changes, with one-click undo.

---

## 📖 Detailed Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Vercel step-by-step deployment, DNS configuration for `invite.<domain>`, Supabase SQL migrations, and instant zero-downtime rollback.
- **[docs/CUSTOMIZATION.md](./docs/CUSTOMIZATION.md)** — Owner customization manual in English & Hinglish, complete directory layout, and 6 step-by-step worked examples.
- **[docs/ADD-A-TEMPLATE.md](./docs/ADD-A-TEMPLATE.md)** — Instructions for scaffolding and registering new templates in the catalog.
- **[.env.example](./.env.example)** — Environment variable configuration reference for AI and database integrations.
