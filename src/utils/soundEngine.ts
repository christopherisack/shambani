import { SoundType } from '../types/task';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentAlarmInterval: number | null = null;
  private isAlarmPlaying: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Preview a sound once
   */
  public previewSound(type: SoundType, volume: number = 0.8): void {
    try {
      const ctx = this.getAudioContext();
      this.playSoundPattern(ctx, type, volume);
    } catch {
      // AudioContext may be restricted until user gesture
    }
  }

  /**
   * Start looping alarm until stopped
   */
  public startAlarmLoop(type: SoundType, volume: number = 0.8): void {
    if (this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;

    try {
      const ctx = this.getAudioContext();
      // Play immediately
      this.playSoundPattern(ctx, type, volume);

      // Repeat pattern every 2.4s for urgent alarm feel
      const intervalMs = type === 'radar' ? 1800 : type === 'bell' ? 3200 : 2500;
      this.currentAlarmInterval = window.setInterval(() => {
        if (!this.isAlarmPlaying) return;
        this.playSoundPattern(ctx, type, volume);
      }, intervalMs);
    } catch {
      // Audio might be blocked
    }
  }

  /**
   * Stop any active alarm sound
   */
  public stopAlarmLoop(): void {
    this.isAlarmPlaying = false;
    if (this.currentAlarmInterval !== null) {
      clearInterval(this.currentAlarmInterval);
      this.currentAlarmInterval = null;
    }
  }

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }

  /**
   * Play rewarding chime when a task is completed
   */
  public playCompletionChime(volume: number = 0.7): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.3 * volume, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Internal sound synthesizers using native Web Audio primitives
   */
  private playSoundPattern(ctx: AudioContext, type: SoundType, volume: number): void {
    const now = ctx.currentTime;

    switch (type) {
      case 'chime': {
        // Melodic 4-note ascending chime: A4, C#5, E5, A5
        const freqs = [440, 554.37, 659.25, 880];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.14);

          gain.gain.setValueAtTime(0, now + i * 0.14);
          gain.gain.linearRampToValueAtTime(0.35 * volume, now + i * 0.14 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.9);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.14);
          osc.stop(now + i * 0.14 + 1.0);
        });
        break;
      }

      case 'radar': {
        // Rapid pulsing alert: two high beeps followed by echo
        [0, 0.18, 0.5, 0.68].forEach((timeOffset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, now + timeOffset);
          osc.frequency.exponentialRampToValueAtTime(1100, now + timeOffset + 0.1);

          gain.gain.setValueAtTime(0.4 * volume, now + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + timeOffset);
          osc.stop(now + timeOffset + 0.16);
        });
        break;
      }

      case 'bell': {
        // Deep acoustic executive resonance bell with rich harmonic overtones
        const baseFreq = 440;
        const harmonics = [1, 2.76, 5.4, 8.9];
        const weights = [0.4, 0.25, 0.15, 0.08];

        harmonics.forEach((h, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * h, now);

          const weight = weights[idx] * volume;
          gain.gain.setValueAtTime(weight, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0 - idx * 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 2.1);
        });
        break;
      }

      case 'digital':
      default: {
        // Classic digital alarm: 3 double-beeps
        const beeps = [0, 0.1, 0.35, 0.45, 0.7, 0.8];
        beeps.forEach((t) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1046.5, now + t); // C6

          gain.gain.setValueAtTime(0.25 * volume, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.07);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + t);
          osc.stop(now + t + 0.08);
        });
        break;
      }
    }
  }
}

export const soundEngine = new SoundEngine();
