/** Viewer preferences, persisted per browser. Storage can throw (private mode) — never fatal. */
export type PrefKey = "sound" | "motion" | "frame";

const KEYS: Record<PrefKey, string> = { sound: "hk:sound", motion: "hk:motion", frame: "hk:frame" };
const listeners = new Map<PrefKey, Set<(v: boolean) => void>>();

function read(key: PrefKey): string | null {
  try {
    return localStorage.getItem(KEYS[key]);
  } catch {
    return null;
  }
}

function defaults(key: PrefKey): boolean {
  if (key === "motion") return !document.documentElement.classList.contains("reduce-motion");
  if (key === "frame") return true;
  return false;
}

export const prefs = {
  get(key: PrefKey): boolean {
    const raw = read(key);
    if (key === "motion") return raw === null ? defaults(key) : raw === "full";
    if (raw === null) return defaults(key);
    return raw === "on";
  },
  set(key: PrefKey, value: boolean) {
    try {
      localStorage.setItem(KEYS[key], key === "motion" ? (value ? "full" : "reduced") : value ? "on" : "off");
    } catch {
      /* private mode: keep it for this page view only */
    }
    listeners.get(key)?.forEach((fn) => fn(value));
  },
  on(key: PrefKey, fn: (v: boolean) => void) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(fn);
  },
};

export const reducedMotion = () => document.documentElement.classList.contains("reduce-motion");
