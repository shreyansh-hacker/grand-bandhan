import React, { useState } from 'react';
import { GenericInvitationData, ActivityItem } from '../../types/invitation';
import { ChevronLeft, ChevronRight, Clock, Flame, Home, Utensils, Sparkles, Plus } from 'lucide-react';

interface CustomProgramSceneProps {
  data: GenericInvitationData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof GenericInvitationData, label: string) => void;
  selectedKey?: string;
  onSelectActivity?: (activity: ActivityItem) => void;
}

export const CustomProgramScene: React.FC<CustomProgramSceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
  onSelectActivity,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const touchStartXRef = React.useRef<number>(0);

  const rituals = data.activities && data.activities.length > 0 ? data.activities : [];
  const safeIndex = rituals.length > 0 ? Math.min(currentIndex, rituals.length - 1) : 0;
  const currentRitual = rituals[safeIndex];

  const handlePrev = () => {
    if (rituals.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : rituals.length - 1));
  };

  const handleNext = () => {
    if (rituals.length <= 1) return;
    setCurrentIndex((prev) => (prev < rituals.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (rituals.length <= 1) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 40) handleNext();
    else if (diff < -40) handlePrev();
  };

  const getRitualIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-8 h-8 text-amber-600" />;
      case 'Home':
        return <Home className="w-8 h-8 text-[#7f1d1d]" />;
      case 'Utensils':
        return <Utensils className="w-8 h-8 text-[#d4af37]" />;
      default:
        return <Sparkles className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#faf6f0',
        border: `1.5px solid #e8decb`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Banner */}
      <div className="pt-2 z-10 w-full flex flex-col items-center">
        <span
          className="text-xs uppercase tracking-[0.25em] font-cinzel font-bold text-[#7f1d1d]"
        >
          PROGRAM &amp; RITUALS
        </span>
        <h3 className="text-lg font-devanagari text-[#7f1d1d] font-bold mt-0.5">
          कार्यक्रम व पावन अनुष्ठान
        </h3>
        {rituals.length > 1 && (
          <p className="text-[11px] font-sans text-stone-500 mt-0.5">
            स्वाइप करें या तीरों से आगे बढ़ें (विधि {safeIndex + 1} / {rituals.length})
          </p>
        )}
        <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
      </div>

      {/* Main Centerpiece */}
      {rituals.length === 0 ? (
        <div className="my-auto p-6 rounded-xl border-2 border-dashed border-[#e8decb] bg-white/70 max-w-[280px]">
          <Sparkles className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-stone-700">कोई कार्यक्रम नहीं जुड़ा</h4>
          <p className="text-xs text-stone-500 mt-1">
            {isEditor ? 'एडिटर में नया कार्यक्रम व अनुष्ठान जोड़ें।' : 'कार्यक्रम का विवरण शीघ्र साझा किया जाएगा।'}
          </p>
          {isEditor && onSelectElement && (
            <button
              onClick={() => onSelectElement('activities', 'Program & Rituals (कार्यक्रम व अनुष्ठान)')}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#7f1d1d] text-[#d4af37] text-xs font-bold inline-flex items-center gap-1 shadow hover:bg-[#5f1414]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Program Item</span>
            </button>
          )}
        </div>
      ) : currentRitual ? (
        <div
          className={`relative w-full max-w-[310px] my-auto bg-white rounded-xl p-5 shadow-md border transition-all duration-300 cursor-pointer ${
            selectedKey === 'activities'
              ? 'ring-2 ring-[#d4af37] border-[#d4af37]'
              : 'border-[#e8decb] hover:shadow-lg'
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('activities', `कार्यक्रम: ${currentRitual.title}`);
              if (onSelectActivity) onSelectActivity(currentRitual);
            }
          }}
        >
          {/* Top Marigold Garland Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7f1d1d] via-[#d4af37] to-[#f59e0b] rounded-t-xl" />

          {/* Sacred Icon Circle */}
          <div className="w-16 h-16 rounded-full bg-[#fdfaf3] border-2 border-[#d4af37] mx-auto mt-2 mb-3 flex items-center justify-center shadow-inner">
            {getRitualIcon(currentRitual.icon)}
          </div>

          {/* Time Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7f1d1d] text-[#faf6f0] text-[11px] font-sans font-semibold mb-2">
            <Clock className="w-3 h-3 text-[#d4af37]" />
            <span>{currentRitual.time}</span>
          </div>

          {/* Ritual Title */}
          <h4 className="text-base font-bold text-[#7f1d1d] font-devanagari leading-snug">
            {currentRitual.title}
          </h4>

          {/* Ritual Description */}
          <p className="text-xs text-stone-600 font-devanagari leading-relaxed mt-2">
            {currentRitual.description}
          </p>

          {/* Carousel Arrows (only if multiple items) */}
          {rituals.length > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="p-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 transition-all"
                aria-label="पिछला कार्यक्रम"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1.5">
                {rituals.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === safeIndex ? 'w-5 bg-[#7f1d1d]' : 'w-2 bg-stone-300'
                    }`}
                    aria-label={`कार्यक्रम ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="p-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 transition-all"
                aria-label="अगला कार्यक्रम"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Bottom Hint */}
      <div className="pb-2 z-10">
        <span className="text-[11px] font-devanagari text-stone-600">
          सपरिवार सादर आमंत्रित हैं
        </span>
      </div>
    </div>
  );
};
