import { useCallback, useEffect, useRef, useState } from 'react';

import brickMusic from '../../assets/audio/brick.mp3';
import nuPogodiMusic from '../../assets/audio/nu-pogodi.mp3';
import ps4SystemMusic from '../../assets/audio/ps4-system-menu.mp3';
import pspStartupSound from '../../assets/audio/psp-startup.mp3';

export type AudioScreen = 'menu' | 'about' | 'tetris' | 'nuPogodi' | 'racing';

type UseConsoleAudioOptions = {
  currentScreen: AudioScreen;
  isPowerOn: boolean;
};

const getBackgroundTrack = (screen: AudioScreen): string => {
  if (screen === 'nuPogodi') {
    return nuPogodiMusic;
  }

  if (screen === 'racing') {
    return brickMusic;
  }

  return ps4SystemMusic;
};

export const useConsoleAudio = ({ currentScreen, isPowerOn }: UseConsoleAudioOptions) => {
  const startupAudioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<string | null>(null);
  const audioUnlockedRef = useRef(false);

  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [isStartupPlaying, setIsStartupPlaying] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  useEffect(() => {
    const startupAudio = new Audio(pspStartupSound);
    const backgroundAudio = new Audio();

    startupAudio.preload = 'auto';
    startupAudio.volume = 0.12;
    startupAudio.loop = false;
    startupAudio.onended = () => {
      setIsStartupPlaying(false);
    };

    backgroundAudio.preload = 'auto';
    backgroundAudio.volume = 0.12;
    backgroundAudio.loop = true;

    startupAudioRef.current = startupAudio;
    backgroundAudioRef.current = backgroundAudio;

    return () => {
      startupAudio.pause();
      backgroundAudio.pause();

      startupAudio.onended = null;
      startupAudioRef.current = null;
      backgroundAudioRef.current = null;
      currentTrackRef.current = null;
    };
  }, []);

  const stopAllAudio = useCallback(() => {
    const startupAudio = startupAudioRef.current;
    const backgroundAudio = backgroundAudioRef.current;

    if (startupAudio) {
      startupAudio.pause();
      startupAudio.currentTime = 0;
    }

    if (backgroundAudio) {
      backgroundAudio.pause();
      backgroundAudio.currentTime = 0;
    }

    setIsStartupPlaying(false);
  }, []);

  const playPowerOnSound = useCallback(() => {
    audioUnlockedRef.current = true;
    setIsAudioUnlocked(true);

    const startupAudio = startupAudioRef.current;
    const backgroundAudio = backgroundAudioRef.current;

    backgroundAudio?.pause();

    if (!startupAudio) {
      setIsStartupPlaying(false);
      return;
    }

    startupAudio.currentTime = 0;
    setIsStartupPlaying(true);

    const playPromise = startupAudio.play();

    if (playPromise) {
      playPromise.catch(() => {
        setIsStartupPlaying(false);
      });
    }
  }, []);

  const activateAudio = useCallback(() => {
    if (audioUnlockedRef.current) {
      return;
    }

    audioUnlockedRef.current = true;
    setIsAudioUnlocked(true);

    if (isPowerOn) {
      playPowerOnSound();
    }
  }, [isPowerOn, playPowerOnSound]);

  useEffect(() => {
    const backgroundAudio = backgroundAudioRef.current;

    if (!backgroundAudio) {
      return;
    }

    if (!isAudioUnlocked || !isPowerOn || isStartupPlaying || !isMusicEnabled) {
      backgroundAudio.pause();
      return;
    }

    const nextTrack = getBackgroundTrack(currentScreen);

    if (currentTrackRef.current !== nextTrack) {
      backgroundAudio.pause();
      backgroundAudio.src = nextTrack;
      backgroundAudio.currentTime = 0;
      currentTrackRef.current = nextTrack;
    }

    backgroundAudio.loop = true;

    const playPromise = backgroundAudio.play();

    if (playPromise) {
      playPromise.catch(() => {
        // Браузер может запретить звук до первого действия пользователя.
      });
    }
  }, [currentScreen, isAudioUnlocked, isMusicEnabled, isPowerOn, isStartupPlaying]);

  const turnMusicOn = useCallback(() => {
    setIsMusicEnabled(true);
  }, []);

  const turnMusicOff = useCallback(() => {
    setIsMusicEnabled(false);
  }, []);

  const toggleMusic = useCallback(() => {
    setIsMusicEnabled((currentValue) => !currentValue);
  }, []);

  return {
    activateAudio,
    isMusicEnabled,
    playPowerOnSound,
    stopAllAudio,
    toggleMusic,
    turnMusicOff,
    turnMusicOn,
  };
};
