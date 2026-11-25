import React, { useState, useEffect } from 'react';
import { GenericInvitationData, SceneDefinition, SceneId } from '../../types/invitation';
import { CoverScene } from './CoverScene';
import { WelcomeScene } from './WelcomeScene';
import { SaveTheDateScene } from './SaveTheDateScene';
import { FestivitiesScene } from './FestivitiesScene';
import { StoryScene } from './StoryScene';
import { VenueScene } from './VenueScene';
import { ClosingScene } from './ClosingScene';
import { BirthdayBoxScene } from './BirthdayBoxScene';
import { CorporatePassScene } from './CorporatePassScene';
import { CustomArchScene } from './CustomArchScene';
import { BirthdayActivitiesScene } from './BirthdayActivitiesScene';
import { CorporateAgendaScene } from './CorporateAgendaScene';
import { CustomProgramScene } from './CustomProgramScene';
import { RsvpScene } from './RsvpScene';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { weddingMusic } from '../../services/sound';
import { CardEffectsLayer } from '../effects/CardEffectsLayer';

interface InvitationPlayerProps {
  data: GenericInvitationData;
  scenes: SceneDefinition[];
  mode: 'demo' | 'preview' | 'editor';
  activeSceneId?: SceneId;
  onSceneChange?: (sceneId: SceneId) => void;
  onSelectElement?: (fieldKey: keyof GenericInvitationData, label: string) => void;
  selectedKey?: string;
  onSelectFunction?: (fn: any) => void;
  slug?: string;
}

