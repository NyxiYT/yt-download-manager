// The latest release and the star count, read once while the site is built (so the page shows them without
// waiting), and again in the browser (scripts/live.ts) in case a release came out since. Without GitHub's
// API, the newest version in CHANGELOG.md stands in.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface ReleaseInfo {
  version: string; // "1.12.0"
  date: string; // ISO date, "2026-10-13"
  stars: number | null;
}

const API = 'https://api.github.com/repos/NyxiYT/yt-download-manager';

async function github(path: string): Promise<any> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'yt-download-manager-site' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const r = await fetch(API + path, { headers, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`GitHub ${path}: ${r.status}`);
  return r.json();
}

async function fromChangelog(): Promise<ReleaseInfo> {
  // The build runs in site/ (npm run build); the bundled code no longer sits next to this file.
  const log = await readFile(resolve(process.cwd(), '../CHANGELOG.md'), 'utf8');
  const m = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/m.exec(log);
  if (!m) throw new Error('no release in CHANGELOG.md');
  return { version: m[1], date: m[2], stars: null };
}

let cached: Promise<ReleaseInfo> | undefined;

export function latestRelease(): Promise<ReleaseInfo> {
  cached ??= (async () => {
    try {
      const [rel, repo] = await Promise.all([github('/releases/latest'), github('')]);
      return { version: String(rel.tag_name).replace(/^v/, ''), date: String(rel.published_at).slice(0, 10), stars: Number(repo.stargazers_count) };
    } catch (e) {
      console.warn(`[release] ${(e as Error).message}; using CHANGELOG.md`);
      return fromChangelog();
    }
  })();
  return cached;
}

export { STAR_THRESHOLD, formatDate } from './format';
