/**
 * Particle System
 * Object-pooled 2D particle emitter for flap puffs, score sparks, and impact bursts.
 * Zero allocations during gameplay loop.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { randomRange } from '../../utils/math';

class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = 3;
    this.color = '#ffffff';
    this.alpha = 1;
    this.life = 0;
    this.maxLife = 1;
    this.active = false;
  }

  init(x, y, vx, vy, size, color, maxLife) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.color = color;
    this.alpha = 1;
    this.life = 0;
    this.maxLife = maxLife;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;
    this.life += dt;
    if (this.life >= this.maxLife) {
      this.active = false;
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.alpha = 1 - this.life / this.maxLife;
  }

  render(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.poolSize = GAME_CONFIG.VFX.PARTICLE_POOL_SIZE;
    this.pool = Array.from({ length: this.poolSize }, () => new Particle());
  }

  getAvailableParticle() {
    for (let i = 0; i < this.poolSize; i++) {
      if (!this.pool[i].active) {
        return this.pool[i];
      }
    }
    return null;
  }

  /**
   * Emit soft cloud puff when player flaps
   */
  emitFlapPuff(x, y) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const p = this.getAvailableParticle();
      if (!p) break;
      const vx = randomRange(-40, -10);
      const vy = randomRange(20, 60);
      const size = randomRange(3, 6);
      p.init(x - 10, y + 10, vx, vy, size, 'rgba(255, 255, 255, 0.7)', 0.35);
    }
  }

  /**
   * Emit golden sparkles when scoring a point
   */
  emitScoreSparkles(x, y) {
    const count = 12;
    const colors = ['#fde047', '#facc15', '#fbbf24', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const p = this.getAvailableParticle();
      if (!p) break;
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(60, 160);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = randomRange(2.5, 4.5);
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.init(x, y, vx, vy, size, color, 0.5);
    }
  }

  /**
   * Emit fiery/red impact burst on collision
   */
  emitImpactBurst(x, y) {
    const count = 16;
    const colors = ['#ef4444', '#f97316', '#fbbf24', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const p = this.getAvailableParticle();
      if (!p) break;
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(80, 220);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = randomRange(3, 6);
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.init(x, y, vx, vy, size, color, 0.45);
    }
  }

  update(dt) {
    for (let i = 0; i < this.poolSize; i++) {
      if (this.pool[i].active) {
        this.pool[i].update(dt);
      }
    }
  }

  render(ctx) {
    for (let i = 0; i < this.poolSize; i++) {
      if (this.pool[i].active) {
        this.pool[i].render(ctx);
      }
    }
  }

  reset() {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool[i].active = false;
    }
  }
}
