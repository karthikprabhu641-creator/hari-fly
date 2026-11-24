/**
 * Asset Manager
 * Central registry for game visual and audio assets.
 * Decouples asset file paths from game engine logic via logical asset IDs.
 */

import { ASSET_MANIFEST } from '../config/assetManifest';

class AssetManager {
  constructor() {
    this.images = new Map();
    this.audioMetadata = new Map();
    this.isLoaded = false;
    this.loadProgress = 0;
  }

  /**
   * Preload all declared assets in manifest
   */
  async preload(onProgress = null) {
    const imageEntries = Object.entries(ASSET_MANIFEST.images).filter(
      ([, item]) => item.src !== null
    );

    const total = imageEntries.length;
    if (total === 0) {
      this.isLoaded = true;
      if (onProgress) onProgress(1.0);
      return;
    }

    let loadedCount = 0;

    const promises = imageEntries.map(async ([id, item]) => {
      try {
        const img = await this.loadImage(item.src);
        this.images.set(id, img);
      } catch (err) {
        console.warn(`[AssetManager] Failed to load image "${id}" from ${item.src}. Generating fallback canvas.`, err);
        this.images.set(id, this.createFallbackCanvas(item.width || 46, item.height || 46));
      } finally {
        loadedCount++;
        this.loadProgress = loadedCount / total;
        if (onProgress) onProgress(this.loadProgress);
      }
    });

    await Promise.all(promises);

    // Register audio metadata
    Object.entries(ASSET_MANIFEST.audio).forEach(([id, meta]) => {
      this.audioMetadata.set(id, meta);
    });

    this.isLoaded = true;
  }

  /**
   * Load an HTMLImageElement with Promise wrapper
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  /**
   * Register or hot-swap an image asset at runtime
   */
  async registerImage(id, src) {
    try {
      const img = await this.loadImage(src);
      this.images.set(id, img);
      return img;
    } catch (err) {
      console.error(`[AssetManager] Failed to register image for ${id}:`, err);
      return null;
    }
  }

  /**
   * Retrieve an image by logical ID
   */
  getImage(id) {
    return this.images.get(id) || null;
  }

  /**
   * Has image loaded
   */
  hasImage(id) {
    return this.images.has(id);
  }

  /**
   * Get audio metadata by logical ID
   */
  getAudioMeta(id) {
    return this.audioMetadata.get(id) || null;
  }

  /**
   * Create procedural fallback canvas in case of broken asset
   */
  createFallbackCanvas(w = 46, h = 46) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Stylized fallback golden circle
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(w * 0.65, h * 0.38, 4, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }
}

export const assetManager = new AssetManager();
