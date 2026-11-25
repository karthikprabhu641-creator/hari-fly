/**
 * Obstacle Entity
 * Represents an upper and lower pipe pair with a passable gap.
 * Hitboxes are updated independently from visual rendering.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { getMap } from '../../config/mapConfig';
import { RectHitbox } from '../collision/Hitbox';

export class Obstacle {
  constructor() {
    this.x = 0;
    this.width = GAME_CONFIG.OBSTACLES.WIDTH;
    this.gapTopY = 0;
    this.gapSize = GAME_CONFIG.OBSTACLES.GAP_SIZE;
    this.passed = false;
    this.active = false;
    this.mapId = 'skyland';

    this.groundY = GAME_CONFIG.VIEWPORT.HEIGHT - GAME_CONFIG.WORLD.GROUND_HEIGHT;

    // Independent collision hitboxes
    this.topHitbox = new RectHitbox(0, 0, this.width, 0);
    this.bottomHitbox = new RectHitbox(0, 0, this.width, 0);
  }

  init(x, gapTopY, gapSize = GAME_CONFIG.OBSTACLES.GAP_SIZE, mapId = 'skyland') {
    this.x = x;
    this.gapTopY = gapTopY;
    this.gapSize = gapSize;
    this.mapId = mapId;
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

    const theme = getMap(this.mapId).pipeTheme;
    const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
    theme.colors.forEach((color, index) => {
      gradient.addColorStop(index / (theme.colors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = GAME_CONFIG.OBSTACLES.BORDER_WIDTH;
    ctx.strokeRect(x, y, width, height);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = theme.highlight;
    ctx.fillRect(x + 7, y, 6, height);
    this.drawPipePattern(ctx, x, y, width, height, theme);
    ctx.restore();
  }

  drawPipeLip(ctx, x, y, width, height) {
    const theme = getMap(this.mapId).pipeTheme;
    const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
    gradient.addColorStop(0, theme.colors[0]);
    gradient.addColorStop(0.25, theme.colors[1]);
    gradient.addColorStop(0.75, theme.colors[2]);
    gradient.addColorStop(1, theme.colors[theme.colors.length - 1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = GAME_CONFIG.OBSTACLES.BORDER_WIDTH;
    ctx.strokeRect(x, y, width, height);

    ctx.save();
    ctx.fillStyle = theme.highlight;
    ctx.globalAlpha = 0.48;
    ctx.fillRect(x + 8, y + 3, 7, Math.max(0, height - 6));
    ctx.restore();
  }

  drawPipePattern(ctx, x, y, width, height, theme) {
    ctx.strokeStyle = theme.detail;
    ctx.fillStyle = theme.detail;
    ctx.lineWidth = 2;

    if (theme.pattern === 'vines') {
      for (let side = 0; side < 2; side += 1) {
        const vineX = x + (side === 0 ? 21 : width - 18);
        ctx.beginPath();
        ctx.moveTo(vineX, y);
        for (let offset = 36; offset < height; offset += 36) {
          ctx.quadraticCurveTo(
            vineX + (side === 0 ? 12 : -12),
            y + offset - 18,
            vineX,
            y + offset
          );
        }
        ctx.stroke();
        for (let offset = 28; offset < height; offset += 54) {
          ctx.beginPath();
          ctx.ellipse(
            vineX + (side === 0 ? 7 : -7),
            y + offset,
            7,
            3,
            side === 0 ? -0.5 : 0.5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
      return;
    }

    if (theme.pattern === 'circuit') {
      for (let offset = 22; offset < height; offset += 42) {
        const lineX = x + (offset % 2 === 0 ? 18 : width - 18);
        ctx.beginPath();
        ctx.moveTo(lineX, y + offset);
        ctx.lineTo(x + width / 2, y + offset);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(lineX, y + offset, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (theme.pattern === 'ice' || theme.pattern === 'lava') {
      const step = theme.pattern === 'ice' ? 58 : 72;
      for (let offset = 18; offset < height; offset += step) {
        ctx.beginPath();
        ctx.moveTo(x + 17, y + offset);
        ctx.lineTo(x + 26, y + offset + 10);
        ctx.lineTo(x + 21, y + offset + 20);
        ctx.lineTo(x + 34, y + offset + 30);
        ctx.stroke();
      }
      return;
    }

    if (theme.pattern === 'bubbles') {
      for (let offset = 24; offset < height; offset += 48) {
        const bubbleX = x + (offset % 3 === 0 ? 22 : width - 20);
        ctx.beginPath();
        ctx.arc(bubbleX, y + offset, 4 + (offset % 2) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }

    const step = theme.pattern === 'sandstone' ? 30 : 44;
    for (let offset = step; offset < height; offset += step) {
      ctx.globalAlpha = theme.pattern === 'sandstone' ? 0.55 : 0.35;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + offset);
      ctx.lineTo(x + width - 2, y + offset);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
