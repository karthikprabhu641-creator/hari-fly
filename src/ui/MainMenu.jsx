/**
 * Main Menu Screen
 * Displayed on launch and after returning from game over.
 * Features custom bird avatar preview, best score, audio controls, and start action.
 */

import React, { useState, useEffect } from 'react';
import { useAudio } from '../hooks/useAudio';
import { GAMEPLAY_MUSIC_MODES } from '../config/audioConfig';
import { MAP_LIST } from '../config/mapConfig';
import birdImage from '../../image/bird-transparent.png';
import { WalletDisplay } from './WalletDisplay';
import { ModesModal } from './ModesModal';
import { SongSelectionModal } from './SongSelectionModal';
import {
  LuckyWheelModal,
  LUCKY_WHEEL_COOLDOWN_MS,
  LUCKY_WHEEL_STORAGE_KEY,
  formatCooldown,
} from './LuckyWheelModal';
import { safeStorage } from '../utils/storage';

export function MainMenu({
  bestScore,
  coins,
  keys,
  selectedMapId,
  onSelectMap,
  onStart,
  onOpenSettings,
  onClaimReward,
}) {
  const [showModes, setShowModes] = useState(false);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [showSongSelection, setShowSongSelection] = useState(false);

  const [wheelCooldownRemaining, setWheelCooldownRemaining] = useState(() => {
    const last = safeStorage.getNumber(LUCKY_WHEEL_STORAGE_KEY, 0);
    return Math.max(0, LUCKY_WHEEL_COOLDOWN_MS - (Date.now() - last));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const last = safeStorage.getNumber(LUCKY_WHEEL_STORAGE_KEY, 0);
      setWheelCooldownRemaining(Math.max(0, LUCKY_WHEEL_COOLDOWN_MS - (Date.now() - last)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isWheelReady = wheelCooldownRemaining <= 0;

  const {
    currentTrack,
    gameplayMode,
    favoriteTrack,
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

  const handleOpenModes = (e) => {
    e.stopPropagation();
    playClick();
    setShowModes(true);
  };

  const handleCloseModes = () => {
    setShowModes(false);
  };

  const handleOpenSongSelection = (e) => {
    e.stopPropagation();
    playClick();
    setShowSongSelection(true);
  };

  const handleCloseSongSelection = () => {
    setShowSongSelection(false);
  };

  const handleOpenLuckyWheel = (e) => {
    e.stopPropagation();
    playClick();
    setShowLuckyWheel(true);
  };

  const handleCloseLuckyWheel = () => {
    setShowLuckyWheel(false);
  };

  const currentMap = MAP_LIST.find((map) => map.id === selectedMapId) || MAP_LIST[0];

  return (
    <div className="main-menu-screen" id="main-menu-overlay">
      <header className="main-menu-topbar">
        <div className="main-menu-topbar-left">
          <WalletDisplay coins={coins} keys={keys} className="main-menu-wallet" />

          {/* Lucky Wheel Entry Button next to Coins and Keys */}
          <button
            className={`main-menu-lucky-wheel-btn${isWheelReady ? ' is-ready' : ''}`}
            onClick={handleOpenLuckyWheel}
            id="main-menu-lucky-wheel-btn"
            type="button"
            aria-label="Open Lucky Wheel"
          >
            <span className="lucky-wheel-btn-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="lucky-wheel-btn-svg">
                <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M5.3 18.7L18.7 5.3" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="12" cy="12" r="2.8" fill="#facc15" stroke="#713f12" strokeWidth="0.8" />
              </svg>
              {isWheelReady && <span className="lucky-wheel-pulse-dot" />}
            </span>
            <span className="lucky-wheel-btn-info">
              <span className="lucky-wheel-btn-name">LUCKY WHEEL</span>
              {isWheelReady ? (
                <span className="lucky-wheel-btn-badge">FREE SPIN</span>
              ) : (
                <span className="lucky-wheel-btn-timer">{formatCooldown(wheelCooldownRemaining)}</span>
              )}
            </span>
          </button>
        </div>

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

          <div className="main-menu-actions">
            {/* Primary Action: Start Flying */}
            <button className="main-menu-start" onClick={handleStart} id="start-game-btn">
              <span>START FLYING</span>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>

            {/* Secondary Action 1: Game Modes */}
            <button
              className="main-menu-modes-btn"
              onClick={handleOpenModes}
              id="main-menu-modes-btn"
              type="button"
              aria-label={`Open game modes. Currently selected: ${currentMap.name}`}
            >
              <span className="main-menu-modes-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </span>
              <span className="main-menu-modes-label-group">
                <span className="main-menu-modes-title">MODES</span>
                <span className="main-menu-modes-current">{currentMap.name}</span>
              </span>
              <span className="main-menu-modes-arrow" aria-hidden="true">→</span>
            </button>

            {/* Secondary Action 2: Soundtrack / Song Selection (Placed right below MODES button) */}
            <button
              className="main-menu-modes-btn main-menu-music-btn"
              onClick={handleOpenSongSelection}
              id="main-menu-song-select-btn"
              type="button"
              aria-label="Open Soundtrack and Song Selection Menu"
            >
              <span className="main-menu-modes-icon main-menu-music-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </span>
              <span className="main-menu-modes-label-group">
                <span className="main-menu-modes-title">SOUNDTRACK</span>
                <span className="main-menu-modes-current">
                  {gameplayMode === GAMEPLAY_MUSIC_MODES.PLAY_ALL ? 'Play All Songs' : (favoriteTrack?.name || 'Blue Eyes')}
                </span>
              </span>
              <span className="main-menu-modes-arrow" aria-hidden="true">→</span>
            </button>
          </div>

          <p className="main-menu-controls"><kbd>SPACE</kbd><span>or tap anywhere to flap</span></p>
        </section>

        <section className="main-menu-art" aria-label="Your bird pilot">
          <img className="main-menu-bird" src={birdImage} alt="Your bird pilot, ready for takeoff" />
        </section>
      </main>

      <footer className="main-menu-footer">
        {currentTrack && (
          <div className="main-menu-now-playing">
            <span className="now-playing-dot" />
            <span>UP NEXT</span>
            <strong>{currentTrack.name}</strong>
          </div>
        )}
      </footer>

      {showModes && (
        <ModesModal
          selectedMapId={selectedMapId}
          onSelectMap={onSelectMap}
          onStart={onStart}
          onClose={handleCloseModes}
          coins={coins}
          keys={keys}
        />
      )}

      {showSongSelection && (
        <SongSelectionModal
          onClose={handleCloseSongSelection}
        />
      )}

      {showLuckyWheel && (
        <LuckyWheelModal
          onClose={handleCloseLuckyWheel}
          onClaimReward={onClaimReward}
          coins={coins}
          keys={keys}
        />
      )}
    </div>
  );
}

