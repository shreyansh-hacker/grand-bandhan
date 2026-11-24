import React, { useState } from 'react';
import { GenericInvitationData, AgendaItem, SpeakerItem } from '../../types/invitation';
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar, UserCheck, Plus, Sparkles, Building2 } from 'lucide-react';

interface CorporateAgendaSceneProps {
  data: GenericInvitationData;
  isEditor?: boolean;
  onSelectElement?: (fieldKey: keyof GenericInvitationData, label: string) => void;
  selectedKey?: string;
}

export const CorporateAgendaScene: React.FC<CorporateAgendaSceneProps> = ({
  data,
  isEditor = false,
  onSelectElement,
  selectedKey,
}) => {
  const [tab, setTab] = useState<'agenda' | 'speakers'>('agenda');
  const [agendaIndex, setAgendaIndex] = useState<number>(0);
  const [speakerIndex, setSpeakerIndex] = useState<number>(0);
  const touchStartXRef = React.useRef<number>(0);

  const agenda = data.agenda && data.agenda.length > 0 ? data.agenda : [];
  const speakers = data.speakers && data.speakers.length > 0 ? data.speakers : [];

  const safeAgendaIdx = agenda.length > 0 ? Math.min(agendaIndex, agenda.length - 1) : 0;
  const currentSession = agenda[safeAgendaIdx];

  const safeSpeakerIdx = speakers.length > 0 ? Math.min(speakerIndex, speakers.length - 1) : 0;
  const currentSpeaker = speakers[safeSpeakerIdx];

  const handleNext = () => {
    if (tab === 'agenda') {
      if (agenda.length <= 1) return;
      setAgendaIndex((prev) => (prev < agenda.length - 1 ? prev + 1 : 0));
    } else {
      if (speakers.length <= 1) return;
      setSpeakerIndex((prev) => (prev < speakers.length - 1 ? prev + 1 : 0));
    }
  };

  const handlePrev = () => {
    if (tab === 'agenda') {
      if (agenda.length <= 1) return;
      setAgendaIndex((prev) => (prev > 0 ? prev - 1 : agenda.length - 1));
    } else {
      if (speakers.length <= 1) return;
      setSpeakerIndex((prev) => (prev > 0 ? prev - 1 : speakers.length - 1));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const listLen = tab === 'agenda' ? agenda.length : speakers.length;
    if (listLen <= 1) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 40) handleNext();
    else if (diff < -40) handlePrev();
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto min-h-[580px] rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-card-lux transition-all duration-500 overflow-hidden"
      style={{
        backgroundColor: data.theme.paperColor || '#f8fafc',
        border: `1.5px solid #cbd5e1`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Banner */}
      <div className="pt-2 z-10 w-full flex flex-col items-center">
        <span
          className="text-xs uppercase tracking-[0.25em] font-cinzel font-bold"
          style={{ color: data.theme.coverAccentColor || '#c99a3e' }}
        >
          SUMMIT PROGRAM
        </span>
        <h3 className="text-lg font-heading text-[#0f172a] font-bold mt-0.5">
          Speakers &amp; Timetable
        </h3>

        {/* Tab switch */}
        <div className="mt-2.5 inline-flex p-0.5 bg-stone-200/80 rounded-lg">
          <button
            onClick={() => setTab('agenda')}
            className={`px-3 py-1 rounded-md text-[11px] font-sans font-bold transition-all ${
              tab === 'agenda'
                ? 'bg-white text-[#0f172a] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Agenda Schedule ({agenda.length})
          </button>
          <button
            onClick={() => setTab('speakers')}
            className={`px-3 py-1 rounded-md text-[11px] font-sans font-bold transition-all ${
              tab === 'speakers'
                ? 'bg-white text-[#0f172a] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Keynote Speakers ({speakers.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="my-auto w-full flex flex-col items-center justify-center">
        {tab === 'agenda' ? (
          agenda.length === 0 ? (
            <div className="p-6 rounded-xl border-2 border-dashed border-stone-300 bg-white max-w-[280px]">
              <Calendar className="w-8 h-8 text-[#c99a3e] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-stone-700">No Sessions Listed</h4>
              <p className="text-xs text-stone-500 mt-1">
                {isEditor ? 'Add agenda sessions in the editor.' : 'Timetable will be announced shortly.'}
              </p>
              {isEditor && onSelectElement && (
                <button
                  onClick={() => onSelectElement('agenda', 'Agenda Schedule (एजेंडा)')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-[#0f172a] text-[#c99a3e] text-xs font-bold inline-flex items-center gap-1 shadow hover:bg-stone-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Session</span>
                </button>
              )}
            </div>
          ) : currentSession ? (
            <div
              className={`relative w-full max-w-[310px] bg-white rounded-xl p-5 shadow-md border transition-all text-left cursor-pointer ${
                selectedKey === 'agenda'
                  ? 'ring-2 ring-[#c99a3e] border-[#c99a3e]'
                  : 'border-stone-200 hover:shadow-lg'
              }`}
              onClick={() => {
                if (isEditor && onSelectElement) {
                  onSelectElement('agenda', `Session: ${currentSession.title}`);
                }
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0f172a] rounded-t-xl" />

              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-stone-100 text-[#0f172a] text-[11px] font-mono font-bold">
                  <Clock className="w-3 h-3 text-[#c99a3e]" />
                  {currentSession.time}
                </span>
                {currentSession.locationOrRoom && (
                  <span className="text-[10px] text-stone-500 font-sans flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    {currentSession.locationOrRoom}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-[#0f172a] font-heading leading-snug">
                {currentSession.title}
              </h4>

              <p className="text-xs text-stone-600 font-sans leading-relaxed mt-2">
                {currentSession.description}
              </p>

              {agenda.length > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="p-1 rounded-full bg-stone-100 hover:bg-stone-200"
                    aria-label="Previous session"
                  >
                    <ChevronLeft className="w-4 h-4 text-stone-700" />
                  </button>

                  <div className="flex gap-1">
                    {agenda.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAgendaIndex(i);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          i === safeAgendaIdx ? 'w-4 bg-[#0f172a]' : 'w-1.5 bg-stone-300'
                        }`}
                        aria-label={`Go to session ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="p-1 rounded-full bg-stone-100 hover:bg-stone-200"
                    aria-label="Next session"
                  >
                    <ChevronRight className="w-4 h-4 text-stone-700" />
                  </button>
                </div>
              )}
            </div>
          ) : null
        ) : (
          /* TAB 2: SPEAKERS */
          speakers.length === 0 ? (
            <div className="p-6 rounded-xl border-2 border-dashed border-stone-300 bg-white max-w-[280px]">
              <UserCheck className="w-8 h-8 text-[#c99a3e] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-stone-700">No Speakers Listed</h4>
              <p className="text-xs text-stone-500 mt-1">
                {isEditor ? 'Add keynote speakers in the editor.' : 'Speakers will be confirmed soon.'}
              </p>
              {isEditor && onSelectElement && (
                <button
                  onClick={() => onSelectElement('speakers', 'Keynote Speakers (कीनोट स्पीकर्स)')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-[#0f172a] text-[#c99a3e] text-xs font-bold inline-flex items-center gap-1 shadow hover:bg-stone-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Speaker</span>
                </button>
              )}
            </div>
          ) : currentSpeaker ? (
            <div
              className={`relative w-full max-w-[310px] bg-white rounded-xl p-5 shadow-md border transition-all text-left cursor-pointer ${
                selectedKey === 'speakers'
                  ? 'ring-2 ring-[#c99a3e] border-[#c99a3e]'
                  : 'border-stone-200 hover:shadow-lg'
              }`}
              onClick={() => {
                if (isEditor && onSelectElement) {
                  onSelectElement('speakers', `Speaker: ${currentSpeaker.name}`);
                }
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#c99a3e] rounded-t-xl" />

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={currentSpeaker.photoUrl || '/assets/templates/royal-wedding-book/illustrations/reception.svg'}
                    alt={currentSpeaker.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f172a] font-heading">
                    {currentSpeaker.name}
                  </h4>
                  <p className="text-[11px] text-stone-600 font-sans">
                    {currentSpeaker.role}
                  </p>
                  <p className="text-[10px] text-[#c99a3e] font-sans font-semibold">
                    {currentSpeaker.company}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-[10px] uppercase font-cinzel text-stone-500 font-bold block mb-0.5">
                  Keynote Topic:
                </span>
                <p className="text-xs text-[#0f172a] font-sans font-medium">
                  {currentSpeaker.topic}
                </p>
              </div>

              {speakers.length > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="p-1 rounded-full bg-stone-100 hover:bg-stone-200"
                    aria-label="Previous speaker"
                  >
                    <ChevronLeft className="w-4 h-4 text-stone-700" />
                  </button>

                  <div className="flex gap-1">
                    {speakers.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpeakerIndex(i);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          i === safeSpeakerIdx ? 'w-4 bg-[#c99a3e]' : 'w-1.5 bg-stone-300'
                        }`}
                        aria-label={`Go to speaker ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="p-1 rounded-full bg-stone-100 hover:bg-stone-200"
                    aria-label="Next speaker"
                  >
                    <ChevronRight className="w-4 h-4 text-stone-700" />
                  </button>
                </div>
              )}
            </div>
          ) : null
        )}
      </div>

      {/* Bottom Hint */}
      <div className="pb-2 z-10">
        <span className="text-[11px] font-sans text-stone-500">
          Continuing education credits available for registered delegates.
        </span>
      </div>
    </div>
  );
};
