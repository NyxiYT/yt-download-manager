// The extension under a neutral player, rebuilt from content.js (demo/parts.tsx, styles/ysd.css). Two ways to use it:
//
//   mode="hero"  the hero's intro, once: the toolbar rises, the drawn cursor opens the video picker, picks the top
//                quality and presses Download; a file pill then flies to the nav's Download button (flight.ts).
//                Nothing in it can be clicked; a replay button under it plays it again.
//   mode="try"   the Try it section: the scene opens mid-use and is the visitor's to click. No drawn cursor.
//
// The drawn cursor follows choreo.ts: measured targets, hover, press, and a result only when the press lands.
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'motion/react';
import { initialState, reducer, fmtSize, fmtTime, type DemoState, type Job, type Scene, type VideoData } from './demo/model';
import {
  AudioPicker, Cursor, DropdownList, Film, FolderWindow, HistButton, HistPanel, Player, ShortsColumn, ShortsMenu, Toolbar, TopBar, Ui,
  VideoPicker, audioOpts, videoOpts, type FilmSrc,
} from './demo/parts';
import { abortErr, createChoreo } from './choreo';
import { useMotionPref } from './motion-pref';

interface Props {
  mode: 'hero' | 'try';
  scene: Scene;
  data: VideoData;
  film: FilmSrc;
  /** A still of the film, shown as the MP3's cover art in the folder window */
  cover?: string;
  label: string;
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

export default function Demo({ mode, scene, data, film, cover, label }: Props) {
  const hero = mode === 'hero';
  const start = useCallback(() => (hero ? initialState(data, scene) : midUse(data, scene)), [hero, data, scene]);
  const [s, dispatch] = useReducer(reducer, undefined, start);
  const sRef = useRef(s);
  sRef.current = s;
  const reduced = useMotionPref() === 'reduced';
  const [ui, setUi] = useState<{ hover: string | null; press: string | null }>({ hover: null, press: null });
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  // 'init': the toolbar rises by CSS on the first paint, before the script runs; a replay goes through 'before'.
  const [intro, setIntro] = useState<'init' | 'before' | 'playing' | 'done'>(hero ? 'init' : 'done');
  const [run, setRun] = useState(0); // bumps on replay
  const [time, setTime] = useState(3.6);
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
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
    const popEl = r0.querySelector<HTMLElement>('.ysd-pop');
    if (s.pop && popEl) {
      const anchor = rel(q(scene === 'shorts' ? 'short-dl' : s.pop === 'audio' ? 'btn-audio' : 'btn-video'));
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
      if (visible.current && !document.hidden) dispatch({ type: 'tick', dt, rate: 24 });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [anyActive]);
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
  const fileName = (j: Job) => `${j.title}.${({ MP4: 'mp4', MP3: 'mp3', M4A: 'm4a', Opus: 'webm', WAV: 'wav' } as Record<string, string>)[j.format] ?? 'mp4'}`;
  const reveal = useCallback((j: Job) => dispatch({ type: 'reveal', file: fileName(j) }), []);

  // ---------- visibility ----------
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.15 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);
  // A stage that mounts after the page loaded is scaled to its box here (the fit script in Base.astro).
  useLayoutEffect(() => { (window as Window & { __fitStages?: () => void }).__fitStages?.(); }, []);

  // ---------- the hero's intro ----------
  useEffect(() => {
    if (!hero) return;
    if (reduced) { setIntro('done'); return; }
    const c = new AbortController();
    const phone = matchMedia('(max-width: 719px)').matches;
    const live = () => visible.current && !document.hidden;
    const ch = createChoreo({ root: root.current!, cursor: cursor.current!, show: 'hero', signal: c.signal, live, setUi });
    const top = data.video[0];
    (async () => {
      if (run > 0) {
        dispatch({ type: 'reset', state: initialState(data, scene) });
        setIntro('before');
        await ch.wait(250);
        setIntro('playing'); // the toolbar slides up (CSS)
        await ch.wait(450);
      } else {
        await ch.wait(200);
      }
      if (phone) {
        // Phones: the same steps without the cursor or the tilt.
        dispatch({ type: 'open', pop: 'video' }); await ch.wait(500);
        dispatch({ type: 'dropdown', open: true }); await ch.wait(450);
        setUi({ hover: 'dd-0', press: null }); await ch.wait(380);
        dispatch({ type: 'pickVideo', key: top.key }); setUi({ hover: null, press: null }); await ch.wait(400);
        const r = q('download')?.getBoundingClientRect();
        startDownload('video');
        if (r) import('./flight').then((f) => f.flyToNav(r));
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
          if (b) import('./flight').then((f) => f.flyToNav(b));
        }, 380);
        await ch.wait(500);
        await ch.leave();
      }
      setIntro('done');
    })().catch((e) => { if ((e as Error).name !== 'AbortError') throw e; });
    return () => c.abort();
  }, [hero, reduced, run]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const ddOptions = s.pop === 'audio' ? audioOpts(data.audio) : videoOpts(data.video);
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
                      <Toolbar open={s.pop === 'video' || s.pop === 'audio' ? s.pop : null}
                        onVideo={() => dispatch({ type: 'open', pop: 'video' })} onAudio={() => dispatch({ type: 'open', pop: 'audio' })} />
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
                  {s.pop === 'shortsMenu' && (
                    <m.div key="pm" className="d-layer" {...pop}>
                      <ShortsMenu style={style(pos.pop)} onVideo={() => dispatch({ type: 'open', pop: 'video' })} />
                    </m.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {s.dropdown && (
                    <m.div key="dd" className="d-layer" initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.12, ease: EASE }}>
                      <DropdownList options={ddOptions} value={s.pop === 'audio' ? s.audioKey : s.videoKey} style={style(pos.dd)}
                        onPick={(v) => dispatch(s.pop === 'audio' ? { type: 'pickAudio', key: v } : { type: 'pickVideo', key: v })} />
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
                {hero && <div ref={cursor} className="d-cursor" style={{ opacity: 0 }}><Cursor press={!!ui.press} /></div>}
              </div>
            </Ui.Provider>
          </div>
          {hero && <TimeSync onTime={setTime} />}
        </div>
        {hero && (
          <button type="button" className="replay" onClick={() => setRun((n) => n + 1)} disabled={intro !== 'done' || reduced} aria-label="Replay the intro">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4h4" /></svg>
            <span>Replay</span>
          </button>
        )}
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
