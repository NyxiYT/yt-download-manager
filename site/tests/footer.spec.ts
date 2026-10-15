// The footer (BRIEF 8.12, 14 #10): brand block plus Product, Help, Project, Legal; legal line left and the film's
// credit right under a hairline; every in-page link has a target; no settings.
import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test('brand block and the four columns, with the brief\'s links', async ({ page }) => {
  await page.goto('./');
  const foot = page.locator('footer.foot');
  await expect(foot.locator('.foot-line')).toHaveText('Free YouTube downloader for Windows.');
  await expect(foot.locator('.foot-dl:visible')).toHaveText('Download');
  const cols = await foot.locator('.foot-col').evaluateAll((navs) => navs.map((n) => ({
    title: n.querySelector('.foot-h')!.textContent, links: [...n.querySelectorAll('a')].map((a) => a.textContent),
  })));
  expect(cols).toEqual([
    { title: 'Product', links: ['Download', 'Features', 'How it works', 'Install'] },
    { title: 'Help', links: ['FAQ', 'Full guide', 'Report a bug'] },
    { title: 'Project', links: ['GitHub', 'Changelog', 'Support the project'] },
    { title: 'Legal', links: ['Privacy', 'License', 'Third-party licenses'] },
  ]);
  // Every #link points at a section that exists.
  const missing = await foot.locator('a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!).filter((h) => !document.querySelector(h)));
  expect(missing).toEqual([]);
});

test('bottom bar: legal left, credit right, hairline above; no settings', async ({ page }) => {
  await page.goto('./');
  const [legal, credit] = await page.locator('.foot-bottom p').all();
  await expect(legal).toHaveText("Only download videos you're allowed to. Not affiliated with YouTube or Google.");
  await expect(credit).toContainText('Big Buck Bunny');
  const l = (await legal.boundingBox())!, c = (await credit.boundingBox())!;
  expect(c.x).toBeGreaterThan(l.x + l.width);
  expect(await page.locator('.foot-bottom').evaluate((e) => getComputedStyle(e).borderTopWidth)).toBe('1px');
  await expect(page.locator('footer button, footer input')).toHaveCount(0);
});
