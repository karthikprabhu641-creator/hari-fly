/**
 * HUD (Heads-Up Display)
 * Active during gameplay. Shows current score, pause button, and audio toggles.
 */

import React from 'react';
import { useAudio } from '../hooks/useAudio';

export function HUD({ score, powerUps = [], coins = 0, keys = 0, onPause, onOpenSettings }) {
  const { isMuted, toggleMute, playClick } = useAudio();

  const handlePause = (e) => {
    e.stopPropagation();
    playClick();
    onPause();
  };

  const handleMute = (e) => {
    e.stopPropagation();
    toggleMute();
  };

  const handleSettings = (e) => {
    e.stopPropagation();
    playClick();
    onOpenSettings();
  };

  const getPowerUpLabel = (powerUp) => {
    if (powerUp.type === 'shield') return 'SHIELD';
    if (powerUp.type === 'slow-motion') return 'SLOW';
    return '2X SCORE';
  };

  return (
    <>
      <header className="hud-header">
      {/* Sound Controls */}
      <div className="hud-controls">
        <button
          className="icon-btn"
          onClick={handleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          id="hud-mute-btn"
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        <button
          className="icon-btn"
          onClick={handleSettings}
          title="Audio Settings"
          id="hud-settings-btn"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>
      </div>

      {/* Floating Center Score Badge */}
      <div className="hud-score-badge">
        <span className="hud-score-number">{score}</span>
      </div>

      {/* Pause Button */}
      <div className="hud-controls">
        <button
          className="icon-btn"
          onClick={handlePause}
          title="Pause Game"
          id="hud-pause-btn"
        >
          <svg viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
      </div>
      </header>

      <div className="hud-wallet" aria-label={`Coins ${coins}, keys ${keys}`}>
        <div className="hud-wallet-item">
          <span className="hud-currency-mark hud-currency-coin" aria-hidden="true">C</span>
          <span>COIN {coins}</span>
        </div>
        <div className="hud-wallet-item">
          <span className="hud-currency-mark hud-currency-key" aria-hidden="true">K</span>
          <span>KEY {keys}</span>
        </div>
      </div>

      {powerUps.length > 0 && (
        <div className="hud-powerup-stack" aria-label="Active power-ups">
          {powerUps.map((powerUp) => (
            <div className={`hud-powerup hud-powerup-${powerUp.type}`} key={powerUp.type}>
              <span>{getPowerUpLabel(powerUp)}</span>
              {powerUp.remaining !== null && (
                <strong>{`${Math.max(0, powerUp.remaining).toFixed(1)}s`}</strong>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
