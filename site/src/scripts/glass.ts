// Liquid glass for the nav: what's behind it bends at the rim, with a faint colour fringe, and stays clear in the
// middle. Written for this page after the approach of rizzytoday/liquid-glass and deepika-builds/liquid-glass (both
// MIT): a displacement map drawn on a canvas (red = sideways, blue = up and down, 128 = still), fed to an SVG
// feDisplacementMap, once per colour channel at slightly different strengths, and applied with
// backdrop-filter: url(#…).
//
// Only Chromium can apply an SVG filter as a backdrop-filter. Safari parses it and draws nothing, so @supports
// can't be trusted; instead this checks for Chromium itself (navigator.userAgentData, which Safari and Firefox
// don't have) and for a device with power to spare. Everyone else keeps the blurred glass from Header.astro.

const SVGNS = 'http://www.w3.org/2000/svg';
const RIM = 18; // px of the edge that bends
const SCALE = -46; // how far it bends; negative pulls the view inward like a lens

function capable() {
  const nav = navigator as Navigator & { userAgentData?: { brands: { brand: string }[]; mobile: boolean }; deviceMemory?: number; connection?: { saveData?: boolean } };
  const chromium = !!nav.userAgentData?.brands?.some((b) => /Chromium/i.test(b.brand));
  return chromium && (nav.deviceMemory ?? 8) >= 4 && (navigator.hardwareConcurrency ?? 8) >= 4 && !nav.connection?.saveData;
}

// Signed distance from a point to a rounded rectangle (negative inside).
function sdf(x: number, y: number, w: number, h: number, r: number) {
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// The map is smooth, so it's drawn at half size (feImage stretches it) and only the rim is computed: the middle
// is still (128) everywhere. That keeps it to a few milliseconds.
function drawMap(w: number, h: number, r: number, inset: number) {
  const K = 2;
  const cw = Math.max(1, Math.round(w / K));
  const ch = Math.max(1, Math.round(h / K));
  const rim = RIM / K;
  const rr = r / K;
  const ins = inset / K;
  const iw = cw - ins * 2;
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(cw, ch);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) { data[i] = 128; data[i + 1] = 128; data[i + 2] = 128; data[i + 3] = 255; }
  const band = Math.ceil(rim + rr);
  for (let y = 0; y < ch; y++) {
    const edgeRow = y < band || y >= ch - band;
    for (let x = 0; x < cw; x++) {
      const lx = x - ins;
      if (!edgeRow && lx > band && lx < iw - band) { x = Math.floor(iw - band + ins) - 1; continue; } // skip the middle of the row
      const d = -sdf(lx + 0.5, y + 0.5, iw, ch, rr); // distance inside the rim
      if (!(d > 0 && d < rim)) continue;
      // the normal: which way the edge faces here
      const e = 0.5;
      const gx = sdf(lx + e, y, iw, ch, rr) - sdf(lx - e, y, iw, ch, rr);
      const gy = sdf(lx, y + e, iw, ch, rr) - sdf(lx, y - e, iw, ch, rr);
      const len = Math.hypot(gx, gy) || 1;
      const k = (1 - d / rim) ** 2;
      const i = (y * cw + x) * 4;
      data[i] = 128 + (gx / len) * k * 127;
      data[i + 2] = 128 + (gy / len) * k * 127;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

function filter(id: string, w: number, h: number, href: string) {
  const el = (n: string, a: Record<string, string | number>) => {
    const e = document.createElementNS(SVGNS, n);
    for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
    return e;
  };
  const f = el('filter', { id, x: 0, y: 0, width: w, height: h, filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' });
  f.append(el('feImage', { href, x: 0, y: 0, width: w, height: h, result: 'map', preserveAspectRatio: 'none' }));
  // One pass per colour channel, each bent a little more: the fringe at the rim.
  const channels = [
    { s: SCALE, m: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', r: 'r' },
    { s: SCALE * 1.08, m: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', r: 'g' },
    { s: SCALE * 1.16, m: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', r: 'b' },
  ];
  for (const c of channels) {
    f.append(el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: c.s, xChannelSelector: 'R', yChannelSelector: 'B', result: `d${c.r}` }));
    f.append(el('feColorMatrix', { in: `d${c.r}`, type: 'matrix', values: c.m, result: c.r }));
  }
  f.append(el('feBlend', { in: 'r', in2: 'g', mode: 'screen', result: 'rg' }));
  f.append(el('feBlend', { in: 'rg', in2: 'b', mode: 'screen' }));
  return f;
}

export function initGlass() {
  const glass = document.querySelector<HTMLElement>('[data-glass]');
  if (!glass || !capable()) return;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  document.body.append(svg);
  let condensed = false;
  const build = () => {
    const w = glass.offsetWidth;
    const h = glass.offsetHeight;
    const r = parseFloat(getComputedStyle(glass).borderTopLeftRadius) || 18;
    const inset = condensed ? parseFloat(glass.style.getPropertyValue('--cx')) || 0 : 0;
    svg.replaceChildren(filter('ydm-glass', w, h, drawMap(w, h, r, inset)));
    glass.setAttribute('data-refract', '');
  };
  build();
  addEventListener('ydm:nav', (e) => { condensed = (e as CustomEvent<boolean>).detail; setTimeout(build, 60); });
  let t = 0;
  addEventListener('resize', () => { clearTimeout(t); t = window.setTimeout(build, 200); }, { passive: true });
}
