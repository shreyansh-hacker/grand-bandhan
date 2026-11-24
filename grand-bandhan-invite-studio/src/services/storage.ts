import { InvitationDraft, GenericInvitationData, RsvpRecord } from '../types/invitation';
import { DEFAULT_ROYAL_WEDDING_DATA, DEFAULT_SCENES } from '../templates/royal-wedding-book/template';
import { DEFAULT_BIRTHDAY_DATA, DEFAULT_BIRTHDAY_SCENES } from '../templates/birthday-surprise-box/template';
import { DEFAULT_CORPORATE_DATA, DEFAULT_CORPORATE_SCENES } from '../templates/corporate-event-pass/template';
import { DEFAULT_CUSTOM_DATA, DEFAULT_CUSTOM_SCENES } from '../templates/custom-floral-arch/template';

const DRAFTS_INDEX_KEY = 'gb_invite_drafts_v2';
const PUBLISHED_INDEX_KEY = 'gb_published_invites_v2';
const CURRENT_DRAFT_KEY = 'grand_bandhan_invite_draft_v1';
const USER_ACCOUNT_KEY = 'gb_user_account_v1';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
}

export function getUserAccount(): UserAccount {
  try {
    const raw = localStorage.getItem(USER_ACCOUNT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    id: 'user_default_owner',
    email: 'organizer@grandbandhan.com',
    name: 'Grand Bandhan Host',
    isLoggedIn: true,
  };
}

export function saveUserAccount(account: UserAccount): void {
  localStorage.setItem(USER_ACCOUNT_KEY, JSON.stringify(account));
}

export function createInitialDraft(templateId = 'royal-wedding-book'): InvitationDraft {
  let defaultData: GenericInvitationData;
  let defaultScenes = DEFAULT_SCENES;
  let draftName = 'Royal Wedding Invitation';
  let category: any = 'wedding';
  let slug = 'kabir-meera-wedding';

  if (templateId === 'birthday-surprise-box') {
    defaultData = JSON.parse(JSON.stringify(DEFAULT_BIRTHDAY_DATA));
    defaultScenes = JSON.parse(JSON.stringify(DEFAULT_BIRTHDAY_SCENES));
    draftName = "Aarav's 7th Birthday Party";
    category = 'birthday';
    slug = 'aarav-7th-birthday';
  } else if (templateId === 'corporate-event-pass') {
    defaultData = JSON.parse(JSON.stringify(DEFAULT_CORPORATE_DATA));
    defaultScenes = JSON.parse(JSON.stringify(DEFAULT_CORPORATE_SCENES));
    draftName = 'Tech Leadership Summit 2027';
    category = 'corporate';
    slug = 'tech-summit-2027';
  } else if (templateId === 'custom-floral-door') {
    defaultData = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_DATA));
    defaultScenes = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_SCENES));
    draftName = 'Shubh Griha Pravesh';
    category = 'custom';
    slug = 'sharma-housewarming';
  } else {
    defaultData = JSON.parse(JSON.stringify(DEFAULT_ROYAL_WEDDING_DATA));
  }

  const newDraft: InvitationDraft = {
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    slug,
    templateId,
    templateVersion: '2.0.0',
    name: draftName,
    category,
    invitationLanguage: defaultData.invitationLanguage || 'bilingual',
    lastModified: Date.now(),
    isPublished: false,
    scenes: defaultScenes,
    data: defaultData,
  };

  saveDraft(newDraft);
  return newDraft;
}

export function getAllDrafts(): InvitationDraft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_INDEX_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InvitationDraft[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Error reading drafts list:', err);
  }

  // If no multi-draft list yet, check legacy single draft
  const current = loadSavedDraft();
  const list = [current];
  saveAllDrafts(list);
  return list;
}

