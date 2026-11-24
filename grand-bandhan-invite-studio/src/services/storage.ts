import { InvitationDraft, GenericInvitationData, RsvpRecord } from '../types/invitation';
import { DEFAULT_ROYAL_WEDDING_DATA, DEFAULT_SCENES } from '../templates/royal-wedding-book/template';
import { DEFAULT_BIRTHDAY_DATA, DEFAULT_BIRTHDAY_SCENES } from '../templates/birthday-surprise-box/template';
import { DEFAULT_CORPORATE_DATA, DEFAULT_CORPORATE_SCENES } from '../templates/corporate-event-pass/template';
import { DEFAULT_CUSTOM_DATA, DEFAULT_CUSTOM_SCENES } from '../templates/custom-floral-arch/template';

const DRAFTS_INDEX_KEY = 'gb_invite_drafts_v2';
const PUBLISHED_INDEX_KEY = 'gb_published_invites_v2';
const CURRENT_DRAFT_KEY = 'grand_bandhan_invite_draft_v1';
const USER_ACCOUNT_KEY = 'gb_user_account_v2';

export type AccountTier = 'free' | 'royal';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isLoggedIn: boolean;
  tier: AccountTier;
  credits: number; // AI generation credits
  planExpiry?: number;
  avatar?: string;
}

export function getUserAccount(): UserAccount {
  try {
    const raw = localStorage.getItem(USER_ACCOUNT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          id: parsed.id || 'user_guest',
          email: parsed.email || '',
          name: parsed.name || 'Guest Organizer',
          phone: parsed.phone || '',
          isLoggedIn: !!parsed.isLoggedIn,
          tier: parsed.tier === 'royal' ? 'royal' : 'free',
          credits: typeof parsed.credits === 'number' ? parsed.credits : (parsed.tier === 'royal' ? 999 : 5),
          planExpiry: parsed.planExpiry,
          avatar: parsed.avatar || '',
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    id: 'user_default_owner',
    email: 'organizer@grandbandhan.com',
    name: 'Shreyansh Sharma',
    phone: '+91 98765 43210',
    isLoggedIn: true,
    tier: 'free',
    credits: 5,
  };
}

export function saveUserAccount(account: UserAccount): void {
  localStorage.setItem(USER_ACCOUNT_KEY, JSON.stringify(account));
}

export function loginUser(name: string, email: string, phone?: string, tier: AccountTier = 'free'): UserAccount {
  const account: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim() || 'Wedding Host',
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || '',
    isLoggedIn: true,
    tier,
    credits: tier === 'royal' ? 999 : 5,
  };
  saveUserAccount(account);
  return account;
}

export function logoutUser(): void {
  const guestAccount: UserAccount = {
    id: 'user_guest',
    email: '',
    name: 'Guest Organizer',
    isLoggedIn: false,
    tier: 'free',
    credits: 3,
  };
  saveUserAccount(guestAccount);
}

export function updateUserTier(tier: AccountTier): UserAccount {
  const user = getUserAccount();
  user.tier = tier;
  if (tier === 'royal') {
    user.credits = 999;
    user.planExpiry = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year
  }
  saveUserAccount(user);
  return user;
}

export function checkCanPublish(draftId: string): { allowed: boolean; reason?: string } {
  const user = getUserAccount();
  if (user.tier === 'royal') {
    return { allowed: true };
  }

  // Free tier limit: max 1 active published invitation
  const all = getAllDrafts();
  const currentlyPublished = all.filter((d) => d.isPublished && d.id !== draftId);
  if (currentlyPublished.length >= 1) {
    return {
      allowed: false,
      reason: 'Free tier allows 1 active published invitation. Upgrade to Royal Premium for unlimited invitations.',
    };
  }

  return { allowed: true };
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

export async function fetchLiveRsvps(slug: string): Promise<RsvpRecord[]> {
  const local = getRsvpsForSlug(slug);
  if (typeof window === 'undefined') return local;

  try {
    const res = await fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.records) && json.records.length > 0) {
        // Map database columns to RsvpRecord format
        const mapped: RsvpRecord[] = json.records.map((r: any) => ({
          id: r.id || `rsvp_${r.submitted_at || Date.now()}`,
          slug: r.slug || slug,
          guestName: r.guest_name || r.guestName || 'Valued Guest',
          status: (r.attendance === 'yes' || r.status === 'attending') ? 'attending' : 'declined',
          guestCount: r.guest_count || r.guestCount || 1,
          contact: r.contact || '',
          dietaryOrNote: r.message || r.dietary || r.dietaryOrNote || '',
          submittedAt: r.submitted_at ? new Date(r.submitted_at).getTime() : Date.now(),
        }));

        // Merge without duplicates
        const map = new Map<string, RsvpRecord>();
        local.forEach((rec) => map.set(rec.id, rec));
        mapped.forEach((rec) => map.set(rec.id, rec));
        const combined = Array.from(map.values()).sort((a, b) => b.submittedAt - a.submittedAt);
        localStorage.setItem(`gb_rsvps_${slug}`, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('Could not fetch server RSVPs, using local storage cache:', err);
  }

  return local;
}

export function saveLocalRsvp(record: RsvpRecord): void {
  const list = getRsvpsForSlug(record.slug);
  list.unshift(record);
  localStorage.setItem(`gb_rsvps_${record.slug}`, JSON.stringify(list));
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
