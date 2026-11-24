import React, { useState } from 'react';
import { InvitationDraft } from '../../types/invitation';
import { X, MessageSquare, Copy, Check, Send, Sparkles } from 'lucide-react';
import { useLanguage } from '../../locales';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: InvitationDraft;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  draft,
}) => {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [languageMode, setLanguageMode] = useState<'hi' | 'en'>(
    draft.data?.invitationLanguage === 'hi' ? 'hi' : 'en'
  );

  if (!isOpen) return null;

  const data = draft.publishedData || draft.data || {};
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://grand-bandhan-theta.vercel.app';
  const inviteUrl = `${origin}/i/${draft.slug}`;

  const coupleOrTitle = data.title ||
    (data.groomName && data.brideName
      ? `${data.groomName} & ${data.brideName}`
      : draft.name);

  const venueText = data.venue?.name
    ? `${data.venue.name}${data.venue.city ? `, ${data.venue.city}` : ''}`
    : 'Grand Heritage Venue';

  const dateText = data.weddingDate?.day && data.weddingDate?.month && data.weddingDate?.year
    ? `${data.weddingDate.day} ${data.weddingDate.month} ${data.weddingDate.year}`
    : 'December 2027';

  const defaultHindiMessage = `🌸 ।। श्री गणेशाय नमः ।। 🌸\n\nपरमपिता परमात्मा और पूज्य पूर्वजों के आशीर्वाद से, हमारे परिवार के मांगलिक विवाह उत्सव में आप सपरिवार सादर आमंत्रित हैं:\n\n✨ *${coupleOrTitle}* ✨\n\n📅 *शुभ तिथि:* ${dateText}\n📍 *स्थान:* ${venueText}\n\n📖 *हमारा इंटरैक्टिव 3D डिजिटल निमंत्रण पत्र यहाँ खोलें:*\n👉 ${inviteUrl}\n\nकृपया ऊपर दिए गए लिंक पर अपना RSVP अवश्य दर्ज करें।\n\n*स्नेहाकांक्षी:*\nसमस्त परिवारजन\nग्रैंड बंधन इनवाइट स्टूडियो`;

  const defaultEnglishMessage = `🌸 Om Shri Ganeshaya Namah 🌸\n\nWith the divine blessings of our ancestors and boundless joy in our hearts, we cordially invite you and your family to celebrate the wedding of:\n\n✨ *${coupleOrTitle}* ✨\n\n📅 *Date:* ${dateText}\n📍 *Venue:* ${venueText}\n\n📖 *Open our interactive 3D Royal Wedding Invitation here:*\n👉 ${inviteUrl}\n\nKindly confirm your presence by submitting your RSVP on the card.\n\n*Warm Regards,*\nFamily & Friends\nGrand Bandhan Invite Studio`;

  const [message, setMessage] = useState(
    languageMode === 'hi' ? defaultHindiMessage : defaultEnglishMessage
  );

  const handleSwitchLanguage = (l: 'hi' | 'en') => {
    setLanguageMode(l);
    setMessage(l === 'hi' ? defaultHindiMessage : defaultEnglishMessage);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#faf7f2] rounded-3xl shadow-2xl border-2 border-[#c9a96a]/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#128c7e] to-[#075e54] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                {lang === 'hi' ? 'व्हाट्सएप ब्रॉडकास्ट किट' : 'WhatsApp Broadcast Kit'}
              </h3>
              <p className="text-xs text-white/80">
                {lang === 'hi' ? 'रिश्तेदारों और दोस्तों को 1-क्लिक में निमंत्रण भेजें' : 'Ready-to-send royal WhatsApp invitation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#7c6f64] uppercase tracking-wider">
              {lang === 'hi' ? 'संदेश भाषा चुनें:' : 'Select Message Language:'}
            </span>
            <div className="inline-flex rounded-lg border border-[#c9a96a]/40 p-0.5 bg-white text-xs">
              <button
                type="button"
                onClick={() => handleSwitchLanguage('en')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  languageMode === 'en'
                    ? 'bg-[#6e1f2f] text-white'
                    : 'text-[#7c6f64] hover:text-[#2c2523]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLanguage('hi')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  languageMode === 'hi'
                    ? 'bg-[#6e1f2f] text-white'
                    : 'text-[#7c6f64] hover:text-[#2c2523]'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Editable Text Area */}
          <textarea
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3.5 text-xs sm:text-sm bg-white border border-[#d5c7b3] rounded-xl font-mono text-[#2c2523] focus:outline-none focus:border-[#075e54] focus:ring-1 focus:ring-[#075e54] leading-relaxed resize-none shadow-inner"
          />

          {/* Action Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-4 bg-white border border-[#c9a96a] text-[#6e1f2f] font-medium text-xs sm:text-sm rounded-xl hover:bg-[#c9a96a]/10 transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (lang === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : (lang === 'hi' ? 'टेक्स्ट कॉपी करें' : 'Copy Text')}</span>
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="py-2.5 px-4 bg-[#25d366] hover:bg-[#1ebd5b] text-white font-medium text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'hi' ? 'व्हाट्सएप पर खोलें' : 'Share on WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
