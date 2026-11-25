import { GenericInvitationData, SceneDefinition } from '../../types/invitation';

export const DEFAULT_CORPORATE_SCENES: SceneDefinition[] = [
  { id: 'corporatePass', titleHi: 'एक्सेस पास', titleEn: 'Executive Pass', iconName: 'CreditCard', visible: true, order: 0 },
  { id: 'speakersAgenda', titleHi: 'स्पीकर्स व एजेंडा', titleEn: 'Speakers & Timetable', iconName: 'Calendar', visible: true, order: 1 },
  { id: 'venue', titleHi: 'स्थल व वर्चुअल लिंक', titleEn: 'Venue & Stream', iconName: 'MapPin', visible: true, order: 2 },
  { id: 'closing', titleHi: 'पास कन्फर्मेशन / RSVP', titleEn: 'Registration & RSVP', iconName: 'CheckSquare', visible: true, order: 3 },
];

export const DEFAULT_CORPORATE_DATA: GenericInvitationData = {
  category: 'corporate',
  invitationLanguage: 'en',

  title: 'Grand Bandhan Global Leadership & Tech Summit',
  titleHi: 'ग्रांड बंधन वैश्विक नेतृत्व व तकनीक शिखर सम्मेलन 2027',
  subtitle: 'INNOVATION & AI SYMPOSIUM',
  subtitleHi: 'नवाचार व एआई परिसंवाद',
  celebrantOrCouple: 'Grand Bandhan Enterprise',
  hostNames: 'Executive Board of Grand Bandhan',

  openingBlessing: 'Official Delegate Invitation',
  openingBlessingFont: 'Cinzel',
  openingBlessingColor: '#c99a3e',
  openingBlessingSize: 20,

  invitationText: 'You are cordially invited as a distinguished delegate to explore the future of enterprise architecture, modern hospitality technology, and AI-driven platforms.',

  eventDateFormatted: 'Thursday, March 25, 2027',
  eventDateFormattedHi: 'गुरुवार, 25 मार्च 2027',
  eventIsoDate: '2027-03-25T09:00:00',
  muhuratOrTime: '09:00 AM - 05:30 PM IST',

  venueName: 'The Grand St. Regis Ballroom & Virtual Stage',
  venueAddress: 'Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra - 400013',
  venueLandmark: 'Next to High Street Phoenix · Lower Parel, Mumbai',
  googleMapsUrl: 'https://maps.google.com/?q=St+Regis+Lower+Parel+Mumbai',
  onlineMeetingUrl: 'https://meet.grandbandhan.com/summit-2027',

  closingBlessing: 'We look forward to hosting you for an inspiring day of executive exchange.',
  familyClosingText: 'Organizing Committee · Grand Bandhan Group',

  coverTitle: 'VIP DELEGATE PASS',
  coverSubtitle: 'TAP TO FLIP ACCESS PASS',
  coverButtonText: 'Flip Badge 💳',
  coverEmblemUrl: '/assets/brand/logo.svg',
  showEmblem: true,

  functions: [],
  storyPhotos: [],
  activities: [],

  // Keynote Speakers
  speakers: [
    {
      id: 'spk-1',
      name: 'Dr. Vikram Malhotra',
      role: 'Chief Technology Officer',
      company: 'Grand Bandhan Digital',
      topic: 'Autonomous Cloud Architectures & Scale',
      photoUrl: '/assets/templates/royal-wedding-book/illustrations/reception.svg',
    },
    {
      id: 'spk-2',
      name: 'Ananya Deshmukh',
      role: 'VP of Product Experience',
      company: 'Vanguard Media Group',
      topic: 'Designing Tactile Digital Interfaces',
      photoUrl: '/assets/templates/royal-wedding-book/illustrations/sangeet.svg',
    },
  ],

  // Agenda Timetable
  agenda: [
    {
      id: 'ag-1',
      time: '09:00 AM - 10:00 AM',
      title: 'Registration & Networking Breakfast',
      description: 'Collect your physical badge, breakfast buffet, and executive welcome kit.',
      locationOrRoom: 'Main Foyer',
    },
    {
      id: 'ag-2',
      time: '10:00 AM - 11:30 AM',
      title: 'Keynote: The 2027 AI & Experience Revolution',
      description: 'Opening remarks by Chief Technology Officer and Industry Panelists.',
      locationOrRoom: 'Grand Auditorium',
    },
    {
      id: 'ag-3',
      time: '11:45 AM - 01:15 PM',
      title: 'Technical Deep Dives & Platform Roadmap',
      description: 'Live interactive demonstrations of the Invite Studio, Event CRM & Cloud Engine.',
      locationOrRoom: 'Innovation Hall A',
    },
    {
      id: 'ag-4',
      time: '02:30 PM - 05:00 PM',
      title: 'Executive Roundtables & Partner Reception',
      description: 'Private leadership sessions followed by high-tea and closing networking.',
      locationOrRoom: 'Horizon Terrace',
    },
  ],

  theme: {
    coverColor: '#0f172a',         // Executive Midnight Slate
    coverAccentColor: '#c99a3e',   // Precision Gold
    paperColor: '#f8fafc',         // Crisp Executive Paper
    textColor: '#0f172a',
    headingFont: 'Cinzel',
    bodyFont: 'Montserrat',
    devanagariFont: 'Noto Serif Devanagari',
    animationSpeed: 'normal',
    revealStyle: 'slide',
    pattern: 'tech',
    particleType: 'tech',
    cardAnimation: 'float',
  },

  music: {
    enabled: false,
    title: 'Executive Ambient Harmony',
    artist: 'Grand Bandhan Audio Lab',
    type: 'synth',
  },

  rsvp: {
    enabled: true,
    allowPartySize: false,
    maxPartySize: 1,
    deadlineFormatted: 'March 15, 2027',
    responses: [],
  },
};
