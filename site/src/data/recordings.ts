// Recordings of the real app, one per chapter of "How to use" (shot list in site/README.md), written to
// recordings.json by `npm run media`. Until a chapter has one, the page shows the README's screenshot for it.
import type { ChapterId } from '../lib/content';
import list from './recordings.json';

export interface Recording { mp4: string; webm: string; poster: string; width: number; height: number; label: string }
const base = import.meta.env.BASE_URL;
export const recordings: Partial<Record<ChapterId, Recording>> = Object.fromEntries(
  Object.entries(list as Record<string, Recording>).map(([k, r]) => [k, { ...r, mp4: base + r.mp4, webm: base + r.webm, poster: base + r.poster }]),
);
