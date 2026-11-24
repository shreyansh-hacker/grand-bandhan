import React, { useState } from 'react';
import { GenericInvitationData } from '../../types/invitation';
import { Sparkles, Check, X, Bot, AlertCircle, HelpCircle, Undo2 } from 'lucide-react';
import { useLanguage } from '../../locales';

interface AiAssistantPanelProps {
  data: GenericInvitationData;
  onApplyChanges: (partialData: Partial<GenericInvitationData>) => void;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  data,
  onApplyChanges,
}) => {
  const { lang, t } = useLanguage();
  const [prompt, setPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [proposedChanges, setProposedChanges] = useState<{
    description: string;
    patch: Partial<GenericInvitationData>;
    missingInfo?: string | null;
  } | null>(null);
  const [previousSnapshot, setPreviousSnapshot] = useState<GenericInvitationData | null>(null);

  const samplePrompts = [
    {
      title: lang === 'hi' ? 'शाही पन्ना व स्वर्ण थीम' : 'Emerald Green & Gold Theme',
      promptText:
        lang === 'hi'
          ? 'कवर का रंग गहरा पन्ना हरा (Emerald Green) करो और सुनहरा बॉर्डर रखो।'
          : 'Change only the cover to royal emerald green with champagne gold trim.',
    },
    {
      title: lang === 'hi' ? 'स्नेहिल आमंत्रण मंगलाचरण' : 'Traditional Opening Mantra',
      promptText:
        lang === 'hi'
          ? 'शीर्ष मंगलाचरण को बदलकर "स्नेहिल आमंत्रण" करो।'
          : 'Update the opening blessing to "स्नेहिल आमंत्रण" in Devanagari script.',
    },
    {
      title: lang === 'hi' ? 'कॉस्मिक नेवी स्पेस थीम' : 'Cosmic Navy Space Theme',
      promptText:
        lang === 'hi'
          ? 'कवर को गहरा रॉयल नेवी ब्लू और एक्सेंट को स्पेस गोल्ड करो।'
          : 'Switch the invitation theme to deep cosmic navy with starlight gold accents.',
    },
    {
      title: lang === 'hi' ? 'क्लासिक वाइन व गोल्ड' : 'Classic Royal Wine Velvet',
      promptText:
        lang === 'hi'
          ? 'कवर को क्लासिक मखमली वाइन (#6e1f2f) रंग में वापस बदलो।'
          : 'Restore the velvet wine (#6e1f2f) cover and heritage champagne gold borders.',
    },
  ];

  const handleRequestAi = async (text: string) => {
    setIsProcessing(true);
    setProposedChanges(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, currentData: data }),
      });

      if (res.ok) {
        const json = await res.json();
        setProposedChanges({
          description: json.description,
          patch: json.patch,
          missingInfo: json.missingInfoPrompt,
        });
        setIsProcessing(false);
        return;
      }
    } catch {
      // Fallback to local heuristic engine
    }

    // Local heuristic engine
    setTimeout(() => {
      setIsProcessing(false);
      const lower = text.toLowerCase();

      if (lower.includes('हरा') || lower.includes('emerald') || lower.includes('green') || lower.includes('पन्ना')) {
        setProposedChanges({
          description:
            lang === 'hi'
              ? 'कवर को रॉयल पन्ना हरा (#1b4332) और एक्सेंट को शैम्पेन गोल्ड (#ecd599) में बदलना।'
              : 'Changed cover velvet to Royal Emerald (#1b4332) and accents to Champagne Gold (#ecd599).',
          patch: {
            theme: {
              ...data.theme,
              coverColor: '#1b4332',
              coverAccentColor: '#ecd599',
              paperColor: '#fbf9f4',
            },
          },
        });
      } else if (lower.includes('स्नेहिल') || lower.includes('आमंत्रण')) {
        setProposedChanges({
          description:
            lang === 'hi'
              ? 'मंगलाचरण को "स्नेहिल आमंत्रण" में बदलना व फ़ॉन्ट 22px करना।'
              : 'Updated opening greeting to "स्नेहिल आमंत्रण" in 22px Devanagari script.',
          patch: {
            openingBlessing: 'स्नेहिल आमंत्रण',
            openingBlessingFont: 'Noto Serif Devanagari',
            openingBlessingSize: 22,
            openingBlessingColor: '#c99a3e',
          },
        });
      } else if (lower.includes('नीला') || lower.includes('navy') || lower.includes('space') || lower.includes('blue')) {
        setProposedChanges({
          description:
            lang === 'hi'
              ? 'कवर को गहरा रॉयल नेवी इंडिगो (#1d3557) और एक्सेंट को शैम्पेन गोल्ड में बदलना।'
              : 'Switched color palette to Cosmic Midnight Navy (#1d3557) and Gold.',
          patch: {
            theme: {
              ...data.theme,
              coverColor: '#1d3557',
              coverAccentColor: '#ffd166',
              paperColor: '#fdfbf7',
            },
          },
          missingInfo:
            !data.venueAddress || data.venueAddress.length < 5
              ? 'Please specify the exact venue or city address to include in the invitation.'
              : null,
        });
      } else {
        setProposedChanges({
          description:
            lang === 'hi'
              ? 'क्लासिक मखमली वाइन (#6e1f2f) व देवनागरी स्टाइल लागू करना।'
              : 'Applied Classic Velvet Wine (#6e1f2f) and Gold luxury typography.',
          patch: {
            theme: {
              ...data.theme,
              coverColor: '#6e1f2f',
              coverAccentColor: '#dfba6a',
              paperColor: '#faf7f2',
            },
          },
        });
      }
    }, 450);
  };

  const applyProposal = () => {
    if (proposedChanges) {
      setPreviousSnapshot(JSON.parse(JSON.stringify(data)));
      onApplyChanges(proposedChanges.patch);
      setProposedChanges(null);
      setPrompt('');
    }
  };

  const handleUndo = () => {
    if (previousSnapshot) {
      onApplyChanges(previousSnapshot);
      setPreviousSnapshot(null);
    }
  };

  return (
    <div className="w-full md:w-80 bg-white border-l border-[#e8decb] flex flex-col h-full overflow-y-auto select-none p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e8decb]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#6e1f2f]/10 text-[#6e1f2f]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-heading text-[#6e1f2f]">
              {t.aiTitle}
            </h3>
            <p className="text-[10px] text-[#7d6a58] font-sans">
              {t.aiSubtitle}
            </p>
          </div>
        </div>

        {previousSnapshot && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#852b3d] hover:underline"
            title="Undo last AI change"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-2">
        <span className="text-[11px] font-sans font-semibold text-[#5c4f4a] block">
          {t.aiQuickPrompts}
        </span>
        <div className="space-y-1.5">
          {samplePrompts.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => {
                setPrompt(p.promptText);
                handleRequestAi(p.promptText);
              }}
              className="w-full text-left p-2 rounded-lg border border-[#e8decb] hover:bg-[#faf7f2] hover:border-[#c99a3e]/60 transition-all text-xs"
            >
              <div className="font-sans font-medium text-[#2c2523] flex items-center justify-between">
                <span>{p.title}</span>
                <Sparkles className="w-3 h-3 text-[#c99a3e]" />
              </div>
              <p className="text-[10px] text-[#7d6a58] mt-0.5 truncate font-sans">
                {p.promptText}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Box */}
      <div className="space-y-2 pt-2 border-t border-[#e8decb]">
        <label className="block text-xs font-sans font-medium text-[#2c2523]">
          Custom AI Prompt:
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.aiPlaceholder}
          className="w-full px-3 py-2 text-xs font-sans rounded-lg border border-[#e8decb] focus:ring-2 focus:ring-[#c99a3e] outline-none"
        />

        <button
          onClick={() => handleRequestAi(prompt)}
          disabled={!prompt.trim() || isProcessing}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#6e1f2f] text-[#dfba6a] text-xs font-semibold shadow hover:bg-[#541421] disabled:opacity-40 transition-all"
        >
          {isProcessing ? (
            <span>{t.aiApplying}</span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.aiGenerateDiff}</span>
            </>
          )}
        </button>
      </div>

      {/* Proposed Changes Preview Box */}
      {proposedChanges && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5 animate-fade-in">
          <div className="flex items-center gap-1.5 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-sans font-bold">
              {t.aiProposedChanges}
            </span>
          </div>

          <p className="text-xs font-sans text-amber-900/90 leading-relaxed">
            {proposedChanges.description}
          </p>

          {/* Missing info prompt if factual details needed */}
          {proposedChanges.missingInfo && (
            <div className="p-2 rounded bg-amber-100/70 text-[10px] text-amber-900 flex items-start gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>{proposedChanges.missingInfo}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={applyProposal}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.applyChanges}</span>
            </button>
            <button
              onClick={() => setProposedChanges(null)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-300 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.discardChanges}</span>
            </button>
          </div>
        </div>
      )}

      {/* Security Banner */}
      <div className="mt-auto pt-3 border-t border-[#e8decb] text-[10px] text-[#7d6a58] space-y-1">
        <div className="flex items-center gap-1 text-[#852b3d]">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="font-semibold">Security &amp; Keys:</span>
        </div>
        <p className="leading-tight">
          {t.aiProviderNote}
        </p>
      </div>
    </div>
  );
};
