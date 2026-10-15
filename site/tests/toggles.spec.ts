// Theme and Reduce motion (BRIEF 7.5, 14 #9): icon buttons in the nav with tooltips, they work and are remembered;
// on phones they sit in the menu; the footer has no settings any more.
import { expect, test } from '@playwright/test';

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('theme: switches, says what a click does, is remembered', async ({ page }) => {
    await page.goto('./');
    const btn = page.locator('[data-nav-bar] [data-theme-btn]');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-label', 'Light theme');
    await btn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(btn).toHaveAttribute('aria-label', 'Dark theme');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('[data-nav-bar] [data-theme-btn]')).toHaveAttribute('aria-label', 'Dark theme');
  });

  test('reduce motion: pressed state, applies at once, is remembered', async ({ page }) => {
    await page.goto('./');
    const btn = page.locator('[data-nav-bar] [data-motion-btn]');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
    await page.reload();
    await expect(page.locator('[data-nav-bar] [data-motion-btn]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('tooltips show on hover', async ({ page }) => {
    await page.goto('./');
    const btn = page.locator('[data-nav-bar] [data-motion-btn]');
    await btn.hover();
    await expect(btn.locator('.tg-tip')).toHaveText('Reduce motion');
    await expect.poll(() => btn.locator('.tg-tip').evaluate((t) => getComputedStyle(t).opacity)).toBe('1');
  });

  test('no settings in the footer', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('footer [data-theme-btn], footer [data-motion-btn], footer input[type=checkbox]')).toHaveCount(0);
  });
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('both settings are in the menu', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('[data-nav-bar] [data-theme-btn]')).toBeHidden();
    await page.locator('[data-menu-open]').click();
    const sheet = page.locator('[data-menu]');
    await expect(sheet.locator('[data-theme-btn]')).toBeVisible();
    await expect(sheet.locator('[data-motion-btn]')).toBeVisible();
    await sheet.locator('[data-theme-btn]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(sheet.locator('[data-theme-btn]')).toContainText('Dark theme');
  });
});
