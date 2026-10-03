/**
 * Song Selection Modal Component
 * UI for selecting gameplay music modes (Favorite vs Play All),
 * picking favorite track, auditioning/previewing songs, and selecting Game Over music.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';
import { GAMEPLAY_MUSIC_MODES } from '../config/audioConfig';

export function SongSelectionModal({ onClose }) {
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

  const handleSelectFavorite = (trackId) => {
    playClick();
    setGameplayMusicPreferences({
      mode: gameplayMode,
      favoriteTrackId: trackId,
    });
  };

  const handleSelectGameOverTrack = (trackId) => {
    playClick();
    setGameOverTrack(trackId);
  };

  const handleTogglePreview = (track) => {
    playClick();
    if (previewTrackId === track.id) {
      // Pause
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPreviewTrackId(null);
    } else {
      // Play new preview
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      const audio = new Audio(track.src);
      audio.volume = 0.7;
      audio.play().catch((err) => console.warn('Preview play error:', err));
      audio.onended = () => setPreviewTrackId(null);
      audioPreviewRef.current = audio;
      setPreviewTrackId(track.id);
    }
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
                  <p>Rotate and shuffle through all songs during gameplay</p>
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
                const isFavorite = favoriteTrack?.id === track.id;
                const isPreviewing = previewTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    className={`song-card${isFavorite ? ' is-favorite' : ''}`}
                    onClick={() => handleSelectFavorite(track.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="song-card-left">
                      <div className="song-card-disc-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                      <div className="song-card-meta">
                        <span className="song-card-title">{track.name}</span>
                        <span className="song-card-artist">{track.artist || 'Gameplay Music'}</span>
                      </div>
                    </div>

                    <div className="song-card-right">
                      {/* Preview Button */}
                      <button
                        type="button"
                        className={`song-preview-btn${isPreviewing ? ' is-playing' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePreview(track);
                        }}
                        aria-label={isPreviewing ? `Pause ${track.name}` : `Preview ${track.name}`}
                      >
                        {isPreviewing ? (
                          <>
                            <span className="pause-icon">⏸</span>
                            <span>PLAYING</span>
                          </>
                        ) : (
                          <>
                            <span className="play-icon">▶</span>
                            <span>PREVIEW</span>
                          </>
                        )}
                      </button>

                      {/* Favorite Badge / Button */}
                      <button
                        type="button"
                        className={`song-fav-btn${isFavorite ? ' is-active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFavorite(track.id);
                        }}
                      >
                        {isFavorite ? '★ FAVOURITE' : 'SET FAVOURITE'}
                      </button>
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
            CONFIRM & CLOSE
          </button>
        </footer>
      </div>
    </div>
  );
}
