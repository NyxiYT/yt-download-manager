// The extension under a neutral player, rebuilt from content.js (demo/parts.tsx, styles/ysd.css). Two ways to use it:
//
//   mode="hero"  the hero's intro, looping while it's in view (lib/playback.ts): the toolbar rises, the drawn cursor
//                opens the video picker, picks the top quality and presses Download; the first time, a file pill
//                then flies to the nav's Download button (flight.ts). Nothing in it can be clicked.
//   mode="try"   the Try it section: the scene opens mid-use and is the visitor's to click. While `tour` is on, the
//                drawn cursor shows this tab's story once, then onTourEnd moves Try it to the next tab. The thumbnail,
//                subtitle and screenshot buttons save real files (demo/save.ts); the tour never presses them.
//
// The drawn cursor follows choreo.ts: measured targets, hover, press, and a result only when the press lands.
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'motion/react';
import { SUB_FORMATS, initialState, reducer, fmtSize, fmtTime, type DemoState, type Job, type Scene, type VideoData } from './demo/model';
import {
  AudioPicker, Cursor, DropdownList, Film, FolderWindow, HistButton, HistPanel, Player, ShortsColumn, ShortsMenu, SubsPicker, ThumbPicker, Toolbar,
  TopBar, Ui, VideoPicker, audioOpts, subsChoice, subsOpts, thumbChoice, thumbOpts, videoOpts, type FilmSrc, type Saving, type TrackList,
} from './demo/parts';
import { SaveError, loadTracks, probeThumbs, saveShot, saveSubs, saveThumb, type ThumbAvail } from './demo/save';
import { abortErr, createChoreo, type Choreo } from './choreo';
import { useMotionPref } from './motion-pref';
import { useScenePlayback } from './playback';
import { FADE_MS, HOLD_MS, liveFade } from '../lib/playback';

interface Props {
  mode: 'hero' | 'try';
  scene: Scene;
  data: VideoData;
  film: FilmSrc;
  /** A still of the film, shown as the MP3's cover art in the folder window */
  cover?: string;
  label: string;
  /** Try it: play this tab's guided story (the visitor hasn't taken over). */
  tour?: boolean;
  /** Try it: the story played and faded out; go on to the next tab. */
  onTourEnd?: () => void;
}

const EASE = [0.2, 0, 0, 1] as const; // the extension's --ysd-ease
const pop = { initial: { opacity: 0, y: -4, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -4, scale: 0.98 }, transition: { duration: 0.14, ease: EASE } };
type Pos = { left: number; top: number; width?: number; maxHeight?: number } | null;

// Try it opens each scene mid-use, the way a visitor would find it a moment after clicking.
function midUse(data: VideoData, scene: Scene): DemoState {
  const s = initialState(data, scene);
  if (scene === 'video' || scene === 'trim') return { ...s, pop: 'video', phase: 'menuOpen' };
  if (scene === 'audio') return { ...s, pop: 'audio', phase: 'menuOpen' };
  if (scene === 'shorts') return { ...s, pop: 'shortsMenu', phase: 'menuOpen' };
  return { ...s, panel: true };
}

