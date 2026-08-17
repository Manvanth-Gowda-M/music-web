'use client';

import React from 'react';
import { X, Trash2, Music, ArrowUp, ArrowDown } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';

export const PlayQueue: React.FC = () => {
  const {
    queue,
    currentTrack,
    isQueueOpen,
    setQueueOpen,
    playTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  } = usePlayerStore();

  const { currentWorld } = useWorldStore();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-end pointer-events-auto select-none safe-bottom">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => setQueueOpen(false)}
      />

      {/* Drawer / Sheet */}
      <div
        className="relative z-10 w-full sm:max-w-md h-[88dvh] sm:h-full flex flex-col justify-between p-4 sm:p-6 border-t sm:border-t-0 sm:border-l rounded-t-3xl sm:rounded-none backdrop-blur-3xl shadow-2xl animate-fade-in"
        style={{
          borderColor: currentWorld.palette.border,
          backgroundColor: currentWorld.palette.glassBg,
        }}
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-2 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-kannada font-bold text-base sm:text-lg text-white">
                ಹಾಡುಗಳ ಸರದಿ
              </h3>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-sans">
                • Queue
              </span>
            </div>
            <span className="text-[11px] text-slate-300">
              {queue.length} {queue.length === 1 ? 'track' : 'tracks'} queued
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                title="Clear Queue"
                className="min-w-[36px] min-h-[36px] p-2 rounded-full border border-white/10 hover:border-white/30 text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center touch-manipulation active:scale-90"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setQueueOpen(false)}
              className="min-w-[36px] min-h-[36px] p-2 rounded-full border border-white/10 hover:border-white/30 text-slate-300 transition-colors flex items-center justify-center touch-manipulation active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Queue Content List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-0.5 smooth-scroll">
          {/* Now Playing Section */}
          {currentTrack && (
            <div className="mb-4 sm:mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 block">
                NOW PLAYING
              </span>
              <div
                className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border backdrop-blur-md"
                style={{
                  borderColor: currentWorld.palette.accent,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <img
                  src={currentTrack.artwork}
                  alt={currentTrack.title}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 pr-1">
                  <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                    {currentTrack.title}
                  </span>
                  <span className="text-[11px] text-slate-300 truncate block">
                    {currentTrack.artist}
                  </span>
                </div>
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
                  style={{ backgroundColor: currentWorld.palette.accent }}
                />
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 block">
              UP NEXT
            </span>

            {queue.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Music className="w-7 h-7 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-light">Queue is empty</p>
                <p className="text-[11px] text-slate-300 mt-0.5 font-kannada">
                  ಈ ಲೋಕದ ಹೊಸ ಹಾಡುಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {queue.map((track, idx) => {
                  const isCurrent = track.id === currentTrack?.id;

                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      className={`group flex items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-xl border transition-all touch-manipulation ${
                        isCurrent
                          ? 'border-white/30 bg-white/10'
                          : 'border-white/5 bg-black/25 active:scale-[0.98]'
                      }`}
                    >
                      <button
                        onClick={() => playTrack(track)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                      >
                        <span className="text-[11px] font-mono text-slate-400 w-4 text-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <img
                          src={track.artwork}
                          alt={track.title}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1 pr-1">
                          <span className="text-xs font-medium text-white truncate block">
                            {track.title}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {track.artist}
                          </span>
                        </div>
                      </button>

                      {/* Reorder and Remove Actions */}
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {idx > 0 && (
                          <button
                            onClick={() => reorderQueue(idx, idx - 1)}
                            title="Move Up"
                            className="min-w-[32px] min-h-[32px] p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center touch-manipulation active:scale-90"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {idx < queue.length - 1 && (
                          <button
                            onClick={() => reorderQueue(idx, idx + 1)}
                            title="Move Down"
                            className="min-w-[32px] min-h-[32px] p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center touch-manipulation active:scale-90"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => removeFromQueue(idx)}
                          title="Remove from queue"
                          className="min-w-[32px] min-h-[32px] p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400 flex items-center justify-center touch-manipulation active:scale-90"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer: World Autoplay info */}
        <div className="pt-2.5 border-t border-white/10 text-center flex-shrink-0">
          <p className="text-[10px] text-slate-400 font-light">
            Continuous ambient flow active for <span className="text-white font-medium">{currentWorld.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
