import React, { useState } from 'react';
import { GenericInvitationData } from '../../types/invitation';
import { Gift, Sparkles, Cake } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BirthdayBoxSceneProps {
  data: GenericInvitationData;
  isOpen: boolean;
  onOpen: () => void;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof GenericInvitationData, label: string) => void;
  selectedKey?: string;
}

export const BirthdayBoxScene: React.FC<BirthdayBoxSceneProps> = ({
  data,
  isOpen,
  onOpen,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const openState = isEditor ? isOpen : internalOpen;

  const handleOpen = () => {
    setInternalOpen(true);
    onOpen();
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#ffffff'],
      });
    } catch {
      // safe fallback
    }
  };

  const isSelected = (key: keyof GenericInvitationData) => selectedKey === key;

  return (
    <div className="relative w-full min-h-[580px] max-w-sm mx-auto flex items-center justify-center p-4 select-none perspective-[1200px]">
      <div
        className="relative w-full max-w-[340px] h-[520px] rounded-2xl flex flex-col items-center justify-between p-6 transition-all duration-700 shadow-2xl overflow-hidden"
        style={{
          backgroundColor: data.theme.coverColor || '#1d3557',
          border: `2px solid ${data.theme.coverAccentColor || '#ffd166'}`,
          color: '#ffffff',
        }}
      >
        {/* Decorative Space Stars / Confetti Dots */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-6 left-6 w-2 h-2 rounded-full bg-yellow-300 animate-ping"></div>
          <div className="absolute top-16 right-10 w-2 h-2 rounded-full bg-cyan-300"></div>
          <div className="absolute bottom-16 left-12 w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="absolute bottom-10 right-8 w-3 h-3 rounded-full bg-amber-300 animate-pulse"></div>
        </div>

        {/* Top Header Tag */}
        <div className="pt-2 z-10 text-center">
          <span
            className="text-xs uppercase tracking-[0.25em] font-sans font-bold block"
            style={{ color: data.theme.coverAccentColor || '#ffd166' }}
          >
            {data.subtitle || 'BIRTHDAY CELEBRATION'}
          </span>
          <div className="w-16 h-0.5 mt-1 mx-auto bg-gradient-to-r from-transparent via-[#ffd166] to-transparent"></div>
        </div>

        {/* 3D Gift Box Animation Area */}
        <div className="my-auto w-full flex flex-col items-center z-10 relative">
          {/* Gift Box Lid (Interactive) */}
          <div
            className={`w-48 h-12 rounded-t-xl transition-all duration-700 transform-gpu cursor-pointer relative z-20 flex items-center justify-center shadow-lg ${
              openState
                ? '-translate-y-16 rotate-[-12deg] opacity-75'
                : 'translate-y-0 rotate-0 hover:scale-102'
            }`}
            style={{
              backgroundColor: data.theme.coverAccentColor || '#ffd166',
              border: '2px solid rgba(255,255,255,0.4)',
            }}
            onClick={() => {
              if (!openState) handleOpen();
            }}
          >
            {/* Ribbon Bow on Lid */}
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-[#e63946] border-2 border-white shadow-md flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] font-sans font-bold text-[#1d3557] tracking-wider uppercase">
              {openState ? 'BOX OPENED' : 'SURPRISE GIFT'}
            </span>
          </div>

          {/* Gift Box Body */}
          <div
            className={`w-44 h-36 rounded-b-xl border-2 border-white/30 relative flex flex-col items-center justify-center p-3 transition-all duration-700 shadow-xl ${
              openState ? 'bg-white/15 backdrop-blur-xs' : 'bg-white/10'
            }`}
            style={{
              borderTop: 'none',
            }}
            onClick={() => {
              if (!openState) handleOpen();
            }}
          >
            {/* Vertical Ribbon Stripe */}
            <div
              className="absolute inset-y-0 w-8 z-0"
              style={{ backgroundColor: data.theme.coverAccentColor || '#ffd166', opacity: 0.8 }}
            />

            {!openState ? (
              <div className="z-10 text-center animate-bounce mt-2">
                <span className="text-xs font-bold font-sans text-white drop-shadow">
                  {data.coverButtonText || 'Open Gift Box 🎁'}
                </span>
                <span className="block text-[9px] text-white/80 mt-0.5">
                  (Tap to open)
                </span>
              </div>
            ) : (
              /* Revealed Content from Inside the Box */
              <div className="z-10 text-center animate-fade-in space-y-1">
                <Cake className="w-8 h-8 mx-auto text-[#ffd166] drop-shadow-md animate-pulse" />
                <span className="text-[11px] font-sans font-semibold text-white/90 block">
                  {data.openingBlessing}
                </span>
              </div>
            )}
          </div>

          {/* Celebrant Name & Age (Always Editable) */}
          <div className="mt-5 text-center w-full px-2">
            <div
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                isSelected('celebrantOrCouple')
                  ? 'ring-2 ring-[#ffd166] bg-black/30'
                  : isEditor
                  ? 'hover:bg-white/10'
                  : ''
              }`}
              onClick={() => {
                if (isEditor && onSelectElement) {
                  onSelectElement('celebrantOrCouple', "Celebrant's Name (जन्मदिन नाम)");
                }
              }}
            >
              <h2
                className="text-2xl font-bold font-heading tracking-wide"
                style={{ color: data.theme.coverAccentColor || '#ffd166' }}
              >
                {data.celebrantOrCouple || 'Aarav Sharma'}
              </h2>
            </div>

            {/* Celebrant Age Badge */}
            {data.celebrantAge && (
              <div
                className={`inline-block mt-1.5 px-3 py-1 rounded-full bg-[#e63946] text-white text-xs font-bold shadow-md cursor-pointer ${
                  isSelected('celebrantAge') ? 'ring-2 ring-white' : ''
                }`}
                onClick={() => {
                  if (isEditor && onSelectElement) {
                    onSelectElement('celebrantAge', 'Age (उम्र)');
                  }
                }}
              >
                <span>Turning {data.celebrantAge} Years Old! 🎉</span>
              </div>
            )}

            {/* Invitation Line */}
            <div
              className={`mt-3 p-1.5 rounded cursor-pointer ${
                isSelected('invitationText') ? 'ring-2 ring-[#ffd166] bg-black/20' : ''
              }`}
              onClick={() => {
                if (isEditor && onSelectElement) {
                  onSelectElement('invitationText', 'Invitation Note (आमंत्रण संदेश)');
                }
              }}
            >
              <p className="text-xs font-sans text-white/85 leading-relaxed">
                {data.invitationText}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="pb-2 w-full z-10 flex flex-col items-center">
          {!openState ? (
            <button
              onClick={handleOpen}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-bold tracking-wider transition-all duration-300 transform active:scale-95 shadow-lg animate-pulse"
              style={{
                backgroundColor: data.theme.coverAccentColor || '#ffd166',
                color: '#1d3557',
              }}
            >
              <Sparkles className="w-4 h-4 text-[#1d3557]" />
              <span>{data.coverButtonText || 'Open Gift Box 🎁'}</span>
            </button>
          ) : (
            <div className="text-center">
              <span className="text-xs font-sans font-bold text-[#ffd166]">
                {data.eventDateFormatted}
              </span>
              <p className="text-[10px] text-white/75 mt-0.5 font-sans">
                {data.venueName} · {data.muhuratOrTime}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
