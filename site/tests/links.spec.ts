// Links: every link that leaves the page opens in a new tab (target="_blank", with noopener), except the download
// buttons: they save the file right where the visitor is (GitHub sends release files as attachments, so the page
// stays). Links within the page (#install, #faq, ...) stay in the same tab.
import { expect, test } from '@playwright/test';

for (const width of [1280, 390]) {
  test(`off-site links open a new tab, downloads and in-page links don't (${width} px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    const links = await page.locator('a[href]').evaluateAll((as) => as.map((a) => ({
      href: a.getAttribute('href')!, target: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '', download: a.hasAttribute('data-download'),
    })));
    const out = links.filter((l) => /^https?:/.test(l.href) && !l.download);
    const downloads = links.filter((l) => l.download);
    const inPage = links.filter((l) => l.href.startsWith('#'));
    expect(out.length).toBeGreaterThan(5);
    expect(downloads.length).toBeGreaterThanOrEqual(7);
    for (const l of out) {
      expect(l.target, l.href).toBe('_blank');
      expect(l.rel, l.href).toContain('noopener');
    }
    for (const l of [...downloads, ...inPage]) expect(l.target, l.href).toBeNull();
  });
}

test('every download button saves its file in this tab', async ({ page, context }) => {
  // GitHub's answer for a release file, without fetching the real one: an attachment.
  await context.route(/github\.com\/NyxiYT\/yt-download-manager\/releases\/.*\/download\//, (r) => r.fulfill({
    status: 200, body: 'file', contentType: 'application/octet-stream',
    headers: { 'Content-Disposition': `attachment; filename=${r.request().url().split('/').pop()}` },
  }));
  await page.goto('./');
  const start = page.url();
  const n = await page.locator('[data-download]').count();
  for (let i = 0; i < n; i++) {
    const href = await page.locator('[data-download]').nth(i).getAttribute('href');
    if (!href?.includes('/download/')) continue; // phones: the nav button points at #install
    const [dl] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-download]').nth(i).evaluate((a: HTMLElement) => a.click()), // hidden ones (other systems) too
    ]);
    expect(dl.suggestedFilename()).toBe(href.split('/').pop());
    await dl.cancel();
    expect(page.url()).toBe(start);
  }
  expect(context.pages()).toHaveLength(1);
});
