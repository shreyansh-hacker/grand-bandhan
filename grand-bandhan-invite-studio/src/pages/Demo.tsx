import React, { useEffect } from 'react';
import { TemplateCatalogEntry } from '../templates/catalog';
import { InvitationPlayer } from '../components/invitation/InvitationPlayer';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../locales';
import { weddingMusic } from '../services/sound';

interface DemoProps {
  template: TemplateCatalogEntry;
  onBackToGallery: () => void;
  onUseTemplate: (template: TemplateCatalogEntry) => void;
}

export const Demo: React.FC<DemoProps> = ({
  template,
  onBackToGallery,
  onUseTemplate,
}) => {
  const { lang, t } = useLanguage();

  // Stop soundtrack when leaving the demo
  useEffect(() => {
    return () => {
      weddingMusic.stop();
    };
  }, []);

  const handleBack = () => {
    weddingMusic.stop();
    onBackToGallery();
  };

  const handleUse = (tmpl: TemplateCatalogEntry) => {
    weddingMusic.stop();
    onUseTemplate(tmpl);
  };

  return (
    <div className="min-h-screen bg-[#1c080e] flex flex-col items-center justify-between overflow-x-hidden text-white select-none">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 w-full max-w-4xl bg-black/75 backdrop-blur-md px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-[#dfba6a]/30 shadow-lg">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 text-xs font-semibold text-white/90 hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t.returnToGallery}</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase tracking-widest font-cinzel text-[#dfba6a] block">
            TEMPLATE DEMO
          </span>
          <h3 className="text-xs font-heading font-bold text-white">
            {lang === 'hi' ? template.nameHi : template.nameEn}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <button
            onClick={() => handleUse(template)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dfba6a] text-[#420f1b] text-xs font-bold hover:bg-[#ecd599] active:scale-95 transition-all shadow"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.useTemplate}</span>
            <span className="sm:hidden">Use</span>
          </button>
        </div>
      </header>

      {/* Main Invitation Player in Mobile Phone Frame */}
      <main className="w-full max-w-sm my-auto py-4 flex flex-col items-center">
        <InvitationPlayer
          data={template.defaultData}
          scenes={template.defaultScenes}
          mode="demo"
          slug={`demo-${template.id}`}
        />
      </main>

      {/* Bottom Action Footer */}
      <footer className="w-full py-3 bg-black/50 backdrop-blur-xs border-t border-white/10 flex items-center justify-center gap-3">
        <span className="text-xs font-sans text-white/80">
          Ready to customize this design?
        </span>
        <button
          onClick={() => handleUse(template)}
          className="px-4 py-1.5 rounded-full bg-[#dfba6a] text-[#420f1b] text-xs font-bold hover:bg-[#ecd599] active:scale-95 transition-all"
        >
          {t.useTemplate} →
        </button>
      </footer>
    </div>
  );
};
