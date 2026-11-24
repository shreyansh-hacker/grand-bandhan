import React, { useState, useEffect } from 'react';
import { RoyalWeddingData } from '../../types/invitation';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { weddingMusic } from '../../services/sound';

interface ClosingSceneProps {
  data: RoyalWeddingData;
  onReplay: () => void;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof RoyalWeddingData, label: string) => void;
  selectedKey?: string;
}

export const ClosingScene: React.FC<ClosingSceneProps> = ({
  data,
  onReplay,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(weddingMusic.getStatus());

  useEffect(() => {
    setIsPlayingMusic(weddingMusic.getStatus());
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = weddingMusic.toggle();
    setIsPlayingMusic(state);
  };

  const isSelected = (key: keyof RoyalWeddingData) => selectedKey === key;

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
          WITH LOVE &amp; GRATITUDE
        </span>
        <h3 className="text-lg font-devanagari text-[#6e1f2f] font-bold mt-0.5">
          सस्नेह विदाई व आभार
        </h3>
        <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>
      </div>

      {/* Center Blessing & Family Card */}
      <div className="relative w-full max-w-[310px] my-auto bg-white rounded-xl p-6 shadow-md border border-[#e8decb] flex flex-col items-center">
        {/* Emblem */}
        <div className="w-16 h-16 mb-3">
          <img
            src={data.coverEmblemUrl}
            alt="Blessing"
            className="w-full h-full object-contain filter drop-shadow-sm opacity-95"
          />
        </div>

        {/* Closing Blessing */}
        <div
          className={`p-2 rounded cursor-pointer transition-all w-full ${
            isSelected('closingBlessing')
              ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15'
              : isEditor
              ? 'hover:bg-amber-100/50'
              : ''
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('closingBlessing', 'समापन संदेश (Closing Blessing)');
            }
          }}
        >
          <p className="font-heading italic text-sm text-[#6e1f2f] leading-relaxed">
            "{data.closingBlessing}"
          </p>
        </div>

        {/* Decorative Golden Divider */}
        <div className="w-24 h-0.5 my-3 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>

        {/* Family Names */}
        <div
          className={`p-2 rounded cursor-pointer transition-all w-full ${
            isSelected('familyClosingText')
              ? 'ring-2 ring-[#c99a3e] bg-[#c99a3e]/15'
              : isEditor
              ? 'hover:bg-amber-100/50'
              : ''
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('familyClosingText', 'परिवार के नाम (Family Closing Text)');
            }
          }}
        >
          <h4 className="font-devanagari font-bold text-base text-[#2c2523]">
            {data.familyClosingText}
          </h4>
        </div>

        {/* Ambient Music Controller */}
        <div className="mt-4 pt-3 border-t border-[#e8decb]/60 w-full flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-full transition-all ${
                isPlayingMusic
                  ? 'bg-[#6e1f2f] text-[#dfba6a]'
                  : 'bg-[#f2ede4] text-[#7d6a58] hover:bg-[#e5dcce]'
              }`}
              title="संगीत चालू / बंद करें"
            >
              {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="text-left">
              <span className="block text-[11px] font-sans font-medium text-[#2c2523]">
                {isPlayingMusic ? 'शाही शहनाई' : 'संगीत बंद है'}
              </span>
              <span className="block text-[9px] text-[#7d6a58]">
                {isPlayingMusic ? 'चल रहा है (Click to Mute)' : 'सुनने के लिए टैप करें'}
              </span>
            </div>
          </div>

          {/* Equalizer animation */}
          {isPlayingMusic && (
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-1 bg-[#c99a3e] h-3 animate-pulse"></div>
              <div className="w-1 bg-[#c99a3e] h-2 animate-pulse delay-75"></div>
              <div className="w-1 bg-[#c99a3e] h-3.5 animate-pulse delay-150"></div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Replay Action */}
      <div className="pb-2 w-full flex justify-center z-10">
        <button
          onClick={onReplay}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6e1f2f] text-[#dfba6a] text-xs font-semibold shadow hover:bg-[#541421] active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>शुरुआत से दोबारा चलाएँ (Replay)</span>
        </button>
      </div>
    </div>
  );
};
