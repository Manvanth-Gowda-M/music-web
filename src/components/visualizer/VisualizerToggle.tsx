'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Activity, Check } from 'lucide-react';
import { useWorldStore } from '@/store/worldStore';

import { VisualizerDesign } from '@/types';

export const VisualizerToggle: React.FC = () => {
  const { settings, updateSettings, currentWorld } = useWorldStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isEnabled = settings.visualizerEnabled;
  const currentIntensity = settings.visualizerIntensity || 'subtle';
  const currentDesign = settings.visualizerDesign || 'fluid-liquid';

  const toggleEnabled = () => {
    updateSettings({ visualizerEnabled: !isEnabled });
  };

  const handleSetIntensity = (intensity: 'subtle' | 'balanced' | 'immersive') => {
    updateSettings({ visualizerIntensity: intensity, visualizerEnabled: true });
  };

  const handleSetDesign = (design: VisualizerDesign) => {
    updateSettings({ visualizerDesign: design, visualizerEnabled: true });
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const DESIGNS: { id: VisualizerDesign; label: string; desc: string; icon: string }[] = [
    { id: 'fluid-liquid', label: 'Fluid Liquid Wave', desc: 'Flowing 4-border liquid ribbons', icon: '🌊' },
    { id: 'minimal-pulse', label: 'Minimalist Pulse', desc: 'Always-On Display acoustic aura', icon: '⚡' },
    { id: 'perimeter-bars', label: 'Perimeter EQ Bars', desc: 'Inward glowing spectrum bars', icon: '📊' },
    { id: 'aurora-ribbon', label: 'Aurora Ribbon', desc: 'Dual chromatic intersecting waves', icon: '🌈' },
    { id: 'particle-shimmer', label: 'Particle Shimmer', desc: 'Constellation laser filaments', icon: '✨' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title={`Ambient Edge Visualizer: ${isEnabled ? `${currentDesign.toUpperCase()}` : 'OFF'}`}
        aria-label="Toggle Ambient Edge Visualizer"
        className={`min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] p-2 rounded-full border transition-all duration-300 backdrop-blur-xl flex items-center justify-center touch-manipulation active:scale-90 ${
          isEnabled
            ? 'bg-white/15 border-white/35 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
            : 'border-white/10 hover:border-white/25 hover:bg-white/10 text-slate-400'
        }`}
        style={{
          borderColor: isEnabled ? currentWorld.palette.accent : 'rgba(255, 255, 255, 0.12)',
          backgroundColor: currentWorld.palette.glassBg,
        }}
      >
        <Activity
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
            isEnabled ? 'text-white scale-105' : 'text-slate-400'
          }`}
          style={{ color: isEnabled ? currentWorld.palette.accent : undefined }}
        />
      </button>

      {/* Multi-Design Selector Popover Menu */}
      {isMenuOpen && (
        <div
          className="absolute right-0 top-12 z-50 w-64 rounded-2xl border p-2.5 backdrop-blur-2xl shadow-2xl animate-fade-in pointer-events-auto select-none max-h-[85vh] overflow-y-auto smooth-scroll"
          style={{
            borderColor: currentWorld.palette.border,
            backgroundColor: 'rgba(12, 10, 18, 0.95)',
            boxShadow: `0 20px 45px rgba(0, 0, 0, 0.85), 0 0 30px ${currentWorld.palette.glow}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1.5 py-1 mb-2 border-b border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
              Edge Equalizer Design
            </span>
            <button
              onClick={toggleEnabled}
              className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold transition-colors ${
                isEnabled ? 'bg-emerald-500/25 text-emerald-300' : 'bg-white/10 text-slate-400'
              }`}
            >
              {isEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Design Styles List */}
          <div className="space-y-1 mb-3">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 px-1 block mb-1">
              Select Equalizer Style
            </span>
            {DESIGNS.map((d) => {
              const isSelected = isEnabled && currentDesign === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSetDesign(d.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all active:scale-95 touch-manipulation ${
                    isSelected
                      ? 'bg-white/15 text-white font-bold border border-white/15'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 text-left min-w-0">
                    <span className="text-base flex-shrink-0">{d.icon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-xs truncate">{d.label}</span>
                      <span className="text-[9px] text-slate-400 font-light truncate">
                        {d.desc}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className="w-3.5 h-3.5 ml-2 flex-shrink-0"
                      style={{ color: currentWorld.palette.accent }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Intensity Multiplier Selector */}
          <div className="border-t border-white/10 pt-2">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 px-1 block mb-1.5">
              Reactivity Intensity
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['subtle', 'balanced', 'immersive'] as const).map((lvl) => {
                const isSelected = isEnabled && currentIntensity === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSetIntensity(lvl)}
                    className={`py-1 rounded-lg text-[10px] font-mono capitalize transition-all active:scale-95 touch-manipulation ${
                      isSelected
                        ? 'bg-white/20 text-white font-bold border border-white/20'
                        : 'text-slate-400 bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
