/**
 * Collision System
 * Tests player hitbox against world boundaries and active obstacles.
 * Emits decoupled PLAYER_COLLIDED event on impact.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { checkCircleRectCollision } from './Hitbox';
import { eventBus, GAME_EVENTS } from '../systems/EventBus';

export class CollisionSystem {
  constructor() {
    this.groundY = GAME_CONFIG.VIEWPORT.HEIGHT - GAME_CONFIG.WORLD.GROUND_HEIGHT;
    this.debugDraw = false;
  }

  setDebugDraw(enabled) {
    this.debugDraw = !!enabled;
  }

  /**
   * Check all collisions for the current frame
   * Returns true if collision occurred, false otherwise.
   */
  checkCollisions(player, obstacleManager) {
    const playerHitbox = player.getHitbox();

    // 1. Check Ground Collision
    if (playerHitbox.y + playerHitbox.radius >= this.groundY) {
      player.y = this.groundY - playerHitbox.radius;
      player.velocity = 0;
      eventBus.emit(GAME_EVENTS.PLAYER_COLLIDED, {
        source: 'ground',
        point: { x: playerHitbox.x, y: this.groundY },
      });
      return true;
    }

    // 2. Check Ceiling Collision
    if (playerHitbox.y - playerHitbox.radius <= 0) {
      player.y = playerHitbox.radius;
      player.velocity = Math.max(0, player.velocity * GAME_CONFIG.WORLD.CEILING_BOUNCE);
      // Soft clamp ceiling, does not kill player immediately unless configured
    }

    // 3. Check Obstacle Collisions (Upper & Lower Pipes)
    const activeObstacles = obstacleManager.getActiveObstacles();
    for (let i = 0; i < activeObstacles.length; i++) {
      const obstacle = activeObstacles[i];

      // Quick broadphase check: skip obstacles far behind or ahead
      if (
        obstacle.x + obstacle.width < playerHitbox.x - playerHitbox.radius ||
        obstacle.x > playerHitbox.x + playerHitbox.radius
      ) {
        continue;
      }

      // Check Top Pipe
      if (checkCircleRectCollision(playerHitbox, obstacle.getTopHitbox())) {
        eventBus.emit(GAME_EVENTS.PLAYER_COLLIDED, {
          source: 'top_pipe',
          point: { x: playerHitbox.x, y: playerHitbox.y },
        });
        return true;
      }

      // Check Bottom Pipe
      if (checkCircleRectCollision(playerHitbox, obstacle.getBottomHitbox())) {
        eventBus.emit(GAME_EVENTS.PLAYER_COLLIDED, {
          source: 'bottom_pipe',
          point: { x: playerHitbox.x, y: playerHitbox.y },
        });
        return true;
      }
    }

    return false;
  }
}
