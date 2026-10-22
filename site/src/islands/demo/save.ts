// Real files from the Try it demo, the way the extension makes them (content.js): the video's thumbnail from
// YouTube's image server (it allows any page to fetch it), the video's subtitles (YouTube doesn't let another site
// ask for them, so scripts/subs.mjs saves the tracks next to the page with yt-dlp) and a screenshot of the film's
// current frame. Each one is saved with the browser's own download, under the name the extension would give it.
import { SUB_FORMATS, THUMB_SIZES, type SubFmt, type SubTrack } from './model';

const base = import.meta.env.BASE_URL;

/** A failure the picker shows as it is. */
export class SaveError extends Error {}

// content.js safeName: no characters Windows refuses, at most 150, no Windows device names.
export function safeName(s: string) {
  let r = (s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').replace(/\s+/g, ' ').trim();
  r = Array.from(r).slice(0, 150).join('').replace(/[. ]+$/, '');
  if (/^(con|prn|aux|nul|conin\$|conout\$|com[0-9¹²³]|lpt[0-9¹²³])( *\..*)?$/i.test(r)) r = `_${r}`;
  return r || 'video';
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

const thumbUrl = (vid: string, key: string) => `https://i.ytimg.com/vi/${vid}/${key}.jpg`;
export type ThumbAvail = Record<string, { w: number; h: number } | false>;

// Which sizes YouTube keeps for the video: a missing one answers 404 with a 120 × 90 grey picture.
const probes = new Map<string, Promise<ThumbAvail>>();
export function probeThumbs(vid: string) {
  if (!probes.has(vid)) {
    probes.set(vid, Promise.all(THUMB_SIZES.map((t) => new Promise<[string, { w: number; h: number } | false]>((res) => {
      const img = new Image();
      img.onload = () => res([t.key, img.naturalWidth > 120 && { w: img.naturalWidth, h: img.naturalHeight }]);
      img.onerror = () => res([t.key, false]);
      img.src = thumbUrl(vid, t.key);
    }))).then(Object.fromEntries));
  }
  return probes.get(vid)!;
}

/** The thumbnail at `key`, or the next smaller size YouTube has. */
export async function saveThumb(vid: string, title: string, key: string) {
  for (const t of THUMB_SIZES.slice(Math.max(0, THUMB_SIZES.findIndex((x) => x.key === key)))) {
    let r: Response;
    try { r = await fetch(thumbUrl(vid, t.key)); } catch { throw new SaveError("Couldn't reach YouTube's image server. Check your connection and try again."); }
    if (!r.ok) continue; // 404: try the next size
    const blob = await r.blob();
    const bmp = await createImageBitmap(blob);
    const size = { w: bmp.width, h: bmp.height };
    bmp.close();
    if (size.w <= 120) continue;
    const name = `${safeName(title)}.jpg`;
    saveBlob(blob, name);
    return { blob, name, key: t.key, ...size };
  }
  throw new SaveError('No thumbnail is available for this video.');
}

/** The video's subtitle tracks: [] when it has none. */
export async function loadTracks(vid: string): Promise<SubTrack[]> {
  let r: Response;
  try { r = await fetch(`${base}media/subs/${vid}.json`); } catch { throw new SaveError("Couldn't load the list of subtitles. Check your connection and try again."); }
  if (!r.ok) throw new SaveError(`Couldn't load the list of subtitles (error ${r.status}).`);
  return ((await r.json()) as { tracks: SubTrack[] }).tracks;
}

// ---------- subtitles: YouTube's json3 to SRT or WebVTT (content.js json3ToSrt) ----------
interface Json3 { events?: { tStartMs: number; dDurationMs?: number; segs?: { utf8?: string }[] }[] }
function cues(j: Json3) {
  const list: { start: number; end: number; text: string }[] = [];
  for (const e of j.events || []) {
    if (!e.segs) continue;
    const text = e.segs.map((s) => s.utf8 || '').join('').trim();
    if (!text) continue;
    list.push({ start: e.tStartMs, end: e.tStartMs + (e.dDurationMs || 2000), text });
  }
  for (let i = 0; i < list.length - 1; i++) list[i].end = Math.min(list[i].end, list[i + 1].start);
  return list;
}
const stamp = (ms: number, sep: string) => {
  const p = (n: number, w = 2) => String(Math.floor(n)).padStart(w, '0');
  return `${p(ms / 3600000)}:${p((ms / 60000) % 60)}:${p((ms / 1000) % 60)}${sep}${p(ms % 1000, 3)}`;
};
export const json3ToSrt = (j: Json3) => cues(j).map((c, i) => `${i + 1}\n${stamp(c.start, ',')} --> ${stamp(c.end, ',')}\n${c.text}\n`).join('\n');
export const json3ToVtt = (j: Json3) => `WEBVTT\n\n${cues(j).map((c) => `${stamp(c.start, '.')} --> ${stamp(c.end, '.')}\n${c.text}\n`).join('\n')}`;

export async function saveSubs(track: SubTrack, fmt: SubFmt, title: string) {
  const f = SUB_FORMATS[fmt];
  const file = fmt === 'srt' || fmt === 'vtt' ? track.files.json3 : track.files[fmt];
  let r: Response;
  try { r = await fetch(`${base}${file}`); } catch { throw new SaveError("Couldn't load the subtitles. Check your connection and try again."); }
  if (!r.ok) throw new SaveError(`Couldn't load the subtitles (error ${r.status}).`);
  const text = await r.text();
  const body = fmt === 'srt' ? json3ToSrt(JSON.parse(text)) : fmt === 'vtt' ? json3ToVtt(JSON.parse(text)) : text;
  if (!body.trim() || body.trim() === 'WEBVTT') throw new SaveError('YouTube returned empty subtitles.');
  const blob = new Blob([body], { type: `${f.type};charset=utf-8` });
  const name = `${safeName(title)}.${track.lang}.${f.ext}`;
  saveBlob(blob, name);
  return { blob, name };
}

/** The film's current frame as a PNG, named with its time (content.js takeScreenshot). */
export async function saveShot(v: HTMLVideoElement | null, title: string, at: number) {
  if (!v || !v.videoWidth) throw new SaveError("The video isn't ready yet. Try again in a moment.");
  const c = document.createElement('canvas');
  c.width = v.videoWidth;
  c.height = v.videoHeight;
  c.getContext('2d')!.drawImage(v, 0, 0);
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
  if (!blob) throw new SaveError("Couldn't capture this frame.");
  const s = Math.floor(at);
  const time = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join('-');
  const name = `${safeName(title)} ${time}.png`;
  saveBlob(blob, name);
  return { blob, name, w: c.width, h: c.height };
}
