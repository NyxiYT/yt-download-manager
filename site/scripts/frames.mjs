// The pictures inside the demos, cut from the README's own screenshot (docs/images/toolbar.jpg: a frame of
// Big Buck Bunny, © Blender Foundation, CC BY 3.0, above the toolbar). Run again only when that screenshot changes:
//   node scripts/frames.mjs
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const src = fileURLToPath(new URL('../../docs/images/toolbar.jpg', import.meta.url));
const out = new URL('../src/assets/frames/', import.meta.url);
await mkdir(out, { recursive: true });

const meta = await sharp(src).metadata();
const frameH = Math.round((meta.width * 9) / 16); // the player, without the toolbar under it
const frame = sharp(src).extract({ left: 0, top: 0, width: meta.width, height: Math.min(frameH, meta.height) });
await frame.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(fileURLToPath(new URL('bbb.jpg', out)));

// 9:16 around the bunny, for the Shorts scene
const tallW = Math.round((frameH * 9) / 16);
const centre = Math.round(meta.width * 0.52);
await sharp(src).extract({ left: centre - Math.round(tallW / 2), top: 0, width: tallW, height: frameH }).jpeg({ quality: 92, mozjpeg: true })
  .toFile(fileURLToPath(new URL('bbb-tall.jpg', out)));

// A square, the way the MP3's cover art crops the picture
await sharp(src).extract({ left: centre - Math.round(frameH / 2), top: 0, width: frameH, height: frameH }).resize(144, 144).jpeg({ quality: 88, mozjpeg: true })
  .toFile(fileURLToPath(new URL('bbb-cover.jpg', out)));

console.log(`frames: ${meta.width}x${frameH}, tall ${tallW}x${frameH}, cover 144x144`);
