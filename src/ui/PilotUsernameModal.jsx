/**
 * Pilot Username / Call-sign Registration Modal
 * - First-time registration: FREE
 * - Changing an existing call-sign: costs 100 keys
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';
import { getPilotUsername, setPilotUsername } from '../services/leaderboardService';
import birdImage from '../../image/bird-transparent.png';
import { ClayIcon } from './ClayIcon';

const RENAME_KEY_COST = 100;

export function PilotUsernameModal({
  isOpen,
  onClose,
  onSave,
  isMandatory = false,
  keys = 0,
  onSpendKeys,
}) {
  const { playClick } = useAudio();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Whether the player already has an existing call-sign (rename path)
  const [existingName, setExistingName] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getPilotUsername();
      setExistingName(current || '');
      setUsername(current || '');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Is this an edit/rename (not a first-time registration)?
  const isRename = Boolean(existingName && existingName.trim().length >= 2);
  const canAffordRename = keys >= RENAME_KEY_COST;

  const validate = (clean) => {
    if (!clean) return 'Please enter a pilot call-sign to take off.';
    if (clean.length < 2) return 'Call-sign must be at least 2 characters long.';
    if (clean.length > 18) return 'Call-sign cannot exceed 18 characters.';
    if (!/^[a-zA-Z0-9_ -]+$/.test(clean)) return 'Only letters, numbers, underscores, and dashes allowed.';
    return null;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const clean = username.trim();

    const validationError = validate(clean);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }

    // If renaming an existing call-sign, deduct keys
    if (isRename) {
      if (!canAffordRename) {
        setError(`You need ${RENAME_KEY_COST} keys to change your call-sign. You only have ${keys}.`);
        return;
      }
      if (typeof onSpendKeys === 'function') {
        const spent = onSpendKeys(RENAME_KEY_COST);
        if (!spent) {
          setError(`Not enough keys to change your call-sign.`);
          return;
        }
      }
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
          <span className="pilot-modal-wings-icon"><ClayIcon name="plane" size={24} /></span>
        </div>

        <div className="pilot-modal-badge">
          <span>{isRename ? 'CHANGE CALL-SIGN' : 'FLIGHT REGISTRATION'}</span>
        </div>

        <h2 className="pilot-modal-title">
          {isRename ? 'RENAME CALL-SIGN' : 'REGISTER CALL-SIGN'}
        </h2>
        <p className="pilot-modal-subtitle">
          {isRename
            ? 'Changing your call-sign costs 100 keys.'
            : 'Set your in-game pilot call-sign before you take off.'}
        </p>

        {/* Key cost banner — shown only when renaming */}
        {isRename && (
          <div className={`pilot-rename-cost-banner${canAffordRename ? '' : ' is-insufficient'}`}>
            <div className="rename-cost-row">
              <span className="rename-cost-icon"><ClayIcon name="key" size={22} /></span>
              <span className="rename-cost-label">RENAME COST</span>
              <span className="rename-cost-amount">{RENAME_KEY_COST} Keys</span>
            </div>
            <div className="rename-balance-row">
              <span className="rename-balance-label">YOUR BALANCE</span>
              <span className={`rename-balance-val${canAffordRename ? ' is-ok' : ' is-short'}`}>
                {keys} Keys {canAffordRename ? <ClayIcon name="check" size={14} /> : 'X'}
              </span>
            </div>
            {!canAffordRename && (
              <p className="rename-insufficient-note">
                You need {RENAME_KEY_COST - keys} more keys. Collect keys during gameplay!
              </p>
            )}
          </div>
        )}

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
              <ClayIcon name="dice" size={20} />
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
            <button
              type="submit"
              className={`pilot-modal-submit-btn${isRename && !canAffordRename ? ' is-locked' : ''}`}
              id="confirm-pilot-callsign-btn"
              disabled={isRename && !canAffordRename}
              title={isRename && !canAffordRename ? `Need ${RENAME_KEY_COST} keys to rename` : undefined}
            >
              {isRename ? (
                <>
                  <span><ClayIcon name="key" size={16} /> SPEND {RENAME_KEY_COST} &amp; RENAME</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </>
              ) : (
                <>
                  <span>CONFIRM &amp; FLY</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
