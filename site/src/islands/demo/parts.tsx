// The extension's interface, rebuilt from content.js for the demos: the same elements, classes, labels and
// icons (the styles are in styles/ysd.css). Every part the guided tour points at carries data-t, and shows its
// hover and pressed look when the tour's cursor is on it (the Ui context), as it would under a real pointer.
import { createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { getMotion, onMotion } from '../motion-pref';
import { ICONS, type IconName } from '../../lib/icons';
import { ARROW_PATH, ARROW_SIZE } from '../../lib/arrow';
import {
  SUB_FORMATS, THUMB_SIZES, audioLabel, estimate, fmtClock, fmtSize, fmtTime, qualityText, ringPct,
  type AudioOption, type DemoState, type Job, type SubFmt, type SubTrack, type VideoData, type VideoOption,
} from './model';
import type { ThumbAvail } from './save';

export const Ui = createContext<{ hover: string | null; press: string | null }>({ hover: null, press: null });
export function useT(t: string) {
  const { hover, press } = useContext(Ui);
  return { 'data-t': t, 'data-hover': hover === t ? '' : undefined, 'data-press': press === t ? '' : undefined };
}

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={ICONS[name]} />
    </svg>
  );
}

function IconBtn({ name, label, t, onClick, className = '', size = 20 }: { name: IconName; label: string; t: string; onClick?: () => void; className?: string; size?: number }) {
  return (
    <button type="button" className={`ysd-ibtn ${className}`} aria-label={label} data-tip={label} onClick={onClick} {...useT(t)}>
      <Icon name={name} size={size} />
    </button>
  );
}

// ---------- the page around the toolbar (neutral: no YouTube logo, buttons or fonts) ----------
export function TopBar({ children }: { children: ReactNode }) {
  return (
    <div className="d-top">
      <div className="d-top-start" aria-hidden="true"><span className="d-burger"><i /><i /><i /></span><span className="d-mark" /></div>
      <div className="d-search" aria-hidden="true"><span className="d-search-field" /><span className="d-search-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></svg>
      </span></div>
      <div className="d-top-end">{children}<span className="d-avatar" aria-hidden="true" /></div>
    </div>
  );
}

export interface FilmSrc { poster: string; sources: { src: string; type: string; media?: string }[] }

// The picture: the film itself (the hero's loop), never a screenshot. It starts after the page has loaded and
// stands still while it's off screen. The time is the film's own position (the loop is 0:03.6 to 0:16.2 of it).
export function Film({ film, className, startAt = 3.6, onTime }: { film: FilmSrc; className?: string; startAt?: number; onTime?: (t: number) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let shown = false;
    const go = () => setOn(true);
    if (document.readyState === 'complete') setTimeout(go, 300); else addEventListener('load', () => setTimeout(go, 300), { once: true });
    const io = new IntersectionObserver(([e]) => { shown = e.isIntersecting; if (!v.src && !v.currentSrc) return; if (shown && getMotion() === 'full') v.play().catch(() => {}); else v.pause(); }, { threshold: 0.1 });
    io.observe(v);
    const off = onMotion((p) => { if (p === 'reduced') v.pause(); else if (shown) v.play().catch(() => {}); });
    const tick = () => onTime?.(startAt + v.currentTime * 0.85);
    v.addEventListener('timeupdate', tick);
    return () => { io.disconnect(); off(); v.removeEventListener('timeupdate', tick); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const v = ref.current;
    if (!on || !v) return;
    v.load();
    if (getMotion() === 'full') v.play().catch(() => {});
  }, [on]);
  return (
    <video ref={ref} className={className} muted playsInline loop preload="none" poster={film.poster} aria-hidden="true" disablePictureInPicture>
      {on && film.sources.map((s) => <source key={s.src} src={s.src} type={s.type} media={s.media} />)}
    </video>
  );
}

