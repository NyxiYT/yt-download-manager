// The thumbnail library behind the hero and the final call to action: real thumbnails of regular uploads (not
// Shorts) from popular channels. Lists each channel's Videos tab with yt-dlp, fetches every picture from YouTube's
// image server once and keeps it in the repo, so the page itself loads nothing from YouTube. Run again to refresh:
//   node scripts/thumbs.mjs            (yt-dlp on PATH, or YTDLP=path/to/yt-dlp)
// Writes public/media/thumbs/<video id>.avif (400 x 225) and src/data/thumbs.json (id, creator, title, source URL,
// file), drops YouTube's grey "no picture" stand-ins and pictures that repeat, and fails under MIN pictures.
import { execFileSync } from 'node:child_process';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const CHANNELS = [
  'MrBeast', 'IShowSpeed', 'MrBeastGaming', 'Sidemen', 'MoreSidemen', 'DudePerfect', 'airrack', 'mkbhd', 'jacksepticeye',
  'markiplier', 'PewDiePie', 'KaiCenat', 'DanTDM', 'LinusTechTips', 'MarkRober', 'veritasium', 'penguinz0', 'ZHC', 'Ludwig',
  'Jynxzi', 'BeastReacts', 'TommyInnit',
];
const PER_CHANNEL = 7;
const MIN = 100;
const MIN_SECONDS = 90; // regular uploads only: the Videos tab leaves Shorts out, this catches short teasers
const SKIP = /#(ad|sponsored)\b|partner/i;
const YTDLP = process.env.YTDLP || 'yt-dlp';

const out = fileURLToPath(new URL('../public/media/thumbs/', import.meta.url));
const manifest = fileURLToPath(new URL('../src/data/thumbs.json', import.meta.url));
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

function uploads(channel) {
  const text = execFileSync(YTDLP, ['--flat-playlist', '--no-warnings', '-I', '1:15', '--print', '%(id)s\t%(duration)s\t%(title)s',
    `https://www.youtube.com/@${channel}/videos`], { encoding: 'utf8' });
  return text.trim().split('\n').map((l) => l.split('\t')).filter(([id, d, title]) => id && Number(d) >= MIN_SECONDS && !SKIP.test(title))
    .map(([id, , title]) => ({ id, title }));
}

async function picture(id) {
  // hqdefault is 480 x 360 with the 16:9 picture between black bars; YouTube answers a missing one with a 120 x 90 grey.
  const src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const r = await fetch(src);
  if (!r.ok) return null;
  const img = sharp(Buffer.from(await r.arrayBuffer()));
  const { width } = await img.metadata();
  if (width < 480) return null;
  return { src, img: img.extract({ left: 0, top: 45, width: 480, height: 270 }).resize(400, 225) };
}

const lib = [];
const seen = new Set();
for (const creator of CHANNELS) {
  let kept = 0;
  for (const v of uploads(creator)) {
    if (kept >= PER_CHANNEL) break;
    if (lib.some((t) => t.id === v.id)) continue;
    const p = await picture(v.id);
    if (!p) continue;
    // A 16 x 9 grey fingerprint: the same picture under two videos counts once.
    const key = (await p.img.clone().resize(16, 9).greyscale().raw().toBuffer()).toString('hex');
    if (seen.has(key)) continue;
    seen.add(key);
    await p.img.avif({ quality: 50, effort: 6 }).toFile(`${out}${v.id}.avif`);
    lib.push({ id: v.id, creator, title: v.title, src: p.src, file: `media/thumbs/${v.id}.avif` });
    kept++;
  }
  console.log(`${creator}: ${kept}`);
}
if (lib.length < MIN) throw new Error(`only ${lib.length} pictures, at least ${MIN} are needed`);
await writeFile(manifest, JSON.stringify(lib, null, 1) + '\n');

let total = 0;
for (const f of await readdir(out)) total += (await stat(out + f)).size;
console.log(`thumbs: ${lib.length} pictures, ${Math.round(total / 1024)} KB in all`);
