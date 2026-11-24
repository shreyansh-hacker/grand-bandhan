import React, { createContext, useContext, useState, useEffect } from 'react';
import { EN_LOCALE } from './en';
import { HI_LOCALE } from './hi';

export type StudioLanguage = 'en' | 'hi';

interface LanguageContextType {
  lang: StudioLanguage;
  setLang: (lang: StudioLanguage) => void;
  t: typeof EN_LOCALE;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: EN_LOCALE,
});

const STORAGE_KEY = 'grand_bandhan_studio_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<StudioLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as StudioLanguage;
      if (saved === 'en' || saved === 'hi') return saved;
    }
    return 'en'; // Default to English as required
  });

  const setLang = (newLang: StudioLanguage) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = lang === 'hi' ? HI_LOCALE : EN_LOCALE;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full bg-[#f2ede4] p-0.5 border border-[#dfba6a]/60 shadow-xs select-none ${className}`}
      role="group"
      aria-label="Language Switcher"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 text-[11px] font-sans font-semibold rounded-full transition-all duration-200 ${
          lang === 'en'
            ? 'bg-[#6e1f2f] text-white shadow-xs'
            : 'text-[#6e1f2f] hover:text-[#420f1b]'
        }`}
        aria-pressed={lang === 'en'}
      >
        English
      </button>
      <span className="text-[#c99a3e] text-xs px-0.5 font-sans">|</span>
      <button
        type="button"
        onClick={() => setLang('hi')}
        className={`px-2.5 py-1 text-[11px] font-devanagari font-bold rounded-full transition-all duration-200 ${
          lang === 'hi'
            ? 'bg-[#6e1f2f] text-white shadow-xs'
            : 'text-[#6e1f2f] hover:text-[#420f1b]'
        }`}
        aria-pressed={lang === 'hi'}
      >
        हिन्दी
      </button>
    </div>
  );
};
