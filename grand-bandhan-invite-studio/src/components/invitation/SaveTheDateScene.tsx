import React, { useState, useEffect, useRef } from 'react';
import { RoyalWeddingData } from '../../types/invitation';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateIcsCalendar } from '../../services/calendar';

interface SaveTheDateSceneProps {
  data: RoyalWeddingData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof RoyalWeddingData, label: string) => void;
  selectedKey?: string;
}

export const SaveTheDateScene: React.FC<SaveTheDateSceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [dragProgress, setDragProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [calendarAdded, setCalendarAdded] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const dragStartYRef = useRef<number>(0);

  const isSelected = (key: keyof RoyalWeddingData) => selectedKey === key;

  // Live Countdown calculation
  useEffect(() => {
    const calculateTime = () => {
      const targetTime = new Date(data.eventIsoDate || data.weddingIsoDate || '2027-02-12T19:30:00').getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [data.eventIsoDate, data.weddingIsoDate]);

  // Trigger celebration burst
  const triggerReveal = () => {
    setIsRevealed(true);
    setDragProgress(1);

    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c99a3e', '#dfba6a', '#b02a42', '#ffd166', '#fdf3cd'],
      });
    } catch {
      // safe fallback if canvas not available
    }
  };

  // Drag handlers for tassel
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartYRef.current = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || isRevealed) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartYRef.current;
    if (deltaY > 0) {
      const progress = Math.min(deltaY / 120, 1);
      setDragProgress(progress);
      if (progress >= 0.85) {
        setIsDragging(false);
        triggerReveal();
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isRevealed) {
      setIsDragging(false);
      setDragProgress(0);
    }
  };

  const handleAddToCalendar = () => {
    generateIcsCalendar(
      `${data.groomName || data.celebrantOrCouple || 'Grand Bandhan'} - Invitation`,
      `${data.invitationText}\nVenue: ${data.venueName}, ${data.venueAddress}`,
      `${data.venueName}, ${data.venueAddress}`,
      data.eventIsoDate || data.weddingIsoDate || '2027-02-12T19:30:00'
    );
    setCalendarAdded(true);
    setTimeout(() => setCalendarAdded(false), 3000);
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#faf7f2',
        border: `1.5px solid #e8decb`,
      }}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Banner */}
      <div className="pt-2 z-10 w-full flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.25em] font-cinzel text-[#852b3d] font-bold">
          SAVE THE DATE
        </span>
        <h3 className="text-base font-devanagari text-[#6e1f2f] font-semibold mt-1">
          शुभ विवाह की मंगल तिथि
        </h3>
        <div className="w-12 h-0.5 mt-1.5 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>
      </div>

      {/* Royal Scroll Centerpiece */}
      <div className="relative w-full max-w-[320px] my-auto flex flex-col items-center">
        {/* Golden Hanging Rod at top */}
        <div className="w-full flex justify-center z-20">
          <img
            src="/assets/templates/royal-wedding-book/illustrations/scroll-gold-rod.svg"
            alt="Gold Rod"
            className="w-full max-w-[290px] h-8 object-contain drop-shadow"
          />
        </div>

        {/* Scroll Paper Container */}
        <div
          className={`w-[260px] transition-all duration-700 ease-out origin-top overflow-hidden rounded-b-xl border-x-2 border-b-2 border-[#dfba6a]/60 shadow-lg ${
            isRevealed ? 'max-h-[380px] py-5 opacity-100' : 'max-h-[60px] py-2 opacity-90'
          }`}
          style={{
            backgroundColor: '#fffdfa',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(223,186,106,0.08) 0%, transparent 80%)',
          }}
        >
          {!isRevealed ? (
            /* Rolled Scroll Appearance */
            <div className="flex flex-col items-center justify-center h-8">
              <span className="text-xs font-serif text-[#6e1f2f] italic tracking-wide">
                शाही आमंत्रण पत्र
              </span>
            </div>
          ) : (
            /* Fully Unrolled Content */
            <div className="flex flex-col items-center text-center px-4 animate-fade-in">
              <img
                src={data.coverEmblemUrl}
                alt="Blessing"
                className="w-10 h-10 object-contain mb-2 opacity-90"
              />

              <span className="text-xs font-cinzel uppercase tracking-widest text-[#852b3d]">
                SHUBH VIVAH
              </span>

              {/* Editable Wedding Date Line */}
              <div
                className={`my-2 p-1.5 rounded cursor-pointer transition-all ${
                  isSelected('eventDateFormatted') || isSelected('weddingDateFormatted')
                    ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15'
                    : isEditor
                    ? 'hover:bg-amber-100/50'
                    : ''
                }`}
                onClick={() => {
                  if (isEditor && onSelectElement) {
                    onSelectElement('eventDateFormatted', 'Event Date (तिथि)');
                  }
                }}
              >
                <h4 className="text-xl font-heading font-bold text-[#6e1f2f]">
                  {data.eventDateFormatted || data.weddingDateFormatted}
                </h4>
              </div>

              {/* Editable Muhurat Line */}
              <div
                className={`p-1 rounded cursor-pointer transition-all ${
                  isSelected('muhuratOrTime') || isSelected('muhuratTime')
                    ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15'
                    : isEditor
                    ? 'hover:bg-amber-100/50'
                    : ''
                }`}
                onClick={() => {
                  if (isEditor && onSelectElement) {
                    onSelectElement('muhuratOrTime', 'Time / Muhurat (समय / मुहूर्त)');
                  }
                }}
              >
                <p className="text-xs font-devanagari text-[#78350f] font-medium">
                  {data.muhuratOrTime || data.muhuratTime}
                </p>
              </div>

              {/* Live Countdown Grid */}
              <div className="mt-4 pt-3 border-t border-[#dfba6a]/30 w-full grid grid-cols-4 gap-1 text-center">
                <div className="bg-[#faf7f2] p-1.5 rounded border border-[#dfba6a]/30">
                  <span className="block text-sm font-bold text-[#6e1f2f] font-sans">
                    {timeLeft.days}
                  </span>
                  <span className="block text-[9px] text-[#7d6a58] font-sans uppercase">दिन</span>
                </div>
                <div className="bg-[#faf7f2] p-1.5 rounded border border-[#dfba6a]/30">
                  <span className="block text-sm font-bold text-[#6e1f2f] font-sans">
                    {timeLeft.hours}
                  </span>
                  <span className="block text-[9px] text-[#7d6a58] font-sans uppercase">घंटे</span>
                </div>
                <div className="bg-[#faf7f2] p-1.5 rounded border border-[#dfba6a]/30">
                  <span className="block text-sm font-bold text-[#6e1f2f] font-sans">
                    {timeLeft.minutes}
                  </span>
                  <span className="block text-[9px] text-[#7d6a58] font-sans uppercase">मिनट</span>
                </div>
                <div className="bg-[#faf7f2] p-1.5 rounded border border-[#dfba6a]/30">
                  <span className="block text-sm font-bold text-[#6e1f2f] font-sans">
                    {timeLeft.seconds}
                  </span>
                  <span className="block text-[9px] text-[#7d6a58] font-sans uppercase">सेकंड</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tassel or Button Action */}
        {!isRevealed ? (
          <div className="flex flex-col items-center mt-1 z-30">
            {/* Hanging Golden Tassel (Interactive Drag or Click) */}
            <div
              className="cursor-pointer transition-transform transform active:scale-95 hover:scale-105"
              style={{
                transform: `translateY(${dragProgress * 40}px)`,
              }}
              onMouseDown={handleTouchStart}
              onTouchStart={handleTouchStart}
              onClick={triggerReveal}
            >
              <img
                src="/assets/templates/royal-wedding-book/illustrations/tassel-gold.svg"
                alt="Gold Tassel"
                className="w-12 h-20 object-contain drop-shadow-md animate-bounce"
              />
            </div>

            <div className="mt-2 flex flex-col items-center">
              <button
                onClick={triggerReveal}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#6e1f2f] text-[#dfba6a] text-xs font-medium rounded-full shadow-md hover:bg-[#581523] active:scale-95 transition-all"
              >
                <span>डोरी खींचें या तारीख देखें</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#dfba6a]" />
              </button>
              <span className="text-[10px] text-[#7d6a58] mt-1 font-sans">
                (Pull the tassel or tap button)
              </span>
            </div>
          </div>
        ) : (
          /* Add To Calendar Button */
          <div className="mt-4 z-20 w-full flex justify-center">
            <button
              onClick={handleAddToCalendar}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shadow transition-all duration-200"
              style={{
                backgroundColor: calendarAdded ? '#10b981' : '#6e1f2f',
                color: '#fff',
              }}
            >
              {calendarAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>कैलेंडर में जुड़ गया (.ics)</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-[#dfba6a]" />
                  <span>कैलेंडर में जोड़ें (Add to Calendar)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Subtle Note */}
      <div className="pb-2 z-10">
        <p className="text-[11px] font-sans text-[#7d6a58]">
          {data.venueName} · {data.eventDateFormatted || data.weddingDateFormatted}
        </p>
      </div>
    </div>
  );
};