export function Player({ film, time }: { film: FilmSrc; time?: string }) {
  return (
    <div className="d-player">
      <Film film={film} />
      <div className="d-controls" aria-hidden="true">
        <div className="d-progress"><i style={{ width: '1%' }} /></div>
        {time && <span className="d-time">{time}</span>}
      </div>
    </div>
  );
}

// The site's theme, followed by the demo the way the extension follows YouTube's.
const onTheme = (cb: () => void) => { const mo = new MutationObserver(cb); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); return () => mo.disconnect(); };
const isDarkSite = () => document.documentElement.dataset.theme !== 'light';
export const useSiteDark = () => useSyncExternalStore(onTheme, isDarkSite, () => true);

// ---------- the toolbar (full width mode, content.js layoutBar) ----------
export function Toolbar({ open, onVideo, onAudio, onThumb, onSubs, onShot }: {
  open: string | null; onVideo: () => void; onAudio: () => void; onThumb?: () => void; onSubs?: () => void; onShot?: () => void;
}) {
  const btn = (name: IconName, tip: string, t: string, onClick?: () => void, cls = '', on = false) => (
    <button type="button" className={`ysd-btn ${cls}${on ? ' ysd-on' : ''}${open && t === `btn-${open}` ? ' ysd-open' : ''}`}
      aria-label={tip} data-tip={tip} aria-haspopup={onClick ? 'dialog' : undefined} onClick={onClick} {...useT(t)}>
      <Icon name={name} />
    </button>
  );
  const dark = useSiteDark();
  return (
    <div className="ysd-toolbar" role="toolbar" aria-label="Download tools">
      <div className="ysd-group">
        {btn('video', 'Download video', 'btn-video', onVideo)}
        {btn('music', 'Download audio', 'btn-audio', onAudio)}
        {btn('image', 'Download thumbnail', 'btn-thumb', onThumb)}
        {btn('captions', 'Download subtitles', 'btn-subs', onSubs)}
        {btn('camera', 'Save a screenshot of this frame', 'btn-shot', onShot)}
      </div>
      <div className="ysd-group">
        {btn('moon', dark ? 'Switch to light theme' : 'Switch to dark theme', 'btn-moon', undefined, 'ysd-wide', dark)}
        {btn('focus', 'Big Picture: keep the video in view while you scroll, and playing when you go to Home', 'btn-focus', undefined, 'ysd-wide')}
        {btn('pip', 'Picture-in-picture', 'btn-pip', undefined, 'ysd-wide')}
        {btn('repeat', 'Loop video', 'btn-loop', undefined, 'ysd-wide')}
        <span className="ysd-sep ysd-wide" />
        {btn('more', 'Settings', 'btn-more', undefined, 'ysd-sm')}
        {btn('help', 'Help', 'btn-help', undefined, 'ysd-sm ysd-wide')}
        {btn('close', 'Hide toolbar', 'btn-hide', undefined, 'ysd-sm')}
      </div>
    </div>
  );
}

// ---------- pickers ----------
function PopHead({ icon, title, onClose }: { icon: IconName; title: string; onClose: () => void }) {
  return (
    <div className="ysd-pop-head">
      <span className="ysd-pop-title"><Icon name={icon} size={18} /><span>{title}</span></span>
      <IconBtn name="pin" label="Keep open" t="pop-pin" className="ysd-xs" size={18} />
      <IconBtn name="close" label="Close" t="pop-close" className="ysd-xs" size={18} onClick={onClose} />
    </div>
  );
}

export interface Opt { value: string; label: string; badge?: string; hint?: string; right?: string; disabled?: boolean; icon?: IconName }
function OptContent({ o }: { o: Opt }) {
  return (
    <span className="ysd-opt">
      {o.icon && <Icon name={o.icon} size={16} className="ysd-opt-icon" />}
      <span className="ysd-opt-label">{o.label}</span>
      {o.badge && <span className="ysd-badge">{o.badge}</span>}
      {o.hint && <span className="ysd-opt-hint">{o.hint}</span>}
      {o.right && <span className="ysd-opt-right">{o.right}</span>}
    </span>
  );
}

