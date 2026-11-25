import { EventCategory, GenericInvitationData, SceneDefinition } from '../types/invitation';
import { DEFAULT_ROYAL_WEDDING_DATA, DEFAULT_SCENES } from './royal-wedding-book/template';
import { DEFAULT_BIRTHDAY_DATA, DEFAULT_BIRTHDAY_SCENES } from './birthday-surprise-box/template';
import { DEFAULT_CORPORATE_DATA, DEFAULT_CORPORATE_SCENES } from './corporate-event-pass/template';
import { DEFAULT_CUSTOM_DATA, DEFAULT_CUSTOM_SCENES } from './custom-floral-arch/template';

export interface TemplateCatalogEntry {
  id: string;
  nameHi: string;
  nameEn: string;
  category: EventCategory;
  descriptionHi: string;
  descriptionEn: string;
  badgeHi: string;
  badgeEn: string;
  previewThumbnail: string;
  isAvailable: boolean;
  isFeatured: boolean;
  defaultData: GenericInvitationData;
  defaultScenes: SceneDefinition[];
}

// ==============================================================
// 1. WEDDING TEMPLATES (4 Rich Royal & Modern Styles)
// ==============================================================

// Template 1: Classic Wine & Gold 3D Book
const TEMPLATE_ROYAL_WEDDING_BOOK: TemplateCatalogEntry = {
  id: 'royal-wedding-book',
  nameHi: 'रॉयल वेडिंग बुक (शाही वाइन)',
  nameEn: 'Royal Wedding Book (Velvet Wine)',
  category: 'wedding',
  descriptionHi: 'मखमली वाइन 3D किताब, डोरी से तारीख अनावरण, रस्मों का कैरोसेल, मैप मार्ग दर्शन व लाइव RSVP।',
  descriptionEn: 'Deep wine velvet 3D book cover, tassel scroll date reveal, ceremony carousel, interactive map and live RSVP.',
  badgeHi: 'सबसे लोकप्रिय · 3D बुक',
  badgeEn: 'Most Popular · 3D Book',
  previewThumbnail: '/assets/templates/royal-wedding-book/photos/couple-hero.svg',
  isAvailable: true,
  isFeatured: true,
  defaultData: DEFAULT_ROYAL_WEDDING_DATA,
  defaultScenes: DEFAULT_SCENES,
};

// Template 2: Imperial Emerald Palace (Udaipur Lake Palace Aesthetic)
const TEMPLATE_EMERALD_PALACE: TemplateCatalogEntry = {
  id: 'emerald-palace-wedding',
  nameHi: 'शाही पन्ना व आइवरी पैलेस',
  nameEn: 'Imperial Emerald Palace',
  category: 'wedding',
  descriptionHi: 'शाही पन्ना हरा व आइवरी पैलेस थीम, पिछोला झील उदयपुर का राजसी ठाठ, बांसुरी व शहनाई धुन।',
  descriptionEn: 'Royal emerald green velvet with ivory stationery, Lake Palace Udaipur aesthetic, shehnai notes and grand festivities.',
  badgeHi: 'राजसी ठाठ · लेक पैलेस',
  badgeEn: 'Royal Heritage · Udaipur Palace',
  previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/reception.svg',
  isAvailable: true,
  isFeatured: true,
  defaultData: {
    ...DEFAULT_ROYAL_WEDDING_DATA,
    title: 'मंगल परिणय',
    titleHi: 'मंगल परिणय',
    subtitle: 'IMPERIAL EMERALD WEDDING',
    subtitleHi: 'शाही पन्ना विवाह आमंत्रण',
    celebrantOrCouple: 'आदित्य एवं अनन्या',
    groomName: 'आदित्य सिंघानिया',
    groomFather: 'श्री हर्षवर्धन सिंघानिया',
    groomMother: 'श्रीमती मीनाक्षी सिंघानिया',
    brideName: 'अनन्या शेखावत',
    brideFather: 'श्री जयदीप शेखावत',
    brideMother: 'श्रीमती राजश्री शेखावत',
    openingBlessing: '॥ श्री गणेशाय नमः ॥',
    venueName: 'द लीला पैलेस (The Leela Palace), पिछोला झील, उदयपुर',
    venueAddress: 'लेक पिछोला, उदयपुर, राजस्थान - 313001',
    venueLandmark: 'पिछोला झील के समीप · उदयपुर',
    googleMapsUrl: 'https://maps.google.com/?q=The+Leela+Palace+Udaipur',
    coverTitle: 'मंगल परिणय',
    coverSubtitle: 'IMPERIAL PALACE EDITION',
    theme: {
      ...DEFAULT_ROYAL_WEDDING_DATA.theme,
      coverColor: '#143d2b',       // Deep Royal Emerald Green
      coverAccentColor: '#ecd599', // Antique Champagne Gold
      paperColor: '#fbf9f4',       // Warm Ivory Paper
      pattern: 'palace',
      particleType: 'flowers',
    },
    music: {
      enabled: true,
      title: 'मांगलिक शहनाई (Auspicious Shehnai Bells)',
      artist: 'Grand Bandhan Studio',
      type: 'mp3',
      url: 'https://assets.mixkit.co/music/preview/mixkit-indian-traditional-sitar-694.mp3',
    },
  },
  defaultScenes: DEFAULT_SCENES,
};

