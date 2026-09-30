/**
 * Physics System
 * Numerical integration for gravity, velocity limits, and realistic flappy bird rotation.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { clamp, lerp } from '../../utils/math';

export class PhysicsSystem {
  constructor() {
    this.gravity = GAME_CONFIG.PHYSICS.GRAVITY;
    this.maxFallSpeed = GAME_CONFIG.PHYSICS.MAX_FALL_SPEED;
    this.maxRiseSpeed = GAME_CONFIG.PHYSICS.MAX_RISE_SPEED;
    this.rotationSpeed = GAME_CONFIG.PHYSICS.ROTATION_SPEED;
    this.minRotation = GAME_CONFIG.PHYSICS.MIN_ROTATION;
    this.maxRotation = GAME_CONFIG.PHYSICS.MAX_ROTATION;
  }

  update(player, dt) {
    // 1. Integrate vertical velocity with gravity
    player.velocity += this.gravity * dt;
    player.velocity = clamp(player.velocity, this.maxRiseSpeed, this.maxFallSpeed);

    // 2. Integrate vertical position
    player.y += player.velocity * dt;

    // 3. Calculate target rotation angle based on vertical velocity
    // When rising: pitch up (-22 deg). When falling: pitch down up to +77 deg
    let targetRotation = 0;
    if (player.velocity < 0) {
      targetRotation = this.minRotation;
    } else {
      const fallProgress = clamp(player.velocity / this.maxFallSpeed, 0, 1);
      targetRotation = lerp(0, this.maxRotation, fallProgress * fallProgress);
    }

    // Smoothly interpolate rotation to target
    player.rotation = lerp(player.rotation, targetRotation, clamp(this.rotationSpeed * dt, 0, 1));

    // Update player's collision hitbox position
    player.hitbox.update(player.x, player.y);
  }
}
