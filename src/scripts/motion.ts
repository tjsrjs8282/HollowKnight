import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { audio } from "./audio";

gsap.registerPlugin(ScrollTrigger, SplitText);

const q = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const qa = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

/** Sets the hero's pre-intro state now; returns the function that plays the intro after the gate. */
export function prepareHeroIntro(): () => void {
  const media = q("[data-hero-media]");
  const logo = q("[data-hero-logo]");
  const tag = q("[data-hero-tag]");
  const ins = qa("[data-hero-in]");
  if (!media || !logo || !tag) return () => {};

  // Letters are split for the reveal; screen readers get one intact sentence.
  const split = SplitText.create(tag, { type: "chars", aria: "hidden" });
  gsap.set(media, { autoAlpha: 0, scale: 1.18 });
  gsap.set(logo, { autoAlpha: 0, scale: 1.06, filter: "blur(18px)" });
  gsap.set(split.chars, { autoAlpha: 0, y: 14, filter: "blur(6px)" });
  gsap.set(ins, { autoAlpha: 0, y: 18 });

  return () => {
    gsap
      .timeline({ defaults: { ease: "expo.out" } })
      .to(media, { autoAlpha: 1, scale: 1, duration: 3.4, ease: "power3.out" }, 0)
      .to(logo, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 2.4, clearProps: "filter" }, 0.45)
      .add(() => logo.classList.add("is-shining"), 2.2)
      .to(split.chars, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.3, stagger: 0.035 }, 1.15)
      .to(ins, { autoAlpha: 1, y: 0, duration: 1.3, stagger: 0.09 }, 1.6);
  };
}

export function initMotion() {
  // Hero drifts up and dissolves as the page begins.
  const hero = q("#top");
  if (hero) {
    const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
    // Plain opacity, not autoAlpha: an inline `visibility` would override the
    // "not painted behind the gate" rule in Hero.astro.
    gsap.to("[data-hero-content]", { yPercent: -24, opacity: 0, ease: "none", scrollTrigger: scrub });
    gsap.to(".hero__video", { yPercent: 14, ease: "none", scrollTrigger: scrub });
    gsap.to(".hero__foot", { opacity: 0, ease: "none", scrollTrigger: { ...scrub, end: "20% top" } });
  }

  // Section titles rise out of their own line masks.
  qa("[data-split-title]").forEach((el) => {
    // Whole words read naturally, so no aria-label on the heading (prohibited there).
    const split = SplitText.create(el, { type: "lines,words", mask: "lines", aria: "none" });
    gsap.from(split.words, {
      yPercent: 115,
      duration: 1.3,
      ease: "expo.out",
      stagger: 0.07,
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
  });

  // Ornaments unfurl from the centre.
  qa("[data-ornament]").forEach((el) =>
    gsap.from(el, {
      scaleX: 0,
      autoAlpha: 0,
      duration: 1.8,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    }),
  );

  // Everything else fades up in small batches. A jump (menu, anchor) can pass
  // dozens at once, so the stagger is capped — nothing waits more than ~0.5 s.
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    batchMax: 8,
    onEnter: (els) =>
      gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: Math.min(0.1, 0.5 / els.length), overwrite: true }),
  });

  initPrologue();
  initCounters();
  initBugs();
  initJourneys();
  initSilksong();
}

/** The prologue pins and its words light up one by one as you scroll. */
function initPrologue() {
  const pin = q("[data-prologue-pin]");
  const text = q("[data-prologue-text]");
  if (!pin || !text) return;
  const split = SplitText.create(qa("p", text), { type: "words", wordsClass: "w", aria: "none" });
  let chimed = false;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 1.7)}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (self.progress > 0.97 && !chimed) {
          chimed = true;
          audio.play("soul");
        }
        if (self.progress < 0.5) chimed = false;
      },
    },
  });
  tl.to(split.words, { opacity: 1, stagger: 0.12, ease: "none", duration: 1 });
  const video = q("video", pin);
  if (video) tl.fromTo(video, { scale: 1.08 }, { scale: 1.22, ease: "none", duration: tl.duration() }, 0);
}

function initCounters() {
  qa("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const start = end > 1000 ? end - 30 : 0;
    const state = { v: start };
    el.textContent = String(start);
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () =>
        gsap.to(state, {
          v: end,
          duration: 1.9,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = String(Math.round(state.v));
          },
        }),
    });
  });
}

/** The 2020 parallax critters: idle bob, scroll depth and a little pointer drift. */
function initBugs() {
  const section = q("#journal");
  const bugs = qa("[data-bugs] img");
  if (!section || !bugs.length) return;
  const movers = bugs.map((b) => {
    const d = Number(b.dataset.depth ?? 0.5);
    gsap.to(b, { yPercent: -80 * d - 30, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.to(b, { y: 8 + d * 12, rotation: gsap.utils.random(-5, 5), duration: gsap.utils.random(2.6, 4.2), yoyo: true, repeat: -1, ease: "sine.inOut" });
    return { d, x: gsap.quickTo(b, "x", { duration: 1.4, ease: "power3.out" }) };
  });
  if (!window.matchMedia("(pointer: fine)").matches) return;
  section.addEventListener("pointermove", (e) => {
    const mx = e.clientX / window.innerWidth - 0.5;
    movers.forEach((m) => m.x(mx * -60 * m.d));
  });
}

function initJourneys() {
  const wrap = q("[data-journeys]");
  if (!wrap) return;
  const st = { trigger: wrap, start: "top 82%", once: true };
  gsap.from(".journey--knight", { xPercent: -8, autoAlpha: 0, duration: 1.6, ease: "expo.out", scrollTrigger: st });
  gsap.from(".journey--hornet", { xPercent: 8, autoAlpha: 0, duration: 1.6, ease: "expo.out", delay: 0.1, scrollTrigger: st });
}

/** Silk threads draw themselves across the section; Hornet lunges in. */
function initSilksong() {
  const section = q("#silksong");
  if (!section) return;
  gsap.to(qa("[data-thread]", section), {
    strokeDashoffset: 0,
    ease: "none",
    stagger: 0.25,
    scrollTrigger: { trigger: section, start: "top 75%", end: "bottom 45%", scrub: 1.2 },
  });
  const hornet = q("[data-hornet]", section);
  if (hornet) {
    gsap.from(hornet, {
      x: 160,
      rotate: 3,
      autoAlpha: 0,
      duration: 1.7,
      ease: "expo.out",
      scrollTrigger: { trigger: section, start: "top 62%", once: true, onEnter: () => audio.play("needle") },
    });
    gsap.fromTo(
      q("img", hornet),
      { yPercent: 6 },
      { yPercent: -6, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } },
    );
  }
}
