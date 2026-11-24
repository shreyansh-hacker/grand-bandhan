# नया टेम्पलेट जोड़ने की मार्गदर्शिका (How to Add a New Template)

ग्रांड बंधन इनवाइट स्टूडियो का आर्किटेक्चर पूरी तरह से मॉड्यूलर है। आप बिना किसी जटिल कोड बदलाव के नया टेम्पलेट जोड़ सकते हैं।

---

## चरण 1: नया टेम्पलेट फ़ोल्डर बनाएँ
`src/templates/` में अपने टेम्पलेट नाम से एक नया फ़ोल्डर बनाएँ, उदाहरण के लिए:
`src/templates/palace-envelope/`

इसके अंदर तीन मुख्य फ़ाइलें बनाएँ:
1. `theme.ts` — इस टेम्पलेट के रंग, फॉन्ट्स और स्पेसिंग टोकन्स।
2. `motion.ts` — 3D फ्लिप, ओपनिंग और स्क्रॉल स्पीड।
3. `template.ts` — इस टेम्पलेट का डिफ़ॉल्ट डेटा, सीन सूची और टेक्स्ट।

---

## चरण 2: संपत्तियाँ (Assets) जोड़ें
`public/assets/templates/palace-envelope/` में अपनी इमेज या SVG रखें:
- `cover/` (कवर व प्रतीक)
- `illustrations/` (रस्मों के चित्र)
- `photos/` (नमूना जोड़े की तस्वीरें)

---

## चरण 3: टेम्पलेट कैटलॉग में रजिस्टर करें
`src/templates/catalog.ts` फ़ाइल खोलें और `TEMPLATE_CATALOG` ऐरे में नई प्रविष्टि जोड़ें:

```ts
import { DEFAULT_PALACE_DATA, DEFAULT_PALACE_SCENES } from './palace-envelope/template';

// TEMPLATE_CATALOG ऐरे में जोड़ें:
{
  id: 'palace-envelope',
  nameHi: 'शाही लिफ़ाफ़ा',
  nameEn: 'Palace Envelope',
  category: 'wedding',
  descriptionHi: 'मोम की सील टूटने और लिफ़ाफ़ा खुलने का अद्भुत 3D अनुभव।',
  descriptionEn: '3D wax seal break and letter unfold invitation.',
  badgeHi: 'शाही अनुभव',
  badgeEn: 'Royal Experience',
  previewThumbnail: '/assets/templates/palace-envelope/cover.svg',
  isAvailable: true,
  isFeatured: true,
  defaultData: DEFAULT_PALACE_DATA,
  defaultScenes: DEFAULT_PALACE_SCENES,
}
```

---

## चरण 4: जांचें और सत्यापित करें (Verification)
1. टर्मिनल में चलाएँ:
   ```powershell
   pnpm --filter grand-bandhan-invite-studio run build
   ```
2. ब्राउज़र में `http://localhost:5173/#/gallery` खोलें।
3. गैलरी में आपका नया टेम्पलेट कार्ड दिखेगा। "पूरा डेमो देखें" और "इस टेम्पलेट से बनाएँ" दोनों का परीक्षण करें।
