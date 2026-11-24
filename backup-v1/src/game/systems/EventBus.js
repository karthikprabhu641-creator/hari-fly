/**
 * Event Bus
 * Light-weight publish-subscribe bus for game events.
 * Decouples game systems from UI and engine components.
 */

export const GAME_EVENTS = {
  STATE_CHANGED: 'STATE_CHANGED',
  PLAYER_FLAPPED: 'PLAYER_FLAPPED',
  PLAYER_COLLIDED: 'PLAYER_COLLIDED',
  SCORE_INCREMENTED: 'SCORE_INCREMENTED',
  NEW_HIGH_SCORE: 'NEW_HIGH_SCORE',
  SCREEN_SHAKE: 'SCREEN_SHAKE',
};

class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (this.handlers.has(event)) {
      this.handlers.get(event).delete(handler);
    }
  }

  emit(event, payload) {
    if (this.handlers.has(event)) {
      this.handlers.get(event).forEach((handler) => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] Error in handler for ${event}:`, err);
        }
      });
    }
  }

  clear() {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
