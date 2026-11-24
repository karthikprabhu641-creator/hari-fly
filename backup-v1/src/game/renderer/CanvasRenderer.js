/**
 * Master Canvas 2D Renderer
 * Orchestrates rendering order: Background -> Obstacles -> Ground -> Particles -> Player -> VFX.
 * Manages screen shake camera offsets and collision impact flash overlays.
 */

import { GAME_CONFIG } from '../../config/gameConfig';

export class CanvasRenderer {
  constructor(viewport, playerRenderer, parallaxBg, weatherSystem, powerUpManager, collectibleManager) {
    this.viewport = viewport;
    this.playerRenderer = playerRenderer;
    this.parallaxBg = parallaxBg;
    this.weatherSystem = weatherSystem;
    this.powerUpManager = powerUpManager;
    this.collectibleManager = collectibleManager;

    // Screen Shake state
    this.shakeTimer = 0;
    this.shakeDuration = GAME_CONFIG.VFX.SCREEN_SHAKE_DURATION;
    this.shakeIntensity = GAME_CONFIG.VFX.SCREEN_SHAKE_INTENSITY;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // Impact Flash state
    this.flashAlpha = 0;
  }

  triggerScreenShake(intensity = null, duration = null) {
    this.shakeIntensity = intensity !== null ? intensity : GAME_CONFIG.VFX.SCREEN_SHAKE_INTENSITY;
    this.shakeDuration = duration !== null ? duration : GAME_CONFIG.VFX.SCREEN_SHAKE_DURATION;
    this.shakeTimer = this.shakeDuration;
    this.flashAlpha = 0.45; // trigger red flash
  }

  updateVFX(dt) {
    // 1. Screen Shake decay
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const progress = this.shakeTimer / this.shakeDuration;
      const magnitude = this.shakeIntensity * progress;
      this.shakeOffsetX = (Math.random() * 2 - 1) * magnitude;
      this.shakeOffsetY = (Math.random() * 2 - 1) * magnitude;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // 2. Impact Flash decay
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 2.5);
    }
  }

  render(player, obstacleManager, particleSystem) {
    const ctx = this.viewport.ctx;

    // 1. Begin frame (applies logical coordinate transform and DPR)
    this.viewport.beginFrame();

    ctx.save();

    // 2. Apply camera screen shake offset
    if (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0) {
      ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
    }

    // 3. Render Background (Sky, Clouds, Distant Hills)
    this.parallaxBg.render(ctx);

    // 4. Render Obstacles (Pipes)
    obstacleManager.render(ctx);

    // 5. Render Ground (above pipes so pipe bottoms are cleanly covered)
    this.parallaxBg.renderGround(ctx);

    // 6. Weather and collectibles remain canvas-only gameplay layers.
    this.weatherSystem.render(ctx);
    this.collectibleManager.render(ctx);
    this.powerUpManager.render(ctx);

    // 7. Render particles behind the player so they never cover the photo.
    particleSystem.render(ctx);

    // 8. Render impact flash behind the player as well.
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(239, 68, 68, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, this.viewport.logicalWidth, this.viewport.logicalHeight);
    }

    // 9. Render Player
    this.playerRenderer.render(ctx, player);
    this.powerUpManager.renderPlayerEffects(ctx, player);

    ctx.restore();

    // 9. End frame
    this.viewport.endFrame();
  }

  reset() {
    this.shakeTimer = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.flashAlpha = 0;
  }
}
