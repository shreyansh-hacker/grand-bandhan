import React from 'react';
import { SceneDefinition, SceneId } from '../../types/invitation';
import {
  Book,
  Heart,
  Calendar,
  Sparkles,
  Camera,
  MapPin,
  Users,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';

interface SceneListPanelProps {
  scenes: SceneDefinition[];
  activeSceneId: SceneId;
  onSelectScene: (id: SceneId) => void;
  onToggleVisibility: (id: SceneId) => void;
  onMoveScene: (id: SceneId, direction: 'up' | 'down') => void;
  onAddCustomFunction: () => void;
}

export const SceneListPanel: React.FC<SceneListPanelProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  onToggleVisibility,
  onMoveScene,
  onAddCustomFunction,
}) => {
  const getSceneIcon = (id: SceneId) => {
    switch (id) {
      case 'cover':
        return <Book className="w-4 h-4" />;
      case 'welcome':
        return <Heart className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'festivities':
        return <Sparkles className="w-4 h-4" />;
      case 'story':
        return <Camera className="w-4 h-4" />;
      case 'venue':
        return <MapPin className="w-4 h-4" />;
      case 'closing':
        return <Users className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const sortedScenes = [...scenes].sort((a, b) => a.order - b.order);

  return (
    <aside className="w-full md:w-64 bg-white border-r border-[#e8decb] flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-[#e8decb] flex items-center justify-between bg-[#faf7f2]/60">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider font-cinzel text-[#6e1f2f]">
            सीन क्रम (SCENES)
          </h3>
          <p className="text-[10px] text-[#7d6a58] font-sans">
            क्रम बदलें या दृश्य छिपाएँ
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6e1f2f]/10 text-[#6e1f2f]">
          {sortedScenes.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sortedScenes.map((scene, index) => {
          const isActive = scene.id === activeSceneId;
          const isFirst = index === 0;
          const isLast = index === sortedScenes.length - 1;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#6e1f2f] text-white border-[#6e1f2f] shadow-sm'
                  : scene.visible
                  ? 'bg-white hover:bg-[#faf7f2] border-[#e8decb] text-[#2c2523]'
                  : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? 'bg-white/20 text-[#dfba6a]'
                      : 'bg-[#faf7f2] text-[#6e1f2f]'
                  }`}
                >
                  {getSceneIcon(scene.id)}
                </span>
                <div className="truncate text-left">
                  <span className="block text-xs font-semibold font-devanagari truncate">
                    {scene.titleHi}
                  </span>
                  <span
                    className={`block text-[10px] font-cinzel truncate ${
                      isActive ? 'text-[#dfba6a]' : 'text-[#7d6a58]'
                    }`}
                  >
                    {scene.titleEn}
                  </span>
                </div>
              </div>

              {/* Actions: Reorder & Visibility */}
              <div
                className="flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Move Up */}
                <button
                  onClick={() => onMoveScene(scene.id, 'up')}
                  disabled={isFirst}
                  className={`p-1 rounded hover:bg-black/10 disabled:opacity-20 transition-all ${
                    isActive ? 'text-white' : 'text-[#7d6a58]'
                  }`}
                  title="ऊपर ले जाएँ"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => onMoveScene(scene.id, 'down')}
                  disabled={isLast}
                  className={`p-1 rounded hover:bg-black/10 disabled:opacity-20 transition-all ${
                    isActive ? 'text-white' : 'text-[#7d6a58]'
                  }`}
                  title="नीचे ले जाएँ"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Visibility Toggle */}
                <button
                  onClick={() => onToggleVisibility(scene.id)}
                  className={`p-1 rounded hover:bg-black/10 transition-all ${
                    isActive ? 'text-[#dfba6a]' : 'text-[#7d6a58]'
                  }`}
                  title={scene.visible ? 'सीन छिपाएँ' : 'सीन दिखाएँ'}
                >
                  {scene.visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: Add function shortcut */}
      <div className="p-3 border-t border-[#e8decb] bg-[#faf7f2]/60">
        <button
          onClick={onAddCustomFunction}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-dashed border-[#c99a3e] text-[#6e1f2f] hover:bg-[#fff9ed] text-xs font-semibold transition-all"
        >
          <Plus className="w-4 h-4 text-[#c99a3e]" />
          <span>+ नई रस्म जोड़ें (Add Function)</span>
        </button>
      </div>
    </aside>
  );
};
