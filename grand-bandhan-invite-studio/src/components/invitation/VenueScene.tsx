import React, { useState } from 'react';
import { GenericInvitationData } from '../../types/invitation';
import { MapPin, Navigation, Copy, Check, Video, Globe, ExternalLink, Calendar } from 'lucide-react';
import { generateIcsCalendar, getGoogleCalendarUrl } from '../../services/calendar';

interface VenueSceneProps {
  data: GenericInvitationData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof GenericInvitationData, label: string) => void;
  selectedKey?: string;
}

export const VenueScene: React.FC<VenueSceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const isSelected = (key: keyof GenericInvitationData) => selectedKey === key;

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = [
      data.venueName,
      data.venueAddress,
      data.venueLandmark ? `Landmark: ${data.venueLandmark}` : '',
      data.onlineMeetingUrl ? `Virtual Link: ${data.onlineMeetingUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dest = data.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${data.venueName} ${data.venueAddress}`)}`;
    window.open(dest, '_blank');
  };

  const handleOpenMeeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onlineMeetingUrl) {
      window.open(data.onlineMeetingUrl, '_blank');
    }
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
        <span
          className="text-xs uppercase tracking-[0.25em] font-cinzel font-bold"
          style={{ color: data.theme.coverAccentColor || '#c99a3e' }}
        >
          {data.category === 'corporate' && data.onlineMeetingUrl ? 'VENUE & VIRTUAL ACCESS' : 'VENUE & DIRECTIONS'}
        </span>
        <h3 className="text-lg font-heading text-[#2c2523] font-bold mt-0.5">
          {data.invitationLanguage === 'hi' ? 'स्थान व मार्ग दर्शन' : 'Location & Access'}
        </h3>
        <div className="w-12 h-0.5 mt-1 bg-gradient-to-r from-transparent via-[#c99a3e] to-transparent"></div>
      </div>

      {/* Centerpiece Map Illustration & Venue Card */}
      <div className="relative w-full max-w-[310px] my-auto bg-white rounded-xl p-5 shadow-md border border-[#e8decb] flex flex-col items-center">
        {/* Animated Map Icon / Compass Pin */}
        <div className="relative w-16 h-16 rounded-full bg-[#fdf8f0] border-2 border-[#dfba6a] flex items-center justify-center mb-3 shadow-inner">
          <MapPin
            className="w-8 h-8 animate-bounce"
            style={{ color: data.theme.coverColor || '#6e1f2f' }}
          />
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
          <h4
            className="text-lg font-heading font-bold"
            style={{ color: data.theme.coverColor || '#6e1f2f' }}
          >
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
          <p className="text-xs font-sans text-stone-600 leading-relaxed">
            {data.venueAddress}
          </p>
        </div>

        {/* Optional Online Stream / Meeting Link for Corporate/Hybrid */}
        {data.onlineMeetingUrl && (
          <div
            className={`mt-3 p-2 rounded-lg bg-sky-50 border border-sky-200 w-full flex items-center justify-between cursor-pointer ${
              isSelected('onlineMeetingUrl') ? 'ring-2 ring-sky-500' : ''
            }`}
            onClick={() => {
              if (isEditor && onSelectElement) {
                onSelectElement('onlineMeetingUrl', 'ऑनलाइन मीटिंग लिंक (Virtual Link)');
              }
            }}
          >
            <div className="flex items-center gap-2 text-left">
              <Video className="w-4 h-4 text-sky-700 shrink-0" />
              <div className="overflow-hidden">
                <span className="block text-[10px] font-bold text-sky-900 uppercase font-sans">
                  Virtual Stream Access
                </span>
                <span className="block text-[11px] text-sky-700 truncate font-mono max-w-[190px]">
                  {data.onlineMeetingUrl}
                </span>
              </div>
            </div>
            {!isEditor && (
              <button
                onClick={handleOpenMeeting}
                className="p-1 rounded text-sky-800 hover:bg-sky-100 shrink-0"
                title="Open meeting"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Action Buttons: Get Directions, Copy Address & Calendar */}
        <div className="mt-4 w-full flex flex-col gap-2">
          {data.onlineMeetingUrl && (
            <button
              onClick={handleOpenMeeting}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-sky-700 text-white text-xs font-semibold rounded-lg shadow hover:bg-sky-800 active:scale-98 transition-all"
            >
              <Video className="w-4 h-4 text-sky-200" />
              <span>वर्चुअल लाइव स्ट्रीम से जुड़ें (Join Stream)</span>
            </button>
          )}

          <button
            onClick={handleOpenMaps}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-white text-xs font-semibold rounded-lg shadow active:scale-98 transition-all hover:opacity-90"
            style={{ backgroundColor: data.theme.coverColor || '#6e1f2f' }}
          >
            <Navigation className="w-4 h-4 text-[#dfba6a]" />
            <span>गूगल मैप्स में देखें (Get Directions)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyAddress}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#faf7f2] border border-[#dfba6a] text-xs font-medium rounded-lg hover:bg-[#f2ede4] active:scale-98 transition-all"
              style={{ color: data.theme.coverColor || '#6e1f2f' }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">कॉपी हुआ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#c99a3e]" />
                  <span>पता कॉपी करें</span>
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                generateIcsCalendar(
                  `${data.groomName || data.celebrantOrCouple || data.title || 'Grand Bandhan'} - Invitation`,
                  `${data.invitationText || 'Grand Bandhan Celebration'}\nVenue: ${data.venueName}, ${data.venueAddress}`,
                  `${data.venueName}, ${data.venueAddress}`,
                  data.eventIsoDate || data.weddingIsoDate
                );
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#faf7f2] border border-[#dfba6a] text-xs font-medium rounded-lg hover:bg-[#f2ede4] active:scale-98 transition-all text-[#6e1f2f]"
              title="Add event reminder to Apple / Google / Outlook calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-[#c99a3e]" />
              <span>कैलेंडर में जोड़ें</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Landmark Caption (Only rendered when landmark exists or in editor) */}
      <div className="pb-2 z-10 min-h-[22px]">
        {data.venueLandmark ? (
          <div
            className={`cursor-pointer px-2 py-0.5 rounded ${
              isSelected('venueLandmark') ? 'ring-2 ring-[#c99a3e] bg-amber-100/60' : ''
            }`}
            onClick={() => {
              if (isEditor && onSelectElement) {
                onSelectElement('venueLandmark', 'लैंडमार्क / विशेष पता (Landmark Caption)');
              }
            }}
          >
            <span className="text-[11px] font-sans text-stone-600">
              {data.venueLandmark}
            </span>
          </div>
        ) : isEditor ? (
          <button
            onClick={() => {
              if (onSelectElement) {
                onSelectElement('venueLandmark', 'लैंडमार्क / विशेष पता (Landmark Caption)');
              }
            }}
            className="text-[10px] text-stone-400 hover:text-stone-700 font-sans italic"
          >
            + Add optional landmark / caption
          </button>
        ) : null}
      </div>
    </div>
  );
};
