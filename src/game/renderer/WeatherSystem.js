/**
 * Lightweight canvas weather layer.
 * Rain starts active and transitions are controlled, infrequent, and pooled.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { randomRange } from '../../utils/math';
import { DEFAULT_MAP_ID, getMap } from '../../config/mapConfig';

export class WeatherSystem {
  constructor(options = {}) {
    this.width = options.width || GAME_CONFIG.VIEWPORT.WIDTH;
    this.height = GAME_CONFIG.VIEWPORT.HEIGHT;
    this.groundY = this.height - GAME_CONFIG.WORLD.GROUND_HEIGHT;
    this.rainDrops = Array.from(
      { length: GAME_CONFIG.WEATHER.RAIN_PARTICLE_COUNT },
      () => this.createRainDrop(true)
    );
    this.weatherTimer = 0;
    this.transitionTime = 1;
    this.map = getMap(DEFAULT_MAP_ID);
    this.hasRain = this.map.weather.includes('rain');
    this.hasSnow = this.map.weather.includes('snow');
    this.hasFog = this.map.weather.includes('fog');
    this.rainActive = this.hasRain;
    this.previousRainActive = this.rainActive;
    this.transitionDuration = 1;
    this.lightningTimer = 0;
    this.snowSlow = Array.from({ length: 28 }, () => this.createSnowflake(true));
    this.snowFast = Array.from({ length: 18 }, () => this.createSnowflake(true));
    this.gustTimer = 7 + Math.random() * 5;
    this.gustRemaining = 0;
    this.gustStrength = 0;
    this.fogGradient = null;
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

  resetSnowflake(flake) {
    flake.x = randomRange(0, this.width);
    flake.y = -8;
    flake.radius = randomRange(1, 2.5);
    flake.speed = randomRange(24, 58);
    flake.drift = randomRange(-16, 16);
  }

  setMap(mapId) {
    this.map = getMap(mapId);
    this.hasRain = this.map.weather.includes('rain');
    this.hasSnow = this.map.weather.includes('snow');
    this.hasFog = this.map.weather.includes('fog');
    this.previousRainActive = this.hasRain;
    this.rainActive = this.previousRainActive;
    this.transitionTime = this.transitionDuration;
    for (let i = 0; i < this.snowSlow.length; i++) {
      this.resetSnowflake(this.snowSlow[i]);
      this.snowSlow[i].y = randomRange(0, this.height);
    }
    for (let i = 0; i < this.snowFast.length; i++) {
      this.resetSnowflake(this.snowFast[i]);
      this.snowFast[i].y = randomRange(0, this.height);
    }
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
    if (this.gustRemaining > 0) {
      this.gustRemaining = Math.max(0, this.gustRemaining - dt);
      if (this.gustRemaining === 0) this.gustStrength = 0;
    } else {
      this.gustTimer -= dt;
      if (this.gustTimer <= 0) {
        this.gustRemaining = randomRange(1, 2);
        this.gustStrength = randomRange(38, 72);
        this.gustTimer = randomRange(8, 14);
      }
    }

    this.weatherTimer += dt;
    if (this.weatherTimer >= GAME_CONFIG.WEATHER.WEATHER_CHANGE_INTERVAL) {
      this.weatherTimer = 0;
      this.previousRainActive = this.rainActive;
      this.rainActive = this.hasRain && Math.random() < GAME_CONFIG.WEATHER.RAIN_CHANCE;
      this.transitionTime = 0;
    }

    this.transitionTime = Math.min(
      this.transitionDuration,
      this.transitionTime + dt
    );

    const wind = GAME_CONFIG.WEATHER.WIND;
    if (this.hasRain) {
      for (let i = 0; i < this.rainDrops.length; i++) {
        const drop = this.rainDrops[i];
        drop.x += wind * dt;
        drop.y += drop.speed * dt;
        if (drop.y > this.groundY + drop.length || drop.x > this.width + 12) {
          drop.x = randomRange(-this.width * 0.1, this.width * 0.8);
          drop.y = randomRange(-40, -8);
        }
      }
    }

    if (this.hasSnow) {
      for (let i = 0; i < this.snowSlow.length; i++) {
        const flake = this.snowSlow[i];
        flake.x += (flake.drift * 0.45 + wind * 0.12 + this.gustStrength * 0.35) * dt;
        flake.y += flake.speed * 0.65 * dt;
        if (flake.y > this.height || flake.x < -8 || flake.x > this.width + 8) {
          this.resetSnowflake(flake);
        }
      }
      for (let i = 0; i < this.snowFast.length; i++) {
        const flake = this.snowFast[i];
        flake.x += (flake.drift + wind * 0.18 + this.gustStrength) * dt;
        flake.y += flake.speed * 1.35 * dt;
        if (flake.y > this.height || flake.x < -8 || flake.x > this.width + 8) {
          this.resetSnowflake(flake);
        }
      }
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
    const rainAlpha = this.hasRain ? this.getRainAlpha() : 0;
    if (rainAlpha > 0) {
      ctx.save();
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      const windSkew = GAME_CONFIG.WEATHER.WIND * 0.04;
      // Batch rain into 2 alpha buckets instead of 40+ individual stroke calls
      for (let bucket = 0; bucket < 2; bucket++) {
        ctx.globalAlpha = (bucket === 0 ? 0.28 : 0.48) * rainAlpha;
        ctx.beginPath();
        for (let i = bucket; i < this.rainDrops.length; i += 2) {
          const drop = this.rainDrops[i];
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - windSkew, drop.y + drop.length);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    if (this.hasSnow) {
      ctx.save();
      ctx.fillStyle = 'rgba(245, 252, 255, 0.72)';
      ctx.beginPath();
      for (let i = 0; i < this.snowSlow.length; i++) {
        const flake = this.snowSlow[i];
        ctx.moveTo(flake.x + flake.radius, flake.y);
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.fillStyle = 'rgba(245, 252, 255, 0.96)';
      ctx.beginPath();
      for (let i = 0; i < this.snowFast.length; i++) {
        const flake = this.snowFast[i];
        const r = flake.radius * 1.55;
        ctx.moveTo(flake.x + r, flake.y);
        ctx.arc(flake.x, flake.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }

    if (this.hasFog) {
      if (!this.fogGradient) {
        this.fogGradient = ctx.createLinearGradient(0, this.groundY * 0.52, 0, this.groundY);
        this.fogGradient.addColorStop(0, 'rgba(174, 191, 211, 0)');
        this.fogGradient.addColorStop(1, 'rgba(174, 191, 211, 0.2)');
      }
      ctx.fillStyle = this.fogGradient;
      ctx.fillRect(0, 0, this.width, this.groundY);
    }
  }

  reset() {
    this.weatherTimer = 0;
    this.transitionTime = this.transitionDuration;
    this.rainActive = this.map.weather.includes('rain');
    this.previousRainActive = this.rainActive;
    this.lightningTimer = 0;
    this.gustTimer = 7 + Math.random() * 5;
    this.gustRemaining = 0;
    this.gustStrength = 0;
    this.rainDrops.forEach((drop) => {
      drop.x = randomRange(-this.width * 0.1, this.width);
      drop.y = randomRange(0, this.groundY);
    });
  }
}
