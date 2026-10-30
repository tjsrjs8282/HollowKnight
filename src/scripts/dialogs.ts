import { audio } from "./audio";
import { lockScroll, scrollToTarget } from "./scroll";
import { prefs, type PrefKey } from "./prefs";

/** Close a <dialog> with its CSS exit animation first. */
function closeAnimated(dialog: HTMLDialogElement, after?: () => void) {
  if (!dialog.open || dialog.classList.contains("is-closing")) return;
  dialog.classList.add("is-closing");
  const finish = () => {
    dialog.classList.remove("is-closing");
    dialog.close();
    after?.();
  };
  const reduce = document.documentElement.classList.contains("reduce-motion");
  if (reduce) finish();
  else dialog.addEventListener("animationend", finish, { once: true });
}

export function initMenu(apply: Record<PrefKey, (on: boolean) => void>) {
  const menu = document.querySelector<HTMLDialogElement>("[data-menu]");
  if (!menu) return;

  const open = () => {
    if (menu.open) return;
    menu.querySelectorAll<HTMLInputElement>("[data-setting]").forEach((input) => {
      input.checked = prefs.get(input.dataset.setting as PrefKey);
    });
    menu.showModal();
    lockScroll(true);
    audio.play("open");
  };
  const close = (after?: () => void) => {
    audio.play("close");
    closeAnimated(menu, () => {
      lockScroll(false);
      after?.();
    });
  };

  document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", open));
  menu.querySelector("[data-menu-close]")?.addEventListener("click", () => close());
  menu.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  menu.addEventListener("click", (e) => {
    if (e.target === menu) close();
  });

  menu.querySelectorAll<HTMLAnchorElement>("[data-menu-link]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = a.getAttribute("href")!;
      close(() => scrollToTarget(target));
    }),
  );

  menu.querySelectorAll<HTMLInputElement>("[data-setting]").forEach((input) =>
    input.addEventListener("change", () => {
      const key = input.dataset.setting as PrefKey;
      prefs.set(key, input.checked);
      apply[key](input.checked);
      audio.play("select");
    }),
  );
}

/** Trailers open in a dialog; the YouTube iframe exists only while it is open. */
export function initVideoDialog() {
  const dialog = document.querySelector<HTMLDialogElement>("[data-video-dialog]");
  const player = dialog?.querySelector<HTMLElement>("[data-video-player]");
  const heading = dialog?.querySelector<HTMLElement>("[data-video-heading]");
  if (!dialog || !player || !heading) return;

  const close = () => {
    closeAnimated(dialog, () => {
      player.replaceChildren();
      lockScroll(false);
      audio.duck(false);
    });
    audio.play("close");
  };

  document.addEventListener("click", (e) => {
    const trigger = (e.target as Element).closest<HTMLElement>("[data-video-open]");
    if (!trigger) return;
    const id = trigger.dataset.videoOpen!;
    const title = trigger.dataset.videoTitle ?? "Trailer";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
    iframe.title = title;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    player.replaceChildren(iframe);
    heading.textContent = title;
    document.dispatchEvent(new CustomEvent("hk:media-takeover"));
    dialog.showModal();
    lockScroll(true);
    audio.duck(true);
    audio.play((trigger.dataset.sfxOpen as "needle" | undefined) ?? "open");
  });

  dialog.querySelector("[data-video-close]")?.addEventListener("click", close);
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });
}
