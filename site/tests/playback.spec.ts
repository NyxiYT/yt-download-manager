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
  const op = () => Number(getComputedStyle(document.querySelector('[data-net]')!).opacity);
  // A loop is under 12 s: within that the map fades out at the end and back in at the start.
  const seen = await sample(page, op, 13_000);
  expect(Math.min(...seen)).toBeLessThan(0.2);
  expect(seen.lastIndexOf(Math.max(...seen))).toBeGreaterThan(seen.indexOf(Math.min(...seen)));
  // Off screen: the file card stands still.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const file = () => Number(getComputedStyle(document.querySelector('[data-file]')!).opacity);
  const a = await page.evaluate(file);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(file)).toBe(a);
});

test('a feature card loops while in view and pauses off screen', async ({ page }) => {
  await page.goto('./');
  const card = page.locator('.card[data-loop]').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/\bplay\b/, { timeout: 5_000 });
  // It fades out and restarts after its animations and the 1.8 s hold.
  const op = () => Number(getComputedStyle(document.querySelector('.card[data-loop] .frag')!).opacity);
  const seen = await sample(page, op, 7_000);
  expect(Math.min(...seen)).toBeLessThan(0.5);
  expect(seen.at(-1)).toBe(1);
  // Off screen: its animations are paused, not running.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const running = await page.evaluate(() => document.querySelector('.card[data-loop] .frag')!.getAnimations({ subtree: true }).filter((x) => x.playState === 'running').length);
  expect(running).toBe(0);
});
