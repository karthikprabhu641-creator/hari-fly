/**
 * Song Selection Modal Component
 * UI for selecting gameplay music modes (Favorite vs Play All),
 * picking favorite track, auditioning/previewing songs, and selecting Game Over music.
 * Locked songs (price > 0) require 30 coins to unlock.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';
import { GAMEPLAY_MUSIC_MODES, SONG_UNLOCK_STORAGE_KEY } from '../config/audioConfig';
import { safeStorage } from '../utils/storage';
import coinImage from '../../image/coin.png';

/** Returns true if a song is unlocked (free or already purchased). */
function getUnlockedIds() {
  return safeStorage.getItem(SONG_UNLOCK_STORAGE_KEY, []);
}

function isSongUnlocked(songId, price) {
  if (price === 0) return true;
  const unlocked = getUnlockedIds();
  return Array.isArray(unlocked) && unlocked.includes(songId);
}

function unlockSong(songId) {
  const unlocked = getUnlockedIds();
  const set = new Set(Array.isArray(unlocked) ? unlocked : []);
  set.add(songId);
  safeStorage.setItem(SONG_UNLOCK_STORAGE_KEY, [...set]);
}

export function SongSelectionModal({ onClose, coins = 0, onSpendCoins }) {
  const {
    playlist,
    gameplayMode,
    favoriteTrack,
    gameOverTrack,
    gameOverSongs,
    setGameplayMusicPreferences,
    setGameOverTrack,
    playClick,
  } = useAudio();

  const [previewTrackId, setPreviewTrackId] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState(() => getUnlockedIds());
  const [purchaseError, setPurchaseError] = useState(null); // trackId that failed (insufficient coins)
  const audioPreviewRef = useRef(null);

  // Stop preview audio when modal unmounts
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        playClick();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playClick]);

  // Clear purchase error after 2s
  useEffect(() => {
    if (!purchaseError) return;
    const t = setTimeout(() => setPurchaseError(null), 2000);
    return () => clearTimeout(t);
  }, [purchaseError]);

  const handleClose = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    onClose();
  };

  const handleBack = (e) => {
    e.stopPropagation();
    playClick();
    handleClose();
  };

  const handleSelectMode = (mode) => {
    playClick();
    setGameplayMusicPreferences({
      mode,
      favoriteTrackId: favoriteTrack?.id || playlist[0]?.id,
    });
  };

  const handleSelectFavorite = (track) => {
    const unlocked = isSongUnlocked(track.id, track.price);
    if (!unlocked) return; // Can't select locked song
    playClick();
    setGameplayMusicPreferences({
      mode: gameplayMode,
      favoriteTrackId: track.id,
    });
  };

  const handleSelectGameOverTrack = (trackId) => {
    playClick();
    setGameOverTrack(trackId);
  };

  const handleTogglePreview = (track) => {
    // Can preview locked songs too (15s auto-stop would be nice, but just allow full for now)
    playClick();
    if (previewTrackId === track.id) {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      setPreviewTrackId(null);
    } else {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      const audio = new Audio(track.src);
      audio.volume = 0.7;
      audio.play().catch((err) => console.warn('Preview play error:', err));
      audio.onended = () => setPreviewTrackId(null);
      audioPreviewRef.current = audio;
      setPreviewTrackId(track.id);
    }
  };

  const handleUnlockSong = (e, track) => {
    e.stopPropagation();
    playClick();
    if (coins < track.price) {
      setPurchaseError(track.id);
      return;
    }
    const ok = onSpendCoins?.(track.price);
    if (!ok) {
      setPurchaseError(track.id);
      return;
    }
    unlockSong(track.id);
    setUnlockedIds(getUnlockedIds());
    // Auto-select as favourite after unlocking
    setGameplayMusicPreferences({ mode: gameplayMode, favoriteTrackId: track.id });
  };

  return (
    <div className="song-select-backdrop" id="song-select-overlay" onClick={handleBack}>
      <div className="song-select-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="song-select-header">
          <div className="song-select-header-left">
            <button
              className="song-select-back-btn"
              onClick={handleBack}
              id="song-select-back-btn"
              type="button"
              aria-label="Back to main menu"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              <span>BACK</span>
            </button>
            <div className="song-select-titles">
              <h1 className="song-select-title">SOUNDTRACK MENU</h1>
              <p className="song-select-subtitle">Select music mode and set your favorite flight songs</p>
            </div>
          </div>

          {/* Coin balance display */}
          <div className="song-select-wallet">
            <img src={coinImage} alt="coins" className="song-select-coin-img" />
            <span className="song-select-coin-count">{coins}</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="song-select-scroll-area">
          {/* Section 1: Playback Mode */}
          <section className="song-select-section">
            <h2 className="song-section-heading">PLAYBACK MODE</h2>
            <div className="music-mode-cards">
              <div
                className={`music-mode-card${gameplayMode === GAMEPLAY_MUSIC_MODES.FAVORITE ? ' is-active' : ''}`}
                onClick={() => handleSelectMode(GAMEPLAY_MUSIC_MODES.FAVORITE)}
                role="button"
                tabIndex={0}
              >
                <div className="music-mode-card-icon">★</div>
                <div className="music-mode-card-info">
                  <h3>Favourite Song</h3>
                  <p>Always play your chosen favorite song on every flight</p>
                </div>
                <div className="music-mode-card-radio">
                  <span className="radio-circle" />
                </div>
              </div>

              <div
                className={`music-mode-card${gameplayMode === GAMEPLAY_MUSIC_MODES.PLAY_ALL ? ' is-active' : ''}`}
                onClick={() => handleSelectMode(GAMEPLAY_MUSIC_MODES.PLAY_ALL)}
                role="button"
                tabIndex={0}
              >
                <div className="music-mode-card-icon">🔀</div>
                <div className="music-mode-card-info">
                  <h3>Play All Songs</h3>
                  <p>Rotate and shuffle through all unlocked songs during gameplay</p>
                </div>
                <div className="music-mode-card-radio">
                  <span className="radio-circle" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Song Selection */}
          <section className="song-select-section">
            <div className="song-section-heading-row">
              <h2 className="song-section-heading">GAMEPLAY TRACKS</h2>
              <span className="song-section-kicker">
                Selected: <strong>{favoriteTrack?.name || 'Blue Eyes'}</strong>
              </span>
            </div>

            <div className="song-cards-list">
              {playlist.map((track) => {
                const isUnlocked = isSongUnlocked(track.id, track.price);
                const isFavorite = favoriteTrack?.id === track.id;
                const isPreviewing = previewTrackId === track.id;
                const hasError = purchaseError === track.id;
                const canAfford = coins >= (track.price || 0);

                return (
                  <div
                    key={track.id}
                    className={`song-card${isFavorite ? ' is-favorite' : ''}${!isUnlocked ? ' is-locked' : ''}`}
                    onClick={() => isUnlocked && handleSelectFavorite(track)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="song-card-left">
                      {/* Lock / disc icon */}
                      <div className={`song-card-disc-icon${!isUnlocked ? ' locked' : ''}`}>
                        {isUnlocked ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                          </svg>
                        )}
                      </div>
                      <div className="song-card-meta">
                        <span className="song-card-title">{track.name}</span>
                        <span className="song-card-artist">
                          {isUnlocked
                            ? (track.price === 0 ? '🎁 Free' : track.artist || 'Gameplay Music')
                            : `🔒 Locked · ${track.price} coins`}
                        </span>
                      </div>
                    </div>

                    <div className="song-card-right">
                      {isUnlocked ? (
                        <>
                          {/* Preview Button */}
                          <button
                            type="button"
                            className={`song-preview-btn${isPreviewing ? ' is-playing' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleTogglePreview(track); }}
                            aria-label={isPreviewing ? `Pause ${track.name}` : `Preview ${track.name}`}
                          >
                            {isPreviewing ? (
                              <><span className="pause-icon">⏸</span><span>PLAYING</span></>
                            ) : (
                              <><span className="play-icon">▶</span><span>PREVIEW</span></>
                            )}
                          </button>

                          {/* Favourite Button */}
                          <button
                            type="button"
                            className={`song-fav-btn${isFavorite ? ' is-active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleSelectFavorite(track); }}
                          >
                            {isFavorite ? '★ FAVOURITE' : 'SET FAVOURITE'}
                          </button>
                        </>
                      ) : (
                        <div className="song-unlock-area">
                          {hasError && (
                            <span className="song-unlock-error">
                              {canAfford ? 'Purchase failed' : 'Not enough coins!'}
                            </span>
                          )}
                          <button
                            type="button"
                            className={`song-unlock-btn${!canAfford ? ' cant-afford' : ''}`}
                            onClick={(e) => handleUnlockSong(e, track)}
                            aria-label={`Unlock ${track.name} for ${track.price} coins`}
                          >
                            <img src={coinImage} alt="coin" className="unlock-btn-coin" />
                            <span>UNLOCK · {track.price}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Game Over Music */}
          {gameOverSongs && gameOverSongs.length > 0 && (
            <section className="song-select-section">
              <h2 className="song-section-heading">GAME OVER SOUNDTRACK</h2>
              <div className="gameover-song-row">
                {gameOverSongs.map((track) => {
                  const isSelected = gameOverTrack?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      className={`gameover-song-chip${isSelected ? ' is-selected' : ''}`}
                      onClick={() => handleSelectGameOverTrack(track.id)}
                    >
                      <span className="chip-icon">💀</span>
                      <span className="chip-name">{track.name}</span>
                      {isSelected && <span className="chip-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="song-select-footer">
          <button
            type="button"
            className="song-select-done-btn"
            onClick={handleBack}
            id="song-select-done-btn"
          >
            CONFIRM &amp; CLOSE
          </button>
        </footer>
      </div>
    </div>
  );
}
