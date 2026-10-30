import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Section } from "../data/sections";

/**
 * The HUD reads the page like the game reads the Knight: the soul vessel fills
 * with scroll progress, and the masks fill up to the section on screen.
 */
export function initHud(sections: Section[], onTheme: (theme: Section["theme"]) => void) {
  const hud = document.querySelector<HTMLElement>("[data-hud]");
  const vessel = hud?.querySelector<SVGElement>(".vessel");
  const masks = [...document.querySelectorAll<HTMLAnchorElement>("[data-mask]")];
  if (!hud) return;

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      vessel?.style.setProperty("--fill", self.progress.toFixed(4));
      hud.style.setProperty("--hud-shade", self.scroll() > 60 ? "1" : "0");
    },
  });

  let current = -1;
  const setCurrent = (index: number) => {
    if (index === current) return;
    current = index;
    masks.forEach((m, i) => {
      m.classList.toggle("is-filled", i <= index);
      m.classList.toggle("is-current", i === index);
      if (i === index) m.setAttribute("aria-current", "true");
      else m.removeAttribute("aria-current");
    });
    onTheme(sections[index].theme);
  };

  sections.forEach((s, i) => {
    const el = document.getElementById(s.id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => {
        if (self.isActive) setCurrent(i);
      },
    });
  });
  setCurrent(0);
}
