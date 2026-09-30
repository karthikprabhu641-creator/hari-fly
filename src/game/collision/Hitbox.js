/**
 * Collision Hitbox Types
 * Decouples physical collision shapes from visual rendering sizes.
 */

import { clamp, distanceSq } from '../../utils/math';

export class CircleHitbox {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  update(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class RectHitbox {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  update(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

/**
 * Circle vs Rectangle intersection test
 */
export function checkCircleRectCollision(circle, rect) {
  // Find closest point on rectangle to circle center
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);

  // Calculate distance squared between circle center and closest point
  const distSq = distanceSq(circle.x, circle.y, closestX, closestY);

  // If distance is less than radius squared, intersection occurred
  return distSq < circle.radius * circle.radius;
}
