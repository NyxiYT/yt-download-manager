// The demo's data and its state machine. Labels, sizes and formats follow the extension (content.js) exactly;
// the video data comes from scripts/formats.mjs (yt-dlp's real answer, run through the app's own rules).

export interface VideoOption { key: string; quality: string; height: number; badge: string; codec: string; size: number }
export interface AudioOption { key: string; format: 'MP3' | 'M4A' | 'OPUS' | 'WAV'; kbps: number; hint: string; size: number; approx: boolean; trimmable: boolean }
export interface VideoData { vid: string; title: string; author: string; duration: number; video: VideoOption[]; audio: AudioOption[] }
export interface Frame { src: string; srcset?: string; width: number; height: number; alt: string }

export type Scene = 'video' | 'trim' | 'audio' | 'shorts' | 'history';
export type Picker = 'video' | 'audio' | 'thumb' | 'subs' | 'shortsMenu';

// The thumbnail sizes YouTube keeps for a video, largest first (content.js THUMBS); a Short may also have a vertical one.
export const THUMB_SIZES: readonly { key: string; label: string; res: string; tall?: boolean }[] = [
  { key: 'oardefault', label: 'Vertical', res: '1080×1920', tall: true },
  { key: 'maxresdefault', label: 'Maximum resolution', res: '1280×720' },
  { key: 'sddefault', label: 'Standard', res: '640×480' },
  { key: 'hqdefault', label: 'High', res: '480×360' },
  { key: 'mqdefault', label: 'Medium', res: '320×180' },
];
// Subtitle files (content.js SUB_FORMATS).
export const SUB_FORMATS = {
  srt: { label: 'SRT', ext: 'srt', type: 'application/x-subrip' },
  vtt: { label: 'WebVTT', ext: 'vtt', type: 'text/vtt' },
  ttml: { label: 'TTML', ext: 'ttml', type: 'application/ttml+xml' },
  srv3: { label: 'SRV3', ext: 'srv3', type: 'application/xml' },
} as const;
export type SubFmt = keyof typeof SUB_FORMATS;
/** A subtitle track of the video, saved next to the page by scripts/subs.mjs. */
export interface SubTrack { key: string; lang: string; label: string; auto: boolean; files: Record<'json3' | 'ttml' | 'srv3', string> }
export type Phase = 'idle' | 'menuOpen' | 'qualityChosen' | 'trimDragged' | 'downloading' | 'done' | 'folderOpened';

export interface Job {
  id: string; title: string; author: string; format: 'MP4' | 'MP3' | 'M4A' | 'Opus' | 'WAV' | 'JPG' | 'PNG' | 'SRT' | 'WebVTT' | 'TTML' | 'SRV3';
  quality: string; size: number; pct: number; status: 'downloading' | 'processing' | 'completed'; clip?: { start: number; end: number };
  /** The name of a file the visitor really saved (thumbnail, subtitles, screenshot). */
  file?: string;
}

export interface DemoState {
  phase: Phase;
  pop: Picker | null;
  dropdown: boolean;
  videoKey: string;
  audioKey: string;
  thumbKey: string;
  subsKey: string;
  subFmt: SubFmt;
  clip: { start: number; end: number };
  jobs: Job[];
  panel: boolean;
  flash: boolean;
  folder: string | null; // the file shown selected in the folder window
}

export type Action =
  | { type: 'open'; pop: Picker }
  | { type: 'close' }
  | { type: 'dropdown'; open?: boolean }
  | { type: 'pickVideo'; key: string }
  | { type: 'pickAudio'; key: string }
  | { type: 'pickThumb'; key: string }
  | { type: 'pickSubs'; key: string }
  | { type: 'subFmt'; fmt: SubFmt }
  | { type: 'saved'; job: Job }
  | { type: 'clip'; start?: number; end?: number; duration: number }
  | { type: 'start'; job: Job }
  | { type: 'tick'; dt: number; rate: number }
  | { type: 'flashEnd' }
  | { type: 'panel'; open?: boolean }
  | { type: 'reveal'; file: string }
  | { type: 'folderClose' }
  | { type: 'reset'; state: DemoState };

export function initialState(data: VideoData, scene: Scene): DemoState {
  const base: DemoState = {
    phase: 'idle', pop: null, dropdown: false, videoKey: data.video[0]?.key ?? '', audioKey: 'mp3-320', thumbKey: '', subsKey: '', subFmt: 'srt',
    clip: { start: 0, end: data.duration }, jobs: [], panel: false, flash: false, folder: null,
  };
  if (scene !== 'history') return base;
  // History: one download half way, and an MP3 that finished a moment ago.
  const top = data.video.find((v) => v.height <= 1080) ?? data.video[0];
  const mp3 = data.audio.find((a) => a.key === 'mp3-320');
  return {
    ...base, phase: 'downloading',
    jobs: [
      { id: 'h1', title: data.title, author: data.author, format: 'MP4', quality: top.quality, size: top.size, pct: 38, status: 'downloading' },
      ...(mp3 ? [{ id: 'h0', title: data.title, author: data.author, format: 'MP3' as const, quality: '320kbps', size: mp3.size, pct: 100, status: 'completed' as const }] : []),
    ],
  };
}

const active = (j: Job) => j.status !== 'completed';

