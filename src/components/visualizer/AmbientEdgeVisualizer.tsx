'use client';

import React, { useEffect, useRef } from 'react';
import { useWorldStore } from '@/store/worldStore';
import { usePlayerStore } from '@/store/playerStore';
import { AudioAnalyzer } from '@/services/visualizer/AudioAnalyzer';
import { VisualizerRenderer } from '@/services/visualizer/VisualizerRenderer';

export const AmbientEdgeVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const rendererRef = useRef<VisualizerRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const { currentWorld, settings } = useWorldStore();
  const { isPlaying } = usePlayerStore();

  const isEnabled = settings.visualizerEnabled;
  const intensity = settings.visualizerIntensity || 'subtle';
  const design = settings.visualizerDesign || 'fluid-liquid';
  const reducedMotion = settings.reducedMotion;

  // Initialize Analyzer and Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    if (!analyzerRef.current) {
      analyzerRef.current = new AudioAnalyzer();
    }

    if (!rendererRef.current) {
      rendererRef.current = new VisualizerRenderer(canvas, currentWorld.id);
    }

    const handleResize = () => {
      rendererRef.current?.resize();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Update theme when world changes
  useEffect(() => {
    rendererRef.current?.setWorld(currentWorld.id);
  }, [currentWorld.id]);

  // Main 60 FPS Animation Loop
  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      // Clear canvas if disabled
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    let isRunning = true;

    const loop = () => {
      if (!isRunning) return;

      // Battery saving: pause rendering if tab is hidden
      if (document.hidden) {
        animFrameIdRef.current = requestAnimationFrame(loop);
        return;
      }

      if (analyzerRef.current && rendererRef.current) {
        const metrics = analyzerRef.current.update(isPlaying);
        rendererRef.current.render(metrics, intensity, design, reducedMotion);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isEnabled, isPlaying, intensity, design, reducedMotion]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[5] w-full h-full block"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    />
  );
};
