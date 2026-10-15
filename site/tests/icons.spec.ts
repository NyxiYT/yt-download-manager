// Icon meanings: every icon matches its label, and no icon appears twice in the same list.
import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

const kinds = (list: string) => (els: Element[]) => els.map((e) => [...e.querySelector('svg.ai')!.classList].find((c) => c.startsWith('ai-'))!);

test('feature cards: the right icon for each, none twice', async ({ page }) => {
  await page.goto('./');
  const icons = await page.locator('[data-card] .card-text h3').evaluateAll(kinds('cards'));
  expect(icons).toEqual(['ai-res', 'ai-resume', 'ai-bolt', 'ai-yield', 'ai-lock', 'ai-refresh']);
  expect(new Set(icons).size).toBe(icons.length);
  await expect(page.locator('[data-card]', { hasText: 'Members and age-restricted' }).locator('h3 svg.ai-lock')).toHaveCount(1);
});

test('feature chips: none twice', async ({ page }) => {
  await page.goto('./');
  const icons = await page.locator('.chips .chip').evaluateAll(kinds('chips'));
  expect(icons.length).toBeGreaterThan(0);
  expect(new Set(icons).size).toBe(icons.length);
});

test('the lock clicks shut on hover', async ({ page }) => {
  await page.goto('./');
  const card = page.locator('[data-card]', { hasText: 'Members and age-restricted' });
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  expect(await card.locator('.ai-lock .m-shackle').evaluate((p) => getComputedStyle(p).animationName)).toBe('lock-click');
});
