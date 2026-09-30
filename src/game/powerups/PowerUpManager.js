/**
 * Central power-up manager.
 * Owns pooled collectibles, active effects, durations, and canvas rendering.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { checkCircleRectCollision } from '../collision/Hitbox';
import { randomRange } from '../../utils/math';

export const POWER_UP_TYPES = {
  SHIELD: 'shield',
  SLOW_MOTION: 'slow-motion',
  SCORE_MULTIPLIER: 'score-multiplier',
};

const POWER_UP_COLORS = {
  [POWER_UP_TYPES.SHIELD]: '#38bdf8',
  [POWER_UP_TYPES.SLOW_MOTION]: '#c084fc',
  [POWER_UP_TYPES.SCORE_MULTIPLIER]: '#facc15',
};

const POWER_UP_LABELS = {
  [POWER_UP_TYPES.SHIELD]: 'SHIELD',
  [POWER_UP_TYPES.SLOW_MOTION]: 'SLOW',
  [POWER_UP_TYPES.SCORE_MULTIPLIER]: '2X',
};

export class PowerUpManager {
  constructor(options = {}) {
    this.pool = Array.from(
      { length: GAME_CONFIG.POWERUPS.POOL_SIZE },
      () => this.createPowerUp()
    );
    this.groundY = GAME_CONFIG.VIEWPORT.HEIGHT - GAME_CONFIG.WORLD.GROUND_HEIGHT;
    this.obstaclesSinceSpawn = 0;
    this.activeShield = false;
    this.slowMotionRemaining = 0;
    this.scoreMultiplierRemaining = 0;
    this.collisionGraceRemaining = 0;
    this.uiUpdateTimer = 0;
    this.onChange = options.onChange || (() => {});
    this.onScoreMultiplierChange = options.onScoreMultiplierChange || (() => {});
  }

  createPowerUp() {
    return {
      active: false,
      type: null,
      x: 0,
      y: 0,
      radius: GAME_CONFIG.POWERUPS.RADIUS,
      pulse: 0,
    };
  }

  onObstaclePassed(playerX, obstacle) {
    this.obstaclesSinceSpawn += 1;
    if (this.obstaclesSinceSpawn < GAME_CONFIG.POWERUPS.SPAWN_EVERY_OBSTACLES) return;
    this.obstaclesSinceSpawn = 0;

    if (Math.random() > GAME_CONFIG.POWERUPS.SPAWN_CHANCE) return;
    this.spawn(playerX, obstacle);
  }

  spawn(playerX, obstacle) {
    const powerUp = this.pool.find((item) => !item.active);
    if (!powerUp) return;

    powerUp.active = true;
    powerUp.type = this.getRandomType();
    powerUp.x = Math.min(
      GAME_CONFIG.VIEWPORT.WIDTH - 40,
      Math.max(
        playerX + 35,
        (obstacle?.x || playerX) + (obstacle?.width || 0) + 20
      )
    );

    if (obstacle) {
      const gapPadding = powerUp.radius + 8;
      const gapTop = obstacle.gapTopY + gapPadding;
      const gapBottom = obstacle.gapTopY + obstacle.gapSize - gapPadding;
      powerUp.y = randomRange(gapTop, Math.max(gapTop, gapBottom));
    } else {
      powerUp.y = randomRange(150, this.groundY - 140);
    }
    powerUp.pulse = Math.random() * Math.PI * 2;
  }

  getRandomType() {
    const types = Object.values(POWER_UP_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  update(gameplayDt, realDt, player) {
    this.collisionGraceRemaining = Math.max(
      0,
      this.collisionGraceRemaining - realDt
    );

    if (this.slowMotionRemaining > 0) {
      this.slowMotionRemaining = Math.max(0, this.slowMotionRemaining - realDt);
    }
    if (this.scoreMultiplierRemaining > 0) {
      this.scoreMultiplierRemaining = Math.max(0, this.scoreMultiplierRemaining - realDt);
      if (this.scoreMultiplierRemaining === 0) {
        this.onScoreMultiplierChange(1);
        this.onChange();
      }
    }

    this.uiUpdateTimer += realDt;
    if (this.uiUpdateTimer >= 0.1) {
      this.uiUpdateTimer = 0;
      if (this.activeShield || this.slowMotionRemaining > 0 || this.scoreMultiplierRemaining > 0) {
        this.onChange();
      }
    }

    const playerHitbox = player.getHitbox();
    this.pool.forEach((powerUp) => {
      if (!powerUp.active) return;
      powerUp.x -= GAME_CONFIG.OBSTACLES.SPEED * gameplayDt;
      powerUp.pulse += realDt * 5;

      if (this.isCollected(powerUp, playerHitbox)) {
        this.activate(powerUp.type);
        powerUp.active = false;
        powerUp.type = null;
        this.onChange();
        return;
      }

      if (powerUp.x < -powerUp.radius) {
        powerUp.active = false;
        powerUp.type = null;
      }
    });
  }

  isCollected(powerUp, playerHitbox) {
    const powerUpRect = {
      x: powerUp.x - powerUp.radius,
      y: powerUp.y - powerUp.radius,
      width: powerUp.radius * 2,
      height: powerUp.radius * 2,
    };
    return checkCircleRectCollision(playerHitbox, powerUpRect);
  }

  activate(type) {
    if (type === POWER_UP_TYPES.SHIELD) {
      this.activeShield = true;
      return;
    }

    if (type === POWER_UP_TYPES.SLOW_MOTION) {
      this.slowMotionRemaining = GAME_CONFIG.POWERUPS.SLOW_DURATION;
      return;
    }

    if (type === POWER_UP_TYPES.SCORE_MULTIPLIER) {
      this.scoreMultiplierRemaining = GAME_CONFIG.POWERUPS.SCORE_MULTIPLIER_DURATION;
      this.onScoreMultiplierChange(GAME_CONFIG.POWERUPS.SCORE_MULTIPLIER);
    }
  }

  tryProtectCollision(source) {
    const isObstacleCollision = source === 'top_pipe' || source === 'bottom_pipe';
    if (!isObstacleCollision) return false;
    if (this.collisionGraceRemaining > 0) return true;
    if (!this.activeShield) return false;

    this.activeShield = false;
    this.collisionGraceRemaining = GAME_CONFIG.POWERUPS.COLLISION_GRACE_DURATION;
    this.onChange();
    return true;
  }

  getTimeScale() {
    return this.slowMotionRemaining > 0
      ? GAME_CONFIG.POWERUPS.SLOW_SPEED_MULTIPLIER
      : 1;
  }

  getUiState() {
    const activePowerUps = [];
    if (this.activeShield) {
      activePowerUps.push({ type: POWER_UP_TYPES.SHIELD, remaining: null });
    }
    if (this.slowMotionRemaining > 0) {
      activePowerUps.push({ type: POWER_UP_TYPES.SLOW_MOTION, remaining: this.slowMotionRemaining });
    }
    if (this.scoreMultiplierRemaining > 0) {
      activePowerUps.push({ type: POWER_UP_TYPES.SCORE_MULTIPLIER, remaining: this.scoreMultiplierRemaining });
    }
    return activePowerUps;
  }

  render(ctx) {
    this.pool.forEach((powerUp) => {
      if (!powerUp.active) return;
      const color = POWER_UP_COLORS[powerUp.type];
      const radius = powerUp.radius + Math.sin(powerUp.pulse) * 1.5;

      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, radius + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = '800 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(POWER_UP_LABELS[powerUp.type], powerUp.x, powerUp.y);
      ctx.restore();
    });
  }

  renderPlayerEffects(ctx, player) {
    if (!this.activeShield && this.scoreMultiplierRemaining <= 0) return;

    ctx.save();
    ctx.translate(player.x, player.y);
    if (this.activeShield) {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, player.width * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (this.scoreMultiplierRemaining > 0) {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, player.width * 0.68, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  reset() {
    this.pool.forEach((powerUp) => {
      powerUp.active = false;
      powerUp.type = null;
    });
    this.obstaclesSinceSpawn = 0;
    this.activeShield = false;
    this.slowMotionRemaining = 0;
    this.scoreMultiplierRemaining = 0;
    this.collisionGraceRemaining = 0;
    this.uiUpdateTimer = 0;
    this.onScoreMultiplierChange(1);
    this.onChange();
  }
}
