'use client';

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { VintageCassetteDeck } from './VintageCassetteDeck';
import { TempleDeck } from './TempleDeck';
import { BeachDeck } from './BeachDeck';
import { PassengerGlassDeck } from './PassengerGlassDeck';
import { UniversalDeck } from './UniversalDeck';
import { Play } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const { currentTrack } = usePlayerStore();
  const { currentWorld } = useWorldStore();

  if (!currentTrack) {
    const isTemple = currentWorld.id === 'temple-morning';
    const isBeach = currentWorld.id === 'coastal-morning';
    const isPassenger = currentWorld.id === 'ksrtc-bus';
    const isUniversal = currentWorld.id === 'universal-mode';
    return (
      <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] sm:w-auto max-w-lg pointer-events-auto">
        <button
          onClick={() => {
            const allTracks = currentWorld.recommendedPlaylists.flatMap((p) => p.tracks);
            if (allTracks.length > 0) {
              const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
              usePlayerStore.getState().playTrack(shuffled[0], shuffled);
            }
          }}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl sm:rounded-full border backdrop-blur-2xl transition-all duration-300 active:scale-95 shadow-2xl touch-manipulation min-h-[52px]"
          style={{
            borderColor: isTemple ? '#d97706' : isBeach ? '#38bdf8' : isUniversal ? '#ec4899' : isPassenger ? '#fbbf24' : currentWorld.palette.border,
            backgroundColor: isTemple ? 'rgba(30, 20, 10, 0.9)' : isBeach ? 'rgba(15, 25, 35, 0.9)' : isUniversal ? 'rgba(25, 12, 35, 0.9)' : 'rgba(20, 18, 16, 0.85)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: isTemple ? '#fbbf24' : isBeach ? '#38bdf8' : isUniversal ? '#ec4899' : '#f59e0b' }}
            >
              <Play className="w-4 h-4 text-black fill-current ml-0.5" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-semibold text-white block truncate">
                Listen in {currentWorld.name}
              </span>
              <span className="text-[10px] font-kannada text-slate-300 block truncate">
                {currentWorld.localizedName} • {currentWorld.ambientCategory}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono border px-2.5 py-1 rounded-full flex-shrink-0 font-bold"
            style={{
              color: isTemple ? '#fbbf24' : isBeach ? '#7dd3fc' : isUniversal ? '#f472b6' : '#fde047',
              borderColor: isTemple ? '#d97706' : isBeach ? '#38bdf8' : isUniversal ? '#ec4899' : '#f59e0b',
              backgroundColor: isTemple ? 'rgba(217, 119, 6, 0.15)' : isBeach ? 'rgba(56, 189, 248, 0.15)' : isUniversal ? 'rgba(236, 72, 153, 0.2)' : 'rgba(245, 158, 11, 0.15)',
            }}
          >
            {isTemple ? 'PLAY RAGA' : isBeach ? 'PLAY BEACH RADIO' : isUniversal ? 'PLAY UNIVERSAL' : 'PLAY CASSETTE'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-2 sm:bottom-3 inset-x-2 sm:inset-x-3 z-30 max-w-lg mx-auto pointer-events-auto select-none safe-bottom">
      {currentWorld.id === 'ksrtc-bus' ? (
        <VintageCassetteDeck />
      ) : currentWorld.id === 'temple-morning' ? (
        <TempleDeck />
      ) : currentWorld.id === 'coastal-morning' ? (
        <BeachDeck />
      ) : currentWorld.id === 'universal-mode' ? (
        <UniversalDeck />
      ) : (
        <PassengerGlassDeck />
      )}
    </div>
  );
};
