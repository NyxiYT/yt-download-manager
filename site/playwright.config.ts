// The showcase cursor tests (tests/cursor.spec.ts), run against the built site: npm run build, then npm run test:cursor.
// PW_CHANNEL=chrome uses the installed Chrome instead of Playwright's own Chromium.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 120_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4331/yt-download-manager/', channel: process.env.PW_CHANNEL || undefined },
  webServer: { command: 'npx astro preview --port 4331', url: 'http://localhost:4331/yt-download-manager/', reuseExistingServer: true, timeout: 60_000 },
});
