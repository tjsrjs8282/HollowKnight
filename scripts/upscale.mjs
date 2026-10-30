// AI upscaling for the few images that were too small for retina screens.
// fal.ai Real-ESRGAN (anime model — clean on hand-drawn art). Run once:
// `npm run assets:upscale` (needs FAL_KEY in .env.local). Originals are kept in
// .cache/upscale so a re-run never upscales an upscale.
import sharp from "sharp";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

process.loadEnvFile(".env.local");
const KEY = process.env.FAL_KEY;
if (!KEY) throw new Error("FAL_KEY missing in .env.local");

const KEEP = ".cache/upscale";
mkdirSync(KEEP, { recursive: true });

/** asset → target scale */
const JOBS = {
  "src/assets/scenes/hornet-2.jpg": 4, // 300×168 → 1200×672
  "src/assets/scenes/quirrel-2.jpg": 4, // 400×225 → 1600×900
  "src/assets/dlc/hidden-dreams.jpg": 2, // 344×663 → 688×1326
  "src/assets/dlc/grimm-troupe.jpg": 2,
  "src/assets/dlc/lifeblood.jpg": 2,
  "src/assets/dlc/godmaster.jpg": 2,
};

/** Transparent logos: ESRGAN has no alpha, so colour and alpha are upscaled separately. */
const JOBS_RGBA = {
  "src/assets/brand/hk-logo.png": 2, // 800×350 → 1600×700
  "src/assets/brand/silksong-logo.png": 2, // 643×258 → 1286×516
};

async function esrgan(buffer, mime, scale) {
  const res = await fetch("https://fal.run/fal-ai/esrgan", {
    method: "POST",
    headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: `data:${mime};base64,${buffer.toString("base64")}`,
      scale,
      model: "RealESRGAN_x4plus_anime_6B",
      output_format: "png",
    }),
  });
  if (!res.ok) throw new Error(`fal ${res.status} ${(await res.text()).slice(0, 300)}`);
  const { image } = await res.json();
  return Buffer.from(await (await fetch(image.url)).arrayBuffer());
}

function keepOriginal(file) {
  const original = join(KEEP, file.replaceAll("/", "__"));
  if (!existsSync(original)) copyFileSync(file, original);
  return original;
}

for (const [file, scale] of Object.entries(JOBS)) {
  const original = keepOriginal(file);
  const before = await sharp(original).metadata();
  const png = await esrgan(readFileSync(original), "image/jpeg", scale);
  const info = await sharp(png).jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(file);
  console.log(`  ✓ ${file.padEnd(36)} ${before.width}×${before.height} → ${info.width}×${info.height}`);
}

for (const [file, scale] of Object.entries(JOBS_RGBA)) {
  const original = keepOriginal(file);
  const before = await sharp(original).metadata();
  // Premultiplied colour (art over black) and the alpha mask, upscaled side by side.
  const premul = await sharp(original).flatten({ background: "#000" }).png().toBuffer();
  const mask = await sharp(original).extractChannel(3).png().toBuffer();
  const [colorUp, maskUp] = await Promise.all([esrgan(premul, "image/png", scale), esrgan(mask, "image/png", scale)]);

  const c = await sharp(colorUp).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const a = await sharp(maskUp).resize(c.info.width, c.info.height).extractChannel(0).raw().toBuffer();
  const out = Buffer.alloc(c.info.width * c.info.height * 4);
  for (let i = 0, p = 0; i < a.length; i++, p += 3) {
    const alpha = a[i] < 4 ? 0 : a[i];
    const k = alpha ? 255 / alpha : 0;
    out[i * 4] = Math.min(255, c.data[p] * k);
    out[i * 4 + 1] = Math.min(255, c.data[p + 1] * k);
    out[i * 4 + 2] = Math.min(255, c.data[p + 2] * k);
    out[i * 4 + 3] = alpha;
  }
  const info = await sharp(out, { raw: { width: c.info.width, height: c.info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`  ✓ ${file.padEnd(36)} ${before.width}×${before.height} → ${info.width}×${info.height} (rgba)`);
}
