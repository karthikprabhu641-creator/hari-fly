/**
 * Master Game Engine
 * Central coordinator integrating simulation loop, state machine, rendering,
 * physics, audio, and input.
 * Exposes a subscription API for React UI so React NEVER re-renders per frame.
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import { GAME_STATE } from '../state/GameState';
import { StateMachine } from '../state/StateMachine';
import { eventBus, GAME_EVENTS } from '../systems/EventBus';
import { ScoreSystem } from '../systems/ScoreSystem';
import { CollectibleManager } from '../systems/CollectibleManager';
import { InputManager } from '../systems/InputManager';
import { ParticleSystem } from '../systems/ParticleSystem';
import { PhysicsSystem } from '../physics/PhysicsSystem';
import { CollisionSystem } from '../collision/CollisionSystem';
import { Player } from '../player/Player';
import { PlayerRenderer } from '../player/PlayerRenderer';
import { ObstacleManager } from '../obstacles/ObstacleManager';
import { ParallaxBackground } from '../renderer/ParallaxBackground';
import { WeatherSystem } from '../renderer/WeatherSystem';
import { PowerUpManager } from '../powerups/PowerUpManager';
import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { Viewport } from './Viewport';
import { GameLoop } from './GameLoop';
import { assetManager } from '../../assets/AssetManager';
import { audioManager } from '../../audio/AudioManager';
import { getPilotUsername, submitScore } from '../../services/leaderboardService';
import { getSelectedMapId, saveSelectedMap } from '../../config/mapConfig';

export class GameEngine {
  constructor() {
    this.canvas = null;
    this.viewport = null;
    this.loop = null;

    // Subsystems
    this.fsm = new StateMachine(GAME_STATE.LOADING);
    this.scoreSystem = new ScoreSystem();
    this.particleSystem = new ParticleSystem();
    this.physicsSystem = new PhysicsSystem();
    this.collisionSystem = new CollisionSystem();
    this.weatherSystem = new WeatherSystem();
    this.powerUpManager = new PowerUpManager({
      onChange: () => this.notifyUI(),
      onScoreMultiplierChange: (multiplier) => this.scoreSystem.setMultiplier(multiplier),
    });
    this.collectibleManager = new CollectibleManager({
      onChange: () => this.notifyUI(),
    });
    this.continuesUsed = 0;

    this.player = new Player();
    this.playerRenderer = new PlayerRenderer({ assetId: 'player.default' });
    this.parallaxBg = new ParallaxBackground();
    this.selectedMapId = getSelectedMapId();
    this.parallaxBg.setMap(this.selectedMapId);
    this.weatherSystem.setMap(this.selectedMapId);
    this.obstacleManager = new ObstacleManager({
      onScore: (obstacle) => this.handleScoreTrigger(obstacle),
      onSpawn: (obstacle) => this.collectibleManager.onObstacleSpawned(obstacle),
    });

    this.inputManager = new InputManager({
      onFlap: () => this.handleFlapInput(),
      onPause: () => this.togglePause(),
    });

    this.canvasRenderer = null;
    this.uiListeners = new Set();
    this.unsubscribers = [];
    this.loadingProgress = 0;
  }

  /**
   * Initialize canvas binding, viewport, renderer, input listeners, and assets
   */
  async init(canvas) {
    this.canvas = canvas;
    this.viewport = new Viewport(canvas);
    this.canvasRenderer = new CanvasRenderer(
      this.viewport,
      this.playerRenderer,
      this.parallaxBg,
      this.weatherSystem,
      this.powerUpManager,
      this.collectibleManager
    );

    // Attach input listeners to canvas
    this.inputManager.attach(canvas);

    // Setup internal event subscriptions only once
    if (!this.initialized) {
      this.setupEventListeners();
    }

    // Setup Game Loop
    if (!this.loop) {
      this.loop = new GameLoop(
        (dt) => this.update(dt),
        () => this.render()
      );
    }

    // Initial resize based on parent container
    const parent = canvas.parentElement || document.body;
    this.resize(parent.clientWidth, parent.clientHeight);

    // Start loop
    this.loop.start();

    if (!this.initialized) {
      this.initialized = true;
      const loadingStartedAt = performance.now();
      await assetManager.preload((progress) => {
        this.loadingProgress = progress;
        this.notifyUI();
      });
      const remainingLoadingTime = 350 - (performance.now() - loadingStartedAt);
      if (remainingLoadingTime > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingLoadingTime));
      }

      // Transition from LOADING to MAIN_MENU
      if (this.fsm.is(GAME_STATE.LOADING)) {
        this.fsm.transitionTo(GAME_STATE.MAIN_MENU);
        this.notifyUI();
      }
    } else {
      // Re-attached in existing state
      this.notifyUI();
    }
  }

  setupEventListeners() {
    // 1. Collision Handler
    const unsubCollide = eventBus.on(GAME_EVENTS.PLAYER_COLLIDED, (data) => {
      if (!this.fsm.is(GAME_STATE.PLAYING)) return;

      if (this.powerUpManager.tryProtectCollision(data.source)) {
        this.canvasRenderer.triggerScreenShake(4, 0.12);
        return;
      }

      this.gameOverTime = performance.now();
      this.powerUpManager.reset();
      this.player.kill();
      audioManager.playHit();
      audioManager.playGameOver();
      this.canvasRenderer.triggerScreenShake();
      this.particleSystem.emitImpactBurst(data.point.x, data.point.y);

      this.fsm.transitionTo(GAME_STATE.GAME_OVER);
      this.notifyUI();

      // Submit score to global leaderboard
      const finalScore = this.scoreSystem.getScore();
      const pilotName = getPilotUsername();
      if (finalScore > 0 && pilotName) {
        submitScore(pilotName, finalScore, this.selectedMapId).catch(() => {});
      }
    });

    // 2. Flap VFX / Audio
    const unsubFlap = eventBus.on(GAME_EVENTS.PLAYER_FLAPPED, (data) => {
      audioManager.playFlap();
      this.particleSystem.emitFlapPuff(data.x, data.y);
    });

    // 3. Score VFX / Audio
    const unsubScore = eventBus.on(GAME_EVENTS.SCORE_INCREMENTED, (data) => {
      this.parallaxBg.setScore(data.score);
      audioManager.playScore();
      this.particleSystem.emitScoreSparkles(this.player.x, this.player.y);
      this.notifyUI();
    });

    this.unsubscribers.push(unsubCollide, unsubFlap, unsubScore);
  }

  handleFlapInput() {
    const currentState = this.fsm.getState();

    if (currentState === GAME_STATE.MAIN_MENU) {
      // First tap begins game immediately with a flap
      audioManager.unlock();
      audioManager.playMusic();
      this.continuesUsed = 0;
      this.collectibleManager.startNewRun();
      this.fsm.transitionTo(GAME_STATE.PLAYING);
      this.player.flap();
      this.notifyUI();
      return;
    }

    if (currentState === GAME_STATE.PLAYING) {
      this.player.flap();
      return;
    }

    if (currentState === GAME_STATE.GAME_OVER) {
      // Allow restarting via tap / Space after a brief cooldown
      if (this.gameOverTime && performance.now() - this.gameOverTime > 450) {
        this.restart();
      }
      return;
    }

    if (currentState === GAME_STATE.PAUSED) {
      // Ignored during pause
      return;
    }
  }

  handleScoreTrigger(obstacle) {
    if (this.fsm.is(GAME_STATE.PLAYING)) {
      this.scoreSystem.increment();
      this.powerUpManager.onObstaclePassed(this.player.x, obstacle);
    }
  }

  togglePause() {
    if (this.fsm.is(GAME_STATE.PLAYING)) {
      this.fsm.transitionTo(GAME_STATE.PAUSED);
      this.loop.pause();
      audioManager.pauseMusic();
      this.notifyUI();
    } else if (this.fsm.is(GAME_STATE.PAUSED)) {
      this.fsm.transitionTo(GAME_STATE.PLAYING);
      this.loop.resume();
      audioManager.playMusic();
      this.notifyUI();
    }
  }

  resume() {
    if (this.fsm.is(GAME_STATE.PAUSED)) {
      this.fsm.transitionTo(GAME_STATE.PLAYING);
      this.loop.resume();
      audioManager.playMusic();
      this.notifyUI();
    }
  }

  restart() {
    // Complete reset of simulation without reloading webpage
    this.scoreSystem.reset();
    this.player.reset();
    this.obstacleManager.reset();
    this.particleSystem.reset();
    this.parallaxBg.reset();
    this.powerUpManager.reset();
    this.collectibleManager.startNewRun();
    this.weatherSystem.reset();
    this.canvasRenderer.reset();
    this.continuesUsed = 0;

    this.loop.resume();
    audioManager.restartMusic();

    this.fsm.transitionTo(GAME_STATE.PLAYING);
    this.player.flap();
    this.notifyUI();
  }

  getContinueCost() {
    return this.continuesUsed * 2 + 1;
  }

  continueRun() {
    if (!this.fsm.is(GAME_STATE.GAME_OVER)) return false;
    if (!this.collectibleManager.spendKeys(this.getContinueCost())) return false;

    this.continuesUsed += 1;
    this.gameOverTime = 0;
    this.player.reset();
    this.obstacleManager.reset();
    this.powerUpManager.reset();
    this.powerUpManager.grantCollisionGrace(GAME_CONFIG.CURRENCY.CONTINUE_PROTECTION_DURATION);
    this.collectibleManager.startNewRun();
    this.canvasRenderer.reset();
    this.fsm.transitionTo(GAME_STATE.PLAYING);
    this.loop.resume();
    audioManager.playMusic();
    this.player.flap();
    this.notifyUI();
    return true;
  }

  goToMenu() {
    // Keep all music silent while the main menu is visible.
    audioManager.pauseMusic();

    this.scoreSystem.reset();
    this.player.reset();
    this.obstacleManager.reset();
    this.particleSystem.reset();
    this.parallaxBg.reset();
    this.powerUpManager.reset();
    this.collectibleManager.reset();
    this.weatherSystem.reset();
    this.canvasRenderer.reset();
    this.continuesUsed = 0;

    this.loop.resume();
    this.fsm.transitionTo(GAME_STATE.MAIN_MENU);
    this.notifyUI();
  }

  setMap(mapId) {
    this.selectedMapId = saveSelectedMap(mapId);
    this.parallaxBg.setMap(this.selectedMapId);
    this.weatherSystem.setMap(this.selectedMapId);
    this.notifyUI();
  }

  claimLuckyReward({ coins = 0, keys = 0 }) {
    this.collectibleManager.addReward({ coins, keys });
    this.notifyUI();
  }

  spendCoins(amount) {
    const ok = this.collectibleManager.spendCoins(amount);
    if (ok) this.notifyUI();
    return ok;
  }

  update(dt) {
    const state = this.fsm.getState();

    // 1. Update visual effects & particles (always active)
    this.canvasRenderer.updateVFX(dt);
    this.weatherSystem.update(dt);
    this.particleSystem.update(dt);
    this.player.updateAnimation(dt);

    if (state === GAME_STATE.MAIN_MENU) {
      // Gentle idle hover animation on main menu
      this.player.y = GAME_CONFIG.PLAYER.START_Y + Math.sin(performance.now() * 0.0035) * 8;
      this.player.hitbox.update(this.player.x, this.player.y);
      this.parallaxBg.update(dt, GAME_CONFIG.OBSTACLES.SPEED * 0.5);
      return;
    }

    if (state === GAME_STATE.PLAYING) {
      const gameplayDt = dt * this.powerUpManager.getTimeScale();

      // 1. Physics
      this.physicsSystem.update(this.player, gameplayDt);

      // 2. Obstacles
      this.obstacleManager.update(gameplayDt, this.player.x);
      this.powerUpManager.update(gameplayDt, dt, this.player);
      this.collectibleManager.update(gameplayDt, this.player);

      // 3. Parallax background
      this.parallaxBg.update(gameplayDt, GAME_CONFIG.OBSTACLES.SPEED);

      // 4. Collision check
      this.collisionSystem.checkCollisions(this.player, this.obstacleManager);
      return;
    }

    if (state === GAME_STATE.GAME_OVER) {
      // Fall down to ground after collision if not already at ground
      if (this.player.y < this.collisionSystem.groundY - this.player.hitbox.radius) {
        this.player.velocity += this.physicsSystem.gravity * dt;
        this.player.y += this.player.velocity * dt;
        this.player.rotation = GAME_CONFIG.PHYSICS.MAX_ROTATION;
      }
    }
  }

  render() {
    if (!this.canvasRenderer) return;
    this.canvasRenderer.render(
      this.player,
      this.obstacleManager,
      this.particleSystem
    );
  }

  resize(width, height) {
    if (this.viewport) {
      this.viewport.resize(width, height);
    }
  }

  // React UI Observer
  subscribe(fn) {
    this.uiListeners.add(fn);
    // Initial emission
    fn(this.getUIState());
    return () => this.uiListeners.delete(fn);
  }

  notifyUI() {
    const uiState = this.getUIState();
    this.uiListeners.forEach((fn) => {
      try {
        fn(uiState);
      } catch (err) {
        console.error('[GameEngine] UI Listener error:', err);
      }
    });
  }

  getUIState() {
    return {
      gameState: this.fsm.getState(),
      selectedMapId: this.selectedMapId,
      loadingProgress: this.loadingProgress,
      score: this.scoreSystem.getScore(),
      bestScore: this.scoreSystem.getBestScore(),
      isNewBest: this.scoreSystem.isHighScoreBroken(),
      powerUps: this.powerUpManager.getUiState(),
      ...this.collectibleManager.getWallet(),
      nextContinueCost: this.getContinueCost(),
    };
  }

  detachCanvas() {
    if (this.loop) {
      this.loop.stop();
    }
    if (this.inputManager) {
      this.inputManager.detach();
    }
  }

  destroy() {
    this.detachCanvas();
    audioManager.pauseMusic();
    this.unsubscribers.forEach((unsub) => unsub());
  }
}
