// The hero's moving picture: the download toolbar slides in under a video, the pointer opens "Download video",
// picks 4320p60 (8K), clicks Download, and the progress flies into the history clock in the top bar. It loops,
// pauses when out of sight, and can be paused, replayed or stepped through. With reduced motion it shows one
// still frame (the menu open, 8K picked) and the steps switch frames without movement.
//
// Everything is placed in "u": hundredths of the player's width (CSS container units), so the picture scales
// as one piece and the pointer's targets stay on their buttons at every size.
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { IconName } from '../lib/icons';
import { Icon } from './Icon';

const HEIGHT = 58.5; // u: top bar 0–6, video 6–52, toolbar 52–58.5
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Phases and how long each lasts (ms).
const DUR = [700, 650, 900, 420, 800, 420, 700, 420, 850, 420, 2300, 900, 2600];
const STILL = 7; // the frame without scripts or with reduced motion
const CHAPTERS = [
  { label: 'Toolbar', phase: 1 },
  { label: 'Download video', phase: 3 },
  { label: 'Pick 8K', phase: 7 },
  { label: 'Download', phase: 10 },
  { label: 'Saved', phase: 12 },
];

const P = {
  video: { x: 2.6, y: 55.25 },
  quality: { x: 17.5, y: 25.6 },
  option8k: { x: 15.5, y: 30.6 },
  download: { x: 28.3, y: 46.4 },
  clock: { x: 93.4, y: 3 },
  pill: { x: 49, y: 55.25 },
};

const OPTIONS = [
  { q: '4320p60', badge: '8K', codec: 'AV1' },
  { q: '2160p60', badge: '4K', codec: 'AV1' },
  { q: '1440p60', badge: '2K', codec: 'AV1' },
  { q: '1080p60', badge: 'HD', codec: 'H.264' },
  { q: '720p60', badge: 'HD', codec: 'H.264' },
];

const LEFT: IconName[] = ['video', 'music', 'image', 'captions', 'camera'];
const RIGHT: IconName[] = ['moon', 'focus', 'pip', 'repeat'];

const spring = { type: 'spring', stiffness: 170, damping: 22, mass: 0.9 } as const;
const pop = { type: 'spring', stiffness: 420, damping: 28 } as const;

function cursorAt(phase: number) {
  if (phase <= 0) return { ...P.quality, x: 60, y: 34, o: 0 };
  if (phase === 1) return { x: 44, y: 38, o: 1 };
  if (phase <= 3) return { ...P.video, o: 1 };
  if (phase <= 5) return { ...P.quality, o: 1 };
  if (phase <= 7) return { ...P.option8k, o: 1 };
  if (phase <= 9) return { ...P.download, o: 1 };
  if (phase === 10) return { x: 42, y: 44, o: 1 };
  return { x: 70, y: 30, o: 0 };
}

const CLICKS = new Set([3, 5, 7, 9]);

