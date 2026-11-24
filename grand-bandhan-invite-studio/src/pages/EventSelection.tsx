import React from 'react';
import { EventCategory } from '../types/invitation';
import { BRAND_CONFIG } from '../config/brand';
import { Sparkles, Gift, Briefcase, HeartHandshake, ArrowRight } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../locales';

interface EventSelectionProps {
  onSelectCategory: (category: EventCategory) => void;
  onOpenDashboard?: () => void;
}

export const EventSelection: React.FC<EventSelectionProps> = ({
  onSelectCategory,
  onOpenDashboard,
}) => {
  const { t } = useLanguage();

  const categories = [
    {
      id: 'wedding' as EventCategory,
      title: t.categories.wedding.name,
      badge: t.categories.wedding.badge,
      desc: t.categories.wedding.desc,
      icon: Sparkles,
      iconBg: 'bg-rose-100 text-[#6e1f2f]',
      borderColor: 'border-[#dfba6a]',
      available: true,
      tag: t.categories.wedding.tag,
      tagColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'birthday' as EventCategory,
      title: t.categories.birthday.name,
      badge: t.categories.birthday.badge,
      desc: t.categories.birthday.desc,
      icon: Gift,
      iconBg: 'bg-amber-100 text-amber-700',
      borderColor: 'border-amber-300',
      available: true,
      tag: t.categories.birthday.tag,
      tagColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'corporate' as EventCategory,
      title: t.categories.corporate.name,
      badge: t.categories.corporate.badge,
      desc: t.categories.corporate.desc,
      icon: Briefcase,
      iconBg: 'bg-blue-100 text-blue-800',
      borderColor: 'border-blue-300',
      available: true,
      tag: t.categories.corporate.tag,
      tagColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'custom' as EventCategory,
      title: t.categories.custom.name,
      badge: t.categories.custom.badge,
      desc: t.categories.custom.desc,
      icon: HeartHandshake,
      iconBg: 'bg-emerald-100 text-emerald-800',
      borderColor: 'border-emerald-300',
      available: true,
      tag: t.categories.custom.tag,
      tagColor: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between p-4 sm:p-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full text-left">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="relative p-6 rounded-2xl bg-white border-2 border-[#dfba6a]/70 hover:border-[#6e1f2f] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01]"
              >
                {/* Top Badge & Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${cat.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-medium ${cat.tagColor}`}
                  >
                    {cat.tag}
                  </span>
                </div>

                {/* Title & Badge */}
                <h3 className="text-xl font-heading font-bold text-[#2c2523] mb-1">
                  {cat.title}
                </h3>
                <span className="text-xs font-cinzel uppercase tracking-wider text-[#852b3d] font-semibold block mb-2">
                  {cat.badge}
                </span>

                <p className="text-xs font-sans text-[#6e615c] leading-relaxed mb-4">
                  {cat.desc}
                </p>

                {/* Bottom Action */}
                <div className="pt-2 flex items-center justify-between border-t border-[#f2ede4]">
                  <span className="text-xs font-semibold text-[#6e1f2f] flex items-center gap-1">
                    <span>{t.exploreTemplates}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] text-[#c99a3e] font-sans font-medium">
                    ★ 3D Experience
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-[#e8decb] text-center text-xs text-[#7d6a58] font-sans">
        <p>© 2027 Grand Bandhan Invite Studio · {t.brandTagline}</p>
      </footer>
    </div>
  );
};
