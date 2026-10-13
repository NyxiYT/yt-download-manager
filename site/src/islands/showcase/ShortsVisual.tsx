// Shorts: a vertical video with the extension's Download button beside it, and its menu (the real menu's items).
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import type { IconName } from '../../lib/icons';
import { Icon } from '../Icon';

const ITEMS: { icon: IconName; label: string }[] = [
  { icon: 'video', label: 'Download video' },
  { icon: 'music', label: 'Download audio' },
  { icon: 'image', label: 'Download thumbnail' },
  { icon: 'captions', label: 'Download subtitles' },
  { icon: 'camera', label: 'Save a screenshot of this frame' },
];

export default function ShortsVisual({ pinned, active }: { pinned: boolean; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduce = useReducedMotion();
  const play = pinned ? active : inView;
  const [open, setOpen] = useState(true);
  const touched = useRef(false);
  const menuId = useId();

  useEffect(() => {
    if (!play || touched.current || reduce) return;
    setOpen(false);
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, [play, reduce]);

  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center gap-3 sm:gap-4 sm:pr-[280px]">
      {/* The Short: an illustrated vertical frame. */}
      <div className="relative aspect-[9/16] h-[400px] pin:h-full pin:max-h-[460px] pin:min-h-[300px] overflow-hidden rounded-[var(--radius-lg)] bg-frame shadow-lift ring-1 ring-white/10" aria-hidden="true">
        <svg viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="sh-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1026" /><stop offset="1" stopColor="#2a1a3d" /></linearGradient>
            <radialGradient id="sh-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0.55" stopColor="#ffb36b" stopOpacity="0" /><stop offset="0.62" stopColor="#ffb36b" stopOpacity="0.9" /><stop offset="1" stopColor="#ffb36b" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width="90" height="160" fill="url(#sh-sky)" />
          <circle cx="45" cy="64" r="26" fill="url(#sh-glow)" />
          <circle cx="45" cy="64" r="15" fill="#05060d" />
          <path d="M0 132 Q22 120 45 128 T90 124 V160 H0Z" fill="#120d22" />
        </svg>
        <div className="absolute inset-x-3 bottom-3 h-1 rounded-full bg-white/25"><div className="h-full w-1/3 rounded-full bg-white/80" /></div>
      </div>

      {/* The buttons beside it. */}
      <div className="relative flex flex-col items-center gap-3 self-center">
        <button
          type="button"
          className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-[#3ea6ff] ring-1 ring-white/10 transition-colors hover:bg-white/15"
          aria-expanded={open}
          aria-controls={menuId}
          aria-haspopup="menu"
          onClick={() => { touched.current = true; setOpen((o) => !o); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        >
          <Icon name="download" className="h-6 w-6" />
          <span className="sr-only">Download</span>
        </button>
        <span className="-mt-2 text-[12px] font-medium text-[var(--foreground)]" aria-hidden="true">Download</span>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/10" aria-hidden="true"><Icon name="more" className="h-6 w-6" /></span>

        <AnimatePresence initial={false}>
          {open && (
            <m.ul
              id={menuId}
              key="menu"
              role="menu"
              aria-label="Download"
              className="absolute left-[calc(100%+10px)] top-0 z-10 m-0 w-[min(64vw,270px)] list-none rounded-[var(--radius-md)] bg-[#212121] p-1.5 text-white shadow-lift ring-1 ring-white/10 max-sm:left-auto max-sm:right-[calc(100%+10px)]"
              style={{ transformOrigin: 'top left' }}
              initial={{ opacity: 0, scale: 0.92, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -4 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            >
              {ITEMS.map((it, k) => (
                <li key={it.label} role="none">
                  {k === ITEMS.length - 1 && <div className="mx-2 my-1 h-px bg-white/10" role="separator" />}
                  <button type="button" role="menuitem" className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-[13px] text-white/90 hover:bg-white/10 focus-visible:bg-white/10" onClick={() => setOpen(false)}>
                    <Icon name={it.icon} className="h-[18px] w-[18px] flex-none text-white/70" /> {it.label}
                  </button>
                </li>
              ))}
            </m.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
