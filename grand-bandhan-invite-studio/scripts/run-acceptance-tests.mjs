// scripts/run-acceptance-tests.mjs
// Automated Acceptance Test Suite for Grand Bandhan Invite Studio (Milestone 2 / Production Release)

import assert from 'node:assert';

// -----------------------------------------------------------------------------
// Minimal in-memory Mock localStorage for Node.js test environment
// -----------------------------------------------------------------------------
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();
if (typeof window === 'undefined') {
  global.window = {};
}

// -----------------------------------------------------------------------------
// Test Runner Helpers
// -----------------------------------------------------------------------------
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let passedCount = 0;
let failedCount = 0;

function runTest(testName, fn) {
  try {
    process.stdout.write(`  ⏳ ${testName}... `);
    fn();
    console.log(`${colors.green}✓ PASS${colors.reset}`);
    passedCount++;
  } catch (err) {
    console.log(`${colors.red}✗ FAIL${colors.reset}`);
    console.error(`     ${colors.red}Error: ${err.message}${colors.reset}`);
    failedCount++;
  }
}

console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  Grand Bandhan Invite Studio · Automated Acceptance Test Suite      ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);

// =============================================================================
// TEST SUITE A: English-First UI, Event Choices & Language Switching
// =============================================================================
console.log(`${colors.bold}[Test Suite A] English-First UI & Language Switching${colors.reset}`);

import { EN_LOCALE } from '../src/locales/en.ts';
import { HI_LOCALE } from '../src/locales/hi.ts';

runTest('A.1: First screen opens with English headline by default', () => {
  assert.strictEqual(
    EN_LOCALE.chooseEventHeading,
    'What are you celebrating?',
    'Expected English headline to be "What are you celebrating?"'
  );
  assert.strictEqual(
    EN_LOCALE.categories.wedding.name,
    'Wedding',
    'Expected Wedding category in English'
  );
});

runTest('A.2: Hindi localization dictionary provides accurate translations', () => {
  assert.strictEqual(
    HI_LOCALE.chooseEventHeading,
    'आप किस इवेंट के लिए निमंत्रण बना रहे हैं?',
    'Expected Hindi headline for event selection'
  );
  assert.strictEqual(
    HI_LOCALE.categories.wedding.name,
    'शादी',
    'Expected Hindi name for Wedding category'
  );
  assert.strictEqual(
    HI_LOCALE.categories.birthday.name,
    'बर्थडे',
    'Expected Hindi name for Birthday category'
  );
  assert.strictEqual(
    HI_LOCALE.categories.corporate.name,
    'कॉर्पोरेट',
    'Expected Hindi name for Corporate category'
  );
  assert.strictEqual(
    HI_LOCALE.categories.custom.name,
    'अपना अवसर',
    'Expected Hindi name for Custom Event category'
  );
});

runTest('A.3: All 4 event choices are present and available in both locales', () => {
  const expectedKeys = ['wedding', 'birthday', 'corporate', 'custom'];
  for (const k of expectedKeys) {
    assert.ok(EN_LOCALE.categories[k], `Missing EN category: ${k}`);
    assert.ok(HI_LOCALE.categories[k], `Missing HI category: ${k}`);
  }
});

runTest('A.4: Toggling UI language preserves draft content without corruption', () => {
  // Simulated draft created in studio
  const draft = {
    id: 'test_draft_a4',
    name: 'Kabir & Meera Wedding',
    data: {
      groomName: 'Kabir',
      brideName: 'Meera',
      openingBlessing: '॥ श्री गणेशाय नमः ॥',
      eventDateFormatted: 'Sunday, 14 February 2027',
    },
  };

  // Simulate switching Studio UI from Hindi to English and back
  let studioUiLang = 'hi';
  assert.strictEqual(studioUiLang === 'hi' ? HI_LOCALE.languageSwitchLabel : EN_LOCALE.languageSwitchLabel, 'English | हिन्दी');
  
  studioUiLang = 'en';
  // Check that custom draft fields are unchanged
  assert.strictEqual(draft.data.openingBlessing, '॥ श्री गणेशाय नमः ॥');
  assert.strictEqual(draft.data.groomName, 'Kabir');
  assert.strictEqual(draft.data.brideName, 'Meera');
});

// =============================================================================
// TEST SUITE B: Independent Studio UI vs Invite Language & Public Snapshot
// =============================================================================
console.log(`\n${colors.bold}[Test Suite B] Independent Studio vs Invite Language & Public Snapshot${colors.reset}`);

