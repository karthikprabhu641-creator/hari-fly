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

  /**
   * Lucky wheel tick sound
   */
  playWheelTick() {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.025);

      gain.gain.setValueAtTime(0.18 * this.getEffectiveVolume(), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.025);
    } catch (e) {
      // AudioContext may be suspended or error
    }
  }

  /**
   * Reward chime fanfare
   */
  playRewardChime() {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.28 * this.getEffectiveVolume(), start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.32);
      });
    } catch (e) {
      // Ignore
    }
  }

  playWind(duration = 1, intensity = 0.16) {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const buffer = this.ctx.createBuffer(1, Math.ceil(this.ctx.sampleRate * duration), this.ctx.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < samples.length; index += 1) {
        samples[index] = Math.random() * 2 - 1;
      }

      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      const start = this.ctx.currentTime;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, start);
      filter.frequency.exponentialRampToValueAtTime(1050, start + duration * 0.8);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(intensity * this.getEffectiveVolume(), start + 0.22);
      gain.gain.setValueAtTime(intensity * this.getEffectiveVolume(), start + duration * 0.55);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(start);
      source.stop(start + duration);
    } catch (e) {
      console.warn('SFX Wind error:', e);
    }
  }

  playWhoosh() {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const start = this.ctx.currentTime;
      const oscillator = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(180, start);
      oscillator.frequency.exponentialRampToValueAtTime(720, start + 0.42);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, start);
      filter.frequency.exponentialRampToValueAtTime(2400, start + 0.38);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.12 * this.getEffectiveVolume(), start + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.46);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.47);
    } catch (e) {
      console.warn('SFX Whoosh error:', e);
    }
  }

  playTakeoff() {
    if (!this.ctx || this.getEffectiveVolume() <= 0) return;
    try {
      const start = this.ctx.currentTime;
      [440, 660].forEach((frequency, index) => {
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.65, start + 0.48);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime((index ? 0.08 : 0.12) * this.getEffectiveVolume(), start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.58);
        oscillator.connect(gain);
        gain.connect(this.ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.59);
      });
    } catch (e) {
      console.warn('SFX Takeoff error:', e);
    }
  }
}
