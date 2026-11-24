/**
 * Pause Menu Screen
 * Displayed when game is paused via UI button, Escape key, or P key.
 */

import React from 'react';
import { useAudio } from '../hooks/useAudio';

export function PauseMenu({ score, onResume, onRestart, onGoToMenu, onOpenSettings }) {
  const { playClick } = useAudio();

  const handleResume = (e) => {
    e.stopPropagation();
    playClick();
    onResume();
  };

  const handleRestart = (e) => {
    e.stopPropagation();
    playClick();
    onRestart();
  };

  const handleMenu = (e) => {
    e.stopPropagation();
    playClick();
    onGoToMenu();
  };

  const handleSettings = (e) => {
    e.stopPropagation();
    playClick();
    onOpenSettings();
  };

  return (
    <div className="modal-backdrop" id="pause-menu-overlay">
      <div className="glass-card">
        <h2 className="game-title" style={{ fontSize: '2.4rem' }}>PAUSED</h2>
        <p className="game-subtitle">Game Suspended</p>

        {/* Current Score */}
        <div className="score-stat-card">
          <div className="stat-item">
            <span className="stat-label">Current Score</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>

        {/* Resume Button */}
        <button
          className="btn-primary"
          onClick={handleResume}
          id="resume-btn"
        >
          <span>RESUME</span>
          <svg style={{ width: 22, height: 22, fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        {/* Restart Button */}
        <button
          className="btn-secondary"
          onClick={handleRestart}
          id="pause-restart-btn"
        >
          Restart Game
        </button>

        {/* Settings Button */}
        <button
          className="btn-secondary"
          onClick={handleSettings}
          id="pause-settings-btn"
        >
          Audio Settings
        </button>

        {/* Main Menu Button */}
        <button
          className="btn-secondary"
          onClick={handleMenu}
          id="pause-menu-btn"
        >
          Quit to Main Menu
        </button>
      </div>
    </div>
  );
}
