// GitHub Pages build: plain static files under /HollowKnight in dist/ (see astro.config.mjs).
// A Node wrapper so the env var works the same in Windows shells and in CI.
import { spawnSync } from "node:child_process";

const r = spawnSync("npx", ["astro", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DEPLOY_TARGET: "pages" },
});
process.exit(r.status ?? 1);
