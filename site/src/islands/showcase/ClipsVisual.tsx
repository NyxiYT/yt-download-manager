// Clips: the Trim part of "Download video", with two handles on a timeline. HeroUI's Slider gives them keyboard
// and screen reader support; the fill between them is drawn here.
import { Slider } from '@heroui/react/slider';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { useValueText } from './valueText';

const LENGTH = 635; // Big Buck Bunny: 10:35, as in the screenshot of the real panel
const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export default function ClipsVisual({ frame, pinned, active }: { frame: string; pinned: boolean; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduce = useReducedMotion();
  const play = pinned ? active : inView;
  const [range, setRange] = useState<[number, number]>([80, 245]);
  const touched = useRef(false);

  // The handles slide in from the full length to a part of it, with a spring.
  useEffect(() => {
    if (!play || touched.current || reduce) return;
    setRange([0, LENGTH]);
    const a = animate(0, 1, {
      type: 'spring', stiffness: 60, damping: 14, delay: 0.35,
      onUpdate: (k) => setRange([Math.round(80 * k), Math.round(LENGTH - (LENGTH - 245) * k)]),
    });
    return () => a.stop();
  }, [play, reduce]);

  const [a, b] = range;
  const slider = useRef<HTMLDivElement>(null);
  useValueText(slider, [clock(a), clock(b)]);
  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-[520px] rounded-[var(--radius-lg)] bg-[#212121] p-5 text-white shadow-lift ring-1 ring-white/10">
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          <Icon name="video" className="h-5 w-5 text-white/80" /> Download video
        </div>
        <div className="mt-4 overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-white/10" aria-hidden="true">
          <div className="flex h-14">
            {Array.from({ length: 8 }, (_, k) => (
              <img key={k} src={frame} alt="" loading="lazy" decoding="async" className="h-full w-[12.5%] object-cover" style={{ objectPosition: `${10 + k * 11}% 50%`, opacity: (k + 0.5) / 8 * LENGTH >= a && (k + 0.5) / 8 * LENGTH <= b ? 1 : 0.35 }} />
            ))}
          </div>
        </div>
        <Slider
          aria-label="Clip"
          minValue={0}
          maxValue={LENGTH}
          step={1}
          value={range}
          onChange={(v) => { touched.current = true; if (Array.isArray(v)) setRange([v[0], v[1]]); }}
          ref={slider}
          className="mt-4 w-full"
        >
          <div className="col-span-full mb-3 flex items-center gap-2 text-[13px] text-white/70">
            <Icon name="scissors" className="h-[18px] w-[18px]" /> Trim
            <span className="ml-auto">Clip · <b className="font-semibold text-white">{clock(b - a)}</b></span>
          </div>
          <Slider.Track className="clip-track">
            <span className="clip-fill" style={{ left: `${(a / LENGTH) * 100}%`, right: `${100 - (b / LENGTH) * 100}%` }} aria-hidden="true" />
            <Slider.Thumb index={0} aria-label="Start" />
            <Slider.Thumb index={1} aria-label="End" />
          </Slider.Track>
          <div className="col-span-full mt-2 flex justify-between text-[12px] text-white/60" aria-hidden="true"><span>00:00</span><span>{clock(LENGTH)}</span></div>
        </Slider>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]" aria-hidden="true">
          <div><div className="mb-1 text-white/70">Start</div><div className="rounded-[var(--radius-sm)] border border-white/15 px-3 py-2 font-semibold tabular-nums">{clock(a)}</div></div>
          <div><div className="mb-1 text-white/70">End</div><div className="rounded-[var(--radius-sm)] border border-white/15 px-3 py-2 font-semibold tabular-nums">{clock(b)}</div></div>
        </div>
      </div>
    </div>
  );
}
