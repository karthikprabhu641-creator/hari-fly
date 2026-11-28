/**
 * Spawns, collects, renders, and persists coin and key pickups.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { safeStorage } from '../../utils/storage';
import { assetManager } from '../../assets/AssetManager';
import { checkCircleRectCollision } from '../collision/Hitbox';
import { vibrate } from '../../utils/haptics';
import { audioManager } from '../../audio/AudioManager';
import { eventBus, GAME_EVENTS } from './EventBus';

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
    this._tempBounds = { x: 0, y: 0, width: 0, height: 0 };
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

  update(dt, player, obstacleSpeed = GAME_CONFIG.OBSTACLES.SPEED) {
    const playerHitbox = player.getHitbox();
    const bounds = this._tempBounds;
    for (let i = 0; i < this.pool.length; i++) {
      const collectible = this.pool[i];
      if (!collectible.active) continue;
      collectible.x -= obstacleSpeed * dt;
      collectible.pulse += dt * 5;

      const r = collectible.radius;
      bounds.x = collectible.x - r;
      bounds.y = collectible.y - r;
      bounds.width = r * 2;
      bounds.height = r * 2;
      if (checkCircleRectCollision(playerHitbox, bounds)) {
        this.collect(collectible.type);
        collectible.active = false;
        collectible.type = null;
        continue;
      }

      if (collectible.x < -r) {
        collectible.active = false;
        collectible.type = null;
      }
    }
  }

  collect(type) {
    if (type === COLLECTIBLE_TYPES.COIN) {
      this.coins += 1;
      safeStorage.setNumber(GAME_CONFIG.CURRENCY.COINS_STORAGE_KEY, this.coins);
      eventBus.emit(GAME_EVENTS.COIN_COLLECTED, { coinDelta: 1 });
      if (audioManager.vibrationEnabled) vibrate(8);
    } else if (type === COLLECTIBLE_TYPES.KEY) {
      this.keys += 1;
      safeStorage.setNumber(GAME_CONFIG.CURRENCY.KEYS_STORAGE_KEY, this.keys);
      eventBus.emit(GAME_EVENTS.KEY_COLLECTED, { keyDelta: 1 });
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

  spendCoins(amount) {
    if (this.coins < amount) return false;
    this.coins -= amount;
    safeStorage.setNumber(GAME_CONFIG.CURRENCY.COINS_STORAGE_KEY, this.coins);
    this.onChange();
    return true;
  }

  addReward({ coins = 0, keys = 0 }) {
    if (coins > 0) {
      this.coins += coins;
      safeStorage.setNumber(GAME_CONFIG.CURRENCY.COINS_STORAGE_KEY, this.coins);
    }
    if (keys > 0) {
      this.keys += keys;
      safeStorage.setNumber(GAME_CONFIG.CURRENCY.KEYS_STORAGE_KEY, this.keys);
    }
    this.onChange();
  }

  getWallet() {
    return { coins: this.coins, keys: this.keys };
  }

  render(ctx) {
    ctx.save();
    for (let i = 0; i < this.pool.length; i++) {
      const collectible = this.pool[i];
      if (!collectible.active) continue;
      const color = COLLECTIBLE_COLORS[collectible.type];
      const radius = collectible.radius + Math.sin(collectible.pulse) * 1.5;

      ctx.globalAlpha = 0.24;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(collectible.x, collectible.y, radius + 7, 0, Math.PI * 2);
      ctx.fill();

      const image = assetManager.getImage(`collectible.${collectible.type}`);
      if (image) {
        ctx.globalAlpha = 1;
        const size = radius * 2.5;
        ctx.drawImage(image, collectible.x - size / 2, collectible.y - size / 2, size, size);
      }
    }
    ctx.restore();
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