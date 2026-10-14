// The drawn cursor must hit what it clicks, at every width. Each showcase pauses at every press (choreo.ts calls
// window.__choreoPause); the test measures the cursor's tip and the target itself, independently of the page's
// own bookkeeping, and checks that the tip lies inside the target's box.
import { expect, test, type Page } from '@playwright/test';

const WIDTHS = [390, 768, 1280, 1920];
interface Seen { show: string; target: string; inside: boolean; tip: { x: number; y: number }; box: { left: number; top: number; right: number; bottom: number } }

async function watch(page: Page) {
  const seen: Seen[] = [];
  await page.exposeFunction('__choreoPauseNode', async (p: { show: string; target: string }) => {
    const m = await page.evaluate(({ show, target }) => {
      const root = show === 'hero' ? document.querySelector('.stage-hero') : document.querySelector('.stage-scr');
      const cur = root?.querySelector(show === 'hero' ? '.d-cursor' : '.s-cursor')?.getBoundingClientRect();
      const el = root?.querySelector(`[data-t="${target}"]`)?.getBoundingClientRect();
      return cur && el ? { tip: { x: cur.left, y: cur.top }, box: { left: el.left, top: el.top, right: el.right, bottom: el.bottom } } : null;
    }, p);
    if (!m) return;
    const inside = m.tip.x >= m.box.left && m.tip.x <= m.box.right && m.tip.y >= m.box.top && m.tip.y <= m.box.bottom;
    seen.push({ show: p.show, target: p.target, inside, ...m });
  });
  await page.addInitScript(() => {
    (window as unknown as { __choreoPause: (p: unknown) => Promise<void> }).__choreoPause = (p) =>
      (window as unknown as { __choreoPauseNode: (p: unknown) => Promise<void> }).__choreoPauseNode(p);
  });
  return seen;
}

const misses = (seen: Seen[]) => seen.filter((s) => !s.inside).map((s) => `${s.show} → ${s.target}: tip ${Math.round(s.tip.x)},${Math.round(s.tip.y)} outside ${JSON.stringify(s.box)}`);

for (const width of WIDTHS) {
  test.describe(`${width} px`, () => {
    test.use({ viewport: { width, height: width < 768 ? 844 : 900 } });

    test('hero intro', async ({ page }) => {
      const seen = await watch(page);
      await page.goto('./');
      if (width < 720) {
        // Phones play the intro without a cursor: no presses, and the download still starts.
        await expect(page.locator('.stage-hero .d-page[data-intro="done"]')).toHaveCount(1, { timeout: 20_000 });
        expect(seen).toHaveLength(0);
        return;
      }
      await expect(page.locator('.stage-hero .d-page[data-intro="done"]')).toHaveCount(1, { timeout: 30_000 });
      expect(seen.map((s) => s.target)).toEqual(['btn-video', 'select', 'dd-0', 'download']);
      expect(misses(seen)).toEqual([]);
    });

    for (const step of [1, 2, 3]) {
      test(`install step ${step}`, async ({ page }) => {
        const seen = await watch(page);
        await page.goto('./#install');
        await page.locator('#install').scrollIntoViewIfNeeded();
        // the stepper is hydrated when it comes into view; click only once it can answer
        await expect(page.locator('astro-island[component-url*="InstallSteps"]:not([ssr])')).toHaveCount(1, { timeout: 20_000 });
        await page.locator(`#step-tab-${step}`).click();
        await expect(page.locator(`#step-tab-${step}`)).toHaveAttribute('aria-selected', 'true');
        const want = { 1: ['dl-file', 'ss-more', 'ss-run'], 2: ['setup-install', 'setup-open'], 3: ['app-add', 'ext-dev', 'ext-load', 'fd-bar', 'fd-select'] }[step]!;
        await expect.poll(() => seen.filter((s) => s.show === `install-${step}`).length, { timeout: 40_000 }).toBeGreaterThanOrEqual(want.length);
        const mine = seen.filter((s) => s.show === `install-${step}`).slice(0, want.length);
        expect(mine.map((s) => s.target)).toEqual(want);
        expect(misses(mine)).toEqual([]);
      });
    }
  });
}
