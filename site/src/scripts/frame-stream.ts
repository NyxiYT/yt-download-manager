// The frame stream: the backgrounds of the hero and the final call to action, and the picture of what the product
// does. Real YouTube thumbnails (public/media/thumbs, scripts/thumbs.mjs), a different set and a different motion for
// each section:
// - "rain" (the hero): thumbnails drift downward in four depth layers, the back ones smaller, slower and more
//   blurred, each with its own size, speed and tilt, spread so they never bunch up.
// - "orbit" (the final call to action): thumbnails circle the button on a tilted ring, growing and sharpening as
//   they come round to the front, with a smaller, slower ring turning the other way behind it.
// Every few seconds a thumbnail near the front shows a thin progress line filling, then dissolves into small blue
// particles that fall toward a soft glow (where downloads "land": the bottom centre, or the CTA's button).
//
// One <canvas>, Canvas 2D. Pixel ratio capped at 1.5, 30 fps on phones, pictures loaded after the page has loaded,
// paused while off screen or in a hidden tab (lib/playback.ts) and resumed where it stopped. Positions are kept
// relative to the canvas, so a resize (a phone's address bar showing or hiding) moves nothing. "Reduce motion" leaves
// one still frame. The pictures are graded toward the page's colours per theme; the canvas itself is transparent.
import { getMotion, onMotion } from '../islands/motion-pref';
import { scenePlayback } from '../lib/playback';

const THUMB_COUNT = 12;
const RATIO = 225 / 400; // the files' height / width
const base = import.meta.env.BASE_URL;

// Depth levels, back to front: blur (px) and opacity.
const DEPTH = [
  { blur: 12, alpha: 0.3 },
  { blur: 7, alpha: 0.44 },
  { blur: 3.5, alpha: 0.6 },
  { blur: 1.5, alpha: 0.78 },
];

type Theme = 'dark' | 'light';
const PALETTE: Record<Theme, { particle: string; line: string; track: string; glow: [number, number, number]; glowA: number; blend: GlobalCompositeOperation; grade: string; wash: string }> = {
  dark: { particle: '#8FB2FF', line: '#6E9BFF', track: 'rgba(237,240,247,0.18)', glow: [61, 123, 255], glowA: 0.28, blend: 'lighter',
    grade: 'saturate(0.7) brightness(0.8)', wash: 'rgba(14,32,92,0.26)' },
  light: { particle: '#2160E8', line: '#2160E8', track: 'rgba(12,18,32,0.12)', glow: [33, 96, 232], glowA: 0.16, blend: 'source-over',
    grade: 'saturate(0.55) contrast(0.85) brightness(1.06)', wash: 'rgba(236,241,252,0.42)' },
};

// ---------- the pictures, loaded once per set ----------
type ThumbSet = 'hero' | 'cta';
const sets: Partial<Record<ThumbSet, Promise<ImageBitmap[]>>> = {};
function thumbs(set: ThumbSet) {
  return (sets[set] ??= Promise.all(Array.from({ length: THUMB_COUNT }, async (_, i) => {
    const r = await fetch(`${base}media/thumbs/${set}-${i}.avif`);
    return createImageBitmap(await r.blob());
  })));
}
const afterLoad = new Promise<void>((res) => {
  const go = () => setTimeout(res, 150);
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
});

// A small seeded random, so a stream looks the same on every visit.
function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Tile {
  img: number;
  size: number; // × the width for its depth
  speed: number; // × the speed for its depth
  tilt: number; // radians
  phase: number; // of its sway
  a: number; // rain: x as a fraction of the width; orbit: angle on the ring (radians)
  b: number; // rain: y as a fraction of the way down; orbit: the ring (0 behind, 1 in front)
  d: number; // rain: depth level
  alpha: number; // fades in when it (re)appears, out after its download
  wait: number; // orbit: seconds before it reappears after a download
  busy: boolean;
}
/** Where a tile is drawn: top left, width, rotation, and its depth (0 to 3, fractional on the ring). */
interface Placed { x: number; y: number; w: number; rot: number; z: number }
interface Particle { x0: number; y0: number; cx: number; cy: number; t: number; dur: number; size: number }
interface Download { tile: Tile; t: number }

export interface StreamOptions {
  canvas: HTMLCanvasElement;
  pattern: 'rain' | 'orbit';
  seed: number;
  /** Where the particles land, in canvas CSS pixels. */
  sink: (w: number, h: number) => { x: number; y: number };
}

