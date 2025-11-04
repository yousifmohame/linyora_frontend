'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ReelAudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

const ReelAudioContext = createContext<ReelAudioContextType | undefined>(undefined);

export function ReelAudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false); // false يعني الصوت فعال في البداية

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
  }, []);

  return (
    <ReelAudioContext.Provider value={{ isMuted, toggleMute, setMuted }}>
      {children}
    </ReelAudioContext.Provider>
  );
}

export function useReelAudio() {
  const context = useContext(ReelAudioContext);
  if (context === undefined) {
    throw new Error('useReelAudio must be used within a ReelAudioProvider');
  }
  return context;
}