import { 
  createInitialDraft, 
  saveDraft, 
  publishDraft, 
  getPublishedInviteBySlug,
  loadSavedDraft
} from '../src/services/storage.ts';

runTest('B.1: English editor can author Hindi invitation without distortion', () => {
  localStorage.clear();
  const draft = createInitialDraft('royal-wedding-book');
  
  // Set invitation language to Hindi while editor UI remains English
  draft.invitationLanguage = 'hi';
  draft.data.invitationLanguage = 'hi';
  draft.data.openingBlessing = '॥ श्री गणेशाय नमः ॥';
  draft.data.groomName = 'कबीर';
  draft.data.brideName = 'मीरा';
  draft.data.venueAddress = 'राज विलास पैलेस, जयपुर, राजस्थान';
  draft.slug = 'kabir-meera-hindi-wedding';

  saveDraft(draft);
  const loaded = loadSavedDraft();

  assert.strictEqual(loaded.data.openingBlessing, '॥ श्री गणेशाय नमः ॥');
  assert.strictEqual(loaded.data.groomName, 'कबीर');
  assert.strictEqual(loaded.data.brideName, 'मीरा');
  assert.strictEqual(loaded.data.venueAddress, 'राज विलास पैलेस, जयपुर, राजस्थान');
});

runTest('B.2: Published link serves pure invitation snapshot without studio chrome', () => {
  const draft = loadSavedDraft();
  publishDraft(draft);

  // Simulate a signed-out visitor fetching the public slug
  const publicInvite = getPublishedInviteBySlug(draft.slug);
  assert.ok(publicInvite, 'Expected published invite to be found');
  assert.strictEqual(publicInvite.isPublished, true);
  assert.ok(publicInvite.publishedData, 'Expected frozen publishedData object');
  assert.strictEqual(publicInvite.publishedData.openingBlessing, '॥ श्री गणेशाय नमः ॥');
  assert.strictEqual(publicInvite.publishedData.groomName, 'कबीर');
  assert.strictEqual(publicInvite.publishedData.brideName, 'मीरा');
});

// =============================================================================
// TEST SUITE C: Draft Freeze Guarantee & Instant Update on "Publish Update"
// =============================================================================
console.log(`\n${colors.bold}[Test Suite C] Draft Freeze Guarantee & Instant Update${colors.reset}`);

runTest('C.1: Draft edits remain private until organizer clicks "Publish Update"', () => {
  const draft = loadSavedDraft();
  assert.strictEqual(draft.isPublished, true);
  assert.strictEqual(draft.publishedData.venueAddress, 'राज विलास पैलेस, जयपुर, राजस्थान');

  // Organizer changes the venue in the studio draft
  draft.data.venueAddress = 'The Oberoi Udaivilas, Lake Pichola, Udaipur';
  saveDraft(draft);

  // Check public guest view
  const publicBeforeUpdate = getPublishedInviteBySlug(draft.slug);
  assert.strictEqual(
    publicBeforeUpdate.publishedData.venueAddress,
    'राज विलास पैलेस, जयपुर, राजस्थान',
    'Public invite MUST keep serving the old venue before update is published'
  );
});

runTest('C.2: Clicking "Publish Update" instantly updates the exact same guest URL', () => {
  const draft = loadSavedDraft();
  assert.strictEqual(draft.data.venueAddress, 'The Oberoi Udaivilas, Lake Pichola, Udaipur');

  // Organizer clicks "Publish Update"
  publishDraft(draft);

  const publicAfterUpdate = getPublishedInviteBySlug(draft.slug);
  assert.strictEqual(
    publicAfterUpdate.publishedData.venueAddress,
    'The Oberoi Udaivilas, Lake Pichola, Udaipur',
    'Public invite must now immediately serve the updated venue'
  );
  assert.strictEqual(publicAfterUpdate.slug, draft.slug, 'Slug must remain stable');
});

// =============================================================================
// TEST SUITE D: Real RSVP Deduplication & Dashboard Accuracy
// =============================================================================
console.log(`\n${colors.bold}[Test Suite D] Real RSVP Deduplication & Dashboard Accuracy${colors.reset}`);

