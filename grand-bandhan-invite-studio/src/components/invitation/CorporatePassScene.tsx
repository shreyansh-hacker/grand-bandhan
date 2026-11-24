import React, { useState } from 'react';
import { GenericInvitationData } from '../../types/invitation';
import { CreditCard, QrCode, RefreshCw, MapPin, Calendar, ExternalLink } from 'lucide-react';

interface CorporatePassSceneProps {
  data: GenericInvitationData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof GenericInvitationData, label: string) => void;
  selectedKey?: string;
}

export const CorporatePassScene: React.FC<CorporatePassSceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const isSelected = (key: keyof GenericInvitationData) => selectedKey === key;

  return (
    <div className="relative w-full min-h-[580px] max-w-sm mx-auto flex flex-col items-center justify-center p-4 select-none perspective-[1400px]">
      {/* Lanyard Cord / Neck Strap */}
      <div className="w-12 h-14 bg-gradient-to-b from-stone-800 to-[#1e293b] rounded-t-lg mx-auto flex items-end justify-center pb-1 shadow-md z-10">
        <div className="w-5 h-5 rounded-full bg-stone-300 border-2 border-stone-600 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-stone-800"></div>
        </div>
      </div>

      {/* 3D Flippable Badge Container */}
      <div
        className={`relative w-full max-w-[330px] h-[480px] transition-transform duration-700 transform-gpu cursor-pointer ${
          isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
        }`}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => {
          if (!isEditor) setIsFlipped(!isFlipped);
        }}
      >
        {/* ============================================================== */}
        {/* FRONT SIDE OF PASS */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-2xl backface-hidden border-2"
          style={{
            backgroundColor: data.theme.coverColor || '#0f172a',
            borderColor: data.theme.coverAccentColor || '#c99a3e',
            color: '#ffffff',
          }}
        >
          {/* Top Pass Category Bar */}
          <div className="w-full pt-1 flex items-center justify-between border-b border-white/10 pb-3">
            <span
              className="text-[10px] font-cinzel uppercase tracking-[0.2em] font-bold"
              style={{ color: data.theme.coverAccentColor || '#c99a3e' }}
            >
              EXECUTIVE SUMMIT 2027
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-sans font-bold bg-white/10 text-white tracking-wider">
              ALL-ACCESS
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="my-auto w-full px-2">
            <div
              className={`p-1.5 rounded cursor-pointer transition-all ${
                isSelected('title') ? 'ring-2 ring-[#c99a3e] bg-black/30' : ''
              }`}
              onClick={(e) => {
                if (isEditor && onSelectElement) {
                  e.stopPropagation();
                  onSelectElement('title', 'Event Title (इवेंट शीर्षक)');
                }
              }}
            >
              <h2 className="text-xl font-bold font-heading leading-snug tracking-wide text-white">
                {data.title}
              </h2>
            </div>

            <p className="text-[11px] font-cinzel uppercase tracking-widest text-white/70 mt-1">
              {data.subtitle}
            </p>

            {/* Delegate Badge Medallion */}
            <div className="my-4 py-3 px-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center gap-3">
              <QrCode className="w-12 h-12 text-[#c99a3e]" />
              <div className="text-left">
                <span className="block text-[9px] text-white/60 uppercase font-sans">
                  Delegate ID: GB-84920
                </span>
                <span className="block text-xs font-bold text-white font-sans">
                  {data.celebrantOrCouple || 'Executive Delegate'}
                </span>
                <span className="block text-[10px] text-[#c99a3e] font-sans">
                  Grand Bandhan Enterprise
                </span>
              </div>
            </div>

            {/* Date & Venue Snip */}
            <div className="space-y-1 text-left px-2 text-xs text-white/80 font-sans">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#c99a3e] shrink-0" />
                <span className="text-[11px]">{data.eventDateFormatted}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c99a3e] shrink-0" />
                <span className="text-[11px] truncate">{data.venueName}</span>
              </div>
            </div>
          </div>

          {/* Flip Hint Button */}
          <div className="w-full pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] text-white/60 font-sans">
              Tap anywhere to view agenda & speakers
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c99a3e] text-[#0f172a] text-[11px] font-bold shadow hover:bg-[#dfba6a]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Flip Pass</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BACK SIDE OF PASS */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-2xl backface-hidden border-2 [transform:rotateY(180deg)]"
          style={{
            backgroundColor: '#ffffff',
            borderColor: data.theme.coverAccentColor || '#c99a3e',
            color: '#0f172a',
          }}
        >
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="text-[10px] font-cinzel uppercase tracking-widest text-[#0f172a] font-bold">
              PROGRAM &amp; REGISTRATION
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="p-1 rounded text-stone-500 hover:text-stone-900"
              title="Flip to Front"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Keynote Highlights */}
          <div className="my-auto w-full text-left space-y-3 px-1">
            <span className="block text-[11px] font-cinzel uppercase font-bold text-[#c99a3e]">
              Featured Keynotes:
            </span>

            {data.speakers && data.speakers.length > 0 ? (
              data.speakers.slice(0, 2).map((spk) => (
                <div key={spk.id} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="block text-xs font-bold text-[#0f172a]">{spk.name}</span>
                  <span className="block text-[10px] text-stone-600 font-sans">{spk.role} · {spk.company}</span>
                  <span className="block text-[10px] text-[#c99a3e] font-sans font-medium mt-0.5">
                    Topic: {spk.topic}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 font-sans">
                Full technical agenda & symposium timetable.
              </p>
            )}

            {/* Virtual Stream / Physical Venue */}
            <div className="pt-2 border-t border-stone-200 space-y-1">
              <span className="block text-[10px] text-stone-500 uppercase font-sans">
                Hybrid Attendance:
              </span>
              <p className="text-xs font-bold text-[#0f172a]">{data.venueName}</p>
              {data.onlineMeetingUrl && (
                <a
                  href={data.onlineMeetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-semibold hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Join Live Stream</span>
                </a>
              )}
            </div>
          </div>

          {/* Bottom Flip Button */}
          <div className="w-full pt-2 border-t border-stone-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#0f172a] text-white text-xs font-bold shadow hover:bg-stone-800"
            >
              ← Back to Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
