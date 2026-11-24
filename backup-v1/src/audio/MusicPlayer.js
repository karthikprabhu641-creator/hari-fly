/**
 * Single-channel gameplay music player with selectable modes and a real gap
 * between tracks. Only the active track is loaded into the audio element.
 */

import { GAMEPLAY_MUSIC_MODES, GAMEPLAY_SONGS, SONG_UNLOCK_STORAGE_KEY } from '../config/audioConfig';
import { safeStorage } from '../utils/storage';

function isTrackUnlocked(track) {
  if (!track) return false;
  if (!track.price || track.price === 0) return true;
  const unlocked = safeStorage.getItem(SONG_UNLOCK_STORAGE_KEY, []);
  return Array.isArray(unlocked) && unlocked.includes(track.id);
}

export class MusicPlayer {
  constructor() {
    this.playlist = GAMEPLAY_SONGS;

    this.currentIndex = 0;
    this.audioElement = new Audio();
    this.audioElement.loop = false;
    this.audioElement.preload = 'auto';

    this.volume = 0.55;
    this.muted = false;
    this.isPlaying = false;
    this.mode = GAMEPLAY_MUSIC_MODES.FAVORITE;
    this.favoriteTrackId = this.playlist[0]?.id || null;
    this.gapTimer = null;
    this.playbackGeneration = 0;
    this.loadedSrc = '';

    this.audioElement.volume = this.volume;

    // Attach listeners
    this.audioElement.addEventListener('ended', () => {
      this.scheduleNextTrack();
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('[MusicPlayer] Audio load or playback error:', e);
    });
  }

  getCurrentTrack() {
    const track = this.playlist[this.currentIndex];
    if (track && isTrackUnlocked(track)) return track;
    // Find first unlocked track
    return this.playlist.find(isTrackUnlocked) || this.playlist[0] || null;
  }

  getMode() {
    return this.mode;
  }

  getFavoriteTrack() {
    const favorite = this.playlist.find((track) => track.id === this.favoriteTrackId);
    if (favorite && isTrackUnlocked(favorite)) {
      return favorite;
    }
    return this.playlist.find(isTrackUnlocked)
      || this.playlist[0]
      || null;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audioElement.volume = this.muted ? 0 : this.volume;
  }

  setMuted(muted) {
    this.muted = !!muted;
    this.audioElement.volume = this.muted ? 0 : this.volume;
  }

  async play() {
    const track = this.getCurrentTrack();
    if (!track) return;

    const generation = ++this.playbackGeneration;
    this.clearGapTimer();

    if (this.loadedSrc !== track.src) {
      this.audioElement.src = track.src;
      this.audioElement.load();
      this.loadedSrc = track.src;
    }

    try {
      this.audioElement.volume = this.muted ? 0 : this.volume;
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      if (generation === this.playbackGeneration) {
        this.isPlaying = true;
      }
    } catch (err) {
      if (generation !== this.playbackGeneration) return;

      // Autoplay policy restriction before user gesture
      this.isPlaying = false;
      console.warn('[MusicPlayer] Autoplay prevented until user gesture:', err.message);
    }
  }

  pause() {
    this.playbackGeneration += 1;
    this.clearGapTimer();
    this.audioElement.pause();
    this.isPlaying = false;
  }

  stop() {
    this.playbackGeneration += 1;
    this.clearGapTimer();
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.isPlaying = false;
  }

  restart() {
    this.stop();
    this.currentIndex = this.mode === GAMEPLAY_MUSIC_MODES.FAVORITE
      ? Math.max(0, this.playlist.findIndex((track) => track.id === this.favoriteTrackId))
      : 0;
    return this.play();
  }

  configure({ mode = this.mode, favoriteTrackId = this.favoriteTrackId } = {}) {
    const nextMode = Object.values(GAMEPLAY_MUSIC_MODES).includes(mode)
      ? mode
      : GAMEPLAY_MUSIC_MODES.FAVORITE;
    const favorite = this.playlist.find((track) => track.id === favoriteTrackId)
      || this.playlist[0];

    this.mode = nextMode;
    this.favoriteTrackId = favorite?.id || null;
    this.currentIndex = nextMode === GAMEPLAY_MUSIC_MODES.FAVORITE
      ? Math.max(0, this.playlist.findIndex((track) => track.id === this.favoriteTrackId))
      : 0;

    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  selectTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    this.configure({
      mode: GAMEPLAY_MUSIC_MODES.FAVORITE,
      favoriteTrackId: this.playlist[index].id,
    });
  }

  nextTrack() {
    if (this.playlist.length === 0) return;
    this.setCurrentIndex((this.currentIndex + 1) % this.playlist.length);
  }

  prevTrack() {
    if (this.playlist.length === 0) return;
    this.setCurrentIndex((this.currentIndex - 1 + this.playlist.length) % this.playlist.length);
  }

  setCurrentIndex(index) {
    this.currentIndex = index;
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  scheduleNextTrack() {
    const generation = ++this.playbackGeneration;
    this.clearGapTimer();
    this.gapTimer = window.setTimeout(() => {
      if (generation !== this.playbackGeneration || !this.isPlaying) return;
      if (this.mode === GAMEPLAY_MUSIC_MODES.PLAY_ALL) {
        // Find next unlocked track index
        let nextIdx = (this.currentIndex + 1) % this.playlist.length;
        let attempts = 0;
        while (!isTrackUnlocked(this.playlist[nextIdx]) && attempts < this.playlist.length) {
          nextIdx = (nextIdx + 1) % this.playlist.length;
          attempts++;
        }
        this.currentIndex = nextIdx;
      }
      this.play();
    }, 1000);
  }

  clearGapTimer() {
    if (this.gapTimer !== null) {
      window.clearTimeout(this.gapTimer);
      this.gapTimer = null;
    }
  }
}
