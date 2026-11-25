import React, { useState, useRef } from 'react';
import {
  GenericInvitationData,
  CeremonyFunction,
  ActivityItem,
  AgendaItem,
  SpeakerItem,
  StoryPhoto,
  SelectedElement,
  InvitationLanguage,
} from '../../types/invitation';
import { DESIGN_TOKENS } from '../../styles/tokens';
import {
  Sparkles,
  Sliders,
  Trash2,
  Plus,
  Globe,
  CheckSquare,
  MapPin,
  Calendar,
  Clock,
  Video,
  Image,
  User,
  Building,
  Music,
  Volume2,
  VolumeX,
  Play,
  Square,
  Upload,
  Camera,
  Heart,
} from 'lucide-react';
import { useLanguage } from '../../locales';
import { weddingMusic } from '../../services/sound';

interface PropertiesPanelProps {
  data: GenericInvitationData;
  selectedElement: SelectedElement | null;
  onUpdateField: (fieldKey: keyof GenericInvitationData, value: any) => void;
  onUpdateTheme: (themeKey: keyof GenericInvitationData['theme'], value: any) => void;
  onUpdateFunction: (functionId: string, updatedFields: Partial<CeremonyFunction>) => void;
  onAddFunction: () => void;
  onRemoveFunction: (functionId: string) => void;
  onClearSelection: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  data,
  selectedElement,
  onUpdateField,
  onUpdateTheme,
  onUpdateFunction,
  onAddFunction,
  onRemoveFunction,
  onClearSelection,
}) => {
  const { lang, t } = useLanguage();
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Helper for array field updates (activities, agenda, speakers)
  const handleUpdateActivity = (index: number, updated: Partial<ActivityItem>) => {
    const list = [...(data.activities || [])];
    if (list[index]) {
      list[index] = { ...list[index], ...updated };
      onUpdateField('activities', list);
    }
  };

  const handleAddActivity = () => {
    const list = [...(data.activities || [])];
    const newId = `act-${Date.now()}`;
    if (data.category === 'birthday') {
      list.push({
        id: newId,
        time: '05:00 PM',
        title: 'New Fun Activity',
        description: 'Exciting games, music, and fun for all guests.',
        icon: 'Sparkles',
      });
    } else {
      list.push({
        id: newId,
        time: '11:00 AM',
        title: 'नया पावन अनुष्ठान (New Ritual)',
        description: 'पारंपरिक विधि-विधान व मंगल आरती।',
        icon: 'Sparkles',
      });
    }
    onUpdateField('activities', list);
  };

  const handleRemoveActivity = (index: number) => {
    const list = [...(data.activities || [])];
    list.splice(index, 1);
    onUpdateField('activities', list);
  };

  const handleUpdateAgenda = (index: number, updated: Partial<AgendaItem>) => {
    const list = [...(data.agenda || [])];
    if (list[index]) {
      list[index] = { ...list[index], ...updated };
      onUpdateField('agenda', list);
    }
  };

  const handleAddAgenda = () => {
    const list = [...(data.agenda || [])];
    list.push({
      id: `ag-${Date.now()}`,
      time: '03:00 PM - 04:00 PM',
      title: 'New Conference Session',
      description: 'Keynote presentation and interactive Q&A panel.',
      locationOrRoom: 'Main Hall',
    });
    onUpdateField('agenda', list);
  };

  const handleRemoveAgenda = (index: number) => {
    const list = [...(data.agenda || [])];
    list.splice(index, 1);
    onUpdateField('agenda', list);
  };

  const handleUpdateSpeaker = (index: number, updated: Partial<SpeakerItem>) => {
    const list = [...(data.speakers || [])];
    if (list[index]) {
      list[index] = { ...list[index], ...updated };
      onUpdateField('speakers', list);
    }
  };

  const handleAddSpeaker = () => {
    const list = [...(data.speakers || [])];
    list.push({
      id: `spk-${Date.now()}`,
      name: 'Guest Speaker',
      role: 'Industry Leader',
      company: 'Innovations Lab',
      topic: 'Strategic Transformation & Growth',
      photoUrl: '/assets/templates/royal-wedding-book/illustrations/reception.svg',
    });
    onUpdateField('speakers', list);
  };

  const handleRemoveSpeaker = (index: number) => {
    const list = [...(data.speakers || [])];
    list.splice(index, 1);
    onUpdateField('speakers', list);
  };

  // Story Photo Gallery Helpers
  const handleUpdateStoryPhoto = (index: number, updated: Partial<StoryPhoto>) => {
    const list = [...(data.storyPhotos || [])];
    if (list[index]) {
      list[index] = { ...list[index], ...updated };
      onUpdateField('storyPhotos', list);
    }
  };

  const handleAddStoryPhoto = (customUrl?: string) => {
    const list = [...(data.storyPhotos || [])];
    const newIndex = list.length + 1;
    list.push({
      id: `st-${Date.now()}`,
      url: customUrl || '/assets/templates/royal-wedding-book/photos/couple-1.svg',
      title: `स्मृति प्रसंग #${newIndex}`,
      caption: 'प्यार व अपनेपन के सुंदर पल।',
    });
    onUpdateField('storyPhotos', list);
  };

  const handleRemoveStoryPhoto = (index: number) => {
    const list = [...(data.storyPhotos || [])];
    list.splice(index, 1);
    onUpdateField('storyPhotos', list);
  };

  const handleUploadStoryPhoto = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        handleUpdateStoryPhoto(index, { url: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadNewPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        handleAddStoryPhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Music & Soundtrack Helpers
  const handleUploadAudio = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const customMusic = {
          enabled: true,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Custom Couple Track',
          type: 'mp3' as const,
          url: dataUrl,
        };
        onUpdateField('music', customMusic);
        weddingMusic.play(customMusic);
        setIsPreviewPlaying(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleAudioPreview = () => {
    const playing = weddingMusic.toggle(data.music);
    setIsPreviewPlaying(playing);
  };

  // Category-specific presets for Cover Title
  const getCoverTitlePresets = () => {
    switch (data.category) {
      case 'birthday':
        return ['SURPRISE GIFT BOX', 'Happy Birthday!', "Aarav's 7th Birthday", 'Space Mission 🚀'];
      case 'corporate':
        return ['VIP DELEGATE PASS', 'Global Tech Summit 2027', 'Executive Leadership Pass', 'Symposium 2027'];
      case 'custom':
        return ['शुभ गृहप्रवेश', 'सिल्वर जुबली (25 वर्ष)', 'Auspicious Milestone', 'आनंद उत्सव'];
      case 'wedding':
      default:
        return ['शुभ विवाह', 'मंगल परिणय', 'Royal Wedding Book', 'स्नेहिल आमंत्रण'];
    }
  };

  // Category-specific presets for Opening Blessing
  const getBlessingPresets = () => {
    switch (data.category) {
      case 'birthday':
        return ['Blast Off into Fun! 🚀', 'Happy Birthday!', 'Hip Hip Hurray! 🎉', "You're Invited!"];
      case 'corporate':
        return ['Official Delegate Invitation', 'Executive Summit Access', 'VIP Invitation', 'Welcome to Summit'];
      case 'custom':
        return ['॥ ॐ नमो भगवते वासुदेवाय नमः ॥', '॥ श्री गणेशाय नमः ॥', 'स्नेहिल आमंत्रण', 'शुभ गृहप्रवेश'];
      case 'wedding':
      default:
        return ['॥ श्री गणेशाय नमः ॥', 'स्नेहिल आमंत्रण', 'मंगल परिणय', '॥ ॐ श्री गणेशाय नमः ॥'];
    }
  };

  return (
    <aside className="w-full md:w-80 bg-white border-l border-[#e8decb] flex flex-col h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-[#e8decb] flex items-center justify-between bg-[#faf7f2]/60">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#6e1f2f]" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider font-cinzel text-[#6e1f2f]">
              {selectedElement ? t.selectedElement : t.styleTab}
            </h3>
            <p className="text-[10px] text-[#7d6a58] font-sans">
              {selectedElement ? selectedElement.label : 'Style, Fonts & RSVP'}
            </p>
          </div>
        </div>
        {selectedElement && (
          <button
            onClick={onClearSelection}
            className="text-[11px] font-sans text-[#852b3d] hover:underline"
          >
            {t.close}
          </button>
        )}
      </div>

      <div className="p-4 space-y-5 flex-1 text-xs">
        {/* ============================================================== */}
        {/* 1. IF AN ELEMENT IS SELECTED FOR DIRECT EDITING */}
        {/* ============================================================== */}
        {selectedElement ? (
          <div className="space-y-4">
            <div className="p-2.5 rounded-lg bg-[#faf7f2] border border-[#e8decb]">
              <span className="text-[10px] font-cinzel uppercase text-[#852b3d] font-bold block mb-1">
                Active Field:
              </span>
              <p className="text-xs font-heading font-semibold text-[#2c2523]">
                {selectedElement.label}
              </p>
            </div>

            {/* A. COVER TITLE & SUBTITLE */}
            {(selectedElement.fieldKey === 'coverTitle' ||
              selectedElement.fieldKey === 'coverSubtitle' ||
              selectedElement.fieldKey === 'title' ||
              selectedElement.fieldKey === 'subtitle') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Cover Title (कवर शीर्षक):
                  </label>
                  <input
                    type="text"
                    value={data.coverTitle || data.title}
                    onChange={(e) => {
                      onUpdateField('coverTitle', e.target.value);
                      if (!data.title) onUpdateField('title', e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#e8decb] focus:ring-2 focus:ring-[#c99a3e] outline-none font-bold"
                    placeholder="e.g. शुभ विवाह or SURPRISE GIFT BOX"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {getCoverTitlePresets().map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onUpdateField('coverTitle', preset)}
                        className="text-[10px] px-2 py-1 rounded bg-[#faf7f2] hover:bg-[#f2ede4] border border-[#e8decb] text-[#6e1f2f]"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Cover Subtitle (उपशीर्षक):
                  </label>
                  <input
                    type="text"
                    value={data.coverSubtitle || data.subtitle}
                    onChange={(e) => onUpdateField('coverSubtitle', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#e8decb] outline-none"
                    placeholder="e.g. ROYAL WEDDING INVITATION"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Cover Button Text (बटन टेक्स्ट):
                  </label>
                  <input
                    type="text"
                    value={data.coverButtonText}
                    onChange={(e) => onUpdateField('coverButtonText', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#e8decb] outline-none"
                  />
                </div>
              </div>
            )}

            {/* B. OPENING BLESSING / GREETING */}
            {selectedElement.fieldKey === 'openingBlessing' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Opening Line / Blessing (मंगलाचरण):
                  </label>
                  <input
                    type="text"
                    value={data.openingBlessing}
                    onChange={(e) => onUpdateField('openingBlessing', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#e8decb] focus:ring-2 focus:ring-[#c99a3e] outline-none font-devanagari"
                    placeholder="e.g. ॥ श्री गणेशाय नमः ॥ or स्नेहिल आमंत्रण"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {getBlessingPresets().map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onUpdateField('openingBlessing', preset)}
                        className="text-[10px] px-2 py-1 rounded bg-[#faf7f2] hover:bg-[#f2ede4] border border-[#e8decb] text-[#6e1f2f]"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Selector */}
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    {t.font}:
                  </label>
                  <select
                    value={data.openingBlessingFont || 'Noto Serif Devanagari'}
                    onChange={(e) => onUpdateField('openingBlessingFont', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e8decb] bg-white outline-none"
                  >
                    {DESIGN_TOKENS.fontOptions.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-[#2c2523]">
                      {t.fontSize}:
                    </label>
                    <span className="text-xs font-bold text-[#6e1f2f]">
                      {data.openingBlessingSize || 22}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="36"
                    value={data.openingBlessingSize || 22}
                    onChange={(e) => onUpdateField('openingBlessingSize', Number(e.target.value))}
                    className="w-full accent-[#6e1f2f]"
                  />
                </div>

                {/* Font Color */}
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1.5">
                    {t.color}:
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={data.openingBlessingColor || '#c99a3e'}
                      onChange={(e) => onUpdateField('openingBlessingColor', e.target.value)}
                      className="w-8 h-8 rounded border border-[#e8decb] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.openingBlessingColor || '#c99a3e'}
                      onChange={(e) => onUpdateField('openingBlessingColor', e.target.value)}
                      className="w-24 px-2 py-1 text-xs border border-[#e8decb] rounded font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['#c99a3e', '#dfba6a', '#ffd166', '#6e1f2f', '#1b4332', '#0f172a'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateField('openingBlessingColor', c)}
                        className="w-6 h-6 rounded-full border border-stone-300 shadow-xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* C. CELEBRANT, COUPLE OR HOST NAMES */}
            {(selectedElement.fieldKey === 'celebrantOrCouple' ||
              selectedElement.fieldKey === 'groomName' ||
              selectedElement.fieldKey === 'brideName') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Primary Celebrant / Title:
                  </label>
                  <input
                    type="text"
                    value={data.celebrantOrCouple}
                    onChange={(e) => onUpdateField('celebrantOrCouple', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#e8decb] focus:ring-2 focus:ring-[#c99a3e] outline-none font-heading"
                  />
                </div>

                {data.category === 'birthday' && (
                  <div>
                    <label className="block text-xs font-medium text-[#2c2523] mb-1">
                      Age (उम्र):
                    </label>
                    <input
                      type="number"
                      value={data.celebrantAge || 7}
                      onChange={(e) => onUpdateField('celebrantAge', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#e8decb] text-xs"
                    />
                  </div>
                )}

                {data.category === 'wedding' && (
                  <>
                    <div className="pt-2 border-t border-[#e8decb]">
                      <label className="block text-xs font-medium text-[#2c2523] mb-1">
                        Groom Name (वर):
                      </label>
                      <input
                        type="text"
                        value={data.groomName || ''}
                        onChange={(e) => onUpdateField('groomName', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-[#e8decb]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#2c2523] mb-1">
                        Bride Name (वधू):
                      </label>
                      <input
                        type="text"
                        value={data.brideName || ''}
                        onChange={(e) => onUpdateField('brideName', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-[#e8decb]"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* D. INVITATION MESSAGE */}
            {selectedElement.fieldKey === 'invitationText' && (
              <div>
                <label className="block text-xs font-medium text-[#2c2523] mb-1">
                  Invitation Text:
                </label>
                <textarea
                  rows={4}
                  value={data.invitationText}
                  onChange={(e) => onUpdateField('invitationText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#e8decb] focus:ring-2 focus:ring-[#c99a3e] outline-none"
                />
              </div>
            )}

            {/* E. DATE, VENUE & LANDMARK */}
            {(selectedElement.fieldKey === 'eventDateFormatted' ||
              selectedElement.fieldKey === 'venueName' ||
              selectedElement.fieldKey === 'venueAddress' ||
              selectedElement.fieldKey === 'venueLandmark' ||
              selectedElement.fieldKey === 'onlineMeetingUrl') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Event Date (Display):
                  </label>
                  <input
                    type="text"
                    value={data.eventDateFormatted}
                    onChange={(e) => onUpdateField('eventDateFormatted', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e8decb] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Venue Name:
                  </label>
                  <input
                    type="text"
                    value={data.venueName}
                    onChange={(e) => onUpdateField('venueName', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e8decb] outline-none font-heading"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Full Venue Address:
                  </label>
                  <textarea
                    rows={3}
                    value={data.venueAddress}
                    onChange={(e) => onUpdateField('venueAddress', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e8decb] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Landmark / Caption (Optional):
                  </label>
                  <input
                    type="text"
                    value={data.venueLandmark || ''}
                    onChange={(e) => onUpdateField('venueLandmark', e.target.value)}
                    placeholder="e.g. Near Metro Station · Indiranagar"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e8decb] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Google Maps Link:
                  </label>
                  <input
                    type="url"
                    value={data.googleMapsUrl}
                    onChange={(e) => onUpdateField('googleMapsUrl', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e8decb] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Virtual Meeting / Stream Link (Optional):
                  </label>
                  <input
                    type="url"
                    value={data.onlineMeetingUrl || ''}
                    onChange={(e) => onUpdateField('onlineMeetingUrl', e.target.value)}
                    placeholder="https://meet.grandbandhan.com/..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e8decb] outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* F. WEDDING CEREMONIES */}
            {selectedElement.fieldKey === 'functions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6e1f2f]">
                    Ceremonies ({data.functions.length}):
                  </span>
                  <button
                    onClick={onAddFunction}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#6e1f2f] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ceremony</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {data.functions.map((fn) => (
                    <div
                      key={fn.id}
                      className="p-3 rounded-lg border border-[#e8decb] bg-[#faf7f2]/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={fn.hindiName || fn.name}
                          onChange={(e) =>
                            onUpdateFunction(fn.id, { hindiName: e.target.value, name: e.target.value })
                          }
                          className="font-bold text-xs bg-white px-2 py-1 rounded border border-[#e8decb] w-3/4"
                        />
                        <button
                          onClick={() => onRemoveFunction(fn.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={fn.dayDate}
                          onChange={(e) =>
                            onUpdateFunction(fn.id, { dayDate: e.target.value })
                          }
                          placeholder="Day & Date"
                          className="text-[11px] bg-white px-2 py-1 rounded border border-[#e8decb]"
                        />
                        <input
                          type="text"
                          value={fn.time}
                          onChange={(e) =>
                            onUpdateFunction(fn.id, { time: e.target.value })
                          }
                          placeholder="Time"
                          className="text-[11px] bg-white px-2 py-1 rounded border border-[#e8decb]"
                        />
                      </div>

                      <input
                        type="text"
                        value={fn.dressCode}
                        onChange={(e) =>
                          onUpdateFunction(fn.id, { dressCode: e.target.value })
                        }
                        placeholder="Dress Code"
                        className="w-full text-[11px] bg-white px-2 py-1 rounded border border-[#e8decb]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* G. BIRTHDAY ACTIVITIES OR CUSTOM RITUALS */}
            {selectedElement.fieldKey === 'activities' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6e1f2f]">
                    {data.category === 'birthday' ? 'Activities' : 'Program Items'} ({(data.activities || []).length}):
                  </span>
                  <button
                    onClick={handleAddActivity}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#6e1f2f] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{data.category === 'birthday' ? 'Add Activity' : 'Add Program Item'}</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {(data.activities || []).map((act, i) => (
                    <div
                      key={act.id || i}
                      className="p-3 rounded-lg border border-[#e8decb] bg-[#faf7f2]/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={act.title}
                          onChange={(e) => handleUpdateActivity(i, { title: e.target.value })}
                          className="font-bold text-xs bg-white px-2 py-1 rounded border border-[#e8decb] w-3/4"
                          placeholder="Activity Title"
                        />
                        <button
                          onClick={() => handleRemoveActivity(i)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={act.time}
                        onChange={(e) => handleUpdateActivity(i, { time: e.target.value })}
                        placeholder="Time (e.g. 05:00 PM)"
                        className="w-full text-[11px] bg-white px-2 py-1 rounded border border-[#e8decb]"
                      />

                      <textarea
                        rows={2}
                        value={act.description}
                        onChange={(e) => handleUpdateActivity(i, { description: e.target.value })}
                        placeholder="Description"
                        className="w-full text-[11px] bg-white px-2 py-1 rounded border border-[#e8decb]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* H. CORPORATE AGENDA SESSIONS */}
            {selectedElement.fieldKey === 'agenda' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0f172a]">
                    Agenda Sessions ({(data.agenda || []).length}):
                  </span>
                  <button
                    onClick={handleAddAgenda}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#c99a3e] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Session</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {(data.agenda || []).map((ag, i) => (
                    <div
                      key={ag.id || i}
                      className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={ag.title}
                          onChange={(e) => handleUpdateAgenda(i, { title: e.target.value })}
                          className="font-bold text-xs bg-white px-2 py-1 rounded border border-stone-200 w-3/4"
                          placeholder="Session Title"
                        />
                        <button
                          onClick={() => handleRemoveAgenda(i)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={ag.time}
                          onChange={(e) => handleUpdateAgenda(i, { time: e.target.value })}
                          placeholder="Time Window"
                          className="text-[11px] bg-white px-2 py-1 rounded border border-stone-200"
                        />
                        <input
                          type="text"
                          value={ag.locationOrRoom || ''}
                          onChange={(e) => handleUpdateAgenda(i, { locationOrRoom: e.target.value })}
                          placeholder="Hall / Room"
                          className="text-[11px] bg-white px-2 py-1 rounded border border-stone-200"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={ag.description}
                        onChange={(e) => handleUpdateAgenda(i, { description: e.target.value })}
                        placeholder="Session Details"
                        className="w-full text-[11px] bg-white px-2 py-1 rounded border border-stone-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* I. CORPORATE KEYNOTE SPEAKERS */}
            {selectedElement.fieldKey === 'speakers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0f172a]">
                    Keynote Speakers ({(data.speakers || []).length}):
                  </span>
                  <button
                    onClick={handleAddSpeaker}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#c99a3e] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Speaker</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {(data.speakers || []).map((spk, i) => (
                    <div
                      key={spk.id || i}
                      className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={spk.name}
                          onChange={(e) => handleUpdateSpeaker(i, { name: e.target.value })}
                          className="font-bold text-xs bg-white px-2 py-1 rounded border border-stone-200 w-3/4"
                          placeholder="Speaker Name"
                        />
                        <button
                          onClick={() => handleRemoveSpeaker(i)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={spk.role}
                          onChange={(e) => handleUpdateSpeaker(i, { role: e.target.value })}
                          placeholder="Role / Title"
                          className="text-[11px] bg-white px-2 py-1 rounded border border-stone-200"
                        />
                        <input
                          type="text"
                          value={spk.company}
                          onChange={(e) => handleUpdateSpeaker(i, { company: e.target.value })}
                          placeholder="Company"
                          className="text-[11px] bg-white px-2 py-1 rounded border border-stone-200"
                        />
                      </div>

                      <input
                        type="text"
                        value={spk.topic}
                        onChange={(e) => handleUpdateSpeaker(i, { topic: e.target.value })}
                        placeholder="Keynote Topic"
                        className="w-full text-[11px] bg-white px-2 py-1 rounded border border-stone-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* J. STORY PHOTOS / PHOTO GALLERY */}
            {selectedElement.fieldKey === 'storyPhotos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6e1f2f]">
                    Couple Story Photos ({(data.storyPhotos || []).length}):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#c99a3e] hover:underline"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadNewPhoto(file);
                        e.target.value = '';
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {(data.storyPhotos || []).map((photo, i) => (
                    <div
                      key={photo.id || i}
                      className="p-3 rounded-xl border border-[#e8decb] bg-[#faf7f2]/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#852b3d] font-cinzel">
                          PHOTO #{i + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveStoryPhoto(i)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Photo Thumbnail + Replace File */}
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#dfba6a] bg-stone-100 shrink-0 shadow-xs">
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#dfba6a] text-[11px] font-medium text-[#6e1f2f] hover:bg-[#f5ede0] transition-all">
                            <Upload className="w-3 h-3 text-[#c99a3e]" />
                            <span>Replace Photo File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadStoryPhoto(i, file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <p className="text-[9px] text-stone-500">
                            Live preview on card
                          </p>
                        </div>
                      </div>

                      {/* Title & Caption */}
                      <div>
                        <label className="block text-[10px] font-medium text-stone-600 mb-0.5">
                          Photo Title / Milestone:
                        </label>
                        <input
                          type="text"
                          value={photo.title}
                          onChange={(e) => handleUpdateStoryPhoto(i, { title: e.target.value })}
                          placeholder="e.g. First Meeting · 2022"
                          className="w-full text-xs bg-white px-2.5 py-1 rounded-lg border border-[#e8decb] font-medium outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-stone-600 mb-0.5">
                          Story Caption / Romantic Note:
                        </label>
                        <textarea
                          rows={2}
                          value={photo.caption}
                          onChange={(e) => handleUpdateStoryPhoto(i, { caption: e.target.value })}
                          placeholder="Brief memory caption..."
                          className="w-full text-[11px] bg-white px-2.5 py-1 rounded-lg border border-[#e8decb] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* 2. GLOBAL THEME, INDEPENDENT INVITATION LANGUAGE & RSVP */
          /* ============================================================== */
          <div className="space-y-5">
            {/* Click to edit helper banner */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-left">
              <span className="text-xs font-bold text-amber-900 block mb-0.5">
                💡 Direct Editing Active
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                Click any title, greeting, ceremony, or address directly on the live card to customize its wording and styling.
              </p>
            </div>

            {/* Independent Invitation Language Control */}
            <div className="p-3 rounded-xl bg-white border border-[#e8decb] shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6e1f2f]">
                <Globe className="w-4 h-4 text-[#c99a3e]" />
                <span>Invitation Content Language:</span>
              </div>
              <p className="text-[10px] text-stone-500 font-sans leading-normal">
                Choose the language of your written invitation card (independent of your Studio interface language).
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['en', 'hi', 'bilingual'] as InvitationLanguage[]).map((ilang) => (
                  <button
                    key={ilang}
                    type="button"
                    onClick={() => onUpdateField('invitationLanguage', ilang)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      data.invitationLanguage === ilang
                        ? 'bg-[#6e1f2f] text-white border-[#6e1f2f] shadow-xs'
                        : 'bg-[#faf7f2] text-stone-700 border-[#e8decb] hover:bg-[#f2ede4]'
                    }`}
                  >
                    {ilang === 'en' ? 'English' : ilang === 'hi' ? 'हिन्दी' : 'Bilingual'}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Presets Palette */}
            <div>
              <span className="text-xs font-bold text-[#6e1f2f] block mb-2 font-cinzel">
                Theme Color Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Royal Wine & Gold', cover: '#6e1f2f', accent: '#dfba6a', paper: '#faf7f2' },
                  { name: 'Emerald & Ivory', cover: '#1b4332', accent: '#ecd599', paper: '#fbf9f4' },
                  { name: 'Cosmic Space Navy', cover: '#1d3557', accent: '#ffd166', paper: '#fdfbf7' },
                  { name: 'Executive Slate', cover: '#0f172a', accent: '#c99a3e', paper: '#f8fafc' },
                ].map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      onUpdateTheme('coverColor', p.cover);
                      onUpdateTheme('coverAccentColor', p.accent);
                      onUpdateTheme('paperColor', p.paper);
                    }}
                    className="p-2 rounded-lg border border-[#e8decb] bg-white hover:shadow-sm text-left flex items-center gap-2 transition-all"
                    aria-label={`Select ${p.name} theme`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-stone-200 shrink-0"
                      style={{ backgroundColor: p.cover }}
                    />
                    <span className="text-[10px] font-medium text-stone-700 truncate">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Special Effects (कार्ड स्पेशल इफेक्ट्स) */}
            <div className="p-3.5 rounded-xl bg-white border border-[#e8decb] shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#dfba6a]/20 border border-[#dfba6a] flex items-center justify-center text-[#6e1f2f]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#6e1f2f] block leading-tight font-cinzel">
                    Card Visual Effects:
                  </span>
                  <span className="text-[10px] text-stone-500 font-sans">
                    3D Parallax Tilt, Gold Foil & Ambient Petals
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-[#f2ede4] text-xs">
                {/* 1. Gold Foil Shimmer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">✨</span>
                    <span className="text-[11px] font-medium text-stone-700">Gold Foil Shimmer Sweep</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.theme.revealStyle !== 'fade'}
                    onChange={(e) => onUpdateTheme('revealStyle', e.target.checked ? 'bloom' : 'fade')}
                    className="w-4 h-4 accent-[#6e1f2f] rounded"
                  />
                </div>

                {/* 2. Animation Rhythm */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-stone-700">Animation Rhythm:</span>
                  <select
                    value={data.theme.animationSpeed || 'normal'}
                    onChange={(e) => onUpdateTheme('animationSpeed', e.target.value as any)}
                    className="text-[11px] bg-[#faf7f2] border border-[#e8decb] rounded-lg px-2 py-0.5 outline-none font-sans"
                  >
                    <option value="slow">Royal Slow (धीमी)</option>
                    <option value="normal">Normal (सामान्य)</option>
                    <option value="fast">Swift (तेज़)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Guest RSVP Settings */}
            <div className="p-3 rounded-xl bg-white border border-[#e8decb] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6e1f2f]">
                  Guest RSVP Enabled:
                </span>
                <input
                  type="checkbox"
                  checked={data.rsvp?.enabled ?? true}
                  onChange={(e) =>
                    onUpdateField('rsvp', { ...data.rsvp, enabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#6e1f2f] rounded"
                />
              </div>

              {data.rsvp?.enabled && (
                <div className="space-y-2.5 pt-2 border-t border-[#e8decb]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-700">Allow Party Size:</span>
                    <input
                      type="checkbox"
                      checked={data.rsvp?.allowPartySize ?? true}
                      onChange={(e) =>
                        onUpdateField('rsvp', {
                          ...data.rsvp,
                          allowPartySize: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#6e1f2f] rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">
                      RSVP Deadline:
                    </label>
                    <input
                      type="text"
                      value={data.rsvp?.deadlineFormatted || 'Prior to event'}
                      onChange={(e) =>
                        onUpdateField('rsvp', {
                          ...data.rsvp,
                          deadlineFormatted: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1 text-xs rounded border border-[#e8decb]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Wedding Soundtrack & Ambient Audio Manager */}
            <div className="p-3.5 rounded-xl bg-white border border-[#e8decb] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#dfba6a]/20 border border-[#dfba6a] flex items-center justify-center text-[#6e1f2f]">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6e1f2f] block leading-tight font-cinzel">
                      Wedding Soundtrack:
                    </span>
                    <span className="text-[10px] text-stone-500 font-sans truncate max-w-[150px] block">
                      {data.music?.title || 'Royal Shehnai Flute'}
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={data.music?.enabled ?? true}
                  onChange={(e) => {
                    const updated = { ...data.music, enabled: e.target.checked };
                    onUpdateField('music', updated);
                    if (!e.target.checked) {
                      weddingMusic.stop();
                      setIsPreviewPlaying(false);
                    }
                  }}
                  className="w-4 h-4 accent-[#6e1f2f] rounded"
                  title="Toggle music on/off"
                />
              </div>

              {data.music?.enabled && (
                <div className="space-y-2.5 pt-2 border-t border-[#f2ede4]">
                  {/* Soundtrack Presets */}
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">
                      Soundtrack Presets:
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        {
                          name: 'शाही शहनाई व बांसुरी (Royal Flute Synth)',
                          type: 'synth' as const,
                          url: '',
                          desc: 'Zero-lag classical flute melody in Raga Bhupali',
                        },
                        {
                          name: 'मांगलिक शहनाई (Auspicious Shehnai Bells)',
                          type: 'mp3' as const,
                          url: 'https://assets.mixkit.co/music/preview/mixkit-indian-traditional-sitar-694.mp3',
                          desc: 'Rich ceremonial Shehnai & temple bells',
                        },
                        {
                          name: 'जश्न व ढोलक (Celebration Sitar Beats)',
                          type: 'mp3' as const,
                          url: 'https://assets.mixkit.co/music/preview/mixkit-bollywood-nights-242.mp3',
                          desc: 'Festive wedding celebration rhythm',
                        },
                      ].map((track) => (
                        <button
                          key={track.name}
                          type="button"
                          onClick={() => {
                            const newMusic = {
                              enabled: true,
                              title: track.name,
                              artist: 'Grand Bandhan Studio Ensemble',
                              type: track.type,
                              url: track.url,
                            };
                            onUpdateField('music', newMusic);
                            if (isPreviewPlaying) {
                              weddingMusic.play(newMusic);
                            }
                          }}
                          className={`p-2 rounded-lg text-left border transition-all text-xs flex flex-col ${
                            (data.music.type === track.type && (!track.url || data.music.url === track.url))
                              ? 'bg-[#6e1f2f] text-white border-[#6e1f2f] shadow-xs'
                              : 'bg-[#faf7f2] text-stone-800 border-[#e8decb] hover:bg-[#f2ede4]'
                          }`}
                        >
                          <span className="font-semibold text-[11px]">{track.name}</span>
                          <span className="text-[9px] opacity-80">{track.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom MP3 File Uploader */}
                  <div className="pt-1">
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadAudio(file);
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-dashed border-[#c99a3e] bg-amber-50/50 hover:bg-amber-100/60 text-[#6e1f2f] text-xs font-semibold transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#c99a3e]" />
                      <span>Upload Custom Wedding MP3 / Song</span>
                    </button>
                    <p className="text-[9px] text-stone-500 mt-0.5 text-center">
                      Supports MP3, WAV, M4A · Stored durably for all guests
                    </p>
                  </div>

                  {/* Live Preview Button */}
                  <button
                    type="button"
                    onClick={toggleAudioPreview}
                    className={`w-full py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                      isPreviewPlaying
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-[#faf7f2] border border-[#dfba6a] text-[#6e1f2f] hover:bg-[#f2ede4]'
                    }`}
                  >
                    {isPreviewPlaying ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop Sound Preview</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current text-[#dfba6a]" />
                        <span>Preview Sound Track</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Couple Story / Photo Gallery Quick Card */}
            <div className="p-3.5 rounded-xl bg-white border border-[#e8decb] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#dfba6a]/20 border border-[#dfba6a] flex items-center justify-center text-[#6e1f2f]">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6e1f2f] block leading-tight font-cinzel">
                      Couple Photo Gallery:
                    </span>
                    <span className="text-[10px] text-stone-500 font-sans">
                      {(data.storyPhotos || []).length} Memories in 3D Album
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="p-1.5 rounded-lg bg-[#faf7f2] border border-[#dfba6a] text-[#6e1f2f] hover:bg-[#f2ede4]"
                  title="Upload photo"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Photo Mini Thumbnails Row */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {(data.storyPhotos || []).map((photo, i) => (
                  <div
                    key={photo.id || i}
                    className="w-12 h-12 rounded-lg border border-[#dfba6a] overflow-hidden shrink-0 relative group bg-stone-100 shadow-2xs"
                  >
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-12 h-12 rounded-lg border border-dashed border-[#dfba6a] flex flex-col items-center justify-center text-stone-400 hover:text-[#6e1f2f] hover:border-[#6e1f2f] shrink-0 text-[9px]"
                >
                  <Upload className="w-3.5 h-3.5 mb-0.5" />
                  <span>Upload</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
