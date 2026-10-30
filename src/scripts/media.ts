import { reducedMotion } from "./prefs";

type NetInfo = { saveData?: boolean; effectiveType?: string };
const lowData = () => {
  const c = (navigator as Navigator & { connection?: NetInfo }).connection;
  return Boolean(c?.saveData || /(^|-)2g$/.test(c?.effectiveType ?? ""));
};

function addSources(video: HTMLVideoElement, list: string) {
  for (const src of list.split("|")) {
    const s = document.createElement("source");
    s.src = src;
    s.type = src.endsWith(".webm") ? 'video/webm; codecs="vp9"' : "video/mp4";
    video.append(s);
  }
  video.load();
}

/** Background loops only play while on screen; posters stand in for low-data and reduced-motion. */
function playWhileVisible(video: HTMLVideoElement, margin = "0px") {
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    },
    { rootMargin: margin },
  ).observe(video);
}

/**
 * The hero loop starts downloading once the page itself has loaded (or the gate
 * opens, if that is sooner) so it never competes with fonts and the logo.
 * `start()` begins playback when the gate opens.
 */
export function initHeroVideo() {
  const video = document.querySelector<HTMLVideoElement>("[data-hero-video]");
  if (!video || reducedMotion() || lowData()) return { start() {} };
  let attached = false;
  const attach = () => {
    if (attached) return;
    attached = true;
    const small = window.matchMedia("(max-width: 720px)").matches;
    addSources(video, (small ? video.dataset.srcMobile : video.dataset.srcDesktop) ?? "");
  };
  if (document.readyState === "complete") attach();
  else window.addEventListener("load", attach, { once: true });
  video.addEventListener("playing", () => video.classList.add("is-playing"), { once: true });
  return {
    start: () => {
      attach();
      playWhileVisible(video);
    },
  };
}

/**
 * Below-the-fold media waits until it is close: posters, background loops and
 * large CSS backgrounds (`data-lazy-bg="--var|url"`) are attached ~one screen early.
 */
export function initLazyVideos() {
  const animate = !reducedMotion() && !lowData();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        if (el instanceof HTMLVideoElement) {
          if (el.dataset.poster) el.poster = el.dataset.poster;
          if (animate) {
            addSources(el, el.dataset.lazyVideo ?? "");
            playWhileVisible(el, "100px");
          }
        } else if (el.dataset.lazyBg) {
          const [prop, url] = el.dataset.lazyBg.split("|");
          el.style.setProperty(prop, `url("${url}")`);
        }
      }
    },
    { rootMargin: "600px 0px" },
  );
  document.querySelectorAll<HTMLElement>("video[data-lazy-video], [data-lazy-bg]").forEach((el) => io.observe(el));
}
