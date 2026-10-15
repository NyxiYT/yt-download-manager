// Install steps: they advance by themselves 1, 2, 3, 1; each lasts what its label says; a click
// pins and loops a step, "Play all steps" resumes; leaving and coming back resumes; off screen it stands still.
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

const runs = (page: Page) => page.evaluate(() => (window as unknown as { __installRuns?: { n: number; ms: number; rest: number }[] }).__installRuns ?? []);
const activeStep = (page: Page) => page.evaluate(() => Number(document.querySelector('.step[aria-selected="true"] .step-n')?.textContent));
const toMs = (label: string) => { const [m, s] = label.split(':').map(Number); return (m * 60 + s) * 1000; };

async function open(page: Page) {
  await page.goto('./#install');
  await page.locator('#install .steps').scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[component-url*="InstallSteps"]:not([ssr])')).toHaveCount(1, { timeout: 20_000 });
}

test('advances 1, 2, 3, 1, each step as long as its label', async ({ page }) => {
  await open(page);
  const labels = await page.locator('.step-loop').allTextContents();
  await expect.poll(async () => (await runs(page)).length, { timeout: 40_000 }).toBeGreaterThanOrEqual(3);
  await expect.poll(() => activeStep(page)).toBe(1);
  const r = await runs(page);
  expect(r.slice(0, 3).map((x) => x.n)).toEqual([1, 2, 3]);
  r.slice(0, 3).forEach((x, i) => {
    expect(Math.abs(x.ms - toMs(labels[i]))).toBeLessThan(200);
    expect(x.rest).toBeGreaterThan(800); // the last frame is on screen long enough to read
  });
});

test('the progress line fills, and stands still off screen', async ({ page }) => {
  await open(page);
  const fill = () => page.evaluate(() => {
    const t = getComputedStyle(document.querySelector<HTMLElement>('.step[aria-selected="true"] .step-line i')!).transform;
    return t === 'none' ? 0 : new DOMMatrix(t).a;
  });
  const a = await fill();
  await page.waitForTimeout(1000);
  const b = await fill();
  expect(b).toBeGreaterThan(a);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const c = await fill();
  await page.waitForTimeout(1500);
  expect(await fill()).toBe(c);
});

test('a click pins and loops that step; Play all steps resumes', async ({ page }) => {
  await open(page);
  await page.locator('#step-tab-2').click();
  const all = page.getByRole('button', { name: 'Play all steps' });
  await expect(all).toBeVisible();
  // Pinned: after a full loop it is still step 2, and it played step 2 again.
  await page.waitForTimeout(9_000);
  expect(await activeStep(page)).toBe(2);
  expect((await runs(page)).at(-1)?.n).toBe(2);
  await all.click();
  await expect(all).toBeHidden();
  await expect.poll(() => activeStep(page), { timeout: 10_000 }).toBe(3);
});

test('leaving the section and coming back resumes the walk', async ({ page }) => {
  await open(page);
  await page.locator('#step-tab-1').click();
  const all = page.getByRole('button', { name: 'Play all steps' });
  await expect(all).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.locator('#install .steps').scrollIntoViewIfNeeded();
  await expect(all).toBeHidden();
  await expect.poll(() => activeStep(page), { timeout: 10_000 }).toBe(2);
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('the screen sits above the steps', async ({ page }) => {
    await open(page);
    const stage = (await page.locator('.steps-stage').boundingBox())!;
    const list = (await page.locator('.steps-list').boundingBox())!;
    expect(stage.y + stage.height).toBeLessThanOrEqual(list.y + 1);
  });
});
