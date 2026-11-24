import React, { useState } from 'react';
import { RoyalWeddingData } from '../../types/invitation';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

interface StorySceneProps {
  data: RoyalWeddingData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof RoyalWeddingData, label: string) => void;
  selectedKey?: string;
}

export const StoryScene: React.FC<StorySceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const photos = data.storyPhotos || [];
  const currentPhoto = photos[photoIndex] || photos[0];

  const handlePrev = () => {
    setPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#faf7f2',
        border: `1.5px solid #e8decb`,
      }}
    >
      {/* Top Banner */}
      <div className="pt-2 z-10 w-full flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.25em] font-cinzel text-[#852b3d] font-bold">
          OUR SACRED JOURNEY
        </span>
        <h3 className="text-lg font-devanagari text-[#6e1f2f] font-bold mt-0.5">
          प्रेम एवं विश्वास की सुंदर दास्तान
        </h3>
        <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>
      </div>

      {/* Main Photo Card */}
      {currentPhoto && (
        <div
          className={`relative w-full max-w-[290px] my-auto bg-white rounded-xl p-3 shadow-md border transition-all ${
            selectedKey === 'storyPhotos'
              ? 'ring-2 ring-[#c99a3e] border-[#c99a3e]'
              : 'border-[#e8decb]'
          }`}
          onClick={() => {
            if (isEditor && onSelectElement) {
              onSelectElement('storyPhotos', 'फोटो गैलरी (Story Photos)');
            }
          }}
        >
          {/* Framed Photo Container */}
          <div className="relative w-full h-[230px] rounded-lg overflow-hidden bg-[#2c1219]">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-full">
              <Heart className="w-3.5 h-3.5 text-[#dfba6a] fill-[#dfba6a]" />
            </div>
          </div>

          {/* Caption */}
          <div className="pt-3 pb-1 text-center">
            <h5 className="font-heading font-bold text-sm text-[#6e1f2f]">
              {currentPhoto.title}
            </h5>
            <p className="font-devanagari text-xs text-[#5c4f4a] mt-1 leading-snug">
              {currentPhoto.caption}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="pb-2 w-full flex flex-col items-center gap-2 z-10">
        <div className="flex items-center justify-between w-full max-w-[220px]">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-[#6e1f2f] text-white flex items-center justify-center hover:bg-[#541421] active:scale-95 transition-all shadow"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPhotoIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === photoIndex
                    ? 'w-5 h-2 bg-[#6e1f2f]'
                    : 'w-2 h-2 bg-[#d1c5b4] hover:bg-[#a89984]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-[#6e1f2f] text-white flex items-center justify-center hover:bg-[#541421] active:scale-95 transition-all shadow"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
