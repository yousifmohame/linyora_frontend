// src/hooks/useReelAudio.ts
import { useReelAudio } from '@/context/ReelAudioContext';

export function useReelAudioControl() {
  const { isMuted, toggleMute, setMuted } = useReelAudio();

  const enableSound = () => setMuted(false);
  const disableSound = () => setMuted(true);

  return {
    isMuted,
    toggleMute,
    enableSound,
    disableSound,
  };
}