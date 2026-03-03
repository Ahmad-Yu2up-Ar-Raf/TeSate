// components/provider/AudioProvider.tsx

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  createAudioPlayer,
  useAudioPlayerStatus,
  type AudioPlayer,
  type AudioSource,
} from 'expo-audio';

type AudioContextType = {
  currentId: string | null;
  isPlaying: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  play: (id: string, uri: AudioSource) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
};

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<AudioPlayer | null>(null);

  if (!playerRef.current) {
    playerRef.current = createAudioPlayer(null);
  }

  const player = playerRef.current;
  const status = useAudioPlayerStatus(player);

  const [currentId, setCurrentId] = useState<string | null>(null);

  const isPlaying = !!status?.playing;
  const isLoaded = !!status?.isLoaded;
  const isLoading = !!status?.isBuffering || !isLoaded;

async function play(id: string, uri: AudioSource) {
  if (!uri) return;

  if (currentId === id) {
    if (isPlaying) {
      await player.pause();
      return;
    }

    if (status?.didJustFinish) {
      await player.seekTo(0);
    }

    await player.play();
    return;
  }

  await player.replace(uri);
  await player.play();
  setCurrentId(id);
}

  async function pause() {
    try {
      await player.pause();
    } catch {}
  }

  async function stop() {
    try {
      await player.pause();
      await player.seekTo(0);
      setCurrentId(null);
    } catch {}
  }

  useEffect(() => {
    return () => {
      try {
        player.remove();
      } catch {}
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        currentId,
        isPlaying,
        isLoaded,
        isLoading,
        play,
        pause,
        stop,
      }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useGlobalAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useGlobalAudio must be used inside AudioProvider');
  return ctx;
}