// Named by its label and what it shows ("Quality 2160p60 4K AV1 723 MB"), so the spoken name matches the text.
function SelectField({ label, cur, open, onToggle, t }: { label: string; cur: Opt; open: boolean; onToggle: () => void; t: string }) {
  const id = useId();
  return (
    <div>
      <div className="ysd-label" id={`${id}-l`}>{label}</div>
      <button type="button" id={`${id}-b`} className={`ysd-select${open ? ' ysd-open' : ''}`} aria-haspopup="listbox" aria-expanded={open} aria-labelledby={`${id}-l ${id}-b`} onClick={onToggle} {...useT(t)}>
        <OptContent o={cur} />
        <Icon name="expand" />
      </button>
    </div>
  );
}

export function DropdownList({ options, value, onPick, style }: { options: Opt[]; value: string; onPick: (v: string) => void; style: CSSProperties }) {
  return (
    <div className="ysd-dd" role="listbox" style={style}>
      {options.map((o, i) => <DdItem key={o.value} o={o} i={i} selected={o.value === value} onPick={onPick} />)}
    </div>
  );
}
function DdItem({ o, i, selected, onPick }: { o: Opt; i: number; selected: boolean; onPick: (v: string) => void }) {
  return (
    <button type="button" className="ysd-dd-item" role="option" aria-selected={selected} disabled={o.disabled} onClick={() => onPick(o.value)} {...useT(`dd-${i}`)}>
      <OptContent o={o} />
      <span className="ysd-check">{selected ? <Icon name="check" size={18} /> : null}</span>
    </button>
  );
}

export const videoOpts = (list: VideoOption[]): Opt[] => list.map((o) => ({ value: o.key, label: o.quality, badge: o.badge, hint: o.codec, right: fmtSize(o.size) }));
export const audioOpts = (list: AudioOption[]): Opt[] =>
  list.map((o) => ({ value: o.key, label: audioLabel(o), hint: o.format === 'WAV' ? '' : o.hint, right: `${o.approx ? '~' : ''}${fmtSize(o.size)}` }));
const thumbRes = (t: (typeof THUMB_SIZES)[number], avail?: ThumbAvail) => { const a = avail?.[t.key]; return a ? `${a.w}×${a.h}` : t.res; };
// The vertical picture only where the video has one (a Short).
const thumbList = (avail?: ThumbAvail) => THUMB_SIZES.filter((t) => !t.tall || avail?.[t.key]);
export const thumbOpts = (avail?: ThumbAvail): Opt[] =>
  thumbList(avail).map((t) => ({ value: t.key, label: t.label, hint: avail?.[t.key] === false ? 'not available' : '', right: thumbRes(t, avail), disabled: avail?.[t.key] === false }));
export const subsOpts = (tracks: SubTrack[]): Opt[] => tracks.map((t) => ({ value: t.key, label: t.label, hint: t.lang, icon: t.auto ? 'auto' : undefined }));
/** The size the picker shows as chosen: the one picked, or the largest YouTube has. */
export function thumbChoice(s: DemoState, avail?: ThumbAvail) {
  const list = thumbList(avail);
  const sel = list.find((t) => t.key === s.thumbKey) ?? list[0];
  return avail?.[sel.key] === false ? list.find((t) => avail[t.key] !== false) ?? list[list.length - 1] : sel;
}
export const subsChoice = (s: DemoState, tracks: SubTrack[]) => tracks.find((t) => t.key === s.subsKey) ?? tracks.find((t) => !t.auto) ?? tracks[0];

