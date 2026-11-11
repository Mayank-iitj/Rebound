// Web Audio API synthesizer for tactile UI audio micro-interactions

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft pleasant click / tap
  playTap() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  // Uplifting 2-tone chime on habit completion
  playSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [
        { f: 523.25, start: 0, dur: 0.12 }, // C5
        { f: 659.25, start: 0.08, dur: 0.22 } // E5
      ].forEach(tone => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(tone.f, now + tone.start);
        gain.gain.setValueAtTime(0.12, now + tone.start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + tone.start + tone.dur);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + tone.start);
        osc.stop(now + tone.start + tone.dur);
      });
    } catch (e) {}
  }

  // Triumphant 4-tone arpeggio for Comeback & Flight Recorder recovery
  playComebackFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, delay: 0 },    // C5
        { f: 659.25, delay: 0.09 }, // E5
        { f: 783.99, delay: 0.18 }, // G5
        { f: 1046.50, delay: 0.28 } // C6
      ];
      notes.forEach(n => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.delay);
        gain.gain.setValueAtTime(0.14, now + n.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.delay + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + n.delay);
        osc.stop(now + n.delay + 0.25);
      });
    } catch (e) {}
  }

  // Governor defense shield pulse when blocking shame or clinical advice
  playShieldAlert() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.18);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }
}

export const sound = new SoundEffects();

