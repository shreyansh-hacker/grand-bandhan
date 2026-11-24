import React, { useState, useEffect } from 'react';
import { InvitationDraft, GenericInvitationData } from '../types/invitation';
import { getPublishedInviteBySlug } from '../services/storage';
import { InvitationPlayer } from '../components/invitation/InvitationPlayer';
import { AlertCircle, ArrowLeft, ExternalLink, Calendar, MapPin, Globe } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useLanguage, LanguageSwitcher } from '../locales';

interface PublishedGuestPageProps {
  slug: string;
  onGoHome: () => void;
}

export const PublishedGuestPage: React.FC<PublishedGuestPageProps> = ({ slug, onGoHome }) => {
  const { lang, setLang, t } = useLanguage();
  const [invite, setInvite] = useState<InvitationDraft | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [guestParam, setGuestParam] = useState<string>('');

  useEffect(() => {
    // Read query parameter ?guest=...
    const urlParams = new URLSearchParams(window.location.search);
    const guest = urlParams.get('guest');
    if (guest) setGuestParam(decodeURIComponent(guest));

    // Try finding published invite in local storage or remote
    const found = getPublishedInviteBySlug(slug);
    if (found && found.isPublished) {
      setInvite(found);
      setLoading(false);
    } else {
      // Try fetching from API
      fetch(`/api/invites/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.isPublished) {
            setInvite(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c080e] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-[#dfba6a] border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-sans text-[#ecd599]">Loading Invitation...</span>
      </div>
    );
  }

  // If not found or unpublished
  if (!invite || !invite.isPublished) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between p-6 text-center select-none">
        <header className="max-w-xl mx-auto w-full flex justify-center py-4">
          <img src={BRAND_CONFIG.logoUrl} alt="Grand Bandhan" className="h-10 w-auto" />
        </header>

        <main className="max-w-md mx-auto my-auto p-8 rounded-2xl bg-white border border-[#e8decb] shadow-md space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-[#852b3d] flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-heading font-bold text-[#6e1f2f]">
            {t.notFoundTitle}
          </h2>

          <p className="text-xs font-sans text-stone-600 leading-relaxed">
            {t.notFoundMessage}
          </p>

          <div className="pt-2">
            <button
              onClick={onGoHome}
              className="px-5 py-2.5 rounded-full bg-[#6e1f2f] text-[#dfba6a] text-xs font-bold shadow hover:bg-[#541421] transition-all"
            >
              {t.returnHome}
            </button>
          </div>
        </main>

        <footer className="text-xs text-stone-500 font-sans py-4">
          Grand Bandhan · Digital Invitation Studio
        </footer>
      </div>
    );
  }

  // Use frozen published data so ongoing draft edits remain private
  const activeData: GenericInvitationData = invite.publishedData || invite.data;

  return (
    <div className="min-h-screen bg-[#1c080e] flex flex-col items-center justify-between overflow-x-hidden text-white select-none">
      {/* Top Guest Bar with Language Switcher */}
      <header className="sticky top-0 z-50 w-full max-w-4xl bg-black/75 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-[#dfba6a]/30 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-cinzel uppercase tracking-[0.2em] text-[#dfba6a] font-bold">
            GRAND BANDHAN
          </span>
          <span className="hidden sm:inline text-white/40 text-xs">·</span>
          <span className="hidden sm:inline text-[11px] text-white/80 font-heading">
            {activeData.title}
          </span>
        </div>

        {/* Visible Language Switcher for guests */}
        <LanguageSwitcher />
      </header>

      {/* Personalized Greeting (if ?guest=... in link) */}
      {guestParam && (
        <div className="w-full max-w-sm mt-3 px-4 py-2 bg-[#dfba6a]/20 border border-[#dfba6a]/50 rounded-xl text-center backdrop-blur-sm animate-fade-in">
          <span className="text-xs font-heading text-[#ecd599] font-semibold">
            {lang === 'hi'
              ? `सादर प्रणाम, प्रिय ${guestParam}! आप सपरिवार सादर आमंत्रित हैं।`
              : `Warm Welcome, Dear ${guestParam}! You are cordially invited.`}
          </span>
        </div>
      )}

      {/* Interactive Invitation Player */}
      <main className="w-full max-w-sm my-auto py-4 flex flex-col items-center">
        <InvitationPlayer
          data={activeData}
          scenes={invite.scenes}
          mode="preview"
          slug={invite.slug}
        />
      </main>

      {/* Guest Footer with date, directions shortcut and branding */}
      <footer className="w-full py-3.5 px-4 bg-black/60 backdrop-blur-xs border-t border-white/10 flex flex-wrap items-center justify-between gap-2 max-w-4xl text-[11px] text-white/70">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#dfba6a]" />
          <span>{activeData.eventDateFormatted}</span>
        </div>

        <a
          href={activeData.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[#ecd599] hover:underline"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{activeData.venueName}</span>
        </a>

        <a
          href="/invite-studio"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[#dfba6a]/90 hover:text-[#dfba6a] border border-[#dfba6a]/20 transition-all text-[10px]"
          title="Create your own luxury 3D invitation card on Grand Bandhan Invite Studio"
        >
          <span>Design your 3D card on Grand Bandhan</span>
          <span>✦</span>
        </a>
      </footer>
    </div>
  );
};
