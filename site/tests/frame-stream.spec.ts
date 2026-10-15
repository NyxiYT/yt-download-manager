// The frame stream: the hero and the final call to action draw it on a canvas, it moves
// while in view and stands still off screen, the old background film is gone, the tiles stay within budget, and
// light mode has no dark block behind the hero.
import { readdirSync, statSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

/** A cheap fingerprint of what the canvas shows right now. */
const print = (page: Page, which: string) => page.evaluate((which) => {
  const c = document.querySelector<HTMLCanvasElement>(`[data-stream="${which}"]`)!;
  const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
  let h = 0, lit = 0;
  for (let i = 0; i < d.length; i += 97) { h = (h * 31 + d[i]) | 0; if (d[i + 3] > 8) lit++; }
  return { h, lit };
}, which);

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
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const a = await print(page, 'cta');
  await page.waitForTimeout(1200);
  expect((await print(page, 'cta')).h).toBe(a.h);
});

test('no background film; tiles under 600 KB', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('video[data-back]')).toHaveCount(0);
  const dir = new URL('../public/media/tiles/', import.meta.url);
  const total = readdirSync(dir).reduce((n, f) => n + statSync(new URL(f, dir)).size, 0);
  expect(total).toBeLessThan(600 * 1024);
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
