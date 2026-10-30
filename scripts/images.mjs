// Image pipeline (sharp). Run once: `npm run assets`.
// Copies the 2020 images into `src/assets` with real names, flattens opaque PNGs
// to high-quality JPEG sources, trims the floating-critter sprites out of their
// 1920×1080 transparent canvases and records where they sat. Astro then builds
// AVIF/WebP variants at every width the page asks for.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SRC = "legacy/images";
const DEST = "src/assets";

const MAP = {
  "brand/hk-logo.png": "fixed_logo.png",
  "brand/silksong-logo.png": "silksong_logo.png",
  "brand/team-cherry.png": "tc.png",

  "ornament/divider-top.png": "text_top_after.png",
  "ornament/divider-bottom.png": "text_bottom_before.png",
  "ornament/menu-top.png": "menu_top.png",
  "ornament/menu-bottom.png": "menu_bottom.png",
  "ornament/pointer-left.png": "left_hover.png",
  "ornament/pointer-right.png": "right_hover.png",
  "ornament/frame.png": "fixed_line.png",

  "characters/knight.png": "knight_ct.png",
  "characters/hornet.png": "hornet_ct.png",
  "characters/quirrel.png": "Quirrel_ct.png",
  "characters/zote.png": "zote_ct.png",
  "characters/mantis-lords.png": "Mantis-Lords_ct.png",
  "characters/false-knight.png": "false_ct.png",
  "characters/dung-defender.png": "dung_ct.png",
  "characters/soul-master.png": "soul_ct.png",
  "characters/broken-vessel.png": "broken_ct.png",

  "scenes/knight-1.jpg": "knight1.jpg",
  "scenes/knight-2.jpg": "knight2.jpg",
  "scenes/hornet-1.jpg": "hornet2.jpg",
  "scenes/hornet-2.jpg": "hornet1.jpg",
  "scenes/quirrel-1.jpg": "quirrel2.jpg",
  "scenes/quirrel-2.jpg": "quirrel1.jpg",
  "scenes/zote-1.jpg": "zote1.jpg",
  "scenes/zote-2.jpg": "zote2.jpg",
  "scenes/mantis-lords-1.jpg": "Mantis-Lords1.jpg",
  "scenes/mantis-lords-2.jpg": "Mantis-Lords2.jpg",
  "scenes/false-knight-1.jpg": "false2.jpg",
  "scenes/false-knight-2.jpg": "false1.jpg",
  "scenes/dung-defender-1.jpg": "dung1.jpg",
  "scenes/dung-defender-2.jpg": "dung2.jpg",
  "scenes/soul-master-1.jpg": "soul1.jpg",
  "scenes/soul-master-2.jpg": "soul2.jpg",
  "scenes/broken-vessel-1.jpg": "broken1.jpg",
  "scenes/broken-vessel-2.jpg": "broken2.jpg",

  "dlc/hidden-dreams.jpg": "content1_off.png",
  "dlc/grimm-troupe.jpg": "content2_off.png",
  "dlc/lifeblood.jpg": "content3_off.png",
  "dlc/godmaster.jpg": "content4_off.png",

  "ost/hollow-knight.png": "hollowOst.png",
  "ost/hornet.png": "honetOst.png",
  "ost/gods-nightmares.png": "godsOst.png",

  "bg/ensemble.jpg": "character_back2.jpg",
  "bg/ensemble-portrait.jpg": "character_back3.jpg",
  "bg/wallpaper.jpg": "Wallpaper-Hollow-Knight.jpg",
  "bg/forest.jpg": "content_back.png",
  "bg/void.jpg": "content_back2.png",
  "bg/silksong-fire.jpg": "news_silksong.jpg",
  "bg/blue-lake.jpg": "footer_back.png",
  "bg/city-of-tears.jpg": "footer_back2.jpg",
  "bg/split-knight.jpg": "mobile_hollow.png",
  "bg/split-hornet.jpg": "mobile_silksong.png",
  "bg/light-rays.png": "ct_light.png",
  "bg/dust.png": "ft_parallax4.png",

  "art/hornet-needle.png": "silk_start_hover.png",
  "art/knight-stand.png": "hollow_start.png",
  "art/shade.png": "hollow_gost.png",
  "art/kingsoul.png": "Kingsoul.png",
  "art/void-heart.png": "Void_Heart.png",

  "stores/switch.png": "store_logos__0000_Layer-7.png",
  "stores/xbox.png": "store_logos__0002_Layer-5.png",
  "stores/humble.png": "store_logos__0003_Layer-4.png",
  "stores/steam.png": "store_logos__0004_Layer-8.png",
  "stores/playstation.png": "store_logos__0005_Layer-2.png",
  "stores/gog.png": "store_logos__0006_Layer-3.png",
  "stores/fangamer.png": "logos__0002_1.png",
  "stores/yetee.png": "logos__0001_2.png",
};

async function hasRealAlpha(img) {
  const { channels, isOpaque } = await img.stats();
  return channels.length === 4 && !isOpaque;
}

let total = 0;
for (const [to, from] of Object.entries(MAP)) {
  const out = join(DEST, to);
  mkdirSync(dirname(out), { recursive: true });
  const img = sharp(join(SRC, from));
  const alpha = await hasRealAlpha(img.clone());
  let pipeline = img.clone();
  if (to.endsWith(".jpg")) {
    // Opaque art → high-quality JPEG source (Astro re-encodes to AVIF/WebP per size).
    pipeline = pipeline.flatten({ background: "#000" }).jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" });
  } else {
    pipeline = pipeline.png({ compressionLevel: 9, effort: 10, palette: false });
  }
  const info = await pipeline.toFile(out);
  total += info.size;
  console.log(`  ✓ ${to.padEnd(34)} ${String(info.width + "×" + info.height).padEnd(10)} ${(info.size / 1024).toFixed(0).padStart(5)} KB${alpha && to.endsWith(".jpg") ? "  (alpha flattened)" : ""}`);
}

// The Hornet key art came with a reseller's stamp in its empty bottom-left
// corner (below the art) — crop the canvas above it.
{
  const file = join(DEST, "art/hornet-needle.png");
  const buf = await sharp(file).extract({ left: 0, top: 0, width: 2381, height: 1548 }).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(file, buf);
  console.log("  ✓ art/hornet-needle.png cropped to 2381×1548");
}

// Floating critters: tiny sprites on huge transparent canvases. Trim and keep
// their original position as a fraction of the 1920×1080 frame.
const critters = [];
for (let i = 1; i <= 6; i++) {
  const from = join(SRC, `parallax${i}.png`);
  const { data, info } = await sharp(from).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true });
  const to = `critters/critter-${i}.png`;
  mkdirSync(join(DEST, "critters"), { recursive: true });
  writeFileSync(join(DEST, to), data);
  const left = -(info.trimOffsetLeft ?? 0);
  const top = -(info.trimOffsetTop ?? 0);
  critters.push({
    file: `critter-${i}`,
    x: +(left / 1920).toFixed(4),
    y: +(top / 1080).toFixed(4),
    w: +(info.width / 1920).toFixed(4),
  });
  total += data.length;
  console.log(`  ✓ ${to.padEnd(34)} ${String(info.width + "×" + info.height).padEnd(10)} at ${left},${top}`);
}
writeFileSync("src/data/critters.json", JSON.stringify(critters, null, 2) + "\n");

console.log(`\n${Object.keys(MAP).length + critters.length} source images → ${(total / 1024 / 1024).toFixed(1)} MB (was 41 MB of images in legacy/)`);