// Template 3: Vedic Saffron & Gold Mandap (Varanasi / Temple Mandap)
const TEMPLATE_SAFFRON_MANDAP: TemplateCatalogEntry = {
  id: 'saffron-mandap-wedding',
  nameHi: 'वैदिक केसरिया व स्वर्ण मंडप',
  nameEn: 'Vedic Saffron & Gold Mandap',
  category: 'wedding',
  descriptionHi: 'पवित्र केसरिया व स्वर्ण मंडप, पारंपरिक वैदिक मंत्र, दशाश्वमेध घाट वाराणसी का पावन वातावरण व ढोलक धुन।',
  descriptionEn: 'Sacred saffron terracotta with marigold gold foil, holy Vedic chants, Varanasi riverside aesthetic and festive rhythms.',
  badgeHi: 'वैदिक रीति · पवित्र मंडप',
  badgeEn: 'Sacred Vedic · Riverside Mandap',
  previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/pheras.svg',
  isAvailable: true,
  isFeatured: false,
  defaultData: {
    ...DEFAULT_ROYAL_WEDDING_DATA,
    title: 'शुभ पाणिग्रहण संस्कार',
    titleHi: 'शुभ पाणिग्रहण संस्कार',
    subtitle: 'SACRED VEDIC WEDDING',
    subtitleHi: 'वैदिक विवाह उत्सव',
    celebrantOrCouple: 'रोहन एवं तन्वी',
    groomName: 'रोहन भारद्वाज',
    groomFather: 'पं. रमेश भारद्वाज',
    groomMother: 'श्रीमती उर्मिला भारद्वाज',
    brideName: 'तन्वी शास्त्री',
    brideFather: 'डॉ. देवेंद्र शास्त्री',
    brideMother: 'श्रीमती वीणा शास्त्री',
    openingBlessing: '॥ ॐ श्री गणेशाय नमः ॥ मंगलम् भगवान विष्णुः ॥',
    venueName: 'बृज रमा पैलेस (BrijRama Palace), दरभंगा घाट, वाराणसी',
    venueAddress: 'दरभंगा घाट, दशाश्वमेध, वाराणसी, उत्तर प्रदेश - 221001',
    venueLandmark: 'दरभंगा घाट · दशाश्वमेध के निकट, वाराणसी',
    googleMapsUrl: 'https://maps.google.com/?q=BrijRama+Palace+Varanasi',
    coverTitle: 'शुभ पाणिग्रहण',
    coverSubtitle: 'SACRED VEDIC CEREMONY',
    theme: {
      ...DEFAULT_ROYAL_WEDDING_DATA.theme,
      coverColor: '#9a3412',       // Auspicious Saffron Terracotta
      coverAccentColor: '#f59e0b', // Rich Marigold Gold
      paperColor: '#fdfbf7',       // Sandalwood Paper
      pattern: 'mandap',
      particleType: 'flowers',
    },
    music: {
      enabled: true,
      title: 'जश्न व ढोलक (Celebration Sitar Beats)',
      artist: 'Grand Bandhan Studio',
      type: 'mp3',
      url: 'https://assets.mixkit.co/music/preview/mixkit-bollywood-nights-242.mp3',
    },
  },
  defaultScenes: DEFAULT_SCENES,
};

