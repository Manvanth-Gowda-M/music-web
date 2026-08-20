'use client';

import React from 'react';
import { WORLDS } from '@/data/worlds';
import { useWorldStore } from '@/store/worldStore';
import { usePlayerStore } from '@/store/playerStore';
import { WorldId } from '@/types';
import { Check, X, Radio } from 'lucide-react';

interface WorldSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldSelector: React.FC<WorldSelectorProps> = ({ isOpen, onClose }) => {
  const { currentWorld, switchWorld, isTransitioning } = useWorldStore();
  const { setStationModalOpen } = usePlayerStore();

  if (!isOpen) return null;

  const handleSelectWorld = async (worldId: WorldId) => {
    onClose();
    await switchWorld(worldId, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in pointer-events-auto select-none safe-bottom">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container (Bottom Sheet on mobile, centered modal on desktop) */}
      <div
        className="relative z-10 w-full max-w-6xl max-h-[88dvh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border p-5 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-y-auto smooth-scroll flex flex-col"
        style={{
          borderColor: currentWorld.palette.border,
          backgroundColor: currentWorld.palette.glassBg,
        }}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-kannada text-xl sm:text-2xl font-bold text-white">
                ಲೋಕ ಆಯ್ಕೆ
              </h3>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-sans">
                • Select World (5 Environments)
              </span>
            </div>
            <p className="text-xs text-slate-300 font-light mt-0.5">
              Choose an ambient environment. Music and ambiance immediately match your selection.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                setStationModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation shadow-md"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Languages & Stations</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close World Selector"
              className="min-w-[40px] min-h-[40px] p-2 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-90 text-slate-300 transition-all flex items-center justify-center touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 World Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 overflow-y-auto pb-4">
          {WORLDS.map((world, idx) => {
            const isSelected = currentWorld.id === world.id;

            return (
              <button
                key={world.id}
                onClick={() => handleSelectWorld(world.id)}
                disabled={isTransitioning}
                className={`group relative flex flex-col text-left rounded-2xl overflow-hidden border transition-all duration-300 touch-manipulation ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-offset-black scale-[1.01] shadow-xl'
                    : 'hover:scale-[1.02] active:scale-95 hover:border-white/30 opacity-80 hover:opacity-100'
                }`}
                style={{
                  borderColor: isSelected ? world.palette.accent : 'rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(10, 10, 10, 0.65)',
                }}
              >
                {/* World Video Poster Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden flex-shrink-0">
                  <img
                    src={world.poster}
                    alt={world.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  {/* World Number Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                    WORLD 0{idx + 1}
                  </div>

                  {/* Selected Indicator Badge */}
                  {isSelected && (
                    <div
                      className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: world.palette.accent }}
                    >
                      <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Card Content Details */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-kannada font-bold text-base sm:text-lg text-white leading-tight">
                      {world.localizedName}
                    </h4>
                    <p className="text-xs font-serif italic text-slate-200/90 font-light mt-0.5">
                      {world.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {world.tagline}
                    </p>
                  </div>

                  {/* Visualizer Mode Badge */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {world.ambientCategory.split('/')[0].trim()}
                    </span>
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: world.palette.accent }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
