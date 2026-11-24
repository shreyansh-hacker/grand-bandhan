import { GenericInvitationData, SceneDefinition } from '../../types/invitation';
import { ROYAL_WEDDING_THEME } from './theme';

export const DEFAULT_SCENES: SceneDefinition[] = [
  { id: 'cover', titleHi: 'कवर', titleEn: 'Cover Book', iconName: 'Book', visible: true, order: 0 },
  { id: 'welcome', titleHi: 'स्वागत व आशीर्वाद', titleEn: 'Welcome & Names', iconName: 'Heart', visible: true, order: 1 },
  { id: 'date', titleHi: 'तारीख व मुहूर्त', titleEn: 'Save The Date', iconName: 'Calendar', visible: true, order: 2 },
  { id: 'festivities', titleHi: 'शुभ रस्में', titleEn: 'Festivities', iconName: 'Sparkles', visible: true, order: 3 },
  { id: 'story', titleHi: 'हमारी कहानी', titleEn: 'Our Story', iconName: 'Camera', visible: true, order: 4 },
  { id: 'venue', titleHi: 'स्थान व दिशा-निर्देश', titleEn: 'Venue & Map', iconName: 'MapPin', visible: true, order: 5 },
  { id: 'closing', titleHi: 'समापन व परिवार', titleEn: 'Family Closing', iconName: 'Users', visible: true, order: 6 },
];