function Trim({ duration, clip, enabled, onClip }: { duration: number; clip: { start: number; end: number }; enabled: boolean; onClip: (c: { start?: number; end?: number }) => void }) {
  const full = clip.start <= 0.05 && clip.end >= duration - 0.05;
  const step = duration >= 120 ? 1 : 0.1;
  const dot = (which: 'start' | 'end') => {
    const v = clip[which];
    return (
      <Dot which={which} value={v} duration={duration}
        onKey={(d) => onClip({ [which]: v + d * step })} onDrag={(x) => onClip({ [which]: Math.round(x * duration / step) * step })} />
    );
  };
  return (
    <div className={`ysd-trim${enabled ? '' : ' ysd-disabled'}`}>
      <div className="ysd-trim-top">
        <div className="ysd-label"><Icon name="scissors" size={16} />Trim</div>
        <span className="ysd-trim-sum">{full ? 'Full length' : 'Clip'} · <b>{fmtClock(full ? duration : clip.end - clip.start)}</b></span>
        {!full && <button type="button" className="ysd-mini" onClick={() => onClip({ start: 0, end: duration })}>Reset</button>}
      </div>
      <div className="ysd-range" data-range data-t="range">
        <div className="ysd-range-track" />
        <div className="ysd-range-fill" style={{ left: `${(clip.start / duration) * 100}%`, right: `${100 - (clip.end / duration) * 100}%` }} />
        {dot('start')}
        {dot('end')}
      </div>
      <div className="ysd-range-ends"><span>{fmtTime(0)}</span><span>{fmtTime(duration)}</span></div>
      <div className="ysd-times">
        {(['start', 'end'] as const).map((w) => (
          <div className="ysd-time" key={w}>
            <div className="ysd-label">{w === 'start' ? 'Start' : 'End'}</div>
            <div className="ysd-time-box"><span>{fmtTime(clip[w])}</span><IconBtn name="timer" label="Use the current video time" t={`time-${w}`} className="ysd-xs" size={18} /></div>
          </div>
        ))}
      </div>
      {enabled
        ? <div className="ysd-switch-row"><span className="ysd-switch" aria-hidden="true" /><span>Sync with player</span></div>
        : <div className="ysd-note"><Icon name="info" size={16} />Trimming works with MP3, M4A and WAV.</div>}
    </div>
  );
}

// A trim handle: drag it, or use the arrow keys (it's a slider for assistive technology too).
function Dot({ which, value, duration, onKey, onDrag }: { which: 'start' | 'end'; value: number; duration: number; onKey: (d: number) => void; onDrag: (x: number) => void }) {
  const t = useT(`dot-${which}`);
  return (
    <button type="button" className="ysd-thumb-dot" role="slider" aria-label={which === 'start' ? 'Clip start' : 'Clip end'}
      aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(value)} aria-valuetext={fmtTime(value)}
      style={{ left: `${(value / duration) * 100}%`, zIndex: which === 'start' ? 3 : 2 }} {...t}
      onKeyDown={(e) => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
        if (d) { e.preventDefault(); onKey(d * (e.shiftKey ? 10 : 1)); }
      }}
      onPointerDown={(e) => {
        const range = (e.currentTarget.closest('[data-range]') as HTMLElement).getBoundingClientRect();
        e.currentTarget.setPointerCapture(e.pointerId);
        const move = (ev: PointerEvent) => onDrag(Math.min(1, Math.max(0, (ev.clientX - range.left) / range.width)));
        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      }} />
  );
}

function PopFoot({ summary, onDownload, busy = false }: { summary: string; onDownload: () => void; busy?: boolean }) {
  return (
    <div className="ysd-pop-foot">
      <span className="ysd-pop-sum" role="status">{busy && <span className="ysd-spin" aria-hidden="true" />}{summary}</span>
      <button type="button" className="ysd-primary" onClick={onDownload} disabled={busy} {...useT('download')}><Icon name="download" size={18} /><span>Download</span></button>
    </div>
  );
}

// A line of news in a picker (content.js msgRow): information, or an error with what to do.
function Msg({ err = false, children }: { err?: boolean; children: ReactNode }) {
  return <div className={`ysd-msg${err ? ' ysd-err' : ''}`} role={err ? 'alert' : undefined}><Icon name={err ? 'error' : 'info'} size={18} /><span>{children}</span></div>;
}

