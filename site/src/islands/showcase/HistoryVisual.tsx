// History: the panel behind the clock button. Two downloads appear, fill up and finish; "Open folder" waits at
// the bottom. Titles, formats and sizes are those of the real panel's screenshot.
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';

const DOWNLOADS = [
  { format: 'MP4', quality: '1080p60', size: '268 MB' },
  { format: 'MP3', quality: '320 kb/s', size: '25.5 MB' },
];
const TITLE = 'Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film';
const pop = { type: 'spring', stiffness: 380, damping: 30 } as const;

export default function HistoryVisual({ pinned, active }: { pinned: boolean; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduce = useReducedMotion();
  const play = pinned ? active : inView;
  // Per download: 0 not there yet, 1 downloading, 2 completed.
  const [state, setState] = useState<number[]>([2, 2]);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!play || reduce) return;
    setState([0, 0]);
    const steps: [number, number[]][] = [[300, [1, 0]], [1300, [1, 1]], [2500, [2, 1]], [3500, [2, 2]]];
    const timers = steps.map(([t, s]) => setTimeout(() => setState(s), t));
    return () => timers.forEach(clearTimeout);
  }, [play, reduce, run]);

  const finished = state.filter((s) => s === 2).length;
  return (
    <div ref={ref} className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="w-full max-w-[420px] overflow-hidden rounded-[var(--radius-lg)] bg-[#212121] text-white shadow-lift ring-1 ring-white/10" aria-hidden="true">
        <div className="flex items-center gap-3 px-5 py-4">
          <b className="text-[15px]">Downloads</b>
          <span className="text-[13px] text-white/60 tabular-nums">{finished} finished</span>
          <span className="ml-auto text-[13px] text-white/80">Clear</span>
          <Icon name="pin" className="h-[18px] w-[18px] text-white/60" />
          <Icon name="close" className="h-[18px] w-[18px] text-white/60" />
        </div>
        <ul className="m-0 min-h-[208px] list-none p-0">
          <AnimatePresence initial={false}>
            {DOWNLOADS.map((d, k) =>
              state[k] > 0 ? (
                <m.li
                  key={`${run}-${k}`}
                  className="border-t border-white/10 px-5 py-3.5"
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={pop}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 text-[14px] font-semibold leading-snug">{TITLE}</div>
                    <Icon name="folder" className="mt-0.5 h-[18px] w-[18px] flex-none text-white/60" />
                    <Icon name="delete" className="mt-0.5 h-[18px] w-[18px] flex-none text-white/60" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[12px] text-white/70">
                    Blender <b className="text-white">{d.format}</b> {d.quality}
                    {state[k] === 2 ? (
                      <m.span className="rounded-full bg-[#2ba640]/20 px-2 py-0.5 font-semibold text-[#5bd26f]" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={pop}>Completed</m.span>
                    ) : (
                      <span className="text-[#3ea6ff]">Downloading</span>
                    )}
                  </div>
                  {state[k] === 1 ? (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <m.div className="h-full origin-left rounded-full bg-[#3ea6ff]" initial={{ scaleX: 0.02 }} animate={{ scaleX: 0.96 }} transition={{ duration: 1.1, ease: [0.3, 0, 0.2, 1] }} />
                    </div>
                  ) : (
                    <div className="mt-1 text-[12px] text-white/60">{d.size} · in Downloads · now</div>
                  )}
                </m.li>
              ) : null,
            )}
          </AnimatePresence>
        </ul>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-nowrap border-t border-white/10 px-5 py-3.5 text-[13px]">
          <Icon name="computer" className="h-[18px] w-[18px] text-white/60" />
          <span className="text-white/70">Saving to <b className="text-white">Downloads</b></span>
          <m.span className="ml-auto font-semibold text-[#3ea6ff]" animate={finished === 2 && !reduce ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}>Open folder</m.span>
          <span className="font-semibold text-[#3ea6ff]">Change</span>
        </div>
      </div>
      {!reduce && (
        <button type="button" className="demo-step !pl-3" onClick={() => setRun((r) => r + 1)}>
          <Icon name="refresh" className="h-[18px] w-[18px]" /> Replay
        </button>
      )}
    </div>
  );
}
