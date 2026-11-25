import React from 'react';
import { EventCategory } from '../types/invitation';
import { TEMPLATE_CATALOG, TemplateCatalogEntry } from '../templates/catalog';
import { BRAND_CONFIG } from '../config/brand';
import { ArrowLeft, Play, Edit3 } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../locales';

interface GalleryProps {
  selectedCategory: EventCategory;
  onBackToEvents: () => void;
  onViewDemo: (template: TemplateCatalogEntry) => void;
  onUseTemplate: (template: TemplateCatalogEntry) => void;
  onSelectCategoryFilter: (category: EventCategory) => void;
  onOpenDashboard?: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({
  selectedCategory,
  onBackToEvents,
  onViewDemo,
  onUseTemplate,
  onSelectCategoryFilter,
  onOpenDashboard,
}) => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = React.useState<EventCategory | 'all'>(selectedCategory || 'all');

  React.useEffect(() => {
    if (selectedCategory) {
      setActiveTab(selectedCategory);
    }
  }, [selectedCategory]);

  const categoriesList: { id: EventCategory | 'all'; label: string; count: number }[] = [
    {
      id: 'all',
      label: lang === 'hi' ? 'सभी टेम्पलेट्स' : 'All Templates',
      count: TEMPLATE_CATALOG.length,
    },
    {
      id: 'wedding',
      label: t.categories.wedding.name,
      count: TEMPLATE_CATALOG.filter((t) => t.category === 'wedding').length,
    },
    {
      id: 'birthday',
      label: t.categories.birthday.name,
      count: TEMPLATE_CATALOG.filter((t) => t.category === 'birthday').length,
    },
    {
      id: 'corporate',
      label: t.categories.corporate.name,
      count: TEMPLATE_CATALOG.filter((t) => t.category === 'corporate').length,
    },
    {
      id: 'custom',
      label: t.categories.custom.name,
      count: TEMPLATE_CATALOG.filter((t) => t.category === 'custom').length,
    },
  ];

  const templates = activeTab === 'all'
    ? TEMPLATE_CATALOG
    : TEMPLATE_CATALOG.filter((t) => t.category === activeTab);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Brand Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-5 border-b border-[#e8decb]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEvents}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e8decb] text-xs font-semibold text-[#6e1f2f] hover:bg-[#f2ede4] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.changeEvent}</span>
          </button>
          <img
            src={BRAND_CONFIG.logoUrl}
            alt="Grand Bandhan Logo"
            className="h-8 sm:h-10 w-auto object-contain hidden xs:block"
          />
        </div>

        {/* Right Actions: Dashboard & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="px-2.5 py-1 text-xs font-semibold text-[#6e1f2f] hover:bg-[#f2ede4] border border-[#e8decb] rounded-lg transition-all"
            >
              {t.dashboard}
            </button>
          )}
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full flex-1 py-6 sm:py-8">
        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 flex-wrap">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                if (cat.id !== 'all') onSelectCategoryFilter(cat.id);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === cat.id
                  ? 'bg-[#6e1f2f] text-white shadow-md'
                  : 'bg-white text-[#7d6a58] border border-[#e8decb] hover:bg-[#faf7f2]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === cat.id ? 'bg-[#dfba6a] text-[#420f1b]' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Heading */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-[0.25em] font-cinzel text-[#852b3d] font-semibold">
            {t.templateCuratedTag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#6e1f2f] mt-1 mb-2">
            {t.galleryHeading}
          </h2>
          <p className="text-xs sm:text-sm font-sans text-[#5c4f4a] leading-relaxed">
            {t.gallerySubheading}
          </p>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-center">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border-2 border-[#dfba6a]/60 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Top Visual Preview */}
              <div
                className="relative h-56 p-6 flex flex-col items-center justify-center text-center overflow-hidden"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${tmpl.defaultData.theme.coverColor || '#6e1f2f'}dd 0%, ${tmpl.defaultData.theme.coverColor || '#6e1f2f'} 65%, #050203 100%)`,
                }}
              >
                {/* Gold Frame Border */}
                <div className="absolute inset-3 border-2 border-[#dfba6a]/60 rounded-xl pointer-events-none" />

                <img
                  src={tmpl.previewThumbnail}
                  alt={tmpl.nameEn}
                  className="w-16 h-16 object-contain mb-3 drop-shadow-md"
                />

                <span className="text-[11px] uppercase tracking-[0.25em] font-cinzel text-[#dfba6a] font-bold">
                  {tmpl.category.toUpperCase()} EDITION
                </span>
                <span className="text-xs italic text-[#ecd599] font-heading mt-1">
                  {tmpl.defaultData.celebrantOrCouple}
                </span>

                {/* Badge */}
                <div className="absolute top-4 right-4 bg-[#dfba6a] text-[#420f1b] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  {lang === 'hi' ? tmpl.badgeHi : tmpl.badgeEn}
                </div>
              </div>

              {/* Card Info & Actions */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Single Clean Title */}
                  <h3 className="text-xl font-heading font-bold text-[#2c2523] mb-1">
                    {lang === 'hi' ? tmpl.nameHi : tmpl.nameEn}
                  </h3>
                  <p className="text-xs font-sans text-[#5c4f4a] leading-relaxed mb-6">
                    {lang === 'hi' ? tmpl.descriptionHi : tmpl.descriptionEn}
                  </p>
                </div>

                {/* Two Distinct Actions */}
                <div className="space-y-2.5 pt-3 border-t border-[#f2ede4]">
                  <button
                    onClick={() => onUseTemplate(tmpl)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#6e1f2f] text-[#dfba6a] text-xs font-bold shadow-md hover:bg-[#541421] active:scale-98 transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-[#dfba6a]" />
                    <span>{t.useTemplate}</span>
                  </button>

                  <button
                    onClick={() => onViewDemo(tmpl)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#faf7f2] border border-[#dfba6a] text-[#6e1f2f] text-xs font-semibold hover:bg-[#f2ede4] active:scale-98 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-[#c99a3e]" />
                    <span>{t.viewFullDemo}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-6 border-t border-[#e8decb] text-center text-xs text-[#7d6a58] font-sans">
        <p>© {new Date().getFullYear()} Grand Bandhan Invite Studio · {t.brandTagline}</p>
      </footer>
    </div>
  );
};
