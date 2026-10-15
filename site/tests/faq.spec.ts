// FAQ: opening animates the height (about 260 ms), the answer fades in, the plus turns into a
// cross; closing reverses; one answer open at a time.
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

/** Clicks question i and samples answer j's height and its text's opacity every frame for 500 ms. */
function clickAndWatch(page: Page, i: number, j: number) {
  return page.evaluate(async ({ i, j }) => {
    const q = document.querySelectorAll<HTMLButtonElement>('.faq-q')[i];
    const a = document.querySelectorAll<HTMLElement>('.faq-a')[j];
    const out: { t: number; h: number; o: number }[] = [];
    const t0 = performance.now();
    q.click();
    await new Promise<void>((done) => {
      const tick = () => {
        const p = a.querySelector('p');
        out.push({ t: performance.now() - t0, h: a.getBoundingClientRect().height, o: p ? Number(getComputedStyle(p).opacity) : 0 });
        if (performance.now() - t0 < 500) requestAnimationFrame(tick); else done();
      };
      requestAnimationFrame(tick);
    });
    return out;
  }, { i, j });
}

/** The two bars of question i's mark, as angles in degrees. */
const mark = (page: Page, i: number) => page.evaluate((i) => {
  const m = document.querySelectorAll('.faq-mark')[i];
  return (['::before', '::after'] as const).map((p) => {
    const t = getComputedStyle(m, p).transform;
    const x = new DOMMatrix(t === 'none' ? undefined : t);
    return Math.round((Math.atan2(x.b, x.a) * 180) / Math.PI + 360) % 360;
  });
}, i);

test('opening and closing animate, the plus turns into a cross, one open at a time', async ({ page }) => {
  await page.goto('./#faq');
  await page.locator('#faq .faq-list').scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[component-url*="Faq"]:not([ssr])')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('.faq-q').first()).toHaveAttribute('data-state', 'open');

  // Open the second: its height grows through values in between, its text fades in.
  const open = await clickAndWatch(page, 1, 1);
  const full = open.at(-1)!.h;
  expect(full).toBeGreaterThan(20);
  const mid = open.filter((s) => s.h > 1 && s.h < full - 1);
  expect(mid.length).toBeGreaterThanOrEqual(3);
  expect(open.find((s) => s.h >= full - 1)!.t).toBeLessThan(400);
  expect(open.some((s) => s.o > 0.05 && s.o < 0.95)).toBe(true);
  // One at a time: the first closed.
  await expect(page.locator('.faq-q').first()).toHaveAttribute('data-state', 'closed');
  await expect(page.locator('.faq-a').first()).toBeHidden();

  // The plus turned 45° into a cross; the closed one is a plus again.
  await page.waitForTimeout(300);
  expect(await mark(page, 1)).toEqual([45, 135]);
  expect(await mark(page, 0)).toEqual([0, 90]);

  // Close it again: the height shrinks through values in between.
  const close = await clickAndWatch(page, 1, 1);
  expect(close.filter((s) => s.h > 1 && s.h < full - 1).length).toBeGreaterThanOrEqual(3);
  await expect(page.locator('.faq-a').nth(1)).toBeHidden();
});
