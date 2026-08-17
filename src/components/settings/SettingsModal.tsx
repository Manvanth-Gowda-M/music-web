'use client';

import React from 'react';
import { X, Volume2, Activity, Sparkles } from 'lucide-react';
import { useWorldStore } from '@/store/worldStore';
import { MusicService } from '@/services/audio/MusicService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentWorld, settings, updateSettings } = useWorldStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl animate-fade-in pointer-events-auto select-none safe-bottom">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className="relative z-10 w-full max-w-xl h-[88dvh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border p-4 sm:p-6 flex flex-col backdrop-blur-2xl shadow-2xl overflow-hidden"
        style={{
          borderColor: currentWorld.palette.border,
          backgroundColor: currentWorld.palette.glassBg,
        }}
      >
        {/* Drag pill for mobile */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-2 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-kannada text-xl sm:text-2xl font-bold text-white">
              ಸೆಟ್ಟಿಂಗ್ಸ್
            </h3>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-sans">
              • Settings
            </span>
          </div>

          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] p-2 rounded-full border border-white/10 hover:border-white/30 text-slate-300 transition-colors flex items-center justify-center touch-manipulation active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 sm:space-y-6 pr-0.5 smooth-scroll">
          {/* Audio Engine Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio Playback & Engine</span>
            </div>

            {/* Crossfade Slider */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-white/5 bg-black/25">
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-semibold text-white block">
                  Audio Crossfade (ಕ್ರಾಸ್‌ಫೇಡ್)
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  Smooth transition between consecutive tracks
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={1}
                  value={settings.crossfade}
                  onChange={(e) => updateSettings({ crossfade: parseInt(e.target.value) })}
                  className="w-20 sm:w-24 h-1.5 rounded-lg appearance-none cursor-pointer bg-white/20 accent-white"
                />
                <span className="text-xs font-mono text-slate-300 w-5 text-right">
                  {settings.crossfade}s
                </span>
              </div>
            </div>

            {/* Continuous Autoplay */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-black/25">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-xs sm:text-sm font-semibold text-white block">
                  Ambient Autoplay (ಸ್ವಯಂಚಾಲಿತ ಪ್ಲೇ)
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  Automatically continue playback when queue finishes
                </span>
              </div>
              <button
                onClick={() => updateSettings({ autoplay: !settings.autoplay })}
                className={`min-w-[48px] h-7 rounded-full p-1 transition-colors flex-shrink-0 touch-manipulation ${
                  settings.autoplay ? 'bg-white/90' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    settings.autoplay ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Visualizer & Graphics Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Visualizer & Environment</span>
            </div>

            {/* Visualizer Intensity */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-black/25">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-xs sm:text-sm font-semibold text-white block">
                  Visualizer Waveform (ತರಂಗ ದೃಶ್ಯ)
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  Organic audio reactivity on bottom player
                </span>
              </div>
              <select
                value={settings.visualizerIntensity}
                onChange={(e) => updateSettings({ visualizerIntensity: e.target.value as any })}
                className="bg-black/60 border border-white/20 text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none flex-shrink-0"
              >
                <option value="subtle">Subtle (ಸೂಕ್ಷ್ಮ)</option>
                <option value="standard">Standard (ಸಾಮಾನ್ಯ)</option>
                <option value="off">Off (ಸ್ಥಗಿತ)</option>
              </select>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-black/25">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-xs sm:text-sm font-semibold text-white block">
                  Reduced Motion (ಕಡಿಮೆ ಚಲನೆ)
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  Pause background video and animations
                </span>
              </div>
              <button
                onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                className={`min-w-[48px] h-7 rounded-full p-1 transition-colors flex-shrink-0 touch-manipulation ${
                  settings.reducedMotion ? 'bg-white/90' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Force Desktop / Wide View Mode */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-black/25">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-xs sm:text-sm font-semibold text-white block">
                  Force Desktop / Wide Mode (ಡೆಸ್ಕ್‌ಟಾಪ್ ಮೋಡ್)
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  Enable wide layout with full visualizer & controls on mobile
                </span>
              </div>
              <button
                onClick={() => updateSettings({ forceDesktopMode: !settings.forceDesktopMode })}
                className={`min-w-[48px] h-7 rounded-full p-1 transition-colors flex-shrink-0 touch-manipulation ${
                  settings.forceDesktopMode ? 'bg-white/90' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    settings.forceDesktopMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Audio Source Diagnostics */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Service Architecture</span>
            </div>

            <div className="p-3 rounded-2xl border border-white/5 bg-black/25 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Music Provider:</span>
                <span className="font-semibold text-white truncate max-w-[180px]">{MusicService.getProviderName()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Audio Stream:</span>
                <span className="font-mono text-white">160kbps AAC Direct</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Web Audio:</span>
                <span className="text-emerald-400">256 FFT Canvas Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-white/10 text-center text-[11px] text-slate-400 flex-shrink-0">
          ಸ್ವರ ಲೋಕ • Kannada Ambient Music Worlds
        </div>
      </div>
    </div>
  );
};
