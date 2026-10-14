// One interactive scene of the extension: the toolbar under a neutral player, its pickers, the history ring and
// panel, or a Short's column. It runs as a guided loop (a cursor clicks through what the README describes) until
// the visitor clicks or presses a key inside it; from then on it's theirs. It pauses while out of view.
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m, useAnimate } from 'motion/react';
import { initialState, reducer, fmtSize, fmtTime, type Frame, type Job, type Scene, type VideoData } from './demo/model';
import {
  AudioPicker, Cursor, DropdownList, FolderWindow, HistButton, HistPanel, Player, ShortsColumn, ShortsMenu, Toolbar, TopBar, Ui,
  VideoPicker, audioOpts, videoOpts,
} from './demo/parts';
import { useMotionPref } from './motion-pref';

interface Props {
  scene: Scene;
  data: VideoData;
  frame: Frame;
  /** A Short's picture, for the shorts scene */
  tall?: Frame;
  /** Square crop of the frame, shown as the MP3's cover art */
  cover?: string;
  label: string;
  /** design width on desktop; the stage scales to fit */
  width?: number;
  autoplay?: boolean;
}

const EASE = [0.2, 0, 0, 1] as const; // the extension's --ysd-ease
const CURSOR_EASE = [0.45, 0, 0.2, 1] as const;
const pop = { initial: { opacity: 0, y: -4, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -4, scale: 0.98 }, transition: { duration: 0.14, ease: EASE } };
const abortErr = () => new DOMException('stopped', 'AbortError');

type Pos = { left: number; top: number; width?: number; maxHeight?: number } | null;

