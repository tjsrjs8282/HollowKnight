// Original sound design, generated with ElevenLabs sound-generation and
// mastered with ffmpeg. Run once: `npm run assets:sfx` (needs ELEVENLABS_API_KEY
// in .env.local). Already-generated takes in .cache/sfx are reused.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

process.loadEnvFile(".env.local");
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) throw new Error("ELEVENLABS_API_KEY missing in .env.local");

const RAW = ".cache/sfx";
const OUT = "public/audio/sfx";
mkdirSync(RAW, { recursive: true });
mkdirSync(OUT, { recursive: true });

/** name → prompt, seconds, prompt influence, mastering target (LUFS), channels */
const SOUNDS = {
  hover: {
    text: "A single delicate glass chime, very soft and very short, a tiny sparkle of light, subtle fantasy UI hover tick, clean",
    sec: 0.6, pi: 0.6, lufs: -26, ch: 1,
  },
  select: {
    text: "Soft resonant pluck of a crystal harp with a faint airy shimmer, elegant dark fantasy menu confirm sound, short",
    sec: 1.0, pi: 0.55, lufs: -21, ch: 1,
  },
  open: {
    text: "Gentle whoosh of dark heavy cloth unfolding with a faint magical shimmer, cinematic UI menu opening",
    sec: 1.2, pi: 0.5, lufs: -23, ch: 1,
  },
  close: {
    text: "Soft quick reverse whoosh of velvet cloth folding shut, subtle, cinematic UI menu closing",
    sec: 0.8, pi: 0.5, lufs: -24, ch: 1,
  },
  page: {
    text: "Soft rustle of an old parchment journal page turning, quiet and close",
    sec: 0.8, pi: 0.6, lufs: -24, ch: 1,
  },
  needle: {
    text: "Fast thin needle swish slicing through air followed by a taut silk thread whip, sharp, short",
    sec: 0.7, pi: 0.6, lufs: -22, ch: 1,
  },
  enter: {
    text: "Deep cinematic sub-bass boom with a long cavernous reverb tail and a faint ethereal choir shimmer rising, entering an ancient underground kingdom",
    sec: 5.0, pi: 0.45, lufs: -18, ch: 2,
  },
  seer: {
    text: "Dreamy moth wings fluttering with soft distant bells and a gentle magical shimmer, mystical and calm",
    sec: 2.0, pi: 0.5, lufs: -22, ch: 2,
  },
  soul: {
    text: "Ethereal soul energy being absorbed, a soft rising airy shimmer that blooms into a warm glow, magical",
    sec: 1.4, pi: 0.5, lufs: -22, ch: 2,
  },
  ambience: {
    text: "Dark underground cavern ambience, slow distant water droplets echoing in a vast cave, soft low wind drone, faint mysterious hum, calm, no music, no voices",
    sec: 22, pi: 0.4, lufs: -27, ch: 2, loop: true,
  },
};

async function generate(name, s) {
  const raw = join(RAW, `${name}.mp3`);
  if (existsSync(raw)) return raw;
  const body = { text: s.text, duration_seconds: s.sec, prompt_influence: s.pi, model_id: "eleven_text_to_sound_v2" };
  if (s.loop) body.loop = true;
  const url = "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128";
  let res = await fetch(url, { method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok && (res.status === 400 || res.status === 422)) {
    // Older accounts/models reject `loop` or `model_id` — retry with the plain request.
    const { loop, model_id, ...plain } = body;
    res = await fetch(url, { method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" }, body: JSON.stringify(plain) });
  }
  if (!res.ok) throw new Error(`${name}: ElevenLabs ${res.status} ${(await res.text()).slice(0, 200)}`);
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
  return raw;
}

function master(name, s, raw) {
  const out = join(OUT, `${name}.mp3`);
  const lead = "silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.01";
  const norm = `loudnorm=I=${s.lufs}:TP=-1.5:LRA=11`;
  let args;
  if (s.loop) {
    // Seamless bed: crossfade the last 2 s back into the first 2 s.
    const c = 2;
    args = ["-i", raw, "-filter_complex",
      `[0:a]${norm},asplit[a][b];[a]atrim=${c},asetpts=PTS-STARTPTS[main];[b]atrim=0:${c},asetpts=PTS-STARTPTS[head];[main][head]acrossfade=d=${c}:c1=tri:c2=tri[o]`,
      "-map", "[o]", "-ac", String(s.ch), "-c:a", "libmp3lame", "-b:a", "112k", out];
  } else {
    args = ["-i", raw, "-af", `${lead},${norm},afade=t=out:st=${Math.max(0, s.sec - 0.06)}:d=0.06`,
      "-ac", String(s.ch), "-ar", "44100", "-c:a", "libmp3lame", "-b:a", s.ch === 1 ? "96k" : "128k", out];
  }
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg mastering failed: ${name}`);
  return out;
}

for (const [name, s] of Object.entries(SOUNDS)) {
  const raw = await generate(name, s);
  const out = master(name, s, raw);
  console.log(`  ✓ ${name.padEnd(9)} ${String(s.sec + "s").padEnd(5)} ${(statSync(out).size / 1024).toFixed(0).padStart(4)} KB  → ${out}`);
}
