// The frame stream (BRIEF 7.1): the background of the hero and the final call to action, and the picture of what
// the product does. Small stills of the film (public/media/tiles, scripts/tiles.mjs) drift slowly downward in four
// depth layers: the back ones smaller, slower and more blurred. Every few seconds a tile near the front shows a thin
// progress line filling, then dissolves into small blue particles that fall toward a soft glow (where downloads
// "land": the bottom centre, or the CTA's button).
//
// One <canvas>, Canvas 2D. Pixel ratio capped at 1.5, 30 fps on phones, tiles loaded after the page has loaded,
// paused while off screen or in a hidden tab (lib/playback.ts). "Reduce motion" leaves one still frame. Each theme
// has its own tiles and colours; the canvas itself is transparent over the page's ground.
import { getMotion, onMotion } from '../islands/motion-pref';
import { scenePlayback } from '../lib/playback';

const TILE_COUNT = 8;
const TILE_W = 320, TILE_H = 180;
const base = import.meta.env.BASE_URL;

// Back to front: size (px at 1440 wide), speed (px/s), blur (px), opacity.
const LAYERS = [
  { w: 92, speed: 7, blur: 14, alpha: 0.32 },
  { w: 124, speed: 11, blur: 8, alpha: 0.46 },
  { w: 164, speed: 16, blur: 4, alpha: 0.62 },
  { w: 212, speed: 23, blur: 2, alpha: 0.8 },
];

type Theme = 'dark' | 'light';
const PALETTE: Record<Theme, { particle: string; line: string; track: string; glow: [number, number, number]; glowA: number; blend: GlobalCompositeOperation }> = {
  dark: { particle: '#8FB2FF', line: '#6E9BFF', track: 'rgba(237,240,247,0.18)', glow: [61, 123, 255], glowA: 0.28, blend: 'lighter' },
  light: { particle: '#2160E8', line: '#2160E8', track: 'rgba(12,18,32,0.12)', glow: [33, 96, 232], glowA: 0.16, blend: 'source-over' },
};

