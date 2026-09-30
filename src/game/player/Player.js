/**
 * Player Entity
 * Pure physics & state representation.
 * Visual rendering is completely separated into PlayerRenderer.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { CircleHitbox } from '../collision/Hitbox';
import { eventBus, GAME_EVENTS } from '../systems/EventBus';

export class Player {
  constructor() {
    this.startX = GAME_CONFIG.PLAYER.START_X;
    this.startY = GAME_CONFIG.PLAYER.START_Y;

    this.x = this.startX;
    this.y = this.startY;
    this.velocity = 0;
    this.rotation = 0;
    this.flapImpulse = GAME_CONFIG.PHYSICS.FLAP_IMPULSE;

    this.width = GAME_CONFIG.PLAYER.WIDTH;
    this.height = GAME_CONFIG.PLAYER.HEIGHT;
    this.hitbox = new CircleHitbox(this.x, this.y, GAME_CONFIG.PLAYER.HITBOX_RADIUS);

    // Visual animation states
    this.isFlapping = false;
    this.flapTimer = 0;
    this.isAlive = true;
  }

  flap() {
    if (!this.isAlive) return;

    this.velocity = this.flapImpulse;
    this.rotation = GAME_CONFIG.PHYSICS.MIN_ROTATION;
    this.isFlapping = true;
    this.flapTimer = 0.15; // duration of flap visual pulse

    eventBus.emit(GAME_EVENTS.PLAYER_FLAPPED, {
      x: this.x,
      y: this.y,
    });
  }

  updateAnimation(dt) {
    if (this.flapTimer > 0) {
      this.flapTimer -= dt;
      if (this.flapTimer <= 0) {
        this.isFlapping = false;
      }
    }
  }

  getHitbox() {
    return this.hitbox;
  }

  kill() {
    this.isAlive = false;
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.velocity = 0;
    this.rotation = 0;
    this.isAlive = true;
    this.isFlapping = false;
    this.flapTimer = 0;
    this.hitbox.update(this.x, this.y);
  }
}
