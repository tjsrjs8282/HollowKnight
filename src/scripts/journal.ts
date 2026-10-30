import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { audio } from "./audio";
import { reducedMotion } from "./prefs";

/** Hunter's Journal: an accessible tab list (arrow keys, Home/End) with a page-turn transition. */
export function initJournal() {
  const root = document.querySelector<HTMLElement>("[data-journal]");
  if (!root) return;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = new Map([...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')].map((p) => [p.dataset.panel!, p]));
  let current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
  let busy: gsap.core.Timeline | null = null;

  const select = (index: number, focus = false) => {
    if (index === current || index < 0 || index >= tabs.length) return;
    const prevTab = tabs[current];
    const nextTab = tabs[index];
    const prev = panels.get(prevTab.dataset.tab!)!;
    const next = panels.get(nextTab.dataset.tab!)!;
    current = index;

    prevTab.setAttribute("aria-selected", "false");
    prevTab.tabIndex = -1;
    nextTab.setAttribute("aria-selected", "true");
    nextTab.tabIndex = 0;
    if (focus) nextTab.focus();
    // Keep the active name visible in the horizontal (mobile) strip without moving the page.
    const strip = nextTab.parentElement!;
    if (strip.scrollWidth > strip.clientWidth) {
      strip.scrollTo({ left: nextTab.offsetLeft - (strip.clientWidth - nextTab.offsetWidth) / 2, behavior: "smooth" });
    }
    audio.play("page");

    busy?.progress(1);
    if (reducedMotion()) {
      prev.hidden = true;
      next.hidden = false;
      return;
    }
    const outArt = prev.querySelector("[data-art]");
    const outLines = prev.querySelectorAll("[data-line]");
    const inArt = next.querySelector("[data-art]");
    const inLines = next.querySelectorAll("[data-line]");
    busy = gsap
      .timeline({ onComplete: () => void ScrollTrigger.refresh() })
      .to(outArt, { autoAlpha: 0, x: -36, scale: 0.96, filter: "blur(8px)", duration: 0.32, ease: "power2.in" }, 0)
      .to(outLines, { autoAlpha: 0, y: -10, duration: 0.25, stagger: 0.03, ease: "power2.in" }, 0)
      .add(() => {
        prev.hidden = true;
        gsap.set([outArt, outLines], { clearProps: "all" });
        next.hidden = false;
      })
      .fromTo(inArt, { autoAlpha: 0, x: 48, scale: 0.95, filter: "blur(12px)" }, { autoAlpha: 1, x: 0, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "expo.out", clearProps: "filter" })
      .fromTo(inLines, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: "expo.out" }, "<0.08");
  };

  tabs.forEach((tab, i) => tab.addEventListener("click", () => select(i)));
  root.querySelector('[role="tablist"]')?.addEventListener("keydown", (e) => {
    const ev = e as KeyboardEvent;
    const map: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowRight: current + 1,
      ArrowUp: current - 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(ev.key in map)) return;
    ev.preventDefault();
    select((map[ev.key] + tabs.length) % tabs.length, true);
  });
}

/** 3D tilt + moving glare on the content pack cards (fine pointers only). */
export function initTilt() {
  if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
    let frame = 0;
    card.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add("is-tilting");
        card.style.setProperty("--ry", `${px * 14}deg`);
        card.style.setProperty("--rx", `${-py * 11}deg`);
        card.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
        card.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
      });
    });
    card.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      card.classList.remove("is-tilting");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });
}

/** Store tabs (Hollow Knight / Silksong), also reachable from the Silksong section. */
export function initStores() {
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"][data-store-tab]')];
  const panels = [...document.querySelectorAll<HTMLElement>("[data-store-panel]")];
  const select = (key: string, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.storeTab === key;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach((p) => (p.hidden = p.dataset.storePanel !== key));
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t.dataset.storeTab!));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      select(tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length].dataset.storeTab!, true);
    });
  });
  document.querySelectorAll<HTMLElement>("[data-store-jump]").forEach((a) =>
    a.addEventListener("click", () => select(a.dataset.storeJump!)),
  );
}
