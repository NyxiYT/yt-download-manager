// The frame stream's thumbnails: real YouTube thumbnails, two sets so the hero and the final call to action never
// show the same pictures. Fetched once from YouTube's image server and kept in the repo, so the page itself loads
// nothing from Google. Run again only to change the pictures:
//   node scripts/thumbs.mjs
// Writes public/media/thumbs/{hero,cta}-{n}.avif, 400 x 225, and prints the total size (budget: 600 KB).
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Video IDs, mixed so neighbours in a set come from different channels.
const SETS = {
  hero: [
    'RE3_PGwDwhw', // MrBeast
    'teW7A5EoP_o', // Dude Perfect
    'scfCKQEHvwI', // IShowSpeed
    'lvy3x4_Q2HE', // Sidemen
    'h8VE9_aHd94', // MrBeast Gaming
    'oqbs5__ccnk', // Markiplier
    'plN7JMbadRg', // MrBeast
    'XDH7pgXAtRk', // Airrack
    'ESABTN4VtrA', // MKBHD
    'mAg3rdk6FLw', // jacksepticeye
    'gTKS8SAwUzE', // MrBeast
    'Hhl74xWssbU', // Kai Cenat
  ],
  cta: [
    'kJu5VMN3yow', // MrBeast Gaming
    'BhTqWKNO-aA', // Sidemen
    'v9QtM6qnG50', // MrBeast
    'LVhFuyABxBE', // Dude Perfect
    'cr642ejN_60', // Airrack
    'cNYSOHWbkJU', // PewDiePie
    'nM21hVqvhmk', // MrBeast Gaming
    'ssvafmkk98I', // Markiplier
    'bPYV9NPpIys', // Sidemen
    'scwlR0QHGOk', // MKBHD
    'MhXPm7JcWCo', // Dude Perfect
    '5gXyaw1RWek', // Airrack
  ],
};

const out = fileURLToPath(new URL('../public/media/thumbs/', import.meta.url));
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

async function get(id) {
  // hqdefault is 480 x 360 with the 16:9 picture between black bars; mqdefault (320 x 180) when it's missing.
  for (const [name, crop] of [['hqdefault', { left: 0, top: 45, width: 480, height: 270 }], ['mqdefault', null]]) {
    const r = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`);
    if (!r.ok) continue;
    const img = sharp(Buffer.from(await r.arrayBuffer()));
    return crop ? img.extract(crop) : img;
  }
  throw new Error(`no thumbnail for ${id}`);
}

for (const [set, ids] of Object.entries(SETS)) {
  for (const [n, id] of ids.entries()) {
    const img = await get(id);
    await img.resize(400, 225, { fit: 'cover' }).avif({ quality: 52, effort: 6 }).toFile(`${out}${set}-${n}.avif`);
  }
}

let total = 0;
for (const f of await readdir(out)) total += (await stat(out + f)).size;
console.log(`thumbs: ${Object.values(SETS).map((s) => s.length).join(' + ')}, ${Math.round(total / 1024)} KB in all`);
