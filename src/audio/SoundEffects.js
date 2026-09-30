/**
 * Web Audio API Sound Effects Synthesizer
 * Zero external audio file latency, 100% reliable, zero network dependency.
 */

export class SoundEffects {
  constructor(audioContext) {
    this.ctx = audioContext;
    this.volume = 0.75;
    this.muted = false;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setMuted(muted) {
    this.muted = !!muted;
  }

  getEffectiveVolume() {
    return this.muted ? 0 : this.volume;
  }

  /**
   * Flap sound: crisp snappy rising pitch sweep
   */
  playFlap() {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(620, t + 0.09);

      gain.gain.setValueAtTime(0.35 * this.getEffectiveVolume(), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {
      console.warn('SFX Flap error:', e);
    }
  }

  /**
   * Score sound: cheerful bright two-tone chime
   */
  playScore() {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const t = this.ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, t);
      gain1.gain.setValueAtTime(0.3 * this.getEffectiveVolume(), t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.15);

      // Note 2: B5 (987.77 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, t + 0.08);
      gain2.gain.setValueAtTime(0.35 * this.getEffectiveVolume(), t + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.08);
      osc2.stop(t + 0.28);
    } catch (e) {
      console.warn('SFX Score error:', e);
    }
  }

  /**
   * Collision sound: sudden punchy thud with pitch dive
   */
  playHit() {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);

      gain.gain.setValueAtTime(0.5 * this.getEffectiveVolume(), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {
      console.warn('SFX Hit error:', e);
    }
  }

  /**
   * Game Over sound: sad descending three-tone arpeggio
   */
  playGameOver() {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [440, 392, 330, 261.63]; // A4, G4, E4, C4

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.11;
        const dur = 0.2;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.28 * this.getEffectiveVolume(), start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch (e) {
      console.warn('SFX GameOver error:', e);
    }
  }

  /**
   * UI Click sound: gentle tick
   */
  playClick() {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

      gain.gain.setValueAtTime(0.2 * this.getEffectiveVolume(), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {
      console.warn('SFX Click error:', e);
    }
  }
}
