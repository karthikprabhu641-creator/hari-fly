/**
 * Centralized Game Loop
 * Driven by requestAnimationFrame with clamped delta-time.
 * Manages lifecycle: start, pause, resume, stop, and clean RAF cancellation.
 */

import { GAME_CONFIG } from '../../config/gameConfig';

export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;

    this.rafId = null;
    this.lastTime = 0;
    this.isRunning = false;
    this.isPaused = false;

    this.maxDelta = GAME_CONFIG.ENGINE.MAX_DELTA_TIME; // Clamp at 80ms
    this.boundTick = this.tick.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.boundTick);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (!this.isRunning) {
      this.start();
      return;
    }
    this.isPaused = false;
    this.lastTime = performance.now(); // Reset time to prevent delta jump on resume
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  tick(currentTime) {
    if (!this.isRunning) return;

    // Schedule next frame immediately
    this.rafId = requestAnimationFrame(this.boundTick);

    // Delta-time in seconds
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Safety clamp: protects against huge delta after tab switch, app backgrounding, or lag spikes
    if (dt > this.maxDelta) {
      dt = this.maxDelta;
    }

    // 1. Simulation Step (if not paused)
    if (!this.isPaused) {
      this.updateFn(dt);
    }

    // 2. Render Step (always render so screen remains crisp and reflects UI changes)
    this.renderFn();
  }
}
