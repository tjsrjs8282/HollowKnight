// Social card + app icons, composed from the project's own art (sharp).
// Run once: `npm run assets:og`.
import sharp from "sharp";
import { readFileSync } from "node:fs";

const W = 1200;
const H = 630;

const shade = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="v" cx="50%" cy="46%" r="70%">
      <stop offset="0%" stop-color="#05070c" stop-opacity="0.35"/>
      <stop offset="65%" stop-color="#05070c" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#05070c" stop-opacity="0.96"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);

const logo = await sharp("src/assets/brand/hk-logo.png").resize({ width: 760 }).toBuffer();
const { height: logoH } = await sharp(logo).metadata();

await sharp("src/assets/bg/forest.jpg")
  .resize(W, H, { fit: "cover", position: "attention" })
  .modulate({ saturation: 0.85, brightness: 0.9 })
  .composite([
    { input: shade },
    { input: logo, left: Math.round((W - 760) / 2), top: Math.round((H - logoH) / 2) - 14 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile("public/og.jpg");
console.log("  ✓ public/og.jpg");

// Icons from the SVG mask, on the site's night-blue so they read on any tab bar.
const svg = readFileSync("public/favicon.svg");
const icon = async (size, out, pad = 0.16) => {
  const inner = Math.round(size * (1 - pad * 2));
  const mask = await sharp(svg, { density: 512 }).resize(inner, inner).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#070a12" } })
    .composite([{ input: mask, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  ✓ ${out}`);
};
await icon(180, "public/apple-touch-icon.png");
await icon(512, "public/icon-512.png");
await sharp(svg, { density: 256 }).resize(32, 32).png().toFile("public/favicon-32.png");
console.log("  ✓ public/favicon-32.png");