export const InvitationPlayer: React.FC<InvitationPlayerProps> = ({
  data,
  scenes,
  mode,
  activeSceneId,
  onSceneChange,
  onSelectElement,
  selectedKey,
  onSelectFunction,
  slug = 'demo',
}) => {
  const visibleScenes = scenes.filter((s) => s.visible).sort((a, b) => a.order - b.order);

  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isBookOpen, setIsBookOpen] = useState<boolean>(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [enablePetals, setEnablePetals] = useState<boolean>(true);
  const [enableDiya, setEnableDiya] = useState<boolean>(true);
  const [enableFoilShimmer, setEnableFoilShimmer] = useState<boolean>(true);

  // Stop soundtrack when player unmounts
  useEffect(() => {
    return () => {
      weddingMusic.stop();
    };
  }, []);

  // Synchronize with external activeSceneId in editor mode
  useEffect(() => {
    if (activeSceneId) {
      const idx = visibleScenes.findIndex((s) => s.id === activeSceneId);
      if (idx !== -1) {
        setCurrentSceneIndex(idx);
        if (activeSceneId !== 'cover' && activeSceneId !== 'birthdayBox' && activeSceneId !== 'customArch') {
          setIsBookOpen(true);
        }
      }
    }
  }, [activeSceneId, visibleScenes]);

  const currentScene = visibleScenes[currentSceneIndex] || visibleScenes[0];

  const handleNextScene = () => {
    if (currentSceneIndex < visibleScenes.length - 1) {
      const nextIdx = currentSceneIndex + 1;
      setCurrentSceneIndex(nextIdx);
      if (onSceneChange) onSceneChange(visibleScenes[nextIdx].id);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      const prevIdx = currentSceneIndex - 1;
      setCurrentSceneIndex(prevIdx);
      if (onSceneChange) onSceneChange(visibleScenes[prevIdx].id);
    }
  };

  const handleOpenBook = () => {
    setIsBookOpen(true);
    // Start ambient audio on first user gesture if enabled
    if (data.music.enabled && !isPlayingMusic) {
      const started = weddingMusic.toggle(data.music);
      setIsPlayingMusic(started);
    }
    // Transition smoothly to next scene
    setTimeout(() => {
      const nextScene = visibleScenes[1];
      if (nextScene) {
        setCurrentSceneIndex(1);
        if (onSceneChange) onSceneChange(nextScene.id);
      }
    }, 900);
  };

  const handleReplay = () => {
    setIsBookOpen(false);
    setCurrentSceneIndex(0);
    if (onSceneChange && visibleScenes[0]) {
      onSceneChange(visibleScenes[0].id);
    }
  };

  const toggleMusic = () => {
    const state = weddingMusic.toggle(data.music);
    setIsPlayingMusic(state);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'editor') return; // don't hijack while typing in editor
      if (e.key === 'ArrowRight') handleNextScene();
      if (e.key === 'ArrowLeft') handlePrevScene();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSceneIndex, mode]);

  const renderCurrentScene = () => {
    if (!currentScene) return null;

    const sceneId = currentScene.id;
    const isEditor = mode === 'editor';

    switch (sceneId) {
      case 'cover':
        return (
          <CoverScene
            data={data}
            isOpen={isBookOpen}
            onOpen={handleOpenBook}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'birthdayBox':
        return (
          <BirthdayBoxScene
            data={data}
            isOpen={isBookOpen}
            onOpen={handleOpenBook}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'corporatePass':
        return (
          <CorporatePassScene
            data={data}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'customArch':
        return (
          <CustomArchScene
            data={data}
            isOpen={isBookOpen}
            onOpen={handleOpenBook}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'welcome':
        return (
          <WelcomeScene
            data={data}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'date':
        return (
          <SaveTheDateScene
            data={data}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'festivities':
        return (
          <FestivitiesScene
            data={data}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
            onSelectFunction={onSelectFunction}
          />
        );
      case 'partyDetails':
        return (
          <BirthdayActivitiesScene
            data={data}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'speakersAgenda':
        return (
          <CorporateAgendaScene
            data={data}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'customDetails':
        return (
          <CustomProgramScene
            data={data}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'story':
        return (
          <StoryScene
            data={data}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'venue':
        return (
          <VenueScene
            data={data}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      case 'closing':
        // If RSVP is enabled, show the RSVP form with closing blessing
        if (data.rsvp && data.rsvp.enabled) {
          return (
            <RsvpScene
              data={data}
              slug={slug}
              isDemo={mode === 'demo'}
            />
          );
        }
        return (
          <ClosingScene
            data={data}
            onReplay={handleReplay}
            isEditor={isEditor}
            onSelectElement={onSelectElement}
            selectedKey={selectedKey}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      {/* Active Scene Display with 3D Parallax Tilt, Petals & Gold Shimmer */}
      <div className="w-full flex justify-center py-2 overflow-visible">
        <CardEffectsLayer
          category={data.category}
          enablePetals={enablePetals}
          enableDiya={enableDiya}
          enableFoilShimmer={enableFoilShimmer}
        >
          {renderCurrentScene()}
        </CardEffectsLayer>
      </div>

      {/* Floating Bottom Navigator for Demo & Guest Preview Mode */}
      {mode !== 'editor' && (
        <div className="sticky bottom-4 z-40 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-[#dfba6a]/50 flex items-center gap-2.5">
          {/* Previous Button */}
          <button
            onClick={handlePrevScene}
            disabled={currentSceneIndex === 0}
            className="p-1.5 rounded-full text-[#6e1f2f] hover:bg-[#faf7f2] disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Previous Scene"
            aria-label="Previous scene"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scene Dots */}
          <div className="flex items-center gap-1.5 px-1">
            {visibleScenes.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSceneIndex(idx);
                  if (s.id !== 'cover' && s.id !== 'birthdayBox' && s.id !== 'customArch') {
                    setIsBookOpen(true);
                  }
                  if (onSceneChange) onSceneChange(s.id);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSceneIndex
                    ? 'w-6 h-2 bg-[#6e1f2f]'
                    : 'w-2 h-2 bg-[#d1c5b4] hover:bg-[#6e1f2f]/60'
                }`}
                title={s.titleEn}
                aria-label={`Scene ${idx + 1}: ${s.titleEn}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextScene}
            disabled={currentSceneIndex === visibleScenes.length - 1}
            className="p-1.5 rounded-full text-[#6e1f2f] hover:bg-[#faf7f2] disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Next Scene"
            aria-label="Next scene"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-[1px] h-4 bg-[#dfba6a]/40 mx-0.5"></div>

          {/* Card Effects Toggle (Flower Petals & Sparkle) */}
          <button
            onClick={() => setEnablePetals(!enablePetals)}
            className={`p-1.5 rounded-full transition-all ${
              enablePetals ? 'bg-[#dfba6a]/25 text-[#6e1f2f]' : 'text-stone-400 hover:bg-[#faf7f2]'
            }`}
            title={enablePetals ? 'Flower Petal Rain: ON' : 'Flower Petal Rain: OFF'}
            aria-label="Toggle flower petal shower effect"
          >
            <Sparkles className="w-4 h-4 text-[#c99a3e]" />
          </button>

          {/* Music Controller */}
          <button
            onClick={toggleMusic}
            className={`p-1.5 rounded-full transition-all ${
              isPlayingMusic ? 'bg-[#6e1f2f] text-[#dfba6a]' : 'text-[#7d6a58] hover:bg-[#faf7f2]'
            }`}
            title="Background Audio"
            aria-label="Toggle background audio"
          >
            {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Replay */}
          <button
            onClick={handleReplay}
            className="p-1.5 rounded-full text-[#7d6a58] hover:text-[#6e1f2f] hover:bg-[#faf7f2] transition-all"
            title="Replay from Beginning"
            aria-label="Replay invitation from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
