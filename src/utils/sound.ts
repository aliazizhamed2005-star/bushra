class SoundEngine {
  private ctx: AudioContext | null = null;
  private unlocked = false;
  public muted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const handleFirstGesture = () => {
        this.unlock();
      };
      window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
      window.addEventListener('touchstart', handleFirstGesture, { passive: true });
      window.addEventListener('keydown', handleFirstGesture, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.ctx && !this.muted) {
          if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        }
      });
    }
  }

  public unlock() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx({ latencyHint: 'interactive' });
        }
      }
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      if (!this.unlocked && !this.muted) {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
        this.unlocked = true;
      }
    } catch {
      // Ignore audio unlock errors on restricted devices
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.unlock();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.ctx || this.ctx.state !== 'running') {
      return this.ctx;
    }
    return this.ctx;
  }

  public playClick() {
    this.unlock();
    this.playTone(540, 760, 0.07, 'sine', 0.1);
  }

  public playPop(pitch = 520) {
    this.playTone(pitch, pitch * 1.45, 0.09, 'sine', 0.11);
  }

  public playJump(isDouble = false) {
    this.playTone(isDouble ? 430 : 290, isDouble ? 820 : 620, 0.13, 'sine', 0.12);
  }

  public playBoing() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.scheduleNote(ctx, 240, now, 0.07, 'sine', 0.12);
    this.scheduleNote(ctx, 480, now + 0.05, 0.09, 'sine', 0.12);
    this.scheduleNote(ctx, 760, now + 0.1, 0.14, 'sine', 0.1);
  }

  public playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.scheduleNote(ctx, 987.77, now, 0.07, 'square', 0.05);
    this.scheduleNote(ctx, 1318.5, now + 0.06, 0.14, 'square', 0.05);
  }

  public playStar() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [587.33, 739.99, 880, 1174.66].forEach((freq, i) => {
      this.scheduleNote(ctx, freq, now + i * 0.05, 0.14, 'triangle', 0.1);
    });
  }

  public playHeart() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      this.scheduleNote(ctx, freq, now + i * 0.055, 0.16, 'sine', 0.11);
    });
  }

  public playFlag() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      this.scheduleNote(ctx, freq, now + i * 0.06, 0.22, 'triangle', 0.12);
    });
  }

  public playBonk() {
    this.playTone(380, 110, 0.15, 'triangle', 0.15);
  }

  public playBossHit() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.scheduleNote(ctx, 190, now, 0.1, 'sawtooth', 0.12);
    this.scheduleNote(ctx, 440, now + 0.06, 0.12, 'triangle', 0.12);
  }

  public playSillyTear() {
    this.playTone(680, 280, 0.11, 'sine', 0.07);
  }

  public playHurt() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.scheduleNote(ctx, 270, now, 0.11, 'sawtooth', 0.09);
    this.scheduleNote(ctx, 175, now + 0.1, 0.18, 'sawtooth', 0.09);
  }

  public playDefeatTrombone() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.scheduleNote(ctx, 311.13, now, 0.22, 'sawtooth', 0.08);
    this.scheduleNote(ctx, 293.66, now + 0.22, 0.22, 'sawtooth', 0.08);
    this.scheduleNote(ctx, 277.18, now + 0.44, 0.22, 'sawtooth', 0.08);
    this.scheduleNote(ctx, 261.63, now + 0.66, 0.45, 'sawtooth', 0.09);
  }

  public playLevelClear() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
      this.scheduleNote(ctx, freq, now + i * 0.08, 0.24, 'triangle', 0.12);
    });
  }

  public playCelebration() {
    this.playLevelClear();
  }

  private playTone(
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  private scheduleNote(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }
}

export const soundEngine = new SoundEngine();
