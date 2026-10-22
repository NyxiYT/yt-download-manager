// The frame stream: the hero and the final call to action draw it on a canvas, it moves while in view and stands
// still off screen, the thumbnail library holds over 100 distinct real thumbnails, no thumbnail ever shows twice on
// the page (also while scrolling fast both ways and resizing), a broken file is replaced, downloads land on the
// section's download button and it wiggles, the old background film is gone, and light mode has no dark block.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

const library: { id: string; creator: string; title: string; src: string; file: string }[] =
  JSON.parse(readFileSync(new URL('../src/data/thumbs.json', import.meta.url), 'utf8'));

/** A cheap fingerprint of what the canvas shows right now. */
const print = (page: Page, which: string) => page.evaluate((which) => {
  const c = document.querySelector<HTMLCanvasElement>(`[data-stream="${which}"]`)!;
  const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
  let h = 0, lit = 0;
  for (let i = 0; i < d.length; i += 97) { h = (h * 31 + d[i]) | 0; if (d[i + 3] > 8) lit++; }
  return { h, lit };
}, which);
/** The thumbnails each section holds right now (video IDs). */
const held = (page: Page) => page.evaluate(() => Object.fromEntries(['hero', 'cta'].map((w) =>
  [w, (document.querySelector<HTMLCanvasElement>(`[data-stream="${w}"]`)!.dataset.thumbs ?? '').split(' ').filter(Boolean)])) as Record<'hero' | 'cta', string[]>);

test('the library: over 100 distinct real thumbnails of regular videos', () => {
  expect(library.length).toBeGreaterThanOrEqual(100);
  expect(new Set(library.map((t) => t.id)).size).toBe(library.length);
  const dir = new URL('../public/', import.meta.url);
  const hashes = new Set(library.map((t) => createHash('sha256').update(readFileSync(new URL(t.file, dir))).digest('hex')));
  expect(hashes.size).toBe(library.length); // as many different pictures as entries
  for (const t of library) expect(t.src).toBe(`https://i.ytimg.com/vi/${t.id}/hqdefault.jpg`);
  expect(readdirSync(new URL('media/thumbs/', dir))).toHaveLength(library.length);
});

test('the hero stream draws and moves while in view', async ({ page }) => {
  await page.goto('./');
  await expect.poll(async () => (await print(page, 'hero')).lit, { timeout: 8_000 }).toBeGreaterThan(50);
  const a = await print(page, 'hero');
  await page.waitForTimeout(800);
  expect((await print(page, 'hero')).h).not.toBe(a.h);
});

test('the CTA stream stands still off screen', async ({ page }) => {
  await page.goto('./');
  await page.locator('section.fin').scrollIntoViewIfNeeded();
  await expect.poll(async () => (await print(page, 'cta')).lit, { timeout: 8_000 }).toBeGreaterThan(50);
  // The pictures are in and the button has finished revealing: a paused stream still draws once when its pictures
  // arrive, and its glow follows the button.
  await expect(page.locator('[data-stream="cta"][data-ready]')).toBeAttached({ timeout: 8_000 });
  await expect.poll(() => page.locator('[data-fin-button]').evaluate((e) => e.getAnimations({ subtree: true }).length)).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const a = await print(page, 'cta');
  await page.waitForTimeout(1200);
  expect((await print(page, 'cta')).h).toBe(a.h);
});

test('no thumbnail shows twice, in a section or across both, while scrolling both ways and resizing', async ({ page }) => {
  const loaded = new Set<string>();
  page.on('requestfinished', (r) => { const m = /media\/thumbs\/([\w-]+)\.avif$/.exec(r.url()); if (m) loaded.add(m[1]); });
  await page.goto('./');
  await expect(page.locator('[data-stream="hero"][data-ready]')).toBeAttached({ timeout: 8_000 });
  const ids = new Set(library.map((t) => t.id));
  const check = async () => {
    const h = await held(page);
    expect(h.hero.length).toBeGreaterThan(10);
    expect(h.cta.length).toBeGreaterThan(8);
    expect(new Set(h.hero).size).toBe(h.hero.length);
    expect(new Set(h.cta).size).toBe(h.cta.length);
    expect(h.hero.filter((id) => h.cta.includes(id))).toEqual([]);
    for (const id of [...h.hero, ...h.cta]) expect(ids.has(id)).toBe(true);
  };
  await check();
  // A visit fetches the thumbnails it shows, not the library.
  const first = await held(page);
  expect(loaded.size).toBeLessThanOrEqual(first.hero.length + first.cta.length);
  const bottom = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let round = 0; round < 3; round++) {
    for (let y = 0; y < bottom; y += 900) { await page.mouse.wheel(0, 900); await page.waitForTimeout(30); }
    await page.waitForTimeout(2500); // the CTA runs a while: downloads, new thumbnails
    await check();
    for (let y = bottom; y > 0; y -= 900) { await page.mouse.wheel(0, -900); await page.waitForTimeout(30); }
    await page.waitForTimeout(2500);
    await check();
  }
  // A new layout keeps the pictures it has: a resize fetches (almost) nothing.
  const before = loaded.size;
  for (const w of [900, 1440, 390, 1280]) { await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(300); await check(); }
  expect(loaded.size - before).toBeLessThan(20);
});

