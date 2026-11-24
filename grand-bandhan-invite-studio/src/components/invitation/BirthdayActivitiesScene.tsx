import React, { useState } from 'react';
import { GenericInvitationData, ActivityItem } from '../../types/invitation';
import { ChevronLeft, ChevronRight, Clock, Sparkles, Gift, Gamepad2, Cake, Award, Plus } from 'lucide-react';

interface BirthdayActivitiesSceneProps {
  data: GenericInvitationData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof GenericInvitationData, label: string) => void;
  selectedKey?: string;
  onSelectActivity?: (activity: ActivityItem) => void;
}

export const BirthdayActivitiesScene: React.FC<BirthdayActivitiesSceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
  onSelectActivity,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const touchStartXRef = React.useRef<number>(0);

  const activities = data.activities && data.activities.length > 0 ? data.activities : [];
  const safeIndex = activities.length > 0 ? Math.min(currentIndex, activities.length - 1) : 0;
  const currentAct = activities[safeIndex];

  const handlePrev = () => {
    if (activities.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activities.length - 1));
  };

  const handleNext = () => {
    if (activities.length <= 1) return;
    setCurrentIndex((prev) => (prev < activities.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (activities.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
  };

  const getActivityIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Gamepad2':
        return <Gamepad2 className="w-8 h-8 text-[#ffd166]" />;
      case 'Cake':
        return <Cake className="w-8 h-8 text-[#ef476f]" />;
      case 'Gift':
        return <Gift className="w-8 h-8 text-[#06d6a0]" />;
      case 'Award':
      default:
        return <Award className="w-8 h-8 text-[#118ab2]" />;
    }
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#fdfbf7',
        border: `1.5px solid #e8decb`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Heading */}
      <div className="pt-2 z-10 w-full flex flex-col items-center">
        <span
          className="text-xs uppercase tracking-[0.25em] font-cinzel font-bold"
          style={{ color: data.theme.coverAccentColor || '#ffd166' }}
        >
          PARTY &amp; ACTIVITIES
        </span>
        <h3 className="text-lg font-heading text-[#1d3557] font-bold mt-0.5">
          {data.invitationLanguage === 'hi' ? 'पार्टी खेल व उत्सव' : "Fun Adventures & Celebrations"}
        </h3>
        {activities.length > 1 && (
          <p className="text-[11px] font-sans text-stone-500 mt-0.5">
            Swipe or use arrows (Activity {safeIndex + 1} of {activities.length})
          </p>
        )}
        <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-transparent via-[#ffd166] to-transparent"></div>
      </div>

      {/* Main Activity Centerpiece */}
      {activities.length === 0 ? (
        <div className="my-auto p-6 rounded-xl border-2 border-dashed border-stone-300 bg-white/70 max-w-[280px]">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-stone-700">No Activities Added</h4>
          <p className="text-xs text-stone-500 mt-1">
            {isEditor ? 'Use the properties panel to add games and events.' : 'Party details will be announced soon.'}
          </p>
          {isEditor && onSelectElement && (
            <button
              onClick={() => onSelectElement('activities', 'Party Activities (पार्टी गतिविधियाँ)')}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#1d3557] text-[#ffd166] text-xs font-bold inline-flex items-center gap-1 shadow hover:bg-[#152740]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity</span>
            </button>
          )}
        </div>
      ) : currentAct ? (
        <div
          className={`relative w-full max-w-[310px] my-auto bg-white rounded-xl p-5 shadow-md border transition-all duration-300 cursor-pointer ${
            selectedKey === 'activities'
              ? 'ring-2 ring-[#ffd166] border-[#ffd166]'
              : 'border-[#e8decb] hover:shadow-lg'
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('activities', `Activity: ${currentAct.title}`);
              if (onSelectActivity) onSelectActivity(currentAct);
            }
          }}
        >
          {/* Top color highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-2 rounded-t-xl bg-gradient-to-r from-[#1d3557] via-[#ffd166] to-[#ef476f]"
          />

          {/* Activity Icon */}
          <div className="w-16 h-16 rounded-full bg-[#faf7f2] border-2 border-[#ffd166]/60 mx-auto mt-2 mb-3 flex items-center justify-center shadow-xs">
            {getActivityIcon(currentAct.icon)}
          </div>

          {/* Time Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1d3557] text-white text-[11px] font-sans font-semibold mb-2">
            <Clock className="w-3 h-3 text-[#ffd166]" />
            <span>{currentAct.time}</span>
          </div>

          {/* Activity Title */}
          <h4 className="text-base font-bold text-[#1d3557] font-heading leading-snug">
            {currentAct.title}
          </h4>

          {/* Activity Description */}
          <p className="text-xs text-stone-600 font-sans leading-relaxed mt-2">
            {currentAct.description}
          </p>

          {/* Carousel Arrows (only if multiple items) */}
          {activities.length > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="p-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 transition-all"
                aria-label="Previous activity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1.5">
                {activities.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === safeIndex ? 'w-5 bg-[#1d3557]' : 'w-2 bg-stone-300'
                    }`}
                    aria-label={`Go to activity ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="p-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 transition-all"
                aria-label="Next activity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Bottom Hint */}
      <div className="pb-2 z-10">
        <span className="text-[11px] font-sans text-stone-500">
          Ages &amp; all family members welcome!
        </span>
      </div>
    </div>
  );
};
