// Light mode everywhere (BRIEF 5: "Nothing may appear as a dark block on a light page"): the demos follow the site's
// theme with the extension's and the app's own light palettes; the chips under the features reveal on scroll.
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

/** Is the element's own background dark (luminance under 0.35)? */
const dark = (page: Page, sel: string) => page.locator(sel).first().evaluate((el) => {
  const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)!.map(Number);
  const [r, g, b, a = 1] = m;
  return a > 0.05 && (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.35;
});

test('light mode: the demos and screens are light', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('./');
  for (const sel of ['.stage-hero .d-page', '.stage-try', '#try .ysd-toolbar']) expect(await dark(page, sel), sel).toBe(false);
  // The toolbar's theme button says what the extension says on light YouTube.
  await expect(page.locator('.stage-hero [data-t="btn-moon"]')).toHaveAttribute('aria-label', 'Switch to dark theme');
  await page.locator('#install').scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[component-url*="InstallSteps"]:not([ssr])')).toHaveCount(1, { timeout: 20_000 });
  // The desktop behind the install screens: its gradient's first stop is pale.
  const desk = await page.locator('.scr').first().evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(desk).toContain('rgb(234, 240, 253)');
  // The video pictures in the diagram and the "Your video comes first" card.
  for (const sel of ['.ext-pic', '.fy-player']) {
    const bg = await page.locator(sel).first().evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg, sel).toContain('rgb(201, 216, 251)');
  }
});

test('dark mode keeps YouTube\'s dark look in the demo', async ({ page }) => {
  await page.goto('./');
  expect(await dark(page, '.stage-hero .d-page')).toBe(true);
  await expect(page.locator('.stage-hero [data-t="btn-moon"]')).toHaveAttribute('aria-label', 'Switch to light theme');
});

test('the chips reveal when they come into view', async ({ page }) => {
  await page.goto('./');
  const chip = page.locator('.chips .chip').first();
  expect(await chip.evaluate((c) => getComputedStyle(c).opacity)).toBe('0');
  await chip.evaluate((c) => c.scrollIntoView({ block: 'center' }));
  await expect.poll(() => chip.evaluate((c) => getComputedStyle(c).opacity)).toBe('1');
});