export default function HeroDemo() {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0); // the player's width in px, for the pointer's moves
  const [phase, setPhase] = useState(STILL);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
  const started = useRef(false);

  useIsoLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => { ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // Starts on its own once, unless the visitor asked for less motion.
  useEffect(() => {
    if (started.current || reduce !== false) return;
    started.current = true;
    setPhase(0);
    setPlaying(true);
  }, [reduce]);

  useEffect(() => {
    if (!playing || !visible) return;
    const t = setTimeout(() => setPhase((p) => (p + 1) % DUR.length), DUR[phase]);
    return () => clearTimeout(t);
  }, [phase, playing, visible]);

  const px = (u: number) => (u * w) / 100;
  const c = cursorAt(phase);
  const toolbarIn = phase >= 1;
  const panelOpen = phase >= 3 && phase <= 8; // the click on Download (phase 9) closes it
  const listOpen = phase >= 5 && phase < 7;
  const shown = phase >= 7 ? OPTIONS[0] : OPTIONS[3]; // 1080p60 until 8K is picked
  const downloading = phase >= 9 && phase <= 11;
  const done = phase >= 11;
  const chapter = CHAPTERS.reduce((a, ch, i) => (phase >= ch.phase ? i : a), -1);

  const go = (p: number) => { setPhase(p); setPlaying(false); };

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <figure className="hero-demo m-0">
          <div
            ref={stage}
            className="relative w-full overflow-hidden rounded-[var(--radius-lg)] bg-frame text-white shadow-lift ring-1 ring-white/10 select-none"
            style={{ containerType: 'inline-size', aspectRatio: `100 / ${HEIGHT}` }}
            role="img"
            aria-label="Animation: the download toolbar appears under a video. The pointer clicks the video button, opens the quality list, picks 4320p60 (8K) and clicks Download; the progress bar flies into the history clock in the top bar and the download shows as completed."
          >
            {/* Top bar: a neutral search bar and the history clock the extension adds. No site logo. */}
            <div className="absolute inset-x-0 top-0 flex items-center gap-[1.6cqw] px-[2cqw]" style={{ height: '6cqw' }}>
              <span className="flex flex-col gap-[0.45cqw]" aria-hidden="true">
                {[0, 1, 2].map((i) => <span key={i} className="block h-[0.25cqw] w-[2cqw] rounded-full bg-white/70" />)}
              </span>
              <span className="mx-auto flex h-[3.6cqw] w-[38cqw] items-center rounded-full border border-white/15 bg-white/[0.04] px-[1.6cqw] text-[1.25cqw] text-white/60">Search</span>
              <span className="relative grid h-[3.8cqw] w-[3.8cqw] place-items-center rounded-full" style={{ position: 'absolute', left: `${P.clock.x - 1.9}cqw`, top: '1.1cqw' }}>
                <m.span
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgb(var(--glow) / 0.22)' }}
                  initial={false}
                  animate={done ? { opacity: [0, 1, 0.55], scale: [0.6, 1.25, 1] } : { opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.7 }}
                />
                <Icon name="history" className="relative h-[2.4cqw] w-[2.4cqw] text-[#3ea6ff]" />
                <AnimatePresence initial={false}>
                  {done && (
                    <m.span
                      key="badge"
                      className="absolute -right-[0.3cqw] -top-[0.3cqw] grid h-[1.7cqw] w-[1.7cqw] place-items-center rounded-full bg-[#2ba640] ring-[0.3cqw] ring-frame"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} transition={pop}
                    >
                      <Icon name="check" className="h-[1.2cqw] w-[1.2cqw] text-white" />
                    </m.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="h-[3.2cqw] w-[3.2cqw] rounded-full bg-gradient-to-br from-white/30 to-white/5" style={{ position: 'absolute', right: '1.6cqw', top: '1.4cqw' }} />
            </div>

            {/* The video: an illustrated scene (not a real video's frame). */}
            <div className="absolute inset-x-0 overflow-hidden" style={{ top: '6cqw', height: '46cqw' }}>
              <Scene />
              <div className="absolute inset-x-[1.5cqw] bottom-[1.2cqw] h-[0.35cqw] rounded-full bg-white/20">
                <m.div className="h-full w-full origin-left rounded-full bg-white/80" initial={false} animate={{ scaleX: 0.38 + phase * 0.012 }} transition={{ duration: 0.6 }} />
              </div>
            </div>

            {/* The toolbar under the video. */}
            <m.div
              className="absolute inset-x-0 flex items-center px-[1.2cqw]"
              style={{ top: '52cqw', height: '6.5cqw', background: '#0f0f0f', borderTop: '1px solid rgb(255 255 255 / 0.06)' }}
              initial={false}
              animate={toolbarIn ? { y: 0, opacity: 1 } : { y: '6.5cqw', opacity: 0 }}
              transition={spring}
            >
              {LEFT.map((n, i) => (
                <span key={n} className={`grid h-[4.2cqw] w-[3.8cqw] place-items-center rounded-full ${i === 0 && panelOpen ? 'bg-white/10 text-[#3ea6ff]' : 'text-white/85'}`}>
                  <Icon name={n} className="h-[2.1cqw] w-[2.1cqw]" />
                </span>
              ))}
              <span className="ml-auto flex items-center">
                {RIGHT.map((n) => (
                  <span key={n} className="grid h-[4.2cqw] w-[3.8cqw] place-items-center text-white/85"><Icon name={n} className="h-[2.1cqw] w-[2.1cqw]" /></span>
                ))}
                <span className="mx-[0.8cqw] h-[2.6cqw] w-px bg-white/15" />
                {(['more', 'help', 'close'] as IconName[]).map((n) => (
                  <span key={n} className="grid h-[4.2cqw] w-[3.6cqw] place-items-center text-white/85"><Icon name={n} className="h-[2.1cqw] w-[2.1cqw]" /></span>
                ))}
              </span>
            </m.div>

            {/* "Download video", as the extension draws it. */}
            <AnimatePresence initial={false}>
              {panelOpen && (
                <m.div
                  key="panel"
                  className="absolute rounded-[1.2cqw] bg-[#212121] shadow-[0_2cqw_5cqw_rgba(0,0,0,0.55)] ring-1 ring-white/10"
                  style={{ left: '1cqw', top: '14.6cqw', width: '35cqw', padding: '1.6cqw', transformOrigin: '6% 100%' }}
                  initial={{ opacity: 0, scale: 0.9, y: '2cqw' }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: '1cqw' }}
                  transition={pop}
                >
                  <div className="flex items-center gap-[1cqw] text-[1.5cqw] font-semibold">
                    <Icon name="video" className="h-[2cqw] w-[2cqw] text-white/80" /> Download video
                    <Icon name="pin" className="ml-auto h-[1.8cqw] w-[1.8cqw] text-white/50" />
                    <Icon name="close" className="h-[1.8cqw] w-[1.8cqw] text-white/50" />
                  </div>
                  <div className="mt-[1.4cqw] text-[1.15cqw] text-white/60">Quality</div>
                  <div className="mt-[0.6cqw] flex h-[4.4cqw] items-center rounded-[0.8cqw] border border-white/15 px-[1.2cqw] text-[1.45cqw]">
                    <b className="font-semibold">{shown.q}</b>
                    <sup className="ml-[0.3cqw] text-[0.85cqw] font-bold text-[#ff4e45]">{shown.badge}</sup>
                    <span className="ml-[1cqw] text-white/60">{shown.codec}</span>
                    <Icon name="expand" className="ml-auto h-[2cqw] w-[2cqw] text-white/70" />
                  </div>
                  <div className="mt-[1.5cqw] flex items-center gap-[0.8cqw] text-[1.15cqw] text-white/60">
                    <Icon name="scissors" className="h-[1.7cqw] w-[1.7cqw]" /> Trim <span className="ml-auto">Full length</span>
                  </div>
                  <div className="relative mt-[1.4cqw] h-[0.4cqw] rounded-full bg-[#3ea6ff]">
                    <span className="absolute -left-[0.2cqw] -top-[0.75cqw] h-[1.9cqw] w-[1.9cqw] rounded-full border-[0.3cqw] border-[#3ea6ff] bg-white" />
                    <span className="absolute -right-[0.2cqw] -top-[0.75cqw] h-[1.9cqw] w-[1.9cqw] rounded-full border-[0.3cqw] border-[#3ea6ff] bg-white" />
                  </div>
                  <div className="mt-[2.4cqw] flex items-center text-[1.15cqw] text-white/60">
                    MP4 · {shown.codec}
                    <span className="ml-auto flex h-[4cqw] items-center gap-[0.6cqw] rounded-full bg-[#3ea6ff] px-[1.8cqw] text-[1.35cqw] font-semibold text-[#071521]">
                      <Icon name="download" className="h-[1.8cqw] w-[1.8cqw]" /> Download
                    </span>
                  </div>

                  {/* The quality list, over the panel. */}
                  <AnimatePresence initial={false}>
                    {listOpen && (
                      <m.ul
                        key="list"
                        className="absolute m-0 list-none rounded-[0.9cqw] bg-[#2b2b2b] p-[0.5cqw] shadow-[0_1.5cqw_4cqw_rgba(0,0,0,0.6)] ring-1 ring-white/10"
                        style={{ left: '1.6cqw', right: '1.6cqw', top: '9.2cqw', transformOrigin: 'top' }}
                        initial={{ opacity: 0, y: '-0.8cqw', scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: '-0.5cqw', scale: 0.98 }}
                        transition={pop}
                      >
                        {OPTIONS.map((o, i) => (
                          <li key={o.q} className={`flex h-[3.6cqw] items-center rounded-[0.6cqw] px-[1cqw] text-[1.35cqw] ${i === 0 && phase >= 6 ? 'bg-[#3ea6ff]/20 text-white' : 'text-white/85'}`}>
                            <b className="font-semibold">{o.q}</b>
                            <sup className="ml-[0.3cqw] text-[0.8cqw] font-bold text-[#ff4e45]">{o.badge}</sup>
                            <span className="ml-auto text-white/55">{o.codec}</span>
                          </li>
                        ))}
                      </m.ul>
                    )}
                  </AnimatePresence>
                </m.div>
              )}
            </AnimatePresence>

            {/* The download's progress, which then flies into the clock. */}
            <AnimatePresence initial={false}>
              {downloading && (
                <m.div
                  key="pill"
                  className="absolute flex items-center gap-[1cqw] rounded-full bg-[#212121] px-[1.4cqw] text-[1.2cqw] ring-1 ring-white/10"
                  style={{ left: `${P.pill.x - 13}cqw`, top: '53.1cqw', width: '26cqw', height: '4.3cqw' }}
                  initial={{ opacity: 0, y: '1cqw', scale: 0.9 }}
                  animate={phase === 11
                    ? { opacity: 0, scale: 0.12, x: px(P.clock.x - P.pill.x), y: px(P.clock.y - P.pill.y) }
                    : { opacity: 1, y: 0, scale: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={phase === 11 ? { type: 'spring', stiffness: 90, damping: 16 } : pop}
                >
                  <Icon name="dlLine" className="h-[1.8cqw] w-[1.8cqw] text-[#3ea6ff]" />
                  <span className="whitespace-nowrap font-semibold">4320p60 <span className="text-[#ff4e45]">8K</span></span>
                  <span className="relative h-[0.6cqw] flex-1 overflow-hidden rounded-full bg-white/15">
                    <m.span
                      className="absolute inset-0 origin-left rounded-full bg-[#3ea6ff]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: phase >= 10 ? 1 : 0.04 }}
                      transition={{ duration: phase >= 10 ? 2.1 : 0.3, ease: [0.45, 0, 0.15, 1] }}
                    />
                  </span>
                </m.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {done && (
                <m.span
                  key="done"
                  className="absolute rounded-full bg-[#2ba640]/20 px-[1.2cqw] py-[0.5cqw] text-[1.15cqw] font-semibold text-[#5bd26f] ring-1 ring-[#2ba640]/40"
                  style={{ right: '8cqw', top: '1.6cqw' }}
                  initial={{ opacity: 0, x: '1cqw' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ ...pop, delay: 0.25 }}
                >
                  Completed
                </m.span>
              )}
            </AnimatePresence>

            {/* The pointer, and a ring where it clicks. */}
            {w > 0 && (
              <m.div
                className="pointer-events-none absolute left-0 top-0"
                initial={false}
                animate={{ x: px(c.x), y: px(c.y), opacity: c.o, scale: CLICKS.has(phase) ? 0.86 : 1 }}
                transition={{ x: spring, y: spring, opacity: { duration: 0.25 }, scale: pop }}
              >
                <AnimatePresence initial={false}>
                  {CLICKS.has(phase) && (
                    <m.span
                      key={phase}
                      className="absolute -left-[2cqw] -top-[2cqw] h-[4cqw] w-[4cqw] rounded-full border-[0.25cqw] border-white/80"
                      initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: 1.2, opacity: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                    />
                  )}
                </AnimatePresence>
                <svg viewBox="0 0 24 24" style={{ width: '2.6cqw', height: '2.6cqw', filter: 'drop-shadow(0 0.3cqw 0.4cqw rgb(0 0 0 / .5))' }} aria-hidden="true">
                  <path d="M5 2.5v17.2l4.6-4.4 2.9 6.6 2.9-1.3-2.9-6.5h6.4z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </m.div>
            )}
          </div>

          {/* Controls: pause or play, replay, and the five steps to jump to. */}
          <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-2" aria-label="Animation controls">
            <button type="button" className="demo-ctl" onClick={() => (reduce ? go((phase + 1) % DUR.length) : setPlaying((p) => !p))} aria-label={playing ? 'Pause the animation' : reduce ? 'Next step' : 'Play the animation'}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button type="button" className="demo-ctl" onClick={() => { setPhase(reduce ? 1 : 0); setPlaying(!reduce); }} aria-label="Replay from the start">
              <Icon name="refresh" className="h-[18px] w-[18px]" />
            </button>
            <span className="mx-1 h-5 w-px bg-[var(--border)]" aria-hidden="true" />
            {CHAPTERS.map((ch, i) => (
              <button key={ch.label} type="button" className="demo-step" aria-pressed={chapter === i} aria-label={`Step ${i + 1}: ${ch.label}`} onClick={() => go(ch.phase)}>
                <span className="demo-step-n">{i + 1}</span> <span className="demo-step-label">{ch.label}</span>
              </button>
            ))}
          </figcaption>
        </figure>
      </MotionConfig>
    </LazyMotion>
  );
}

function PauseIcon() {
  return <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>;
}
function PlayIcon() {
  return <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true"><path d="M8 5.6v12.8c0 .8.9 1.3 1.5.8l9.9-6.4a1 1 0 0 0 0-1.6L9.5 4.8C8.9 4.4 8 4.8 8 5.6z" /></svg>;
}

// A calm landscape at dusk, in SVG: it scales without blur at any size.
function Scene() {
  return (
    <svg viewBox="0 0 1000 460" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2b5a" />
          <stop offset="0.55" stopColor="#6b4b8a" />
          <stop offset="1" stopColor="#f2a073" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="0.45" stopColor="#ffd38a" />
          <stop offset="1" stopColor="#ffd38a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="460" fill="url(#sky)" />
      <circle cx="640" cy="300" r="150" fill="url(#sun)" />
      <path d="M0 330 L120 250 L210 300 L330 210 L470 310 L560 260 L700 330 L820 240 L1000 320 L1000 460 L0 460Z" fill="#3b2f5c" opacity="0.85" />
      <path d="M0 380 L150 320 L280 365 L420 300 L560 370 L690 330 L840 380 L1000 340 L1000 460 L0 460Z" fill="#26203f" />
      <path d="M0 430 Q250 390 500 425 T1000 410 L1000 460 L0 460Z" fill="#161327" />
    </svg>
  );
}
