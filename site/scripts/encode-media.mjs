// Turns the OBS recordings of the real app into the clips the page shows next to each demo.
//
//   1. Put the raw recordings in site/recordings/raw/ (any format FFmpeg reads, e.g. video.mkv, trim.mkv …).
//   2. Set where each clip starts, how long it runs and what to crop in site/recordings/shots.json.
//   3. npm run media
//
// Each clip becomes public/recordings/<chapter>.mp4 (H.264), .webm (AV1) and -poster.avif: muted, 1600 px wide
// (or the crop's own width if smaller), and src/data/recordings.json lists them, with their size, for the page. Needs FFmpeg on PATH
// with libx264, libsvtav1 and libaom/AVIF support (the gyan.dev "full" build has all three).
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const shots = JSON.parse(await readFile(here('../recordings/shots.json'), 'utf8'));
const out = here('../public/recordings/');
await mkdir(out, { recursive: true });

const probe = (file) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim().split(',').map(Number);
const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit', env: { ...process.env, SVT_LOG: '1' } });
const manifest = {};

for (const [chapter, s] of Object.entries(shots)) {
  if (chapter.startsWith('_')) continue;
  const src = here(`../recordings/raw/${s.file}`);
  if (!existsSync(src)) { console.log(`${chapter}: ${s.file} not found, skipped`); continue; }
  const crop = s.crop ? `crop=${s.crop.w}:${s.crop.h}:${s.crop.x}:${s.crop.y},` : '';
  const width = Math.min(1600, s.crop?.w ?? 1600);
  const vf = `${crop}scale=${width}:-2:flags=lanczos,fps=${s.fps ?? 30},format=yuv420p`;
  const cut = ['-ss', String(s.start), '-t', String(s.length), '-i', src];
  console.log(`${chapter}: ${s.file} from ${s.start}s, ${s.length}s`);
  ff([...cut, '-vf', vf, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-profile:v', 'high', '-movflags', '+faststart', `${out}${chapter}.mp4`]);
  ff([...cut, '-vf', vf, '-an', '-c:v', 'libsvtav1', '-preset', '5', '-crf', '44', '-g', '240', `${out}${chapter}.webm`]);
  ff(['-ss', String(s.start + (s.poster ?? 0)), '-i', src, '-frames:v', '1', '-vf', vf, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', `${out}${chapter}-poster.avif`]);
  const [w, h] = probe(`${out}${chapter}.mp4`);
  manifest[chapter] = { mp4: `recordings/${chapter}.mp4`, webm: `recordings/${chapter}.webm`, poster: `recordings/${chapter}-poster.avif`, width: w, height: h, label: s.label };
}

await writeFile(here('../src/data/recordings.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`src/data/recordings.json: ${Object.keys(manifest).length} clip(s)`);
