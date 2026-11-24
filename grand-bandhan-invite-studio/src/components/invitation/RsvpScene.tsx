import React, { useState, useEffect } from 'react';
import { GenericInvitationData, RsvpRecord } from '../../types/invitation';
import { Check, X, Users, User, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../locales';

interface RsvpSceneProps {
  data: GenericInvitationData;
  slug?: string;
  isDemo?: boolean;
  onRsvpSubmitted?: (record: RsvpRecord) => void;
}

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
          setNote(found.dietaryOrNote || '');
          setHasSubmitted(true);
        }
      }
    } catch {
      // ignore storage access issues
    }
  }, [slug, tokenKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const token = existingRecord?.guestToken || `gt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const record: RsvpRecord = {
      id: existingRecord?.id || `rsvp_${Date.now()}`,
      guestName: guestName.trim(),
      contact: contact.trim(),
      status,
      guestCount: status === 'attending' ? guestCount : 0,
      dietaryOrNote: note.trim(),
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

    // Try posting to real server-side API if not demo
    if (!isDemo && typeof window !== 'undefined') {
      try {
        await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, rsvp: record }),
        });
      } catch {
        // network or server error handled gracefully
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
      setExistingRecord(record);
      if (onRsvpSubmitted) onRsvpSubmitted(record);
    }, 400);
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#faf7f2',
        border: `1.5px solid #e8decb`,
        color: data.theme.textColor || '#2c2523',
      }}
    >
      {/* Top Banner */}
      <div className="pt-2 z-10 w-full flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.25em] font-cinzel text-[#852b3d] font-bold">
          {t.rsvpTitle}
        </span>
        <p className="text-[11px] font-sans text-stone-600 mt-0.5">
          {t.rsvpSubtitle}
        </p>
        <div className="w-12 h-0.5 mt-1.5 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>
      </div>

      {/* Main RSVP Card */}
      <div className="relative w-full max-w-[320px] my-auto bg-white rounded-xl p-5 shadow-md border border-[#e8decb] text-left">
        {hasSubmitted ? (
          /* Confirmation State with Update option */
          <div className="text-center py-4 space-y-3 animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h4 className="font-heading font-bold text-base text-[#6e1f2f]">
              {t.rsvpConfirmed}
            </h4>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1 text-left">
              <p><strong>{t.fullName}</strong> {existingRecord?.guestName}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={existingRecord?.status === 'attending' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                  {existingRecord?.status === 'attending' ? t.attending : t.declined}
                </span>
              </p>
              {existingRecord?.status === 'attending' && data.rsvp.allowPartySize && (
                <p><strong>{t.guestCount}</strong> {existingRecord?.guestCount}</p>
              )}
            </div>

            <p className="text-[10px] text-stone-500">
              {t.rsvpUpdateNotice}
            </p>

            <button
              onClick={() => setHasSubmitted(false)}
              className="mt-2 text-xs font-semibold text-[#6e1f2f] hover:underline"
            >
              {t.updateRsvp}
            </button>
          </div>
        ) : (
          /* RSVP Input Form */
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Status Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('attending')}
                className={`py-2 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                className={`py-2 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'declined'
                    ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.declined}</span>
              </button>
            </div>

            {/* Guest Count (if attending and enabled) */}
            {status === 'attending' && data.rsvp.allowPartySize && (
              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  {t.guestCount}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-8 h-8 rounded border border-stone-300 font-bold hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#6e1f2f]">
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.min(data.rsvp.maxPartySize || 10, guestCount + 1))}
                    className="w-8 h-8 rounded border border-stone-300 font-bold hover:bg-stone-100"
                  >
                    +
                  </button>
                  <Users className="w-4 h-4 text-[#c99a3e] ml-1" />
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
                  placeholder="e.g. Rahul Sharma"
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

            {/* Optional Wishes / Note */}
            <div>
              <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                {t.dietaryOrNote}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Heartiest congratulations!"
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-stone-300 focus:ring-1 focus:ring-[#c99a3e] outline-none"
                />
                <MessageSquare className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
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
          RSVP Deadline: {data.rsvp.deadlineFormatted || 'At your earliest convenience'}
        </span>
      </div>
    </div>
  );
};
