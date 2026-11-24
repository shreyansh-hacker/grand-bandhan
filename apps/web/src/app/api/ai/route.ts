// Next.js Route Handler: POST /api/ai
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, tone = 'royal', locale = 'hi' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'A prompt string is required' }, { status: 400 });
    }

    // Deterministic royal wedding invitation copy generator
    let suggestion = '';
    const isHindi = locale === 'hi' || /[\u0900-\u097F]/.test(prompt);

    if (isHindi) {
      if (prompt.includes('माता-पिता') || prompt.includes('दादा')) {
        suggestion = 'परमपिता परमात्मा की असीम अनुकंपा से, हमारे सुपुत्र/सुपुत्री के मांगलिक पाणिग्रहण संस्कार के इस पावन पर्व पर आप सपरिवार सादर आमंत्रित हैं।';
      } else if (prompt.includes('संगीत') || prompt.includes('मेहंदी')) {
        suggestion = 'सुरों की महफ़िल, अपनों का प्यार, सजेंगे संगीत और मेहंदी के रंगीन उपहार। आइए संग मिलकर खुशियाँ मनाएँ!';
      } else {
        suggestion = 'मांगलिक बेला आई पावन, बँध रहा नव जीवन का बंधन। आपके शुभाशीष और स्नेह की प्रतीक्षा में सपरिवार निमंत्रित हैं।';
      }
    } else {
      if (tone === 'poetic' || tone === 'royal') {
        suggestion = 'With the divine blessings of our ancestors and boundless joy in our hearts, we cordially invite you to celebrate the royal union of our families.';
      } else {
        suggestion = 'Two lives, two hearts, joined together in friendship, united forever in love. We invite you to join us on our special wedding celebration.';
      }
    }

    return NextResponse.json({
      success: true,
      suggestion,
      tone,
      locale,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process AI prompt', message: err.message }, { status: 500 });
  }
}
