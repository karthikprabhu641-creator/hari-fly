/**
 * State Machine
 * Strictly validates and manages transitions between game states.
 */

import { GAME_STATE } from './GameState';
import { eventBus, GAME_EVENTS } from '../systems/EventBus';

export class StateMachine {
  constructor(initialState = GAME_STATE.LOADING) {
    this.currentState = initialState;
    this.previousState = null;

    // Allowed transition map
    this.transitions = {
      [GAME_STATE.LOADING]: [GAME_STATE.MAIN_MENU],
      [GAME_STATE.MAIN_MENU]: [GAME_STATE.PLAYING],
      [GAME_STATE.PLAYING]: [GAME_STATE.PAUSED, GAME_STATE.GAME_OVER, GAME_STATE.MAIN_MENU],
      [GAME_STATE.PAUSED]: [GAME_STATE.PLAYING, GAME_STATE.MAIN_MENU, GAME_STATE.GAME_OVER],
      [GAME_STATE.GAME_OVER]: [GAME_STATE.PLAYING, GAME_STATE.MAIN_MENU],
    };
  }

  getState() {
    return this.currentState;
  }

  is(state) {
    return this.currentState === state;
  }

  canTransitionTo(nextState) {
    const allowed = this.transitions[this.currentState];
    return allowed ? allowed.includes(nextState) : false;
  }

  transitionTo(nextState, context = {}) {
    if (this.currentState === nextState) return false;

    if (!this.canTransitionTo(nextState)) {
      console.warn(
        `[StateMachine] Invalid transition requested: ${this.currentState} -> ${nextState}`
      );
      return false;
    }

    const fromState = this.currentState;
    this.previousState = fromState;
    this.currentState = nextState;

    eventBus.emit(GAME_EVENTS.STATE_CHANGED, {
      from: fromState,
      to: nextState,
      context,
    });

    return true;
  }
}
