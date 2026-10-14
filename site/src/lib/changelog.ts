// The last releases for "What's new", read from CHANGELOG.md while building: per release its date, the first
// sentence of each "New" entry (or "Changed", for a release without new things) and how many fixes it brought.
import { changelogText } from './release';

export interface ReleaseNotes {
  version: string;
  date: string;
  headlines: string[];
  counts: { label: string; n: number }[];
}

// "Download videos in up to 8K quality. With the app …" -> "Download videos in up to 8K quality."
// Markdown is kept to plain text: **bold** and `code` lose their marks.
function firstSentence(entry: string) {
  const text = entry.replace(/\s+/g, ' ').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').trim();
  const m = /^(.+?[.!?])(\s|$)/.exec(text);
  return m ? m[1] : text;
}

export async function recentReleases(count = 5): Promise<ReleaseNotes[]> {
  const log = await changelogText();
  const parts = log.split(/^## /m).slice(1).filter((p) => /^\[\d+\.\d+\.\d+\]/.test(p));
  return parts.slice(0, count).map((part) => {
    const head = /^\[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/.exec(part)!;
    const sections = new Map<string, string[]>();
    for (const s of part.split(/^### /m).slice(1)) {
      const [title, ...body] = s.split('\n');
      const entries = body.join('\n').split(/^- /m).slice(1).map((e) => e.trim()).filter(Boolean);
      sections.set(title.trim(), entries);
    }
    const lead = sections.get('New') ?? sections.get('Changed') ?? sections.get('Improved') ?? sections.get('Fixed') ?? [];
    const counts = [...sections].map(([label, list]) => ({ label, n: list.length }));
    return { version: head[1], date: head[2], headlines: lead.slice(0, 3).map(firstSentence), counts };
  });
}
