import { gsap } from "gsap";
import { audio } from "./audio";

interface Item {
  id: string;
  title: string;
  album: string;
  src: string;
  cover: string;
  accent: string;
}

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

/**
 * Soundtrack turntable: one <audio> element, routed through Web Audio for a
 * radial visualizer, with Media Session controls and a HUD mini-player.
 */
export function initPlayer() {
  const section = document.querySelector<HTMLElement>("#soundtrack");
  const el = section?.querySelector<HTMLAudioElement>("[data-ost-audio]");
  const raw = section?.querySelector("[data-ost-playlist]")?.textContent;
  if (!section || !el || !raw) return;
  const list: Item[] = JSON.parse(raw);

  const turntable = section.querySelector<HTMLElement>("[data-turntable]")!;
  const cover = section.querySelector<HTMLImageElement>("[data-ost-cover]");
  const trackBtns = [...section.querySelectorAll<HTMLButtonElement>("[data-track]")];
  const seek = section.querySelector<HTMLInputElement>("[data-ost-seek]")!;
  const time = section.querySelector<HTMLElement>("[data-ost-time]")!;
  const dur = section.querySelector<HTMLElement>("[data-ost-duration]")!;
  const canvas = section.querySelector<HTMLCanvasElement>("[data-ost-viz]")!;
  const toggles = [...document.querySelectorAll<HTMLButtonElement>("[data-ost-toggle]")];
  const now = document.querySelector<HTMLElement>("[data-now-playing]");
  const nowTitle = document.querySelector<HTMLElement>("[data-now-title]");

  let index = 0;
  let analyser: AnalyserNode | null = null;
  let seeking = false;

  const load = (i: number) => {
    index = (i + list.length) % list.length;
    const item = list[index];
    el.src = item.src;
    trackBtns.forEach((b, j) => b.setAttribute("aria-pressed", String(j === index)));
    section.style.setProperty("--ost-accent", item.accent);
    if (nowTitle) nowTitle.textContent = item.title;
    if (cover && !cover.src.endsWith(item.cover)) {
      gsap.to(cover, {
        autoAlpha: 0,
        duration: 0.25,
        onComplete: () => {
          cover.srcset = "";
          cover.src = item.cover;
          gsap.to(cover, { autoAlpha: 1, duration: 0.5 });
        },
      });
    }
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.title,
        artist: "Christopher Larkin",
        album: item.album,
        artwork: [{ src: new URL(item.cover, location.href).href, sizes: "400x400", type: "image/webp" }],
      });
    }
  };

  const play = async (i = index) => {
    if (i !== index || !el.src) load(i);
    analyser ??= audio.connectMedia(el);
    audio.ensureContext();
    try {
      await el.play();
    } catch {
      /* blocked or interrupted — the UI simply stays paused */
    }
  };
  const pause = () => el.pause();
  const toggle = () => (el.paused ? void play() : pause());

  el.addEventListener("play", () => {
    section.classList.add("is-playing");
    turntable.classList.add("is-playing");
    toggles.forEach((t) => t.setAttribute("aria-label", "일시정지"));
    if (now) now.hidden = false;
    audio.duck(true);
    draw();
  });
  el.addEventListener("pause", () => {
    section.classList.remove("is-playing");
    turntable.classList.remove("is-playing");
    toggles.forEach((t) => t.setAttribute("aria-label", "재생"));
    if (now) now.hidden = true;
    audio.duck(false);
  });
  el.addEventListener("ended", () => void play(index + 1));
  el.addEventListener("loadedmetadata", () => (dur.textContent = fmt(el.duration)));
  el.addEventListener("timeupdate", () => {
    if (seeking || !el.duration) return;
    const p = el.currentTime / el.duration;
    seek.value = String(Math.round(p * 1000));
    seek.style.setProperty("--p", `${p * 100}%`);
    time.textContent = fmt(el.currentTime);
  });
  seek.addEventListener("input", () => {
    seeking = true;
    seek.style.setProperty("--p", `${Number(seek.value) / 10}%`);
    if (el.duration) time.textContent = fmt((Number(seek.value) / 1000) * el.duration);
  });
  seek.addEventListener("change", () => {
    if (el.duration) el.currentTime = (Number(seek.value) / 1000) * el.duration;
    seeking = false;
  });

  toggles.forEach((t) => t.addEventListener("click", toggle));
  section.querySelector("[data-ost-prev]")?.addEventListener("click", () => void play(index - 1));
  section.querySelector("[data-ost-next]")?.addEventListener("click", () => void play(index + 1));
  trackBtns.forEach((b, i) => b.addEventListener("click", () => (i === index && !el.paused ? pause() : void play(i))));

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => void play());
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("previoustrack", () => void play(index - 1));
    navigator.mediaSession.setActionHandler("nexttrack", () => void play(index + 1));
  }
  // A trailer takes over the speakers.
  document.addEventListener("hk:media-takeover", pause);

  // Radial spectrum around the record.
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let bins: Uint8Array<ArrayBuffer> | null = null;
  const draw = () => {
    if (el.paused || !analyser) return;
    requestAnimationFrame(draw);
    const size = canvas.clientWidth;
    if (canvas.width !== Math.round(size * dpr)) {
      canvas.width = canvas.height = Math.round(size * dpr);
    }
    bins ??= new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(bins);
    const c = canvas.width / 2;
    const r0 = canvas.width * 0.36;
    const bars = 96;
    const accent = list[index].accent;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineWidth = 2 * dpr;
    ctx.strokeStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 12 * dpr;
    for (let i = 0; i < bars; i++) {
      // Mirror the low half of the spectrum so the ring is symmetric.
      const k = i < bars / 2 ? i : bars - i;
      const v = bins[Math.floor((k / (bars / 2)) * bins.length * 0.7)] / 255;
      const len = 4 * dpr + v * v * canvas.width * 0.1;
      const a = (i / bars) * Math.PI * 2 - Math.PI / 2;
      ctx.globalAlpha = 0.35 + v * 0.65;
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
      ctx.lineTo(c + Math.cos(a) * (r0 + len), c + Math.sin(a) * (r0 + len));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  el.addEventListener("pause", () => ctx.clearRect(0, 0, canvas.width, canvas.height));
}
