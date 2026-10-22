// Try it's thumbnail, subtitle and screenshot buttons save real files: the thumbnail straight from YouTube's image
// server (the largest it has, or the next size down), the subtitles from the tracks scripts/subs.mjs saved (the Short
// has YouTube's automatic English ones, the video has none and says so), a PNG of the film's frame. Each file is
// checked byte for byte, and each failure shows what went wrong.
import { readFile } from 'node:fs/promises';
import { expect, test, type Download, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });
const TITLE = 'Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film';

async function openTab(page: Page, tab: string) {
  await page.goto('./#try');
  await page.locator('#try .try-panel').scrollIntoViewIfNeeded();
  await page.locator('#try').getByRole('tab', { name: tab, exact: true }).click();
  return page.locator('#try .try-panel');
}
const bytes = async (d: Download) => readFile((await d.path())!);

test('the thumbnail button saves the largest JPG YouTube has', async ({ page }) => {
  const panel = await openTab(page, 'Video');
  await panel.getByRole('button', { name: 'Download thumbnail' }).click();
  const dlg = panel.getByRole('dialog', { name: 'Download thumbnail' });
  await expect(dlg.getByText('JPG · 1280×720')).toBeVisible({ timeout: 10_000 }); // the sizes are checked first
  const [dl] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: 'Download' }).click()]);
  expect(dl.suggestedFilename()).toBe(`${TITLE}.jpg`);
  const b = await bytes(dl);
  expect([...b.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]); // a JPEG
  expect(b.length).toBeGreaterThan(20_000);
  await expect(dlg).toHaveCount(0);
  await panel.getByRole('button', { name: 'Download history' }).click();
  await expect(panel.locator('.ysd-item').first()).toContainText('JPG');
});

test('a missing size falls back to the next one; none at all says so', async ({ page }) => {
  await page.route(/i\.ytimg\.com\/vi\/[^/]+\/maxresdefault\.jpg/, (r) => r.fulfill({ status: 404, body: '' }));
  const panel = await openTab(page, 'Video');
  await panel.getByRole('button', { name: 'Download thumbnail' }).click();
  const dlg = panel.getByRole('dialog', { name: 'Download thumbnail' });
  await expect(dlg.getByText(/JPG · 640×480/)).toBeVisible({ timeout: 10_000 });
  const [dl] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: 'Download' }).click()]);
  expect([...(await bytes(dl)).subarray(0, 2)]).toEqual([0xff, 0xd8]);

  await page.route(/i\.ytimg\.com\//, (r) => r.fulfill({ status: 404, body: '' }));
  await panel.getByRole('button', { name: 'Download thumbnail' }).click();
  await dlg.getByRole('button', { name: 'Download' }).click();
  await expect(dlg.getByRole('alert')).toHaveText('No thumbnail is available for this video.');
});

test('subtitles: the video says it has none', async ({ page }) => {
  const panel = await openTab(page, 'Video');
  await panel.getByRole('button', { name: 'Download subtitles' }).click();
  const dlg = panel.getByRole('dialog', { name: 'Download subtitles' });
  await expect(dlg).toContainText('This video has no subtitles');
  await expect(dlg.getByRole('button', { name: 'Download' })).toHaveCount(0);
});

test('subtitles: the Short\'s automatic English track as SRT, WebVTT and TTML', async ({ page }) => {
  const panel = await openTab(page, 'Shorts');
  const pick = async () => {
    await expect(panel.locator('[data-picker="subs"]')).toHaveCount(0); // the last one has closed (it fades out)
    {
      // The tab opens with the Short's menu showing; after a download its own button opens it again.
      const item = panel.getByRole('menuitem', { name: 'Download subtitles' });
      if (!(await item.count())) await panel.getByRole('button', { name: 'Download', exact: true }).first().click();
      await item.click();
    }
    return panel.getByRole('dialog', { name: 'Download subtitles' });
  };
  await expect(panel.getByRole('menuitem', { name: 'Download subtitles' })).toBeVisible();
  let dlg = await pick();
  await expect(dlg).toContainText('English (auto-generated)');
  let [dl] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: 'Download' }).click()]);
  expect(dl.suggestedFilename()).toMatch(/\.en\.srt$/);
  const srt = (await bytes(dl)).toString('utf8');
  expect(srt).toMatch(/^1\n\d\d:\d\d:\d\d,\d{3} --> \d\d:\d\d:\d\d,\d{3}\n\S/);

  dlg = await pick();
  await dlg.getByRole('radio', { name: 'WebVTT' }).click();
  [dl] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: 'Download' }).click()]);
  expect(dl.suggestedFilename()).toMatch(/\.en\.vtt$/);
  expect((await bytes(dl)).toString('utf8')).toMatch(/^WEBVTT\n\n\d\d:\d\d:\d\d\.\d{3} --> /);

  dlg = await pick();
  await dlg.getByRole('radio', { name: 'TTML' }).click();
  [dl] = await Promise.all([page.waitForEvent('download'), dlg.getByRole('button', { name: 'Download' }).click()]);
  expect((await bytes(dl)).toString('utf8')).toContain('<tt');
});

test('subtitles: a failed list says so, Retry tries again', async ({ page }) => {
  await page.route(/media\/subs\/[^/]+\.json$/, (r) => r.abort());
  const panel = await openTab(page, 'Video');
  await panel.getByRole('button', { name: 'Download subtitles' }).click();
  const dlg = panel.getByRole('dialog', { name: 'Download subtitles' });
  await expect(dlg.getByRole('alert')).toContainText("Couldn't load the list of subtitles");
  await page.unroute(/media\/subs\/[^/]+\.json$/);
  await dlg.getByRole('button', { name: 'Retry' }).click();
  await expect(dlg).toContainText('This video has no subtitles');
});

test('the screenshot button saves the film\'s frame as a PNG', async ({ page }) => {
  const panel = await openTab(page, 'Video');
  await expect.poll(() => panel.locator('video').evaluate((v: HTMLVideoElement) => v.readyState), { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
  const [dl] = await Promise.all([page.waitForEvent('download'), panel.getByRole('button', { name: 'Save a screenshot of this frame' }).click()]);
  expect(dl.suggestedFilename()).toMatch(new RegExp(`^${TITLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\d\\d-\\d\\d-\\d\\d\\.png$`));
  expect([...(await bytes(dl)).subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
});
