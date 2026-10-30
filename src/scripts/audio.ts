/**
 * Web Audio engine: UI sound effects + a looping cave ambience (ElevenLabs
 * generated, see scripts/sfx.mjs) on a muteable master bus, and a separate
 * music bus for the soundtrack player so pressing play always plays.
 */
import { withBase } from "../lib/paths";
type Sfx = "hover" | "select" | "open" | "close" | "page" | "needle" | "enter" | "seer" | "soul";

const GAIN: Record<Sfx, number> = {
  hover: 0.45,
  select: 1.7,
  open: 0.8,
  close: 0.7,
  page: 0.9,
  needle: 0.85,
  enter: 1,
  seer: 0.9,
  soul: 0.9,
};
const AMBIENCE_LEVEL = 0.55;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private ambBus!: GainNode;
  private musicBus!: GainNode;
  private buffers = new Map<string, AudioBuffer>();
  private loading: Promise<void> | null = null;
  private ambience: AudioBufferSourceNode | null = null;
  private mediaNodes = new WeakMap<HTMLMediaElement, AnalyserNode>();
  private lastHover = 0;
  enabled = false;

  /** Must run inside a user gesture the first time (autoplay policy). */
  ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.connect(this.master);
      this.ambBus = this.ctx.createGain();
      this.ambBus.gain.value = AMBIENCE_LEVEL;
      this.ambBus.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private load(): Promise<void> {
    if (this.loading) return this.loading;
    const ctx = this.ensureContext();
    const names: string[] = ["hover", "select", "open", "close", "page", "needle", "enter", "seer", "soul", "ambience"];
    this.loading = Promise.all(
      names.map(async (name) => {
        try {
          const res = await fetch(withBase(`audio/sfx/${name}.mp3`));
          const buf = await ctx.decodeAudioData(await res.arrayBuffer());
          this.buffers.set(name, buf);
        } catch {
          /* a missing sound must never break the page */
        }
      }),
    ).then(() => undefined);
    return this.loading;
  }

  async setEnabled(on: boolean) {
    this.enabled = on;
    if (!on && !this.ctx) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(on ? 1 : 0, now, on ? 0.6 : 0.15);
    if (on) {
      await this.load();
      this.startAmbience();
    }
  }

  private startAmbience() {
    if (this.ambience || !this.ctx) return;
    const buf = this.buffers.get("ambience");
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(this.ambBus);
    src.start();
    this.ambience = src;
  }

  /** Lower the cave bed while music or a trailer plays. */
  duck(on: boolean) {
    if (!this.ctx) return;
    this.ambBus.gain.setTargetAtTime(on ? 0 : AMBIENCE_LEVEL, this.ctx.currentTime, on ? 0.3 : 1.2);
  }

  play(name: Sfx, opts: { detune?: number; volume?: number } = {}) {
    if (!this.enabled || !this.ctx) return;
    const buf = this.buffers.get(name);
    if (!buf) return;
    if (name === "hover") {
      const t = performance.now();
      if (t - this.lastHover < 70) return;
      this.lastHover = t;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.detune.value = opts.detune ?? (name === "hover" ? (Math.random() - 0.5) * 220 : 0);
    const g = this.ctx.createGain();
    g.gain.value = GAIN[name] * (opts.volume ?? 1);
    src.connect(g).connect(this.sfxBus);
    src.start();
  }

  /** Route an <audio> element through Web Audio (once) and hand back its analyser. */
  connectMedia(el: HTMLMediaElement): AnalyserNode {
    const existing = this.mediaNodes.get(el);
    if (existing) return existing;
    const ctx = this.ensureContext();
    const source = ctx.createMediaElementSource(el);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    source.connect(analyser).connect(this.musicBus);
    this.mediaNodes.set(el, analyser);
    return analyser;
  }
}

export const audio = new AudioEngine();
