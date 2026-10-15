// The frame stream's tiles (BRIEF 7.1): small stills of the hero's film (Big Buck Bunny, © Blender Foundation,
// CC BY 3.0), graded into a calm blue duotone, one set for each theme. Taken from public/media/film-1080.mp4 with
// the installed Chrome (no FFmpeg needed). Run again only when the film changes:
//   node scripts/tiles.mjs
// Writes public/media/tiles/{dark,light}-{n}.avif, 320 x 180, and prints the total size (budget: 600 KB).
import { mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const film = fileURLToPath(new URL('../public/media/film-1080.mp4', import.meta.url));
const out = fileURLToPath(new URL('../public/media/tiles/', import.meta.url));
await mkdir(out, { recursive: true });

// Moments of the film's loop (seconds): the meadow and trees only (BRIEF 7.1: no clouds), before the title appears.
// Every second tile is mirrored, for variety.
const TIMES = [4.6, 5.6, 6.6, 7.6, 8.6, 9.6, 10.6, 11.4];
// Duotone ends: [shadow, highlight] per theme.
const GRADES = {
  dark: [[10, 19, 48], [143, 178, 255]],
  light: [[168, 188, 232], [247, 249, 253]],
};

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
// Serve the film from a made-up origin, so the page can load it like any web page would.
const bytes = await readFile(film);
// Answers byte ranges (206), which the browser needs to seek in the video.
await page.route('https://tiles.local/**', (r) => {
  if (!r.request().url().endsWith('.mp4')) return r.fulfill({ contentType: 'text/html', body: '<body style="margin:0;background:#000"><video src="film.mp4" muted playsinline style="display:block;width:640px;height:360px;object-fit:cover"></video></body>' });
  const m = /bytes=(\d+)-(\d*)/.exec(r.request().headers().range ?? '');
  if (!m) return r.fulfill({ body: bytes, contentType: 'video/mp4', headers: { 'Accept-Ranges': 'bytes' } });
  const start = Number(m[1]);
  const end = m[2] ? Math.min(Number(m[2]), bytes.length - 1) : bytes.length - 1;
  return r.fulfill({ status: 206, body: bytes.subarray(start, end + 1), contentType: 'video/mp4',
    headers: { 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Content-Length': String(end - start + 1) } });
});
await page.goto('https://tiles.local/');
await page.waitForFunction(() => document.querySelector('video').readyState >= 1);

let n = 0;
const seen = new Set();
for (const t of TIMES) {
  await page.evaluate((t) => new Promise((res) => {
    const v = document.querySelector('video');
    v.addEventListener('seeked', () => requestAnimationFrame(() => requestAnimationFrame(res)), { once: true });
    v.currentTime = t;
  }), t);
  const at = await page.evaluate(() => document.querySelector('video').currentTime);
  if (Math.abs(at - t) > 0.2) throw new Error(`could not seek to ${t} s (at ${at} s)`);
  const png = await page.locator('video').screenshot();
  const key = (await sharp(png).resize(8, 8).greyscale().raw().toBuffer()).toString('hex');
  if (seen.has(key)) throw new Error(`the frame at ${t} s repeats an earlier one`);
  seen.add(key);
  const { data, info } = await sharp(png).resize(320, 180).flop(n % 2 === 1).greyscale().normalise().raw().toBuffer({ resolveWithObject: true });
  for (const [theme, [lo, hi]] of Object.entries(GRADES)) {
    const rgb = Buffer.alloc(info.width * info.height * 3);
    for (let i = 0; i < info.width * info.height; i++) {
      const k = data[i] / 255;
      for (let c = 0; c < 3; c++) rgb[i * 3 + c] = Math.round(lo[c] + (hi[c] - lo[c]) * k);
    }
    await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } }).avif({ quality: 50, effort: 6 }).toFile(`${out}${theme}-${n}.avif`);
  }
  n++;
}
await browser.close();

let total = 0;
for (const f of await readdir(out)) total += (await stat(out + f)).size;
console.log(`tiles: ${n} per theme, ${Math.round(total / 1024)} KB in all`);
