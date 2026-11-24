class WeddingMusicSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;

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

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play() {
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

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const weddingMusic = new WeddingMusicSynth();
