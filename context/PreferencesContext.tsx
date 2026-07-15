'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PreferencesState {
  showTestnetWarning: boolean;
  confirmBeforeRelease: boolean;
  showCountdownSeconds: boolean;
  compactCards: boolean;
  soundEffects: boolean;
}

const defaultPreferences: PreferencesState = {
  showTestnetWarning: true,
  confirmBeforeRelease: true,
  showCountdownSeconds: true,
  compactCards: false,
  soundEffects: true,
};

interface PreferencesContextType {
  prefs: PreferencesState;
  setPref: <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => void;
  playAudio: (type: 'success' | 'click') => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<PreferencesState>(defaultPreferences);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('pact_preferences');
    if (stored) {
      try {
        setPrefs({ ...defaultPreferences, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse preferences', e);
      }
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('pact_preferences', JSON.stringify(prefs));
    }
  }, [prefs, mounted]);

  const setPref = <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const playAudio = (type: 'success' | 'click') => {
    if (!prefs.soundEffects) return;
    try {
      // Basic synthesized sounds using Web Audio API instead of requiring asset files
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } else {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      console.log('Audio playback failed', e);
    }
  };

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) return null;

  return (
    <PreferencesContext.Provider value={{ prefs, setPref, playAudio }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
