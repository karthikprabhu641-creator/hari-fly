/**
 * Pilot Username / Call-sign Registration Modal
 * Displayed before player takes off if they haven't set their call-sign yet,
 * or when they click "EDIT" on their pilot profile.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';
import { getPilotUsername, setPilotUsername } from '../services/leaderboardService';
import birdImage from '../../image/bird-transparent.png';

export function PilotUsernameModal({ isOpen, onClose, onSave, isMandatory = false }) {
  const { playClick } = useAudio();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const current = getPilotUsername();
      setUsername(current || '');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const clean = username.trim();

    if (!clean) {
      setError('Please enter a pilot call-sign to take off.');
      inputRef.current?.focus();
      return;
    }
    if (clean.length < 2) {
      setError('Call-sign must be at least 2 characters long.');
      inputRef.current?.focus();
      return;
    }
    if (clean.length > 18) {
      setError('Call-sign cannot exceed 18 characters.');
      inputRef.current?.focus();
      return;
    }
    if (!/^[a-zA-Z0-9_ -]+$/.test(clean)) {
      setError('Only letters, numbers, underscores, and dashes allowed.');
      inputRef.current?.focus();
      return;
    }

    playClick();
    const saved = setPilotUsername(clean);
    onSave?.(saved);
    onClose();
  };

  const handleRandomize = (e) => {
    e.stopPropagation();
    playClick();
    const prefixes = ['Ace', 'Sky', 'Falcon', 'Aero', 'Storm', 'Thunder', 'Shadow', 'Nova', 'Viper', 'Phoenix'];
    const suffixes = ['Pilot', 'Hunter', 'Flyer', 'Rider', 'Captain', 'Wing', 'Striker', 'Hero'];
    const randomNum = Math.floor(10 + Math.random() * 90);
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    setUsername(`${p}${s}_${randomNum}`);
    setError('');
  };

  return (
    <div className="pilot-modal-backdrop" id="pilot-username-overlay">
      <div className="pilot-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="pilot-modal-avatar-frame">
          <img src={birdImage} alt="Pilot Bird" className="pilot-modal-avatar-img" />
          <span className="pilot-modal-wings-icon">✈️</span>
        </div>

        <div className="pilot-modal-badge">
          <span>FLIGHT REGISTRATION</span>
        </div>

        <h2 className="pilot-modal-title">REGISTER CALL-SIGN</h2>
        <p className="pilot-modal-subtitle">
          Your call-sign will be displayed on the Global Leaderboards and flight records.
        </p>

        <form onSubmit={handleSubmit} className="pilot-modal-form">
          <div className="pilot-input-wrapper">
            <span className="pilot-input-prefix">@</span>
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. SkyAce_07"
              maxLength={18}
              className={`pilot-text-input${error ? ' has-error' : ''}`}
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              className="pilot-random-btn"
              onClick={handleRandomize}
              title="Generate Random Call-Sign"
            >
              🎲
            </button>
          </div>

          {error && <p className="pilot-modal-error">{error}</p>}

          <div className="pilot-modal-actions">
            {!isMandatory && (
              <button
                type="button"
                className="pilot-modal-cancel-btn"
                onClick={() => {
                  playClick();
                  onClose();
                }}
              >
                CANCEL
              </button>
            )}
            <button type="submit" className="pilot-modal-submit-btn" id="confirm-pilot-callsign-btn">
              <span>CONFIRM &amp; FLY</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
