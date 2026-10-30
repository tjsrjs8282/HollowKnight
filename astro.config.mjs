// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import vercel from "@astrojs/vercel";

const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:4321");

export default defineConfig({
  site,
  // The page is fully static; only /api/seer runs on demand (Vercel function).
  output: "static",
  adapter: vercel(),
  compressHTML: true,
  devToolbar: { enabled: false },

  env: {
    schema: {
      GEMINI_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      GEMINI_MODEL: envField.string({ context: "server", access: "public", optional: true, default: "gemini-3.5-flash-lite" }),
    },
  },

  fonts: [
    {
      name: "Cinzel",
      cssVariable: "--font-display",
      provider: fontProviders.google(),
      // Variable font: one file per subset covers every weight we use.
      weights: ["400 700"],
      styles: ["normal"],
      subsets: ["latin"],
      // No generic fallback here: Cinzel has no Hangul, so the stack must fall
      // through to Noto Serif KR (see --font-display-stack), not to system serif.
      fallbacks: [],
    },
    {
      name: "Noto Serif KR",
      cssVariable: "--font-serif",
      provider: fontProviders.google(),
      // Hangul ships as ~120 unicode-range slices; a variable weight range keeps
      // that to one @font-face per slice instead of one per slice per weight.
      weights: ["400 700"],
      styles: ["normal"],
      fallbacks: ["Batang", "AppleMyungjo", "serif"],
    },
  ],

  image: {
    responsiveStyles: false,
  },

  vite: {
    build: {
      // GSAP + Lenis land in one shared chunk; the page itself stays tiny.
      chunkSizeWarningLimit: 700,
    },
  },
});