test('a thumbnail whose file fails is replaced by another', async ({ page }) => {
  const bad = new Set(library.filter((_, i) => i % 2 === 0).map((t) => t.id)); // every second one is "broken"
  await page.route(/media\/thumbs\/[\w-]+\.avif$/, (r) => {
    const id = /([\w-]+)\.avif$/.exec(r.request().url())![1];
    return bad.has(id) ? r.fulfill({ status: 404, body: '' }) : r.continue();
  });
  await page.goto('./');
  await expect(page.locator('[data-stream="hero"][data-ready]')).toBeAttached({ timeout: 10_000 });
  const h = await held(page);
  expect(h.hero.length).toBeGreaterThan(10);
  expect(h.hero.filter((id) => bad.has(id))).toEqual([]);
});

for (const [width, scroll] of [[1280, 0], [1280, 180], [390, 0]] as const) {
  test(`hero downloads land on the download button, which wiggles (${width} px, scrolled ${scroll} px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    await page.evaluate((y) => window.scrollTo(0, y), scroll);
    const hit = await page.evaluate(() => new Promise<{ x: number; y: number; bx: number; by: number; moving: number }>((res) => {
      document.querySelector('[data-stream="hero"]')!.addEventListener('stream-arrive', (e) => {
        const btn = [...document.querySelectorAll<HTMLElement>('.hero-cta .btn')].find((b) => b.getClientRects().length)!;
        const r = btn.getBoundingClientRect();
        const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
        res({ x, y, bx: r.left + r.width / 2, by: r.top + r.height / 2, moving: btn.getAnimations().length });
      }, { once: true });
    }));
    expect(Math.abs(hit.x - hit.bx)).toBeLessThan(2);
    expect(Math.abs(hit.y - hit.by)).toBeLessThan(2);
    expect(hit.moving).toBe(1);
    // The wiggle leaves nothing behind.
    await page.waitForTimeout(600);
    const btn = page.locator('.hero-cta .btn').first();
    expect(await btn.evaluate((b) => [b.getAnimations().length, getComputedStyle(b).rotate, getComputedStyle(b).translate])).toEqual([0, 'none', 'none']);
  });
}

test('a downloaded thumbnail stays visible while it leaves: it shrinks and fades on the way', async ({ page }) => {
  await page.goto('./');
  // The flight is drawn on the top canvas (above the text wash). Per frame until the landing: how much of it the
  // flying picture covers (opaque pixels, sampled on a grid).
  const covered = await page.evaluate(() => new Promise<number[]>((res) => {
    const c = document.querySelector<HTMLCanvasElement>('[data-stream-fx="hero"]')!;
    const g = c.getContext('2d', { willReadFrequently: true })!;
    const out: number[] = [];
    const tick = () => {
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 90) n++;
      out.push(n);
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    document.querySelector('[data-stream="hero"]')!.addEventListener('stream-arrive', () => { cancelAnimationFrame(raf); res(out); }, { once: true });
  }));
  const flying = covered.slice(-90).filter((n) => n > 60); // the last ~1.5 s: the flight (sparks alone stay well under)
  expect(flying.length).toBeGreaterThan(20); // seen over many frames, not gone at once
  const big = Math.max(...flying), late = flying[flying.length - 1];
  expect(late).toBeLessThan(big * 0.5); // smaller and fainter as it reaches the button
});

test('Reduce motion: one still frame with thumbnails, no downloads', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('[data-stream="hero"][data-ready]')).toBeAttached({ timeout: 8_000 });
  // The hero's own layout settles first (fonts, the demo's scale), and the still frame follows it; then it stays.
  let a = await print(page, 'hero');
  await expect.poll(async () => { const was = a.h; await page.waitForTimeout(700); a = await print(page, 'hero'); return a.h === was; }, { timeout: 10_000 }).toBe(true);
  expect(a.lit).toBeGreaterThan(50);
  const landed = await page.evaluate(() => new Promise<boolean>((res) => {
    document.querySelector('[data-stream="hero"]')!.addEventListener('stream-arrive', () => res(true), { once: true });
    setTimeout(() => res(false), 6000);
  }));
  expect(landed).toBe(false);
  expect((await print(page, 'hero')).h).toBe(a.h);
});

test('no background film', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('video[data-back]')).toHaveCount(0);
});

test('light mode: no dark block behind the hero or the CTA', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('./');
  const dark = (sel: string) => page.evaluate((sel) => {
    const el = document.querySelector<HTMLElement>(sel)!;
    const bg = getComputedStyle(el).backgroundColor;
    const [r, g, b, a = 1] = bg.match(/[\d.]+/g)!.map(Number);
    return a > 0.05 && (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
  }, sel);
  for (const sel of ['.hero', '.hero-back', 'section.fin', '.fin-back']) expect(await dark(sel), sel).toBe(false);
  const title = await page.locator('.hero-title span').first().evaluate((el) => getComputedStyle(el).color);
  const [r, g, b] = title.match(/[\d.]+/g)!.map(Number);
  expect((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255).toBeLessThan(0.3); // dark text on the light ground
});