/** What a picker is doing right now: saving, or the last thing that went wrong. */
export interface Saving { busy: boolean; error: string | null }

export function ThumbPicker({ data, s, avail, saving, onClose, onToggle, onDownload, style }: {
  data: VideoData; s: DemoState; avail?: ThumbAvail; saving: Saving; onClose: () => void; onToggle: () => void; onDownload: () => void; style: CSSProperties;
}) {
  const sel = thumbChoice(s, avail);
  return (
    <div className="ysd-pop" role="dialog" aria-label="Download thumbnail" style={style} data-pop data-picker="thumb">
      <PopHead icon="image" title="Download thumbnail" onClose={onClose} />
      <div className="ysd-pop-body">
        <img className={`ysd-thumb${sel.tall ? ' ysd-tall' : ''}`} alt="Thumbnail preview" src={`https://i.ytimg.com/vi/${data.vid}/${sel.key}.jpg`} />
        <SelectField label="Quality" cur={thumbOpts(avail).find((o) => o.value === sel.key)!} open={s.dropdown} onToggle={onToggle} t="select" />
        {saving.error && <Msg err>{saving.error}</Msg>}
        <PopFoot summary={saving.busy ? 'Fetching image…' : `JPG · ${thumbRes(sel, avail)}`} onDownload={onDownload} busy={saving.busy} />
      </div>
    </div>
  );
}

export type TrackList = { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; tracks: SubTrack[] };

export function SubsPicker({ s, list, saving, onClose, onToggle, onFormat, onRetry, onDownload, style }: {
  s: DemoState; list: TrackList; saving: Saving; onClose: () => void; onToggle: () => void; onFormat: (f: SubFmt) => void; onRetry: () => void; onDownload: () => void; style: CSSProperties;
}) {
  const body = () => {
    if (list.state === 'loading') return <div className="ysd-msg" role="status"><span className="ysd-spin" aria-hidden="true" /><span>Looking for subtitles…</span></div>;
    if (list.state === 'error') return <><Msg err>{list.message}</Msg><button type="button" className="ysd-secondary" onClick={onRetry}><Icon name="refresh" size={18} /><span>Retry</span></button></>;
    if (!list.tracks.length) return <Msg>This video has no subtitles</Msg>;
    const track = subsChoice(s, list.tracks);
    return (
      <>
        <div>
          <SelectField label="Language" cur={subsOpts([track])[0]} open={s.dropdown} onToggle={onToggle} t="select" />
          {list.tracks.some((t) => t.auto) && <div className="ysd-note" style={{ marginTop: 8 }}><Icon name="auto" size={16} />Auto-generated subtitles are marked with this icon</div>}
        </div>
        <div>
          <div className="ysd-label">File format</div>
          <div className="ysd-seg" role="radiogroup" aria-label="File format">
            {(Object.keys(SUB_FORMATS) as SubFmt[]).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={k === s.subFmt} className={k === s.subFmt ? 'ysd-sel' : ''} onClick={() => onFormat(k)}>{SUB_FORMATS[k].label}</button>
            ))}
          </div>
        </div>
        {saving.error && <Msg err>{saving.error}</Msg>}
        <PopFoot summary={saving.busy ? 'Fetching subtitles…' : `${SUB_FORMATS[s.subFmt].label} · ${track.label}`} onDownload={onDownload} busy={saving.busy} />
      </>
    );
  };
  return (
    <div className="ysd-pop" role="dialog" aria-label="Download subtitles" style={style} data-pop data-picker="subs">
      <PopHead icon="captions" title="Download subtitles" onClose={onClose} />
      <div className="ysd-pop-body">{body()}</div>
    </div>
  );
}

