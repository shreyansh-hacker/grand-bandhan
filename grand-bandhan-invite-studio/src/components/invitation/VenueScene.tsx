import React, { useState } from 'react';
import { RoyalWeddingData } from '../../types/invitation';
import { MapPin, Navigation, Copy, Check } from 'lucide-react';

interface VenueSceneProps {
  data: RoyalWeddingData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof RoyalWeddingData, label: string) => void;
  selectedKey?: string;
}

export const VenueScene: React.FC<VenueSceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const isSelected = (key: keyof RoyalWeddingData) => selectedKey === key;

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${data.venueName}\n${data.venueAddress}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(data.googleMapsUrl || 'https://maps.google.com', '_blank');
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#faf7f2',
        border: `1.5px solid #e8decb`,
      }}
    >
      {/* Top Banner */}
      <div className="pt-2 z-10 w-full flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.25em] font-cinzel text-[#852b3d] font-bold">
          VENUE &amp; DIRECTIONS
        </span>
        <h3 className="text-lg font-devanagari text-[#6e1f2f] font-bold mt-0.5">
          स्थान व मार्ग दर्शन
        </h3>
        <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>
      </div>

      {/* Centerpiece Map Illustration & Venue Card */}
      <div className="relative w-full max-w-[310px] my-auto bg-white rounded-xl p-5 shadow-md border border-[#e8decb] flex flex-col items-center">
        {/* Animated Map Icon / Compass Pin */}
        <div className="relative w-16 h-16 rounded-full bg-[#fdf8f0] border-2 border-[#dfba6a] flex items-center justify-center mb-3 shadow-inner">
          <MapPin className="w-8 h-8 text-[#6e1f2f] animate-bounce" />
          <div className="absolute -bottom-1 w-6 h-2 bg-black/10 rounded-full blur-[1px]"></div>
        </div>

        {/* Venue Name */}
        <div
          className={`p-1.5 rounded cursor-pointer transition-all w-full ${
            isSelected('venueName')
              ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15'
              : isEditor
              ? 'hover:bg-amber-100/50'
              : ''
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('venueName', 'स्थान का नाम (Venue Name)');
            }
          }}
        >
          <h4 className="text-lg font-devanagari font-bold text-[#6e1f2f]">
            {data.venueName}
          </h4>
        </div>

        {/* Venue Address */}
        <div
          className={`mt-1 p-1.5 rounded cursor-pointer transition-all w-full ${
            isSelected('venueAddress')
              ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15'
              : isEditor
              ? 'hover:bg-amber-100/50'
              : ''
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('venueAddress', 'स्थान का पता (Venue Address)');
            }
          }}
        >
          <p className="text-xs font-devanagari text-[#5c4f4a] leading-relaxed">
            {data.venueAddress}
          </p>
        </div>

        {/* Action Buttons: Get Directions & Copy Address */}
        <div className="mt-5 w-full flex flex-col gap-2.5">
          <button
            onClick={handleOpenMaps}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#6e1f2f] text-white text-xs font-semibold rounded-lg shadow hover:bg-[#541421] active:scale-98 transition-all"
          >
            <Navigation className="w-4 h-4 text-[#dfba6a]" />
            <span>गूगल मैप्स में देखें (Get Directions)</span>
          </button>

          <button
            onClick={handleCopyAddress}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[#faf7f2] border border-[#dfba6a] text-[#6e1f2f] text-xs font-medium rounded-lg hover:bg-[#f2ede4] active:scale-98 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">पता कॉपी हो गया! (Copied)</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#c99a3e]" />
                <span>पता कॉपी करें (Copy Address)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="pb-2 z-10">
        <span className="text-[11px] font-sans text-[#7d6a58]">
          जल महल के सामने · जयपुर, राजस्थान
        </span>
      </div>
    </div>
  );
};