// Template 4: Blush Rose Garden Romance (Pastel Floral Luxury)
const TEMPLATE_BLUSH_ROSE: TemplateCatalogEntry = {
  id: 'blush-floral-wedding',
  nameHi: 'गुलाबी मखमली रोज गार्डन',
  nameEn: 'Blush Rose Garden Romance',
  category: 'wedding',
  descriptionHi: 'पेस्टल रोज व शैम्पेन फ्लोरल थीम, हेरिटेज बनियान गार्डन, कोमल कैलीग्राफी, रोमांटिक दास्तान व लाइव RSVP।',
  descriptionEn: 'Soft blush rose with champagne gold accents, heritage lawn celebration, contemporary calligraphy and romantic memories.',
  badgeHi: 'पेस्टल फ्लोरल · समकालीन',
  badgeEn: 'Pastel Floral · Contemporary',
  previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/mehendi.svg',
  isAvailable: true,
  isFeatured: false,
  defaultData: {
    ...DEFAULT_ROYAL_WEDDING_DATA,
    title: 'A Celebration of Love',
    titleHi: 'प्रेम एवं विवाह उत्सव',
    subtitle: 'CONTEMPORARY FLORAL WEDDING',
    subtitleHi: 'गुलाबी मखमली रोज आमंत्रण',
    celebrantOrCouple: 'Neil & Rhea',
    groomName: 'Neil Oberoi',
    groomFather: 'Sunil Oberoi',
    groomMother: 'Anita Oberoi',
    brideName: 'Rhea Deshmukh',
    brideFather: 'Vikram Deshmukh',
    brideMother: 'Poonam Deshmukh',
    openingBlessing: 'Two Souls, One Sacred Promise ✨',
    invitationText: 'With joyful hearts, we invite you to share our joy as we exchange wedding vows and celebrate our new beginning.',
    venueName: 'The Taj West End Heritage Lawns, Race Course Road, Bengaluru',
    venueAddress: 'Race Course Road, High Grounds, Bengaluru, Karnataka - 560001',
    venueLandmark: 'Historic Heritage Banyan Lawn · Bengaluru',
    googleMapsUrl: 'https://maps.google.com/?q=Taj+West+End+Bengaluru',
    coverTitle: 'Neil & Rhea',
    coverSubtitle: 'CELEBRATING FOREVER',
    coverButtonText: 'Open Invitation 🌸',
    theme: {
      ...DEFAULT_ROYAL_WEDDING_DATA.theme,
      coverColor: '#831843',       // Velvet Rose Wine
      coverAccentColor: '#ffd166', // Soft Champagne
      paperColor: '#fdf8f7',       // Rosewater Ivory Paper
      headingFont: 'Playfair Display',
      pattern: 'damask',
      particleType: 'flowers',
    },
    music: {
      enabled: true,
      title: 'शाही बांसुरी व सितार (Flute Synth)',
      artist: 'Grand Bandhan Studio',
      type: 'synth',
    },
  },
  defaultScenes: DEFAULT_SCENES,
};

// ==============================================================
// 2. BIRTHDAY TEMPLATES (2 Distinct Themes)
// ==============================================================

// Template 5: 3D Surprise Gift Box (Kids & Adventure)
const TEMPLATE_SURPRISE_BOX: TemplateCatalogEntry = {
  id: 'birthday-surprise-box',
  nameHi: 'सरप्राइज़ गिफ़्ट बॉक्स (स्पेस मिशन)',
  nameEn: 'Surprise Gift Box (Space Mission)',
  category: 'birthday',
  descriptionHi: 'ढक्कन खुलते ही रंग-बिरंगा कनफ़ेटी और अंतरिक्ष रॉकेट थीम, पार्टी गेम्स, वेन्यू और त्वरित RSVP।',
  descriptionEn: 'Interactive 3D gift box with opening lid, confetti burst, party activities, venue map and instant RSVP.',
  badgeHi: 'नया · 3D बॉक्स व कनफ़ेटी',
  badgeEn: 'New · 3D Box & Confetti',
  previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/sangeet.svg',
  isAvailable: true,
  isFeatured: true,
  defaultData: DEFAULT_BIRTHDAY_DATA,
  defaultScenes: DEFAULT_BIRTHDAY_SCENES,
};