// ---------- the tiles, loaded once for every stream on the page ----------
const sets: Partial<Record<Theme, Promise<ImageBitmap[]>>> = {};
function tiles(theme: Theme) {
  return (sets[theme] ??= Promise.all(Array.from({ length: TILE_COUNT }, async (_, i) => {
    const r = await fetch(`${base}media/tiles/${theme}-${i}.avif`);
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

interface Tile { layer: number; img: number; x: number; y: number; alpha: number; busy: boolean }
interface Particle { x0: number; y0: number; cx: number; cy: number; t: number; dur: number; size: number }
interface Download { tile: Tile; t: number }

export interface StreamOptions {
  canvas: HTMLCanvasElement;
  /** 1 for the hero; fewer tiles for the CTA. */
  density: number;
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

  let W = 0, H = 0, k = 1, dpr = 1;
  let imgs: ImageBitmap[] | null = null;
  let baked: HTMLCanvasElement[][] = []; // [layer][img]: the tile, rounded and blurred for its layer
  let show = 0; // fades the tiles in once they are loaded
  let list: Tile[] = [];
  const parts: Particle[] = [];
  let dl: Download | null = null;
  let nextDl = 1.6;
  let pulse = 0;
  let raf = 0, last = 0, acc = 0;
  const rand = rng(o.seed);

  function size() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(1.5, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    k = Math.max(0.55, Math.min(1.1, W / 1440));
    layout();
    bake();
  }

  // Tiles spread over the area (and a band above it, to drift in), never quite the same spot twice.
  function layout() {
    const r = rng(o.seed);
    list = [];
    LAYERS.forEach((L, li) => {
      const w = L.w * k, h = (w * TILE_H) / TILE_W;
      const n = Math.max(2, Math.round(((W * (H + h)) / (w * h * (7 + li * 3))) * o.density));
      for (let i = 0; i < n; i++) list.push({ layer: li, img: Math.floor(r() * TILE_COUNT), x: r() * (W + w) - w, y: r() * (H + h) - h, alpha: 1, busy: false });
    });
  }

  function bake() {
    if (!imgs) return;
    baked = LAYERS.map((L) => {
      const w = Math.round(L.w * k * dpr), h = Math.round((w * TILE_H) / TILE_W);
      const pad = Math.ceil(L.blur * 2 * dpr);
      return imgs!.map((img) => {
        const c = document.createElement('canvas');
        c.width = w + pad * 2; c.height = h + pad * 2;
        const g = c.getContext('2d')!;
        g.filter = `blur(${L.blur * dpr}px)`; // ignored where unsupported: the tiles are then just sharper
        g.beginPath();
        g.roundRect(pad, pad, w, h, 6 * k * dpr);
        g.save(); g.clip(); g.drawImage(img, pad, pad, w, h); g.restore();
        return c;
      });
    });
  }

  async function load() {
    const t = theme();
    const got = await tiles(t);
    if (t !== theme()) return; // the theme changed meanwhile; that load is under way
    imgs = got;
    bake();
    if (!raf) draw(0); // a still frame (reduced motion, or paused)
  }

  function startDownload() {
    const front = list.filter((t) => t.layer >= 2 && !t.busy && t.alpha === 1);
    const w = (i: number) => LAYERS[i].w * k;
    const ok = front.filter((t) => t.y > H * 0.06 && t.y < H * 0.5 && t.x > W * 0.03 && t.x + w(t.layer) < W * 0.97);
    const pick = ok.length ? ok[Math.floor(rand() * ok.length)] : null;
    if (!pick) return;
    pick.busy = true;
    dl = { tile: pick, t: 0 };
  }

  function dissolve(tile: Tile) {
    const w = LAYERS[tile.layer].w * k, h = (w * TILE_H) / TILE_W;
    const s = o.sink(W, H);
    const n = Math.round(46 * Math.max(0.7, k));
    for (let i = 0; i < n; i++) {
      const x0 = tile.x + rand() * w, y0 = tile.y + rand() * h;
      // A gentle curve: the control point sits beside the straight line, so particles fan out and gather.
      const cx = x0 + (s.x - x0) * (0.2 + rand() * 0.3) + (rand() - 0.5) * W * 0.12;
      const cy = y0 + (s.y - y0) * (0.55 + rand() * 0.25);
      parts.push({ x0, y0, cx, cy, t: -rand() * 0.35, dur: 1.5 + rand() * 0.9, size: (1 + rand() * 1.4) * Math.max(0.8, k) });
    }
  }

  function step(dt: number) {
    show = imgs ? Math.min(1, show + dt / 0.6) : 0;
    for (const t of list) {
      const L = LAYERS[t.layer];
      const w = L.w * k, h = (w * TILE_H) / TILE_W;
      t.y += L.speed * k * dt;
      if (t.y > H + 4) { t.y = -h - rand() * h * 2; t.x = rand() * (W + w) - w; t.img = Math.floor(rand() * TILE_COUNT); t.alpha = 0; t.busy = false; }
      if (!t.busy && t.alpha < 1) t.alpha = Math.min(1, t.alpha + dt / 0.8);
    }
    nextDl -= dt;
    if (!dl && nextDl <= 0 && imgs) { startDownload(); nextDl = 2.6 + rand() * 1.2; }
    if (dl) {
      dl.t += dt;
      if (dl.t >= 1.1 && dl.tile.alpha === 1 && dl.t - dt < 1.1) dissolve(dl.tile);
      if (dl.t > 1.1) dl.tile.alpha = Math.max(0, 1 - (dl.t - 1.1) / 0.6);
      if (dl.t > 1.8) { dl.tile.y = H + 10; dl = null; } // it comes back at the top later, as a new tile
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

    // The tiles, back to front.
    if (baked.length && show > 0) {
      for (const t of list) {
        const L = LAYERS[t.layer];
        const c = baked[t.layer][t.img];
        const pad = (c.width / dpr - L.w * k) / 2;
        ctx!.globalAlpha = L.alpha * t.alpha * show;
        ctx!.drawImage(c, t.x - pad, t.y - pad, c.width / dpr, c.height / dpr);
      }
      ctx!.globalAlpha = 1;
    }

    // The download in progress: a thin line along the tile's bottom edge.
    if (dl && dl.t < 1.4) {
      const L = LAYERS[dl.tile.layer];
      const w = L.w * k, h = (w * TILE_H) / TILE_W;
      const y = dl.tile.y + h - 4 * k;
      const fill = Math.min(1, dl.t / 1.05);
      const fade = dl.t > 1.1 ? Math.max(0, 1 - (dl.t - 1.1) / 0.3) : Math.min(1, dl.t / 0.15);
      ctx!.globalAlpha = fade * show;
      ctx!.fillStyle = P.track;
      ctx!.fillRect(dl.tile.x + 8 * k, y, w - 16 * k, 2);
      ctx!.fillStyle = P.line;
      ctx!.fillRect(dl.tile.x + 8 * k, y, (w - 16 * k) * (1 - Math.pow(1 - fill, 2)), 2);
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
  new ResizeObserver(() => { size(); if (!raf) draw(0); }).observe(canvas);
  new MutationObserver(() => { imgs = null; baked = []; show = 0; load(); if (!raf) draw(0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  pb.onChange(sync);
  onMotion(sync);
  afterLoad.then(load);
  sync();
}
