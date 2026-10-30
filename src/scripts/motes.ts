import { gsap } from "gsap";
import { lenis } from "./scroll";
import type { Section } from "../data/sections";

type Theme = Section["theme"];
interface Look {
  rgb: [number, number, number];
  rise: number;
  sway: number;
  flicker: number;
}

/** Each part of the page has its own air: soul motes, void dust, dream sparks, silk embers, gold. */
const LOOKS: Record<Theme, Look> = {
  soul: { rgb: [186, 222, 255], rise: 0.22, sway: 0.18, flicker: 0.25 },
  void: { rgb: [212, 216, 230], rise: 0.1, sway: 0.08, flicker: 0.12 },
  dream: { rgb: [214, 188, 255], rise: 0.18, sway: 0.16, flicker: 0.4 },
  silk: { rgb: [255, 122, 86], rise: 0.75, sway: 0.32, flicker: 0.7 },
  gold: { rgb: [255, 214, 150], rise: 0.2, sway: 0.14, flicker: 0.3 },
};

interface Mote {
  x: number;
  y: number;
  z: number;
  r: number;
  phase: number;
  speed: number;
}

export function initMotes() {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-motes]");
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return { setTheme: (_t: Theme) => {}, setEnabled: (_on: boolean) => {} };

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const look = { r: 186, g: 222, b: 255, rise: 0.22, sway: 0.18, flicker: 0.25 };
  const sprite = document.createElement("canvas");
  const sctx = sprite.getContext("2d")!;
  sprite.width = sprite.height = 64;
  let spriteKey = "";

  const paintSprite = () => {
    const key = `${look.r | 0},${look.g | 0},${look.b | 0}`;
    if (key === spriteKey) return;
    spriteKey = key;
    sctx.clearRect(0, 0, 64, 64);
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(255,255,255,1)`);
    g.addColorStop(0.18, `rgba(${key},0.9)`);
    g.addColorStop(0.45, `rgba(${key},0.22)`);
    g.addColorStop(1, `rgba(${key},0)`);
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);
  };

  let w = 0;
  let h = 0;
  let motes: Mote[] = [];
  const spawn = (anywhere: boolean): Mote => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + 20,
    z: 0.25 + Math.random() * 0.75,
    r: 0.6 + Math.random() * 1.9,
    phase: Math.random() * Math.PI * 2,
    speed: 0.6 + Math.random() * 0.8,
  });
  const resize = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round(Math.min(w < 720 ? 42 : 110, (w * h) / 15000));
    while (motes.length < target) motes.push(spawn(true));
    motes.length = target;
  };
  resize();
  window.addEventListener("resize", resize);

  const pointer = { x: -9999, y: -9999 };
  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  let t = 0;
  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs / 16.67, 3);
    t += dt * 0.016;
    paintSprite();
    ctx.clearRect(0, 0, w, h);
    const vel = lenis?.velocity ?? 0;
    for (const m of motes) {
      m.y -= (look.rise * m.speed + 0.05) * m.z * dt * 1.4 + vel * 0.12 * m.z;
      m.x += Math.sin(t * m.speed + m.phase) * look.sway * m.z * dt;
      const dx = m.x - pointer.x;
      const dy = m.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 140 * 140) {
        const f = (1 - Math.sqrt(d2) / 140) * 1.6 * dt;
        m.x += (dx / 140) * f * 6;
        m.y += (dy / 140) * f * 6;
      }
      if (m.y < -20) Object.assign(m, spawn(false));
      else if (m.y > h + 30) m.y = -10;
      if (m.x < -20) m.x = w + 10;
      else if (m.x > w + 20) m.x = -10;

      const tw = 0.55 + 0.45 * Math.sin(t * (2 + look.flicker * 6) * m.speed + m.phase);
      ctx.globalAlpha = Math.max(0, (0.25 + 0.6 * m.z) * tw);
      const size = m.r * 7 * m.z;
      ctx.drawImage(sprite, m.x - size / 2, m.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  };

  let running = false;
  let enabled = true;
  const run = (on: boolean) => {
    if (on === running) return;
    running = on;
    if (on) gsap.ticker.add(tick);
    else {
      gsap.ticker.remove(tick);
      ctx.clearRect(0, 0, w, h);
    }
  };
  document.addEventListener("visibilitychange", () => run(!document.hidden && enabled));
  run(true);

  return {
    setTheme(theme: Theme) {
      const next = LOOKS[theme];
      gsap.to(look, { r: next.rgb[0], g: next.rgb[1], b: next.rgb[2], rise: next.rise, sway: next.sway, flicker: next.flicker, duration: 1.6, ease: "sine.inOut" });
    },
    setEnabled(on: boolean) {
      enabled = on;
      run(on && !document.hidden);
    },
  };
}
