/**
 * GameView Component
 * Top-level view container managing Canvas 2D engine and the React UI state layer.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import { useGame } from '../hooks/useGame';
import { GameCanvas } from './GameCanvas';
import { HUD } from '../ui/HUD';
import { MainMenu } from '../ui/MainMenu';
import { PauseMenu } from '../ui/PauseMenu';
import { GameOverModal } from '../ui/GameOverModal';
import { AudioSettingsModal } from '../ui/AudioSettingsModal';
import { LoadingScreen } from '../ui/LoadingScreen';
import { isMobileDevice, isFullscreen, requestFullscreen } from '../utils/device';
import { ToastViewport } from '../ui/ToastViewport';

export function GameView() {
  // Stable singleton engine instance
  const engine = useMemo(() => new GameEngine(), []);

  // React UI state synchronized through observer
  const { gameState, loadingProgress, score, bestScore, isNewBest, powerUps, coins, keys, nextContinueCost, selectedMapId, selectedGameModeId, restart, pause, resume, continueRun, goToMenu } = useGame(engine);

  // Audio settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [startCountdown, setStartCountdown] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const startTimersRef = React.useRef([]);

  useEffect(() => () => {
    startTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
  }, []);

  const handleStartSequence = () => {
    if (isStarting) return;

    startTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    startTimersRef.current = [];
    setIsStarting(true);
    setStartCountdown(null);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const countdownDelay = reducedMotion ? 80 : 600;
    const numberDuration = reducedMotion ? 120 : 650;

    const schedule = (delay, action) => {
      const timerId = window.setTimeout(action, delay);
      startTimersRef.current.push(timerId);
      return timerId;
    };

    schedule(countdownDelay, () => setStartCountdown('3'));
    schedule(countdownDelay + numberDuration, () => setStartCountdown('2'));
    schedule(countdownDelay + numberDuration * 2, () => setStartCountdown('1'));
    schedule(countdownDelay + numberDuration * 3, () => setStartCountdown('GO'));
    schedule(countdownDelay + numberDuration * 3 + (reducedMotion ? 120 : 400), () => {
      setStartCountdown(null);
      setIsStarting(false);
      engine.handleFlapInput();
    });
  };

  // Mobile automatic fullscreen on first interaction
  useEffect(() => {
    if (!isMobileDevice()) return;

    const enterFullscreenOnMobile = () => {
      if (!isFullscreen()) {
        requestFullscreen();
      }
    };

    window.addEventListener('touchstart', enterFullscreenOnMobile, { passive: true, once: true });
    window.addEventListener('touchend', enterFullscreenOnMobile, { passive: true, once: true });
    window.addEventListener('pointerdown', enterFullscreenOnMobile, { passive: true, once: true });
    window.addEventListener('click', enterFullscreenOnMobile, { once: true });

    return () => {
      window.removeEventListener('touchstart', enterFullscreenOnMobile);
      window.removeEventListener('touchend', enterFullscreenOnMobile);
      window.removeEventListener('pointerdown', enterFullscreenOnMobile);
      window.removeEventListener('click', enterFullscreenOnMobile);
    };
  }, []);

  return (
    <div className="game-viewport-container">
      <ToastViewport />
      {/* 2D Canvas Gameplay Renderer — always present */}
      <GameCanvas engine={engine} />
      {startCountdown && (
        <div className="start-countdown" role="status" aria-live="assertive">
          <span key={startCountdown}>{startCountdown}</span>
        </div>
      )}

      {/* Cinematic Flight Intro — shown during LOADING state */}
      {gameState === 'LOADING' && (
        <LoadingScreen
          progress={loadingProgress}
          onSkip={() => engine.skipIntro()}
        />
      )}

      {/* React UI Overlays */}
      <div className="game-ui-overlay">
        {/* Active In-Game HUD */}
        {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
          <HUD
            score={score}
            powerUps={powerUps}
            coins={coins}
            keys={keys}
            onPause={pause}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}
      </div>

      {/* Main Menu Modal */}
      {gameState === 'MAIN_MENU' && (
      <MainMenu
          isStarting={isStarting}
          bestScore={bestScore}
          coins={coins}
          keys={keys}
          selectedMapId={selectedMapId}
          selectedGameModeId={selectedGameModeId}
          onSelectMap={(mapId) => engine.setMap(mapId)}
          onSelectGameMode={(modeId) => engine.setGameMode(modeId)}
          onStart={handleStartSequence}
          onOpenSettings={() => setShowSettings(true)}
          onClaimReward={(reward) => engine.claimLuckyReward(reward)}
          onSpendCoins={(amount) => engine.spendCoins(amount)}
          onSpendKeys={(amount) => engine.spendKeys(amount)}
        />
      )}

      {/* Pause Menu Modal */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          score={score}
          onResume={resume}
          onRestart={restart}
          onGoToMenu={goToMenu}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          isNewBest={isNewBest}
          coins={coins}
          keys={keys}
          nextContinueCost={nextContinueCost}
          onContinue={continueRun}
          onRestart={restart}
          onGoToMenu={goToMenu}
        />
      )}

      {/* Audio Settings Modal */}
      {showSettings && (
        <AudioSettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
