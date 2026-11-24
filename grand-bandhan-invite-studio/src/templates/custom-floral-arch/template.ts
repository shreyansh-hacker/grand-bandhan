import { GenericInvitationData, SceneDefinition } from '../../types/invitation';

export const DEFAULT_CUSTOM_SCENES: SceneDefinition[] = [
  { id: 'customArch', titleHi: 'उत्सव तोरण द्वार', titleEn: 'Occasion Arch', iconName: 'Home', visible: true, order: 0 },
  { id: 'customDetails', titleHi: 'कार्यक्रम व अनुष्ठान', titleEn: 'Program & Rituals', iconName: 'Sparkles', visible: true, order: 1 },
  { id: 'venue', titleHi: 'स्थान व दिशा-निर्देश', titleEn: 'Venue & Directions', iconName: 'MapPin', visible: true, order: 2 },
  { id: 'closing', titleHi: 'आभार व RSVP', titleEn: 'RSVP & Blessings', iconName: 'HeartHandshake', visible: true, order: 3 },
];

export const DEFAULT_CUSTOM_DATA: GenericInvitationData = {
  category: 'custom',
  invitationLanguage: 'bilingual',

  title: 'शुभ गृहप्रवेश (Housewarming Ceremony)',
  titleHi: 'शुभ गृहप्रवेश व वास्तु पूजन',
  subtitle: 'A NEW HEARTH, A BLESSED BEGINNING',
  subtitleHi: 'नया आशियाना, मंगलमय शुरुआत',
  celebrantOrCouple: 'शर्मा परिवार (The Sharma Family)',
  hostNames: 'Rajesh & Sunita Sharma',

  openingBlessing: '॥ ॐ नमो भगवते वासुदेवाय नमः ॥',
  openingBlessingFont: 'Noto Serif Devanagari',
  openingBlessingColor: '#c99a3e',
  openingBlessingSize: 22,

  invitationText: 'ईश्वर की कृपा और बड़ों के आशीर्वाद से हम अपने नए निवास में प्रवेश कर रहे हैं। इस पावन अवसर पर आपकी स्नेहमयी उपस्थिति व शुभाशीष सादर प्रार्थनीय हैं।',

  eventDateFormatted: 'Sunday, January 24, 2027',
  eventDateFormattedHi: 'रविवार, 24 जनवरी 2027',
  eventIsoDate: '2027-01-24T10:30:00',
  muhuratOrTime: 'प्रातः 10:30 बजे वास्तु पूजन | दोपहर 12:30 बजे महाप्रसाद',

  venueName: 'आनंद निलयम (Anand Nilayam, Villa 108)',
  venueAddress: 'पाम मीडोज़, व्हाइटफ़ील्ड, बेंगलुरु, कर्नाटक - 560066',
  googleMapsUrl: 'https://maps.google.com/?q=Whitefield+Bengaluru',

  closingBlessing: 'आपकी उपस्थिति ही हमारे नए घर की शोभा बढ़ाएगी।',
  familyClosingText: 'विनीत: समस्त शर्मा एवं अग्रवाल परिवार',

  coverTitle: 'शुभ गृहप्रवेश',
  coverSubtitle: 'HOUSEWARMING INVITATION',
  coverButtonText: 'प्रवेश करें (Open Door) 🏡',
  coverEmblemUrl: '/assets/templates/royal-wedding-book/cover/ganesh-emblem.svg',
  showEmblem: true,

  functions: [],
  storyPhotos: [],
  speakers: [],
  agenda: [],

  activities: [
    {
      id: 'rit-1',
      time: '10:30 AM',
      title: 'वास्तु शांति व नवग्रह हवन',
      description: 'पवित्र वैदिक मंत्रोच्चार के साथ गृह शुद्धि एवं पूजन।',
      icon: 'Flame',
    },
    {
      id: 'rit-2',
      time: '11:45 AM',
      title: 'कलश प्रवेश व देहरी पूजन',
      description: 'मंगल कलश के साथ नए घर की पावन देहरी में पदार्पण।',
      icon: 'Home',
    },
    {
      id: 'rit-3',
      time: '12:30 PM onwards',
      title: 'आनंद भोज (Mahaprasad Lunch)',
      description: 'स्नेही जनों संग पारंपरिक सात्विक भोजन व मिष्ठान।',
      icon: 'Utensils',
    },
  ],

  theme: {
    coverColor: '#7f1d1d',         // Deep Terracotta Red
    coverAccentColor: '#d4af37',   // Auspicious Marigold Gold
    paperColor: '#faf6f0',         // Soft Warm Linen
    textColor: '#291b17',
    headingFont: 'Playfair Display',
    bodyFont: 'Montserrat',
    devanagariFont: 'Noto Serif Devanagari',
    animationSpeed: 'normal',
    revealStyle: 'bloom',
  },

  music: {
    enabled: true,
    title: 'मंगल शंख व बाँसुरी (Auspicious Flute)',
    artist: 'Grand Bandhan Divine',
    type: 'synth',
  },

  rsvp: {
    enabled: true,
    allowPartySize: true,
    maxPartySize: 6,
    deadlineFormatted: '18 जनवरी 2027',
    responses: [],
  },
};