export function reducer(s: DemoState, a: Action): DemoState {
  switch (a.type) {
    case 'open':
      if (s.pop === a.pop) return { ...s, pop: null, dropdown: false, phase: s.jobs.some(active) ? 'downloading' : 'idle' };
      return { ...s, pop: a.pop, dropdown: false, panel: false, folder: null, phase: 'menuOpen' };
    case 'close':
      return { ...s, pop: null, dropdown: false, phase: s.jobs.some(active) ? 'downloading' : s.phase === 'menuOpen' || s.phase === 'qualityChosen' || s.phase === 'trimDragged' ? 'idle' : s.phase };
    case 'dropdown':
      return { ...s, dropdown: a.open ?? !s.dropdown };
    case 'pickVideo':
      return { ...s, videoKey: a.key, dropdown: false, phase: 'qualityChosen' };
    case 'pickAudio':
      return { ...s, audioKey: a.key, dropdown: false, phase: 'qualityChosen' };
    case 'pickThumb':
      return { ...s, thumbKey: a.key, dropdown: false };
    case 'pickSubs':
      return { ...s, subsKey: a.key, dropdown: false };
    case 'subFmt':
      return { ...s, subFmt: a.fmt };
    case 'saved': // a file the visitor saved: straight into the history as done
      return { ...s, pop: null, dropdown: false, flash: true, jobs: [a.job, ...s.jobs] };
    case 'clip': {
      const min = Math.min(1, a.duration / 2); // content.js: minLen
      const start = a.start !== undefined ? Math.max(0, Math.min(a.start, s.clip.end - min)) : s.clip.start;
      const end = a.end !== undefined ? Math.max(start + min, Math.min(a.end, a.duration)) : s.clip.end;
      return { ...s, clip: { start, end }, phase: 'trimDragged' };
    }
    case 'start':
      if (s.jobs.some((j) => active(j) && j.title === a.job.title && j.format === a.job.format && j.quality === a.job.quality)) return { ...s, pop: null, dropdown: false };
      return { ...s, pop: null, dropdown: false, phase: 'downloading', flash: false, jobs: [a.job, ...s.jobs] };
    case 'tick': {
      let finished = false;
      const jobs = s.jobs.map((j) => {
        if (j.status === 'downloading') {
          const pct = Math.min(100, j.pct + a.rate * a.dt);
          return pct >= 100 ? { ...j, pct: 0, status: 'processing' as const } : { ...j, pct };
        }
        if (j.status === 'processing') {
          const pct = Math.min(100, j.pct + a.rate * 2.2 * a.dt);
          if (pct >= 100) { finished = true; return { ...j, pct: 100, status: 'completed' as const }; }
          return { ...j, pct };
        }
        return j;
      });
      const anyActive = jobs.some(active);
      return { ...s, jobs, flash: s.flash || (finished && !anyActive), phase: finished && !anyActive ? 'done' : s.phase };
    }
    case 'flashEnd':
      return { ...s, flash: false };
    case 'panel':
      return { ...s, panel: a.open ?? !s.panel, pop: null, dropdown: false };
    case 'reveal':
      return { ...s, folder: a.file, phase: 'folderOpened' };
    case 'folderClose':
      return { ...s, folder: null };
    case 'reset':
      return a.state;
  }
}

// ---------- the extension's formatting (content.js), English ----------
const nf = (o: Intl.NumberFormatOptions) => new Intl.NumberFormat('en', o);
export function fmtSize(b: number) {
  if (!b) return '';
  const [v, unit] = b >= 1e9 ? [b / 1e9, 'gigabyte'] : b >= 1e6 ? [b / 1e6, 'megabyte'] : [Math.max(1, b / 1e3), 'kilobyte'];
  return nf({ style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: v >= 100 || unit === 'kilobyte' ? 0 : 1 }).format(v);
}
export const fmtKbps = (k: number) => nf({ style: 'unit', unit: 'kilobit-per-second', unitDisplay: 'short', maximumFractionDigits: 0 }).format(k);
const pad2 = (n: number) => String(n).padStart(2, '0');
export const fmtTime = (s: number, long = false) => {
  s = Math.max(0, Math.round(s));
  const hh = Math.floor(s / 3600);
  return long || hh ? `${pad2(hh)}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}` : `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
};
export const fmtClock = (s: number) => {
  s = Math.max(0, Math.round(s));
  const hh = Math.floor(s / 3600);
  return hh ? `${hh}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}` : `${Math.floor(s / 60)}:${pad2(s % 60)}`;
};
export const audioLabel = (o: AudioOption) => (o.format === 'WAV' ? 'WAV · lossless' : `${o.format === 'OPUS' ? 'Opus' : o.format} · ${fmtKbps(o.kbps)}`);
export const qualityText = (q: string) => {
  const m = /^(\d+)kbps$/.exec(q);
  return m ? fmtKbps(+m[1]) : q;
};
// The download fills the ring up to 90 %, converting and saving the rest (content.js ringPct).
export const ringPct = (j: Job) => (j.status === 'processing' ? 90 + j.pct / 10 : j.status === 'completed' ? 100 : j.pct * 0.9);
// estimate(): "~" when trimmed or approximate
export const estimate = (size: number, ratio: number, approx = false) => `${approx || ratio < 1 ? '~' : ''}${fmtSize(size * ratio)}`;
