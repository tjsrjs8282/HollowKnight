import { gsap } from "gsap";
import { reducedMotion } from "./prefs";
import { withBase } from "../lib/paths";

/** Resolve when an image (by URL or element) has loaded or failed — loading must never stall the gate. */
function imageReady(src: string | HTMLImageElement | null): Promise<void> {
  return new Promise((resolve) => {
    if (!src) return resolve();
    const img = typeof src === "string" ? Object.assign(new Image(), { src }) : src;
    if (img.complete && img.naturalWidth) return resolve();
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

/**
 * The title gate: "enter with sound / enter silently" is offered right away —
 * the user gesture that unlocks audio — while a soul vessel fills as the hero's
 * assets arrive behind it. Nobody waits at the door.
 */
export function initGate(onEnter: (withSound: boolean) => Promise<void> | void) {
  const gate = document.querySelector<HTMLElement>("[data-gate]");
  if (!gate) return;
  const vessel = gate.querySelector<SVGElement>(".vessel");
  const percent = gate.querySelector<HTMLElement>("[data-gate-percent]");
  const status = gate.querySelector<HTMLElement>("[data-gate-status]");
  const reduce = reducedMotion();

  const tasks: Promise<unknown>[] = [
    document.fonts?.ready ?? Promise.resolve(),
    imageReady(withBase("media/hero-poster.jpg")),
    imageReady(document.querySelector<HTMLImageElement>("[data-hero-logo] img")),
    new Promise((r) => setTimeout(r, reduce ? 0 : 900)),
  ];
  const progress = { value: 0 };
  let done = 0;
  const render = () => {
    const v = Math.round(progress.value);
    if (percent) percent.textContent = String(v);
    vessel?.style.setProperty("--fill", String(progress.value / 100));
  };
  tasks.forEach((t) =>
    t.finally(() => {
      done++;
      gsap.to(progress, { value: (done / tasks.length) * 100, duration: reduce ? 0 : 0.6, ease: "power2.out", onUpdate: render });
    }),
  );

  gate.querySelector<HTMLButtonElement>("[data-gate-enter]")?.focus({ preventScroll: true });
  // The vessel tops up within four seconds whatever the network does.
  Promise.race([Promise.allSettled(tasks), new Promise((r) => setTimeout(r, 4000))]).then(() => {
    gsap.to(progress, { value: 100, duration: reduce ? 0 : 0.5, onUpdate: render });
    gsap.to(status, { autoAlpha: 0, duration: 0.4, delay: 0.4 });
  });

  let entered = false;
  gate.querySelectorAll<HTMLButtonElement>("[data-gate-enter]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (entered) return;
      entered = true;
      const withSound = btn.dataset.gateEnter === "sound";
      const leave = gsap.timeline({
        onComplete: () => {
          gate.remove();
          document.documentElement.classList.remove("is-gated");
        },
      });
      leave
        .to(gate.querySelector(".gate__inner"), { autoAlpha: 0, y: -10, scale: 0.98, duration: reduce ? 0 : 0.6, ease: "power2.in" })
        .to(gate, { autoAlpha: 0, duration: reduce ? 0 : 1.1, ease: "power2.inOut" }, reduce ? 0 : 0.35);
      await onEnter(withSound);
    }),
  );
}
