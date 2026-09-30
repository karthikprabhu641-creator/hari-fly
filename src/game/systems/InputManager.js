/**
 * Input Manager
 * Normalizes touch, pointer, mouse, and keyboard events into unified game actions (FLAP, PAUSE).
 * Prevents mobile double-firing, scroll chaining, and accidental zooming.
 */

export class InputManager {
  constructor(options = {}) {
    this.onFlap = options.onFlap || (() => {});
    this.onPause = options.onPause || (() => {});
    this.element = null;
    this.isEnabled = true;

    // Track active pointer to prevent multi-touch spam / double triggers
    this.activePointerId = null;
    this.lastFlapTime = 0;
    this.MIN_FLAP_INTERVAL = 60; // ms debounce between flaps

    // Bound listeners for precise teardown
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
  }

  attach(element) {
    if (this.element) {
      this.detach();
    }
    this.element = element;

    // Pointer events handle both mouse and touch with unified Pointer API
    element.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
    window.addEventListener('pointerup', this.handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', this.handlePointerUp, { passive: true });
    window.addEventListener('keydown', this.handleKeyDown);
    element.addEventListener('contextmenu', this.handleContextMenu);
  }

  detach() {
    if (this.element) {
      this.element.removeEventListener('pointerdown', this.handlePointerDown);
      this.element.removeEventListener('contextmenu', this.handleContextMenu);
      this.element = null;
    }
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.activePointerId = null;
  }

  setEnabled(enabled) {
    this.isEnabled = !!enabled;
  }

  triggerFlap() {
    if (!this.isEnabled) return;
    const now = performance.now();
    if (now - this.lastFlapTime < this.MIN_FLAP_INTERVAL) {
      return;
    }
    this.lastFlapTime = now;
    this.onFlap();
  }

  handlePointerDown(e) {
    // Only respond to primary mouse button or touch contact
    if (e.button !== undefined && e.button !== 0) return;

    // If another finger is already touching, ignore additional touch points
    if (this.activePointerId !== null && this.activePointerId !== e.pointerId) {
      return;
    }

    this.activePointerId = e.pointerId;

    // Prevent default scroll/zoom gestures on mobile
    if (e.cancelable) {
      e.preventDefault();
    }

    this.triggerFlap();
  }

  handlePointerUp(e) {
    if (this.activePointerId === e.pointerId) {
      this.activePointerId = null;
    }
  }

  handleKeyDown(e) {
    // Escape or P toggles pause
    if (e.code === 'KeyP' || e.code === 'Escape') {
      e.preventDefault();
      this.onPause();
      return;
    }

    // Flap keys: Space, ArrowUp, KeyW
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      if (!e.repeat) {
        this.triggerFlap();
      }
    }
  }

  handleContextMenu(e) {
    // Disable right-click context menu on canvas
    e.preventDefault();
  }
}
