'use client';

import React, { useState } from 'react';
import { WorldBackground } from '@/components/world/WorldBackground';
import { AmbientEdgeVisualizer } from '@/components/visualizer/AmbientEdgeVisualizer';
import { WorldHeader } from '@/components/world/WorldHeader';
import { WorldHero } from '@/components/world/WorldHero';
import { WorldSelector } from '@/components/world/WorldSelector';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { FullPlayer } from '@/components/player/FullPlayer';
import { PlayQueue } from '@/components/player/PlayQueue';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { LibraryModal } from '@/components/library/LibraryModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePlayerStore } from '@/store/playerStore';
import { AlertCircle, X } from 'lucide-react';

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorldSelectorOpen, setIsWorldSelectorOpen] = useState(false);

  // Initialize Audio Player system
  useAudioPlayer();

  const { error, setError } = usePlayerStore();

  return (
    <main className="relative w-screen h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between select-none safe-top safe-bottom">
      {/* Layer 0 & 1: 4K Looping Background Video & Cinematic Vignette */}
      <WorldBackground />

      {/* Layer 3: Ambient Audio-Reactive Edge Visualization (Perimeter Light Field) */}
      <AmbientEdgeVisualizer />

      {/* Layer 2/4: Top Navigation Header */}
      <WorldHeader
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleWorldSelector={() => setIsWorldSelectorOpen(!isWorldSelectorOpen)}
        isWorldSelectorOpen={isWorldSelectorOpen}
      />

      {/* Playback Error Toast Alert */}
      {error && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-red-950/85 border border-red-500/30 text-red-200 backdrop-blur-2xl shadow-2xl animate-fade-in pointer-events-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-xs font-medium font-sans truncate">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-white/10 rounded-full text-red-300 flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Layer 3: World Hero Content */}
      <WorldHero
        onToggleWorldSelector={() => setIsWorldSelectorOpen(!isWorldSelectorOpen)}
      />

      {/* Layer 4: Persistent Music Player (Bottom Glass) */}
      <MiniPlayer />

      {/* Layer 5: Overlays and Modals */}
      <WorldSelector
        isOpen={isWorldSelectorOpen}
        onClose={() => setIsWorldSelectorOpen(false)}
      />

      <FullPlayer />

      <PlayQueue />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <LibraryModal />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
