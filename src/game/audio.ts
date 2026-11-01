type OscType = OscillatorType;

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private loopId: number | null = null;
  private step = 0;
  soundEnabled = true;
  musicEnabled = true;

  init(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AudioCtor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    this.ctx = new AudioCtor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(this.ctx.destination);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.musicEnabled ? 0.15 : 0;
    this.musicBus.connect(this.master);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = this.soundEnabled ? 0.5 : 0;
    this.sfxBus.connect(this.master);
  }

  setSound(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (this.sfxBus && this.ctx) {
      this.sfxBus.gain.setTargetAtTime(enabled ? 0.5 : 0, this.ctx.currentTime, 0.03);
    }
  }

  setMusic(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (this.musicBus && this.ctx) {
      this.musicBus.gain.setTargetAtTime(enabled ? 0.15 : 0, this.ctx.currentTime, 0.03);
    }
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  private note(
    frequency: number,
    duration = 0.18,
    type: OscType = "sine",
    volume = 0.25,
    delay = 0,
    slideTo?: number,
    bus: "sfx" | "music" = "sfx",
  ): void {
    if (!this.ctx || !this.master) return;
    const targetBus = bus === "music" ? this.musicBus : this.sfxBus;
    if (!targetBus) return;
    if (bus === "sfx" && !this.soundEnabled) return;
    if (bus === "music" && !this.musicEnabled) return;

    const start = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(targetBus);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  click(): void {
    this.note(660, 0.07, "triangle", 0.18);
  }

  correct(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      this.note(frequency, 0.24, "triangle", 0.22, index * 0.075);
    });
  }

  wrong(): void {
    this.note(246.94, 0.3, "sawtooth", 0.12, 0, 164.81);
    this.note(196, 0.4, "triangle", 0.13, 0.1, 130.81);
  }

  coin(): void {
    this.note(1174.66, 0.09, "square", 0.1);
    this.note(1567.98, 0.14, "square", 0.08, 0.06);
  }

  jump(): void {
    this.note(392, 0.16, "sine", 0.16, 0, 784);
  }

  levelComplete(): void {
    const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1046.5, 1318.51];
    melody.forEach((frequency, index) => {
      this.note(frequency, 0.32, "triangle", 0.2, index * 0.12);
    });
    [261.63, 329.63, 392, 523.25].forEach((frequency) => {
      this.note(frequency, 1.1, "sine", 0.08, 0.24);
    });
  }

  gameOver(): void {
    [392, 349.23, 293.66, 246.94].forEach((frequency, index) => {
      this.note(frequency, 0.35, "triangle", 0.15, index * 0.18);
    });
  }

  countdown(): void {
    this.note(880, 0.08, "square", 0.08);
  }

  startMusic(): void {
    if (!this.ctx || this.loopId !== null || !this.musicEnabled) return;
    const progression = [
      [261.63, 329.63, 392.0, 523.25],
      [220.0, 261.63, 329.63, 440.0],
      [174.61, 220.0, 261.63, 349.23],
      [196.0, 246.94, 293.66, 392.0],
    ];
    const synth = (freq: number, duration: number, delay: number, type: OscType, volume: number) => {
      this.note(freq, duration, type, volume, delay, undefined, "music");
    };

    const tick = () => {
      if (!this.ctx) return;
      const chord = progression[Math.floor(this.step / 8) % progression.length];
      const beat = this.step % 8;
      synth(chord[beat % chord.length] * 2, 0.18, 0, "triangle", 0.1);
      if (beat === 0) {
        chord.forEach((frequency) => synth(frequency / 2, 1.8, 0, "sine", 0.055));
        synth(110, 0.6, 0, "sine", 0.11);
      }
      if (beat === 4) synth(140, 0.3, 0, "sine", 0.06);
      this.step += 1;
    };

    tick();
    this.loopId = window.setInterval(tick, 430);
  }

  stopMusic(): void {
    if (this.loopId !== null) {
      window.clearInterval(this.loopId);
      this.loopId = null;
    }
  }

  pauseMusic(): void {
    this.stopMusic();
  }

  resumeMusic(): void {
    if (this.musicEnabled) this.startMusic();
  }
}

export const gameAudio = new GameAudioEngine();
