// The subtitles the Try it demo offers: YouTube doesn't let another site fetch a video's subtitles, so they're saved
// next to the page with yt-dlp, the way the extension would get them: every track the creator uploaded, and YouTube's
// automatic one in the video's own language (not its machine translations). Run again when the demo's video changes:
//   node scripts/subs.mjs [video id ...] [--out dir]   (default: the videos in src/data/videos; yt-dlp on PATH, or YTDLP=)
// Writes <out>/<id>.json ({ tracks: [{ key, lang, label, auto, files }] }, [] when the video has none) and each track
// as json3 (the demo turns it into SRT or WebVTT), TTML and SRV3 in <out>/<id>/.
import { execFileSync } from 'node:child_process';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const YTDLP = process.env.YTDLP || 'yt-dlp';
const args = process.argv.slice(2);
const at = args.indexOf('--out');
const out = at >= 0 ? args.splice(at, 2)[1].replace(/\/?$/, '/') : fileURLToPath(new URL('../public/media/subs/', import.meta.url));
const dataDir = new URL('../src/data/videos/', import.meta.url);
const ids = args.length ? args : await Promise.all((await readdir(dataDir)).filter((f) => f.endsWith('.json'))
  .map(async (f) => JSON.parse(await readFile(new URL(f, dataDir), 'utf8')).vid));

const FORMATS = ['json3', 'ttml', 'srv3'];

for (const id of ids) {
  const info = JSON.parse(execFileSync(YTDLP, ['-J', '--no-warnings', '--skip-download', `https://www.youtube.com/watch?v=${id}`], { encoding: 'utf8', maxBuffer: 64 << 20 }));
  const manual = Object.entries(info.subtitles ?? {}).filter(([lang]) => lang !== 'live_chat');
  const auto = Object.entries(info.automatic_captions ?? {}).filter(([lang]) => lang.endsWith('-orig'));
  const picked = [...manual.map(([lang, list]) => ({ lang, list, auto: false })), ...auto.map(([lang, list]) => ({ lang, list, auto: true }))];
  const dir = `${out}${id}/`;
  await rm(dir, { recursive: true, force: true });
  const tracks = [];
  for (const { lang, list, auto: isAuto } of picked) {
    const key = `${isAuto ? 'a' : 'm'}.${lang}`;
    const files = {};
    for (const ext of FORMATS) {
      const f = list.find((x) => x.ext === ext);
      if (!f) continue;
      const r = await fetch(f.url);
      const text = r.ok ? await r.text() : '';
      if (!text.trim()) continue;
      await mkdir(dir, { recursive: true });
      await writeFile(`${dir}${key}.${ext}`, text);
      files[ext] = `media/subs/${id}/${key}.${ext}`;
    }
    if (!files.json3) { console.warn(`${id} ${key}: no json3, left out`); continue; }
    const name = list[0]?.name || lang;
    // YouTube's language code, without the track ID yt-dlp adds to tell two tracks of one language apart.
    tracks.push({ key, lang: lang.replace(/-orig$/, '').replace(/-[\w-]{8,}$/, ''), label: isAuto ? `${name.replace(/ \(Original\)$/, '')} (auto-generated)` : name, auto: isAuto, files });
  }
  await mkdir(out, { recursive: true });
  await writeFile(`${out}${id}.json`, JSON.stringify({ source: 'yt-dlp -J, scripts/subs.mjs', vid: id, tracks }, null, 1) + '\n');
  console.log(`${id}: ${tracks.length} tracks${tracks.length ? ` (${tracks.map((t) => t.key).join(', ')})` : ''}`);
}
