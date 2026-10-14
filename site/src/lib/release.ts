// The latest release (version, date, installer sizes), read once while the site is built, so the page shows them
// without waiting. scripts/live.ts refreshes version and date in the browser if the build is more than a day old.
// Without GitHub's API, the newest version in CHANGELOG.md stands in and the sizes are left out.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface ReleaseInfo {
  version: string; // "1.12.0"
  date: string; // ISO date, "2026-10-13"
  sizes: Partial<Record<'x64' | 'x86' | 'zip', number>>; // bytes
}

const API = 'https://api.github.com/repos/NyxiYT/yt-download-manager';
const ASSETS = { x64: 'YTDownloadManager-Setup-x64.exe', x86: 'YTDownloadManager-Setup-x86.exe', zip: 'YTStandaloneDownloader-Extension.zip' } as const;

async function github(path: string): Promise<any> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'yt-download-manager-site' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const r = await fetch(API + path, { headers, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`GitHub ${path}: ${r.status}`);
  return r.json();
}

export const changelogText = () => readFile(resolve(process.cwd(), '../CHANGELOG.md'), 'utf8');

async function fromChangelog(): Promise<ReleaseInfo> {
  const m = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/m.exec(await changelogText());
  if (!m) throw new Error('no release in CHANGELOG.md');
  return { version: m[1], date: m[2], sizes: {} };
}

let cached: Promise<ReleaseInfo> | undefined;

export function latestRelease(): Promise<ReleaseInfo> {
  cached ??= (async () => {
    try {
      const rel = await github('/releases/latest');
      const sizes: ReleaseInfo['sizes'] = {};
      for (const [k, name] of Object.entries(ASSETS) as [keyof typeof ASSETS, string][]) {
        const a = (rel.assets ?? []).find((x: { name: string }) => x.name === name);
        if (a?.size) sizes[k] = a.size;
      }
      return { version: String(rel.tag_name).replace(/^v/, ''), date: String(rel.published_at).slice(0, 10), sizes };
    } catch (e) {
      console.warn(`[release] ${(e as Error).message}; using CHANGELOG.md`);
      return fromChangelog();
    }
  })();
  return cached;
}

// "129.4 MB", the way Windows Explorer's details pane would round it.
export const formatMB = (bytes?: number) => (bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : '');
