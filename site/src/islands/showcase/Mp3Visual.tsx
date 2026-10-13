// MP3: the video's frame shrinks into the cover art of an audio file and a waveform rises beside it.
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';

// Bar heights of a made-up waveform (decoration), fixed so the server and the browser draw the same.
const BARS = Array.from({ length: 36 }, (_, i) => 0.28 + 0.62 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37)));
const spring = { type: 'spring', stiffness: 160, damping: 22 } as const;

export default function Mp3Visual({ frame, pinned, active }: { frame: string; pinned: boolean; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduce = useReducedMotion();
  const play = pinned ? active : inView;
  const [audio, setAudio] = useState(true);
  const touched = useRef(false);

  useEffect(() => {
    if (!play || touched.current || reduce) return;
    setAudio(false);
    const t = setTimeout(() => setAudio(true), 900);
    return () => clearTimeout(t);
  }, [play, reduce]);

  const pick = (a: boolean) => { touched.current = true; setAudio(a); };

  return (
    <div ref={ref} className="flex h-full w-full flex-col justify-center gap-5">
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-md)] bg-frame ring-1 ring-[var(--border)]">
        {/* The video frame: full size, then it shrinks toward where the cover sits. */}
        <m.img
          src={frame}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transformOrigin: '16% 50%' }}
          initial={false}
          animate={audio ? { scale: 0.34, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={spring}
        />
        <AnimatePresence initial={false}>
          {audio && (
            <m.div
              key="audio"
              className="absolute inset-0 flex items-center gap-[4%] px-[6%]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            >
              <m.img
                src={frame}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-square w-[30%] flex-none rounded-[var(--radius-md)] object-cover shadow-lift ring-1 ring-white/10"
                initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}
              />
              <div className="min-w-0 flex-1 text-white">
                <div className="truncate text-[clamp(12px,1.6vw,17px)] font-semibold">Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film</div>
                <div className="mt-1 flex items-center gap-2 text-[clamp(11px,1.2vw,13px)] text-white/70">
                  <Icon name="music" className="h-4 w-4 text-[#3ea6ff]" /> MP3 · 320 kb/s · cover art
                </div>
                <div className="mt-[6%] flex h-[clamp(40px,8vw,84px)] items-center gap-[2px]" aria-hidden="true">
                  {BARS.map((b, k) => (
                    <m.span
                      key={k}
                      className="h-full flex-1 origin-center rounded-full bg-[#3ea6ff]"
                      initial={{ scaleY: 0.05 }}
                      animate={reduce ? { scaleY: b } : { scaleY: [b, b * 0.55, b] }}
                      transition={reduce ? { duration: 0 } : { scaleY: { delay: 0.25 + k * 0.012, duration: 1.6 + (k % 5) * 0.2, repeat: Infinity, ease: 'easeInOut' } }}
                    />
                  ))}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-center gap-2" role="group" aria-label="Show as">
        <button type="button" className="demo-step !pl-4" aria-pressed={!audio} onClick={() => pick(false)}>
          <Icon name="video" className="h-[18px] w-[18px]" /> Video
        </button>
        <button type="button" className="demo-step !pl-4" aria-pressed={audio} onClick={() => pick(true)}>
          <Icon name="music" className="h-[18px] w-[18px]" /> MP3
        </button>
      </div>
    </div>
  );
}
