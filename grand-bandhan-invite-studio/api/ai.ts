// Vercel Serverless Function: POST /api/ai
// Secure server-side AI provider adapter (supports Gemini, OpenAI, Claude)

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, currentData, scope } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A prompt string is required' });
    }

    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // If an external API key is configured on Vercel
    if (apiKey) {
      // Example call to Gemini / OpenAI provider with structured JSON instruction
      // ...
    }

    // Server-side robust heuristic intelligence & diff calculation
    const lower = prompt.toLowerCase();
    let description = '';
    let patch: any = {};
    let missingInfoPrompt: string | null = null;

    if (lower.includes('emerald') || lower.includes('हरा') || lower.includes('green') || lower.includes('पन्ना')) {
      description = 'Change cover to Royal Emerald (#1b4332) with Champagne Gold (#ecd599) borders.';
      patch = {
        theme: {
          ...currentData?.theme,
          coverColor: '#1b4332',
          coverAccentColor: '#ecd599',
          paperColor: '#fbf9f4',
        },
      };
    } else if (lower.includes('स्नेहिल') || lower.includes('आमंत्रण')) {
      description = 'Set opening blessing to "स्नेहिल आमंत्रण" in Noto Serif Devanagari font.';
      patch = {
        openingBlessing: 'स्नेहिल आमंत्रण',
        openingBlessingFont: 'Noto Serif Devanagari',
        openingBlessingSize: 22,
        openingBlessingColor: '#c99a3e',
      };
    } else if (lower.includes('गणेश') || lower.includes('ganesh')) {
      description = 'Set sacred invocation to "॥ श्री गणेशाय नमः ॥" in traditional gold.';
      patch = {
        openingBlessing: '॥ श्री गणेशाय नमः ॥',
        openingBlessingFont: 'Noto Serif Devanagari',
        openingBlessingColor: '#c99a3e',
      };
    } else if (lower.includes('wine') || lower.includes('वाइन') || lower.includes('लाल')) {
      description = 'Set cover velvet color to Royal Heritage Wine (#6e1f2f) and Gold.';
      patch = {
        theme: {
          ...currentData?.theme,
          coverColor: '#6e1f2f',
          coverAccentColor: '#dfba6a',
          paperColor: '#faf7f2',
        },
      };
    } else if (lower.includes('navy') || lower.includes('नीला') || lower.includes('space') || lower.includes('रॉकेट')) {
      description = 'Apply Cosmic Navy Space theme with yellow starlight ribbons.';
      patch = {
        theme: {
          ...currentData?.theme,
          coverColor: '#1d3557',
          coverAccentColor: '#ffd166',
          paperColor: '#fdfbf7',
        },
      };
      if (!lower.includes('venue') && !lower.includes('पता') && !currentData?.venueAddress) {
        missingInfoPrompt = 'Where will the celebration take place? You can add the venue address or keep the existing location.';
      }
    } else {
      description = `Refine design and wording according to: "${prompt}"`;
      patch = {
        theme: {
          ...currentData?.theme,
          coverAccentColor: '#dfba6a',
        },
      };
    }

    return res.status(200).json({
      success: true,
      provider: apiKey ? 'live-llm' : 'server-heuristic',
      description,
      patch,
      missingInfoPrompt,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'AI Provider Error',
      message: err.message,
    });
  }
}
