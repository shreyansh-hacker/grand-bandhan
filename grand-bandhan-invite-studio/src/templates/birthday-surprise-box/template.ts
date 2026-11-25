import { GenericInvitationData, SceneDefinition } from '../../types/invitation';

export const DEFAULT_BIRTHDAY_SCENES: SceneDefinition[] = [
  { id: 'birthdayBox', titleHi: 'गिफ़्ट बॉक्स', titleEn: 'Surprise Box', iconName: 'Gift', visible: true, order: 0 },
  { id: 'partyDetails', titleHi: 'पार्टी व गेम्स', titleEn: 'Party & Activities', iconName: 'Sparkles', visible: true, order: 1 },
  { id: 'venue', titleHi: 'स्थान व दिशा-निर्देश', titleEn: 'Venue & Map', iconName: 'MapPin', visible: true, order: 2 },
  { id: 'closing', titleHi: 'RSVP व पुष्टि', titleEn: 'RSVP & Confirmation', iconName: 'CheckCircle', visible: true, order: 3 },
];

export const DEFAULT_BIRTHDAY_DATA: GenericInvitationData = {
  category: 'birthday',
  invitationLanguage: 'en',

  title: "Aarav's 7th Birthday Adventure",
  titleHi: 'आरव का 7वाँ जन्मदिन उत्सव',
  subtitle: 'SPACE MISSION CELEBRATION',
  subtitleHi: 'अंतरिक्ष सैर व उत्सव',
  celebrantOrCouple: 'Aarav Sharma',
  celebrantAge: 7,
  hostNames: 'Rajesh & Sunita Sharma',

  openingBlessing: 'Blast Off into Fun! 🚀',
  openingBlessingFont: 'Playfair Display',
  openingBlessingColor: '#ffd166',
  openingBlessingSize: 24,

  invitationText: 'Join us for an exciting cosmic space adventure filled with games, yummy treats, rocket science magic, and birthday cake!',

  eventDateFormatted: 'Sunday, December 13, 2026',
  eventDateFormattedHi: 'रविवार, 13 दिसंबर 2026',
  eventIsoDate: '2026-12-13T16:00:00',
  muhuratOrTime: '4:00 PM to 7:30 PM IST',

  venueName: 'Planet Fun Galaxy Club & Cafe',
  venueAddress: '100ft Road, Near Metro Station, Indiranagar, Bengaluru - 560038',
  venueLandmark: 'Near Indiranagar Metro Station · 100ft Road, Bengaluru',
  googleMapsUrl: 'https://maps.google.com/?q=Planet+Fun+Indiranagar+Bengaluru',

  closingBlessing: "Can't wait to blast off and celebrate with you!",
  familyClosingText: 'With lots of love, The Sharma Family',

  coverTitle: 'SURPRISE GIFT BOX',
  coverSubtitle: 'TAP TO OPEN THE BOX',
  coverButtonText: 'Open Gift Box 🎁',
  coverEmblemUrl: '/assets/templates/royal-wedding-book/illustrations/sangeet.svg',
  showEmblem: true,

  functions: [],
  storyPhotos: [],
  speakers: [],
  agenda: [],

  // Party Activities
  activities: [
    {
      id: 'act-1',
      time: '04:00 PM',
      title: 'Cosmic Welcoming & Astronaut Badges',
      description: 'Receive your personalized astronaut badge and space gear.',
      icon: 'Award',
    },
    {
      id: 'act-2',
      time: '04:45 PM',
      title: 'Laser Tag Arena & Space Obstacle Hunt',
      description: 'High-energy games and intergalactic obstacle courses with prizes.',
      icon: 'Gamepad2',
    },
    {
      id: 'act-3',
      time: '05:45 PM',
      title: 'Galactic Cake Cutting & Toast',
      description: 'Singing, laughter, sparklers, and delicious rocket ship chocolate cake.',
      icon: 'Cake',
    },
    {
      id: 'act-4',
      time: '06:30 PM',
      title: 'Science Magic Show & Return Gifts',
      description: 'Liquid nitrogen ice cream making and cosmic take-home gift hampers.',
      icon: 'Gift',
    },
  ],

  theme: {
    coverColor: '#1d3557',         // Deep Cosmic Navy
    coverAccentColor: '#ffd166',   // Cheerful Golden Sun
    paperColor: '#fdfbf7',         // Warm Paper
    textColor: '#1a1a24',
    headingFont: 'Playfair Display',
    bodyFont: 'Montserrat',
    devanagariFont: 'Noto Serif Devanagari',
    animationSpeed: 'normal',
    revealStyle: 'bloom',
    pattern: 'galaxy',
    particleType: 'cakes',
    cardAnimation: 'float',
  },

  music: {
    enabled: true,
    title: 'Upbeat Celebration Melody',
    artist: 'Grand Bandhan Fun Ensemble',
    type: 'synth',
  },

  rsvp: {
    enabled: true,
    allowPartySize: true,
    maxPartySize: 5,
    deadlineFormatted: 'December 05, 2026',
    responses: [],
  },
};
