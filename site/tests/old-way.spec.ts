// "No more converter sites.": no icons, two equal columns, every cell on one line at 1280 px,
// the strike draws and ours fades in once; on phones each row is a small card.
import { expect, test } from '@playwright/test';

const table = '.old-table';

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('no icons, equal columns, one line per cell', async ({ page }) => {
    await page.goto('./');
    await page.locator(table).scrollIntoViewIfNeeded();
    await expect(page.locator(`${table} svg, ${table} img`)).toHaveCount(0);
    const [a, b] = await page.locator(`${table} th`).evaluateAll((ths) => ths.map((t) => t.getBoundingClientRect().width));
    expect(Math.abs(a - b)).toBeLessThanOrEqual(1);
    const cells = await page.locator(`${table} td span`).evaluateAll((spans) => spans.map((s) => ({
      text: s.textContent, lines: s.getClientRects().length, fits: s.parentElement!.scrollWidth <= s.parentElement!.clientWidth + 1,
    })));
    expect(cells).toHaveLength(8);
    for (const c of cells) expect(c, c.text!).toEqual({ text: c.text, lines: 1, fits: true });
    expect(await page.locator(table).evaluate((t) => t.getBoundingClientRect().width)).toBeLessThanOrEqual(960);
  });

  test('the strike draws, then ours fades in', async ({ page }) => {
    await page.goto('./');
    await page.locator(table).scrollIntoViewIfNeeded();
    const last = page.locator(`${table} tbody tr`).last();
    await expect(last).toHaveClass(/\bin\b/);
    await expect.poll(() => last.locator('.now span').evaluate((s) => getComputedStyle(s).opacity), { timeout: 3_000 }).toBe('1');
    const strike = await last.locator('.was span').evaluate((s) => getComputedStyle(s).backgroundSize);
    expect(strike).toMatch(/^100%/);
  });
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('each row is a small card, old item above ours', async ({ page }) => {
    await page.goto('./');
    await page.locator(table).scrollIntoViewIfNeeded();
    const rows = await page.locator(`${table} tbody tr`).evaluateAll((trs) => trs.map((tr) => {
      const [was, now] = [...tr.querySelectorAll('td')].map((td) => td.getBoundingClientRect());
      return { display: getComputedStyle(tr).display, above: was.bottom <= now.top + 1 };
    }));
    for (const r of rows) expect(r).toEqual({ display: 'grid', above: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
});
