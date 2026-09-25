class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private speechSynth: SpeechSynthesis | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  // Default to a calm, gentle pace (0.75) tailored for 6+ year old children
  public speechRate = 0.75;
  // Slightly warm, cheerful and engaging pitch
  public speechPitch = 1.08;
  public soundEffectsEnabled = true;
  public speechEnabled = true;
  private isAudioUnlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.speechSynth = window.speechSynthesis;
        this.initVoice();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => this.initVoice();
        }
      }
    }
  }

  public initVoice() {
    if (!this.speechSynth) return;
    const voices = this.speechSynth.getVoices();
    if (voices.length === 0) return;

    // Prioritize natural, friendly English voices (Samantha, Ava, Jenny, Aria, Google US English, etc.)
    const preferredNames = [
      'Google US English',
      'Samantha',
      'Ava (Premium)',
      'Ava',
      'Jenny',
      'Aria',
      'Victoria',
      'Serena',
      'Karen',
      'Tessa',
      'Daniel',
      'Guy',
    ];

    let found: SpeechSynthesisVoice | null = null;

    for (const name of preferredNames) {
      const match = voices.find(
        (v) => v.name.includes(name) || (v.lang.startsWith('en') && v.name.toLowerCase().includes(name.toLowerCase()))
      );
      if (match) {
        found = match;
        break;
      }
    }

    // Fallbacks
    if (!found) {
      found =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
        voices.find((v) => v.lang === 'en-US') ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0] ||
        null;
    }

    this.preferredVoice = found;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynth) return [];
    return this.speechSynth.getVoices().filter((v) => v.lang.startsWith('en'));
  }

  public getSelectedVoiceName(): string {
    return this.preferredVoice?.name || 'Default Friendly Voice';
  }

  public setVoiceByName(name: string) {
    if (!this.speechSynth) return;
    const voices = this.speechSynth.getVoices();
    const match = voices.find((v) => v.name === name);
    if (match) {
      this.preferredVoice = match;
    }
  }

  public unlockAudio() {
    if (this.isAudioUnlocked) return;
    if (typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass && !this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }
    this.isAudioUnlocked = true;
  }

  public getAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Speaks a phrase with warm, engaging, and clear articulation
   */
  public speak(text: string, onEnd?: () => void) {
    if (!this.speechEnabled || !this.speechSynth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.speechSynth.cancel();

      // Ensure voice is populated
      if (!this.preferredVoice) {
        this.initVoice();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }
      utterance.rate = this.speechRate;
      utterance.pitch = this.speechPitch;
      utterance.volume = 1.0;

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = () => onEnd();
      }

      this.speechSynth.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if (this.speechSynth) {
      try {
        this.speechSynth.cancel();
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Test sample for parents to preview the current voice speed and warmth
   */
  public previewVoice() {
    this.speak("Hello friend! Let's explore Braille together. Ready to type?");
  }

  /**
   * Sweet, warm chime arpeggio (C5 - E5 - G5 - C6)
   */
  public playSuccessTone() {
    if (!this.soundEffectsEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

      gain.gain.setValueAtTime(0, startTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, startTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.08);
      osc.stop(startTime + idx * 0.08 + 0.32);
    });
  }

  /**
   * Duolingo-style XP crystal shimmer ding
   */
  public playGemXpSound() {
    if (!this.soundEffectsEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [1318.5, 1760.0]; // E6, A6
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.06);

      gain.gain.setValueAtTime(0, startTime + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.14, startTime + idx * 0.06 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.06);
      osc.stop(startTime + idx * 0.06 + 0.28);
    });
  }

  /**
   * Warm, soft non-punitive gentle boop (soft low-pitch marimba)
   */
  public playGentleRetryTone() {
    if (!this.soundEffectsEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(261.63, startTime); // C4
    osc.frequency.exponentialRampToValueAtTime(220.0, startTime + 0.24); // A3

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.14, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.28);
  }

  /**
   * Tactile click tone when pressing a key
   */
  public playDotClick() {
    if (!this.soundEffectsEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, startTime);
    osc.frequency.exponentialRampToValueAtTime(400, startTime + 0.04);

    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.06);
  }

  /**
   * Cheerful mode switch tone
   */
  public playModeSwitchTone() {
    if (!this.soundEffectsEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const notes = [440, 880];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.09);

      gain.gain.setValueAtTime(0, startTime + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.14, startTime + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.09 + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.09);
      osc.stop(startTime + idx * 0.09 + 0.18);
    });
  }

  /**
   * Streak celebration fanfare
   */
  public playStreakFanfare() {
    if (!this.soundEffectsEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.07);

      gain.gain.setValueAtTime(0, startTime + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18, startTime + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.07);
      osc.stop(startTime + idx * 0.07 + 0.38);
    });
  }

  /**
   * Triumphant victory fanfare upon level completion
   */
  public playLevelCompleteFanfare() {
    if (!this.soundEffectsEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const chords = [
      { notes: [523.25, 659.25, 783.99], time: 0, dur: 0.18 },
      { notes: [587.33, 739.99, 880.0], time: 0.18, dur: 0.18 },
      { notes: [659.25, 830.61, 987.77], time: 0.36, dur: 0.18 },
      { notes: [1046.5, 1318.5, 1567.98, 2093.0], time: 0.54, dur: 0.6 },
    ];

    const baseTime = ctx.currentTime;

    chords.forEach(({ notes, time, dur }) => {
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, baseTime + time);

        gain.gain.setValueAtTime(0, baseTime + time);
        gain.gain.linearRampToValueAtTime(0.12, baseTime + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, baseTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(baseTime + time);
        osc.stop(baseTime + time + dur + 0.05);
      });
    });
  }
}

export const sound = new SoundEngine();