export default function Demo({ mode, scene, data, film, cover, label, tour = false, onTourEnd }: Props) {
  const hero = mode === 'hero';
  const start = useCallback(() => (hero ? initialState(data, scene) : midUse(data, scene)), [hero, data, scene]);
  const [s, dispatch] = useReducer(reducer, undefined, start);
  const sRef = useRef(s);
  sRef.current = s;
  const reduced = useMotionPref() === 'reduced';
  const [ui, setUi] = useState<{ hover: string | null; press: string | null }>({ hover: null, press: null });
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  // 'init': the toolbar rises by CSS on the first paint, before the script runs; every later loop goes through 'before'.
  const [intro, setIntro] = useState<'init' | 'before' | 'playing' | 'done'>(hero ? 'init' : 'done');
  const [time, setTime] = useState(3.6);
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const { live } = useScenePlayback(root);
  const [pos, setPos] = useState<{ pop: Pos; dd: Pos; panel: Pos; folder: Pos }>({ pop: null, dd: null, panel: null, folder: null });

  // A new tab in Try it: start that scene fresh.
  useEffect(() => { if (!hero) dispatch({ type: 'reset', state: start() }); }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- geometry, in the stage's own (unscaled) pixels ----------
  const rel = useCallback((el: Element | null) => {
    const r0 = root.current!;
    const k = r0.getBoundingClientRect().width / r0.offsetWidth || 1;
    const a = r0.getBoundingClientRect();
    const b = el ? el.getBoundingClientRect() : a;
    return { x: (b.left - a.left) / k, y: (b.top - a.top) / k, w: b.width / k, h: b.height / k };
  }, []);
  const q = (t: string) => root.current?.querySelector(`[data-t="${t}"]`) ?? null;

  useLayoutEffect(() => {
    const r0 = root.current;
    if (!r0) return;
    const W = r0.offsetWidth;
    const H = r0.offsetHeight;
    const next: typeof pos = { pop: null, dd: null, panel: null, folder: null };
    // The open picker, not one still fading out (Shorts menu → video picker): measuring that one placed the picker
    // with the wrong width, and it jumped on the next render.
    const popEl = r0.querySelector<HTMLElement>(`[data-picker="${s.pop}"]`);
    if (s.pop && popEl) {
      const anchor = rel(q(scene === 'shorts' ? 'short-dl' : `btn-${s.pop}`));
      const mw = popEl.offsetWidth;
      const mh = popEl.offsetHeight;
      if (scene === 'shorts') {
        next.pop = { left: Math.min(anchor.x + anchor.w + 12, W - mw - 8), top: Math.max(64, Math.min(anchor.y, H - mh - 8)) };
      } else {
        // content.js placePopover: below if it fits, else above if it fits, else the side with more room
        const below = H - (anchor.y + anchor.h) - 12;
        const above = anchor.y - 12;
        const flip = mh > below && (mh <= above || above > below);
        let left = anchor.x;
        if (left + mw > W - 8) left = anchor.x + anchor.w - mw;
        next.pop = { left: Math.max(8, Math.min(left, W - mw - 8)), top: Math.max(8, flip ? anchor.y - mh - 6 : anchor.y + anchor.h + 6) };
      }
    }
    const sel = q('select');
    if (s.dropdown && sel) {
      const r = rel(sel);
      const below = H - (r.y + r.h) - 8;
      const above = r.y - 8;
      const flip = below < 200 && above > below;
      const ddEl = r0.querySelector<HTMLElement>('.ysd-dd');
      const h = Math.min(320, ddEl?.scrollHeight ?? 300, flip ? above : below);
      next.dd = { left: Math.max(8, Math.min(r.x, W - Math.max(r.w, 220) - 8)), top: flip ? r.y - h - 4 : r.y + r.h + 4, width: Math.max(r.w, 220), maxHeight: h };
    }
    const panelEl = r0.querySelector<HTMLElement>('.ysd-panel');
    if (s.panel && panelEl) {
      const b = rel(q('hist'));
      next.panel = { left: Math.max(8, Math.min(b.x + b.w - panelEl.offsetWidth, W - panelEl.offsetWidth - 8)), top: b.y + b.h + 8 };
    }
    const folderEl = r0.querySelector<HTMLElement>('.d-folder');
    if (s.folder && folderEl) next.folder = { left: Math.round((W - folderEl.offsetWidth) / 2), top: Math.round(Math.max(72, (H - folderEl.offsetHeight) / 2 - 40)) };
    setPos((p) => (JSON.stringify(p) === JSON.stringify(next) ? p : next));
  });

  // ---------- downloads progress while visible ----------
  const anyActive = s.jobs.some((j) => j.status !== 'completed');
  useEffect(() => {
    if (!anyActive) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (live()) dispatch({ type: 'tick', dt, rate: 24 });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [anyActive, live]);
  useEffect(() => {
    if (!s.flash) return;
    const t = setTimeout(() => dispatch({ type: 'flashEnd' }), 1100); // content.js flashHist
    return () => clearTimeout(t);
  }, [s.flash]);

  const startDownload = useCallback((kind: 'video' | 'audio') => {
    const st = sRef.current;
    const trimmed = st.clip.start > 0.05 || st.clip.end < data.duration - 0.05;
    const ratio = (st.clip.end - st.clip.start) / data.duration;
    let job: Job;
    if (kind === 'video') {
      const o = data.video.find((x) => x.key === st.videoKey) ?? data.video[0];
      job = { id: `j${Date.now()}`, title: data.title, author: data.author, format: 'MP4', quality: o.quality, size: o.size * ratio, pct: 0, status: 'downloading', clip: trimmed ? { ...st.clip } : undefined };
    } else {
      const o = data.audio.find((x) => x.key === st.audioKey) ?? data.audio[0];
      const r = o.trimmable ? ratio : 1;
      job = { id: `j${Date.now()}`, title: data.title, author: data.author, format: o.format === 'OPUS' ? 'Opus' : o.format, quality: o.format === 'WAV' ? '44.1 kHz' : `${o.kbps}kbps`, size: o.size * r, pct: 0, status: 'downloading', clip: trimmed && o.trimmable ? { ...st.clip } : undefined };
    }
    dispatch({ type: 'start', job });
  }, [data]);
  const fileName = (j: Job) => j.file ?? `${j.title}.${({ MP4: 'mp4', MP3: 'mp3', M4A: 'm4a', Opus: 'webm', WAV: 'wav' } as Record<string, string>)[j.format] ?? 'mp4'}`;

  // ---------- real files: thumbnail, subtitles, screenshot ----------
  const [avail, setAvail] = useState<ThumbAvail>();
  const [tracks, setTracks] = useState<TrackList | null>(null);
  const [saving, setSaving] = useState<Saving>({ busy: false, error: null });
  useEffect(() => { setSaving({ busy: false, error: null }); }, [s.pop]);
  useEffect(() => { if (s.pop === 'thumb' && !avail) probeThumbs(data.vid).then(setAvail); }, [s.pop, avail, data.vid]);
  const fetchTracks = useCallback(() => {
    setTracks({ state: 'loading' });
    loadTracks(data.vid).then((t) => setTracks({ state: 'ready', tracks: t }),
      (e) => setTracks({ state: 'error', message: e instanceof SaveError ? e.message : "Couldn't load the list of subtitles." }));
  }, [data.vid]);
  useEffect(() => { if (s.pop === 'subs' && (!tracks || tracks.state === 'error')) fetchTracks(); }, [s.pop]); // eslint-disable-line react-hooks/exhaustive-deps
  const saved = (format: Job['format'], quality: string, size: number, file: string) => dispatch({
    type: 'saved', job: { id: `j${Date.now()}`, title: data.title, author: data.author, format, quality, size, pct: 100, status: 'completed', file },
  });
  // Runs one save; the picker shows "Fetching…" meanwhile and the failure as it is.
  const run = useCallback(async (act: () => Promise<void>) => {
    if (saving.busy) return;
    setSaving({ busy: true, error: null });
    try {
      await act();
      setSaving({ busy: false, error: null });
    } catch (e) {
      setSaving({ busy: false, error: e instanceof SaveError ? e.message : 'Something went wrong. Try again.' });
    }
  }, [saving.busy]);
  const onThumb = () => run(async () => {
    const r = await saveThumb(data.vid, data.title, thumbChoice(sRef.current, avail).key);
    saved('JPG', `${r.w}×${r.h}`, r.blob.size, r.name);
  });
  const onSubs = () => run(async () => {
    if (tracks?.state !== 'ready' || !tracks.tracks.length) return;
    const st = sRef.current;
    const track = subsChoice(st, tracks.tracks);
    const f = SUB_FORMATS[st.subFmt];
    const r = await saveSubs(track, st.subFmt, data.title);
    saved(f.label, track.label, r.blob.size, r.name);
  });
  // The screenshot has no picker: it saves at once, and a failure shows as a note under the button.
  const onShot = async (anchor: string) => {
    const v = root.current?.querySelector('video') ?? null;
    try {
      const r = await saveShot(v, data.title, 3.6 + (v?.currentTime ?? 0) * 0.85);
      saved('PNG', `${r.w}×${r.h}`, r.blob.size, r.name);
    } catch (err) {
      const b = rel(q(anchor));
      setTip({ text: err instanceof SaveError ? err.message : "Couldn't capture this frame.", x: b.x + b.w / 2, y: b.y + b.h + 8 });
    }
  };
  const reveal = useCallback((j: Job) => dispatch({ type: 'reveal', file: fileName(j) }), []);

  // A stage that mounts after the page loaded is scaled to its box here (the fit script in Base.astro).
  useLayoutEffect(() => { (window as Window & { __fitStages?: () => void }).__fitStages?.(); }, []);

  // ---------- the hero's intro, looping while in view ----------
  useEffect(() => {
    if (!hero) return;
    if (reduced) { setIntro('done'); return; }
    const c = new AbortController();
    const phone = matchMedia('(max-width: 719px)').matches;
    const ch = createChoreo({ root: root.current!, cursor: cursor.current!, show: 'hero', signal: c.signal, live, setUi });
    const top = data.video[0];
    // The file pill flies to the nav only on the first loop; after that the scene repeats quietly.
    let first = true;
    const fly = (r: DOMRect | undefined) => { if (r && first) import('./flight').then((f) => f.flyToNav(r)); };
    (async () => {
      await ch.wait(200);
      for (;;) {
        if (phone) {
          // Phones: the same steps without the cursor or the tilt.
          dispatch({ type: 'open', pop: 'video' }); await ch.wait(500);
          dispatch({ type: 'dropdown', open: true }); await ch.wait(450);
          setUi({ hover: 'dd-0', press: null }); await ch.wait(380);
          dispatch({ type: 'pickVideo', key: top.key }); setUi({ hover: null, press: null }); await ch.wait(400);
          const r = q('download')?.getBoundingClientRect();
          startDownload('video');
          fly(r);
          await ch.wait(500);
        } else {
          const r = rel(root.current);
          await ch.enter(r.w * 0.66, r.h * 0.46);
          await ch.click('btn-video', () => dispatch({ type: 'open', pop: 'video' }), 420);
          await ch.wait(200);
          await ch.click('select', () => dispatch({ type: 'dropdown', open: true }), 380);
          await ch.wait(160);
          await ch.hover('dd-1', 300);
          await ch.click('dd-0', () => dispatch({ type: 'pickVideo', key: top.key }), 220);
          await ch.wait(140);
          await ch.click('download', () => {
            const b = q('download')?.getBoundingClientRect();
            startDownload('video');
            fly(b);
          }, 380);
          await ch.wait(500);
          await ch.leave();
        }
        setIntro('done');
        first = false;
        // Hold, fade out, back to the toolbar alone, fade in; then the toolbar rises again (CSS).
        await ch.restart(root.current!, () => {
          dispatch({ type: 'reset', state: initialState(data, scene) });
          setUi({ hover: null, press: null });
          setIntro('before');
        });
        setIntro('playing');
        await ch.wait(450);
      }
    })().catch((e) => { if ((e as Error).name !== 'AbortError') throw e; });
    return () => { c.abort(); if (root.current) root.current.style.opacity = ''; };
  }, [hero, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Try it: this tab's guided story ----------
  // A tab that opens during the tour starts hidden and fades in; a tour that resumes on the same tab fades out,
  // resets the scene and fades back in. Any input from the visitor turns `tour` off (TryIt.tsx), which stops it here.
  const resumed = useRef(false);
  useLayoutEffect(() => { if (!hero && tour && !reduced && root.current) root.current.style.opacity = '0'; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hero || !tour || reduced) return;
    const c = new AbortController();
    const el = root.current!;
    const ch = createChoreo({ root: el, cursor: cursor.current!, show: `try-${scene}`, signal: c.signal, live, setUi });
    const half = FADE_MS / 2;
    const r = () => rel(el);
    const pickRow = async (rows: number[], pick: number, act: () => void) => {
      for (const i of rows) if (i !== pick && q(`dd-${i}`)) await ch.hover(`dd-${i}`, 300);
      await ch.click(`dd-${pick}`, act, 260);
    };
    const stories: Record<Scene, (ch: Choreo) => Promise<void>> = {
      async video(ch) {
        const top = data.video[0];
        await ch.click('select', () => dispatch({ type: 'dropdown', open: true }), 520);
        await ch.wait(200);
        await pickRow([2, 1], 0, () => dispatch({ type: 'pickVideo', key: top.key }));
        await ch.wait(200);
        await ch.click('download', () => startDownload('video'), 420);
        await ch.wait(1200);
      },
      async audio(ch) {
        const i = Math.max(0, data.audio.findIndex((a) => a.key === 'mp3-320'));
        await ch.click('select', () => dispatch({ type: 'dropdown', open: true }), 520);
        await ch.wait(200);
        await pickRow([i + 2, i + 1], i, () => dispatch({ type: 'pickAudio', key: data.audio[i].key }));
        await ch.wait(200);
        await ch.click('download', () => startDownload('audio'), 420);
        await ch.wait(1200);
      },
      async trim(ch) {
        const d = data.duration;
        await ch.drag('dot-start', 'range', 0, 0.22, (v) => dispatch({ type: 'clip', start: Math.round(v * d), duration: d }), 900);
        await ch.wait(250);
        await ch.drag('dot-end', 'range', 1, 0.64, (v) => dispatch({ type: 'clip', end: Math.round(v * d), duration: d }), 900);
        await ch.wait(300);
        await ch.click('download', () => startDownload('video'), 520);
        await ch.wait(1000);
      },
      async shorts(ch) {
        await ch.click('m-video', () => dispatch({ type: 'open', pop: 'video' }), 520);
        await ch.wait(400);
        await ch.click('download', () => startDownload('video'), 520);
        await ch.wait(1200);
      },
      async history(ch) {
        const done = sRef.current.jobs.find((j) => j.status === 'completed');
        if (done) await ch.click(`folder-${done.id}`, () => reveal(done), 620);
        await ch.wait(1400);
      },
    };
    (async () => {
      if (resumed.current) {
        await liveFade(el, 0, half, live, c.signal);
        dispatch({ type: 'reset', state: start() });
        await ch.wait(60);
      }
      resumed.current = true;
      await liveFade(el, 1, half, live, c.signal);
      await ch.enter(r().w * 0.62, r().h * 0.55);
      await stories[scene](ch);
      await ch.leave();
      setUi({ hover: null, press: null });
      await ch.wait(HOLD_MS);
      await liveFade(el, 0, half, live, c.signal);
      onTourEnd?.();
    })().catch((e) => { if ((e as Error).name !== 'AbortError') throw e; });
    return () => { c.abort(); setUi({ hover: null, press: null }); el.style.opacity = ''; };
  }, [tour, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- tooltips for the visitor (Try it) ----------
  const tipTimer = useRef(0);
  const onOver = (e: React.PointerEvent) => {
    if (hero || e.pointerType === 'touch') return;
    const el = (e.target as Element).closest<HTMLElement>('[data-tip]');
    clearTimeout(tipTimer.current);
    if (!el) return setTip(null);
    tipTimer.current = window.setTimeout(() => { const r = rel(el); setTip({ text: el.dataset.tip!, x: r.x + r.w / 2, y: r.y + r.h + 8 }); }, 400);
  };

  const toggleDropdown = () => dispatch({ type: 'dropdown' });
  const onClip = (c: { start?: number; end?: number }) => dispatch({ type: 'clip', ...c, duration: data.duration });
  const close = () => dispatch({ type: 'close' });
  const style = (p: Pos): CSSProperties => (p ? { left: p.left, top: p.top, width: p.width, maxHeight: p.maxHeight } : { left: 0, top: 0, visibility: 'hidden' });
  const trackList = tracks?.state === 'ready' ? tracks.tracks : [];
  const ddOptions = s.pop === 'audio' ? audioOpts(data.audio) : s.pop === 'thumb' ? thumbOpts(avail) : s.pop === 'subs' ? subsOpts(trackList) : videoOpts(data.video);
  const ddValue = s.pop === 'audio' ? s.audioKey : s.pop === 'thumb' ? thumbChoice(s, avail).key : s.pop === 'subs' ? subsChoice(s, trackList)?.key ?? '' : s.videoKey;
  const ddPick = (v: string) => dispatch(s.pop === 'audio' ? { type: 'pickAudio', key: v } : s.pop === 'thumb' ? { type: 'pickThumb', key: v } : s.pop === 'subs' ? { type: 'pickSubs', key: v } : { type: 'pickVideo', key: v });
  const open = (pop: 'video' | 'audio' | 'thumb' | 'subs') => () => dispatch({ type: 'open', pop });
  const files = s.jobs.filter((j) => j.status === 'completed').map((j) => ({ name: fileName(j), size: fmtSize(j.size) }));
  const clock = `${fmtTime(time).replace(/^0/, '')} / ${fmtTime(data.duration).replace(/^0/, '')}`;
  const dw = hero ? 760 : 1120;
  const dh = hero ? Math.round(760 * 0.5625 + 56) : Math.round(1120 * 0.5625 + 184);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <LazyMotion features={domAnimation} strict>
        <div className={`stage stage-${mode}`} suppressHydrationWarning style={{ '--dw-d': String(dw), '--dh-d': String(dh) } as CSSProperties}>
          <div className="stage-inner">
            <Ui.Provider value={ui}>
              <div ref={root} className="ysd d-page" data-scene={scene} data-intro={intro} role="group" aria-label={label}
                inert={hero} onPointerOver={onOver} onPointerLeave={() => setTip(null)}>
                {!hero && <TopBar><HistButton jobs={s.jobs} flash={s.flash} panel={s.panel} onClick={() => dispatch({ type: 'panel' })} /></TopBar>}
                {scene === 'shorts' ? (
                  <div className="d-shorts">
                    <div className="d-short-frame"><Film film={film} /></div>
                    <ShortsColumn open={s.pop === 'shortsMenu' || s.pop === 'video'} onDownload={() => dispatch({ type: 'open', pop: 'shortsMenu' })} />
                  </div>
                ) : (
                  <>
                    <Player film={film} time={clock} />
                    <div className="d-bar">
                      <Toolbar open={s.pop !== 'shortsMenu' ? s.pop : null} onVideo={open('video')} onAudio={open('audio')}
                        onThumb={hero ? undefined : open('thumb')} onSubs={hero ? undefined : open('subs')} onShot={hero ? undefined : () => onShot('btn-shot')} />
                    </div>
                    {!hero && <div className="d-meta"><p className="d-vtitle">{data.title}</p><p className="d-channel">{data.author}</p></div>}
                  </>
                )}

                <AnimatePresence>
                  {s.pop === 'video' && (
                    <m.div key="pv" className="d-layer" {...pop}>
                      <VideoPicker data={data} s={s} style={style(pos.pop)} onClose={close} onToggle={toggleDropdown} onClip={onClip} onDownload={() => startDownload('video')} />
                    </m.div>
                  )}
                  {s.pop === 'audio' && (
                    <m.div key="pa" className="d-layer" {...pop}>
                      <AudioPicker data={data} s={s} style={style(pos.pop)} onClose={close} onToggle={toggleDropdown} onClip={onClip} onDownload={() => startDownload('audio')} />
                    </m.div>
                  )}
                  {s.pop === 'thumb' && (
                    <m.div key="pt" className="d-layer" {...pop}>
                      <ThumbPicker data={data} s={s} avail={avail} saving={saving} style={style(pos.pop)} onClose={close} onToggle={toggleDropdown} onDownload={onThumb} />
                    </m.div>
                  )}
                  {s.pop === 'subs' && (
                    <m.div key="ps" className="d-layer" {...pop}>
                      <SubsPicker s={s} list={tracks ?? { state: 'loading' }} saving={saving} style={style(pos.pop)} onClose={close} onToggle={toggleDropdown}
                        onFormat={(fmt) => dispatch({ type: 'subFmt', fmt })} onRetry={fetchTracks} onDownload={onSubs} />
                    </m.div>
                  )}
                  {s.pop === 'shortsMenu' && (
                    <m.div key="pm" className="d-layer" {...pop}>
                      <ShortsMenu style={style(pos.pop)} onVideo={open('video')} onAudio={open('audio')} onThumb={open('thumb')} onSubs={open('subs')}
                        onShot={() => { dispatch({ type: 'close' }); onShot('short-dl'); }} />
                    </m.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {s.dropdown && (
                    <m.div key="dd" className="d-layer" initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.12, ease: EASE }}>
                      <DropdownList options={ddOptions} value={ddValue} style={style(pos.dd)} onPick={ddPick} />
                    </m.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {s.panel && (
                    <m.div key="panel" className="d-layer" initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.18, ease: EASE }}>
                      <HistPanel jobs={s.jobs} style={style(pos.panel)} onClose={() => dispatch({ type: 'panel', open: false })} onReveal={reveal} />
                    </m.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {s.folder && (
                    <m.div key="folder" className="d-layer" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.22, ease: EASE }}>
                      <FolderWindow files={files} selected={s.folder} cover={cover} style={style(pos.folder)} onClose={() => dispatch({ type: 'folderClose' })} />
                    </m.div>
                  )}
                </AnimatePresence>
                {tip && <div className="ysd-tip" role="tooltip" ref={(el) => {
                  if (!el || !root.current) return;
                  const W = root.current.offsetWidth;
                  el.style.left = `${Math.min(Math.max(8, tip.x - el.offsetWidth / 2), W - el.offsetWidth - 8)}px`;
                }} style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
                {(hero || tour) && <div ref={cursor} className="d-cursor" style={{ opacity: 0 }}><Cursor press={!!ui.press} /></div>}
              </div>
            </Ui.Provider>
          </div>
          {hero && <TimeSync onTime={setTime} />}
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}

// The player's clock follows the film (the first <video> in the stage).
function TimeSync({ onTime }: { onTime: (t: number) => void }) {
  useEffect(() => {
    const v = document.querySelector<HTMLVideoElement>('.stage-hero video');
    if (!v) return;
    const f = () => onTime(3.6 + v.currentTime * 0.85);
    v.addEventListener('timeupdate', f);
    return () => v.removeEventListener('timeupdate', f);
  }, [onTime]);
  return null;
}

export { abortErr };
