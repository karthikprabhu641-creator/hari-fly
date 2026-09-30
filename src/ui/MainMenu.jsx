/**
 * Main Menu Screen
 * Displayed on launch and after returning from game over.
 * Features custom bird avatar preview, best score, audio controls, and start action.
 */

import React from 'react';
import { useAudio } from '../hooks/useAudio';
import { GAMEPLAY_MUSIC_MODES } from '../config/audioConfig';
import birdImage from '../../image/bird-transparent.png';

export function MainMenu({ bestScore, onStart, onOpenSettings }) {
  const {
    currentTrack,
    playlist,
    gameplayMode,
    favoriteTrack,
    gameOverTrack,
    gameOverSongs,
    setGameplayMusicPreferences,
    setGameOverTrack,
    playClick,
  } = useAudio();

  const handleStart = (e) => {
    e.stopPropagation();
    playClick();
    onStart();
  };

  const handleSettings = (e) => {
    e.stopPropagation();
    playClick();
    onOpenSettings();
  };

  const handleModeChange = (e) => {
    e.stopPropagation();
    setGameplayMusicPreferences({
      mode: e.target.value,
      favoriteTrackId: favoriteTrack?.id,
    });
  };

  const handleFavoriteChange = (e) => {
    e.stopPropagation();
    setGameplayMusicPreferences({
      mode: gameplayMode,
      favoriteTrackId: e.target.value,
    });
  };

  const handleGameOverChange = (e) => {
    e.stopPropagation();
    setGameOverTrack(e.target.value);
  };

  return (
    <div className="main-menu-screen" id="main-menu-overlay">
      <header className="main-menu-topbar">
        <button className="main-menu-settings" onClick={handleSettings} id="main-menu-settings-btn">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19.14 12.94a7.9 7.9 0 0 0 0-1.88l2.03-1.58-2-3.46-2.39.96a7.3 7.3 0 0 0-1.63-.94L14.8 3.5h-4l-.36 2.54a7.3 7.3 0 0 0-1.63.94l-2.39-.96-2 3.46 2.03 1.58a7.9 7.9 0 0 0 0 1.88l-2.03 1.58 2 3.46 2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54h4l.36-2.54c.58-.22 1.13-.54 1.63-.94l2.39.96 2-3.46-2.04-1.58ZM12.8 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" /></svg>
          <span>Audio settings</span>
        </button>
      </header>

      <main className="main-menu-hero">
        <section className="main-menu-copy">
          <h1 className="main-menu-title">HARI<span>.</span><br />FLY</h1>

          <div className="main-menu-best">
            <span>PERSONAL BEST</span>
            <strong id="main-menu-best-score">{bestScore}</strong>
          </div>

          <button className="main-menu-start" onClick={handleStart} id="start-game-btn">
            <span>START FLYING</span>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </button>
          <p className="main-menu-controls"><kbd>SPACE</kbd><span>or tap anywhere to flap</span></p>
        </section>

        <section className="main-menu-art" aria-label="Your bird pilot">
          <img className="main-menu-bird" src={birdImage} alt="Your bird pilot, ready for takeoff" />
        </section>
      </main>

      <footer className="main-menu-footer">
        <details className="music-selection-panel main-menu-music">
          <summary><span className="music-note">♫</span> SOUNDTRACK</summary>
          <div className="music-selection-content">
            <div className="music-selection-group">
              <span className="music-selection-label">Gameplay Music</span>
              <div className="music-mode-options">
                <label className="music-mode-option">
                  <input type="radio" name="gameplay-music-mode" value={GAMEPLAY_MUSIC_MODES.FAVORITE} checked={gameplayMode === GAMEPLAY_MUSIC_MODES.FAVORITE} onChange={handleModeChange} />
                  <span>Favourite song</span>
                </label>
                <label className="music-mode-option">
                  <input type="radio" name="gameplay-music-mode" value={GAMEPLAY_MUSIC_MODES.PLAY_ALL} checked={gameplayMode === GAMEPLAY_MUSIC_MODES.PLAY_ALL} onChange={handleModeChange} />
                  <span>Play all songs</span>
                </label>
              </div>
            </div>
            <label className="music-select-row">
              <span>Favourite Song</span>
              <select value={favoriteTrack?.id || ''} onChange={handleFavoriteChange}>
                {playlist.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
              </select>
            </label>
            <label className="music-select-row">
              <span>Game Over Music</span>
              <select value={gameOverTrack?.id || ''} onChange={handleGameOverChange}>
                {gameOverSongs.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
              </select>
            </label>
          </div>
        </details>

        {currentTrack && (
          <div className="main-menu-now-playing">
            <span className="now-playing-dot" />
            <span>UP NEXT</span>
            <strong>{currentTrack.name}</strong>
          </div>
        )}
      </footer>
    </div>
  );
}
