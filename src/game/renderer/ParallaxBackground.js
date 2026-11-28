/**
 * Parallax Background System
 * Multi-layer 2D canvas renderer:
 * 1. Atmospheric sky gradient
 * 2. Distant clouds (slow scroll)
 * 3. Skyline & mountain silhouettes (medium scroll)
 * 4. Ground plane with animated grass rim and dirt strip (gameplay scroll)
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { ENVIRONMENTS, EnvironmentSystem } from '../environment/EnvironmentSystem';
import { DEFAULT_MAP_ID, getMap } from '../../config/mapConfig';
import { AmbientLifeRenderer } from './AmbientLifeRenderer';
import { assetManager } from '../../assets/AssetManager';

export class ParallaxBackground {
  constructor(options = {}) {
    this.width = options.width || GAME_CONFIG.VIEWPORT.WIDTH;
    this.height = GAME_CONFIG.VIEWPORT.HEIGHT;
    this.groundHeight = GAME_CONFIG.WORLD.GROUND_HEIGHT;
    this.groundY = this.height - this.groundHeight;

    this.cloudOffset = 0;
    this.farOffset = 0;
    this.midOffset = 0;
    this.nearOffset = 0;
    this.mountainOffset = 0;
    this.groundOffset = 0;
    this.environmentSystem = new EnvironmentSystem();
    this.ambientLife = new AmbientLifeRenderer();
    this.map = getMap(DEFAULT_MAP_ID);
    this._skyGradients = new Map();
    this._groundGradients = new Map();
    this._tintGradients = new Map();
    this._moonHaloGrad = null;
    this._moonBodyGrad = null;

    // Distant cloud definitions
    const cloudTemplates = [
      { x: 40, y: 110, w: 80, h: 28, speed: 0.72 },
      { x: 190, y: 70, w: 110, h: 36, speed: 1 },
      { x: 330, y: 140, w: 75, h: 24, speed: 1.28 },
    ];

    const starTemplates = [
      { x: 34, y: 78, r: 1.2 },
      { x: 86, y: 142, r: 0.9 },
      { x: 145, y: 62, r: 1.1 },
      { x: 207, y: 118, r: 0.8 },
      { x: 258, y: 50, r: 1.3 },
      { x: 342, y: 92, r: 1 },
      { x: 370, y: 164, r: 0.8 },
    ];
    const repeats = Math.ceil(this.width / GAME_CONFIG.VIEWPORT.WIDTH);
    this.clouds = [];
    this.stars = [];
    for (let repeat = 0; repeat < repeats; repeat++) {
      const offset = repeat * GAME_CONFIG.VIEWPORT.WIDTH;
      this.clouds.push(...cloudTemplates.map((cloud) => ({ ...cloud, x: cloud.x + offset })));
      this.stars.push(...starTemplates.map((star) => ({ ...star, x: star.x + offset })));
    }
  }

  update(dt, speed) {
    this.environmentSystem.update(dt);
    this.ambientLife.update(dt);

    // Parallax scroll updates
    this.cloudOffset = (this.cloudOffset + speed * GAME_CONFIG.WORLD.PARALLAX_CLOUDS * dt) % this.width;
    this.farOffset = (this.farOffset + speed * 0.2 * dt) % this.width;
    this.midOffset = (this.midOffset + speed * 0.5 * dt) % this.width;
    this.nearOffset = (this.nearOffset + speed * 0.8 * dt) % this.width;
    this.mountainOffset = (this.mountainOffset + speed * GAME_CONFIG.WORLD.PARALLAX_MOUNTAINS * dt) % this.width;
    this.groundOffset = (this.groundOffset + speed * GAME_CONFIG.WORLD.PARALLAX_GROUND * dt) % 24; // 24px pattern repeat
  }

  render(ctx) {
    const transition = this.environmentSystem.getTransition();

    if (transition.isTransitioning) {
      this.renderEnvironment(ctx, transition.previous);
      ctx.save();
      ctx.globalAlpha = transition.progress;
      this.renderEnvironment(ctx, transition.current);
      ctx.restore();
      return;
    }

    this.renderEnvironment(ctx, transition.current);
  }

  setScore(score) {
    return this.environmentSystem.setScore(score);
  }

  setMap(mapId) {
    this.map = getMap(mapId);
    this.backgroundImage = this.map.backgroundAssetId
      ? assetManager.getImage(this.map.backgroundAssetId)
      : null;
  }

  reset(score = 0) {
    this.cloudOffset = 0;
    this.farOffset = 0;
    this.midOffset = 0;
    this.nearOffset = 0;
    this.mountainOffset = 0;
    this.groundOffset = 0;
    this.environmentSystem.reset(score);
  }

  renderEnvironment(ctx, environment) {
    if (this.map.backgroundAssetId) {
      this.backgroundImage = this.backgroundImage
        || assetManager.getImage(this.map.backgroundAssetId);
      if (this.backgroundImage) {
        const scale = Math.max(
          this.width / this.backgroundImage.width,
          this.height / this.backgroundImage.height
        );
        const sourceWidth = this.width / scale;
        const sourceHeight = this.height / scale;
        ctx.drawImage(
          this.backgroundImage,
          (this.backgroundImage.width - sourceWidth) / 2,
          (this.backgroundImage.height - sourceHeight) / 2,
          sourceWidth,
          sourceHeight,
          0,
          0,
          this.width,
          this.height
        );
        if (this.map.id === 'christmas') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(0, 0, this.width, this.height);
        }
        return;
      }
    }

    this.renderSky(ctx, environment);

    if (environment === ENVIRONMENTS.NIGHT || this.map.theme === 'night') {
      this.renderNightDetails(ctx);
    }

    this.renderClouds(ctx, environment);
    this.renderMountains(ctx, environment);
    this.renderMapDetails(ctx);
  }

  renderGround(ctx) {
    ctx.save();

    let dirtGrad = this._groundGradients.get(this.map.id);
    if (!dirtGrad) {
      dirtGrad = ctx.createLinearGradient(0, this.groundY, 0, this.height);
      dirtGrad.addColorStop(0, this.map.ground[0]);
      dirtGrad.addColorStop(0.15, this.map.ground[0]);
      dirtGrad.addColorStop(1, this.map.ground[1]);
      this._groundGradients.set(this.map.id, dirtGrad);
    }

    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, this.groundY, this.width, this.groundHeight);

    ctx.fillStyle = this.map.land;
    ctx.fillRect(0, this.groundY, this.width, 14);

    ctx.fillStyle = this.map.ground[1];
    ctx.fillRect(0, this.groundY + 14, this.width, 3);

    // 3. Scrolling decorative diagonal hash stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.groundY + 17, this.width, 18);
    ctx.clip();

    ctx.strokeStyle = this.map.ground[0];
    ctx.lineWidth = 3;
    const stripeSpacing = 20;
    const startX = -stripeSpacing - this.groundOffset;

    ctx.beginPath();
    for (let x = startX; x < this.width + stripeSpacing; x += stripeSpacing) {
      ctx.moveTo(x, this.groundY + 17);
      ctx.lineTo(x - 10, this.groundY + 35);
    }
    ctx.stroke();
    ctx.restore();

    // Top border line
    ctx.strokeStyle = this.map.ground[1];
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(this.width, this.groundY);
    ctx.stroke();

    ctx.restore();
  }

  renderSky(ctx, environment) {
    let sky = this._skyGradients.get(this.map.id);
    if (!sky) {
      sky = ctx.createLinearGradient(0, 0, 0, this.groundY);
      sky.addColorStop(0, this.map.sky[0]);
      sky.addColorStop(0.58, this.map.sky[1]);
      sky.addColorStop(1, this.map.sky[2]);
      this._skyGradients.set(this.map.id, sky);
    }

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.groundY);

    if (environment !== ENVIRONMENTS.MORNING) {
      let tint = this._tintGradients.get(environment);
      if (!tint) {
        tint = ctx.createLinearGradient(0, 0, 0, this.groundY);
        if (environment === ENVIRONMENTS.NIGHT) {
          tint.addColorStop(0, 'rgba(5, 10, 38, 0.68)');
          tint.addColorStop(1, 'rgba(19, 29, 59, 0.26)');
        } else {
          tint.addColorStop(0, 'rgba(69, 24, 83, 0.2)');
          tint.addColorStop(1, 'rgba(255, 135, 99, 0.2)');
        }
        this._tintGradients.set(environment, tint);
      }
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, this.width, this.groundY);
    }
  }

  renderNightDetails(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.beginPath();
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      ctx.moveTo(star.x + star.r, star.y);
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    }
    ctx.fill();

    const moonX = this.width - 72;
    const moonY = 96;
    const moonRadius = 27;

    if (!this._moonHaloGrad) {
      this._moonHaloGrad = ctx.createRadialGradient(
        moonX, moonY, moonRadius * 0.8,
        moonX, moonY, moonRadius * 2.1
      );
      this._moonHaloGrad.addColorStop(0, 'rgba(255, 244, 190, 0.42)');
      this._moonHaloGrad.addColorStop(1, 'rgba(255, 244, 190, 0)');
    }
    ctx.fillStyle = this._moonHaloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.1, 0, Math.PI * 2);
    ctx.fill();

    if (!this._moonBodyGrad) {
      this._moonBodyGrad = ctx.createRadialGradient(
        moonX - 7, moonY - 8, 3,
        moonX, moonY, moonRadius
      );
      this._moonBodyGrad.addColorStop(0, '#fffdf0');
      this._moonBodyGrad.addColorStop(0.75, '#fef3c7');
      this._moonBodyGrad.addColorStop(1, '#e8dca7');
    }
    ctx.fillStyle = this._moonBodyGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(177, 168, 125, 0.18)';
    ctx.beginPath();
    ctx.arc(moonX - 9, moonY - 8, 5.5, 0, Math.PI * 2);
    ctx.moveTo(moonX + 12, moonY + 7);
    ctx.arc(moonX + 8, moonY + 7, 4, 0, Math.PI * 2);
    ctx.moveTo(moonX + 12.8, moonY - 10);
    ctx.arc(moonX + 10, moonY - 10, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderClouds(ctx, environment) {
    if (this.map.id === 'night-city') return;

    ctx.save();
    ctx.fillStyle = this.map.id === 'sunset-valley'
      ? 'rgba(255, 226, 210, 0.28)'
      : this.map.id === 'snowfall'
        ? 'rgba(245, 252, 255, 0.68)'
        : 'rgba(255, 255, 255, 0.68)';

    this.clouds.forEach((cloud) => {
      let renderX = (cloud.x - this.cloudOffset * cloud.speed + this.width) % this.width;
      this.drawCloudShape(ctx, renderX, cloud.y, cloud.w, cloud.h);
      // Seamless wrap-around
      if (renderX + cloud.w > this.width) {
        this.drawCloudShape(ctx, renderX - this.width, cloud.y, cloud.w, cloud.h);
      }
    });

    ctx.restore();
  }

  drawCloudShape(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.5, w * 0.5, h * 0.45, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.3, y + h * 0.6, w * 0.3, h * 0.35, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.7, y + h * 0.6, w * 0.3, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  renderMountains(ctx, environment) {
    if (this.map.id === 'night-city') {
      this.renderCityscape(ctx);
      return;
    }

    if (this.map.id === 'snowfall') {
      this.renderSnowyMountains(ctx);
      return;
    }

    if (this.map.id === 'jungle') {
      this.renderJungleCanopy(ctx);
      return;
    }

    ctx.save();
    ctx.fillStyle = this.map.land;
    ctx.globalAlpha = environment === ENVIRONMENTS.NIGHT ? 0.7 : 0.42;

    const base = this.groundY;
    const mWidth = this.width;

    ctx.beginPath();
    ctx.moveTo(0, base);

    // Dynamic rolling landscape
    const numPoints = 8;
    const step = mWidth / numPoints;
    for (let i = 0; i <= numPoints + 1; i++) {
      const px = (i * step - this.farOffset + mWidth * 2) % mWidth;
      const height = i % 2 === 0 ? 90 : 50;
      ctx.lineTo(px, base - height);
    }
    ctx.lineTo(mWidth, base);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  renderCityscape(ctx) {
    const heights = [32, 54, 37, 72, 44, 60, 35, 68, 48, 58];
    const base = this.groundY;
    const blockWidth = this.width / heights.length;
    ctx.save();
    heights.forEach((height, index) => {
      const x = (index * blockWidth - this.midOffset + this.width * 2) % this.width;
      ctx.fillStyle = index % 2 ? '#17243d' : '#202b48';
      ctx.fillRect(x, base - height, blockWidth + 1, height);
      ctx.fillStyle = 'rgba(250, 217, 130, 0.76)';
      for (let row = 0; row < Math.floor(height / 16); row += 1) {
        for (let column = 0; column < 2; column += 1) {
          if ((index + row + column) % 3 !== 0) {
            ctx.fillRect(x + 5 + column * 9, base - height + 8 + row * 13, 3, 4);
          }
        }
      }
    });
    ctx.restore();
  }

  renderSnowyMountains(ctx) {
    const base = this.groundY;
    const peaks = [0.1, 0.27, 0.44, 0.63, 0.8, 0.97];
    ctx.save();
    peaks.forEach((ratio, index) => {
      const x = (ratio * this.width - this.midOffset + this.width * 2) % this.width;
      const peakHeight = index % 2 ? 72 : 112;
      ctx.fillStyle = index % 2 ? '#91b9cd' : '#789eb7';
      ctx.beginPath();
      ctx.moveTo(x - 58, base);
      ctx.lineTo(x, base - peakHeight);
      ctx.lineTo(x + 58, base);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f3fbff';
      ctx.beginPath();
      ctx.moveTo(x - 17, base - peakHeight + 32);
      ctx.lineTo(x, base - peakHeight);
      ctx.lineTo(x + 19, base - peakHeight + 35);
      ctx.lineTo(x + 5, base - peakHeight + 27);
      ctx.lineTo(x - 3, base - peakHeight + 38);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  renderJungleCanopy(ctx) {
    const base = this.groundY;
    ctx.save();
    ctx.fillStyle = '#174b3a';
    for (let index = 0; index < 7; index += 1) {
      const x = (index * 66 - this.nearOffset + this.width * 2) % this.width;
      const height = index % 2 ? 90 : 122;
      ctx.fillRect(x, base - height, 12, height);
      ctx.beginPath();
      ctx.ellipse(x + 6, base - height, 38, 24, 0, 0, Math.PI * 2);
      ctx.ellipse(x - 11, base - height + 14, 26, 18, -0.45, 0, Math.PI * 2);
      ctx.ellipse(x + 24, base - height + 16, 29, 18, 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(47, 105, 65, 0.85)';
    ctx.lineWidth = 4;
    for (let vine = 0; vine < 3; vine += 1) {
      const x = ((vine + 1) * this.width / 4 - this.cloudOffset * 0.25 + this.width) % this.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x - 18, 42, x + 20, 74, x + 4, 116);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderMapDetails(ctx) {
    if (this.map.id === 'skyland') {
      const islands = [
        { x: 58, y: this.groundY * 0.34, width: 34 },
        { x: 286, y: this.groundY * 0.43, width: 25 },
      ];
      ctx.save();
      islands.forEach(({ x, y, width }) => {
        const driftX = (x - this.nearOffset + this.width * 2) % this.width;
        ctx.fillStyle = '#71bd78';
        ctx.beginPath();
        ctx.ellipse(driftX, y, width, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6c9a6b';
        ctx.beginPath();
        ctx.moveTo(driftX - width * 0.72, y + 4);
        ctx.lineTo(driftX + width * 0.72, y + 4);
        ctx.lineTo(driftX, y + 18);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
    }

    this.ambientLife.render(ctx, this.map, this.width, this.groundY);
  }
}
