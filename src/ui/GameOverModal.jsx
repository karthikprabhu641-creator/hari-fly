/**
 * Game Over Screen
 * Displayed upon player collision with obstacles or ground.
 * Displays final score, best score, new record celebration, and restart button.
 */

import React, { useEffect, useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import birdImage from '../../image/bird-transparent.png';
import keyImage from '../../image/key.png';
import { WalletDisplay } from './WalletDisplay';

export function GameOverModal({ score, bestScore, isNewBest, coins = 0, keys = 0, nextContinueCost = 1, onContinue, onRestart, onGoToMenu }) {
  const { playClick } = useAudio();
  const [displayScore, setDisplayScore] = useState(0);
  const [displayBest, setDisplayBest] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplayScore(score);
      setDisplayBest(bestScore);
      return undefined;
    }
    const started = performance.now();
    const frame = (now) => {
      const progress = Math.min(1, (now - started) / 600);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      setDisplayBest(Math.round(bestScore * eased));
      if (progress < 1) requestAnimationFrame(frame);
    };
    const rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [score, bestScore]);

  const handleRestart = (e) => {
    e.stopPropagation();
    playClick();
    onRestart();
  };

  const handleContinue = (e) => {
    e.stopPropagation();
    playClick();
    onContinue();
  };

  const handleMenu = (e) => {
    e.stopPropagation();
    playClick();
    onGoToMenu();
  };

  return (
    <div className="modal-backdrop game-over-backdrop" id="game-over-overlay">
      <div className="game-over-card">
        <div className="game-over-kicker">FLIGHT ENDED</div>
        <h2 className="game-over-title">GAME OVER</h2>
        <p className="game-over-message">That was a brave flight.</p>

        <div className="game-over-avatar-frame">
          <img
            src={birdImage}
            alt="Player Bird"
            className="game-over-avatar-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        <div className="game-over-score-panel">
          <div className="game-over-score-main">
            <span className="game-over-score-label">YOUR SCORE</span>
            <span className="game-over-score-value" id="game-over-score">{displayScore}</span>
          </div>

          <div className="game-over-best-stat">
            <span className="game-over-score-label">BEST</span>
            <span className={`game-over-best-value${isNewBest ? ' is-new-best' : ''}`} id="game-over-best-score">{displayBest}</span>
            {isNewBest && (
              <span className="game-over-new-best">NEW RECORD</span>
            )}
          </div>
        </div>

        <WalletDisplay coins={coins} keys={keys} className="game-over-wallet" />

        <button
          className="game-over-continue-button"
          onClick={handleContinue}
          disabled={keys < nextContinueCost}
          id="game-over-continue-btn"
        >
          <span>CONTINUE</span>
          <strong><img src={keyImage} alt="" /> {nextContinueCost}</strong>
        </button>
        {keys < nextContinueCost && (
          <p className="game-over-continue-hint">Collect more to continue.</p>
        )}

        <button
          className="game-over-retry-button"
          onClick={handleRestart}
          id="game-over-restart-btn"
        >
          <span>PLAY AGAIN</span>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93 0-4.42-3.58-8-8-8zm-6 8c0-2.97 2.17-5.43 5-5.91V5.07c-3.95.49-7 3.85-7 7.93 0 4.42 3.58 8 8 8v-4c-3.31 0-6-2.69-6-6z" />
          </svg>
        </button>

        <button
          className="game-over-menu-button"
          onClick={handleMenu}
          id="game-over-menu-btn"
        >
          HOME
        </button>

        <div className="game-over-divider" />
        <p className="game-over-hint">Tap or press Space to restart</p>
      </div>
    </div>
  );
}
