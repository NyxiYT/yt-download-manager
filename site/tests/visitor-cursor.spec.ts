// The visitor's cursor (BRIEF 7.3, 14 #11): the showcases' own arrow, on the pointer 1:1 with no lag or trailing
// ring, and its variants: hover halo, Try it pill, download arrow, grab hand on trim handles; native cursor hidden
// (but back during keyboard navigation).
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

const cur = (page: Page) => page.locator('[data-cursor-el]');
/** The cursor script loads a moment after the page; move until it answers. */
async function wake(page: Page, x = 300, y = 300) {
  let i = 0;
  await expect.poll(async () => { await page.mouse.move(x + (i++ % 2), y); return cur(page).getAttribute('data-on'); }).toBe('');
}
const center = async (page: Page, sel: string) => { const b = (await page.locator(sel).first().boundingBox())!; return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };

test('the same arrow as the showcases, on the pointer 1:1, no ring', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.cur-ring, .cur-dot')).toHaveCount(0);
  await wake(page, 400, 300);
  await page.mouse.move(437, 311);
  // Read in the same task as the move: no spring, no frame of delay.
  expect(await cur(page).evaluate((el) => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 437, 311)');
  await expect(cur(page)).toHaveAttribute('data-on', '');
  // It is really drawn at its full size (not squeezed by the 0 px wide box).
  const box = (await page.locator('[data-cursor-el] .d-cursor-svg').boundingBox())!;
  expect([Math.round(box.width), Math.round(box.height)]).toEqual([26, 26]);
  const mine = await page.locator('[data-cursor-el] .d-cursor-svg path').getAttribute('d');
  await expect(page.locator('.stage-hero .d-cursor .d-cursor-svg path')).toHaveAttribute('d', mine!);
  expect(await page.locator('button').first().evaluate((b) => getComputedStyle(b).cursor)).toBe('none');
});

test('variants: hover halo, download arrow, Try it pill, grab hand', async ({ page }) => {
  await page.goto('./');
  await wake(page);
  const nav = await center(page, '[data-nav-link]');
  await page.mouse.move(nav.x, nav.y);
  await expect(cur(page)).toHaveAttribute('data-hover', '');
  await expect(cur(page)).not.toHaveAttribute('data-pill', /./);

  const dl = await center(page, '.hero [data-download]:visible');
  await page.mouse.move(dl.x, dl.y);
  await expect(cur(page)).toHaveAttribute('data-pill', 'download');

  await page.locator('#try').scrollIntoViewIfNeeded();
  await page.locator('.try-tab', { hasText: 'Clip' }).click();
  const panel = await center(page, '#try .try-panel');
  await page.mouse.move(panel.x, panel.y + 40);
  await expect(cur(page)).toHaveAttribute('data-pill', 'try');
  await expect(page.locator('.cur-try')).toHaveText('Try it');

  const dot = page.locator('#try .ysd-thumb-dot').first();
  await expect(dot).toBeVisible();
  await dot.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const d = await center(page, '#try .ysd-thumb-dot');
  await page.mouse.move(d.x, d.y);
  await expect(cur(page)).toHaveAttribute('data-drag', '');
});

test('the hero demo is inert: no hover look over it', async ({ page }) => {
  await page.goto('./');
  await wake(page);
  const b = await center(page, '.stage-hero [data-t="btn-video"]');
  await page.mouse.move(b.x, b.y);
  await expect(cur(page)).not.toHaveAttribute('data-hover', '');
});

test('keyboard navigation brings the native cursor back', async ({ page }) => {
  await page.goto('./');
  await wake(page);
  await expect(page.locator('html')).toHaveAttribute('data-cursor', '');
  await page.keyboard.press('Tab');
  await expect(page.locator('html')).not.toHaveAttribute('data-cursor', '');
  await expect(cur(page)).not.toHaveAttribute('data-on', '');
});
