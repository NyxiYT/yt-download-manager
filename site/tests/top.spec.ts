// The top of the page (BRIEF 7.5, 14 #8): no band above the nav, the hero starts at the very top under the floating
// nav, which sits 16 px from the top on desktop and 12 px on phones.
import { expect, test } from '@playwright/test';

for (const [width, gap] of [[1280, 16], [390, 12]] as const) {
  test(`hero at the top edge, nav ${gap} px down at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('./');
    const top = await page.evaluate(() => ({
      main: document.querySelector('main')!.getBoundingClientRect().top,
      hero: document.querySelector('.hero')!.getBoundingClientRect().top,
      nav: document.querySelector('[data-nav-bar]')!.getBoundingClientRect().top,
    }));
    expect(top).toEqual({ main: 0, hero: 0, nav: gap });
  });
}

test('the skip link still appears on focus', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip');
  await expect(skip).toBeFocused();
  // It slides in (the button's transition), then sits fully on screen.
  await expect.poll(async () => (await skip.boundingBox())!.y).toBeGreaterThanOrEqual(0);
});
