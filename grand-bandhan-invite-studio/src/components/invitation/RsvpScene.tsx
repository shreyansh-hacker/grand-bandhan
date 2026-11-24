import React, { useState, useEffect } from 'react';
import { GenericInvitationData, RsvpRecord } from '../../types/invitation';
import { Check, X, Users, User, Phone, MessageSquare, Send, CheckCircle2, Gift, Calendar, Sparkles, Heart } from 'lucide-react';
import { useLanguage } from '../../locales';
import { generateIcsCalendar } from '../../services/calendar';
import confetti from 'canvas-confetti';

interface RsvpSceneProps {
  data: GenericInvitationData;
  slug?: string;
  isDemo?: boolean;
  onRsvpSubmitted?: (record: RsvpRecord) => void;
}

const SHAGUN_OPTIONS = [
  { amount: 0, label: 'आशीर्वाद (Blessings)', subtitle: 'केवल शुभकामनाएँ' },
  { amount: 501, label: '₹501', subtitle: 'शुभ शगुन' },
  { amount: 1101, label: '₹1,101', subtitle: 'मंगल शगुन' },
  { amount: 2101, label: '₹2,101', subtitle: 'राजकीय शगुन' },
  { amount: 5101, label: '₹5,101', subtitle: 'सौहार्द शगुन' },
];

