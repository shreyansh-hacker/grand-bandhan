# Grand Bandhan Invite Studio · Owner Customization Guide (मालिक कस्टमाइज़ेशन गाइड)

Welcome! This guide explains how to customize text, fonts, colors, branding, animations, RSVP settings, and templates in **Grand Bandhan Invite Studio** across all four event categories (**Wedding, Birthday, Corporate, and Custom Event**).

You can customize anything in two ways:
1. **Visually via the Browser Studio UI**: Directly click elements on the canvas or use the right-hand Properties Panel.
2. **Directly via Code Files**: Open clean, well-named TypeScript files in VS Code or your preferred text editor.

---

## 1. Quick Reference Customization Matrix (त्वरित संदर्भ तालिका)

| What I Want to Change | Visual Editor Control | Direct Source File & Path | Example Change | Verification |
| :--- | :--- | :--- | :--- | :--- |
| **1. Change Wedding Blessing / Mantra**<br>(मंगलाचरण बदलना) | Click "॥ श्री गणेशाय नमः ॥" on canvas > Edit text in right Properties panel. | [`src/templates/royal-wedding-book/template.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/royal-wedding-book/template.ts) (`openingBlessing`) | `openingBlessing: "स्नेहिल आमंत्रण"` | Open Guest Preview (`#/preview`); first book page immediately reflects the new mantra. |
| **2. Change Brand Logo & Wordmark**<br>(ब्रांड लोगो बदलना) | Top Studio header shows logo. | `public/assets/brand/logo.svg` & [`src/config/brand.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/config/brand.ts) | Replace `public/assets/brand/logo.svg` with your brand SVG. | Refresh `http://localhost:5173`; new logo appears in studio header, footer & previews. |
| **3. Wedding Theme Colors**<br>(वाइन/गोल्ड से पन्ना/आइवरी) | In right Properties panel, select 'Royal Emerald & Ivory' preset. | [`src/templates/royal-wedding-book/theme.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/royal-wedding-book/theme.ts) (`coverColor`, `coverAccentColor`) | `coverColor: '#1b4332'`, `coverAccentColor: '#ecd599'` | Book velvet turns emerald green with ivory gold foil borders on canvas and guest view. |
| **4. Birthday Box Theme & Celebrant Age**<br>(बर्थडे बॉक्स रंग व आयु) | Select Birthday template > Edit "Celebrant Name" & "Age" in Properties panel. | [`src/templates/birthday-surprise-box/template.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/birthday-surprise-box/template.ts) | `celebrantName: 'Aarav'`, `age: '7'` | 3D gift box opens with confetti and displays "Aarav is turning 7!" |
| **5. Corporate Pass Brand & Speakers**<br>(कॉर्पोरेट पास ब्रांडिंग व स्पीकर्स) | Select Corporate template > Edit "Company Name", "Pass Type" & "Keynote Speakers". | [`src/templates/corporate-event-pass/template.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/corporate-event-pass/template.ts) | `companyName: 'TechCorp India'`, `primaryColor: '#0f172a'` | 3D lanyard badge flips around Y-axis with sleek corporate branding and speaker schedule. |
| **6. Custom Event Occasion & Toran Arch**<br>(कस्टम इवेंट / गृह प्रवेश) | Select Custom template > Edit "Occasion Name" (e.g. गृह प्रवेश / Housewarming). | [`src/templates/custom-floral-arch/template.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/custom-floral-arch/template.ts) | `occasionName: 'शुभ गृह प्रवेश'`, `hostName: 'शर्मा परिवार'` | 3D marigold toran arch doors open to reveal housewarming festivities and venue directions. |
| **7. Enable/Disable RSVP & Party Size**<br>(आरएसवीपी सेटिंग्स) | In Properties panel, scroll to "Guest RSVP Settings" section. | [`src/templates/royal-wedding-book/template.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/royal-wedding-book/template.ts) (`rsvpEnabled`, `rsvpAllowPartySize`) | `rsvpEnabled: true`, `rsvpAllowPartySize: true` | Guest invitation displays interactive RSVP card with attendee counter. |
| **8. Studio UI Language vs Invite Language**<br>(स्टूडियो भाषा बनाम निमंत्रण भाषा) | Top header switcher sets Studio UI (`English \| हिन्दी`). Properties panel sets Invitation Language. | [`src/locales/en.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/locales/en.ts) & [`src/locales/hi.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/locales/hi.ts) | Studio UI independent of card text. | English editor can design pure Hindi invitations without text corruption. |

---

## 2. Directory Layout & Key Files

```text
grand-bandhan-invite-studio/
├── api/                           # Vercel Serverless Functions
│   ├── ai.ts                      # AI Assistant endpoint (Gemini/OpenAI/Rule engine)
│   ├── rsvp.ts                    # RSVP submission & token deduplication
│   ├── publish.ts                 # Published snapshot freeze endpoint
│   └── invites/[slug].ts          # Social Open Graph / WhatsApp preview generator
├── public/
│   ├── assets/brand/              # Grand Bandhan logo and wordmark
│   └── assets/templates/          # High-resolution 3D textures, emblems, audio
├── src/
│   ├── components/
│   │   ├── editor/                # Visual Studio toolbar, canvas, scene list, properties
│   │   │   ├── EditorToolbar.tsx  # Top bar with language switcher & publish status
│   │   │   ├── PropertiesPanel.tsx# Element properties, fonts, colors, RSVP settings
│   │   │   └── AiAssistantPanel.tsx # AI diff preview and suggestion panel
│   │   └── invitation/            # 3D interactive scene renderers
│   │       ├── BookCoverScene.tsx # 3D perspective velvet book opening
│   │       ├── BirthdayBoxScene.tsx # 3D gift box with opening lid & confetti
│   │       ├── CorporatePassScene.tsx # 3D double-sided badge flip
│   │       ├── CustomArchScene.tsx # 3D floral toran arch doors
│   │       ├── SaveTheDateScene.tsx # Unrolling scroll with draggable tassel
│   │       ├── FestivitiesScene.tsx # Swipeable event cards (Haldi, Mehendi, etc.)
│   │       └── RsvpScene.tsx      # RSVP form with duplicate prevention
│   ├── locales/                   # English and Hindi localization
│   │   ├── en.ts                  # English UI strings
│   │   ├── hi.ts                  # Hindi UI strings
│   │   └── index.tsx              # LanguageProvider & LanguageSwitcher component
│   ├── pages/
│   │   ├── EventSelection.tsx     # English-first "What are you celebrating?" picker
│   │   ├── Gallery.tsx            # Multi-template catalog with demo & edit buttons
│   │   ├── Studio.tsx             # Visual editor with real-time canvas
│   │   ├── GuestPreview.tsx       # Fullscreen guest simulation with replay
│   │   ├── Dashboard.tsx          # Organizer drafts, published links & RSVP table
│   │   └── PublishedGuestPage.tsx # Public /i/<slug> route for live guests
│   ├── services/
│   │   └── storage.ts             # Multi-draft storage, publish freeze, CSV export
│   └── templates/                 # 4 Production Templates
│       ├── catalog.ts             # Template registry with categories
│       ├── royal-wedding-book/    # Wedding template & theme
│       ├── birthday-surprise-box/ # Birthday template & theme
│       ├── corporate-event-pass/  # Corporate template & theme
│       └── custom-floral-arch/    # Custom event template & theme
├── .env.example                   # Environment variables template
├── DEPLOYMENT.md                  # Vercel deployment & rollback manual
└── vercel.json                    # Routing rewrites for SPA & API
```

---

## 3. The 6 Detailed Worked Examples

### Example 1: Change "॥ श्री गणेशाय नमः ॥" to "स्नेहिल आमंत्रण" (Wedding Mantra)
1. **Via Visual Studio Editor**:
   - Open Studio (`#/studio`).
   - Click on the text `"॥ श्री गणेशाय नमः ॥"` on the canvas.
   - In the right-hand **Properties Panel**, change the text field to `स्नेहिल आमंत्रण`.
   - Optionally select font `Noto Serif Devanagari` and adjust color or size.
2. **Via Code File**:
   - Open [`src/templates/royal-wedding-book/template.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/royal-wedding-book/template.ts).
   - Locate line `openingBlessing`:
     ```ts
     openingBlessing: 'स्नेहिल आमंत्रण',
     openingBlessingFont: 'Noto Serif Devanagari',
     openingBlessingColor: '#dfba6a',
     ```
   - Save the file. Vite hot module reloading immediately updates the canvas.

---

### Example 2: Change Brand Logo and Wordmark
1. Prepare your logo in SVG or PNG format.
2. Replace `public/assets/brand/logo.svg` with your new file.
3. Open [`src/config/brand.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/config/brand.ts):
   ```ts
   export const BRAND_CONFIG = {
     name: 'Grand Bandhan',
     hindiName: 'ग्रांड बंधन',
     logoUrl: '/assets/brand/logo.svg',
     tagline: 'Crafted Moments, Eternal Memories',
     taglineHi: 'शानदार आयोजनों का डिजिटल निमंत्रण',
   };
   ```
4. Verify at `http://localhost:5173` — the top header, footer, and loading screens render your updated logo.

---

### Example 3: Change Wedding Theme from Royal Wine to Emerald & Ivory
1. **Via Visual Studio Editor**:
   - In the Studio, deselect elements by clicking canvas background.
   - In the Properties panel under **Royal Color Palettes**, click **Royal Emerald & Ivory (शाही पन्ना व आइवरी)**.
2. **Via Code File**:
   - Open [`src/templates/royal-wedding-book/theme.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/royal-wedding-book/theme.ts):
     ```ts
     export const ROYAL_WEDDING_THEME = {
       coverColor: '#1b4332',         // Deep Emerald Green
       coverAccentColor: '#ecd599',   // Champagne Ivory Gold
       paperColor: '#fbf9f4',         // Warm handmade ivory paper
       textColor: '#1b1716',
       headingFont: 'Playfair Display',
       bodyFont: 'Montserrat',
     };
     ```
3. Open Guest Preview (`#/preview`); book cover is deep emerald with ivory-gold foil embossing.

---

### Example 4: Customize Birthday Gift Box Template
1. Open Studio with the **Birthday Surprise Box** template.
2. In the Properties panel, configure:
   - **Celebrant Name**: `Aarav`
   - **Age**: `7`
   - **Party Theme**: `Superhero & Galaxy Adventures`
   - **Venue**: `SkyJumper Trampoline Park, Gurgaon`
3. Click **Guest Preview**. On tap or click, the 3D gift box lid pops open, multi-color confetti bursts onto the screen, and Aarav's 7th birthday celebration details appear.

---

### Example 5: Customize Corporate Event Pass & Keynote Speakers
1. Open [`src/templates/corporate-event-pass/template.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/corporate-event-pass/template.ts):
2. Update the session schedule:
   ```ts
   {
     id: 'session-ai',
     time: '11:00 AM - 12:30 PM',
     title: 'Future of Generative AI in Enterprise',
     speaker: 'Dr. Priya Sharma (VP, AI Research)',
     hall: 'Hall A - Main Auditorium'
   }
   ```
3. In Guest Preview, tap the lanyard badge. The card performs a realistic 3D Y-axis flip revealing the attendee pass, barcode, and agenda timetable.

---

### Example 6: Add a 5th Custom Template to the Catalog
1. Open [`src/templates/catalog.ts`](file:///c:/Users/shrey/Desktop/odoooo/Grand-Bandhan/grand-bandhan-invite-studio/src/templates/catalog.ts).
2. Append a new template registration:
   ```ts
   {
     id: 'anniversary-silver-jubilee',
     nameEn: 'Silver Jubilee Memoir Book',
     nameHi: 'सिल्वर जुबली स्मृति ग्रंथ',
     category: 'custom',
     descriptionEn: 'Silver foil memoir celebrating 25 years of togetherness.',
     descriptionHi: '25 वर्ष के वैवाहिक जीवन का रजत जयंती डिजिटल निमंत्रण।',
     badgeEn: 'New · Silver Foil',
     badgeHi: 'नया · रजत संस्करण',
     previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/mandap.svg',
     isAvailable: true,
     isFeatured: true,
     defaultData: { ...DEFAULT_CUSTOM_ARCH_DATA, occasionName: 'Silver Jubilee (25th Anniversary)' },
     defaultScenes: DEFAULT_CUSTOM_SCENES,
   }
   ```
3. Open the Gallery (`#/gallery`). The new template appears with working "View full demo" and "Use this template" buttons.

---

## 4. Publishing & Draft Freezing Mechanics

1. **Private Working Drafts**: When you edit an invitation in the Studio, changes are saved locally to your working draft.
2. **Publishing a Snapshot**: Clicking **Publish** creates a frozen public snapshot (`publishedData`) assigned to `/i/<slug>`.
3. **Draft Freeze Guarantee**:
   - Guests visiting `/i/<slug>` only see the published snapshot.
   - Any further edits you make in the Studio remain strictly private drafts.
   - The public link updates *only* when you explicitly click **Publish Update**.
4. **Unpublishing**: In the Organizer Dashboard (`#/dashboard`), click **Unpublish**. The link immediately switches to an elegant *"This invitation is currently offline"* page.