export function VideoPicker({ data, s, onClose, onToggle, onClip, onDownload, style }: {
  data: VideoData; s: DemoState; onClose: () => void; onToggle: () => void; onClip: (c: { start?: number; end?: number }) => void; onDownload: () => void; style: CSSProperties;
}) {
  const opt = data.video.find((o) => o.key === s.videoKey) ?? data.video[0];
  const ratio = (s.clip.end - s.clip.start) / data.duration;
  const cur = videoOpts([opt])[0];
  return (
    <div className="ysd-pop" role="dialog" aria-label="Download video" style={style} data-pop data-picker="video">
      <PopHead icon="video" title="Download video" onClose={onClose} />
      <div className="ysd-pop-body">
        <SelectField label="Quality" cur={cur} open={s.dropdown} onToggle={onToggle} t="select" />
        <Trim duration={data.duration} clip={s.clip} enabled onClip={onClip} />
        <PopFoot summary={`MP4 · ${opt.codec} · ${estimate(opt.size, ratio)}`} onDownload={onDownload} />
      </div>
    </div>
  );
}

export function AudioPicker({ data, s, onClose, onToggle, onClip, onDownload, style }: {
  data: VideoData; s: DemoState; onClose: () => void; onToggle: () => void; onClip: (c: { start?: number; end?: number }) => void; onDownload: () => void; style: CSSProperties;
}) {
  const opt = data.audio.find((o) => o.key === s.audioKey) ?? data.audio[0];
  const ratio = opt.trimmable ? (s.clip.end - s.clip.start) / data.duration : 1;
  return (
    <div className="ysd-pop" role="dialog" aria-label="Download audio" style={style} data-pop data-picker="audio">
      <PopHead icon="music" title="Download audio" onClose={onClose} />
      <div className="ysd-pop-body">
        <SelectField label="Format" cur={audioOpts([opt])[0]} open={s.dropdown} onToggle={onToggle} t="select" />
        <Trim duration={data.duration} clip={s.clip} enabled={opt.trimmable} onClip={onClip} />
        <PopFoot summary={`${opt.format === 'OPUS' ? 'Opus' : opt.format} · ${estimate(opt.size, ratio, opt.approx)}`} onDownload={onDownload} />
      </div>
    </div>
  );
}

// ---------- Shorts: the column beside the Short and its menu (content.js shortsItem, downloadMenu) ----------
export function ShortsColumn({ open, onDownload }: { open: boolean; onDownload: () => void }) {
  const dl = useT('short-dl');
  return (
    <div className="ysd-shorts" role="toolbar" aria-label="Download tools">
      <div className="d-sitem">
        <button type="button" className={`ysd-sbtn${open ? ' ysd-open' : ''}`} aria-haspopup="dialog" aria-label="Download" onClick={onDownload} {...dl}>
          <Icon name="dlLine" size={24} />
        </button>
        <div className="ysd-slab" aria-hidden="true">Download</div>
      </div>
      <div className="d-sitem">
        <button type="button" className="ysd-sbtn" aria-label="Settings" data-tip="Settings" {...useT('short-more')}><Icon name="more" size={24} /></button>
      </div>
      {/* YouTube's own buttons sit below ours; shown as plain shapes. */}
      <span className="d-yt-btn" aria-hidden="true" /><span className="d-yt-btn" aria-hidden="true" /><span className="d-yt-btn" aria-hidden="true" />
    </div>
  );
}

export function ShortsMenu({ onVideo, onAudio, onThumb, onSubs, onShot, style }: {
  onVideo: () => void; onAudio: () => void; onThumb: () => void; onSubs: () => void; onShot: () => void; style: CSSProperties;
}) {
  const item = (icon: IconName, label: string, t: string, onClick?: () => void) => <MItem icon={icon} label={label} t={t} onClick={onClick} />;
  return (
    <div className="ysd-pop ysd-menu" role="menu" style={style} data-pop data-picker="shortsMenu">
      {item('video', 'Download video', 'm-video', onVideo)}
      {item('music', 'Download audio', 'm-audio', onAudio)}
      {item('image', 'Download thumbnail', 'm-thumb', onThumb)}
      {item('captions', 'Download subtitles', 'm-subs', onSubs)}
      <div className="ysd-msep" />
      {item('camera', 'Save a screenshot of this frame', 'm-shot', onShot)}
    </div>
  );
}
function MItem({ icon, label, t, onClick }: { icon: IconName; label: string; t: string; onClick?: () => void }) {
  return (
    <button type="button" className="ysd-mitem" role="menuitem" onClick={onClick} {...useT(t)}>
      <span className="ysd-mlead"><Icon name={icon} /></span><span className="ysd-mlabel">{label}</span>
    </button>
  );
}

