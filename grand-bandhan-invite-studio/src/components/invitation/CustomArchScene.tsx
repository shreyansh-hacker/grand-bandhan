import React, { useState } from 'react';
import { GenericInvitationData } from '../../types/invitation';
import { Home, Sparkles, DoorOpen } from 'lucide-react';

interface CustomArchSceneProps {
  data: GenericInvitationData;
  isOpen: boolean;
  onOpen: () => void;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof GenericInvitationData, label: string) => void;
  selectedKey?: string;
}

export const CustomArchScene: React.FC<CustomArchSceneProps> = ({
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
  };

  const isSelected = (key: keyof GenericInvitationData) => selectedKey === key;

  return (
    <div className="relative w-full min-h-[580px] max-w-sm mx-auto flex items-center justify-center p-4 select-none perspective-[1200px]">
      <div
        className="relative w-full max-w-[340px] h-[520px] rounded-2xl p-6 flex flex-col items-center justify-between shadow-2xl overflow-hidden border-2"
        style={{
          backgroundColor: data.theme.paperColor || '#faf6f0',
          borderColor: data.theme.coverAccentColor || '#d4af37',
          color: data.theme.textColor || '#291b17',
        }}
      >
        {/* Auspicious Floral Toran Garland at Top */}
        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#7f1d1d] to-transparent opacity-15 pointer-events-none" />

        {/* Top Tag & Blessing */}
        <div className="pt-2 z-10 text-center w-full">
          <span
            className="text-xs uppercase tracking-[0.25em] font-cinzel font-bold block"
            style={{ color: '#7f1d1d' }}
          >
            {data.subtitle || 'SACRED INVITATION'}
          </span>
          <div className="w-16 h-0.5 mt-1 mx-auto bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>

          {/* Mantra / Opening Blessing */}
          <div
            className={`mt-2 p-1.5 rounded cursor-pointer ${
              isSelected('openingBlessing') ? 'ring-2 ring-[#d4af37] bg-amber-50' : ''
            }`}
            onClick={() => {
              if (isEditor && onSelectElement) {
                onSelectElement('openingBlessing', 'Mantra / Blessing (मंगलाचरण)');
              }
            }}
          >
            <h3 className="text-base font-devanagari font-bold text-[#7f1d1d]">
              {data.openingBlessing}
            </h3>
          </div>
        </div>

        {/* 3D Double Doors / Arch Motif */}
        <div className="my-auto w-full relative flex flex-col items-center z-10">
          <div className="relative w-64 h-56 rounded-t-full border-4 border-[#d4af37] p-2 flex items-center justify-center bg-white shadow-inner overflow-hidden">
            {/* Left Door Panel */}
            <div
              className={`absolute left-0 inset-y-0 w-1/2 border-r border-[#d4af37]/60 origin-left transition-all duration-1000 transform-gpu z-20 flex flex-col items-center justify-center p-2 shadow-md ${
                openState ? '[transform:rotateY(-85deg)] opacity-20' : '[transform:rotateY(0deg)] opacity-100'
              }`}
              style={{
                backgroundColor: data.theme.coverColor || '#7f1d1d',
                color: '#ffffff',
              }}
            >
              <div className="w-6 h-6 rounded-full border border-[#d4af37] flex items-center justify-center mb-1">
                <Home className="w-3.5 h-3.5 text-[#d4af37]" />
              </div>
              <span className="text-[10px] font-devanagari font-bold text-[#fce8c0]">
                शुभ
              </span>
            </div>

            {/* Right Door Panel */}
            <div
              className={`absolute right-0 inset-y-0 w-1/2 border-l border-[#d4af37]/60 origin-right transition-all duration-1000 transform-gpu z-20 flex flex-col items-center justify-center p-2 shadow-md ${
                openState ? '[transform:rotateY(85deg)] opacity-20' : '[transform:rotateY(0deg)] opacity-100'
              }`}
              style={{
                backgroundColor: data.theme.coverColor || '#7f1d1d',
                color: '#ffffff',
              }}
            >
              <div className="w-6 h-6 rounded-full border border-[#d4af37] flex items-center justify-center mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              </div>
              <span className="text-[10px] font-devanagari font-bold text-[#fce8c0]">
                लाभ
              </span>
            </div>

            {/* Revealed Inner Sanctum / Content */}
            <div className="text-center p-3 animate-fade-in z-10">
              <span className="text-[10px] font-cinzel uppercase text-stone-500 tracking-wider block">
                WELCOME TO
              </span>
              <h2 className="text-xl font-devanagari font-bold text-[#7f1d1d] mt-1">
                {data.title}
              </h2>
              <span className="text-xs font-heading italic text-[#d4af37] block mt-1">
                {data.celebrantOrCouple}
              </span>
            </div>
          </div>

          {/* Invitation Copy */}
          <div
            className={`mt-4 text-center px-3 p-1.5 rounded cursor-pointer ${
              isSelected('invitationText') ? 'ring-2 ring-[#d4af37] bg-amber-50' : ''
            }`}
            onClick={() => {
              if (isEditor && onSelectElement) {
                onSelectElement('invitationText', 'Invitation Note (आमंत्रण संदेश)');
              }
            }}
          >
            <p className="text-xs font-devanagari text-stone-700 leading-relaxed">
              {data.invitationText}
            </p>
          </div>
        </div>

        {/* Bottom Interactive Trigger */}
        <div className="pb-2 w-full z-10 flex flex-col items-center">
          {!openState ? (
            <button
              onClick={handleOpen}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-bold tracking-wider transition-all duration-300 transform active:scale-95 shadow-md"
              style={{
                backgroundColor: '#7f1d1d',
                color: '#fce8c0',
              }}
            >
              <DoorOpen className="w-4 h-4 text-[#fce8c0]" />
              <span>{data.coverButtonText || 'Open Door 🏡'}</span>
            </button>
          ) : (
            <div className="text-center">
              <span className="text-xs font-devanagari font-bold text-[#7f1d1d]">
                {data.eventDateFormatted}
              </span>
              <p className="text-[10px] text-stone-600 mt-0.5 font-sans">
                {data.venueName} · {data.muhuratOrTime}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
