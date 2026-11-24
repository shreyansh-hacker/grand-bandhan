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

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {
    id: 'royal-wedding-book',
    nameHi: 'रॉयल वेडिंग बुक',
    nameEn: 'Royal Wedding Book',
    category: 'wedding',
    descriptionHi: 'मखमली वाइन 3D किताब, डोरी से तारीख अनावरण, रस्मों का कैरोसेल, मैप मार्ग दर्शन व लाइव RSVP।',
    descriptionEn: 'Deep wine velvet 3D book cover, tassel scroll date reveal, ceremony carousel, interactive map and live RSVP.',
    badgeHi: 'सबसे लोकप्रिय · 3D अनुभव',
    badgeEn: 'Most Popular · 3D Interactive',
    previewThumbnail: '/assets/templates/royal-wedding-book/photos/couple-hero.svg',
    isAvailable: true,
    isFeatured: true,
    defaultData: DEFAULT_ROYAL_WEDDING_DATA,
    defaultScenes: DEFAULT_SCENES,
  },
  {
    id: 'birthday-surprise-box',
    nameHi: 'सरप्राइज़ गिफ़्ट बॉक्स',
    nameEn: 'Surprise Gift Box',
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
  },
  {
    id: 'corporate-event-pass',
    nameHi: 'कॉन्फ्रेंस एक्सेस पास',
    nameEn: 'Executive Event Pass',
    category: 'corporate',
    descriptionHi: '3D डबल-साइडेड लैनयार्ड पास, एजेंडा टाइमलाइन, कीनोट स्पीकर्स, वेन्यू/वर्चुअल लिंक व पास रजिस्ट्रेशन।',
    descriptionEn: 'Double-sided 3D lanyard badge flip, keynote speakers, agenda timetable, virtual streaming link and delegate registration.',
    badgeHi: 'आधुनिक · 3D बैज फ्लिप',
    badgeEn: 'Modern · 3D Badge Flip',
    previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/reception.svg',
    isAvailable: true,
    isFeatured: false,
    defaultData: DEFAULT_CORPORATE_DATA,
    defaultScenes: DEFAULT_CORPORATE_SCENES,
  },
  {
    id: 'custom-floral-door',
    nameHi: 'उत्सव तोरण द्वार',
    nameEn: 'Floral Arch Invitation',
    category: 'custom',
    descriptionHi: 'गृहप्रवेश व पारिवारिक उत्सवों के लिए मंगल तोरण द्वार, वैदिक अनुष्ठान विवरण, स्थल मार्ग व सस्नेह RSVP।',
    descriptionEn: 'Traditional floral door opening ceremony, ritual timings, directions map and gracious RSVP for auspicious milestones.',
    badgeHi: 'सात्विक · 3D तोरण द्वार',
    badgeEn: 'Traditional · 3D Floral Arch',
    previewThumbnail: '/assets/templates/royal-wedding-book/illustrations/pheras.svg',
    isAvailable: true,
    isFeatured: false,
    defaultData: DEFAULT_CUSTOM_DATA,
    defaultScenes: DEFAULT_CUSTOM_SCENES,
  },
];

export function getTemplatesByCategory(category: EventCategory): TemplateCatalogEntry[] {
  return TEMPLATE_CATALOG.filter((t) => t.category === category);
}

export function getTemplateById(id: string): TemplateCatalogEntry | undefined {
  return TEMPLATE_CATALOG.find((t) => t.id === id) || TEMPLATE_CATALOG[0];
}
