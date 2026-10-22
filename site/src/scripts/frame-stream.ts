// The frame stream: the backgrounds of the hero and the final call to action, and the picture of what the product
// does. Real YouTube thumbnails from one shared pool (lib/thumb-pool.ts), so no thumbnail ever shows twice on the
// page, and a different motion for each section, laid out anew on every visit:
// - "rain" (the hero): thumbnails drift downward in four depth layers, the back ones smaller, slower and more
//   blurred, each with its own size, speed and tilt, spread so they never bunch up.
// - "orbit" (the final call to action): thumbnails circle the button on a tilted ring, growing and sharpening as
//   they come round to the front, with a smaller, slower ring turning the other way behind it.
// Every few seconds a thumbnail near the front shows a thin progress line filling, then flies into the section's
// download button, shrinking, blurring and fading as it goes, with a trail of blue sparks; the button gives a short
// wiggle when it lands. Only then does the thumbnail go back to the pool and a new one take its place.
//
// Two <canvas>, Canvas 2D: the stream under the section's text wash, and the flight, sparks and landing above it, so
// a download stays plain to see right up to the button. Pixel ratio capped at 1.5, 30 fps on phones, pictures loaded after the page has loaded and
// only for the thumbnails on screen, paused while off screen or in a hidden tab (lib/playback.ts) and resumed where
// it stopped. Positions are kept relative to the canvas, so a change of height (a phone's address bar) moves nothing.
// "Reduce motion" leaves one still frame. The pictures are graded toward the page's colours per theme.
import { getMotion, onMotion } from '../islands/motion-pref';
import { scenePlayback } from '../lib/playback';
import { dropThumb, returnThumb, takeThumb, thumbUrl, type Thumb } from '../lib/thumb-pool';

const RATIO = 225 / 400; // the files' height / width

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

