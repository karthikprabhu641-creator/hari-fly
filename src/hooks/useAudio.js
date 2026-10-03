/**
 * useAudio Hook
 * Subscribes React components to AudioManager state.
 */

import { useState, useEffect } from 'react';
import { audioManager } from '../audio/AudioManager';
import { GAMEPLAY_MUSIC_MODES } from '../config/audioConfig';

export function useAudio() {
  const [audioState, setAudioState] = useState({
    isUnlocked: audioManager.isUnlocked,
    isMuted: audioManager.isMuted,
    bgmVolume: audioManager.bgmVolume,
    sfxVolume: audioManager.sfxVolume,
    isPlayingMusic: audioManager.music.isPlaying,
    currentTrack: audioManager.music.getCurrentTrack(),
    playlist: audioManager.music.playlist,
    gameplayMode: audioManager.music.getMode(),
    favoriteTrack: audioManager.music.getFavoriteTrack(),
    gameOverTrack: audioManager.getGameOverTrack(),
    gameOverSongs: audioManager.gameOverSongs,
  });

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((next) => {
      setAudioState(next);
    });
    return unsubscribe;
  }, []);

  return {
    ...audioState,
    playMusic: () => audioManager.playMusic(),
    pauseMusic: () => audioManager.pauseMusic(),
    nextTrack: () => audioManager.nextTrack(),
    prevTrack: () => audioManager.prevTrack(),
    selectTrack: (i) => audioManager.selectTrack(i),
    setGameplayMusicPreferences: (preferences) => audioManager.setGameplayMusicPreferences(preferences),
    setGameOverTrack: (trackId) => audioManager.setGameOverTrack(trackId),
    gameplayMusicModes: GAMEPLAY_MUSIC_MODES,
    setBgmVolume: (v) => audioManager.setBgmVolume(v),
    setSfxVolume: (v) => audioManager.setSfxVolume(v),
    toggleMute: () => audioManager.toggleMute(),
    playClick: () => audioManager.playClick(),
    playWheelTick: () => audioManager.playWheelTick(),
    playRewardChime: () => audioManager.playRewardChime(),
  };
}
