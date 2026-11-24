import React, { useState, useEffect, useRef } from 'react';
import { InvitationDraft, GenericInvitationData, SceneId, SelectedElement, CeremonyFunction } from '../types/invitation';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { SceneListPanel } from '../components/editor/SceneListPanel';
import { PropertiesPanel } from '../components/editor/PropertiesPanel';
import { AiAssistantPanel } from '../components/editor/AiAssistantPanel';
import { InvitationPlayer } from '../components/invitation/InvitationPlayer';
import { saveDraft, resetDraftToDefault, exportDraftAsJson, parseImportedJson, publishDraft, getUserAccount, checkCanPublish, UserAccount } from '../services/storage';
import { UpgradeModal } from '../components/subscription/UpgradeModal';
import { Layers, Sliders, Bot, Smartphone, Monitor, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { useLanguage } from '../locales';

interface StudioProps {
  initialDraft: InvitationDraft;
  onBackToGallery: () => void;
  onOpenGuestPreview: (draft: InvitationDraft) => void;
  onOpenDashboard?: () => void;
}

export const Studio: React.FC<StudioProps> = ({
  initialDraft,
  onBackToGallery,
  onOpenGuestPreview,
  onOpenDashboard,
}) => {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<InvitationDraft>(initialDraft);
  const [activeSceneId, setActiveSceneId] = useState<SceneId>(() => {
    if (initialDraft.scenes && initialDraft.scenes[0]) return initialDraft.scenes[0].id;
    return 'welcome';
  });
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'canvas' | 'scenes' | 'props' | 'ai'>('canvas');
  const [canvasViewMode, setCanvasViewMode] = useState<'mobile' | 'responsive'>('mobile');
  const [publishToast, setPublishToast] = useState<{ show: boolean; url: string } | null>(null);
  const [user, setUser] = useState<UserAccount>(() => getUserAccount());
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<InvitationDraft[]>([initialDraft]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const saveTimeoutRef = useRef<any>(null);

  // Sync if initialDraft changes externally
  useEffect(() => {
    setDraft(initialDraft);
    if (initialDraft.scenes && initialDraft.scenes[0]) {
      setActiveSceneId(initialDraft.scenes[0].id);
    }
  }, [initialDraft.id]);

  // Autosave when draft changes (debounced)
  const triggerAutosave = (newDraft: InvitationDraft) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      saveDraft(newDraft);
      setIsSaving(false);
    }, 600);
  };

  const updateDraftData = (updater: (prevData: GenericInvitationData) => GenericInvitationData) => {
    setDraft((prev) => {
      const updatedData = updater(prev.data);
      const nextDraft: InvitationDraft = {
        ...prev,
        lastModified: Date.now(),
        data: updatedData,
      };

      // Push to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(nextDraft);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      triggerAutosave(nextDraft);
      return nextDraft;
    });
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setDraft(prev);
      saveDraft(prev);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setDraft(next);
      saveDraft(next);
    }
  };

  // Direct canvas selection
  const handleSelectElement = (fieldKey: keyof GenericInvitationData, label: string) => {
    setSelectedElement({
      sceneId: activeSceneId,
      fieldKey,
      label,
      type: 'text',
    });
    if (window.innerWidth < 768) {
      setMobileTab('props');
    }
  };

  // Update specific field
  const handleUpdateField = (fieldKey: keyof GenericInvitationData, value: any) => {
    updateDraftData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  // Update theme settings
  const handleUpdateTheme = (themeKey: keyof GenericInvitationData['theme'], value: any) => {
    updateDraftData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [themeKey]: value,
      },
    }));
  };

  // Update ceremony function
  const handleUpdateFunction = (functionId: string, updatedFields: Partial<CeremonyFunction>) => {
    updateDraftData((prev) => ({
      ...prev,
      functions: prev.functions.map((fn) =>
        fn.id === functionId ? { ...fn, ...updatedFields } : fn
      ),
    }));
  };

  // Add ceremony function
  const handleAddFunction = () => {
    const newFn: CeremonyFunction = {
      id: `fn-${Date.now()}`,
      name: 'Special Celebration',
      hindiName: 'शुभ उत्सव',
      dayDate: draft.data.eventDateFormatted || 'Saturday, Feb 13, 2027',
      time: '06:00 PM onwards',
      venue: draft.data.venueName,
      dressCode: 'Festive Attire',
      dressColor: 'Gold',
      colorHex: '#dfba6a',
      icon: 'Sparkles',
      illustration: '/assets/templates/royal-wedding-book/illustrations/sangeet.svg',
    };
    updateDraftData((prev) => ({
      ...prev,
      functions: [...(prev.functions || []), newFn],
    }));
    setActiveSceneId('festivities');
  };

  // Remove ceremony function
  const handleRemoveFunction = (functionId: string) => {
    updateDraftData((prev) => ({
      ...prev,
      functions: prev.functions.filter((fn) => fn.id !== functionId),
    }));
  };

  // Toggle scene visibility
  const handleToggleSceneVisibility = (id: SceneId) => {
    setDraft((prev) => {
      const nextScenes = prev.scenes.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      );
      const nextDraft = { ...prev, scenes: nextScenes };
      triggerAutosave(nextDraft);
      return nextDraft;
    });
  };

  // Move scene up or down
  const handleMoveScene = (id: SceneId, direction: 'up' | 'down') => {
    setDraft((prev) => {
      const sorted = [...prev.scenes].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx === -1) return prev;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;

      const tempOrder = sorted[idx].order;
      sorted[idx].order = sorted[targetIdx].order;
      sorted[targetIdx].order = tempOrder;

      const nextDraft = { ...prev, scenes: sorted };
      triggerAutosave(nextDraft);
      return nextDraft;
    });
  };

  // Reset to default template
  const handleResetToDefault = () => {
    if (window.confirm(t.confirmResetTitle)) {
      const fresh = resetDraftToDefault();
      setDraft(fresh);
      setHistory([fresh]);
      setHistoryIndex(0);
    }
  };

  // Publish invitation
  const handlePublish = () => {
    const check = checkCanPublish(draft.id);
    if (!check.allowed) {
      setIsUpgradeModalOpen(true);
      return;
    }
    const published = publishDraft(draft);
    setDraft({ ...published });
    const liveUrl = `${window.location.origin}/i/${published.slug}`;
    setPublishToast({ show: true, url: liveUrl });
    setTimeout(() => {
      setPublishToast(null);
    }, 6000);
  };

  // Import JSON
  const handleImportJson = (jsonString: string) => {
    try {
      const imported = parseImportedJson(jsonString);
      setDraft(imported);
      setHistory([imported]);
      setHistoryIndex(0);
      alert('Draft imported successfully!');
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f7f4ee] overflow-hidden select-none">
      {/* Top Toolbar */}
      <EditorToolbar
        draft={draft}
        isSaving={isSaving}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        tier={user.tier}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onBack={onBackToGallery}
        onOpenPreview={() => onOpenGuestPreview(draft)}
        onPublish={handlePublish}
        onOpenDashboard={onOpenDashboard}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onExport={() => exportDraftAsJson(draft)}
        onImport={handleImportJson}
        onReset={handleResetToDefault}
      />

      {/* Publish Toast Notification */}
      {publishToast && (
        <div className="fixed top-14 right-4 z-50 bg-emerald-900 text-white p-3.5 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-fade-in max-w-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-emerald-200">
              {draft.isPublished ? 'Invitation Published Live!' : 'Changes Published!'}
            </span>
            <span className="text-[11px] text-white/80 font-mono truncate block max-w-[220px]">
              {publishToast.url}
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(publishToast.url);
                alert('Guest link copied to clipboard!');
              }}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
              title="Copy Link"
            >
              <Copy className="w-3.5 h-3.5 text-[#ffd166]" />
            </button>
            <a
              href={`/i/${draft.slug}`}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
              title="Open Link"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ffd166]" />
            </a>
          </div>
        </div>
      )}

      {/* Main Studio Body: 3-column on Desktop */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Scene List (Desktop only) */}
        <div className="hidden md:block h-full">
          <SceneListPanel
            scenes={draft.scenes}
            activeSceneId={activeSceneId}
            onSelectScene={(id) => {
              setActiveSceneId(id);
              setSelectedElement(null);
            }}
            onToggleVisibility={handleToggleSceneVisibility}
            onMoveScene={handleMoveScene}
            onAddCustomFunction={handleAddFunction}
          />
        </div>

        {/* Center Column: Live Invitation Canvas */}
        <main className="flex-1 flex flex-col h-full bg-[#f2ede4] overflow-y-auto relative p-3 sm:p-6 items-center">
          {/* Canvas Viewport Controls */}
          <div className="w-full max-w-sm mb-3 flex items-center justify-between text-xs text-[#7d6a58] px-1">
            <span className="text-[11px] font-sans font-medium text-stone-700 bg-white/90 px-3 py-1 rounded-full border border-[#e8decb] shadow-xs">
              💡 {t.clickToEditHint}
            </span>
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-[#e8decb] shadow-xs">
              <button
                onClick={() => setCanvasViewMode('mobile')}
                className={`p-1 rounded ${
                  canvasViewMode === 'mobile'
                    ? 'bg-[#6e1f2f] text-white'
                    : 'text-[#7d6a58] hover:bg-[#faf7f2]'
                }`}
                title={t.canvasMobileView}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCanvasViewMode('responsive')}
                className={`p-1 rounded ${
                  canvasViewMode === 'responsive'
                    ? 'bg-[#6e1f2f] text-white'
                    : 'text-[#7d6a58] hover:bg-[#faf7f2]'
                }`}
                title={t.canvasResponsiveView}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Invitation Canvas Shell */}
          <div
            className={`w-full transition-all duration-300 flex justify-center ${
              canvasViewMode === 'mobile' ? 'max-w-[380px]' : 'max-w-md'
            }`}
          >
            <InvitationPlayer
              data={draft.data}
              scenes={draft.scenes}
              mode="editor"
              activeSceneId={activeSceneId}
              onSceneChange={(id) => setActiveSceneId(id)}
              onSelectElement={handleSelectElement}
              selectedKey={selectedElement?.fieldKey as string}
              onSelectFunction={(fn) => {
                setSelectedElement({
                  sceneId: 'festivities',
                  fieldKey: 'functions',
                  label: `Ceremony: ${fn.name}`,
                  type: 'functions',
                });
              }}
              slug={draft.slug}
            />
          </div>
        </main>

        {/* Right Column: Properties Panel & AI (Desktop) */}
        <div className="hidden lg:block h-full">
          {mobileTab === 'ai' ? (
            <AiAssistantPanel
              data={draft.data}
              onApplyChanges={(patch) => {
                updateDraftData((prev) => ({
                  ...prev,
                  ...patch,
                  theme: patch.theme ? { ...prev.theme, ...patch.theme } : prev.theme,
                }));
              }}
            />
          ) : (
            <PropertiesPanel
              data={draft.data}
              selectedElement={selectedElement}
              onUpdateField={handleUpdateField}
              onUpdateTheme={handleUpdateTheme}
              onUpdateFunction={handleUpdateFunction}
              onAddFunction={handleAddFunction}
              onRemoveFunction={handleRemoveFunction}
              onClearSelection={() => setSelectedElement(null)}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar & Drawer */}
      <div className="md:hidden bg-white border-t border-[#e8decb] z-50">
        <div className="grid grid-cols-4 py-2 px-1 text-center">
          <button
            onClick={() => setMobileTab('canvas')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium font-sans ${
              mobileTab === 'canvas' ? 'text-[#6e1f2f] font-bold' : 'text-[#7d6a58]'
            }`}
          >
            <Smartphone className="w-4 h-4 mb-0.5" />
            <span>Canvas</span>
          </button>

          <button
            onClick={() => setMobileTab('scenes')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium font-sans ${
              mobileTab === 'scenes' ? 'text-[#6e1f2f] font-bold' : 'text-[#7d6a58]'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span>{t.scenesTab}</span>
          </button>

          <button
            onClick={() => setMobileTab('props')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium font-sans ${
              mobileTab === 'props' ? 'text-[#6e1f2f] font-bold' : 'text-[#7d6a58]'
            }`}
          >
            <Sliders className="w-4 h-4 mb-0.5" />
            <span>{t.styleTab}</span>
          </button>

          <button
            onClick={() => setMobileTab('ai')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium font-sans ${
              mobileTab === 'ai' ? 'text-[#6e1f2f] font-bold' : 'text-[#7d6a58]'
            }`}
          >
            <Bot className="w-4 h-4 mb-0.5" />
            <span>{t.aiTab}</span>
          </button>
        </div>

        {/* Mobile Slide-up Drawer for Scenes / Props / AI */}
        {mobileTab !== 'canvas' && (
          <div className="fixed inset-x-0 bottom-14 top-16 bg-white z-40 overflow-y-auto p-2 border-t-2 border-[#6e1f2f] shadow-2xl">
            <div className="flex justify-between items-center p-2 mb-2 border-b border-[#e8decb]">
              <span className="font-heading font-bold text-xs text-[#6e1f2f]">
                {mobileTab === 'scenes'
                  ? t.scenesTab
                  : mobileTab === 'props'
                  ? t.styleTab
                  : t.aiTab}
              </span>
              <button
                onClick={() => setMobileTab('canvas')}
                className="text-xs px-2.5 py-1 rounded bg-[#faf7f2] border border-[#e8decb] text-[#6e1f2f]"
              >
                ✕ Close
              </button>
            </div>

            {mobileTab === 'scenes' && (
              <SceneListPanel
                scenes={draft.scenes}
                activeSceneId={activeSceneId}
                onSelectScene={(id) => {
                  setActiveSceneId(id);
                  setMobileTab('canvas');
                }}
                onToggleVisibility={handleToggleSceneVisibility}
                onMoveScene={handleMoveScene}
                onAddCustomFunction={handleAddFunction}
              />
            )}

            {mobileTab === 'props' && (
              <PropertiesPanel
                data={draft.data}
                selectedElement={selectedElement}
                onUpdateField={handleUpdateField}
                onUpdateTheme={handleUpdateTheme}
                onUpdateFunction={handleUpdateFunction}
                onAddFunction={handleAddFunction}
                onRemoveFunction={handleRemoveFunction}
                onClearSelection={() => setSelectedElement(null)}
              />
            )}

            {mobileTab === 'ai' && (
              <AiAssistantPanel
                data={draft.data}
                onApplyChanges={(patch) => {
                  updateDraftData((prev) => ({
                    ...prev,
                    ...patch,
                    theme: patch.theme ? { ...prev.theme, ...patch.theme } : prev.theme,
                  }));
                  setMobileTab('canvas');
                }}
              />
            )}
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        user={user}
        onUpgraded={(updatedUser) => setUser(updatedUser)}
      />
    </div>
  );
};
