/**
 * Audio Settings Modal
 * Provides independent volume controls for BGM and SFX,
 * track details, sound testing, and mute toggle.
 */

import React from 'react';
import { useAudio } from '../hooks/useAudio';
import { audioManager } from '../audio/AudioManager';

export function AudioSettingsModal({ onClose }) {
  const {
    bgmVolume,
    sfxVolume,
    isMuted,
    currentTrack,
    setBgmVolume,
    setSfxVolume,
    toggleMute,
    playClick,
  } = useAudio();

  const handleClose = (e) => {
    e.stopPropagation();
    playClick();
    onClose();
  };

  const handleTestSFX = (e) => {
    e.stopPropagation();
    audioManager.playFlap();
  };

  return (
    <div className="modal-backdrop" id="audio-settings-overlay" onClick={handleClose}>
      <div className="glass-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="game-title" style={{ fontSize: '2.2rem' }}>AUDIO</h2>
        <p className="game-subtitle">Sound & Music Settings</p>

        {/* Current Track Info */}
        {currentTrack && (
          <div className="music-info-bar">
            <svg style={{ width: 20, height: 20, fill: '#facc15' }} viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <div className="music-info-text">
              <div className="music-info-title">{currentTrack.title}</div>
              <div className="music-info-artist">{currentTrack.artist}</div>
            </div>
          </div>
        )}

        {/* Volume Sliders */}
        <div className="slider-group">
          {/* Music Volume */}
          <div className="slider-row">
            <div className="slider-label">
              <span>Music Volume</span>
              <span>{Math.round(bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              className="slider-input"
              id="bgm-volume-slider"
            />
          </div>

          {/* SFX Volume */}
          <div className="slider-row">
            <div className="slider-label">
              <span>SFX Volume</span>
              <span>{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="slider-input"
              id="sfx-volume-slider"
            />
          </div>
        </div>

        {/* Quick Action Buttons */}
        <button
          className="btn-secondary"
          onClick={handleTestSFX}
          id="test-sfx-btn"
        >
          Test Flap Sound
        </button>

        <button
          className="btn-secondary"
          onClick={toggleMute}
          id="settings-mute-btn"
        >
          {isMuted ? 'Unmute All Sounds' : 'Mute All Sounds'}
        </button>

        {/* Done / Close */}
        <button
          className="btn-primary"
          onClick={handleClose}
          style={{ marginTop: 14 }}
          id="close-settings-btn"
        >
          Done
        </button>
      </div>
    </div>
  );
}
