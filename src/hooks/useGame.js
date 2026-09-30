/**
 * useGame Hook
 * Subscribes React components to GameEngine state transitions and score updates.
 * React NEVER re-renders every animation frame.
 */

import { useState, useEffect } from 'react';

export function useGame(engine) {
  const [uiState, setUiState] = useState(() =>
    engine ? engine.getUIState() : { gameState: 'LOADING', loadingProgress: 0, score: 0, bestScore: 0, isNewBest: false, powerUps: [] }
  );

  useEffect(() => {
    if (!engine) return;
    const unsubscribe = engine.subscribe((nextState) => {
      setUiState({ ...nextState });
    });
    return unsubscribe;
  }, [engine]);

  return {
    ...uiState,
    restart: () => engine?.restart(),
    pause: () => engine?.togglePause(),
    resume: () => engine?.resume(),
    goToMenu: () => engine?.goToMenu(),
  };
}
