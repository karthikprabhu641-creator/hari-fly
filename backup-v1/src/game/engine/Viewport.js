/**
 * Viewport & Resolution Manager
 * Implements a fixed-aspect logical coordinate system (390 x 844 baseline).
 * Eliminates distortion, handles retina DPR, and supports instant window resize without physics drift.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { getDevicePixelRatio } from '../../utils/device';

export class Viewport {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.logicalWidth = GAME_CONFIG.VIEWPORT.WIDTH;
    this.logicalHeight = GAME_CONFIG.VIEWPORT.HEIGHT;

    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dpr = 1;

    this.containerWidth = 0;
    this.containerHeight = 0;
  }

  resize(containerWidth, containerHeight) {
    if (!this.canvas || containerWidth <= 0 || containerHeight <= 0) return;

    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
    this.dpr = getDevicePixelRatio(GAME_CONFIG.VIEWPORT.MAX_DPR);

    // Uniform aspect ratio scaling (fit logical game box within screen)
    const scaleX = containerWidth / this.logicalWidth;
    const scaleY = containerHeight / this.logicalHeight;
    this.scale = Math.min(scaleX, scaleY);

    const renderW = this.logicalWidth * this.scale;
    const renderH = this.logicalHeight * this.scale;

    this.offsetX = Math.floor((containerWidth - renderW) / 2);
    this.offsetY = Math.floor((containerHeight - renderH) / 2);

    // Physical canvas buffer dimensions
    this.canvas.width = Math.floor(containerWidth * this.dpr);
    this.canvas.height = Math.floor(containerHeight * this.dpr);

    // Set CSS display dimensions
    this.canvas.style.width = `${containerWidth}px`;
    this.canvas.style.height = `${containerHeight}px`;
  }

  /**
   * Prepares the 2D context for the current frame
   * Applies DPR scale, viewport centering offset, and logical aspect ratio scale.
   */
  beginFrame() {
    const ctx = this.ctx;
    ctx.save();

    // 1. Reset identity transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 2. Clear entire physical canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 3. Fill pillarbox/letterbox background with dark ambient slate
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 4. Apply DPR and viewport translation/scaling
    ctx.setTransform(
      this.dpr * this.scale,
      0,
      0,
      this.dpr * this.scale,
      this.offsetX * this.dpr,
      this.offsetY * this.dpr
    );

    // 5. Clip rendering to logical game bounds to prevent obstacle bleed
    ctx.beginPath();
    ctx.rect(0, 0, this.logicalWidth, this.logicalHeight);
    ctx.clip();
  }

  endFrame() {
    this.ctx.restore();
  }

  /**
   * Convert client touch/mouse screen coordinate to logical game coordinate
   */
  screenToGame(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const px = clientX - rect.left - this.offsetX;
    const py = clientY - rect.top - this.offsetY;
    return {
      x: px / this.scale,
      y: py / this.scale,
    };
  }
}