// Template 6: Golden Gala Birthday (18th / 25th / 50th Milestone)
const TEMPLATE_GOLDEN_GALA_BIRTHDAY: TemplateCatalogEntry = {
  id: 'royal-golden-birthday',
  nameHi: 'रॉयल गोल्डन बर्थडे गाला',
  nameEn: 'Royal Golden Birthday Gala',
  category: 'birthday',
  descriptionHi: 'मिडनाइट स्लेट व शैम्पेन गोल्ड, 25वीं / 50वीं वर्षगांठ व बर्थडे गाला, लाइव म्यूजिकल शाम, मॉकटेल बार व वेन्यू।',
  descriptionEn: 'Midnight slate velvet with champagne gold accents, 25th / 50th milestone birthday gala, live music and celebrations.',
  badgeHi: 'रॉयल गाला · ब्लैक टाई',
  badgeEn: 'Milestone Gala · Black Tie',
  previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/reception.svg',
  isAvailable: true,
  isFeatured: false,
  defaultData: {
    ...DEFAULT_BIRTHDAY_DATA,
    title: "Devrat's 25th Golden Gala",
    titleHi: 'देवरत का 25वाँ गोल्डन बर्थडे गाला',
    subtitle: 'AN EVENING OF MUSIC & CHEER',
    subtitleHi: 'सुरमयी शाम व उत्सव',
    celebrantOrCouple: 'Devrat Kapoor',
    celebrantAge: 25,
    openingBlessing: 'Cheers to 25 Glorious Years! 🥂',
    openingBlessingColor: '#dfba6a',
    invitationText: 'Join us for a sophisticated evening of live jazz, delicious bites, cocktails, and joyful celebration on Devrat’s 25th milestone birthday!',
    venueName: 'The Sky Lounge & Ballroom, Worli Sea Face, Mumbai',
    venueAddress: 'Khan Abdul Gaffar Khan Road, Worli Sea Face, Mumbai - 400030',
    venueLandmark: 'Overlooking Worli Sea Face · Mumbai',
    googleMapsUrl: 'https://maps.google.com/?q=Worli+Sea+Face+Mumbai',
    coverTitle: '25th Golden Gala',
    coverSubtitle: 'DEVRAT KAPOOR',
    coverButtonText: 'Open Invitation 🍸',
    theme: {
      ...DEFAULT_BIRTHDAY_DATA.theme,
      coverColor: '#0f172a',       // Midnight Slate
      coverAccentColor: '#dfba6a', // Champagne Gold
      paperColor: '#f8fafc',       // Ice White
      pattern: 'confetti',
      particleType: 'cakes',
    },
    activities: [
      {
        id: 'bg-1',
        time: '07:30 PM',
        title: 'Red Carpet Welcoming & Cocktails',
        description: 'Signature mocktails & hors d’oeuvres with ambient acoustic jazz.',
        icon: 'Award',
      },
      {
        id: 'bg-2',
        time: '09:00 PM',
        title: 'Ceremonial Cake Cutting & Toast',
        description: 'Champagne toast and 25th milestone celebratory wishes.',
        icon: 'Cake',
      },
      {
        id: 'bg-3',
        time: '09:30 PM Onwards',
        title: 'Gala Dinner & Dance Floor',
        description: 'Live DJ set, gourmet buffet, and celebration under city lights.',
        icon: 'Sparkles',
      },
    ],
  },
  defaultScenes: DEFAULT_BIRTHDAY_SCENES,
};

// ==============================================================
// 3. CORPORATE TEMPLATES (2 Modern Executive Pass Styles)
// ==============================================================

// Template 7: Executive Lanyard Pass
const TEMPLATE_CORPORATE_PASS: TemplateCatalogEntry = {
  id: 'corporate-event-pass',
  nameHi: 'कॉन्फ्रेंस एक्सेस पास (वीआईपी)',
  nameEn: 'Executive Event Pass (VIP Lanyard)',
  category: 'corporate',
  descriptionHi: '3D डबल-साइडेड लैनयार्ड पास, एजेंडा टाइमलाइन, कीनोट स्पीकर्स, वेन्यू/वर्चुअल लिंक व पास रजिस्ट्रेशन।',
  descriptionEn: 'Double-sided 3D lanyard badge flip, keynote speakers, agenda timetable, virtual streaming link and delegate registration.',
  badgeHi: 'आधुनिक · 3D बैज फ्लिप',
  badgeEn: 'Modern · 3D Badge Flip',
  previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/reception.svg',
  isAvailable: true,
  isFeatured: true,
  defaultData: DEFAULT_CORPORATE_DATA,
  defaultScenes: DEFAULT_CORPORATE_SCENES,
};