// ---------- history: the clock button with its ring, and the panel ----------
const HIST_C = 2 * Math.PI * 18;
export function HistButton({ jobs, flash, panel, onClick }: { jobs: Job[]; flash: boolean; panel: boolean; onClick: () => void }) {
  const live = jobs.filter((j) => j.status !== 'completed');
  const pct = live.length ? live.reduce((n, j) => n + ringPct(j), 0) / live.length : 0;
  const idle = !live.length;
  const tip = live.length === 1 ? (live[0].status === 'processing' ? 'Processing' : `Downloading ${Math.floor(live[0].pct)}%`) : 'Download history';
  return (
    <button type="button" className={`ysd-hist${idle ? ' ysd-idle' : ''}${flash ? ' ysd-flash-done' : ''}${panel ? ' ysd-on' : ''}`}
      aria-label={tip} data-tip={tip} aria-expanded={panel} onClick={onClick} {...useT('hist')}>
      <svg className="ysd-hist-ring" viewBox="0 0 40 40" aria-hidden="true">
        <circle className="ysd-hist-track" cx="20" cy="20" r="18" />
        <circle className="ysd-hist-arc" cx="20" cy="20" r="18" strokeDasharray={HIST_C.toFixed(2)} strokeDashoffset={(HIST_C * (1 - pct / 100)).toFixed(2)} />
      </svg>
      <Icon name="history" size={24} className="ysd-hist-ico" />
      <Icon name="check" size={22} className="ysd-hist-check" />
      {live.length > 0 && <span className="ysd-count">{live.length}</span>}
    </button>
  );
}

function itemSub(j: Job) {
  if (j.status === 'downloading') {
    const got = (j.size * j.pct) / 100;
    return `${Math.floor(j.pct)}% · ${fmtSize(got) || '0'} of ${fmtSize(j.size)}`;
  }
  if (j.status === 'processing') return j.format === 'MP3' ? `Converting to MP3 · ${Math.floor(j.pct)}%` : 'Merging video and audio…';
  return `${fmtSize(j.size)} · in Downloads · now`;
}

export function HistPanel({ jobs, onClose, onReveal, style }: { jobs: Job[]; onClose: () => void; onReveal: (j: Job) => void; style: CSSProperties }) {
  const nActive = jobs.filter((j) => j.status !== 'completed').length;
  const nDone = jobs.length - nActive;
  return (
    <div className="ysd-panel" role="dialog" aria-label="Download history" style={style} data-pop>
      <div className="ysd-phead">
        <span className="ysd-ptitle"><span>Downloads</span><small>{nActive ? `${nActive} active` : nDone ? `${nDone} finished` : ''}</small></span>
        <button type="button" className="ysd-textbtn" style={{ visibility: nDone ? 'visible' : 'hidden' }}>Clear</button>
        <IconBtn name="pin" label="Keep open" t="p-pin" />
        <IconBtn name="close" label="Close" t="p-close" onClick={onClose} />
      </div>
      <div className="d-plist">
        {jobs.map((j) => <HistItem key={j.id} j={j} onReveal={onReveal} />)}
      </div>
      <div className="ysd-pfoot">
        <span><Icon name="computer" size={16} />Saving to <b>Downloads</b></span>
        <button type="button" className="ysd-link">Open folder</button>
        <button type="button" className="ysd-link">Change</button>
      </div>
    </div>
  );
}

