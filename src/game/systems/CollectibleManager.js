/**
 * Spawns, collects, renders, and persists coin and key pickups.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { safeStorage } from '../../utils/storage';
import { assetManager } from '../../assets/AssetManager';
import { checkCircleRectCollision } from '../collision/Hitbox';

const COLLECTIBLE_TYPES = {
  COIN: 'coin',
  KEY: 'key',
};

const COLLECTIBLE_COLORS = {
  [COLLECTIBLE_TYPES.COIN]: '#fbbf24',
  [COLLECTIBLE_TYPES.KEY]: '#67e8f9',
};

export class CollectibleManager {
  constructor(options = {}) {
    this.pool = Array.from(
      { length: GAME_CONFIG.CURRENCY.POOL_SIZE },
      () => this.createCollectible()
    );
    this.coins = safeStorage.getNumber(GAME_CONFIG.CURRENCY.COINS_STORAGE_KEY, 0);
    this.keys = safeStorage.getNumber(GAME_CONFIG.CURRENCY.KEYS_STORAGE_KEY, 0);
    this.pipesSeen = 0;
    this.onChange = options.onChange || (() => {});
  }

  createCollectible() {
    return { active: false, type: null, x: 0, y: 0, radius: 0, pulse: 0 };
  }

  onObstacleSpawned(obstacle) {
    this.pipesSeen += 1;
    const isKeyPipe = this.pipesSeen % GAME_CONFIG.CURRENCY.KEY_EVERY_PIPES === 0;
    const type = isKeyPipe
      ? COLLECTIBLE_TYPES.KEY
      : Math.random() < GAME_CONFIG.CURRENCY.COIN_SPAWN_CHANCE
        ? COLLECTIBLE_TYPES.COIN
        : null;
    if (!type) return;

    const collectible = this.pool.find((item) => !item.active);
    if (!collectible) return;

    collectible.active = true;
    collectible.type = type;
    collectible.radius = type === COLLECTIBLE_TYPES.KEY
      ? GAME_CONFIG.CURRENCY.KEY_RADIUS
      : GAME_CONFIG.CURRENCY.RADIUS;
    collectible.x = obstacle.x + obstacle.width / 2;
    collectible.y = obstacle.gapTopY + obstacle.gapSize / 2;
    collectible.pulse = Math.random() * Math.PI * 2;
  }

  update(dt, player) {
    const playerHitbox = player.getHitbox();
    this.pool.forEach((collectible) => {
      if (!collectible.active) return;
      collectible.x -= GAME_CONFIG.OBSTACLES.SPEED * dt;
      collectible.pulse += dt * 5;

      const bounds = {
        x: collectible.x - collectible.radius,
        y: collectible.y - collectible.radius,
        width: collectible.radius * 2,
        height: collectible.radius * 2,
      };
      if (checkCircleRectCollision(playerHitbox, bounds)) {
        this.collect(collectible.type);
        collectible.active = false;
        collectible.type = null;
        return;
      }

      if (collectible.x < -collectible.radius) {
        collectible.active = false;
        collectible.type = null;
      }
    });
  }

  collect(type) {
    if (type === COLLECTIBLE_TYPES.COIN) {
      this.coins += 1;
      safeStorage.setNumber(GAME_CONFIG.CURRENCY.COINS_STORAGE_KEY, this.coins);
    } else if (type === COLLECTIBLE_TYPES.KEY) {
      this.keys += 1;
      safeStorage.setNumber(GAME_CONFIG.CURRENCY.KEYS_STORAGE_KEY, this.keys);
    }
    this.onChange();
  }

  spendKeys(amount) {
    if (this.keys < amount) return false;
    this.keys -= amount;
    safeStorage.setNumber(GAME_CONFIG.CURRENCY.KEYS_STORAGE_KEY, this.keys);
    this.onChange();
    return true;
  }

  getWallet() {
    return { coins: this.coins, keys: this.keys };
  }

  render(ctx) {
    this.pool.forEach((collectible) => {
      if (!collectible.active) return;
      const color = COLLECTIBLE_COLORS[collectible.type];
      const radius = collectible.radius + Math.sin(collectible.pulse) * 1.5;

      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(collectible.x, collectible.y, radius + 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      const image = assetManager.getImage(`collectible.${collectible.type}`);
      if (image) {
        const size = radius * 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.drawImage(image, collectible.x - size / 2, collectible.y - size / 2, size, size);
      }
      ctx.restore();
    });
  }

  reset() {
    this.pool.forEach((collectible) => {
      collectible.active = false;
      collectible.type = null;
    });
  }

  startNewRun() {
    this.reset();
    this.pipesSeen = 0;
  }
}