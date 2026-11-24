import React from 'react';
import { RoyalWeddingData } from '../../types/invitation';

interface WelcomeSceneProps {
  data: RoyalWeddingData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof RoyalWeddingData, label: string) => void;
  selectedKey?: string;
}

export const WelcomeScene: React.FC<WelcomeSceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const isSelected = (key: keyof RoyalWeddingData) => selectedKey === key;

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#faf7f2',
        border: `1.5px solid #e8decb`,
        color: data.theme.textColor || '#2c2523',
      }}
    >
      {/* Delicate Gold Inner Border */}
      <div className="absolute inset-2.5 rounded-xl border border-[#c99a3e]/30 pointer-events-none" />

      {/* Decorative Floral Rose Corners */}
      <img
        src="/assets/templates/royal-wedding-book/illustrations/rose-corner.svg"
        alt="Rose Corner"
        className="absolute -top-3 -left-3 w-16 h-16 pointer-events-none opacity-85 rotate-0"
      />
      <img
        src="/assets/templates/royal-wedding-book/illustrations/rose-corner.svg"
        alt="Rose Corner"
        className="absolute -top-3 -right-3 w-16 h-16 pointer-events-none opacity-85 rotate-90"
      />
      <img
        src="/assets/templates/royal-wedding-book/illustrations/rose-corner.svg"
        alt="Rose Corner"
        className="absolute -bottom-3 -left-3 w-16 h-16 pointer-events-none opacity-85 -rotate-90"
      />
      <img
        src="/assets/templates/royal-wedding-book/illustrations/rose-corner.svg"
        alt="Rose Corner"
        className="absolute -bottom-3 -right-3 w-16 h-16 pointer-events-none opacity-85 rotate-180"
      />

      {/* Top Ganesh Medallion & Blessing */}
      <div className="pt-2 flex flex-col items-center w-full z-10">
        {data.showEmblem && (
          <div
            className={`w-14 h-14 mb-2 cursor-pointer transition-transform ${
              isEditor ? 'hover:scale-105' : ''
            } ${isSelected('coverEmblemUrl') ? 'ring-2 ring-[#c99a3e] rounded-full' : ''}`}
            onClick={() => {
              if (isEditor && onSelectElement) {
                onSelectElement('coverEmblemUrl', 'प्रतीक चिन्ह (Emblem)');
              }
            }}
          >
            <img
              src={data.coverEmblemUrl}
              alt="Ganesh Emblem"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
        )}

        {/* Primary Editable Blessing Line: ॥ श्री गणेशाय नमः ॥ or स्नेहिल आमंत्रण */}
        <div
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
            isSelected('openingBlessing')
              ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15 shadow-sm'
              : isEditor
              ? 'hover:bg-amber-100/50 hover:ring-1 hover:ring-[#c99a3e]/50'
              : ''
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('openingBlessing', 'मंगलाचरण / आशीर्वाद (Opening Blessing)');
            }
          }}
        >
          <span
            className="font-bold tracking-wider block"
            style={{
              fontFamily: data.openingBlessingFont || data.theme.devanagariFont || 'Noto Serif Devanagari',
              color: data.openingBlessingColor || '#c99a3e',
              fontSize: `${data.openingBlessingSize || 20}px`,
            }}
          >
            {data.openingBlessing}
          </span>
        </div>
      </div>

      {/* Center Section: Couple Names & Family Line */}
      <div className="my-auto py-2 flex flex-col items-center w-full z-10">
        <span className="text-xs uppercase tracking-[0.2em] font-cinzel text-[#852b3d] font-semibold">
          Together With Their Families
        </span>
        <div className="w-12 h-0.5 my-2 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>

        {/* Groom & Parents */}
        <div
          className={`w-full py-1.5 px-2 rounded-md cursor-pointer transition-all ${
            isSelected('groomName')
              ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15 shadow-sm'
              : isEditor
              ? 'hover:bg-amber-100/40'
              : ''
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('groomName', 'वर का नाम (Groom Name)');
            }
          }}
        >
          <h2 className="text-2xl font-bold font-devanagari text-[#6e1f2f] tracking-wide">
            {data.groomName}
          </h2>
          <p className="text-[11px] font-sans text-[#6e615c] mt-0.5">
            सुपुत्र: {data.groomMother} एवं {data.groomFather}
          </p>
        </div>

        {/* Amour / Sang separator */}
        <div className="my-1.5 flex items-center justify-center gap-3 w-3/4">
          <div className="flex-1 h-[1px] bg-[#c99a3e]/40"></div>
          <span className="font-script text-2xl text-[#c99a3e] px-1 font-bold">संग</span>
          <div className="flex-1 h-[1px] bg-[#c99a3e]/40"></div>
        </div>

        {/* Bride & Parents */}
        <div
          className={`w-full py-1.5 px-2 rounded-md cursor-pointer transition-all ${
            isSelected('brideName')
              ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15 shadow-sm'
              : isEditor
              ? 'hover:bg-amber-100/40'
              : ''
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('brideName', 'वधु का नाम (Bride Name)');
            }
          }}
        >
          <h2 className="text-2xl font-bold font-devanagari text-[#6e1f2f] tracking-wide">
            {data.brideName}
          </h2>
          <p className="text-[11px] font-sans text-[#6e615c] mt-0.5">
            सुपुत्री: {data.brideMother} एवं {data.brideFather}
          </p>
        </div>

        {/* Invitation Message Text */}
        <div
          className={`mt-4 px-3 py-2 rounded-md cursor-pointer transition-all text-center ${
            isSelected('invitationText')
              ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15 shadow-sm'
              : isEditor
              ? 'hover:bg-amber-100/40'
              : ''
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('invitationText', 'आमंत्रण संदेश (Invitation Text)');
            }
          }}
        >
          <p className="text-xs font-devanagari text-[#4a3e3b] leading-relaxed">
            {data.invitationText}
          </p>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="pb-2 z-10 flex flex-col items-center">
        <span className="text-[11px] font-sans text-[#852b3d] tracking-widest uppercase font-semibold">
          शुभ विवाह उत्सव
        </span>
        <div className="w-6 h-0.5 mt-1 bg-[#c99a3e]"></div>
      </div>
    </div>
  );
};
