// Grand Bandhan Audio Engine
// Supports both zero-latency Web Audio synthesizers (Raga Bhupali) and custom MP3 / WAV soundtracks

export interface MusicConfig {
  enabled: boolean;
  title: string;
  artist: string;
  type: 'synth' | 'mp3';
  url?: string;
}

class WeddingAudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private audioEl: HTMLAudioElement | null = null;
  private currentConfig: MusicConfig | null = null;

  private notes = [
    261.63, // C4 (Sa)
    293.66, // D4 (Re)
    329.63, // E4 (Ga)
    392.0,  // G4 (Pa)
    440.0,  // A4 (Dha)
    523.25, // C5 (Taar Sa)
  ];

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public setConfig(config: MusicConfig) {
    this.currentConfig = config;
    if (this.isPlaying) {
      // Re-trigger with new config
      this.stop();
      this.play(config);
    }
  }

  public toggle(config?: MusicConfig): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play(config || this.currentConfig || undefined);
      return true;
    }
  }

  public play(config?: MusicConfig) {
    if (config) {
      this.currentConfig = config;
    }

    const cfg = this.currentConfig;

    // 1. If custom MP3 audio is configured and valid
    if (cfg && cfg.type === 'mp3' && cfg.url) {
      this.stopSynth();
      try {
        if (!this.audioEl && typeof window !== 'undefined') {
          this.audioEl = new Audio();
          this.audioEl.loop = true;
          this.audioEl.volume = 0.65;
        }
        if (this.audioEl) {
          if (this.audioEl.src !== cfg.url) {
            this.audioEl.src = cfg.url;
          }
          this.audioEl.play().then(() => {
            this.isPlaying = true;
          }).catch((err) => {
            console.warn('HTML5 audio play blocked, falling back to Web Audio synth:', err);
            this.playSynth();
          });
          this.isPlaying = true;
          return;
        }
      } catch (err) {
        console.warn('Could not play MP3, using synth:', err);
      }
    }

    // 2. Fallback to meditative Raga Bhupali synthesizer
    this.stopAudioElement();
    this.playSynth();
  }

  private playSynth() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;

    // Play gentle meditative melody (Raga Bhupali notes)
    let noteIndex = 0;
    const melody = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 5, 4, 2, 0];

    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx) return;
      const noteFreq = this.notes[melody[noteIndex % melody.length]];
      noteIndex++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft flute-like warmth
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);

      // Gentle pitch glide (meend)
      osc.frequency.exponentialRampToValueAtTime(
        noteFreq * (1 + (Math.random() * 0.02 - 0.01)),
        this.ctx.currentTime + 0.8
      );

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    };

    playNextNote();
    this.intervalId = setInterval(playNextNote, 950);
  }

  private stopSynth() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private stopAudioElement() {
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch {}
    }
  }

  public stop() {
    this.isPlaying = false;
    this.stopSynth();
    this.stopAudioElement();
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const weddingMusic = new WeddingAudioManager();
