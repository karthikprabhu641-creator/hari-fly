/**
 * Main Menu Screen
 * Displayed on launch (after loading screen) and after returning from game over.
 * Features bird avatar preview, best score, audio controls,
 * modes selection, soundtrack shop, and lucky wheel.
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
import { isMobileDevice, isFullscreen, requestFullscreen, toggleFullscreen } from '../utils/device';

function formatWheelTimer(ms) {
  if (ms <= 0) return 'FREE';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function MainMenu({
  bestScore,
  coins,
  keys,
  selectedMapId,
  onSelectMap,
  onStart,
  onOpenSettings,
  onClaimReward,
  onSpendCoins,
  onSpendKeys,
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

  const [isFullscreenActive, setIsFullscreenActive] = useState(() => isFullscreen());

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreenActive(isFullscreen());
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  const handleToggleFullscreen = (e) => {
    e.stopPropagation();
    playClick();
    toggleFullscreen();
  };

  const {
    currentTrack,
    gameplayMode,
    favoriteTrack,
    playClick,
  } = useAudio();

  const handleStart = (e) => {
    e.stopPropagation();
    playClick();
    if (isMobileDevice() && !isFullscreen()) {
      requestFullscreen();
    }
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

  const handleCloseModes = () => setShowModes(false);

  const handleOpenLuckyWheel = (e) => {
    e.stopPropagation();
    playClick();
    setShowLuckyWheel(true);
  };

  const handleCloseLuckyWheel = () => setShowLuckyWheel(false);

  const handleOpenSongSelection = (e) => {
    e.stopPropagation();
    playClick();
    setShowSongSelection(true);
  };

  const handleCloseSongSelection = () => setShowSongSelection(false);

  const currentMap = MAP_LIST.find((map) => map.id === selectedMapId) || MAP_LIST[0];

  return (
    <div className="main-menu-screen" id="main-menu-overlay">
      <header className="main-menu-topbar">
        <div className="main-menu-topbar-left">
          <WalletDisplay coins={coins} keys={keys} className="main-menu-wallet" />

          {/* Lucky Wheel Entry with Timer below wheel */}
          <div className="main-menu-lucky-wheel-wrapper">
            <button
              className={`main-menu-lucky-wheel-btn${isWheelReady ? ' is-ready' : ''}`}
              onClick={handleOpenLuckyWheel}
              id="main-menu-lucky-wheel-btn"
              type="button"
              aria-label={isWheelReady ? 'Lucky Wheel - Free Spin Ready!' : `Lucky Wheel - Next spin in ${formatCooldown(wheelCooldownRemaining)}`}
              title={isWheelReady ? 'Lucky Wheel - Free Spin Ready!' : `Lucky Wheel (${formatCooldown(wheelCooldownRemaining)})`}
            >
              <span className="lucky-wheel-btn-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 32 32" className="lucky-wheel-btn-svg">
                  <g className="lucky-wheel-spinner">
                    {/* Wheel Sectors with vibrant game colors */}
                    <path d="M16 16 L16 3 A13 13 0 0 1 25.19 6.81 Z" fill="#f59e0b" />
                    <path d="M16 16 L25.19 6.81 A13 13 0 0 1 29 16 Z" fill="#38bdf8" />
                    <path d="M16 16 L29 16 A13 13 0 0 1 25.19 25.19 Z" fill="#ec4899" />
                    <path d="M16 16 L25.19 25.19 A13 13 0 0 1 16 29 Z" fill="#22c55e" />
                    <path d="M16 16 L16 29 A13 13 0 0 1 6.81 25.19 Z" fill="#a855f7" />
                    <path d="M16 16 L6.81 25.19 A13 13 0 0 1 3 16 Z" fill="#facc15" />
                    <path d="M16 16 L3 16 A13 13 0 0 1 6.81 6.81 Z" fill="#06b6d4" />
                    <path d="M16 16 L6.81 6.81 A13 13 0 0 1 16 3 Z" fill="#ef4444" />
                    {/* Spoke divider lines */}
                    <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                    <path d="M16 3v26M3 16h26M6.81 6.81l18.38 18.38M6.81 25.19L25.19 6.81" stroke="rgba(15,23,42,0.6)" strokeWidth="0.8" />
                    {/* Outer rim */}
                    <circle cx="16" cy="16" r="13.2" fill="none" stroke="#facc15" strokeWidth="1.6" />
                    {/* Center hub */}
                    <circle cx="16" cy="16" r="4.2" fill="#0f172a" stroke="#facc15" strokeWidth="1.4" />
                    <circle cx="16" cy="16" r="1.8" fill="#facc15" />
                  </g>
                  {/* Pointer indicator at top (pointing down) */}
                  <polygon points="16,1 13.6,5.2 18.4,5.2" fill="#facc15" stroke="#78350f" strokeWidth="0.6" />
                </svg>
                {isWheelReady && <span className="lucky-wheel-pulse-dot" />}
              </span>
            </button>
            <span
              className={`lucky-wheel-sub-timer${isWheelReady ? ' is-ready' : ''}`}
              id="lucky-wheel-timer-badge"
            >
              {isWheelReady ? 'FREE' : formatWheelTimer(wheelCooldownRemaining)}
            </span>
          </div>
        </div>

        <div className="main-menu-topbar-right">
          <button
            className="main-menu-icon-btn main-menu-fullscreen-btn"
            onClick={handleToggleFullscreen}
            id="main-menu-fullscreen-btn"
            type="button"
            aria-label={isFullscreenActive ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            title={isFullscreenActive ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreenActive ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" fill="currentColor"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/>
              </svg>
            )}
          </button>

          <button className="main-menu-settings" onClick={handleSettings} id="main-menu-settings-btn" aria-label="Open audio settings">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19.14 12.94a7.9 7.9 0 0 0 0-1.88l2.03-1.58-2-3.46-2.39.96a7.3 7.3 0 0 0-1.63-.94L14.8 3.5h-4l-.36 2.54a7.3 7.3 0 0 0-1.63.94l-2.39-.96-2 3.46 2.03 1.58a7.9 7.9 0 0 0 0 1.88l-2.03 1.58 2 3.46 2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54h4l.36-2.54c.58-.22 1.13-.54 1.63-.94l2.39.96 2-3.46-2.04-1.58ZM12.8 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" /></svg>
            <span>Settings</span>
          </button>
        </div>
      </header>

      <main className="main-menu-hero">
        <section className="main-menu-copy">
          <h1 className="main-menu-title">
            <span className="title-text-hari">HARI</span>
            <span className="title-dot">.</span>
            <span className="title-text-fly">FLY</span>
          </h1>

          <div className="main-menu-best">
            <span className="best-label">
              <span className="best-trophy-icon" aria-hidden="true">🏆</span>
              PERSONAL BEST
            </span>
            <strong id="main-menu-best-score">{bestScore}</strong>
          </div>

          <div className="main-menu-actions">
            {/* Primary Action: Start Flying with Ultra-Fluid Gaming Animation */}
            <button
              className="main-menu-start animated-hero-start"
              onClick={handleStart}
              id="start-game-btn"
              type="button"
              aria-label="Start Flying"
            >
              <span className="start-btn-halo" aria-hidden="true" />
              <span className="start-btn-beam" aria-hidden="true" />
              <span className="start-btn-shimmer" aria-hidden="true" />
              <span className="start-btn-content">
                <span className="start-btn-icon-flight" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="start-btn-svg">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="start-btn-flare" />
                </span>
                <span className="start-btn-text">START FLYING</span>
                <span className="start-btn-chevron-trail" aria-hidden="true">»</span>
              </span>
            </button>

            {/* Modes */}
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

            {/* Soundtrack */}
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
          <div className="main-menu-bird-podium" aria-hidden="true" />
          <img className="main-menu-bird" src={birdImage} alt="Your bird pilot, ready for takeoff" />
        </section>
      </main>

      <footer className="main-menu-footer">
        {currentTrack && (
          <div className="main-menu-now-playing">
            <span className="now-playing-dot" />
            <span>PLAYING</span>
            <strong>{currentTrack.name}</strong>
          </div>
        )}

        <a
          href="https://www.instagram.com/kartxik.exe"
          target="_blank"
          rel="noopener noreferrer"
          className="main-menu-dev-credit"
          id="dev-credit-link"
          aria-label="Developed by Karthik (Instagram: @kartxik.exe)"
          title="Follow @kartxik.exe on Instagram"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="dev-credit-prefix">developed by</span>
          <span className="dev-credit-name">Karthik</span>
          <svg className="dev-credit-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
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
          coins={coins}
          onSpendCoins={onSpendCoins}
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
