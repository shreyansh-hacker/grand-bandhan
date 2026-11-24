import React from 'react';
import { GenericInvitationData, CeremonyFunction, SelectedElement, InvitationLanguage } from '../../types/invitation';
import { DESIGN_TOKENS } from '../../styles/tokens';
import { Sparkles, Sliders, Trash2, Plus, Globe, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../locales';

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
  const { t } = useLanguage();

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
              {selectedElement ? selectedElement.label : 'Style & Settings'}
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
        {/* 1. If an Element is Selected */}
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

            {/* A. Opening Blessing / Greeting */}
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
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#e8decb] focus:ring-2 focus:ring-[#c99a3e] outline-none"
                    placeholder="e.g. ॥ श्री गणेशाय नमः ॥ or स्नेहिल आमंत्रण"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['॥ श्री गणेशाय नमः ॥', 'स्नेहिल आमंत्रण', 'मंगल परिणय', 'Blast Off! 🚀', 'VIP Pass'].map((preset) => (
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

            {/* B. Celebrant, Couple or Host Names */}
            {(selectedElement.fieldKey === 'celebrantOrCouple' ||
              selectedElement.fieldKey === 'groomName' ||
              selectedElement.fieldKey === 'brideName') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#2c2523] mb-1">
                    Primary Name / Celebrant:
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
                        Groom Name:
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
                        Bride Name:
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

            {/* C. Invitation Message */}
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

            {/* D. Date & Venue */}
            {(selectedElement.fieldKey === 'eventDateFormatted' ||
              selectedElement.fieldKey === 'venueName' ||
              selectedElement.fieldKey === 'venueAddress') && (
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
                    Google Maps Link:
                  </label>
                  <input
                    type="url"
                    value={data.googleMapsUrl}
                    onChange={(e) => onUpdateField('googleMapsUrl', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e8decb] outline-none"
                  />
                </div>
              </div>
            )}

            {/* E. Ceremonies & Functions */}
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
                    {t.addFunction}
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
          </div>
        ) : (
          /* ============================================================== */
          /* 2. Global Theme, Language & RSVP Settings */
          /* ============================================================== */
          <div className="space-y-5">
            {/* Click to edit helper banner */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-left">
              <span className="text-xs font-bold text-amber-900 block mb-0.5">
                💡 Direct Interactive Canvas Editing:
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {t.clickToEditHint}
              </p>
            </div>

            {/* Independent Invitation Content Language Choice */}
            <div className="space-y-2">
              <span className="block text-xs font-cinzel font-bold text-[#6e1f2f] uppercase">
                {t.invitationLanguage}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['en', 'hi', 'bilingual'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onUpdateField('invitationLanguage', l)}
                    className={`py-1.5 text-xs rounded border transition-all ${
                      data.invitationLanguage === l
                        ? 'bg-[#6e1f2f] text-white border-[#6e1f2f] font-semibold'
                        : 'bg-white text-stone-700 border-[#e8decb] hover:bg-[#faf7f2]'
                    }`}
                  >
                    {l === 'en' ? t.langEnglish : l === 'hi' ? t.langHindi : 'Bilingual'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-500">
                Studio UI and Invitation copy are independent.
              </p>
            </div>

            {/* RSVP Settings */}
            <div className="space-y-3 pt-2 border-t border-[#e8decb]">
              <span className="block text-xs font-cinzel font-bold text-[#6e1f2f] uppercase">
                RSVP &amp; Guest Responses
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.rsvp?.enabled ?? true}
                  onChange={(e) =>
                    onUpdateField('rsvp', { ...data.rsvp, enabled: e.target.checked })
                  }
                  className="accent-[#6e1f2f]"
                />
                <span className="text-xs font-medium text-stone-800">
                  Enable RSVP form on invitation
                </span>
              </label>

              {data.rsvp?.enabled && (
                <div className="space-y-2 pl-4 border-l-2 border-[#dfba6a]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.rsvp.allowPartySize}
                      onChange={(e) =>
                        onUpdateField('rsvp', { ...data.rsvp, allowPartySize: e.target.checked })
                      }
                      className="accent-[#6e1f2f]"
                    />
                    <span className="text-[11px] text-stone-700">Allow specifying guest count</span>
                  </label>

                  <div>
                    <label className="block text-[11px] text-stone-600 mb-0.5">RSVP Deadline:</label>
                    <input
                      type="text"
                      value={data.rsvp.deadlineFormatted || ''}
                      onChange={(e) =>
                        onUpdateField('rsvp', { ...data.rsvp, deadlineFormatted: e.target.value })
                      }
                      placeholder="e.g. Feb 05, 2027"
                      className="w-full px-2 py-1 text-xs rounded border border-stone-300"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Color Palette Presets */}
            <div className="space-y-2 pt-2 border-t border-[#e8decb]">
              <span className="block text-xs font-cinzel font-bold text-[#6e1f2f] uppercase">
                Royal Color Presets
              </span>
              <div className="space-y-1.5">
                {DESIGN_TOKENS.presetPalettes.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      onUpdateTheme('coverColor', p.cover);
                      onUpdateTheme('coverAccentColor', p.accent);
                      onUpdateTheme('paperColor', p.paper);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-[#e8decb] hover:bg-[#faf7f2] transition-all text-left"
                  >
                    <span className="text-xs font-medium text-[#2c2523] truncate max-w-[180px]">
                      {p.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: p.cover }} />
                      <div className="w-4 h-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: p.accent }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Theme Colors */}
            <div className="space-y-3 pt-2 border-t border-[#e8decb]">
              <span className="block text-xs font-cinzel font-bold text-[#6e1f2f] uppercase">
                Custom Colors
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#2c2523]">Primary Cover Color:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={data.theme.coverColor}
                    onChange={(e) => onUpdateTheme('coverColor', e.target.value)}
                    className="w-7 h-7 rounded border border-[#e8decb] cursor-pointer"
                  />
                  <span className="text-[10px] font-mono">{data.theme.coverColor}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#2c2523]">Accent Gold / Ribbon:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={data.theme.coverAccentColor}
                    onChange={(e) => onUpdateTheme('coverAccentColor', e.target.value)}
                    className="w-7 h-7 rounded border border-[#e8decb] cursor-pointer"
                  />
                  <span className="text-[10px] font-mono">{data.theme.coverAccentColor}</span>
                </div>
              </div>
            </div>

            {/* Motion Speed */}
            <div className="space-y-2 pt-2 border-t border-[#e8decb]">
              <span className="block text-xs font-cinzel font-bold text-[#6e1f2f] uppercase">
                {t.speed}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['slow', 'normal', 'fast'] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onUpdateTheme('animationSpeed', spd)}
                    className={`py-1.5 text-xs rounded border transition-all ${
                      data.theme.animationSpeed === spd
                        ? 'bg-[#6e1f2f] text-white border-[#6e1f2f] font-semibold'
                        : 'bg-white text-[#2c2523] border-[#e8decb] hover:bg-[#faf7f2]'
                    }`}
                  >
                    {spd === 'slow' ? t.speedSlow : spd === 'normal' ? t.speedNormal : t.speedFast}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
