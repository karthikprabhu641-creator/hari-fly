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
    this.onFrameTime = null;

    this.rafId = null;
    this.lastTime = 0;
    this.isRunning = false;
    this.isPaused = false;

    this.maxDelta = GAME_CONFIG.ENGINE.MAX_DELTA_TIME; // Clamp at 80ms
    this.needsPausedRender = false;
    this.boundTick = this.tick.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.needsPausedRender = false;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.boundTick);
  }

  pause() {
    this.isPaused = true;
    this.needsPausedRender = true;
  }

  resume() {
    if (!this.isRunning) {
      this.start();
      return;
    }
    this.isPaused = false;
    this.needsPausedRender = false;
    this.lastTime = performance.now(); // Reset time to prevent delta jump on resume
  }

  requestRender() {
    if (this.isPaused) {
      this.needsPausedRender = true;
    }
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.needsPausedRender = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  tick(currentTime) {
    if (!this.isRunning) return;

    // Schedule next frame immediately
    this.rafId = requestAnimationFrame(this.boundTick);

    if (this.isPaused) {
      if (this.needsPausedRender) {
        this.needsPausedRender = false;
        this.renderFn();
      }
      return;
    }

    // Delta-time in seconds
    let rawDt = (currentTime - this.lastTime) / 1000;
    if (this.onFrameTime) this.onFrameTime(rawDt);
    let dt = rawDt;
    this.lastTime = currentTime;

    // Safety clamp: protects against huge delta after tab switch, app backgrounding, or lag spikes
    if (dt > this.maxDelta) {
      dt = this.maxDelta;
    }

    // 1. Simulation Step
    this.updateFn(dt, currentTime);

    // 2. Render Step
    this.renderFn();
  }
}
