/**
 * Lightweight canvas weather layer.
 * Rain starts active and transitions are controlled, infrequent, and pooled.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { randomRange } from '../../utils/math';
import { DEFAULT_MAP_ID, getMap } from '../../config/mapConfig';

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
    this.map = getMap(DEFAULT_MAP_ID);
    this.rainActive = this.map.weather.includes('rain');
    this.previousRainActive = this.rainActive;
    this.transitionDuration = 1;
    this.lightningTimer = 0;
    this.snowflakes = Array.from({ length: 38 }, () => this.createSnowflake(true));
  }

  createSnowflake(randomizeY = false) {
    return {
      x: randomRange(0, this.width),
      y: randomizeY ? randomRange(0, this.height) : -8,
      radius: randomRange(1, 2.5),
      speed: randomRange(24, 58),
      drift: randomRange(-16, 16),
    };
  }

  setMap(mapId) {
    this.map = getMap(mapId);
    this.previousRainActive = this.map.weather.includes('rain');
    this.rainActive = this.previousRainActive;
    this.transitionTime = this.transitionDuration;
    this.snowflakes.forEach((flake) => Object.assign(flake, this.createSnowflake(true)));
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
      this.rainActive = this.map.weather.includes('rain')
        && Math.random() < GAME_CONFIG.WEATHER.RAIN_CHANCE;
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

    if (this.map.weather.includes('snow')) {
      this.snowflakes.forEach((flake) => {
        flake.x += (flake.drift + wind * 0.12) * dt;
        flake.y += flake.speed * dt;
        if (flake.y > this.height || flake.x < -8 || flake.x > this.width + 8) {
          Object.assign(flake, this.createSnowflake());
          flake.x = Math.min(this.width, Math.max(0, flake.x));
        }
      });
    }

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
    const rainAlpha = this.map.weather.includes('rain') ? this.getRainAlpha() : 0;
    if (rainAlpha > 0) {
      ctx.save();
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      this.rainDrops.forEach((drop) => {
        ctx.globalAlpha = drop.opacity * rainAlpha;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - GAME_CONFIG.WEATHER.WIND * 0.04, drop.y + drop.length);
        ctx.stroke();
      });
      ctx.restore();
    }

    if (this.map.weather.includes('snow')) {
      ctx.save();
      ctx.fillStyle = 'rgba(245, 252, 255, 0.88)';
      this.snowflakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    if (this.map.weather.includes('fog')) {
      const fog = ctx.createLinearGradient(0, this.groundY * 0.52, 0, this.groundY);
      fog.addColorStop(0, 'rgba(174, 191, 211, 0)');
      fog.addColorStop(1, 'rgba(174, 191, 211, 0.2)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, this.width, this.groundY);
    }
  }

  reset() {
    this.weatherTimer = 0;
    this.transitionTime = this.transitionDuration;
    this.rainActive = this.map.weather.includes('rain');
    this.previousRainActive = this.rainActive;
    this.lightningTimer = 0;
    this.rainDrops.forEach((drop) => {
      drop.x = randomRange(-this.width * 0.1, this.width);
      drop.y = randomRange(0, this.groundY);
    });
  }
}