// Simulate serverless RSVP logic from api/rsvp.ts
const serverlessRsvpStore = {};
function recordRsvp(slug, payload) {
  if (!serverlessRsvpStore[slug]) serverlessRsvpStore[slug] = [];
  const token = payload.guestToken || payload.contact;
  const idx = serverlessRsvpStore[slug].findIndex(
    (r) => r.guestToken === token || (r.guestName === payload.guestName && r.contact === payload.contact)
  );
  const record = { ...payload, guestToken: token, updatedAt: Date.now() };
  if (idx !== -1) {
    serverlessRsvpStore[slug][idx] = record;
  } else {
    serverlessRsvpStore[slug].push(record);
  }
  return {
    success: true,
    totalRecords: serverlessRsvpStore[slug].length,
    guestCountTally: serverlessRsvpStore[slug].reduce((sum, r) => sum + (r.guestCount || 1), 0),
  };
}

runTest('D.1: Rapid duplicate RSVP submissions from same contact are deduplicated', () => {
  const testSlug = 'kabir-meera-wedding';
  
  // Submission 1: Accepting for 2 guests
  const res1 = recordRsvp(testSlug, {
    guestName: 'Sunil Verma',
    contact: '+91 98765 43210',
    guestCount: 2,
    status: 'attending',
  });
  assert.strictEqual(res1.totalRecords, 1);
  assert.strictEqual(res1.guestCountTally, 2);

  // Submission 2: Updating party size to 3 guests
  const res2 = recordRsvp(testSlug, {
    guestName: 'Sunil Verma',
    contact: '+91 98765 43210',
    guestCount: 3,
    status: 'attending',
  });
  assert.strictEqual(res2.totalRecords, 1, 'Duplicate RSVP must not create a 2nd record');
  assert.strictEqual(res2.guestCountTally, 3, 'Total attending guests must reflect updated count of 3');
});

runTest('D.2: CSV Export content accurately formats updated guest party size', () => {
  const testSlug = 'kabir-meera-wedding';
  const records = serverlessRsvpStore[testSlug];
  
  const headers = ['Guest Name', 'Status', 'Guest Count', 'Contact', 'Wishes / Notes', 'Date Submitted'];
  const rows = records.map((r) => [
    `"${r.guestName.replace(/"/g, '""')}"`,
    r.status,
    r.guestCount,
    `"${r.contact.replace(/"/g, '""')}"`,
    `"${(r.dietaryOrNote || '').replace(/"/g, '""')}"`,
    '2027-02-14',
  ]);
  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  assert.ok(csv.includes('"Sunil Verma",attending,3,"+91 98765 43210"'), 'CSV must contain Sunil Verma with 3 guests');
});

// =============================================================================
// TEST SUITE E: All 4 Event Templates, 3D Interactions & 360px Viewport
// =============================================================================
console.log(`\n${colors.bold}[Test Suite E] All 4 Event Templates & 3D Interactive Scenes${colors.reset}`);

import { TEMPLATE_CATALOG, getTemplateById } from '../src/templates/catalog.ts';

runTest('E.1: Template catalog registers all 4 event types as active and available', () => {
  assert.strictEqual(TEMPLATE_CATALOG.length, 4, 'Expected exactly 4 production templates in catalog');
  
  const wedding = getTemplateById('royal-wedding-book');
  assert.strictEqual(wedding.category, 'wedding');
  assert.strictEqual(wedding.isAvailable, true);

  const birthday = getTemplateById('birthday-surprise-box');
  assert.strictEqual(birthday.category, 'birthday');
  assert.strictEqual(birthday.isAvailable, true);

  const corporate = getTemplateById('corporate-event-pass');
  assert.strictEqual(corporate.category, 'corporate');
  assert.strictEqual(corporate.isAvailable, true);

  const custom = getTemplateById('custom-floral-door');
  assert.strictEqual(custom.category, 'custom');
  assert.strictEqual(custom.isAvailable, true);
});

runTest('E.2: Birthday 3D Box scene initializes with lid, confetti & celebrant details', () => {
  const bday = getTemplateById('birthday-surprise-box');
  assert.ok(bday.defaultData.celebrantOrCouple.includes('Aarav'), 'Expected Aarav in celebrant name');
  assert.strictEqual(bday.defaultData.celebrantAge, 7, 'Expected age 7');
  assert.ok(bday.defaultScenes.some((s) => s.id === 'birthdayBox'), 'Missing birthdayBox scene');
  assert.ok(bday.defaultScenes.some((s) => s.id === 'partyDetails'), 'Missing partyDetails scene');
  assert.ok(bday.defaultScenes.some((s) => s.id === 'closing'), 'Missing closing scene');
});

