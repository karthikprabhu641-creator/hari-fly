/**
 * Lightweight canvas weather layer.
 * Rain starts active and transitions are controlled, infrequent, and pooled.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { randomRange } from '../../utils/math';

export class WeatherSystem {
  constructor() {
    this.width = GAME_CONFIG.VIEWPORT.WIDTH;
    this.height = GAME_CONFIG.VIEWPORT.HEIGHT;
    this.groundY = this.height - GAME_CONFIG.WORLD.GROUND_HEIGHT;
    this.rainDrops = Array.from(
      { length: GAME_CONFIG.WEATHER.RAIN_PARTICLE_COUNT },
      () => this.createRainDrop(true)
    );
    this.weatherTimer = 0;
    this.transitionTime = 1;
    this.rainActive = true;
    this.previousRainActive = true;
    this.transitionDuration = 1;
    this.lightningTimer = 0;
  }

  createRainDrop(randomizeY = false) {
    return {
      x: randomRange(-this.width * 0.1, this.width),
      y: randomizeY ? randomRange(0, this.groundY) : -20,
      length: randomRange(8, 16),
      speed: randomRange(360, 520),
      opacity: randomRange(0.2, 0.55),
    };
  }

  update(dt) {
    this.weatherTimer += dt;
    if (this.weatherTimer >= GAME_CONFIG.WEATHER.WEATHER_CHANGE_INTERVAL) {
      this.weatherTimer = 0;
      this.previousRainActive = this.rainActive;
      this.rainActive = Math.random() < GAME_CONFIG.WEATHER.RAIN_CHANCE;
      this.transitionTime = 0;
    }

    this.transitionTime = Math.min(
      this.transitionDuration,
      this.transitionTime + dt
    );

    const wind = GAME_CONFIG.WEATHER.WIND;
    this.rainDrops.forEach((drop) => {
      drop.x += wind * dt;
      drop.y += drop.speed * dt;
      if (drop.y > this.groundY + drop.length || drop.x > this.width + 12) {
        drop.x = randomRange(-this.width * 0.1, this.width * 0.8);
        drop.y = randomRange(-40, -8);
      }
    });

    if (this.lightningTimer > 0) {
      this.lightningTimer = Math.max(0, this.lightningTimer - dt);
    }
  }

  getRainAlpha() {
    const progress = Math.min(1, this.transitionTime / this.transitionDuration);
    const easedProgress = progress * progress * (3 - 2 * progress);
    const from = this.previousRainActive ? 1 : 0;
    const to = this.rainActive ? 1 : 0;
    return from + (to - from) * easedProgress;
  }

  render(ctx) {
    const rainAlpha = this.getRainAlpha();
    if (rainAlpha <= 0) return;

    ctx.save();
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';

    this.rainDrops.forEach((drop) => {
      ctx.globalAlpha = drop.opacity * rainAlpha;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(
        drop.x - GAME_CONFIG.WEATHER.WIND * 0.04,
        drop.y + drop.length
      );
      ctx.stroke();
    });

    ctx.restore();
  }

  reset() {
    this.weatherTimer = 0;
    this.transitionTime = this.transitionDuration;
    this.rainActive = true;
    this.previousRainActive = true;
    this.lightningTimer = 0;
    this.rainDrops.forEach((drop) => {
      drop.x = randomRange(-this.width * 0.1, this.width);
      drop.y = randomRange(0, this.groundY);
    });
  }
}
