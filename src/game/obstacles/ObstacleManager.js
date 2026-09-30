/**
 * Obstacle Manager
 * Manages object pooling, timed spawning, scrolling, score triggers, and recycling.
 * Zero object allocations during gameplay.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { randomRange } from '../../utils/math';
import { Obstacle } from './Obstacle';

export class ObstacleManager {
  constructor(options = {}) {
    this.onScore = options.onScore || (() => {});
    this.onSpawn = options.onSpawn || (() => {});
    this.poolSize = GAME_CONFIG.OBSTACLES.MAX_POOL_SIZE;
    this.pool = Array.from({ length: this.poolSize }, () => new Obstacle());

    this.spawnInterval = GAME_CONFIG.OBSTACLES.SPAWN_INTERVAL;
    this.speed = GAME_CONFIG.OBSTACLES.SPEED;
    this.spawnTimer = 0;
    this.isEnabled = true;

    this.groundY = GAME_CONFIG.VIEWPORT.HEIGHT - GAME_CONFIG.WORLD.GROUND_HEIGHT;
  }

  getActiveObstacles() {
    return this.pool.filter((obs) => obs.active);
  }

  getAvailableObstacle() {
    for (let i = 0; i < this.poolSize; i++) {
      if (!this.pool[i].active) {
        return this.pool[i];
      }
    }
    return null;
  }

  spawn() {
    const obstacle = this.getAvailableObstacle();
    if (!obstacle) return;

    const minTop = GAME_CONFIG.OBSTACLES.MIN_TOP_HEIGHT;
    const gapSize = GAME_CONFIG.OBSTACLES.GAP_SIZE;
    const minBottom = 80;
    const maxTop = this.groundY - gapSize - minBottom;

    const gapTopY = randomRange(minTop, maxTop);
    const spawnX = GAME_CONFIG.VIEWPORT.WIDTH + 20;

    obstacle.init(spawnX, gapTopY, gapSize);
    this.onSpawn(obstacle);
  }

  update(dt, playerX) {
    if (!this.isEnabled) return;

    // 1. Spawning countdown
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawn();
    }

    // 2. Update all active obstacles
    for (let i = 0; i < this.poolSize; i++) {
      const obs = this.pool[i];
      if (!obs.active) continue;

      obs.update(dt, this.speed);

      // Score check: player passed through the pipe center
      if (!obs.passed && playerX > obs.x + obs.width / 2) {
        obs.passed = true;
        this.onScore(obs);
      }

      // Recycle when offscreen left
      if (obs.x + obs.width < -10) {
        obs.active = false;
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
    this.spawnTimer = 0;
    for (let i = 0; i < this.poolSize; i++) {
      this.pool[i].active = false;
      this.pool[i].passed = false;
    }
  }
}
