/**
 * Audio Manager
 * Singleton audio coordinator combining Web Audio SFX and HTML5 BGM player.
 * Manages mobile audio-unlock lifecycle, volume controls, and storage persistence.
 */

import { GAME_CONFIG } from '../config/gameConfig';
import { safeStorage } from '../utils/storage';
import { SoundEffects } from './SoundEffects';
import { MusicPlayer } from './MusicPlayer';
import { GAME_OVER_SONGS, GAMEPLAY_MUSIC_MODES } from '../config/audioConfig';

class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.sfx = null;
    this.music = new MusicPlayer();
    this.isUnlocked = false;
    this.listeners = new Set();

    // Load persisted settings
    this.bgmVolume = safeStorage.getNumber(
      GAME_CONFIG.AUDIO.STORAGE_KEY_BGM,
      GAME_CONFIG.AUDIO.DEFAULT_BGM_VOLUME
    );
    this.sfxVolume = safeStorage.getNumber(
      GAME_CONFIG.AUDIO.STORAGE_KEY_SFX,
      GAME_CONFIG.AUDIO.DEFAULT_SFX_VOLUME
    );
    this.isMuted = !!safeStorage.getItem(GAME_CONFIG.AUDIO.STORAGE_KEY_MUTE, false);

    this.gameOverSongs = GAME_OVER_SONGS;
    this.gameOverTrackId = this.getStoredGameOverTrackId();

    this.music.setVolume(this.bgmVolume);
    this.music.setMuted(this.isMuted);
    this.music.configure({
      mode: safeStorage.getItem(
        GAME_CONFIG.AUDIO.STORAGE_KEY_GAMEPLAY_MODE,
        GAMEPLAY_MUSIC_MODES.FAVORITE
      ),
      favoriteTrackId: safeStorage.getItem(
        GAME_CONFIG.AUDIO.STORAGE_KEY_FAVORITE_TRACK,
        this.music.playlist[0]?.id
      ),
    });

    // Dedicated Out Music element
    this.outAudio = new Audio();
    this.outAudio.preload = 'auto';
    this.outAudio.volume = this.isMuted ? 0 : this.bgmVolume;

    this.setupUnlockListeners();
  }

  getStoredGameOverTrackId() {
    const storedId = safeStorage.getItem(
      GAME_CONFIG.AUDIO.STORAGE_KEY_GAME_OVER_TRACK,
      this.gameOverSongs[0]?.id
    );
    return this.gameOverSongs.some((track) => track.id === storedId)
      ? storedId
      : this.gameOverSongs[0]?.id;
  }

  getGameOverTrack() {
    return this.gameOverSongs.find((track) => track.id === this.gameOverTrackId)
      || this.gameOverSongs[0]
      || null;
  }

  setupUnlockListeners() {
    if (typeof window === 'undefined') return;

    const unlockHandler = () => {
      this.unlock();
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };

    window.addEventListener('pointerdown', unlockHandler, { once: true });
    window.addEventListener('touchstart', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });
  }

  unlock() {
    if (this.isUnlocked) return;

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        if (!this.audioCtx) {
          this.audioCtx = new AudioCtxClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        this.sfx = new SoundEffects(this.audioCtx);
        this.sfx.setVolume(this.sfxVolume);
        this.sfx.setMuted(this.isMuted);
      }
      this.isUnlocked = true;
      this.notify();
    } catch (e) {
      console.warn('[AudioManager] Failed to initialize AudioContext:', e);
    }
  }

  // SFX Methods
  playFlap() {
    this.sfx?.playFlap();
  }

  playScore() {
    this.sfx?.playScore();
  }

  playHit() {
    this.sfx?.playHit();
  }

  playGameOver() {
    // Pause background music immediately upon death
    this.music.pause();
    this.notify();
    this.sfx?.playGameOver();

    // Play meme / comedy out music
    try {
      if (this.outAudio) {
        const track = this.getGameOverTrack();
        if (track && !this.outAudio.src.includes(track.src)) {
          this.outAudio.src = track.src;
          this.outAudio.load();
        }
        this.outAudio.currentTime = 0;
        this.outAudio.muted = this.isMuted;
        this.outAudio.volume = this.isMuted ? 0 : this.bgmVolume;
        const playPromise = this.outAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => console.warn('[AudioManager] Out audio playback prevented:', err));
        }
      }
    } catch (e) {
      console.warn('[AudioManager] Failed to play out audio:', e);
    }
  }

  stopOutMusic() {
    if (this.outAudio) {
      this.outAudio.pause();
      this.outAudio.currentTime = 0;
    }
  }

  playClick() {
    this.sfx?.playClick();
  }

  // Music Methods
  playMusic() {
    this.stopOutMusic();
    if (!this.isUnlocked) {
      this.unlock();
    }
    this.music.play();
    this.notify();
  }

  restartMusic() {
    this.stopOutMusic();
    if (!this.isUnlocked) {
      this.unlock();
    }
    this.music.restart();
    this.notify();
  }

  setGameplayMusicPreferences({ mode, favoriteTrackId }) {
    this.music.configure({ mode, favoriteTrackId });
    safeStorage.setItem(GAME_CONFIG.AUDIO.STORAGE_KEY_GAMEPLAY_MODE, this.music.getMode());
    safeStorage.setItem(
      GAME_CONFIG.AUDIO.STORAGE_KEY_FAVORITE_TRACK,
      this.music.getFavoriteTrack()?.id || ''
    );
    this.notify();
  }

  setGameOverTrack(trackId) {
    if (!this.gameOverSongs.some((track) => track.id === trackId)) return;
    this.gameOverTrackId = trackId;
    safeStorage.setItem(GAME_CONFIG.AUDIO.STORAGE_KEY_GAME_OVER_TRACK, trackId);
    this.stopOutMusic();
    this.notify();
  }

  pauseMusic() {
    this.music.pause();
    this.stopOutMusic();
    this.notify();
  }

  nextTrack() {
    this.music.nextTrack();
    this.notify();
  }

  prevTrack() {
    this.music.prevTrack();
    this.notify();
  }

  selectTrack(index) {
    this.music.selectTrack(index);
    this.notify();
  }

  // Settings
  setBgmVolume(val) {
    this.bgmVolume = val;
    this.music.setVolume(val);
    if (this.outAudio) {
      this.outAudio.volume = this.isMuted ? 0 : val;
    }
    safeStorage.setNumber(GAME_CONFIG.AUDIO.STORAGE_KEY_BGM, val);
    this.notify();
  }

  setSfxVolume(val) {
    this.sfxVolume = val;
    this.sfx?.setVolume(val);
    safeStorage.setNumber(GAME_CONFIG.AUDIO.STORAGE_KEY_SFX, val);
    this.notify();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.music.setMuted(this.isMuted);
    this.sfx?.setMuted(this.isMuted);
    if (this.outAudio) {
      this.outAudio.muted = this.isMuted;
      this.outAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    safeStorage.setItem(GAME_CONFIG.AUDIO.STORAGE_KEY_MUTE, this.isMuted);
    this.notify();
    return this.isMuted;
  }

  // Observer
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    const state = {
      isUnlocked: this.isUnlocked,
      isMuted: this.isMuted,
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
      isPlayingMusic: this.music.isPlaying,
      currentTrack: this.music.getCurrentTrack(),
      playlist: this.music.playlist,
      gameplayMode: this.music.getMode(),
      favoriteTrack: this.music.getFavoriteTrack(),
      gameOverTrack: this.getGameOverTrack(),
      gameOverSongs: this.gameOverSongs,
    };
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error('[AudioManager] Listener error:', err);
      }
    });
  }
}

export const audioManager = new AudioManager();
