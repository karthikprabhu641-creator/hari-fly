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

export class ParallaxBackground {
  constructor() {
    this.width = GAME_CONFIG.VIEWPORT.WIDTH;
    this.height = GAME_CONFIG.VIEWPORT.HEIGHT;
    this.groundHeight = GAME_CONFIG.WORLD.GROUND_HEIGHT;
    this.groundY = this.height - this.groundHeight;

    this.cloudOffset = 0;
    this.mountainOffset = 0;
    this.groundOffset = 0;
    this.environmentSystem = new EnvironmentSystem();

    // Distant cloud definitions
    this.clouds = [
      { x: 40, y: 110, w: 80, h: 28, speed: 0.72 },
      { x: 190, y: 70, w: 110, h: 36, speed: 1 },
      { x: 330, y: 140, w: 75, h: 24, speed: 1.28 },
    ];

    this.stars = [
      { x: 34, y: 78, r: 1.2 },
      { x: 86, y: 142, r: 0.9 },
      { x: 145, y: 62, r: 1.1 },
      { x: 207, y: 118, r: 0.8 },
      { x: 258, y: 50, r: 1.3 },
      { x: 342, y: 92, r: 1 },
      { x: 370, y: 164, r: 0.8 },
    ];
  }

  update(dt, speed) {
    this.environmentSystem.update(dt);

    // Parallax scroll updates
    this.cloudOffset = (this.cloudOffset + speed * GAME_CONFIG.WORLD.PARALLAX_CLOUDS * dt) % this.width;
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

  reset(score = 0) {
    this.cloudOffset = 0;
    this.mountainOffset = 0;
    this.groundOffset = 0;
    this.environmentSystem.reset(score);
  }

  renderEnvironment(ctx, environment) {
    this.renderSky(ctx, environment);

    if (environment === ENVIRONMENTS.NIGHT) {
      this.renderNightDetails(ctx);
    }

    this.renderClouds(ctx, environment);
    this.renderMountains(ctx, environment);
  }

  renderGround(ctx) {
    ctx.save();

    // 1. Ground dirt body
    const dirtGrad = ctx.createLinearGradient(0, this.groundY, 0, this.height);
    dirtGrad.addColorStop(0, '#ded895');
    dirtGrad.addColorStop(0.15, '#d3ca79');
    dirtGrad.addColorStop(1, '#9e9445');

    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, this.groundY, this.width, this.groundHeight);

    // 2. Top grass border
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, this.groundY, this.width, 14);

    ctx.fillStyle = '#558a22';
    ctx.fillRect(0, this.groundY + 14, this.width, 3);

    // 3. Scrolling decorative diagonal hash stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.groundY + 17, this.width, 18);
    ctx.clip();

    ctx.strokeStyle = '#b8af5c';
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
    ctx.strokeStyle = '#385514';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(this.width, this.groundY);
    ctx.stroke();

    ctx.restore();
  }

  renderSky(ctx, environment) {
    const sky = ctx.createLinearGradient(0, 0, 0, this.groundY);

    if (environment === ENVIRONMENTS.NIGHT) {
      sky.addColorStop(0, '#020617');
      sky.addColorStop(0.55, '#0f172a');
      sky.addColorStop(0.85, '#1e293b');
      sky.addColorStop(1, '#334155');
    } else if (environment === ENVIRONMENTS.SUNSET) {
      sky.addColorStop(0, '#312e81');
      sky.addColorStop(0.42, '#be185d');
      sky.addColorStop(0.78, '#fb7185');
      sky.addColorStop(1, '#fdba74');
    } else {
      sky.addColorStop(0, '#38bdf8');
      sky.addColorStop(0.55, '#7dd3fc');
      sky.addColorStop(0.85, '#bae6fd');
      sky.addColorStop(1, '#fed7aa');
    }

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.groundY);
  }

  renderNightDetails(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    this.stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(this.width - 72, 96, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(this.width - 60, 87, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderClouds(ctx, environment) {
    if (environment === ENVIRONMENTS.NIGHT) return;

    ctx.save();
    ctx.fillStyle = environment === ENVIRONMENTS.SUNSET
      ? 'rgba(255, 226, 210, 0.28)'
      : 'rgba(255, 255, 255, 0.75)';

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
    ctx.save();
    ctx.fillStyle = environment === ENVIRONMENTS.NIGHT
      ? '#0f172a'
      : environment === ENVIRONMENTS.SUNSET
        ? '#7f1d5a'
        : '#6ee7b7';
    ctx.globalAlpha = environment === ENVIRONMENTS.NIGHT ? 0.72 : 0.35;

    const base = this.groundY;
    const mWidth = this.width;

    ctx.beginPath();
    ctx.moveTo(0, base);

    // Dynamic rolling landscape
    const numPoints = 8;
    const step = mWidth / numPoints;
    for (let i = 0; i <= numPoints + 1; i++) {
      const px = (i * step - this.mountainOffset + mWidth * 2) % mWidth;
      const height = i % 2 === 0 ? 90 : 50;
      ctx.lineTo(px, base - height);
    }
    ctx.lineTo(mWidth, base);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
