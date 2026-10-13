// Quality: a slider from 144p to 4320p (8K), and a frame that gets sharper. An illustration: the frame is shown
// at each height's share of pixels (a 989 px wide screenshot stands in for 8K), cross-faded, not re-encoded.
import { Slider } from '@heroui/react/slider';
import { m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useValueText } from './valueText';

export const HEIGHTS = [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320];
const badge = (h: number) => (h >= 4320 ? '8K' : h >= 2160 ? '4K' : h >= 1440 ? '2K' : h >= 720 ? 'HD' : ''); // as the extension labels them

export default function QualityVisual({ frames, pinned, active }: { frames: string[]; pinned: boolean; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduce = useReducedMotion();
  const play = pinned ? active : inView;
  const [i, setI] = useState(HEIGHTS.length - 1);
  const touched = useRef(false);

  // Each time it comes into view, it climbs from 144p to 8K once, unless the visitor has used the slider.
  useEffect(() => {
    if (!play || touched.current || reduce) return;
    setI(0);
    let k = 0;
    const t = setInterval(() => {
      k += 1;
      setI(k);
      if (k >= HEIGHTS.length - 1) clearInterval(t);
    }, 420);
    return () => clearInterval(t);
  }, [play, reduce]);

  const h = HEIGHTS[i];
  const slider = useRef<HTMLDivElement>(null);
  useValueText(slider, [`${h}p${badge(h) ? ` (${badge(h)})` : ''}`]);
  return (
    <div ref={ref} className="flex h-full w-full flex-col justify-center gap-5">
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-md)] bg-frame ring-1 ring-[var(--border)]">
        {frames.map((src, k) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
            style={{ opacity: k === i ? 1 : 0 }}
          />
        ))}
        <m.span
          key={h}
          className="absolute left-3 top-3 inline-flex items-baseline gap-1 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white backdrop-blur"
          initial={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          aria-hidden="true"
        >
          {h}p60 {badge(h) && <span className="text-[11px] font-bold text-[#ff4e45]">{badge(h)}</span>}
        </m.span>
        <span className="absolute bottom-2 right-3 text-[11px] text-white/70">Illustration</span>
      </div>
      <Slider
        aria-label="Video quality"
        minValue={0}
        maxValue={HEIGHTS.length - 1}
        step={1}
        value={i}
        onChange={(v) => { touched.current = true; setI(Array.isArray(v) ? v[0] : v); }}
        ref={slider}
        className="w-full"
      >
        <div className="col-span-full mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Quality</span>
          <span className="text-[var(--muted)]" aria-hidden="true">{h}p{badge(h) && ` · ${badge(h)}`}</span>
        </div>
        <Slider.Track className="quality-track">
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
        <div className="col-span-full mt-2 flex justify-between text-[11px] text-[var(--muted)]" aria-hidden="true">
          <span>144p</span><span>720p</span><span>1080p</span><span>4K</span><span>8K</span>
        </div>
      </Slider>
    </div>
  );
}
