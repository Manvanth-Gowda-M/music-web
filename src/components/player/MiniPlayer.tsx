'use client';

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { VintageCassetteDeck } from './VintageCassetteDeck';
import { TempleDeck } from './TempleDeck';
import { BeachDeck } from './BeachDeck';
import { PassengerGlassDeck } from './PassengerGlassDeck';
import { UniversalDeck } from './UniversalDeck';

export const MiniPlayer: React.FC = () => {
  const { currentWorld } = useWorldStore();

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