export const DEFAULT_ROYAL_WEDDING_DATA: GenericInvitationData = {
  category: 'wedding',
  invitationLanguage: 'bilingual',

  title: 'शुभ विवाह',
  titleHi: 'शुभ विवाह',
  subtitle: 'ROYAL WEDDING INVITATION',
  subtitleHi: 'शाही विवाह आमंत्रण',
  celebrantOrCouple: 'कबीर एवं मीरा',

  // Blessing & Couple Details
  openingBlessing: '॥ श्री गणेशाय नमः ॥',
  openingBlessingFont: 'Noto Serif Devanagari',
  openingBlessingColor: '#c99a3e',
  openingBlessingSize: 22,

  groomName: 'कबीर शर्मा',
  groomFather: 'श्री राजेश शर्मा',
  groomMother: 'श्रीमती सुनीता शर्मा',

  brideName: 'मीरा मेहता',
  brideFather: 'श्री विक्रम मेहता',
  brideMother: 'श्रीमती कविता मेहता',

  invitationText: 'परमपिता परमेश्वर के असीम अनुग्रह से हमारे विवाह के इस पावन उत्सव पर आपकी सस्नेह उपस्थिति एवं मंगल आशीर्वाद सादर प्रार्थनीय हैं।',

  // Date Scene
  eventDateFormatted: 'शुक्रवार, 12 फरवरी 2027',
  eventDateFormattedHi: 'शुक्रवार, 12 फरवरी 2027',
  eventIsoDate: '2027-02-12T19:30:00',
  muhuratOrTime: 'शुभ पाणिग्रहण संस्कार: सायं 07:30 बजे',

  // Venue & Location
  venueName: 'राज विलास पैलेस (The Raj Vilas Palace)',
  venueAddress: 'आमेर रोड, जल महल के सामने, जयपुर, राजस्थान - 302002',
  googleMapsUrl: 'https://maps.google.com/?q=Raj+Vilas+Palace+Amer+Road+Jaipur',

  // Closing
  closingBlessing: 'आपकी उपस्थिति ही हमारे लिए सबसे अनमोल उपहार है।',
  familyClosingText: 'स्नेही: समस्त शर्मा एवं मेहता परिवार',

  // Cover settings
  coverTitle: 'शुभ विवाह',
  coverSubtitle: 'ROYAL WEDDING INVITATION',
  coverButtonText: 'किताब खोलें',
  coverEmblemUrl: '/assets/templates/royal-wedding-book/cover/ganesh-emblem.svg',
  showEmblem: true,

  // Functions
  functions: [
    {
      id: 'fn-haldi',
      name: 'Haldi Ceremony',
      hindiName: 'शुभ हल्दी व तेल बान',
      dayDate: 'गुरुवार, 11 फरवरी 2027',
      time: 'प्रातः 10:00 बजे',
      venue: 'गार्डन लॉन्स, राज विलास पैलेस',
      dressCode: 'पारंपरिक पीतांबर परिधान (Wear Yellow)',
      dressColor: 'पीला (Yellow)',
      colorHex: '#f59e0b',
      icon: 'Sun',
      illustration: '/assets/templates/royal-wedding-book/illustrations/haldi.svg',
    },
    {
      id: 'fn-mehendi',
      name: 'Mehendi Ki Raat',
      hindiName: 'मेहंदी उत्सव व संगीत',
      dayDate: 'गुरुवार, 11 फरवरी 2027',
      time: 'दोपहर 03:00 बजे',
      venue: 'रॉयल कोर्टयार्ड, राज विलास पैलेस',
      dressCode: 'फ्लोरल व हरा परिधान (Wear Green)',
      dressColor: 'हरा (Green)',
      colorHex: '#10b981',
      icon: 'Palette',
      illustration: '/assets/templates/royal-wedding-book/illustrations/mehendi.svg',
    },
    {
      id: 'fn-sangeet',
      name: 'Musical Sangeet',
      hindiName: 'सुरमयी संगीत संध्या',
      dayDate: 'गुरुवार, 11 फरवरी 2027',
      time: 'सायं 07:00 बजे से देर रात',
      venue: 'दरबार हॉल, राज विलास पैलेस',
      dressCode: 'इंडो-वेस्टर्न शिमर (Indo-Western Glitz)',
      dressColor: 'बैंगनी व गुलाबी (Purple & Pink)',
      colorHex: '#8b5cf6',
      icon: 'Music',
      illustration: '/assets/templates/royal-wedding-book/illustrations/sangeet.svg',
    },
    {
      id: 'fn-pheras',
      name: 'Baraat & Pheras',
      hindiName: 'शुभ बारात व पाणिग्रहण संस्कार',
      dayDate: 'शुक्रवार, 12 फरवरी 2027',
      time: 'सायं 06:30 बजे निकासी | 07:30 बजे फेरे',
      venue: 'मंडप पवेलियन, राज विलास पैलेस',
      dressCode: 'शाही पारंपरिक परिधान (Royal Traditional)',
      dressColor: 'लाल व सुनहरी (Red & Gold)',
      colorHex: '#ef4444',
      icon: 'Flame',
      illustration: '/assets/templates/royal-wedding-book/illustrations/pheras.svg',
    },
    {
      id: 'fn-reception',
      name: 'Grand Reception',
      hindiName: 'शाही प्रतिभोज (प्रीतिभोज)',
      dayDate: 'शनिवार, 13 फरवरी 2027',
      time: 'सायं 08:00 बजे onwards',
      venue: 'शीश महल बैंक्वेट, राज विलास पैलेस',
      dressCode: 'ब्लैक टाई व साड़ियाँ (Black Tie & Silks)',
      dressColor: 'वाइन व स्वर्ण (Wine & Gold)',
      colorHex: '#9333ea',
      icon: 'Award',
      illustration: '/assets/templates/royal-wedding-book/illustrations/reception.svg',
    },
  ],

  // Couple story photos
  storyPhotos: [
    {
      id: 'st-1',
      url: '/assets/templates/royal-wedding-book/photos/couple-1.svg',
      title: 'पहली मुलाक़ात · 2022',
      caption: 'उदयपुर की झीलों के किनारे एक अनकही शुरुआत।',
    },
    {
      id: 'st-2',
      url: '/assets/templates/royal-wedding-book/photos/couple-2.svg',
      title: 'इकरार का लम्हा · 2025',
      caption: 'जोधपुर के किलों तले तारों भरी रात में हमेशा के लिए हाँ।',
    },
    {
      id: 'st-3',
      url: '/assets/templates/royal-wedding-book/photos/couple-3.svg',
      title: 'सदा के लिए हमसफ़र · 2027',
      caption: 'दो परिवारों का स्नेह, एक अटूट बंधन की ओर अग्रसर।',
    },
  ],

  speakers: [],
  agenda: [],
  activities: [],

  // Global visual theme
  theme: { ...ROYAL_WEDDING_THEME },

  // Sound settings
  music: {
    enabled: true,
    title: 'शाही शहनाई व बांसुरी धुन (Royal Shehnai)',
    artist: 'Grand Bandhan Studio Ensemble',
    type: 'synth',
  },

  // RSVP settings
  rsvp: {
    enabled: true,
    allowPartySize: true,
    maxPartySize: 8,
    deadlineFormatted: '05 फरवरी 2027',
    responses: [],
  },
};

export function getCleanRoyalWeddingDraft(): GenericInvitationData {
  return JSON.parse(JSON.stringify(DEFAULT_ROYAL_WEDDING_DATA));
}
