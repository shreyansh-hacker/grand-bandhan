import React, { useState } from 'react';
import { RoyalWeddingData, CeremonyFunction } from '../../types/invitation';
import { ChevronLeft, ChevronRight, Clock, MapPin, Sparkles, Plus } from 'lucide-react';

interface FestivitiesSceneProps {
  data: RoyalWeddingData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof RoyalWeddingData, label: string) => void;
  selectedKey?: string;
  onSelectFunction?: (fn: CeremonyFunction) => void;
}

export const FestivitiesScene: React.FC<FestivitiesSceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
  onSelectFunction,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const touchStartXRef = React.useRef<number>(0);

  const functions = data.functions && data.functions.length > 0 ? data.functions : [];
  const safeIndex = functions.length > 0 ? Math.min(currentIndex, functions.length - 1) : 0;
  const currentFn = functions[safeIndex];

  const handlePrev = () => {
    if (functions.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : functions.length - 1));
  };

  const handleNext = () => {
    if (functions.length <= 1) return;
    setCurrentIndex((prev) => (prev < functions.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (functions.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#faf7f2',
        border: `1.5px solid #e8decb`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Heading */}
      <div className="pt-2 z-10 w-full flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.25em] font-cinzel text-[#852b3d] font-bold">
          WEDDING FESTIVITIES
        </span>
        <h3 className="text-lg font-devanagari text-[#6e1f2f] font-bold mt-0.5">
          {data.invitationLanguage === 'en' ? 'Ceremonies & Functions' : 'मांगलिक कार्यक्रम व रस्में'}
        </h3>
        {functions.length > 1 && (
          <p className="text-[11px] font-sans text-[#7d6a58] mt-0.5">
            स्वाइप करें या तीरों से आगे बढ़ें (कार्ड {safeIndex + 1} / {functions.length})
          </p>
        )}
        <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>
      </div>

      {/* Function Card Centerpiece */}
      {functions.length === 0 ? (
        <div className="my-auto p-6 rounded-xl border-2 border-dashed border-[#e8decb] bg-white/70 max-w-[280px]">
          <Sparkles className="w-8 h-8 text-[#c99a3e] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-stone-700">कोई रस्म नहीं जुड़ी है</h4>
          <p className="text-xs text-stone-500 mt-1">
            {isEditor ? 'प्रॉपर्टीज़ पैनल से नई रस्म जोड़ें।' : 'मांगलिक कार्यक्रमों का विवरण शीघ्र घोषित किया जाएगा।'}
          </p>
          {isEditor && onSelectElement && (
            <button
              onClick={() => onSelectElement('functions', 'मांगलिक रस्में (Wedding Ceremonies)')}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#6e1f2f] text-[#dfba6a] text-xs font-bold inline-flex items-center gap-1 shadow hover:bg-[#541421]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Ceremony</span>
            </button>
          )}
        </div>
      ) : currentFn ? (
        <div
          className={`relative w-full max-w-[310px] my-auto bg-white rounded-xl p-5 shadow-md border transition-all duration-300 ${
            selectedKey === 'functions'
              ? 'ring-2 ring-[#c99a3e] border-[#c99a3e]'
              : 'border-[#e8decb] hover:shadow-lg'
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('functions', `रस्म: ${currentFn.name} (${currentFn.hindiName})`);
              if (onSelectFunction) onSelectFunction(currentFn);
            }
          }}
        >
          {/* Ceremony Color Strip at top */}
          <div
            className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
            style={{ backgroundColor: currentFn.colorHex || '#c99a3e' }}
          />

          {/* Ceremony Illustration Icon */}
          <div className="w-20 h-20 mx-auto mt-2 mb-3 flex items-center justify-center">
            <img
              src={currentFn.illustration}
              alt={currentFn.name}
              className="w-full h-full object-contain filter drop-shadow-sm transition-transform hover:scale-105"
            />
          </div>

          {/* Ceremony Title (Hindi & English) */}
          <div className="mb-2">
            <h4 className="text-xl font-devanagari font-bold text-[#6e1f2f]">
              {currentFn.hindiName || currentFn.name}
            </h4>
            <span className="text-xs font-cinzel uppercase tracking-widest text-[#852b3d] font-semibold">
              {currentFn.name}
            </span>
          </div>

          {/* Date & Time details */}
          <div className="space-y-1.5 py-2 my-2 border-y border-[#e8decb]/60 text-left px-2">
            <div className="flex items-center gap-2 text-xs text-[#2c2523] font-sans">
              <Sparkles className="w-4 h-4 text-[#c99a3e] shrink-0" />
              <span className="font-medium">{currentFn.dayDate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#2c2523] font-sans">
              <Clock className="w-4 h-4 text-[#c99a3e] shrink-0" />
              <span>{currentFn.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#2c2523] font-sans">
              <MapPin className="w-4 h-4 text-[#c99a3e] shrink-0" />
              <span className="truncate">{currentFn.venue}</span>
            </div>
          </div>

          {/* Dress Code Swatch Pill */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-full border border-white shadow-sm shrink-0"
              style={{ backgroundColor: currentFn.colorHex || '#dfba6a' }}
            />
            <span className="text-[11px] font-sans font-medium text-[#5c4f4a]">
              पहनावा: {currentFn.dressCode}
            </span>
          </div>

          {isEditor && (
            <div className="mt-3 pt-2 border-t border-dashed border-[#c99a3e]/40">
              <span className="text-[10px] text-[#c99a3e] font-sans font-semibold">
                (एडिट करने के लिए कार्ड पर टैप करें)
              </span>
            </div>
          )}

          {/* Carousel Arrows (only if multiple items) */}
          {functions.length > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e8decb]/60">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="w-7 h-7 rounded-full bg-[#6e1f2f] text-white flex items-center justify-center hover:bg-[#541421] active:scale-95 transition-all shadow"
                aria-label="पिछली रस्म"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {functions.map((fn, idx) => (
                  <button
                    key={fn.id || idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      idx === safeIndex
                        ? 'w-5 h-2 bg-[#6e1f2f]'
                        : 'w-2 h-2 bg-[#d1c5b4] hover:bg-[#a89984]'
                    }`}
                    aria-label={`रस्म ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="w-7 h-7 rounded-full bg-[#6e1f2f] text-white flex items-center justify-center hover:bg-[#541421] active:scale-95 transition-all shadow"
                aria-label="अगली रस्म"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Bottom Hint */}
      <div className="pb-2 z-10">
        <span className="text-[11px] font-sans text-[#7d6a58]">
          कृपया सभी कार्यक्रमों में समय पर पधारकर अनुग्रहीत करें।
        </span>
      </div>
    </div>
  );
};