// ---------- the pictures: fetched after the page has loaded, one file per thumbnail on screen ----------
const afterLoad = new Promise<void>((res) => {
  const go = () => setTimeout(res, 150);
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
});
async function decode(t: Thumb) {
  await afterLoad;
  const r = await fetch(thumbUrl(t));
  if (!r.ok) throw new Error(`${r.status} for ${t.id}`);
  return createImageBitmap(await r.blob());
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (u: number) => u * u * (3 - 2 * u);

// The button's answer to a landing: a short wiggle on the individual rotate and translate properties, so it never
// fights the button's own transform (hover, press). A new landing replaces the last one; nothing stays behind.
const wiggles = new WeakMap<HTMLElement, Animation>();
function wiggle(el: HTMLElement) {
  wiggles.get(el)?.cancel();
  wiggles.set(el, el.animate([
    { rotate: '0deg', translate: '0 0' },
    { rotate: '-2.5deg', translate: '-1px 0', offset: 0.18 },
    { rotate: '2deg', translate: '1px 0', offset: 0.42 },
    { rotate: '-1deg', translate: '0 0', offset: 0.68 },
    { rotate: '0deg', translate: '0 0' },
  ], { duration: 420, easing: 'ease-out' }));
}

interface Tile {
  thumb: Thumb | null;
  img: ImageBitmap | null;
  bakes: (HTMLCanvasElement | undefined)[]; // per depth, made when first needed
  ver: number; // the bakes' version (size and theme)
  size: number; // × the width for its depth
  speed: number; // × the speed for its depth
  tilt: number; // radians
  phase: number; // of its sway
  a: number; // rain: x as a fraction of the width; orbit: angle on the ring (radians)
  b: number; // rain: y as a fraction of the way down; orbit: the ring (0 behind, 1 in front)
  d: number; // rain: depth level
  alpha: number; // 0 to 1: fades and grows in when its picture is ready
  wait: number; // orbit: seconds before a new thumbnail takes its place after a download
  busy: boolean;
}
/** Where a tile is drawn: centre, width, rotation, and its depth (0 to 3, fractional on the ring). */
interface Placed { cx: number; cy: number; w: number; rot: number; z: number }
interface Particle { x0: number; y0: number; cx: number; cy: number; t: number; dur: number; size: number }
interface Download { tile: Tile; t: number; from: Placed | null; arrived: boolean }

export interface StreamOptions {
  canvas: HTMLCanvasElement;
  /** Above the section's text wash: the flying thumbnail, the sparks and the landing. */
  fx: HTMLCanvasElement;
  pattern: 'rain' | 'orbit';
  /** The section's download button: where downloads land. */
  target: () => HTMLElement | null;
  /** Where they land when the button isn't shown, in canvas CSS pixels. */
  fallback: (w: number, h: number) => { x: number; y: number };
}

export function frameStream(o: StreamOptions) {
  const { canvas } = o;
  const ctx = canvas.getContext('2d');
  const fx = o.fx.getContext('2d');
  if (!ctx || !fx) return;
  const pb = scenePlayback(canvas);
  const phone = matchMedia('(max-width: 767px), (pointer: coarse)');
  const theme = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const rain = o.pattern === 'rain';
  const rand = Math.random; // a new composition on every visit
  // Downloads: the progress line fills in `fill` s, the flight takes `fly` s, the next starts `every` s later.
  const fill = rain ? 1.05 : 1.4;
  const fly = rain ? 1.0 : 1.15;
  const every: [number, number] = rain ? [3.2, 4.6] : [4.6, 6.2];

  let W = 0, H = 0, k = 1, dpr = 1, laidW = 0, ver = 0;
  let list: Tile[] = [];
  const parts: Particle[] = [];
  let dl: Download | null = null;
  let nextDl = rain ? 1.8 : 2.6;
  let pulse = 0, impact = 0, clock = 0;
  let raf = 0, last = 0, acc = 0;
  let sink = { x: 0, y: 0, el: null as HTMLElement | null };

  // ---------- the two patterns ----------
  // Rain, per depth: width (px at 1440 wide), speed (px/s), how sparse (higher: fewer tiles), and at most how many.
  const RAIN_W = [92, 124, 164, 212], RAIN_SPEED = [7, 11, 16, 23], RAIN_SPARSE = [24, 20, 16, 15], RAIN_MAX = [12, 8, 6, 4];
  // The orbit: the ring in front circles in about 120 s, the one behind in about 210 s the other way; which way, how
  // fast and where each starts change with every visit.
  const turn = rand() < 0.5 ? 1 : -1;
  const ORBIT = [
    { n: 6, period: -210 * turn * lerp(0.85, 1.15, rand()), rx: 0.36, ry: 0.1, cy: 0.29, z: [0, 1.1], w: [74, 112] },
    { n: 9, period: 120 * turn * lerp(0.85, 1.15, rand()), rx: 0.44, ry: 0.31, cy: 0.5, z: [0.9, 3], w: [118, 236] },
  ];
  const turn0 = rand() * Math.PI * 2;

  function place(t: Tile): Placed {
    if (rain) {
      const w = RAIN_W[t.d] * k * t.size, h = w * RATIO;
      return { cx: t.a * (W + w) - w / 2, cy: t.b * (H + h) - h / 2, w, rot: t.tilt + Math.sin(clock * 0.3 + t.phase) * 0.02, z: t.d };
    }
    const R = ORBIT[t.b];
    const front = (Math.sin(t.a) + 1) / 2; // 1 at the bottom of the ring, nearest
    const w = lerp(R.w[0], R.w[1], front) * k * t.size;
    const rx = W * (phone.matches ? R.rx + 0.12 : R.rx), ry = H * R.ry;
    return { cx: W / 2 + Math.cos(t.a) * rx, cy: H * R.cy + Math.sin(t.a) * ry + Math.sin(clock * 0.5 + t.phase) * 5 * k, w,
      rot: t.tilt - Math.cos(t.a) * 0.06, z: lerp(R.z[0], R.z[1], front) };
  }

  // ---------- thumbnails from the pool ----------
  const owner = o.pattern;
  const publish = () => { canvas.dataset.thumbs = list.flatMap((t) => (t.thumb ? [t.thumb.id] : [])).join(' '); };
  function release(t: Tile) {
    if (t.thumb) returnThumb(t.thumb.id);
    t.img?.close();
    t.thumb = null; t.img = null; t.bakes = [];
  }
  /** A new thumbnail for the tile (the old one goes back first). Settles when its picture is in or none was found. */
  function assign(t: Tile): Promise<void> {
    release(t);
    t.alpha = 0;
    const th = takeThumb(owner, rand);
    t.thumb = th;
    publish();
    if (!th) return Promise.resolve();
    return decode(th).then((bmp) => {
      if (t.thumb !== th) { bmp.close(); return; }
      t.img = bmp;
      if (!raf) { t.alpha = 1; draw(0); } // a still frame shows it at once
    }, () => {
      if (t.thumb !== th) return;
      dropThumb(th.id); // its file is missing or broken: another one takes its place
      t.thumb = null;
      return assign(t);
    });
  }

  // Rain: of a few random spots, the one farthest from the tiles near its depth, so nothing bunches up.
  function spot(t: Tile, top: boolean) {
    let best = -1, bestA = 0, bestB = 0;
    for (let i = 0; i < 10; i++) {
      t.a = rand(); t.b = top ? -rand() * 0.25 : rand();
      const p = place(t);
      let near = Infinity;
      for (const u of list) {
        if (u === t || Math.abs(u.d - t.d) > 1) continue;
        const q = place(u);
        near = Math.min(near, Math.hypot(p.cx - q.cx, p.cy - q.cy) / (p.w + q.w));
      }
      if (near > best) { best = near; bestA = t.a; bestB = t.b; }
    }
    t.a = bestA; t.b = bestB;
  }

  function layout() {
    // A new layout (a real change of width) keeps the pictures it already has: nothing is fetched twice.
    const keep = list.filter((t) => t.thumb && t.img && !t.busy);
    for (const t of list) if (!keep.includes(t)) release(t);
    if (dl) dl = null;
    list = [];
    laidW = W;
    const tile = (d: number, b = 0): Tile => ({ thumb: null, img: null, bakes: [], ver: -1, size: 0.82 + rand() * 0.36, speed: 0.8 + rand() * 0.45,
      tilt: (rand() - 0.5) * 0.12, phase: rand() * 6.28, a: 0, b, d, alpha: 0, wait: 0, busy: false });
    if (rain) {
      RAIN_W.forEach((bw, d) => {
        const w = bw * k, h = w * RATIO;
        const n = Math.max(2, Math.min(RAIN_MAX[d], Math.round((W * (H + h)) / (w * h * RAIN_SPARSE[d]))));
        for (let i = 0; i < n; i++) { const t = tile(d); spot(t, false); list.push(t); }
      });
    } else {
      ORBIT.forEach((R, b) => {
        const n = phone.matches ? R.n - 2 : R.n;
        for (let i = 0; i < n; i++) {
          const t = tile(0, b);
          t.a = turn0 + ((i + 0.5 + (rand() - 0.5) * 0.4) / n) * Math.PI * 2; // evenly round the ring, a little uneven
          list.push(t);
        }
      });
    }
    const all = list.map((t) => {
      const old = keep.pop();
      if (!old) return assign(t);
      Object.assign(t, { thumb: old.thumb, img: old.img, alpha: 1 });
      return Promise.resolve();
    });
    for (const t of keep) release(t); // more pictures than the new layout has tiles
    publish();
    Promise.allSettled(all).then(() => { canvas.dataset.ready = ''; }); // every first picture is in (tests wait for this)
  }

  function size() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(1.5, devicePixelRatio || 1);
    canvas.width = o.fx.width = Math.round(W * dpr); canvas.height = o.fx.height = Math.round(H * dpr);
    k = Math.max(0.55, Math.min(1.1, W / 1440));
    ver++;
    // Only a real change of width lays the tiles out again; a change of height keeps everything where it is.
    if (!list.length || Math.abs(W - laidW) > laidW * 0.15) layout();
  }

  // The picture graded, rounded and blurred for a depth; made when first drawn there, again after a resize or theme.
  function bake(t: Tile, d: number) {
    if (t.ver !== ver) { t.bakes = []; t.ver = ver; }
    if (t.bakes[d] || !t.img) return t.bakes[d];
    const P = PALETTE[theme()];
    const D = DEPTH[d];
    const w = Math.round((rain ? RAIN_W[d] * 1.18 : lerp(ORBIT[0].w[0], ORBIT[1].w[1] * 1.18, d / 3)) * k * dpr), h = Math.round(w * RATIO);
    const pad = Math.ceil(D.blur * 2 * dpr);
    const c = document.createElement('canvas');
    c.width = w + pad * 2; c.height = h + pad * 2;
    const g = c.getContext('2d')!;
    g.filter = `blur(${D.blur * dpr}px) ${P.grade}`; // ignored where unsupported: the pictures are then just sharper
    g.beginPath();
    g.roundRect(pad, pad, w, h, 6 * k * dpr);
    g.save(); g.clip(); g.drawImage(t.img, pad, pad, w, h); g.restore();
    g.filter = 'none';
    g.globalCompositeOperation = 'source-atop'; // the wash only where the picture is
    g.fillStyle = P.wash;
    g.fillRect(0, 0, c.width, c.height);
    return (t.bakes[d] = c);
  }

  // Where downloads land: the centre of the button, measured each frame (it moves with layout, never with scrolling).
  function measureSink() {
    const el = o.target();
    const b = el?.getBoundingClientRect();
    if (el && b && b.width) {
      const c = canvas.getBoundingClientRect();
      sink = { x: b.left - c.left + b.width / 2, y: b.top - c.top + b.height / 2, el };
    } else sink = { ...o.fallback(W, H), el: null };
  }

  function startDownload() {
    const ok = list.filter((t) => {
      if (t.busy || t.alpha < 1 || !t.img) return false;
      const p = place(t);
      if (rain) return t.d >= 2 && p.cy > H * 0.1 && p.cy < H * 0.6 && p.cx - p.w / 2 > W * 0.03 && p.cx + p.w / 2 < W * 0.97;
      return t.b === 1 && p.z > 1.6 && Math.abs(Math.cos(t.a)) > 0.55 && p.cx - p.w / 2 > 0 && p.cx + p.w / 2 < W; // at the ring's sides
    });
    const pick = ok.length ? ok[Math.floor(rand() * ok.length)] : null;
    if (!pick) return;
    pick.busy = true;
    dl = { tile: pick, t: 0, from: null, arrived: false };
  }

  // Sparks from a point toward the button, on a gentle curve that fans out and gathers.
  function sparks(x: number, y: number, spread: number, n: number, dur: [number, number]) {
    for (let i = 0; i < n; i++) {
      const x0 = x + (rand() - 0.5) * spread, y0 = y + (rand() - 0.5) * spread * RATIO;
      const cx = x0 + (sink.x - x0) * (0.2 + rand() * 0.3) + (rand() - 0.5) * W * 0.08;
      const cy = y0 + (sink.y - y0) * (0.55 + rand() * 0.25);
      parts.push({ x0, y0, cx, cy, t: -rand() * 0.12, dur: lerp(dur[0], dur[1], rand()), size: (1 + rand() * 1.4) * Math.max(0.8, k) });
    }
  }

  /** The flying tile right now: where it is, how big, how see-through and how blurred. */
  function flight(d: Download) {
    const u = Math.min(1, (d.t - fill) / fly);
    const e = u * u; // it gathers speed toward the button
    const f = d.from!;
    // A curve that lifts a little before it dives into the button.
    const qx = lerp(f.cx, sink.x, 0.35), qy = Math.min(f.cy, sink.y) - 70 * k;
    const v = 1 - e;
    return {
      cx: v * v * f.cx + 2 * v * e * qx + e * e * sink.x,
      cy: v * v * f.cy + 2 * v * e * qy + e * e * sink.y,
      w: f.w * lerp(1, 0.14, smooth(u)), rot: f.rot * (1 - u), z: f.z,
      alpha: u < 0.55 ? 1 : 1 - (u - 0.55) / 0.45, blur: lerp(0, 6, u), u,
    };
  }

  function step(dt: number) {
    clock += dt;
    for (const t of list) {
      if (rain) {
        const w = RAIN_W[t.d] * k * t.size, h = w * RATIO;
        t.b += (RAIN_SPEED[t.d] * k * t.speed * dt) / (H + h);
        if (t.b > 1 + 4 / (H + h) && !(dl && dl.tile === t)) { spot(t, true); t.busy = false; assign(t); } // out at the bottom: in at the top, new
      } else {
        t.a += ((Math.PI * 2) / ORBIT[t.b].period) * t.speed * dt;
        if (t.wait > 0 && (t.wait -= dt) <= 0) { t.busy = false; assign(t); } // a new thumbnail takes its place
      }
      if (t.img && !t.busy && t.wait <= 0 && t.alpha < 1) t.alpha = Math.min(1, t.alpha + dt / (rain ? 0.8 : 1.2));
    }
    nextDl -= dt;
    if (!dl && nextDl <= 0) { startDownload(); nextDl = lerp(every[0], every[1], rand()); }
    if (dl) {
      const d = dl;
      d.t += dt;
      if (!d.from && d.t >= fill) {
        d.from = place(d.tile);
        sparks(d.from.cx, d.from.cy, d.from.w, Math.round(18 * Math.max(0.7, k)), [0.9, 1.4]); // a burst as it lifts off
      }
      if (d.from && !d.arrived) {
        const f = flight(d);
        if (f.u < 0.9) sparks(f.cx, f.cy, f.w * 0.6, rand() < dt * 50 ? 1 : 0, [0.25, 0.45]); // the trail
        if (f.u >= 1) {
          d.arrived = true;
          pulse = Math.min(0.6, pulse + 0.32);
          impact = 1;
          if (sink.el) wiggle(sink.el);
          const c = canvas.getBoundingClientRect();
          canvas.dispatchEvent(new CustomEvent('stream-arrive', { detail: { x: c.left + sink.x, y: c.top + sink.y } }));
        }
      }
      // Gone into the button: the thumbnail goes back to the pool only now, after its exit.
      if (d.arrived) {
        const t = d.tile;
        t.alpha = 0;
        if (rain) t.b = 2; // comes back in at the top, as a new thumbnail
        else { release(t); publish(); t.wait = 2.2 + rand() * 1.6; }
        dl = null;
      }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += dt;
      if (p.t >= p.dur) { parts.splice(i, 1); pulse = Math.min(0.6, pulse + 0.006); }
    }
    pulse *= Math.exp(-dt * 1.6);
    impact = Math.max(0, impact - dt / 0.5);
  }

  function drawTile(g: CanvasRenderingContext2D, t: Tile, p: Placed, fade: number, blur = 0) {
    const h = p.w * RATIO;
    const d0 = Math.min(3, Math.floor(p.z)), d1 = Math.min(3, d0 + 1), f = p.z - d0;
    // Grows in from 92% as it fades in.
    const grow = lerp(0.92, 1, smooth(t.alpha));
    g.save();
    g.translate(p.cx, p.cy);
    g.rotate(p.rot);
    if (blur > 0.2) g.filter = `blur(${blur}px)`;
    for (const [d, wgt] of d0 === d1 ? [[d0, 1]] : [[d0, 1 - f], [d1, f]]) {
      if (wgt < 0.02) continue;
      const c = bake(t, d);
      if (!c) continue;
      const s = (p.w * grow) / ((c.width - Math.ceil(DEPTH[d].blur * 2 * dpr) * 2) / dpr); // the bake's picture to p.w
      g.globalAlpha = fade * wgt;
      g.drawImage(c, (-c.width / dpr / 2) * s, (-c.height / dpr / 2) * s, (c.width / dpr) * s, (c.height / dpr) * s);
    }
    g.filter = 'none';
    // The download in progress: a thin line along the picture's bottom edge.
    if (dl && dl.tile === t && !dl.from) {
      const u = Math.min(1, dl.t / fill);
      const x = -p.w / 2 + 8 * k, y = h / 2 - 4 * k, len = p.w - 16 * k;
      g.globalAlpha = Math.min(1, dl.t / 0.15);
      g.fillStyle = PALETTE[theme()].track;
      g.fillRect(x, y, len, 2);
      g.fillStyle = PALETTE[theme()].line;
      g.fillRect(x, y, len * (1 - Math.pow(1 - u, 2)), 2);
    }
    g.restore();
  }

  function draw(dt: number) {
    measureSink();
    if (dt) step(dt);
    const P = PALETTE[theme()];
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    const [r, g, b] = P.glow;

    // The glow where downloads land.
    const R = Math.max(W, H) * 0.42;
    const grd = ctx!.createRadialGradient(sink.x, sink.y, 0, sink.x, sink.y, R);
    const a = P.glowA + pulse * 0.5;
    grd.addColorStop(0, `rgba(${r},${g},${b},${a})`);
    grd.addColorStop(0.45, `rgba(${r},${g},${b},${a * 0.35})`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx!.fillStyle = grd;
    ctx!.fillRect(0, 0, W, H);

    // The thumbnails, back to front; the one flying, on top.
    const placed = list.filter((t) => t.img && !(dl && dl.tile === t && dl.from)).map((t) => ({ t, p: place(t) })).sort((u, v) => u.p.z - v.p.z);
    for (const { t, p } of placed) {
      const d0 = Math.min(3, Math.floor(p.z)), d1 = Math.min(3, d0 + 1);
      const fade = lerp(DEPTH[d0].alpha, DEPTH[d1].alpha, p.z - d0) * t.alpha;
      if (fade > 0.003) drawTile(ctx!, t, p, fade);
    }
    ctx!.globalAlpha = 1;

    // Above the text wash: the flying thumbnail, the sparks, and a ring where they land.
    fx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    fx!.clearRect(0, 0, W, H);
    if (dl && dl.from && !dl.arrived && dl.tile.img) {
      const f = flight(dl);
      drawTile(fx!, dl.tile, f, Math.max(0, f.alpha) * 0.95, f.blur);
    }
    fx!.globalCompositeOperation = P.blend;
    if (impact > 0 && sink.el) {
      const u = 1 - impact;
      fx!.globalAlpha = impact * 0.6;
      fx!.strokeStyle = P.particle;
      fx!.lineWidth = 1.5;
      fx!.beginPath();
      fx!.ellipse(sink.x, sink.y, 30 * k + u * 70 * k, 14 * k + u * 32 * k, 0, 0, Math.PI * 2);
      fx!.stroke();
    }
    fx!.fillStyle = P.particle;
    for (const p of parts) {
      if (p.t <= 0) continue;
      const u = p.t / p.dur;
      const e = smooth(u); // they leave gently and arrive gently
      const v = 1 - e;
      const x = v * v * p.x0 + 2 * v * e * p.cx + e * e * sink.x;
      const y = v * v * p.y0 + 2 * v * e * p.cy + e * e * sink.y;
      fx!.globalAlpha = Math.min(1, u * 6) * (1 - Math.pow(u, 3)) * 0.9;
      fx!.beginPath();
      fx!.arc(x, y, p.size * (1 - u * 0.5), 0, Math.PI * 2);
      fx!.fill();
    }
    fx!.globalAlpha = 1;
    fx!.globalCompositeOperation = 'source-over';
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
    if (!run) {
      if (getMotion() !== 'full') for (const t of list) if (t.img && !t.busy) t.alpha = 1; // the still frame shows them all
      draw(0);
    }
  }

  size();
  draw(0);
  // Resizing clears the canvas: draw again at once, or a running stream shows one empty frame.
  new ResizeObserver(() => { size(); draw(0); }).observe(canvas);
  // A new theme only grades the same pictures again: nothing reloads, nothing moves.
  new MutationObserver(() => { ver++; if (!raf) draw(0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  pb.onChange(sync);
  onMotion(sync);
  sync();
}