export default function Demo({ scene, data, frame, tall, cover, label, width = 1120, autoplay = true }: Props) {
  const [s, dispatch] = useReducer(reducer, undefined, () => initialState(data, scene));
  const sRef = useRef(s);
  sRef.current = s;
  const reduced = useMotionPref() === 'reduced';
  const [mode, setMode] = useState<'guided' | 'interactive'>(autoplay ? 'guided' : 'interactive');
  const [ui, setUi] = useState<{ hover: string | null; press: string | null }>({ hover: null, press: null });
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [cursorOn, setCursorOn] = useState(false);
  // Phones: the stage plays as an illustration (made inert by the stage-fit script in Base.astro).
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 719px)');
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const root = useRef<HTMLDivElement>(null);
  const [cursor, animate] = useAnimate<HTMLDivElement>();
  const visible = useRef(false);
  const ctrl = useRef<AbortController | null>(null);
  const [pos, setPos] = useState<{ pop: Pos; dd: Pos; panel: Pos; folder: Pos }>({ pop: null, dd: null, panel: null, folder: null });

  // ---------- geometry: everything in the stage's own (unscaled) pixels ----------
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
    const rate = mode === 'guided' ? 34 : 24; // percent per second, shortened for the page
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (visible.current && !document.hidden) dispatch({ type: 'tick', dt, rate });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [anyActive, mode]);
  useEffect(() => {
    if (!s.flash) return;
    const t = setTimeout(() => dispatch({ type: 'flashEnd' }), 1100); // content.js flashHist
    return () => clearTimeout(t);
  }, [s.flash]);

  // ---------- actions shared by the visitor and the tour ----------
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

  // ---------- the guided tour ----------
  const visibleWait = (ms: number, signal: AbortSignal) => new Promise<void>((res, rej) => {
    let left = ms;
    let last = performance.now();
    const tick = (now: number) => {
      if (signal.aborted) return rej(abortErr());
      if (visible.current && !document.hidden) left -= now - last;
      last = now;
      if (left <= 0) res(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const until = (cond: () => boolean, signal: AbortSignal) => new Promise<void>((res, rej) => {
    const tick = () => { if (signal.aborted) return rej(abortErr()); if (cond()) res(); else requestAnimationFrame(tick); };
    tick();
  });

  useEffect(() => {
    if (mode !== 'guided' || reduced) return;
    const c = new AbortController();
    ctrl.current = c;
    const { signal } = c;
    const wait = (ms: number) => visibleWait(ms, signal);
    const point = (t: string, fx = 0.5, fy = 0.5) => { const r = rel(q(t)); return { x: r.x + r.w * fx, y: r.y + r.h * fy }; };
    const move = async (t: string, ms = 650, fx = 0.5, fy = 0.55) => {
      await until(() => !!q(t), signal);
      const p = point(t, fx, fy);
      await animate(cursor.current, { x: p.x, y: p.y }, { duration: ms / 1000, ease: CURSOR_EASE });
      if (signal.aborted) throw abortErr();
    };
    const showTip = (t: string) => {
      const el = q(t) as HTMLElement | null;
      const text = el?.dataset.tip;
      if (!text) return;
      const r = rel(el);
      setTip({ text, x: r.x + r.w / 2, y: r.y + r.h + 8 });
    };
    const hover = async (t: string, ms = 650) => {
      await move(t, ms);
      setUi({ hover: t, press: null });
    };
    const click = async (t: string, act: () => void, ms = 650) => {
      await hover(t, ms);
      await wait(260);
      setUi({ hover: t, press: t });
      await wait(140);
      act();
      setUi({ hover: t, press: null });
      setTip(null);
    };
    const drag = async (which: 'start' | 'end', to: number) => {
      const t = `dot-${which}`;
      await hover(t, 700);
      await wait(200);
      setUi({ hover: t, press: t });
      const from = sRef.current.clip[which];
      const range = rel(root.current!.querySelector('[data-range]'));
      // The value and the cursor move on the same curve, so the dot stays under the pointer.
      await Promise.all([
        animate(from, to, { duration: 0.9, ease: CURSOR_EASE, onUpdate: (v) => dispatch({ type: 'clip', [which]: Math.round(v), duration: data.duration }) }),
        animate(cursor.current, { x: range.x + (to / data.duration) * range.w }, { duration: 0.9, ease: CURSOR_EASE }),
      ]);
      if (signal.aborted) throw abortErr();
      setUi({ hover: t, press: null });
      await wait(250);
    };
    const reset = () => { dispatch({ type: 'reset', state: initialState(data, scene) }); setUi({ hover: null, press: null }); setTip(null); };

    const tours: Record<Scene, () => Promise<void>> = {
      async video() {
        await hover('btn-video', 800); showTip('btn-video'); await wait(700); setTip(null);
        await click('btn-video', () => dispatch({ type: 'open', pop: 'video' }), 200);
        await wait(700);
        await click('select', () => dispatch({ type: 'dropdown', open: true }));
        await wait(450);
        await hover('dd-1', 450); await hover('dd-0', 380);
        await click('dd-0', () => dispatch({ type: 'pickVideo', key: data.video[0].key }), 200);
        await wait(650);
        await click('download', () => startDownload('video'));
        await move('hist', 900);
        await until(() => sRef.current.phase === 'done', signal);
        await wait(2200);
      },
      async trim() {
        await click('btn-video', () => dispatch({ type: 'open', pop: 'video' }), 800);
        await wait(600);
        await drag('start', Math.round(data.duration * 0.126));
        await drag('end', Math.round(data.duration * 0.386));
        await wait(700);
        await click('download', () => startDownload('video'));
        await move('hist', 900);
        await until(() => sRef.current.phase === 'done', signal);
        await wait(2000);
      },
      async audio() {
        await click('btn-audio', () => dispatch({ type: 'open', pop: 'audio' }), 800);
        await wait(600);
        await click('select', () => dispatch({ type: 'dropdown', open: true }));
        await wait(400);
        await hover('dd-3', 420); await hover('dd-1', 380); await hover('dd-0', 380);
        await click('dd-0', () => dispatch({ type: 'pickAudio', key: 'mp3-320' }), 200);
        await wait(600);
        await click('download', () => startDownload('audio'));
        await move('hist', 900);
        await until(() => sRef.current.phase === 'done', signal);
        await wait(500);
        await click('hist', () => dispatch({ type: 'panel', open: true }), 300);
        await wait(700);
        const done = sRef.current.jobs[0];
        await click(`folder-${done.id}`, () => reveal(done));
        await wait(2800);
      },
      async shorts() {
        await click('short-dl', () => dispatch({ type: 'open', pop: 'shortsMenu' }), 800);
        await wait(500);
        await hover('m-audio', 380); await hover('m-shot', 420); await hover('m-video', 420);
        await click('m-video', () => dispatch({ type: 'open', pop: 'video' }), 200);
        await wait(900);
        await click('download', () => startDownload('video'));
        await move('hist', 900);
        await until(() => sRef.current.phase === 'done', signal);
        await wait(2000);
      },
      async history() {
        await hover('hist', 900); showTip('hist'); await wait(900); setTip(null);
        await click('hist', () => dispatch({ type: 'panel', open: true }), 200);
        await until(() => sRef.current.phase === 'done', signal);
        await wait(700);
        const done = sRef.current.jobs.find((j) => j.id === 'h1')!;
        await click(`folder-${done.id}`, () => reveal(done));
        await wait(2800);
      },
    };

    (async () => {
      setCursorOn(true);
      const startAt = rel(root.current);
      await animate(cursor.current, { x: startAt.w * 0.62, y: startAt.h * 0.42 }, { duration: 0 });
      try {
        for (;;) {
          await wait(900);
          await tours[scene]();
          reset();
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') throw e;
      }
    })();
    return () => c.abort();
  }, [mode, reduced, scene]); // eslint-disable-line react-hooks/exhaustive-deps

  // A stage that mounts after the page loaded (the showcase's) is scaled to its box here.
  useLayoutEffect(() => { (window as Window & { __fitStages?: () => void }).__fitStages?.(); }, []);

  // ---------- visibility: pause out of view ----------
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.15 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  // ---------- the visitor takes over ----------
  const takeOver = () => {
    if (mode !== 'guided') return;
    ctrl.current?.abort();
    setMode('interactive');
    setCursorOn(false);
    setUi({ hover: null, press: null });
    setTip(null);
  };
  const tipTimer = useRef(0);
  const onOver = (e: React.PointerEvent) => {
    if (mode === 'guided' || e.pointerType === 'touch') return;
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
  const elapsed = Math.round(data.duration * 0.126);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <LazyMotion features={domAnimation} strict>
        <figure className="demo" data-mode={mode}>
          {/* --s is set by the stage-fit script in Base.astro before React loads */}
          <div className="stage" suppressHydrationWarning style={{ '--dw-d': String(width), '--dh-d': String(Math.round(width * 0.5625 + 184)) } as CSSProperties}>
            <div className="stage-inner">
              <Ui.Provider value={ui}>
                <div ref={root} className="ysd d-page" data-scene={scene} aria-label={label} role="group"
                  onPointerDownCapture={takeOver} onKeyDownCapture={takeOver} onPointerOver={onOver} onPointerLeave={() => setTip(null)}>
                  <TopBar><HistButton jobs={s.jobs} flash={s.flash} panel={s.panel} onClick={() => dispatch({ type: 'panel' })} /></TopBar>
                  {scene === 'shorts' && tall ? (
                    <div className="d-shorts">
                      <div className="d-short-frame"><img src={tall.src} srcSet={tall.srcset} width={tall.width} height={tall.height} alt={tall.alt} decoding="async" /></div>
                      <ShortsColumn open={s.pop === 'shortsMenu' || s.pop === 'video'} onDownload={() => dispatch({ type: 'open', pop: 'shortsMenu' })} />
                    </div>
                  ) : (
                    <>
                      <Player frame={frame} time={`${fmtTime(elapsed).replace(/^0/, '')} / ${fmtTime(data.duration).replace(/^0/, '')}`} />
                      <Toolbar open={s.pop === 'video' || s.pop === 'audio' ? s.pop : null}
                        onVideo={() => dispatch({ type: 'open', pop: 'video' })} onAudio={() => dispatch({ type: 'open', pop: 'audio' })} />
                      <div className="d-meta"><p className="d-vtitle">{data.title}</p><p className="d-channel">{data.author}</p></div>
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
                  {/* Centred under its button, but kept inside the stage (content.js showTip clamps to the window the same way) */}
                  {tip && <div className="ysd-tip" role="tooltip" ref={(el) => {
                    if (!el || !root.current) return;
                    const W = root.current.offsetWidth;
                    el.style.left = `${Math.min(Math.max(8, tip.x - el.offsetWidth / 2), W - el.offsetWidth - 8)}px`;
                  }} style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
                  <div ref={cursor} className="d-cursor" hidden={!cursorOn || mode !== 'guided'}><Cursor press={!!ui.press} /></div>
                </div>
              </Ui.Provider>
            </div>
          </div>
          <figcaption className="demo-bar">
            <span className="demo-state" aria-live="polite">
              <span className="demo-dot" />
              {small ? `${label}. On a computer you can click through it yourself.` : mode === 'guided' && !reduced ? 'Guided tour. Click anything to take over.' : 'Your turn. Click the buttons to try it.'}
            </span>
            {!small && (mode === 'interactive' || reduced) && autoplay && (
              <button type="button" className="demo-replay" onClick={() => { dispatch({ type: 'reset', state: initialState(data, scene) }); setMode('guided'); }} disabled={reduced}>
                Replay the tour
              </button>
            )}
          </figcaption>
        </figure>
      </LazyMotion>
    </MotionConfig>
  );
}
