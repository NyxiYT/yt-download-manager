// The hero's film: one seamless loop of the opening shot of Big Buck Bunny (© Blender Foundation, CC BY 3.0),
// cut from Blender's own file (download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_30fps_normal.mp4).
//
//   node scripts/encode-hero.mjs <path to bbb_sunflower_1080p_30fps_normal.mp4>
//
// Writes to public/media/:
//   film-1080.{webm,mp4}  the sharp picture inside the player (desktop), with its poster film-1080.avif
//   film-720.{webm,mp4}   the same for phones, with film-720.avif
//   back.{webm,mp4}       the background: small, already blurred and graded toward blue (the page scales it up)
// The source never enters the repo. Needs FFmpeg with libsvtav1, libx264 and libaom (the gyan.dev "full" build).
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) { console.error('usage: node scripts/encode-hero.mjs <bbb_sunflower_1080p_30fps_normal.mp4>'); process.exit(1); }
const out = fileURLToPath(new URL('../public/media/', import.meta.url));
mkdirSync(out, { recursive: true });

// The crane shot from the pink clouds down to the meadow runs from 3.6 s to the cut at 16.3 s. Its first second
// is laid over its last, so the end flows into the start; slowed to 85 %, it lasts about 13.6 s.
const START = 3.6, END = 16.2, FADE = 1, SPEED = 0.85;
const len = END - START;
const loop = `[0:v]trim=${START}:${END},setpts=PTS-STARTPTS,split[a][b];` +
  `[a]trim=${FADE}:${len},setpts=PTS-STARTPTS[main];[b]trim=0:${FADE},setpts=PTS-STARTPTS[head];` +
  `[main][head]xfade=transition=fade:duration=${FADE}:offset=${len - 2 * FADE},setpts=PTS/${SPEED},fps=30`;

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-an', ...args], { stdio: 'inherit', env: { ...process.env, SVT_LOG: '1' } });
const kb = (f) => `${Math.round(statSync(out + f).size / 1024)} KB`;

const sharp = [
  { name: 'film-1080', w: 1920, h: 1080, av1: 40, x264: 30 },
  { name: 'film-720', w: 1280, h: 720, av1: 40, x264: 30 },
];
for (const v of sharp) {
  const vf = `${loop},scale=${v.w}:${v.h}:flags=lanczos,format=yuv420p`;
  ff(['-filter_complex', vf, '-c:v', 'libsvtav1', '-preset', '5', '-crf', String(v.av1), '-g', '120', `${out}${v.name}.webm`]);
  ff(['-filter_complex', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(v.x264), '-profile:v', 'high', '-movflags', '+faststart', `${out}${v.name}.mp4`]);
  ff(['-filter_complex', `${vf},trim=end_frame=1`, '-frames:v', '1', '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '32', `${out}${v.name}.avif`]);
  console.log(`${v.name}: webm ${kb(v.name + '.webm')}, mp4 ${kb(v.name + '.mp4')}, poster ${kb(v.name + '.avif')}`);
}

// The background: graded to a night blue (colour mostly taken out, highlights pulled down into blue), blurred before encoding
// so the browser doesn't have to, and small, because nothing in it is sharp.
const grade = "hue=s=0.3,curves=r='0/0.01 1/0.18':g='0/0.02 1/0.32':b='0/0.05 1/0.62'";
const back = `${loop},scale=640:360:flags=area,${grade},gblur=sigma=10,format=yuv420p`;
ff(['-filter_complex', back, '-c:v', 'libsvtav1', '-preset', '5', '-crf', '44', '-g', '120', `${out}back.webm`]);
ff(['-filter_complex', back, '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-profile:v', 'high', '-movflags', '+faststart', `${out}back.mp4`]);
ff(['-filter_complex', `${back},trim=end_frame=1`, '-frames:v', '1', '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '40', `${out}back.avif`]);
console.log(`back: webm ${kb('back.webm')}, mp4 ${kb('back.mp4')}, poster ${kb('back.avif')}`);