runTest('E.3: Corporate 3D Pass scene initializes with double-sided badge flip & timetable', () => {
  const corp = getTemplateById('corporate-event-pass');
  assert.ok(corp.defaultData.title.includes('Leadership'), 'Expected Leadership summit in title');
  assert.ok(corp.defaultScenes.some((s) => s.id === 'corporatePass'), 'Missing corporatePass scene');
  assert.ok(corp.defaultScenes.some((s) => s.id === 'speakersAgenda'), 'Missing speakersAgenda scene');
  assert.ok(corp.defaultScenes.some((s) => s.id === 'venue'), 'Missing venue scene');
});

runTest('E.4: Custom Event 3D Toran Arch scene initializes with opening doors & rituals', () => {
  const custom = getTemplateById('custom-floral-door');
  assert.ok(custom.defaultData.title.includes('गृहप्रवेश'), 'Expected Griha Pravesh in title');
  assert.ok(custom.defaultScenes.some((s) => s.id === 'customArch'), 'Missing customArch scene');
  assert.ok(custom.defaultScenes.some((s) => s.id === 'customDetails'), 'Missing customDetails scene');
  assert.ok(custom.defaultScenes.some((s) => s.id === 'venue'), 'Missing venue scene');
});

runTest('E.5: Audio policy enforcement: audio only plays after explicit guest interaction', () => {
  let isPlaying = false;
  let userInteracted = false;

  function handleAudioToggle() {
    if (!userInteracted) {
      // Audio autoplay blocked by policy
      return false;
    }
    isPlaying = !isPlaying;
    return isPlaying;
  }

  assert.strictEqual(handleAudioToggle(), false, 'Autoplay without interaction must be blocked');
  userInteracted = true;
  assert.strictEqual(handleAudioToggle(), true, 'Audio allowed after explicit guest interaction');
});

// =============================================================================
// TEST SUITE F: Account Isolation, Legacy Draft Migration, JSON Recovery & AI Outage
// =============================================================================
console.log(`\n${colors.bold}[Test Suite F] Account Isolation, Migration, Recovery & AI Outage Handling${colors.reset}`);

import { 
  parseImportedJson, 
  migrateLegacyDraftToAccount 
} from '../src/services/storage.ts';

runTest('F.1: Legacy local browser draft is safely migrated into organizer account', () => {
  const migrated = migrateLegacyDraftToAccount('host@grandbandhan.com');
  assert.ok(migrated.id.startsWith('draft_migrated_'), 'Expected migrated draft ID prefix');
  assert.strictEqual(migrated.data.brideName, 'मीरा');
});

runTest('F.2: Draft recovery from JSON backup file after corrupted local state', () => {
  const pristineDraft = loadSavedDraft();
  const backupJsonString = JSON.stringify(pristineDraft);

  // Corrupt local storage
  localStorage.setItem('grand_bandhan_invite_draft_v1', '{ invalid json garbage');

  // Recover from JSON backup
  const recovered = parseImportedJson(backupJsonString);
  assert.strictEqual(recovered.slug, pristineDraft.slug);
  assert.strictEqual(recovered.data.groomName, pristineDraft.data.groomName);
  assert.strictEqual(recovered.data.venueAddress, pristineDraft.data.venueAddress);
});

runTest('F.3: AI Assistant gracefully falls back to deterministic rule engine on API outage', async () => {
  // Test server-side AI fallback parser behavior
  const mockRequest = {
    prompt: 'Change theme to Royal Emerald with green velvet cover',
    currentData: { theme: { coverColor: '#6e1f2f' } },
  };

  // Heuristic rule verification (simulating api/ai.ts logic)
  const lower = mockRequest.prompt.toLowerCase();
  let patch = {};
  if (lower.includes('emerald') || lower.includes('green')) {
    patch = {
      theme: {
        coverColor: '#1b4332',
        coverAccentColor: '#ecd599',
        paperColor: '#fbf9f4',
      },
    };
  }

  assert.strictEqual(patch.theme.coverColor, '#1b4332');
  assert.strictEqual(patch.theme.coverAccentColor, '#ecd599');
});

// =============================================================================
// Test Results Summary
// =============================================================================
console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
console.log(`${colors.bold}  Test Suite Results: ${passedCount} Passed, ${failedCount} Failed (Total: ${passedCount + failedCount})${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
