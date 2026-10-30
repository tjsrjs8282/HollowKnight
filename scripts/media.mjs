// Video / audio pipeline (ffmpeg). Run once: `npm run assets`.
// The 2020 site streamed a 14.5 MB trailer as a background and autoplayed MP3s.
// Here every clip is cut, graded and encoded for the one job it does on the page.
import { spawnSync } from "node:child_process";
import { mkdirSync, copyFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const SRC = "legacy/images";
const OUT = "public/media";
const AUDIO = "public/audio";
mkdirSync(OUT, { recursive: true });
mkdirSync(join(AUDIO, "ost"), { recursive: true });

function ff(args, label) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${label}`);
  const file = args.at(-1);
  console.log(`  ✓ ${label.padEnd(28)} ${(statSync(file).size / 1024).toFixed(0).padStart(6)} KB  ${file}`);
}

/**
 * Montage of [start, end] segments joined with crossfades, faded in/out from
 * black so the loop point is a breath rather than a jump cut.
 */
function montageGraph(segments, { fps = 24, w = 1280, h = 720, xf = 0.8, crop = null, grade = "" }) {
  const parts = [];
  segments.forEach(([s, e], i) => {
    const cropF = crop ? `${crop},` : "";
    parts.push(
      `[0:v]trim=${s}:${e},setpts=PTS-STARTPTS,fps=${fps},${cropF}scale=${w}:${h}:flags=lanczos,setsar=1${grade ? "," + grade : ""}[s${i}]`,
    );
  });
  let acc = "s0";
  let len = segments[0][1] - segments[0][0];
  for (let i = 1; i < segments.length; i++) {
    const offset = (len - xf).toFixed(3);
    const out = i === segments.length - 1 ? "mx" : `x${i}`;
    parts.push(`[${acc}][s${i}]xfade=transition=fade:duration=${xf}:offset=${offset}[${out}]`);
    len = len + (segments[i][1] - segments[i][0]) - xf;
    acc = out;
  }
  const fadeOut = (len - 0.7).toFixed(3);
  parts.push(`[${acc}]fade=t=in:st=0:d=0.7,fade=t=out:st=${fadeOut}:d=0.7,format=yuv420p[v]`);
  return { graph: parts.join(";"), duration: len };
}

function encodeLoop(input, name, segments, opts = {}) {
  const { graph, duration } = montageGraph(segments, opts);
  console.log(`\n▸ ${name} (${duration.toFixed(1)}s loop)`);
  const common = ["-i", input, "-filter_complex", graph, "-map", "[v]", "-an"];
  ff([...common, "-c:v", "libx264", "-preset", "slow", "-crf", String(opts.crf ?? 26), "-profile:v", "high",
    "-movflags", "+faststart", "-tune", "film", join(OUT, `${name}.mp4`)], `${name}.mp4 (H.264)`);
  ff([...common, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(opts.vp9crf ?? 38), "-row-mt", "1",
    "-deadline", "good", "-cpu-used", "2", join(OUT, `${name}.webm`)], `${name}.webm (VP9)`);
  return duration;
}

// The trailer's timestamps are broken (VFR + bad refs): seeking lands seconds off.
// A constant-rate intermediate makes every cut below frame-accurate.
mkdirSync(".cache", { recursive: true });
const HK = ".cache/hk_cfr.mp4";
if (!existsSync(HK)) {
  ff(["-i", `${SRC}/Hollow_Knight_Trailer.mp4`, "-map", "0:v:0", "-vf", "fps=24", "-c:v", "libx264",
    "-preset", "veryfast", "-crf", "14", "-g", "12", "-an", HK], "trailer → CFR intermediate");
}

// ── 1. Hero: the calm, misty shots of the "Beneath and Beyond" trailer — no logo cards, no UI.
const HERO_CUT = [
  [0.0, 6.3], // lamp post in the mist → the wing → the Knight in the grass
  [10.5, 12.9], // misty lamps
  [16.5, 19.4], // Fog Canyon jellyfish
  [23.0, 25.9], // City of Tears
  [29.5, 32.0], // Blue Lake
  [66.0, 70.8], // teal ruins
];
encodeLoop(HK, "hero", HERO_CUT, { crf: 27, vp9crf: 40, grade: "eq=saturation=0.92:contrast=1.04" });

// Small-screen variant: half the pixels, same cut.
{
  const { graph } = montageGraph(HERO_CUT, { w: 854, h: 480, grade: "eq=saturation=0.92:contrast=1.04" });
  ff(["-i", HK, "-filter_complex", graph, "-map", "[v]", "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "29", "-movflags", "+faststart", join(OUT, "hero-480.mp4")], "hero-480.mp4 (mobile)");
}
ff(["-ss", "1.6", "-i", join(OUT, "hero.mp4"), "-frames:v", "1", "-q:v", "3", join(OUT, "hero-poster.jpg")], "hero-poster.jpg");

// ── 2. Silksong: the quiet shots between the title cards, HUD cropped off the top-left.
encodeLoop(`${SRC}/Hollow Knight Silksong - Announcement Trailer - Nintendo Switch.mp4`, "silksong", [
  [26.0, 29.0], // coral cliffs
  [57.0, 60.2], // falling petals in the cage
  [76.0, 78.2], // moonlit bridge
  [78.4, 80.9], // warm hall
  [54.0, 56.8], // blue-pink hall
], { w: 1024, h: 576, xf: 0.6, crf: 29, vp9crf: 42, crop: "crop=iw*0.8:ih*0.8:iw*0.2:ih*0.2", grade: "eq=saturation=1.05" });
ff(["-ss", "2.0", "-i", join(OUT, "silksong.mp4"), "-frames:v", "1", "-q:v", "3", join(OUT, "silksong-poster.jpg")], "silksong-poster.jpg");

// ── 3. Prologue: the void-tentacle GIF (700 KB) as a tiny looping video.
console.log("\n▸ prologue loop");
ff(["-i", `${SRC}/section1_back.gif`, "-vf", "fps=20,scale=640:-2:flags=lanczos,format=yuv420p", "-an",
  "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-movflags", "+faststart", join(OUT, "prologue.mp4")], "prologue.mp4");
ff(["-i", `${SRC}/section1_back.gif`, "-vf", "fps=20,scale=640:-2:flags=lanczos,format=yuv420p", "-an",
  "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", join(OUT, "prologue.webm")], "prologue.webm");

// ── 4. Soundtrack: same tracks, honest names (the old player called "Hornet" a Silksong track).
console.log("\n▸ soundtrack");
const tracks = [
  ["EnterHallownest.mp3", "enter-hallownest.mp3"],
  ["Hornet.mp3", "hornet.mp3"],
  ["The Grimm Troupe.mp3", "the-grimm-troupe.mp3"],
];
for (const [from, to] of tracks) {
  const dest = join(AUDIO, "ost", to);
  if (!existsSync(dest)) copyFileSync(join(SRC, from), dest);
  console.log(`  ✓ ${to.padEnd(28)} ${(statSync(dest).size / 1024).toFixed(0).padStart(6)} KB`);
}
console.log("\nDone.");
