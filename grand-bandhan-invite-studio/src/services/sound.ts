// Grand Bandhan Audio Engine
// Supports both zero-latency Web Audio synthesizers (Raga Bhupali, Birthday Chimes, Corporate Piano) and custom MP3 / WAV soundtracks

export interface MusicConfig {
  enabled: boolean;
  title: string;
  artist: string;
  type: 'synth' | 'mp3';
  url?: string;
  category?: string;
}

export interface SoundtrackPreset {
  id: string;
  category: 'wedding' | 'birthday' | 'corporate' | 'custom' | 'all';
  name: string;
  artist: string;
  type: 'synth' | 'mp3';
  url: string;
  desc: string;
}

export const SOUNDTRACK_PRESETS: SoundtrackPreset[] = [
  // 1. Wedding & Traditional
  {
    id: 'w-shehnai-synth',
    category: 'wedding',
    name: 'शाही शहनाई व बांसुरी (Royal Flute Synth)',
    artist: 'Grand Bandhan Studio Ensemble',
    type: 'synth',
    url: '',
    desc: 'Zero-lag classical flute melody in Raga Bhupali',
  },
  {
    id: 'w-mangal-bells',
    category: 'wedding',
    name: 'मांगलिक शहनाई (Auspicious Shehnai Bells)',
    artist: 'Varanasi Heritage Troupe',
    type: 'mp3',
    url: 'https://assets.mixkit.co/music/preview/mixkit-indian-traditional-sitar-694.mp3',
    desc: 'Rich ceremonial Shehnai & temple bells',
  },
  {
    id: 'w-jashn-dholak',
    category: 'wedding',
    name: 'जश्न व ढोलक (Celebration Sitar Beats)',
    artist: 'Bollywood Classical',
    type: 'mp3',
    url: 'https://assets.mixkit.co/music/preview/mixkit-bollywood-nights-242.mp3',
    desc: 'Festive wedding celebration rhythm with dholak',
  },
  {
    id: 'w-romantic-strings',
    category: 'wedding',
    name: 'मधुर सितार व बाँसुरी (Romantic Sitar & Strings)',
    artist: 'Acoustic Raga Serenade',
    type: 'mp3',
    url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    desc: 'Soulful acoustic violin & sitar harmony',
  },

  // 2. Birthday Celebrations
  {
    id: 'b-birthday-chimes',
    category: 'birthday',
    name: 'हैप्पी बर्थडे मेलोडी (Birthday Chimes Synth)',
    artist: 'Celebration Music Box',
    type: 'synth',
    url: '',
    desc: 'Festive Happy Birthday chime melody via Web Audio',
  },
  {
    id: 'b-party-pop',
    category: 'birthday',
    name: 'पार्टी बीट्स व पॉप (Upbeat Party Confetti)',
    artist: 'Kids & Gala Pop',
    type: 'mp3',
    url: 'https://assets.mixkit.co/music/preview/mixkit-happy-times-158.mp3',
    desc: 'Energetic cheerful party celebration track',
  },

  // 3. Corporate & Professional
  {
    id: 'c-keynote-piano',
    category: 'corporate',
    name: 'कॉर्पोरेट कीनोट थीम (Inspiring Piano Synth)',
    artist: 'Global Tech Anthem',
    type: 'synth',
    url: '',
    desc: 'Uplifting ambient major arpeggio for summits',
  },
  {
    id: 'c-ambient-tech',
    category: 'corporate',
    name: 'ग्लोबल समिट बीट्स (Executive Ambient Beats)',
    artist: 'Silicon Tech Sound',
    type: 'mp3',
    url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    desc: 'Polished modern electronic soundscape for events',
  },
];

class WeddingAudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private audioEl: HTMLAudioElement | null = null;
  private currentConfig: MusicConfig | null = null;

  // Wedding Raga Bhupali Frequencies
  private weddingNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

  // Happy Birthday Melody: C4 C4 D4 C4 F4 E4 | C4 C4 D4 C4 G4 F4 | C4 C4 C5 A4 F4 E4 D4 | Bb4 Bb4 A4 F4 G4 F4
  private birthdayNotes = [
    261.63, 261.63, 293.66, 261.63, 349.23, 329.63,
    261.63, 261.63, 293.66, 261.63, 392.00, 349.23,
    261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66,
    466.16, 466.16, 440.00, 349.23, 392.00, 349.23,
  ];

  // Corporate Inspiring Arpeggio (C Major 9)
  private corporateNotes = [261.63, 329.63, 392.0, 493.88, 523.25, 587.33, 523.25, 392.0];

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

    // 2. Fallback to adaptive Web Audio synthesizer
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

    const title = (this.currentConfig?.title || '').toLowerCase();
    const isBirthday = title.includes('birthday') || title.includes('बर्थडे') || this.currentConfig?.category === 'birthday';
    const isCorporate = title.includes('keynote') || title.includes('summit') || title.includes('corporate') || this.currentConfig?.category === 'corporate';

    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (isBirthday) {
        // Music Box Chime for Birthday
        const freq = this.birthdayNotes[noteIndex % this.birthdayNotes.length];
        noteIndex++;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.65);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.7);
      } else if (isCorporate) {
        // Ambient Piano/Key Arpeggio for Corporate
        const freq = this.corporateNotes[noteIndex % this.corporateNotes.length];
        noteIndex++;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.09, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.2);
      } else {
        // Royal meditative flute (Raga Bhupali) for Wedding & Pooja
        const melody = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 5, 4, 2, 0];
        const freq = this.weddingNotes[melody[noteIndex % melody.length]];
        noteIndex++;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          freq * (1 + (Math.random() * 0.015 - 0.007)),
          this.ctx.currentTime + 0.8
        );

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.2);
      }
    };

    playNextNote();
    const intervalMs = isBirthday ? 620 : isCorporate ? 750 : 950;
    this.intervalId = setInterval(playNextNote, intervalMs);
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
