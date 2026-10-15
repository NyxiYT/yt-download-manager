// The shared playback model (lib/playback.ts, BRIEF 7.7): scenes loop while in view, never rest frozen, pause off
// screen, and there are no replay buttons. The cursor tests (cursor.spec.ts) cover the hero, Try it and install.
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

/** Samples a number on the page every 100 ms for ms milliseconds. */
async function sample(page: Page, fn: () => number, ms: number) {
  const out: number[] = [];
  for (let t = 0; t < ms; t += 100) { out.push(await page.evaluate(fn)); await page.waitForTimeout(100); }
  return out;
}

test('no replay buttons anywhere', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('button', { name: /replay/i })).toHaveCount(0);
  await expect(page.locator('.replay, [data-how-replay]')).toHaveCount(0);
});

test('the diagram loops while in view and pauses off screen', async ({ page }) => {
  await page.goto('./');
  await page.locator('[data-net]').scrollIntoViewIfNeeded();
  // The status chip says "Connected" for seconds each loop, and is reset when the next loop starts. (The map's own
  // fade is too short to sample reliably.) A loop is under 12 s, so two flips to "Connected" fit in 2 loops.
  const on = () => Number(getComputedStyle(document.querySelector('.chip-b')!).opacity);
  const seen = await sample(page, on, 24_000);
  const flips = seen.filter((v, i) => i > 0 && v > 0.9 && seen[i - 1] <= 0.9).length;
  expect(flips).toBeGreaterThanOrEqual(2);
  // Off screen: the file card stands still.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const file = () => Number(getComputedStyle(document.querySelector('[data-file]')!).opacity);
  const a = await page.evaluate(file);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(file)).toBe(a);
});

test('features: the spotlight walks the cards, one at a time, and pauses off screen', async ({ page }) => {
  await page.goto('./');
  const grid = page.locator('[data-feats]');
  await grid.scrollIntoViewIfNeeded();
  const spot = () => page.evaluate(() => [...document.querySelectorAll('[data-card]')].findIndex((c) => c.hasAttribute('data-spot')));
  await expect.poll(spot, { timeout: 5_000 }).toBe(0);
  await expect(page.locator('[data-card][data-spot]')).toHaveCount(1);
  // About 4 s per card, in order.
  await expect.poll(spot, { timeout: 6_000 }).toBe(1);
  await expect(page.locator('[data-card][data-spot]')).toHaveCount(1);
  // Off screen: nothing in the grid runs, and the spotlight stays put.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const at = await spot();
  const running = await page.evaluate(() => [...document.querySelectorAll('[data-card] .frag')].flatMap((f) => f.getAnimations({ subtree: true })).filter((x) => x.playState === 'running').length);
  expect(running).toBe(0);
  await page.waitForTimeout(5_000);
  expect(await spot()).toBe(at);
});

test('features: hover plays and loops that card, leaving goes on with the next', async ({ page }) => {
  await page.goto('./');
  await page.locator('[data-feats]').scrollIntoViewIfNeeded();
  const spot = () => page.evaluate(() => [...document.querySelectorAll('[data-card]')].findIndex((c) => c.hasAttribute('data-spot')));
  await expect.poll(spot, { timeout: 5_000 }).toBe(0);
  const third = page.locator('[data-card]').nth(2);
  await third.hover();
  await expect.poll(spot).toBe(2);
  // It keeps the spotlight well past a turn, and restarts (fades out) on its own.
  const op = () => Number(getComputedStyle(document.querySelectorAll<HTMLElement>('[data-card] .frag')[2]).opacity);
  const seen = await sample(page, op, 9_000);
  expect(await spot()).toBe(2);
  expect(Math.min(...seen)).toBeLessThan(0.5);
  await page.mouse.move(5, 5);
  await expect.poll(spot).toBe(3);
});

test.describe('features on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('the card nearest the middle of the screen plays', async ({ page }) => {
    await page.goto('./');
    for (const i of [1, 4]) {
      await page.locator('[data-card]').nth(i).evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('[data-card]')].findIndex((c) => c.hasAttribute('data-spot')))).toBe(i);
    }
  });
});

for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  test(`no sideways scrolling at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    await page.locator('[data-feats]').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    const cols = await page.evaluate(() => getComputedStyle(document.querySelector('[data-feats]')!).gridTemplateColumns.split(' ').length);
    expect(cols).toBe(width >= 1024 ? 3 : width >= 640 ? 2 : 1);
  });
}