export function saveAllDrafts(drafts: InvitationDraft[]): void {
  try {
    localStorage.setItem(DRAFTS_INDEX_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.error('Error saving drafts list:', err);
  }
}

export function loadSavedDraft(): InvitationDraft {
  try {
    const raw = localStorage.getItem(CURRENT_DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InvitationDraft;
      if (parsed && parsed.data && parsed.scenes) {
        if (!parsed.slug) parsed.slug = 'kabir-meera-wedding';
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not parse saved draft, initializing fresh template:', err);
  }
  const fallback = createInitialDraft();
  saveDraft(fallback);
  return fallback;
}

export function saveDraft(draft: InvitationDraft): void {
  try {
    draft.lastModified = Date.now();
    localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(draft));

    // Update in multi-draft list
    const all = getAllDrafts();
    const idx = all.findIndex((d) => d.id === draft.id);
    if (idx !== -1) {
      all[idx] = draft;
    } else {
      all.unshift(draft);
    }
    saveAllDrafts(all);
  } catch (err) {
    console.error('Error saving draft:', err);
  }
}

export function publishDraft(draft: InvitationDraft): InvitationDraft {
  draft.isPublished = true;
  draft.publishedAt = Date.now();
  // Freeze published copy so draft changes stay private until "Publish update"
  draft.publishedData = JSON.parse(JSON.stringify(draft.data));
  saveDraft(draft);

  // Store in published registry
  try {
    const published = getPublishedRegistry();
    published[draft.slug] = draft;
    localStorage.setItem(PUBLISHED_INDEX_KEY, JSON.stringify(published));
  } catch (err) {
    console.error('Error publishing invite:', err);
  }

  // Also try syncing to serverless API
  if (typeof window !== 'undefined') {
    fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft }),
    }).catch(() => {
      // safe fallback
    });
  }

  return draft;
}

export function unpublishDraft(draftId: string): InvitationDraft | null {
  const all = getAllDrafts();
  const draft = all.find((d) => d.id === draftId);
  if (!draft) return null;

  draft.isPublished = false;
  draft.publishedData = undefined;
  saveDraft(draft);

  try {
    const published = getPublishedRegistry();
    delete published[draft.slug];
    localStorage.setItem(PUBLISHED_INDEX_KEY, JSON.stringify(published));
  } catch (err) {
    console.error('Error unpublishing:', err);
  }

  // Also notify serverless endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/publish', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: draft.slug }),
    }).catch(() => {});
  }

  return draft;
}

export function getPublishedRegistry(): Record<string, InvitationDraft> {
  try {
    const raw = localStorage.getItem(PUBLISHED_INDEX_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function getPublishedInviteBySlug(slug: string): InvitationDraft | null {
  const registry = getPublishedRegistry();
  if (registry[slug] && registry[slug].isPublished) {
    return registry[slug];
  }

  // Fallback check in drafts
  const all = getAllDrafts();
  const match = all.find((d) => d.slug === slug && d.isPublished);
  return match || null;
}

export function getRsvpsForSlug(slug: string): RsvpRecord[] {
  try {
    const raw = localStorage.getItem(`gb_rsvps_${slug}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function exportRsvpsCsv(slug: string, eventName: string): void {
  const rsvps = getRsvpsForSlug(slug);
  const headers = ['Guest Name', 'Status', 'Guest Count', 'Contact', 'Wishes / Notes', 'Date Submitted'];
  const rows = rsvps.map((r) => [
    `"${r.guestName.replace(/"/g, '""')}"`,
    r.status,
    r.guestCount,
    `"${r.contact.replace(/"/g, '""')}"`,
    `"${(r.dietaryOrNote || '').replace(/"/g, '""')}"`,
    new Date(r.submittedAt).toLocaleString(),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rsvps-${slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function resetDraftToDefault(): InvitationDraft {
  const fresh = createInitialDraft();
  saveDraft(fresh);
  return fresh;
}

export function exportDraftAsJson(draft: InvitationDraft): void {
  const jsonStr = JSON.stringify(draft, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `grand-bandhan-draft-${draft.slug || draft.templateId}-${dateStr}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function parseImportedJson(jsonText: string): InvitationDraft {
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON format: must be an object');
  }
  if (!parsed.data || !parsed.scenes || !Array.isArray(parsed.scenes)) {
    throw new Error('Invalid draft file: missing required "data" or "scenes" properties');
  }
  parsed.lastModified = Date.now();
  if (!parsed.id) parsed.id = `draft_imported_${Date.now()}`;
  if (!parsed.slug) parsed.slug = `imported-${Date.now().toString(36)}`;
  saveDraft(parsed);
  return parsed as InvitationDraft;
}

export function migrateLegacyDraftToAccount(accountEmail: string): InvitationDraft {
  const legacy = loadSavedDraft();
  legacy.id = `draft_migrated_${Date.now()}`;
  saveDraft(legacy);
  return legacy;
}
