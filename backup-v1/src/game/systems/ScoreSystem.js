/**
 * Score System
 * Manages active score, best score, persistence, and new-best detection.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { safeStorage } from '../../utils/storage';
import { eventBus, GAME_EVENTS } from './EventBus';

export class ScoreSystem {
  constructor() {
    this.currentScore = 0;
    this.bestScore = safeStorage.getNumber(GAME_CONFIG.STORAGE.HIGH_SCORE_KEY, 0);
    this.isNewBest = false;
    this.multiplier = 1;
  }

  getScore() {
    return this.currentScore;
  }

  getBestScore() {
    return this.bestScore;
  }

  isHighScoreBroken() {
    return this.isNewBest;
  }

  setMultiplier(multiplier) {
    this.multiplier = Math.max(1, Number(multiplier) || 1);
  }

  increment() {
    this.currentScore += this.multiplier;
    let newBestAchieved = false;

    if (this.currentScore > this.bestScore) {
      this.bestScore = this.currentScore;
      this.isNewBest = true;
      newBestAchieved = true;
      safeStorage.setNumber(GAME_CONFIG.STORAGE.HIGH_SCORE_KEY, this.bestScore);
    }

    eventBus.emit(GAME_EVENTS.SCORE_INCREMENTED, {
      score: this.currentScore,
      bestScore: this.bestScore,
      isNewBest: this.isNewBest,
    });

    if (newBestAchieved) {
      eventBus.emit(GAME_EVENTS.NEW_HIGH_SCORE, {
        bestScore: this.bestScore,
      });
    }

    return this.currentScore;
  }

  reset() {
    this.currentScore = 0;
    this.isNewBest = false;
    this.multiplier = 1;
    // Always refresh high score from storage in case it was updated elsewhere
    this.bestScore = safeStorage.getNumber(GAME_CONFIG.STORAGE.HIGH_SCORE_KEY, 0);
  }
}
