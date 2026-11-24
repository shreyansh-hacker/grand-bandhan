import React, { useRef, useState } from 'react';
import { InvitationDraft } from '../../types/invitation';
import {
  ArrowLeft,
  Check,
  Download,
  Eye,
  RotateCcw,
  RotateCw,
  Upload,
  RefreshCw,
  Send,
  LayoutDashboard,
  MoreVertical,
} from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../../locales';

interface EditorToolbarProps {
  draft: InvitationDraft;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onBack: () => void;
  onOpenPreview: () => void;
  onPublish: () => void;
  onOpenDashboard?: () => void;
  onExport: () => void;
  onImport: (jsonString: string) => void;
  onReset: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  draft,
  isSaving,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onBack,
  onOpenPreview,
  onPublish,
  onOpenDashboard,
  onExport,
  onImport,
  onReset,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) onImport(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-white border-b border-[#e8decb] px-3 sm:px-4 py-2 flex items-center justify-between gap-2 select-none shadow-xs sticky top-0 z-50">
      {/* Left: Back button & Draft Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#6e1f2f] hover:bg-[#faf7f2] border border-[#e8decb] active:scale-95 transition-all"
          title={t.returnToGallery}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t.returnToGallery}</span>
        </button>

        {onOpenDashboard && (
          <button
            onClick={onOpenDashboard}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-[#faf7f2] border border-[#e8decb] transition-all"
            title={t.dashboard}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#c99a3e]" />
            <span>{t.dashboard}</span>
          </button>
        )}

        <div className="h-5 w-[1px] bg-[#e8decb] hidden sm:block"></div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold font-heading text-[#2c2523] truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[240px]">
              {draft.name || t.myDraft}
            </h2>
            {draft.isPublished && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ● {t.publishedLive}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#7d6a58]">
            {isSaving ? (
              <span className="text-amber-600 font-sans">{t.savingStatus}</span>
            ) : (
              <>
                <Check className="w-3 h-3 text-emerald-600 inline" />
                <span className="text-emerald-700 font-sans font-medium">{t.savedStatus}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions: Switcher, Undo/Redo, Overflow Menu, Publish, Preview */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Language Switcher (Always visible down to 360px) */}
        <LanguageSwitcher />

        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-[#5c4f4a] hover:bg-[#faf7f2] disabled:opacity-25 disabled:pointer-events-none transition-all hidden xs:block"
          title={t.undo}
          aria-label={t.undo}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-[#5c4f4a] hover:bg-[#faf7f2] disabled:opacity-25 disabled:pointer-events-none transition-all hidden xs:block"
          title={t.redo}
          aria-label={t.redo}
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Overflow Menu: Backup / Import / Reset */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 rounded-lg text-stone-600 hover:bg-[#faf7f2] border border-[#e8decb] transition-all"
            title="More draft actions"
            aria-label="More draft actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-[#e8decb] py-1.5 z-50 text-xs">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onExport();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#faf7f2] text-stone-700 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-[#c99a3e]" />
                <span>{t.exportJson}</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  fileInputRef.current?.click();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#faf7f2] text-stone-700 font-medium"
              >
                <Upload className="w-3.5 h-3.5 text-[#c99a3e]" />
                <span>{t.importJson}</span>
              </button>

              <div className="my-1 border-t border-stone-100" />

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onReset();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-700 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.resetDefault}</span>
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Publish / Publish Update Button (Never truncated to "Pub") */}
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold shadow hover:bg-emerald-800 active:scale-95 transition-all"
          title={draft.isPublished ? t.publishUpdate : t.publish}
        >
          <Send className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>
            {draft.isPublished ? t.publishUpdate : t.publish}
          </span>
        </button>

        {/* Guest Preview Button with accessible name and visible label */}
        <button
          onClick={onOpenPreview}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#6e1f2f] text-[#dfba6a] text-xs font-bold shadow-md hover:bg-[#541421] active:scale-95 transition-all"
          title={t.guestPreview}
          aria-label={t.guestPreview}
        >
          <Eye className="w-4 h-4 text-[#dfba6a]" />
          <span className="hidden sm:inline">{t.guestPreview}</span>
        </button>
      </div>
    </header>
  );
};
