const MUTE_STORAGE_KEY = 'ben_alice_math_attack_muted';

// Musical note frequencies (Hz)
const N = {
  _: 0,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0
};

const MUSIC_THEMES = {
  // Cheerful, bouncy title screen theme
  menu: {
    stepMs: 210,
    lead: [
      N.E5, N.G5, N.C5, N.E5, N.D5, N.F5, N.B4, N.D5,
      N.C5, N.E5, N.G5, N.E5, N.D5, N._,  N.G4, N._,
      N.A4, N.C5, N.F5, N.E5, N.D5, N.B4, N.G4, N.B4,
      N.C5, N.E5, N.D5, N.B4, N.C5, N._,  N.C5, N._
    ],
    bass: [
      N.C3, N._, N.G3, N._, N.G3, N._, N.D3, N._,
      N.C3, N._, N.E3, N._, N.G3, N._, N.G3, N._,
      N.F3, N._, N.C3, N._, N.G3, N._, N.D3, N._,
      N.C3, N._, N.G3, N._, N.C3, N._, N._,  N._
    ]
  },
  // Upbeat Mario / Bubble-Bobble style arcade platformer theme
  game: {
    stepMs: 165,
    lead: [
      N.C5, N.E5, N.G5, N.E5, N.C5, N.G5, N.E5, N._,
      N.D5, N.F5, N.A5, N.F5, N.D5, N.G5, N.B4, N._,
      N.C5, N.E5, N.G5, N.C5, N.A4, N.C5, N.F5, N.A5,
      N.G5, N.E5, N.D5, N.B4, N.C5, N.G4, N.C5, N._,
      N.E5, N._,  N.E5, N.F5, N.G5, N._,  N.E5, N.C5,
      N.D5, N._,  N.D5, N.E5, N.F5, N._,  N.D5, N.B4,
      N.C5, N.G4, N.E5, N.C5, N.A5, N.F5, N.D5, N.B4,
      N.C5, N.E5, N.G5, N.E5, N.C5, N._,  N._,  N._
    ],
    bass: [
      N.C3, N.G3, N.C3, N.G3, N.C3, N.G3, N.C3, N.G3,
      N.G3, N.D3, N.G3, N.D3, N.G3, N.D3, N.G3, N.D3,
      N.C3, N.G3, N.E3, N.G3, N.F3, N.C3, N.F3, N.C3,
      N.G3, N.D3, N.G3, N.D3, N.C3, N.G3, N.C3, N._,
      N.C3, N.G3, N.C3, N.G3, N.E3, N.G3, N.C3, N.G3,
      N.G3, N.D3, N.G3, N.D3, N.B3, N.D3, N.G3, N.D3,
      N.C3, N.E3, N.G3, N.E3, N.F3, N.A3, N.G3, N.B3,
      N.C3, N.G3, N.E3, N.G3, N.C3, N._,  N._,  N._
    ]
  },
  // Funky celebration dance-party groove for VictoryScene
  victory: {
    stepMs: 155,
    lead: [
      N.C5, N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.C5,
      N.D5, N.D5, N.G5, N.B4, N.D5, N.G5, N.A5, N.B4,
      N.C5, N.E5, N.G5, N.C5, N.F5, N.A5, N.G5, N.E5,
      N.D5, N.G5, N.E5, N.D5, N.C5, N.G5, N.C5, N._
    ],
    bass: [
      N.C3, N.C3, N.E3, N.G3, N.F3, N.F3, N.C3, N.E3,
      N.G3, N.G3, N.D3, N.G3, N.G3, N.D3, N.G3, N.B3,
      N.C3, N.E3, N.G3, N.E3, N.F3, N.A3, N.C3, N.E3,
      N.G3, N.D3, N.G3, N.B3, N.C3, N.G3, N.C3, N._
    ]
  }
};

/**
 * Retro-cute procedural Web Audio API sound & chiptune music synthesizer.
 * Zero external audio assets needed.
 */