// Template 8: Global Tech Expo (Obsidian & Electric Cyan)
const TEMPLATE_TECH_EXPO: TemplateCatalogEntry = {
  id: 'tech-summit-pass',
  nameHi: 'ग्लोबल टेक एक्सपो व इनोवेशन समिट',
  nameEn: 'Global Tech Expo 2027',
  category: 'corporate',
  descriptionHi: 'साइबर ओब्सिडियन व इलेक्ट्रिक सियान थीम, हाइब्रिड लाइव स्ट्रीम लिंक, ब्रेकआउट सेशंस, टेक लीडर्स व क्यूआर बैज।',
  descriptionEn: 'Futuristic obsidian & neon cyan aesthetic, hybrid live stream link, workshop tracks, industry pioneers and instant delegate registration.',
  badgeHi: 'हाइब्रिड स्ट्रीम · एआई एक्सपो',
  badgeEn: 'Hybrid Live Stream · AI Expo',
  previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/sangeet.svg',
  isAvailable: true,
  isFeatured: false,
  defaultData: {
    ...DEFAULT_CORPORATE_DATA,
    title: 'Future AI & Cloud Global Expo 2027',
    titleHi: 'फ्यूचर एआई व क्लाउड ग्लोबल एक्सपो 2027',
    subtitle: 'GLOBAL DEVELOPER & ENTERPRISE PASS',
    subtitleHi: 'ग्लोबल डेवलपर व एंटरप्राइज पास',
    celebrantOrCouple: 'Global Tech Expo 2027',
    openingBlessing: 'Pioneering the Next Era of Intelligent Cloud & AI',
    onlineMeetingUrl: 'https://live.grandbandhan.com/stream/expo2027',
    venueName: 'Bengaluru International Exhibition Centre (BIEC), Bengaluru',
    venueAddress: '10th Mile, Tumkur Road, Madavara Post, Bengaluru, Karnataka - 562123',
    venueLandmark: 'Hall 3 · BIEC Tumkur Road, Bengaluru',
    coverTitle: 'TECH EXPO 2027',
    coverSubtitle: 'ALL-ACCESS DELEGATE PASS',
    theme: {
      ...DEFAULT_CORPORATE_DATA.theme,
      coverColor: '#020617',       // Deepest Obsidian
      coverAccentColor: '#38bdf8', // Electric Cyan
      paperColor: '#f8fafc',
      pattern: 'tech',
      particleType: 'tech',
    },
  },
  defaultScenes: DEFAULT_CORPORATE_SCENES,
};

// ==============================================================
// 4. CUSTOM OCCASION TEMPLATES (2 Traditional & Milestone Styles)
// ==============================================================

// Template 9: Auspicious Floral Door / Griha Pravesh
const TEMPLATE_FLORAL_DOOR: TemplateCatalogEntry = {
  id: 'custom-floral-door',
  nameHi: 'उत्सव तोरण द्वार (गृहप्रवेश)',
  nameEn: 'Floral Arch Invitation (Housewarming)',
  category: 'custom',
  descriptionHi: 'गृहप्रवेश व पारिवारिक उत्सवों के लिए मंगल तोरण द्वार, वैदिक अनुष्ठान विवरण, स्थल मार्ग व सस्नेह RSVP।',
  descriptionEn: 'Traditional floral door opening ceremony, ritual timings, directions map and gracious RSVP for auspicious milestones.',
  badgeHi: 'सात्विक · 3D तोरण द्वार',
  badgeEn: 'Traditional · 3D Floral Arch',
  previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/pheras.svg',
  isAvailable: true,
  isFeatured: true,
  defaultData: DEFAULT_CUSTOM_DATA,
  defaultScenes: DEFAULT_CUSTOM_SCENES,
};