export function frameStream(o: StreamOptions) {
  const { canvas } = o;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const pb = scenePlayback(canvas);
  const phone = matchMedia('(max-width: 767px), (pointer: coarse)');
  const theme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const rain = o.pattern === 'rain';
  const set: ThumbSet = rain ? 'hero' : 'cta';
  // Downloads: the progress line fills in `fill` s, the next starts `every` s later. The orbit takes its time.
  const fill = rain ? 1.05 : 1.6;
  const every: [number, number] = rain ? [2.6, 3.8] : [4.2, 5.8];

  let W = 0, H = 0, k = 1, dpr = 1, laidW = 0;
  let imgs: ImageBitmap[] | null = null;
  let baked: { c: HTMLCanvasElement; w: number }[][] = []; // [depth][img]: the picture, graded, rounded and blurred for its depth
  let show = 0; // fades the pictures in once they are loaded
  let list: Tile[] = [];
  const parts: Particle[] = [];
  let dl: Download | null = null;
  let nextDl = rain ? 1.6 : 2.4;
  let pulse = 0, clock = 0;
  let raf = 0, last = 0, acc = 0;
  const rand = rng(o.seed + 1);

  // ---------- the two patterns ----------
  // Rain, per depth: width (px at 1440 wide), speed (px/s), and how sparse (higher: fewer tiles).
  const RAIN_W = [92, 124, 164, 212], RAIN_SPEED = [7, 11, 16, 23], RAIN_SPARSE = [13, 11, 12, 15];
  // The orbit: the ring in front circles every 120 s, the one behind every 210 s the other way.
  const ORBIT = [
    { n: 7, period: -210, rx: 0.36, ry: 0.1, cy: 0.29, z: [0, 1.1], w: [74, 112] },
    { n: 9, period: 120, rx: 0.44, ry: 0.31, cy: 0.5, z: [0.9, 3], w: [118, 236] },
  ];

  function place(t: Tile): Placed {
    if (rain) {
      const w = RAIN_W[t.d] * k * t.size, h = w * RATIO;
      return { x: t.a * (W + w) - w, y: t.b * (H + h) - h, w, rot: t.tilt + Math.sin(clock * 0.3 + t.phase) * 0.02, z: t.d };
    }
    const R = ORBIT[t.b];
    const front = (Math.sin(t.a) + 1) / 2; // 1 at the bottom of the ring, nearest
    const w = lerp(R.w[0], R.w[1], front) * k * t.size, h = w * RATIO;
    const rx = W * (phone.matches ? R.rx + 0.12 : R.rx), ry = H * R.ry;
    const x = W / 2 + Math.cos(t.a) * rx, y = H * R.cy + Math.sin(t.a) * ry + Math.sin(clock * 0.5 + t.phase) * 5 * k;
    return { x: x - w / 2, y: y - h / 2, w, rot: t.tilt - Math.cos(t.a) * 0.06, z: lerp(R.z[0], R.z[1], front) };
  }

  // The picture fewest tiles show right now, so the same one never piles up.
  function leastUsed() {
    const n = new Array(THUMB_COUNT).fill(0);
    for (const t of list) n[t.img]++;
    const min = Math.min(...n);
    const free = n.flatMap((c, i) => (c === min ? [i] : []));
    return free[Math.floor(rand() * free.length)];
  }

  // Rain: of a few random spots, the one farthest from the tiles near its depth, so nothing bunches up.
  function spot(t: Tile, r: () => number, top: boolean) {
    let best = 0, bestA = 0, bestB = 0;
    for (let i = 0; i < 10; i++) {
      t.a = r(); t.b = top ? -r() * 0.25 : r();
      const p = place(t);
      let near = Infinity;
      for (const u of list) {
        if (u === t || Math.abs(u.d - t.d) > 1) continue;
        const q = place(u);
        near = Math.min(near, Math.hypot(p.x + p.w / 2 - q.x - q.w / 2, p.y - q.y) / (p.w + q.w));
      }
      if (near > best) { best = near; bestA = t.a; bestB = t.b; }
    }
    t.a = bestA; t.b = bestB;
  }

  function layout() {
    const r = rng(o.seed);
    list = [];
    laidW = W;
    const tile = (d: number, b = 0): Tile => ({ img: 0, size: 0.82 + r() * 0.36, speed: 0.8 + r() * 0.45, tilt: (r() - 0.5) * 0.12,
      phase: r() * 6.28, a: 0, b, d, alpha: 1, wait: 0, busy: false });
    if (rain) {
      RAIN_W.forEach((bw, d) => {
        const w = bw * k, h = w * RATIO;
        const n = Math.max(2, Math.round((W * (H + h)) / (w * h * RAIN_SPARSE[d])));
        for (let i = 0; i < n; i++) { const t = tile(d); spot(t, r, false); t.img = leastUsed(); list.push(t); }
      });
    } else {
      ORBIT.forEach((R, b) => {
        const n = phone.matches ? R.n - 2 : R.n;
        for (let i = 0; i < n; i++) {
          const t = tile(0, b);
          t.a = ((i + 0.5 + (r() - 0.5) * 0.4) / n) * Math.PI * 2; // evenly round the ring, a little uneven
          t.img = leastUsed();
          list.push(t);
        }
      });
    }
  }

  function size() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(1.5, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    k = Math.max(0.55, Math.min(1.1, W / 1440));
    // Only a real change of width lays the tiles out again; a change of height keeps everything where it is.
    if (!list.length || Math.abs(W - laidW) > laidW * 0.15) layout();
    bake();
  }

  function bake() {
    if (!imgs) return;
    const P = PALETTE[theme()];
    const widest = rain ? RAIN_W[3] * 1.18 : ORBIT[1].w[1] * 1.18;
    baked = DEPTH.map((D, d) => {
      const w = Math.round((rain ? RAIN_W[d] * 1.18 : lerp(ORBIT[0].w[0], widest, d / 3)) * k * dpr), h = Math.round(w * RATIO);
      const pad = Math.ceil(D.blur * 2 * dpr);
      return imgs!.map((img) => {
        const c = document.createElement('canvas');
        c.width = w + pad * 2; c.height = h + pad * 2;
        const g = c.getContext('2d')!;
        g.filter = `blur(${D.blur * dpr}px) ${P.grade}`; // ignored where unsupported: the pictures are then just sharper
        g.beginPath();
        g.roundRect(pad, pad, w, h, 6 * k * dpr);
        g.save(); g.clip(); g.drawImage(img, pad, pad, w, h); g.restore();
        g.filter = 'none';
        g.globalCompositeOperation = 'source-atop'; // the wash only where the picture is
        g.fillStyle = P.wash;
        g.fillRect(0, 0, c.width, c.height);
        return { c, w: w / dpr };
      });
    });
  }

  async function load() {
    imgs = await thumbs(set);
    bake();
    if (!raf) draw(0); // a still frame (reduced motion, or paused)
    canvas.dataset.ready = ''; // the pictures are in (tests wait for this)
  }

  function startDownload() {
    const ok = list.filter((t) => {
      if (t.busy || t.alpha < 1) return false;
      const p = place(t);
      if (rain) return t.d >= 2 && p.y > H * 0.06 && p.y < H * 0.5 && p.x > W * 0.03 && p.x + p.w < W * 0.97;
      return t.b === 1 && p.z > 1.6 && Math.abs(Math.cos(t.a)) > 0.55 && p.x > 0 && p.x + p.w < W; // at the ring's sides
    });
    const pick = ok.length ? ok[Math.floor(rand() * ok.length)] : null;
    if (!pick) return;
    pick.busy = true;
    dl = { tile: pick, t: 0 };
  }

  function dissolve(tile: Tile) {
    const p = place(tile), h = p.w * RATIO;
    const s = o.sink(W, H);
    const n = Math.round(46 * Math.max(0.7, k));
    for (let i = 0; i < n; i++) {
      const x0 = p.x + rand() * p.w, y0 = p.y + rand() * h;
      // A gentle curve: the control point sits beside the straight line, so particles fan out and gather.
      const cx = x0 + (s.x - x0) * (0.2 + rand() * 0.3) + (rand() - 0.5) * W * 0.12;
      const cy = y0 + (s.y - y0) * (0.55 + rand() * 0.25);
      parts.push({ x0, y0, cx, cy, t: -rand() * 0.35, dur: 1.5 + rand() * 0.9, size: (1 + rand() * 1.4) * Math.max(0.8, k) });
    }
  }

  function step(dt: number) {
    clock += dt;
    show = imgs ? Math.min(1, show + dt / 0.6) : 0;
    for (const t of list) {
      if (rain) {
        const w = RAIN_W[t.d] * k * t.size, h = w * RATIO;
        t.b += (RAIN_SPEED[t.d] * k * t.speed * dt) / (H + h);
        if (t.b > 1 + 4 / (H + h)) { spot(t, rand, true); t.img = leastUsed(); t.alpha = 0; t.busy = false; }
      } else {
        t.a += ((Math.PI * 2) / ORBIT[t.b].period) * t.speed * dt;
        if (t.wait > 0 && (t.wait -= dt) <= 0) { t.img = leastUsed(); t.busy = false; } // a new picture takes its place
      }
      if (!t.busy && t.wait <= 0 && t.alpha < 1) t.alpha = Math.min(1, t.alpha + dt / (rain ? 0.8 : 1.4));
    }
    nextDl -= dt;
    if (!dl && nextDl <= 0 && imgs) { startDownload(); nextDl = lerp(every[0], every[1], rand()); }
    if (dl) {
      const t = dl.tile;
      dl.t += dt;
      if (dl.t >= fill + 0.05 && dl.t - dt < fill + 0.05) dissolve(t);
      if (dl.t > fill + 0.05) t.alpha = Math.max(0, 1 - (dl.t - fill - 0.05) / 0.6);
      if (dl.t > fill + 0.75) {
        if (rain) t.b = 2; // it comes back at the top later, as a new picture
        else t.wait = 2.5 + rand() * 1.5;
        dl = null;
      }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += dt;
      if (p.t >= p.dur) { parts.splice(i, 1); pulse = Math.min(0.5, pulse + 0.012); }
    }
    pulse *= Math.exp(-dt * 1.6);
  }

  function draw(dt: number) {
    if (dt) step(dt);
    const P = PALETTE[theme()];
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);

    // The glow where downloads land.
    const s = o.sink(W, H);
    const R = Math.max(W, H) * 0.42;
    const [r, g, b] = P.glow;
    const grd = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
    const a = P.glowA + pulse * 0.5;
    grd.addColorStop(0, `rgba(${r},${g},${b},${a})`);
    grd.addColorStop(0.45, `rgba(${r},${g},${b},${a * 0.35})`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx!.fillStyle = grd;
    ctx!.fillRect(0, 0, W, H);

    // The pictures, back to front. On the ring a tile between two depths blends their two bakes.
    if (baked.length && show > 0) {
      const placed = list.map((t) => ({ t, p: place(t) })).sort((u, v) => u.p.z - v.p.z);
      for (const { t, p } of placed) {
        const h = p.w * RATIO;
        const d0 = Math.min(3, Math.floor(p.z)), d1 = Math.min(3, d0 + 1), f = p.z - d0;
        const fade = lerp(DEPTH[d0].alpha, DEPTH[d1].alpha, f) * t.alpha * show;
        if (fade <= 0.003) continue;
        ctx!.save();
        ctx!.translate(p.x + p.w / 2, p.y + h / 2);
        ctx!.rotate(p.rot);
        for (const [d, wgt] of d0 === d1 ? [[d0, 1]] : [[d0, 1 - f], [d1, f]]) {
          if (wgt < 0.02) continue;
          const { c, w } = baked[d][t.img];
          const scale = p.w / w; // the bake's picture is w CSS px wide, its blur margin around it
          ctx!.globalAlpha = fade * wgt;
          ctx!.drawImage(c, (-c.width / dpr / 2) * scale, (-c.height / dpr / 2) * scale, (c.width / dpr) * scale, (c.height / dpr) * scale);
        }
        // The download in progress: a thin line along the picture's bottom edge.
        if (dl && dl.tile === t && dl.t < fill + 0.35) {
          const u = Math.min(1, dl.t / fill);
          const lf = dl.t > fill + 0.05 ? Math.max(0, 1 - (dl.t - fill - 0.05) / 0.3) : Math.min(1, dl.t / 0.15);
          const x = -p.w / 2 + 8 * k, y = h / 2 - 4 * k, len = p.w - 16 * k;
          ctx!.globalAlpha = lf * show;
          ctx!.fillStyle = P.track;
          ctx!.fillRect(x, y, len, 2);
          ctx!.fillStyle = P.line;
          ctx!.fillRect(x, y, len * (1 - Math.pow(1 - u, 2)), 2);
        }
        ctx!.restore();
      }
      ctx!.globalAlpha = 1;
    }

    // The particles, falling toward the glow.
    if (parts.length) {
      ctx!.globalCompositeOperation = P.blend;
      ctx!.fillStyle = P.particle;
      for (const p of parts) {
        if (p.t <= 0) continue;
        const u = p.t / p.dur;
        const e = u * u * (3 - 2 * u); // ease in-out: they leave gently and arrive gently
        const v = 1 - e;
        const x = v * v * p.x0 + 2 * v * e * p.cx + e * e * s.x;
        const y = v * v * p.y0 + 2 * v * e * p.cy + e * e * s.y;
        ctx!.globalAlpha = Math.min(1, u * 6) * (1 - Math.pow(u, 3)) * 0.9;
        ctx!.beginPath();
        ctx!.arc(x, y, p.size * (1 - u * 0.5), 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = 'source-over';
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    // Phones: 30 frames a second are plenty.
    if (phone.matches) { acc += dt; if (acc < 1 / 31) return; draw(acc); acc = 0; } else draw(dt);
  }

  function sync() {
    const run = pb.live() && getMotion() === 'full';
    if (run && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!run) draw(0);
  }

  size();
  draw(0);
  // Resizing clears the canvas: draw again at once, or a running stream shows one empty frame.
  new ResizeObserver(() => { size(); draw(0); }).observe(canvas);
  // A new theme only grades the same pictures again: nothing reloads, nothing moves.
  new MutationObserver(() => { bake(); if (!raf) draw(0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  pb.onChange(sync);
  onMotion(sync);
  afterLoad.then(load);
  sync();
}
