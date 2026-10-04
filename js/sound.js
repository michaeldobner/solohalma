// Kurze, leise Keramik-Klänge, direkt im Browser erzeugt (keine Audiodateien nötig).

export class Sound {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.ctx = null;
  }

  // iOS erlaubt Ton erst nach einer Berührung
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
  }

  click(freq = 2400, volume = 0.18, length = 0.05) {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    // Heller Anschlag
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + length);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + length + 0.02);

    // Kurzes Rauschen für den "Klack"
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const ng = ctx.createGain();
    noise.buffer = buf;
    filter.type = 'bandpass';
    filter.frequency.value = freq * 1.4;
    ng.gain.value = volume * 0.8;
    noise.connect(filter).connect(ng).connect(ctx.destination);
    noise.start(t);
  }

  land() {
    this.click(2600, 0.16, 0.05);
  }

  gutter() {
    this.click(1500, 0.1, 0.08);
  }

  invalid() {
    this.click(500, 0.08, 0.06);
  }

  win() {
    [0, 0.12, 0.24].forEach((d, k) => {
      setTimeout(() => this.click(1800 + k * 500, 0.12, 0.12), d * 1000);
    });
  }
}
