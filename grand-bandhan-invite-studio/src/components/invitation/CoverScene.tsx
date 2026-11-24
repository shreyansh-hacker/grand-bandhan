import React from 'react';
import { RoyalWeddingData } from '../../types/invitation';
import { BookOpen } from 'lucide-react';

interface CoverSceneProps {
  data: RoyalWeddingData;
  isOpen: boolean;
  onOpen: () => void;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof RoyalWeddingData, label: string) => void;
  selectedKey?: string;
}

export const CoverScene: React.FC<CoverSceneProps> = ({
  data,
  isOpen,
  onOpen,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const isSelected = (key: keyof RoyalWeddingData) => selectedKey === key;

  return (
    <div className="relative w-full min-h-[580px] max-w-sm mx-auto flex items-center justify-center p-4 select-none perspective-[1400px]">
      {/* 3D Book Container */}
      <div
        className={`relative w-full max-w-[340px] h-[520px] rounded-r-2xl rounded-l-md transition-all duration-1000 ease-out transform-gpu cursor-pointer ${
          isOpen ? 'shadow-2xl -translate-y-2' : 'shadow-book hover:scale-[1.01]'
        }`}
        style={{
          perspectiveOrigin: 'left center',
          transformStyle: 'preserve-3d',
        }}
        onClick={() => {
          if (!isOpen && !isEditor) onOpen();
        }}
      >
        {/* Book Spine (Left Edging) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-8 z-30 rounded-l-md pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(30,5,10,0.85) 0%, rgba(70,15,25,0.4) 40%, rgba(212,175,55,0.25) 70%, rgba(30,5,10,0.6) 100%)',
            boxShadow: 'inset 2px 0 6px rgba(0,0,0,0.5)',
          }}
        >
          {/* Spine Golden Embossing Lines */}
          <div className="h-full flex flex-col justify-between py-6 items-center">
            <div className="w-4 h-0.5 bg-[#dfba6a] opacity-60"></div>
            <div className="w-4 h-0.5 bg-[#dfba6a] opacity-60"></div>
            <div className="w-4 h-0.5 bg-[#dfba6a] opacity-60"></div>
          </div>
        </div>

        {/* Realistic Book Pages Rim (Right side paper depth) */}
        <div
          className="absolute -right-2 top-3 bottom-3 w-3 rounded-r-sm z-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(90deg, #f7f3eb 0px, #e8dfcf 1px, #fdfbf7 2px, #d8cbba 3px)',
            boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
          }}
        />

        {/* Front Cover Face */}
        <div
          className={`relative w-full h-full rounded-r-2xl rounded-l-md p-6 flex flex-col items-center justify-between transition-transform duration-1000 origin-left transform-gpu z-20 ${
            isOpen ? '-rotate-y-140 opacity-0 pointer-events-none' : 'rotate-y-0 opacity-100'
          }`}
          style={{
            backgroundColor: data.theme.coverColor || '#6e1f2f',
            backgroundImage: `
              radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 60%),
              radial-gradient(circle at 50% 100%, rgba(0, 0, 0, 0.4) 0%, transparent 70%)
            `,
            border: `2px solid ${data.theme.coverAccentColor || '#dfba6a'}`,
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Inner Golden Foil Border */}
          <div
            className="absolute inset-3 rounded-r-xl rounded-l-xs pointer-events-none"
            style={{
              border: `1.5px solid ${data.theme.coverAccentColor || '#dfba6a'}`,
              boxShadow: 'inset 0 0 10px rgba(223, 186, 106, 0.25)',
            }}
          >
            {/* Corner Ornamental Dots */}
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[#dfba6a]"></div>
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#dfba6a]"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-[#dfba6a]"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#dfba6a]"></div>
          </div>

          {/* Top Flourish */}
          <div className="pt-5 flex flex-col items-center">
            <span
              className="text-xs uppercase tracking-[0.3em] font-cinzel font-semibold opacity-90 transition-all"
              style={{ color: data.theme.coverAccentColor || '#dfba6a' }}
            >
              GRAND BANDHAN
            </span>
            <div className="w-16 h-0.5 mt-1 bg-gradient-to-r from-transparent via-[#dfba6a] to-transparent"></div>
          </div>

          {/* Center: Medallion Emblem & Title */}
          <div className="flex flex-col items-center my-auto text-center w-full px-2">
            {data.showEmblem && (
              <div
                className={`mb-4 relative transition-all ${
                  isEditor ? 'hover:scale-105' : ''
                } ${isSelected('coverEmblemUrl') ? 'ring-2 ring-[#dfba6a] ring-offset-2 ring-offset-[#6e1f2f] rounded-full' : ''}`}
                onClick={(e) => {
                  if (isEditor && onSelectElement) {
                    e.stopPropagation();
                    onSelectElement('coverEmblemUrl', 'कवर प्रतीक (Ganesh Emblem)');
                  }
                }}
              >
                <img
                  src={data.coverEmblemUrl}
                  alt="Ganesh Medallion"
                  className="w-24 h-24 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] object-contain"
                />
              </div>
            )}

            {/* Cover Title */}
            <div
              className={`p-1.5 rounded transition-all cursor-pointer ${
                isSelected('coverTitle') ? 'ring-2 ring-[#dfba6a] bg-black/20' : 'hover:bg-white/5'
              }`}
              onClick={(e) => {
                if (isEditor && onSelectElement) {
                  e.stopPropagation();
                  onSelectElement('coverTitle', 'कवर शीर्षक (Cover Title)');
                }
              }}
            >
              <h1
                className="text-3xl font-devanagari font-bold tracking-wide drop-shadow-md"
                style={{ color: data.theme.coverAccentColor || '#dfba6a' }}
              >
                {data.coverTitle}
              </h1>
            </div>

            {/* Couple Initials or Subtitle */}
            <div
              className={`mt-2 p-1.5 rounded transition-all cursor-pointer ${
                isSelected('coverSubtitle') ? 'ring-2 ring-[#dfba6a] bg-black/20' : 'hover:bg-white/5'
              }`}
              onClick={(e) => {
                if (isEditor && onSelectElement) {
                  e.stopPropagation();
                  onSelectElement('coverSubtitle', 'कवर उपशीर्षक (Cover Subtitle)');
                }
              }}
            >
              <p className="text-xs uppercase tracking-[0.25em] font-cinzel text-[#fce8c0]/90">
                {data.coverSubtitle}
              </p>
            </div>

            {/* Couple names banner on cover */}
            <div className="mt-4 py-1 px-4 border-y border-[#dfba6a]/40 bg-black/15 rounded">
              <span className="font-heading italic text-lg text-white/95">
                {data.groomName} &amp; {data.brideName}
              </span>
            </div>
          </div>

          {/* Bottom Action: किताब खोलें */}
          <div className="pb-4 w-full flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-semibold tracking-wider transition-all duration-300 transform active:scale-95 shadow-lg animate-pulse-subtle"
              style={{
                backgroundColor: data.theme.coverAccentColor || '#dfba6a',
                color: '#420f1b',
              }}
            >
              <BookOpen className="w-4 h-4 text-[#420f1b]" />
              <span>{data.coverButtonText}</span>
            </button>
            <span className="text-[10px] text-[#fce8c0]/70 mt-1.5 font-sans">
              (टैप करें या क्लिक करें)
            </span>
          </div>
        </div>

        {/* Revealed Inside Page (when book opens) */}
        {isOpen && (
          <div
            className="absolute inset-0 rounded-r-2xl rounded-l-md p-6 flex flex-col items-center justify-center text-center z-10 transition-opacity duration-700"
            style={{
              backgroundColor: data.theme.paperColor || '#faf7f2',
              color: data.theme.textColor || '#2c2523',
            }}
          >
            <span className="text-xs font-serif text-[#6e1f2f] uppercase tracking-widest">
              शुभ शुरुआत
            </span>
            <p className="font-heading text-lg text-[#6e1f2f] mt-2 font-bold">
              {data.openingBlessing}
            </p>
            <p className="text-xs text-[#7d6a58] mt-4 font-sans">
              नीचे स्क्रॉल करें या अगले दृश्य पर जाएँ ↓
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
