/**
 * Player Renderer
 * Handles all 2D visual rendering for the player.
 * Supports custom image avatars (PNG/JPG), circular cropping, tilt rotation,
 * squash-and-stretch wing bounce, and clean procedural fallback.
 */

import { assetManager } from '../../assets/AssetManager';

export class PlayerRenderer {
  constructor(options = {}) {
    this.assetId = options.assetId || 'player.default';
    this.debugHitbox = false;
  }

  setAssetId(id) {
    this.assetId = id;
  }

  setDebugHitbox(enabled) {
    this.debugHitbox = !!enabled;
  }

  render(ctx, player) {
    ctx.save();

    // Keep the photo upright in flight, but let the crash rotation read clearly.
    ctx.translate(player.x, player.y);

    const radius = player.width / 2;
    const image = assetManager.getImage(this.assetId);

    if (image) {
      if (!player.isAlive) {
        ctx.rotate(player.rotation);
      }
      this.renderImageAvatar(ctx, image, radius);
    } else {
      ctx.rotate(player.rotation);
      if (player.isFlapping) {
        ctx.scale(1.12, 0.88);
      }
      this.renderFallbackBird(ctx, radius);
    }

    ctx.restore();

    // 4. Debug hitbox overlay (drawn in unrotated world coordinates)
    if (this.debugHitbox) {
      const hb = player.getHitbox();
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hb.x, hb.y, hb.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Render custom avatar image cleanly cropped into a sleek circular token
   */
  renderImageAvatar(ctx, image, radius) {
    ctx.save();

    // Subtle drop shadow / outer glow
    ctx.shadowColor = 'rgba(56, 189, 248, 0.45)';
    ctx.shadowBlur = 10;

    // Outer border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Contain the complete photo so a portrait face is never cropped.
    const w = image.width || radius * 2;
    const h = image.height || radius * 2;
    const scale = Math.min((radius * 2 - 4) / w, (radius * 2 - 4) / h);
    const drawWidth = w * scale;
    const drawHeight = h * scale;

    ctx.drawImage(
      image,
      -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight
    );

    ctx.restore();
  }

  /**
   * High-quality procedural cartoon bird if image is missing/loading
   */
  renderFallbackBird(ctx, radius) {
    ctx.save();

    // Body
    const grad = ctx.createRadialGradient(-radius * 0.2, -radius * 0.2, 2, 0, 0, radius);
    grad.addColorStop(0, '#fde047');
    grad.addColorStop(1, '#eab308');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Big eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(radius * 0.45, -radius * 0.25, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pupil
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(radius * 0.55, -radius * 0.25, radius * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(radius * 0.6, -radius * 0.32, radius * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radius * 0.7, -radius * 0.05);
    ctx.lineTo(radius * 1.35, radius * 0.1);
    ctx.lineTo(radius * 0.65, radius * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
