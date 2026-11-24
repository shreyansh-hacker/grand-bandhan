export type EventCategory = 'wedding' | 'birthday' | 'corporate' | 'custom';
export type InvitationLanguage = 'en' | 'hi' | 'bilingual';

export interface CeremonyFunction {
  id: string;
  name: string;
  hindiName?: string;
  dayDate: string;
  time: string;
  venue: string;
  dressCode: string;
  dressColor: string;
  colorHex: string;
  icon: string;
  illustration: string;
}

export interface StoryPhoto {
  id: string;
  url: string;
  title: string;
  caption: string;
}

export interface SpeakerItem {
  id: string;
  name: string;
  role: string;
  company: string;
  topic: string;
  photoUrl: string;
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  description: string;
  locationOrRoom?: string;
}

export interface ActivityItem {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string;
}

export interface RsvpRecord {
  id: string;
  guestName: string;
  contact: string;
  status: 'attending' | 'declined';
  guestCount: number;
  dietaryOrNote?: string;
  guestToken?: string;
  submittedAt: number;
  updatedAt: number;
}

export interface GenericInvitationData {
  // Category identifier
  category: EventCategory;
  invitationLanguage: InvitationLanguage;

  // Primary event information
  title: string;                 // e.g. "शुभ विवाह" or "Aarav's 7th Birthday" or "Grand Bandhan Tech Summit 2027"
  titleHi?: string;
  subtitle: string;
  subtitleHi?: string;
  celebrantOrCouple: string;     // "कबीर एवं मीरा" or "Aarav Sharma" or "Grand Bandhan Enterprise"
  celebrantAge?: number;
  hostNames?: string;
  openingBlessing: string;       // e.g. "॥ श्री गणेशाय नमः ॥" or "You're Invited to Celebrate"
  openingBlessingFont: string;
  openingBlessingColor: string;
  openingBlessingSize: number;
  invitationText: string;

  // Wedding-specific names
  groomName?: string;
  groomFather?: string;
  groomMother?: string;
  brideName?: string;
  brideFather?: string;
  brideMother?: string;

  // Date and Time
  eventDateFormatted: string;    // e.g. "Friday, February 12, 2027"
  eventDateFormattedHi?: string;
  eventIsoDate: string;          // e.g. "2027-02-12T19:30:00"
  muhuratOrTime: string;

  // Backward compatibility fields
  weddingDateFormatted?: string;
  weddingIsoDate?: string;
  muhuratTime?: string;

  // Venue and directions
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  onlineMeetingUrl?: string;

  // Closing details
  closingBlessing: string;
  familyClosingText: string;

  // Cover & Media settings
  coverTitle: string;
  coverSubtitle: string;
  coverButtonText: string;
  coverEmblemUrl: string;
  showEmblem: boolean;

  // Dynamic modules
  functions: CeremonyFunction[]; // Ceremonies or agenda
  storyPhotos: StoryPhoto[];     // Photo gallery
  speakers: SpeakerItem[];       // Corporate speakers
  agenda: AgendaItem[];          // Corporate schedule
  activities: ActivityItem[];    // Birthday party games

  // Theme settings
  theme: {
    coverColor: string;
    coverAccentColor: string;
    paperColor: string;
    textColor: string;
    headingFont: string;
    bodyFont: string;
    devanagariFont: string;
    animationSpeed: 'slow' | 'normal' | 'fast';
    revealStyle: 'bloom' | 'fade' | 'slide';
  };

  // Music settings
  music: {
    enabled: boolean;
    title: string;
    artist: string;
    type: 'synth' | 'mp3';
    url?: string;
  };

  // RSVP settings
  rsvp: {
    enabled: boolean;
    allowPartySize: boolean;
    maxPartySize: number;
    deadlineFormatted: string;
    responses: RsvpRecord[];
  };
}

// Backward compatibility alias
export type RoyalWeddingData = GenericInvitationData;

export type SceneId =
  | 'cover'
  | 'welcome'
  | 'date'
  | 'festivities'
  | 'story'
  | 'venue'
  | 'closing'
  | 'birthdayBox'
  | 'partyDetails'
  | 'corporatePass'
  | 'speakersAgenda'
  | 'customArch'
  | 'customDetails';

export interface SceneDefinition {
  id: SceneId;
  titleHi: string;
  titleEn: string;
  iconName: string;
  visible: boolean;
  order: number;
}

export interface InvitationDraft {
  id: string;
  slug: string;                  // Unique guest URL slug e.g. "kabir-meera-wedding"
  templateId: string;
  templateVersion: string;
  name: string;
  category: EventCategory;
  invitationLanguage: InvitationLanguage;
  lastModified: number;
  isPublished: boolean;
  publishedAt?: number;
  publishedData?: GenericInvitationData; // Frozen copy served to guests
  scenes: SceneDefinition[];
  data: GenericInvitationData;
}

export interface SelectedElement {
  sceneId: SceneId;
  fieldKey: keyof GenericInvitationData | string;
  label: string;
  type: 'text' | 'textarea' | 'color' | 'font' | 'number' | 'image' | 'functions' | 'date';
}
