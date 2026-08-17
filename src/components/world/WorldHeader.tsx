'use client';

import React from 'react';
import {
  Search,
  Compass,
  Bookmark,
  Settings2,
  Volume2,
  VolumeX,
  Sparkles,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { useWorldStore } from '@/store/worldStore';
import { useLibraryStore } from '@/store/libraryStore';

interface WorldHeaderProps {
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleWorldSelector: () => void;
  isWorldSelectorOpen: boolean;
}

export const WorldHeader: React.FC<WorldHeaderProps> = ({
  onOpenSearch,
  onOpenSettings,
  onToggleWorldSelector,
  isWorldSelectorOpen,
}) => {
  const { currentWorld, settings, toggleAmbient, updateSettings } = useWorldStore();
  const { setLibraryOpen } = useLibraryStore();

  const toggleDesktopMode = () => {
    updateSettings({ forceDesktopMode: !settings.forceDesktopMode });
  };

  return (
    <header className="relative z-20 w-full px-2.5 sm:px-8 py-2.5 sm:py-5 flex items-center justify-between pointer-events-auto select-none gap-1 sm:gap-4">
      {/* Brand Title (Left) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        <div
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-colors duration-500 backdrop-blur-xl"
          style={{
            borderColor: currentWorld.palette.border,
            backgroundColor: currentWorld.palette.glassBg,
            boxShadow: `0 0 14px ${currentWorld.palette.glow}`,
          }}
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: currentWorld.palette.accent }} />
        </div>
        <div className="flex items-center gap-1">
          <span className="font-kannada font-bold text-sm sm:text-lg tracking-wide text-white drop-shadow-sm">
            ಸ್ವರ ಲೋಕ
          </span>
          <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.14em] font-medium text-slate-300/80 px-1 py-0.2 rounded border border-white/10 bg-white/5 hidden xs:inline">
            Swara
          </span>
        </div>
      </div>

      {/* Center: Current World Destination Capsule (Desktop & Mobile Tap) */}
      <button
        onClick={onToggleWorldSelector}
        aria-label="Switch World Destination"
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-300 backdrop-blur-xl group min-h-[36px] sm:min-h-[40px] touch-manipulation truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none ${
          isWorldSelectorOpen ? 'ring-1 ring-white/30 scale-105' : 'hover:scale-[1.02] active:scale-95'
        }`}
        style={{
          borderColor: currentWorld.palette.border,
          backgroundColor: currentWorld.palette.glassBg,
        }}
      >
        <Compass
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-500 group-hover:rotate-45 flex-shrink-0"
          style={{ color: currentWorld.palette.accent }}
        />
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[11px] sm:text-xs font-semibold text-white/95 truncate">
            {currentWorld.name}
          </span>
          <span className="text-[11px] font-kannada text-slate-300 hidden md:inline truncate">
            • {currentWorld.localizedName}
          </span>
        </div>
      </button>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Desktop Mode Force Toggle Button */}
        <button
          onClick={toggleDesktopMode}
          title={settings.forceDesktopMode ? 'Switch to Mobile View' : 'Force Desktop / Wide Mode'}
          aria-label="Toggle Desktop View"
          className={`min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] p-2 rounded-full border transition-all duration-300 backdrop-blur-xl flex items-center justify-center touch-manipulation active:scale-90 ${
            settings.forceDesktopMode
              ? 'bg-white/20 border-white/40 text-white'
              : 'border-white/10 hover:border-white/25 hover:bg-white/10 text-slate-300'
          }`}
          style={{ backgroundColor: currentWorld.palette.glassBg }}
        >
          {settings.forceDesktopMode ? (
            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: currentWorld.palette.accent }} />
          ) : (
            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
          )}
        </button>

        {/* Ambient Sound Layer Toggle */}
        <button
          onClick={toggleAmbient}
          title={settings.isAmbientEnabled ? 'Pause Environmental Audio' : 'Enable Environmental Sound'}
          className={`min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] p-2 rounded-full border transition-all duration-300 backdrop-blur-xl flex items-center justify-center touch-manipulation active:scale-90 ${
            settings.isAmbientEnabled ? 'bg-white/20 border-white/40' : 'hover:bg-white/10 border-white/10'
          }`}
          style={{
            borderColor: settings.isAmbientEnabled ? currentWorld.palette.accent : 'rgba(255, 255, 255, 0.12)',
            backgroundColor: currentWorld.palette.glassBg,
          }}
        >
          {settings.isAmbientEnabled ? (
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: currentWorld.palette.accent }} />
          ) : (
            <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          )}
        </button>

        {/* Search Modal Trigger */}
        <button
          onClick={onOpenSearch}
          title="Search Kannada music"
          aria-label="Search"
          className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] p-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-300 backdrop-blur-xl text-slate-200 flex items-center justify-center touch-manipulation active:scale-90"
          style={{ backgroundColor: currentWorld.palette.glassBg }}
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Library / Saved Playlists Trigger */}
        <button
          onClick={() => setLibraryOpen(true)}
          title="Library & Favorites"
          aria-label="Library"
          className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] p-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-300 backdrop-blur-xl text-slate-200 flex items-center justify-center touch-manipulation active:scale-90"
          style={{ backgroundColor: currentWorld.palette.glassBg }}
        >
          <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Settings Modal Trigger */}
        <button
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Settings"
          className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] p-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-300 backdrop-blur-xl text-slate-200 hidden sm:flex items-center justify-center touch-manipulation active:scale-90"
          style={{ backgroundColor: currentWorld.palette.glassBg }}
        >
          <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};
