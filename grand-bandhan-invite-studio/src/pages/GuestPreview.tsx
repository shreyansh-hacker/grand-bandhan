import React, { useState, useEffect } from 'react';
import { InvitationDraft } from '../types/invitation';
import { InvitationPlayer } from '../components/invitation/InvitationPlayer';
import { ArrowLeft, Share2, Check, UserCheck, Send, ExternalLink } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../locales';
import { weddingMusic } from '../services/sound';

interface GuestPreviewProps {
  draft: InvitationDraft;
  onBackToStudio: () => void;
  onPublishDraft?: () => void;
}

export const GuestPreview: React.FC<GuestPreviewProps> = ({
  draft,
  onBackToStudio,
  onPublishDraft,
}) => {
  const { t } = useLanguage();

  const [guestName, setGuestName] = useState<string>('Mr. & Mrs. Sharma');
  const [usePersonalizedLink, setUsePersonalizedLink] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Stop soundtrack when leaving preview
  useEffect(() => {
    return () => {
      weddingMusic.stop();
    };
  }, []);

  const handleBack = () => {
    weddingMusic.stop();
    onBackToStudio();
  };

  const guestSlug = draft.slug || 'demo-event';
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/i/${guestSlug}${
    usePersonalizedLink ? `?guest=${encodeURIComponent(guestName)}` : ''
  }`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#1c080e] flex flex-col items-center justify-between overflow-x-hidden text-white select-none">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 w-full max-w-4xl bg-black/75 backdrop-blur-md px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#dfba6a]/30 shadow-lg">
        {/* Left: Back to Studio & Live Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfba6a] text-[#420f1b] text-xs font-bold hover:bg-[#ecd599] active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.returnToGallery === 'गैलरी' ? 'एडिटर' : 'Editor'}</span>
          </button>

          <div>
            <h3 className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
              <span>{t.guestPreview}</span>
              <span className={`w-2 h-2 rounded-full ${draft.isPublished ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
            </h3>
            <span className="text-[10px] text-[#ecd599] font-sans">
              {draft.isPublished ? t.publishedLive : 'Draft Preview (Unpublished)'}
            </span>
          </div>
        </div>

        {/* Right: Language Switcher, Publish, Copy Share Link */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Studio Language Switcher */}
          <LanguageSwitcher />

          {/* Quick Publish / Update Button */}
          {onPublishDraft && (
            <button
              onClick={onPublishDraft}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-all shadow"
            >
              <Send className="w-3.5 h-3.5 text-[#ffd166]" />
              <span className="hidden sm:inline">
                {draft.isPublished ? t.publishUpdate : t.publish}
              </span>
            </button>
          )}

          {/* Copy Share Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6e1f2f] border border-[#dfba6a] text-[#dfba6a] text-xs font-semibold hover:bg-[#541421] active:scale-95 transition-all shadow"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="text-white">{t.linkCopied}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.copyLink}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Guest Personalization Toolbar */}
      <div className="w-full max-w-sm px-4 pt-3 flex items-center justify-between text-xs">
        <label className="flex items-center gap-1.5 text-white/80 cursor-pointer text-[11px]">
          <input
            type="checkbox"
            checked={usePersonalizedLink}
            onChange={(e) => setUsePersonalizedLink(e.target.checked)}
            className="accent-[#dfba6a]"
          />
          <UserCheck className="w-3.5 h-3.5 text-[#dfba6a]" />
          <span>{t.personalLink}</span>
        </label>

        {usePersonalizedLink && (
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder={t.guestNamePrompt}
            className="w-40 px-2 py-0.5 rounded bg-black/50 border border-[#dfba6a]/60 text-white text-[11px] outline-none"
          />
        )}
      </div>

      {/* Guest Personalized Greeting Banner (if personalized) */}
      {usePersonalizedLink && (
        <div className="w-full max-w-sm mt-2 px-4 py-2 bg-[#dfba6a]/20 border border-[#dfba6a]/50 rounded-xl text-center backdrop-blur-sm animate-fade-in">
          <span className="text-xs font-heading text-[#ecd599] font-semibold">
            Welcome, Dear {guestName}! You are warmly invited.
          </span>
        </div>
      )}

      {/* Main Invitation Player in Mobile Phone Frame */}
      <main className="w-full max-w-sm my-auto py-4 flex flex-col items-center">
        <InvitationPlayer
          data={draft.data}
          scenes={draft.scenes}
          mode="preview"
          slug={draft.slug}
        />
      </main>

      {/* Bottom Hint & External Link */}
      <footer className="w-full py-3 px-4 text-center text-[11px] text-white/60 font-sans border-t border-white/10 flex items-center justify-between max-w-4xl">
        <span>Grand Bandhan · Mobile-First Interactive Invitation</span>
        {draft.isPublished && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[#ecd599] hover:underline"
          >
            <span>/i/{draft.slug}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </footer>
    </div>
  );
};
