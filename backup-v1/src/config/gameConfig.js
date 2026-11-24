/**
 * Centralized Game Configuration
 * All game constants, physics values, and dimensions are defined here.
 * Never hard-code magic numbers across the engine.
 */

export const GAME_CONFIG = {
  // Logical Virtual Viewport
  VIEWPORT: {
    WIDTH: 390,          // Logical canvas width (mobile portrait baseline)
    HEIGHT: 844,         // Logical canvas height (standard modern iPhone/Android aspect)
    MAX_DPR: 2.0,        // Cap DPR to prevent mobile thermal throttling & battery drain
    MIN_ASPECT: 0.45,
    MAX_ASPECT: 0.65,
  },

  // Physics & Movement
  PHYSICS: {
    GRAVITY: 1100,       // px / s^2 (satisfying snappy mobile gravity)
    FLAP_IMPULSE: -380,  // px / s (instant upward velocity)
    MAX_FALL_SPEED: 700, // terminal downward velocity
    MAX_RISE_SPEED: -420,// clamp upward acceleration
    ROTATION_SPEED: 8.0, // interpolation factor for tilt
    MIN_ROTATION: -0.38, // ~ -22 degrees (pointing up on flap)
    MAX_ROTATION: 1.35,  // ~ +77 degrees (diving down on fall)
  },

  // Player Dimensions & Hitbox
  PLAYER: {
    START_X: 90,         // X anchor position in logical viewport
    START_Y: 380,        // Y starting position
    WIDTH: 46,           // Rendered width
    HEIGHT: 46,          // Rendered height
    HITBOX_RADIUS: 18,   // Collision circle radius (forgiving & fair)
  },

  // Obstacles (Pipes)
  OBSTACLES: {
    WIDTH: 68,           // Pipe width
    GAP_SIZE: 175,       // Mobile-friendly vertical gap between upper & lower pipes
    SPEED: 180,          // Horizontal scroll speed in px / s
    SPAWN_INTERVAL: 1.7, // Seconds between spawning pipe pairs
    MIN_TOP_HEIGHT: 70,  // Minimum height for top pipe
    MAX_POOL_SIZE: 8,    // Pre-allocated object pool size (zero GC churn)
    BORDER_WIDTH: 3,
    LIP_HEIGHT: 24,      // Height of pipe lip rim
    LIP_OVERHANG: 5,     // Width extension for pipe lip
  },

  // Environment & Ground
  WORLD: {
    GROUND_HEIGHT: 100,  // Height of ground from canvas bottom
    CEILING_BOUNCE: 0.1, // Elasticity factor if hitting ceiling
    PARALLAX_SKY: 0.0,
    PARALLAX_CLOUDS: 0.12,
    PARALLAX_MOUNTAINS: 0.28,
    PARALLAX_GROUND: 1.0,
  },

  // Visual Effects & Particles
  VFX: {
    SCREEN_SHAKE_DURATION: 0.35, // Seconds of shake on collision
    SCREEN_SHAKE_INTENSITY: 12,  // Shake magnitude in px
    PARTICLE_POOL_SIZE: 50,
  },

  WEATHER: {
    RAIN_PARTICLE_COUNT: 64,
    WIND: 18,
    WEATHER_CHANGE_INTERVAL: 18,
    RAIN_CHANCE: 0.65,
  },

  POWERUPS: {
    POOL_SIZE: 6,
    SPAWN_EVERY_OBSTACLES: 3,
    SPAWN_CHANCE: 0.28,
    SPAWN_X_OFFSET: 150,
    RADIUS: 15,
    SLOW_DURATION: 5,
    SLOW_SPEED_MULTIPLIER: 0.65,
    SCORE_MULTIPLIER_DURATION: 5,
    SCORE_MULTIPLIER: 2,
    COLLISION_GRACE_DURATION: 0.35,
  },

  CURRENCY: {
    POOL_SIZE: 10,
    COIN_SPAWN_CHANCE: 0.62,
    KEY_EVERY_PIPES: 10,
    RADIUS: 16,
    KEY_RADIUS: 17,
    CONTINUE_PROTECTION_DURATION: 1.5,
    COINS_STORAGE_KEY: 'hari_fly_coins',
    KEYS_STORAGE_KEY: 'hari_fly_keys',
  },

  // Audio Defaults
  AUDIO: {
    DEFAULT_BGM_VOLUME: 0.55,
    DEFAULT_SFX_VOLUME: 0.75,
    STORAGE_KEY_BGM: 'hraifly_bgm_vol',
    STORAGE_KEY_SFX: 'hraifly_sfx_vol',
    STORAGE_KEY_MUTE: 'hraifly_audio_mute',
    STORAGE_KEY_GAMEPLAY_MODE: 'hraifly_gameplay_music_mode',
    STORAGE_KEY_FAVORITE_TRACK: 'hraifly_favorite_gameplay_track',
    STORAGE_KEY_GAME_OVER_TRACK: 'hraifly_game_over_track',
  },

  // High Score Storage Key
  STORAGE: {
    HIGH_SCORE_KEY: 'hraifly_high_score',
  },

  // Loop & Performance Limits
  ENGINE: {
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 0.08, // 80ms clamp (prevents physics explosion after backgrounding)
  },
};
