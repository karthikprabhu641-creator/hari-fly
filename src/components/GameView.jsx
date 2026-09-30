/**
 * GameView Component
 * Top-level view container managing Canvas 2D engine and the React UI state layer.
 */

import React, { useState, useMemo } from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import { useGame } from '../hooks/useGame';
import { GameCanvas } from './GameCanvas';
import { HUD } from '../ui/HUD';
import { MainMenu } from '../ui/MainMenu';
import { PauseMenu } from '../ui/PauseMenu';
import { GameOverModal } from '../ui/GameOverModal';
import { AudioSettingsModal } from '../ui/AudioSettingsModal';
import { LoadingScreen } from '../ui/LoadingScreen';

export function GameView() {
  // Stable singleton engine instance
  const engine = useMemo(() => new GameEngine(), []);

  // React UI state synchronized through observer
  const { gameState, loadingProgress, score, bestScore, isNewBest, powerUps, restart, pause, resume, goToMenu } = useGame(engine);

  // Audio settings modal state
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="game-viewport-container">
      {/* 2D Canvas Gameplay Renderer */}
      <GameCanvas engine={engine} />

      {gameState === 'LOADING' && <LoadingScreen progress={loadingProgress} />}

      {/* React UI Overlays */}
      <div className="game-ui-overlay">
        {/* Active In-Game HUD */}
        {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
          <HUD
            score={score}
            powerUps={powerUps}
            onPause={pause}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}
      </div>

      {/* Main Menu Modal */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          bestScore={bestScore}
          onStart={() => engine.handleFlapInput()}
          onOpenSettings={() => setShowSettings(true)}
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