class SoundManager {
  constructor() {
    // Clean up any previous HMR instance so two music timers can never run at once!
    if (typeof window !== 'undefined' && window.__MATH_ATTACK_SOUND_MANAGER__) {
      try {
        window.__MATH_ATTACK_SOUND_MANAGER__.destroy();
      } catch {
        // Ignore cleanup errors
      }
    }

    this.ctx = null;
    this.masterGain = null;
    this.muted = false;
    this.currentTheme = 'menu';
    this.musicTimer = null;
    this.musicStep = 0;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.muted = window.localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
      }
    } catch {
      // Ignore storage errors
    }

    this._onUnlock = () => {
      if (!this.muted) {
        this._ensureContext();
        if (!this.musicTimer && this.currentTheme) {
          this.startMusic(this.currentTheme);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', this._onUnlock, { passive: true });
      window.addEventListener('keydown', this._onUnlock, { passive: true });
      window.__MATH_ATTACK_SOUND_MANAGER__ = this;
    }
  }

  destroy() {
    this.stopMusic();
    if (typeof window !== 'undefined' && this._onUnlock) {
      window.removeEventListener('pointerdown', this._onUnlock);
      window.removeEventListener('keydown', this._onUnlock);
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // Ignore close errors
      }
      this.ctx = null;
      this.masterGain = null;
    }
  }

  _ensureContext() {
    if (this.muted || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
    }
    return this.ctx;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  setMuted(muteState) {
    this.muted = Boolean(muteState);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(MUTE_STORAGE_KEY, String(this.muted));
      }
    } catch {
      // Ignore storage errors
    }

    if (this.muted) {
      this.stopMusic();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    } else {
      this._ensureContext();
      if (this.currentTheme) {
        this.startMusic(this.currentTheme);
      }
    }
    return this.muted;
  }

  startMusic(themeName = 'game') {
    this.currentTheme = MUSIC_THEMES[themeName] ? themeName : 'game';
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.muted || typeof window === 'undefined') return;

    const theme = MUSIC_THEMES[this.currentTheme];
    this.musicStep = 0;

    const tick = () => {
      if (this.muted) return;
      const ctx = this._ensureContext();
      if (!ctx || ctx.state !== 'running') return;

      const idx = this.musicStep % theme.lead.length;
      const leadFreq = theme.lead[idx];
      const bassFreq = theme.bass[idx % theme.bass.length];
      const durSec = (theme.stepMs / 1000) * 0.82;

      if (leadFreq > 0) {
        this._playTone({
          freq: leadFreq,
          duration: durSec,
          type: 'triangle',
          gain: 0.045
        });
      }
      if (bassFreq > 0) {
        this._playTone({
          freq: bassFreq,
          duration: durSec * 0.9,
          type: 'sine',
          gain: 0.05
        });
      }
      this.musicStep += 1;
    };

    this.musicTimer = setInterval(tick, theme.stepMs);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  _playTone({ freq = 440, endFreq = null, duration = 0.12, type = 'sine', gain = 0.14, delay = 0 }) {
    const ctx = this._ensureContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);
    }

    amp.gain.setValueAtTime(0.001, startTime);
    amp.gain.linearRampToValueAtTime(gain, startTime + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(amp);
    amp.connect(this.masterGain || ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  playJump() {
    this._playTone({ freq: 260, endFreq: 580, duration: 0.14, type: 'sine', gain: 0.12 });
  }

  playPickup() {
    this._playTone({ freq: 587.33, duration: 0.08, type: 'triangle', gain: 0.14, delay: 0 });
    this._playTone({ freq: 880, duration: 0.14, type: 'triangle', gain: 0.14, delay: 0.06 });
  }

  playBrickBump() {
    this._playTone({ freq: 180, endFreq: 360, duration: 0.11, type: 'square', gain: 0.09 });
  }

  playOperatorSwitch() {
    this._playTone({ freq: 440, duration: 0.07, type: 'sine', gain: 0.12, delay: 0 });
    this._playTone({ freq: 659.25, duration: 0.11, type: 'sine', gain: 0.12, delay: 0.06 });
  }

  playReject() {
    this._playTone({ freq: 240, endFreq: 130, duration: 0.2, type: 'sawtooth', gain: 0.1 });
  }

  playFunnyCry() {
    // Hilarious cartoon "wah-wah-wah" crying sound when bumped by a monster!
    this._playTone({ freq: 520, endFreq: 310, duration: 0.18, type: 'triangle', gain: 0.16, delay: 0 });
    this._playTone({ freq: 460, endFreq: 260, duration: 0.2, type: 'triangle', gain: 0.16, delay: 0.19 });
    this._playTone({ freq: 390, endFreq: 190, duration: 0.26, type: 'sawtooth', gain: 0.12, delay: 0.39 });
  }

  playSlimeStomp() {
    this._playTone({ freq: 320, endFreq: 720, duration: 0.15, type: 'triangle', gain: 0.15 });
  }

  playDoorUnlock() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this._playTone({ freq, duration: 0.14, type: 'triangle', gain: 0.14, delay: i * 0.07 });
    });
  }

  playVictory() {
    const melody = [
      { freq: 523.25, delay: 0, dur: 0.12 },
      { freq: 659.25, delay: 0.11, dur: 0.12 },
      { freq: 783.99, delay: 0.22, dur: 0.12 },
      { freq: 1046.5, delay: 0.34, dur: 0.28 },
      { freq: 783.99, delay: 0.56, dur: 0.12 },
      { freq: 1046.5, delay: 0.68, dur: 0.38 }
    ];
    melody.forEach((n) => {
      this._playTone({ freq: n.freq, duration: n.dur, type: 'triangle', gain: 0.15, delay: n.delay });
    });
  }
}

export const soundFX = new SoundManager();