// Template 10: Silver Jubilee Celebration (25th Wedding Anniversary)
const TEMPLATE_SILVER_JUBILEE: TemplateCatalogEntry = {
  id: 'silver-jubilee-celebration',
  nameHi: 'सिल्वर जुबली (25 वर्ष उत्सव)',
  nameEn: 'Silver Jubilee Anniversary Gala',
  category: 'custom',
  descriptionHi: '25 वर्ष के पावन दांपत्य सफर की सुनहरी दास्तान, परिवार मिलन, आशीर्वाद समारोह, डिनर गाला व डिजिटल शगुन।',
  descriptionEn: 'Celebrating 25 glorious years of togetherness, milestone memories, family dinner gala, directions and blessing RSVP.',
  badgeHi: '25वीं वर्षगांठ · सिल्वर जुबली',
  badgeEn: '25th Anniversary · Silver Jubilee',
  previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/haldi.svg',
  isAvailable: true,
  isFeatured: false,
  defaultData: {
    ...DEFAULT_CUSTOM_DATA,
    title: '25 Glorious Years of Togetherness',
    titleHi: 'सिल्वर जुबली: 25 वर्ष का पावन सफर',
    subtitle: 'SILVER JUBILEE ANNIVERSARY GALA',
    subtitleHi: '25वीं वैवाहिक वर्षगांठ उत्सव',
    celebrantOrCouple: 'Sunil & Rashmi Gupta',
    hostNames: 'Akash, Priya & The Gupta Family',
    openingBlessing: '॥ प्रेम, विश्वास व समर्पण के 25 स्वर्णिम वर्ष ॥',
    invitationText: 'ईश्वर के आशीर्वाद और आप सभी के स्नेह से हमारे पूज्य माता-पिता वैवाहिक जीवन के 25 सफल वर्ष पूर्ण कर रहे हैं। इस खुशी के अवसर पर सादर आमंत्रित हैं।',
    eventDateFormatted: 'Saturday, February 20, 2027',
    eventDateFormattedHi: 'शनिवार, 20 फरवरी 2027',
    eventIsoDate: '2027-02-20T19:00:00',
    muhuratOrTime: 'सायं 07:00 बजे मिलन | 08:30 बजे डिनर',
    venueName: 'The Oberoi Grand Ballroom, MG Road, New Delhi',
    venueAddress: 'Dr. Zakir Hussain Marg, Near India Gate, New Delhi - 110003',
    venueLandmark: 'Near India Gate · Central Delhi',
    googleMapsUrl: 'https://maps.google.com/?q=The+Oberoi+New+Delhi',
    coverTitle: 'Silver Jubilee',
    coverSubtitle: 'SUNIL & RASHMI GUPTA',
    coverButtonText: 'प्रवेश करें (View Invitation) 🥂',
    theme: {
      ...DEFAULT_CUSTOM_DATA.theme,
      coverColor: '#581c2b',       // Elegant Royal Burgundy
      coverAccentColor: '#dfba6a', // Royal Gold
      paperColor: '#faf7f2',
      pattern: 'palace',
      particleType: 'flowers',
    },
    activities: [
      {
        id: 'sj-1',
        time: '07:00 PM',
        title: 'Welcoming & Musical Reception',
        description: 'Welcoming guests with traditional shehnai, mocktails, and couple memories.',
        icon: 'Award',
      },
      {
        id: 'sj-2',
        time: '08:00 PM',
        title: 'Silver Vows & Garland Ceremony',
        description: 'Varmala ceremony renewal and family congratulations.',
        icon: 'Sparkles',
      },
      {
        id: 'sj-3',
        time: '08:30 PM Onwards',
        title: 'Grand Banquet Dinner & Shagun',
        description: 'Gourmet dinner celebration and sharing heartfelt blessings.',
        icon: 'Utensils',
      },
    ],
  },
  defaultScenes: DEFAULT_CUSTOM_SCENES,
};

// ==============================================================
// MASTER CATALOG EXPORT (10 Full Playable Templates)
// ==============================================================
export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  // Wedding (4)
  TEMPLATE_ROYAL_WEDDING_BOOK,
  TEMPLATE_EMERALD_PALACE,
  TEMPLATE_SAFFRON_MANDAP,
  TEMPLATE_BLUSH_ROSE,

  // Birthday (2)
  TEMPLATE_SURPRISE_BOX,
  TEMPLATE_GOLDEN_GALA_BIRTHDAY,

  // Corporate (2)
  TEMPLATE_CORPORATE_PASS,
  TEMPLATE_TECH_EXPO,

  // Custom (2)
  TEMPLATE_FLORAL_DOOR,
  TEMPLATE_SILVER_JUBILEE,
];

export function getTemplatesByCategory(category: EventCategory | 'all'): TemplateCatalogEntry[] {
  if (category === 'all') return TEMPLATE_CATALOG;
  return TEMPLATE_CATALOG.filter((t) => t.category === category);
}

export function getTemplateById(id: string): TemplateCatalogEntry | undefined {
  return TEMPLATE_CATALOG.find((t) => t.id === id) || TEMPLATE_CATALOG[0];
}