export const RsvpScene: React.FC<RsvpSceneProps> = ({
  data,
  slug = 'demo-event',
  isDemo = false,
  onRsvpSubmitted,
}) => {
  const { t } = useLanguage();
  const tokenKey = `gb_rsvp_token_${slug}`;

  const [status, setStatus] = useState<'attending' | 'declined'>('attending');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [guestName, setGuestName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [shagunAmount, setShagunAmount] = useState<number>(1101);
  const [customShagun, setCustomShagun] = useState<string>('');
  const [isCustomShagun, setIsCustomShagun] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [existingRecord, setExistingRecord] = useState<RsvpRecord | null>(null);

  // Check if guest previously RSVP'd on this device
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(tokenKey);
      if (savedToken) {
        const storedList = JSON.parse(localStorage.getItem(`gb_rsvps_${slug}`) || '[]') as RsvpRecord[];
        const found = storedList.find((r) => r.guestToken === savedToken);
        if (found) {
          setExistingRecord(found);
          setStatus(found.status);
          setGuestCount(found.guestCount);
          setGuestName(found.guestName);
          setContact(found.contact);

          // Parse shagun if present
          const rawNote = found.dietaryOrNote || '';
          const match = rawNote.match(/\[Shagun: ₹?(\d+)\]/i);
          if (match) {
            const amt = parseInt(match[1], 10);
            setShagunAmount(amt);
            if (!SHAGUN_OPTIONS.some((o) => o.amount === amt)) {
              setIsCustomShagun(true);
              setCustomShagun(amt.toString());
            }
            setNote(rawNote.replace(/\[Shagun: ₹?\d+\]\s*/i, ''));
          } else if (rawNote.includes('[Blessings Only]')) {
            setShagunAmount(0);
            setNote(rawNote.replace(/\[Blessings Only\]\s*/i, ''));
          } else {
            setNote(rawNote);
          }

          setHasSubmitted(true);
        }
      }
    } catch {
      // ignore storage access issues
    }
  }, [slug, tokenKey]);

  const activeShagun = isCustomShagun ? parseInt(customShagun, 10) || 0 : shagunAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const token = existingRecord?.guestToken || `gt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Format note with ceremonial Shagun tag
    const shagunPrefix = activeShagun > 0 ? `[Shagun: ₹${activeShagun.toLocaleString('en-IN')}] ` : '[Blessings Only] ';
    const formattedNote = `${shagunPrefix}${note.trim()}`.trim();

    const record: RsvpRecord = {
      id: existingRecord?.id || `rsvp_${Date.now()}`,
      slug,
      guestName: guestName.trim(),
      contact: contact.trim(),
      status,
      guestCount: status === 'attending' ? guestCount : 0,
      dietaryOrNote: formattedNote,
      guestToken: token,
      submittedAt: existingRecord?.submittedAt || Date.now(),
      updatedAt: Date.now(),
    };

    // Save locally for device persistence
    try {
      localStorage.setItem(tokenKey, token);
      const storageKey = isDemo ? 'gb_rsvps_demo' : `gb_rsvps_${slug}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]') as RsvpRecord[];
      const filtered = existing.filter((r) => r.guestToken !== token);
      filtered.push(record);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch {
      // safe fallback
    }

    // Try posting to server-side API if not demo
    if (!isDemo && typeof window !== 'undefined') {
      try {
        await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, rsvp: record }),
        });
      } catch {
        // network error handled gracefully
      }
    }

    // Trigger ceremonial celebration burst
    try {
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#c99a3e', '#dfba6a', '#852b3d', '#ffd166', '#fff'],
      });
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
      setExistingRecord(record);
      if (onRsvpSubmitted) onRsvpSubmitted(record);
    }, 400);
  };

  const handleCalendar = () => {
    generateIcsCalendar(
      `${data.groomName || data.celebrantOrCouple || data.title || 'Grand Bandhan'} - Celebration`,
      `${data.invitationText || 'Grand Bandhan Celebration'}\nVenue: ${data.venueName}, ${data.venueAddress}`,
      `${data.venueName}, ${data.venueAddress}`,
      data.eventIsoDate || data.weddingIsoDate
    );
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-4 sm:p-5 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#faf7f2',
        border: `1.5px solid #e8decb`,
        color: data.theme.textColor || '#2c2523',
      }}
    >
      {/* Top Banner */}
      <div className="pt-2 z-10 w-full flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.25em] font-cinzel text-[#852b3d] font-bold">
          {t.rsvpTitle} & SHAGUN
        </span>
        <p className="text-[11px] font-sans text-stone-600 mt-0.5">
          {t.rsvpSubtitle}
        </p>
        <div className="w-12 h-0.5 mt-1.5 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-[325px] my-auto bg-white rounded-xl p-4 sm:p-5 shadow-md border border-[#e8decb] text-left">
        {hasSubmitted ? (
          /* ============================================================== */
          /* CONFIRMATION STATE: ROYAL SHAGUN & ATTENDANCE RECEIPT           */
          /* ============================================================== */
          <div className="text-center py-2 space-y-3 animate-fade-in">
            {/* Crest Icon */}
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#dfba6a]/20 to-[#c99a3e]/30 border border-[#dfba6a] text-[#852b3d] flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-[#852b3d]" />
            </div>

            <div>
              <span className="text-[10px] font-devanagari text-[#c99a3e] font-bold uppercase tracking-widest block">
                ॥ सदा मंगलम् भवतु ॥
              </span>
              <h4 className="font-heading font-bold text-base text-[#6e1f2f]">
                {t.rsvpConfirmed}
              </h4>
            </div>

            {/* Ceremonial Envelope Receipt Card */}
            <div className="p-3 bg-[#faf7f2] rounded-xl border border-[#dfba6a]/60 text-xs space-y-2 text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#e8decb] pb-1.5">
                <span className="font-semibold text-stone-700">{t.fullName}:</span>
                <span className="font-bold text-[#6e1f2f]">{existingRecord?.guestName}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[#e8decb] pb-1.5">
                <span className="font-semibold text-stone-700">Status:</span>
                <span className={existingRecord?.status === 'attending' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                  {existingRecord?.status === 'attending' ? t.attending : t.declined}
                </span>
              </div>

              {existingRecord?.status === 'attending' && data.rsvp.allowPartySize && (
                <div className="flex items-center justify-between border-b border-[#e8decb] pb-1.5">
                  <span className="font-semibold text-stone-700">{t.guestCount}:</span>
                  <span className="font-bold text-stone-800">{existingRecord?.guestCount}</span>
                </div>
              )}

              {/* Shagun Pledge Details */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="font-semibold text-stone-700 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-[#c99a3e]" />
                  <span>शगुन / उपहार:</span>
                </span>
                <span className="font-bold text-[#6e1f2f] bg-[#dfba6a]/20 px-2 py-0.5 rounded border border-[#dfba6a]/40">
                  {activeShagun > 0 ? `₹${activeShagun.toLocaleString('en-IN')} (सस्नेह)` : 'शुभकामनाएँ (शुभाशीष)'}
                </span>
              </div>

              {note && (
                <div className="pt-1 text-[11px] text-stone-600 italic bg-white/70 p-2 rounded border border-stone-200">
                  "{note}"
                </div>
              )}
            </div>

            {/* Quick 1-Click Calendar Add Button */}
            <div className="pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCalendar}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#6e1f2f] text-white text-xs font-semibold hover:bg-[#541421] active:scale-98 transition-all shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-[#dfba6a]" />
                <span>कैलेंडर में जोड़ें (Add to Calendar)</span>
              </button>

              <button
                type="button"
                onClick={() => setHasSubmitted(false)}
                className="text-xs font-medium text-[#852b3d] hover:underline pt-0.5"
              >
                {t.updateRsvp}
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* RSVP & DIGITAL SHAGUN ENTRY FORM                               */
          /* ============================================================== */
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Attendance Status Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('attending')}
                className={`py-1.5 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'attending'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.attending}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('declined')}
                className={`py-1.5 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'declined'
                    ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.declined}</span>
              </button>
            </div>

            {/* Guest Count (if attending) */}
            {status === 'attending' && data.rsvp.allowPartySize && (
              <div className="flex items-center justify-between bg-stone-50 p-2 rounded-lg border border-stone-200">
                <span className="text-[11px] font-medium text-stone-700">
                  {t.guestCount}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-7 h-7 rounded border border-stone-300 font-bold hover:bg-stone-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-bold text-sm text-[#6e1f2f]">
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.min(data.rsvp.maxPartySize || 10, guestCount + 1))}
                    className="w-7 h-7 rounded border border-stone-300 font-bold hover:bg-stone-100 flex items-center justify-center"
                  >
                    +
                  </button>
                  <Users className="w-3.5 h-3.5 text-[#c99a3e]" />
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                {t.fullName} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Vikram & Priya Malhotra"
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-[#c99a3e] outline-none"
                />
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Contact Phone / Email */}
            <div>
              <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                {t.phoneOrEmail}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+91 98765 43210 or email"
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-[#c99a3e] outline-none"
                />
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Ceremonial Digital Shagun Selector */}
            <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-[#dfba6a]/50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6e1f2f]">
                  <Gift className="w-3.5 h-3.5 text-[#c99a3e]" />
                  <span>डिजिटल शगुन (Digital Shagun)</span>
                </div>
                <span className="text-[10px] text-stone-500 font-sans">
                  सस्नेह उपहार
                </span>
              </div>

              {/* Shagun Presets Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {SHAGUN_OPTIONS.map((opt) => (
                  <button
                    key={opt.amount}
                    type="button"
                    onClick={() => {
                      setIsCustomShagun(false);
                      setShagunAmount(opt.amount);
                    }}
                    className={`py-1 px-1.5 rounded-lg text-center border transition-all ${
                      !isCustomShagun && shagunAmount === opt.amount
                        ? 'bg-[#6e1f2f] text-[#dfba6a] border-[#6e1f2f] shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-[#f5ede0]'
                    }`}
                  >
                    <span className="block font-bold text-[11px]">{opt.label}</span>
                    <span className="block text-[8px] opacity-80 leading-none">{opt.subtitle}</span>
                  </button>
                ))}

                {/* Custom Shagun Chip */}
                <button
                  type="button"
                  onClick={() => setIsCustomShagun(true)}
                  className={`py-1 px-1.5 rounded-lg text-center border transition-all ${
                    isCustomShagun
                      ? 'bg-[#6e1f2f] text-[#dfba6a] border-[#6e1f2f] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-[#f5ede0]'
                  }`}
                >
                  <span className="block font-bold text-[11px]">अन्य राशि</span>
                  <span className="block text-[8px] opacity-80 leading-none">Custom Amount</span>
                </button>
              </div>

              {isCustomShagun && (
                <div className="mt-2 flex items-center gap-1.5 bg-white p-1 rounded-lg border border-[#c99a3e]">
                  <span className="text-xs font-bold text-stone-600 pl-1">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={customShagun}
                    onChange={(e) => setCustomShagun(e.target.value)}
                    placeholder="Enter custom shagun"
                    className="w-full text-xs outline-none font-bold text-[#6e1f2f]"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Wishes & Dietary Note */}
            <div>
              <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                {t.dietaryOrNote}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Heartiest congratulations! (Jain meal preferred)"
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-[#c99a3e] outline-none text-xs"
                />
                <MessageSquare className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={!guestName.trim() || isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#6e1f2f] text-white text-xs font-bold hover:bg-[#541421] active:scale-98 transition-all disabled:opacity-40 shadow-sm"
              >
                {isSubmitting ? (
                  <span>{t.duplicatePrevention}</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#dfba6a]" />
                    <span>{existingRecord ? t.updateRsvp : t.submitRsvp}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer Deadline */}
      <div className="pb-2 z-10 text-center">
        <span className="text-[10px] text-stone-500 font-sans">
          RSVP Deadline: {data.rsvp.deadlineFormatted || 'Prior to celebration'}
        </span>
      </div>
    </div>
  );
};
