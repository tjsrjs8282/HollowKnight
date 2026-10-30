import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Section } from "../data/sections";
import { audio } from "./audio";
import { prefs, reducedMotion } from "./prefs";
import { initAnchors, initSmoothScroll, lenis } from "./scroll";
import { initGate } from "./gate";
import { initHud } from "./hud";
import { initMenu, initVideoDialog } from "./dialogs";
import { initHeroVideo } from "./media";

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
root.classList.add("app-ready");

const sections: Section[] = JSON.parse(document.getElementById("sections-data")?.textContent ?? "[]");
const reduce = reducedMotion();

/** Run when the main thread is free — the gate must stay responsive on slow phones. */
const idle = (fn: () => void) => {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(fn, { timeout: 1200 });
  else setTimeout(fn, 200);
};

// Heavy feature modules are split out and fetched after first paint.
const motionModule = reduce ? null : import("./motion");
const motesModule = reduce ? null : import("./motes");
type Motes = Awaited<ReturnType<typeof import("./motes")["initMotes"]>>;
let motes: Motes | null = null;

// Settings that can change at runtime (menu toggles).
const soundToggle = document.querySelector<HTMLButtonElement>("[data-sound-toggle]");
const soundLabel = soundToggle?.querySelector("[data-sound-label]");
const applySound = (on: boolean) => {
  void audio.setEnabled(on);
  soundToggle?.setAttribute("aria-pressed", String(on));
  if (soundLabel) soundLabel.textContent = on ? "사운드 끄기" : "사운드 켜기";
};
const applyMotion = (on: boolean) => {
  root.classList.toggle("reduce-motion", !on);
  root.classList.toggle("js-motion", on);
  motes?.setEnabled(on);
  if (on) lenis?.start();
};
const applyFrame = (on: boolean) => root.classList.toggle("no-frame", !on);
applyFrame(prefs.get("frame"));

soundToggle?.addEventListener("click", () => {
  const next = soundToggle.getAttribute("aria-pressed") !== "true";
  prefs.set("sound", next);
  applySound(next);
  if (next) audio.play("select");
});

// Hover / click feedback for anything interactive.
document.addEventListener("pointerover", (e) => {
  if ((e as PointerEvent).pointerType !== "mouse") return;
  const target = (e.target as Element).closest("a, button, [role='tab'], input[type='checkbox'] + span");
  const from = (e as PointerEvent).relatedTarget as Element | null;
  if (target && !target.contains(from)) audio.play("hover");
});
document.addEventListener("click", (e) => {
  const target = (e.target as Element).closest("a, button");
  if (!target || target.closest("[data-gate], [data-menu-open], [data-video-open], [data-sound-toggle], [role='tab'], [data-track]")) return;
  audio.play("select");
});

initSmoothScroll();
initAnchors();
initMenu({ sound: applySound, motion: applyMotion, frame: applyFrame });
initVideoDialog();
const heroVideo = initHeroVideo();

// Everything below the hero wakes up once fonts have settled the layout.
document.fonts.ready.then(() =>
  idle(async () => {
    const [{ initJournal, initTilt, initStores }, { initPlayer }, { initSeer }, { initLazyVideos }] = await Promise.all([
      import("./journal"),
      import("./player"),
      import("./seer"),
      import("./media"),
    ]);
    initJournal();
    initTilt();
    initStores();
    initPlayer();
    initSeer();
    initLazyVideos();
    (await motionModule)?.initMotion();
    initHud(sections, (theme) => motes?.setTheme(theme));
    ScrollTrigger.refresh();
  }),
);

initGate(async (withSound) => {
  // Hero state is staged in the same frame it becomes paintable (see Hero.astro).
  const motion = await motionModule;
  const playIntro = motion?.prepareHeroIntro() ?? (() => {});
  root.classList.add("is-entered");
  prefs.set("sound", withSound);
  applySound(withSound);
  heroVideo.start();
  lenis?.start();
  window.setTimeout(playIntro, reduce ? 0 : 250);
  motesModule?.then(({ initMotes }) => {
    motes = initMotes();
  });
  if (withSound) {
    // Wait for the buffers so the threshold sound actually lands.
    await audio.setEnabled(true);
    audio.play("enter");
  }
  // Arriving from a shared #anchor link: go there once the door is open.
  if (location.hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) window.setTimeout(() => target.scrollIntoView(), 50);
  }
});
