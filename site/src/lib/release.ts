// The newest released version, for the structured data search engines read (never shown on the page). It comes from
// CHANGELOG.md, which the site's workflow watches, so a release rebuilds the site.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function latestVersion(): Promise<string> {
  const text = await readFile(resolve(process.cwd(), '../CHANGELOG.md'), 'utf8');
  return /^## \[(\d+\.\d+\.\d+)\]/m.exec(text)?.[1] ?? '';
}
