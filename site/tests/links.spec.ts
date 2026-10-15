// Links (Nyxi, 15 Oct 2026): every link that leaves the page opens in a new tab (target="_blank", with noopener);
// links within the page (#install, #faq, ...) stay in the same tab.
import { expect, test } from '@playwright/test';

for (const width of [1280, 390]) {
  test(`off-site links open a new tab, in-page links don't (${width} px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    const links = await page.locator('a[href]').evaluateAll((as) => as.map((a) => ({
      href: a.getAttribute('href')!, target: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '',
    })));
    const out = links.filter((l) => /^https?:/.test(l.href));
    const inPage = links.filter((l) => l.href.startsWith('#'));
    expect(out.length).toBeGreaterThan(5);
    for (const l of out) {
      expect(l.target, l.href).toBe('_blank');
      expect(l.rel, l.href).toContain('noopener');
    }
    for (const l of inPage) expect(l.target, l.href).toBeNull();
  });
}
