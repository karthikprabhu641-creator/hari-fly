/**
 * Audio Settings Modal
 * Dark glassmorphism theme matching the main menu.
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
    <div className="modal-backdrop settings-backdrop" id="audio-settings-overlay" onClick={handleClose}>
      <div className="settings-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="settings-close-btn"
          onClick={handleClose}
          type="button"
          aria-label="Close Settings"
        >
          ✕
        </button>

        <h2 className="settings-title">AUDIO</h2>
        <p className="settings-subtitle">Sound & Music Settings</p>

        {/* Current Track Info */}
        {currentTrack && (
          <div className="settings-track-bar">
            <svg style={{ width: 18, height: 18, fill: '#38bdf8', flexShrink: 0 }} viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <div className="settings-track-info">
              <div className="settings-track-name">{currentTrack.title}</div>
              <div className="settings-track-artist">{currentTrack.artist}</div>
            </div>
          </div>
        )}

        {/* Volume Sliders */}
        <div className="settings-sliders">
          {/* Music Volume */}
          <div className="settings-slider-row">
            <div className="settings-slider-label">
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
              className="settings-slider"
              id="bgm-volume-slider"
            />
          </div>

          {/* SFX Volume */}
          <div className="settings-slider-row">
            <div className="settings-slider-label">
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
              className="settings-slider"
              id="sfx-volume-slider"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="settings-actions">
          <button
            className="settings-action-btn"
            onClick={handleTestSFX}
            id="test-sfx-btn"
            type="button"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.05c1.5-.74 2.5-2.26 2.5-4.02z"/></svg>
            <span>Test Flap Sound</span>
          </button>

          <button
            className="settings-action-btn"
            onClick={toggleMute}
            id="settings-mute-btn"
            type="button"
          >
            {isMuted ? (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                <span>Unmute All</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.05c1.5-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                <span>Mute All</span>
              </>
            )}
          </button>
        </div>

        {/* Done Button */}
        <button
          className="settings-done-btn"
          onClick={handleClose}
          id="close-settings-btn"
          type="button"
        >
          Done
          <span className="settings-done-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