function HistItem({ j, onReveal }: { j: Job; onReveal: (j: Job) => void }) {
  const active = j.status !== 'completed';
  const chip = j.status === 'completed' ? ['Completed', 'ysd-c-green'] : j.status === 'processing' ? ['Processing', 'ysd-c-accent'] : ['Downloading', 'ysd-c-accent'];
  return (
    <div className="ysd-row">
      <div className={`ysd-item ysd-st-${j.status}`}>
        <div className="ysd-item-main">
          <span className="ysd-item-title">{j.title}</span>
          <div className="ysd-item-meta">
            {j.author && <span>{j.author}</span>}
            <b>{j.format}</b>
            <span>{qualityText(j.quality)}</span>
            {j.clip && <span className="ysd-clip"><Icon name="scissors" size={14} />{`${fmtClock(j.clip.start)}–${fmtClock(j.clip.end)}`}</span>}
            <span className={`ysd-chip ${chip[1]}`}>{chip[0]}</span>
          </div>
          <div className="ysd-item-sub" role={active ? 'status' : undefined}>{itemSub(j)}</div>
          {active && (
            <div className="ysd-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(j.status === 'processing' ? 100 : j.pct)}>
              <i style={{ transform: `translateX(${(j.status === 'processing' ? 100 : j.pct) - 100}%)` }} />
            </div>
          )}
        </div>
        <div className="ysd-item-actions">
          {active ? (
            <>
              {j.status === 'downloading' && <IconBtn name="pause" label="Pause" t={`pause-${j.id}`} />}
              <IconBtn name="close" label="Cancel" t={`cancel-${j.id}`} className="ysd-danger" />
            </>
          ) : (
            <>
              <IconBtn name="folder" label="Show in folder" t={`folder-${j.id}`} onClick={() => onReveal(j)} />
              <IconBtn name="delete" label="Remove from history" t={`delete-${j.id}`} className="ysd-danger" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- the folder the app opens (a plain file list, not a copy of Explorer) ----------
const fileIcon = (name: string): IconName =>
  /\.(mp3|m4a|webm|wav)$/.test(name) ? 'music' : /\.(jpg|png)$/.test(name) ? 'image' : /\.(srt|vtt|ttml|srv3)$/.test(name) ? 'captions' : 'video';
export function FolderWindow({ files, selected, cover, onClose, style }: {
  files: { name: string; size: string }[]; selected: string; cover?: string; onClose: () => void; style: CSSProperties;
}) {
  return (
    <div className="d-folder" role="dialog" aria-label="The download folder" style={style} data-pop>
      <div className="d-folder-head"><Icon name="folder" size={18} /><span>Downloads</span>
        <button type="button" className="d-folder-x" aria-label="Close" onClick={onClose}><Icon name="close" size={18} /></button></div>
      <ul>
        {files.map((f) => (
          <li key={f.name} aria-selected={f.name === selected} className={f.name === selected ? 'sel' : ''}>
            {f.name.endsWith('.mp3') && cover
              ? <img className="d-cover" src={cover} alt="" width={36} height={36} loading="lazy" decoding="async" />
              : <span className="d-file-ico"><Icon name={fileIcon(f.name)} size={18} /></span>}
            <span className="d-file-name">{f.name}</span>
            <span className="d-file-size">{f.size}</span>
          </li>
        ))}
      </ul>
      {cover && <p className="d-folder-note">The MP3 carries the video's picture as cover art.</p>}
    </div>
  );
}

// The showcases' cursor: the same arrow as the visitor's own (lib/arrow.ts, scripts/cursor.ts).
export function Cursor({ press }: { press: boolean }) {
  return (
    <svg className={`d-cursor-svg${press ? ' press' : ''}`} viewBox="0 0 24 24" width={ARROW_SIZE} height={ARROW_SIZE} aria-hidden="true">
      <path d={ARROW_PATH} fill="#fff" stroke="#0f0f0f" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}
