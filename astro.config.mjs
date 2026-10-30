// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import vercel from "@astrojs/vercel";

// Two deploy targets from one codebase:
// - default (Vercel): static page + the Seer as an on-demand function at /api/seer
// - DEPLOY_TARGET=pages: plain static files under /HollowKnight for GitHub Pages,
//   where the Seer falls back to its built-in answers
const pages = process.env.DEPLOY_TARGET === "pages";

const site = pages
  ? "https://tjsrjs8282.github.io"
  : (process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:4321"));

/** @type {import("astro").AstroIntegration} */
const seerRoute = {
  name: "seer-route",
  hooks: {
    "astro:config:setup": ({ injectRoute }) => {
      injectRoute({ pattern: "/api/seer", entrypoint: "./src/server/seer.ts", prerender: false });
    },
  },
};

export default defineConfig({
  site,
  base: pages ? "/HollowKnight" : undefined,
  output: "static",
  adapter: pages ? undefined : vercel(),
  integrations: pages ? [] : [seerRoute],
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
    // Whether /api/seer exists in this build (false on GitHub Pages).
    define: { __SEER_ONLINE__: JSON.stringify(!pages) },
    build: {
      // GSAP + Lenis land in one shared chunk; the page itself stays tiny.
      chunkSizeWarningLimit: 700,
    },
  },
});
