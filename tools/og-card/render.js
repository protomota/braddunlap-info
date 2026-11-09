// Renders the 1200x630 share image (Open Graph / X card) to public/og-image.jpg.
// Run from the repo root: node tools/og-card/render.js  (needs playwright + python3 with Pillow)
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const path = require("path");

(async () => {
  const png = path.join(__dirname, "og.png");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(__dirname, "card.html"));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: png });
  await browser.close();
  const out = path.join(__dirname, "../../public/og-image.jpg");
  execFileSync("python3", ["-c",
    "import sys,os;from PIL import Image;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2],quality=88,optimize=True,progressive=True);os.remove(sys.argv[1])",
    png, out]);
  console.log("wrote", out);
})();
