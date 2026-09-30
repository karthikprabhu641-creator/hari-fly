/**
 * Obstacle Entity
 * Represents an upper and lower pipe pair with a passable gap.
 * Hitboxes are updated independently from visual rendering.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { RectHitbox } from '../collision/Hitbox';

export class Obstacle {
  constructor() {
    this.x = 0;
    this.width = GAME_CONFIG.OBSTACLES.WIDTH;
    this.gapTopY = 0;
    this.gapSize = GAME_CONFIG.OBSTACLES.GAP_SIZE;
    this.passed = false;
    this.active = false;

    this.groundY = GAME_CONFIG.VIEWPORT.HEIGHT - GAME_CONFIG.WORLD.GROUND_HEIGHT;

    // Independent collision hitboxes
    this.topHitbox = new RectHitbox(0, 0, this.width, 0);
    this.bottomHitbox = new RectHitbox(0, 0, this.width, 0);
  }

  init(x, gapTopY, gapSize = GAME_CONFIG.OBSTACLES.GAP_SIZE) {
    this.x = x;
    this.gapTopY = gapTopY;
    this.gapSize = gapSize;
    this.passed = false;
    this.active = true;

    this.updateHitboxes();
  }

  updateHitboxes() {
    const bottomPipeY = this.gapTopY + this.gapSize;
    const bottomPipeHeight = Math.max(0, this.groundY - bottomPipeY);

    this.topHitbox.update(this.x, 0, this.width, this.gapTopY);
    this.bottomHitbox.update(this.x, bottomPipeY, this.width, bottomPipeHeight);
  }

  getTopHitbox() {
    return this.topHitbox;
  }

  getBottomHitbox() {
    return this.bottomHitbox;
  }

  update(dt, speed) {
    if (!this.active) return;
    this.x -= speed * dt;
    this.updateHitboxes();
  }

  render(ctx) {
    if (!this.active) return;

    const lipH = GAME_CONFIG.OBSTACLES.LIP_HEIGHT;
    const lipOverhang = GAME_CONFIG.OBSTACLES.LIP_OVERHANG;
    const bottomPipeY = this.gapTopY + this.gapSize;
    const bottomPipeHeight = Math.max(0, this.groundY - bottomPipeY);

    ctx.save();

    // 1. Top Pipe Body
    this.drawPipeBody(ctx, this.x, 0, this.width, this.gapTopY - lipH);

    // 1b. Top Pipe Rim/Lip
    this.drawPipeLip(
      ctx,
      this.x - lipOverhang,
      this.gapTopY - lipH,
      this.width + lipOverhang * 2,
      lipH
    );

    // 2. Bottom Pipe Rim/Lip
    this.drawPipeLip(
      ctx,
      this.x - lipOverhang,
      bottomPipeY,
      this.width + lipOverhang * 2,
      lipH
    );

    // 2b. Bottom Pipe Body
    this.drawPipeBody(
      ctx,
      this.x,
      bottomPipeY + lipH,
      this.width,
      Math.max(0, bottomPipeHeight - lipH)
    );

    ctx.restore();
  }

  drawPipeBody(ctx, x, y, width, height) {
    if (height <= 0) return;

    // Linear gradient for 3D curved tube look
    const grad = ctx.createLinearGradient(x, 0, x + width, 0);
    grad.addColorStop(0, '#15803d');    // Dark green edge
    grad.addColorStop(0.2, '#22c55e');  // Bright green highlight
    grad.addColorStop(0.7, '#16a34a');  // Core green
    grad.addColorStop(1, '#14532d');    // Deep green shadow

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = GAME_CONFIG.OBSTACLES.BORDER_WIDTH;
    ctx.strokeRect(x, y, width, height);

    // Soft specular highlight stripe
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(x + 7, y, 6, height);
  }

  drawPipeLip(ctx, x, y, width, height) {
    const grad = ctx.createLinearGradient(x, 0, x + width, 0);
    grad.addColorStop(0, '#166534');
    grad.addColorStop(0.25, '#4ade80');
    grad.addColorStop(0.75, '#16a34a');
    grad.addColorStop(1, '#052e16');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = GAME_CONFIG.OBSTACLES.BORDER_WIDTH;
    ctx.strokeRect(x, y, width, height);

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(x + 8, y, 7, height);
  }
}
