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
import { ClayIcon } from './ClayIcon';

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
        <div className="game-over-drag-handle" aria-hidden="true" />
        <div className="game-over-hero">
          <div className="game-over-avatar-frame">
            <span className="game-over-avatar-ring" aria-hidden="true" />
            <img
              src={birdImage}
              alt="Player Bird"
              className="game-over-avatar-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="game-over-heading">
            <div className="game-over-kicker">FLIGHT ENDED</div>
            <h2 className="game-over-title">GAME OVER</h2>
          </div>
        </div>

        <div className="game-over-score-panel">
          <div className="game-over-score-main">
            <span className="game-over-score-label"><ClayIcon name="trophy" size={14} /> SCORE</span>
            <span className="game-over-score-value" id="game-over-score">{displayScore}</span>
          </div>

          <div className="game-over-best-stat">
            <span className="game-over-score-label"><ClayIcon name="star" size={14} /> BEST</span>
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
          <ClayIcon name="plane" size={20} />
          <span>PLAY AGAIN</span>
        </button>

        <button
          className="game-over-menu-button"
          onClick={handleMenu}
          id="game-over-menu-btn"
        >
          <ClayIcon name="home" size={18} />
          <span>HOME</span>
        </button>

      </div>
    </div>
  );
}
