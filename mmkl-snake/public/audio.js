/**
 * MKLL Snake — Procedural Audio Engine
 * Uses Web Audio API to synthesize sounds and music on-the-fly.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterBus = null;
    this.currentMusic = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterBus = this.ctx.createGain();
    this.musicBus  = this.ctx.createGain();
    this.sfxBus    = this.ctx.createGain();
    
    this.masterBus.gain.value = 0.5;
    this.musicBus.gain.value  = 0.5;
    this.sfxBus.gain.value    = 0.7;

    this.musicBus.connect(this.masterBus);
    this.sfxBus.connect(this.masterBus);
    this.masterBus.connect(this.ctx.destination);
    this.initialized = true;
    console.log('[AUDIO] Context Initialized');
  }

  // --- Voice --- (Disabled as requested)
  speak(text) {}

  // --- SFX ---
  playSFX(type) {
    if (!this.initialized) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const handlers = {
      laser: () => this._sweep(880, 220, 0.15, 'square'),
      wave:  () => this._noise(0.8, 0.05, 0.6),
      meteor:() => this._noise(1.8, 0.4, 0.2, true), // low pass noise
      quicksand: () => this._sweep(200, 50, 0.4, 'sawtooth'),
      win:   () => this._arpeggio([440, 554, 659, 880], 0.1),
      lose:  () => this._arpeggio([330, 261, 196, 130], 0.2, 'sawtooth'),
      eat:   () => this._sweep(660, 880, 0.08, 'sine'),
      button:() => this._sweep(440, 550, 0.05, 'sine'),
    };

    if (handlers[type]) handlers[type]();
  }

  setMusicVolume(vol) { if (this.musicBus) this.musicBus.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05); }
  setSFXVolume(vol)   { if (this.sfxBus)   this.sfxBus.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05); }
  setMasterVolume(vol){ if (this.masterBus)this.masterBus.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05); }

  // --- Music ---
  playMusic(theme) {
    if (!this.initialized) return;
    if (this.currentMusic) this.stopMusic();

    const themes = {
      menu:   { notes: [164.8, 196, 220, 164.8, 196, 220, 246.9, 220], tempo: 350, type: 'sine' },
      ocean:  { notes: [174.6, 196, 220, 261.6], tempo: 600, type: 'triangle' },
      cyber:  { notes: [110, 116.5, 123.5, 130.8], tempo: 200, type: 'square' },
      lava:   { notes: [82.4, 87.3, 98.0, 110.0], tempo: 300, type: 'sawtooth' },
      jungle: { notes: [146.8, 164.8, 174.6, 196], tempo: 450, type: 'triangle' },
    };

    const t = themes[theme] || themes.menu;
    let idx = 0;
    this.currentMusic = setInterval(() => {
      this._osc(t.notes[idx % t.notes.length], 0.2, t.type, 0.15);
      idx++;
    }, t.tempo);
  }

  stopMusic() {
    clearInterval(this.currentMusic);
    this.currentMusic = null;
  }

  // --- Internal primitives ---
  _osc(freq, dur, type = 'sine', vol = 0.2) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
    o.connect(g);
    g.connect(this.musicBus || this.masterBus);
    o.start();
    o.stop(this.ctx.currentTime + dur);
  }

  _sweep(f1, f2, dur, type = 'sine') {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(f2, this.ctx.currentTime + dur);
    g.gain.setValueAtTime(0.2, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + dur);
    o.connect(g);
    g.connect(this.sfxBus || this.masterBus);
    o.start();
    o.stop(this.ctx.currentTime + dur);
  }

  _arpeggio(notes, step, type = 'sine') {
    notes.forEach((f, i) => {
      setTimeout(() => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = f;
        g.gain.setValueAtTime(0.2, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        o.connect(g);
        g.connect(this.sfxBus || this.masterBus);
        o.start(); o.stop(this.ctx.currentTime + 0.4);
      }, i * step * 1000);
    });
  }

  _noise(dur, vol = 0.1, decay = 0.5, lowPass = false) {
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur * decay);
    
    let lastNode = g;
    if (lowPass) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        g.connect(filter);
        lastNode = filter;
    }

    noise.connect(g);
    lastNode.connect(this.sfxBus || this.masterBus);
    noise.start();
  }
}

window.SND = new AudioEngine();
