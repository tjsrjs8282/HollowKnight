// README screenshots of the built site, driven through the gate like a visitor.
//   npm run build && npx serve .vercel/output/static -l 4401
//   npm run shots            (CHROME=<path> to override the browser)
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const URL = process.env.SHOTS_URL ?? "http://localhost:4401/";
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture(page, name, width) {
  const png = await page.screenshot({ type: "png" });
  await sharp(png).resize({ width }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`);
  console.log(`  ✓ ${OUT}/${name}.jpg`);
}

async function enter(page) {
  await page.goto(URL, { waitUntil: "networkidle2" });
  await page.click('[data-gate-enter="silent"]');
  await sleep(4200); // gate fade + hero intro
}

/** Jump to a section the way the menu does, then let reveals finish. */
async function goto(page, selector, offset = 0) {
  await page.evaluate(
    (sel, off) => {
      const el = document.querySelector(sel);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + off);
    },
    selector,
    offset,
  );
  await sleep(2600);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: "networkidle2" });
  await sleep(2200);
  await capture(page, "after-gate", 1440);

  await page.click('[data-gate-enter="silent"]');
  await sleep(4500);
  await capture(page, "after-hero", 1440);

  await goto(page, "#prologue", Math.round(900 * 0.9));
  await capture(page, "after-prologue", 1440);
  await goto(page, "#journal", 300);
  await page.click("#tab-hornet");
  await sleep(1600);
  await capture(page, "after-journal", 1440);
  await goto(page, "#expansions", 320);
  await capture(page, "after-expansions", 1440);
  await goto(page, "#silksong", 40);
  await capture(page, "after-silksong", 1440);
  await goto(page, "#soundtrack", 40);
  await capture(page, "after-soundtrack", 1440);
  await goto(page, "#seer", 140);
  await capture(page, "after-seer", 1440);

  const phone = await browser.newPage();
  await phone.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await enter(phone);
  await capture(phone, "mobile-hero", 390);
  await goto(phone, "#silksong", 0);
  await capture(phone, "mobile-silksong", 390);
} finally {
  await browser.close();
}
