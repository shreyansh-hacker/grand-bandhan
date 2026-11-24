import React from 'react';
import { EventCategory } from '../types/invitation';
import { BRAND_CONFIG } from '../config/brand';
import { ArrowRight, BookOpen, Gift, CreditCard, Sparkles } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../locales';

interface EventSelectionProps {
  onSelectCategory: (category: EventCategory) => void;
  onOpenDashboard?: () => void;
}

export const EventSelection: React.FC<EventSelectionProps> = ({
  onSelectCategory,
  onOpenDashboard,
}) => {
  const { lang, t } = useLanguage();

  const categories = [
    {
      id: 'wedding' as EventCategory,
      title: t.categories.wedding.name,
      badge: t.categories.wedding.badge,
      desc: t.categories.wedding.desc,
      themeColor: '#6e1f2f',
      accentColor: '#dfba6a',
      bgGradient: 'from-[#852b3d] to-[#4b121e]',
      previewType: 'book',
      artEmblem: '/assets/templates/royal-wedding-book/cover/ganesh-emblem.svg',
    },
    {
      id: 'birthday' as EventCategory,
      title: t.categories.birthday.name,
      badge: t.categories.birthday.badge,
      desc: t.categories.birthday.desc,
      themeColor: '#1d3557',
      accentColor: '#ffd166',
      bgGradient: 'from-[#1d3557] to-[#102038]',
      previewType: 'giftbox',
      artEmblem: '/assets/templates/royal-wedding-book/illustrations/sangeet.svg',
    },
    {
      id: 'corporate' as EventCategory,
      title: t.categories.corporate.name,
      badge: t.categories.corporate.badge,
      desc: t.categories.corporate.desc,
      themeColor: '#0f172a',
      accentColor: '#c99a3e',
      bgGradient: 'from-[#1e293b] to-[#0f172a]',
      previewType: 'pass',
      artEmblem: BRAND_CONFIG.logoUrl,
    },
    {
      id: 'custom' as EventCategory,
      title: t.categories.custom.name,
      badge: t.categories.custom.badge,
      desc: t.categories.custom.desc,
      themeColor: '#7f1d1d',
      accentColor: '#d4af37',
      bgGradient: 'from-[#7f1d1d] to-[#450a0a]',
      previewType: 'arch',
      artEmblem: '/assets/templates/royal-wedding-book/illustrations/pheras.svg',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Brand Header with Visible Language Switcher */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-5 border-b border-[#e8decb]">
        <div className="flex items-center gap-3">
          <img
            src={BRAND_CONFIG.logoUrl}
            alt="Grand Bandhan Logo"
            className="h-9 sm:h-11 w-auto object-contain"
          />
        </div>

        {/* Header Right Actions: Dashboard & Language Switcher (Visible on all viewports down to 360px) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="px-2.5 py-1 text-xs font-semibold text-[#6e1f2f] hover:bg-[#f2ede4] border border-[#e8decb] rounded-lg transition-all"
            >
              {t.dashboard}
            </button>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8 sm:py-12 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.3em] font-cinzel text-[#852b3d] font-semibold mb-2">
          {t.startCreating}
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#6e1f2f] mb-3 leading-tight">
          {t.chooseEventHeading}
        </h1>
        <p className="max-w-xl text-sm sm:text-base font-sans text-[#5c4f4a] leading-relaxed mb-8 sm:mb-10">
          {t.chooseEventSubheading}
        </p>

        {/* 4 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative rounded-2xl bg-white border-2 border-[#dfba6a]/70 hover:border-[#6e1f2f] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.015] overflow-hidden flex flex-col justify-between"
            >
              {/* Recognizable Mini Artwork Preview Header */}
              <div
                className={`relative h-28 bg-gradient-to-br ${cat.bgGradient} p-4 flex items-center justify-between overflow-hidden`}
              >
                {/* Gold Frame Border inside header */}
                <div className="absolute inset-2 border border-[#dfba6a]/40 rounded-xl pointer-events-none" />

                <div className="z-10 text-white pl-2">
                  <span className="text-[10px] font-cinzel uppercase tracking-[0.2em] text-[#dfba6a] font-bold block">
                    {cat.badge}
                  </span>
                  <h3 className="text-xl font-heading font-bold text-white mt-0.5">
                    {cat.title}
                  </h3>
                </div>

                {/* Tactile 3D Representative Artwork */}
                <div className="z-10 w-16 h-16 rounded-xl bg-black/20 border border-[#dfba6a]/50 p-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {cat.previewType === 'book' && (
                    <img
                      src={cat.artEmblem}
                      alt="Royal Book Emblem"
                      className="w-full h-full object-contain filter drop-shadow"
                    />
                  )}
                  {cat.previewType === 'giftbox' && (
                    <Gift className="w-9 h-9 text-[#ffd166] filter drop-shadow" />
                  )}
                  {cat.previewType === 'pass' && (
                    <CreditCard className="w-9 h-9 text-[#c99a3e] filter drop-shadow" />
                  )}
                  {cat.previewType === 'arch' && (
                    <img
                      src={cat.artEmblem}
                      alt="Auspicious Arch"
                      className="w-full h-full object-contain filter drop-shadow"
                    />
                  )}
                </div>
              </div>

              {/* Body Description & Action */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-xs font-sans text-[#6e615c] leading-relaxed mb-4">
                  {cat.desc}
                </p>

                <div className="pt-3 flex items-center justify-between border-t border-[#f2ede4]">
                  <span className="text-xs font-bold text-[#6e1f2f] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{t.exploreTemplates}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] text-[#c99a3e] font-sans font-semibold">
                    ★ 3D Experience
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-[#e8decb] text-center text-xs text-[#7d6a58] font-sans">
        <p>© {new Date().getFullYear()} Grand Bandhan Invite Studio · {t.brandTagline}</p>
      </footer>
    </div>
  );
};
