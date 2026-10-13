// "See it in action" as a scroll story. On wide screens with motion allowed the section is pinned and scrolling
// moves through its five chapters; elsewhere the chapters stack, each playing when it comes into view. Both
// layouts come from the same elements and CSS (the `pin:` variant), so nothing jumps when the script loads.
import { LazyMotion, MotionConfig, domAnimation, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { showcase } from '../lib/content';
import ClipsVisual from './showcase/ClipsVisual';
import HistoryVisual from './showcase/HistoryVisual';
import Mp3Visual from './showcase/Mp3Visual';
import QualityVisual from './showcase/QualityVisual';
import ShortsVisual from './showcase/ShortsVisual';

const PIN_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

export type Shot = { avif: string; webp: string; src: string; width: number; height: number; alt: string };

export default function Showcase({ frames, frame, shots }: { frames: string[]; frame: string; shots: Record<string, Shot> }) {
  const track = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });

  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const on = () => setPinned(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (pinned) setActive(Math.min(showcase.length - 1, Math.max(0, Math.floor(p * showcase.length))));
  });

  // Jumps to a chapter: the scroll position where the pinned section shows it.
  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (span * (i + 0.5)) / showcase.length, behavior: 'smooth' });
  };

  const visual = (i: number, on: boolean) => {
    const props = { pinned, active: on };
    switch (showcase[i].id) {
      case 'quality': return <QualityVisual frames={frames} {...props} />;
      case 'mp3': return <Mp3Visual frame={frame} {...props} />;
      case 'clips': return <ClipsVisual frame={frame} {...props} />;
      case 'shorts': return <ShortsVisual {...props} />;
      default: return <HistoryVisual {...props} />;
    }
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div ref={track} className="relative pin:h-[520vh]">
          <div className="pin:sticky pin:top-0 pin:flex pin:h-dvh pin:items-center">
            <div className="container-page grid gap-x-16 gap-y-10 pin:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] pin:grid-rows-[auto_1fr] pin:gap-y-8">
              {/* Chapter list: wide screens only. */}
              <nav className="hidden pin:col-start-1 pin:row-start-1 pin:block" aria-label="See it in action">
                <ol className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {showcase.map((s, i) => (
                    <li key={s.id}>
                      <button type="button" className="demo-step !pl-3" aria-current={active === i ? 'step' : undefined} aria-pressed={active === i} onClick={() => goTo(i)}>
                        {s.eyebrow}
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 h-1 overflow-hidden rounded-full bg-[var(--surface-secondary)]" aria-hidden="true">
                  <div className="h-full origin-left rounded-full bg-[var(--accent)] transition-transform duration-500 ease-[var(--ease-spring)]" style={{ transform: `scaleX(${(active + 1) / showcase.length})` }} />
                </div>
              </nav>

              {/* Before the script runs, CSS shows the first chapter only (pin:opacity-0); then inline styles take over. */}
              {showcase.map((s, i) => {
                const on = !pinned || active === i;
                return (
                  <div key={s.id} className="contents">
                    <div
                      className={`pin:col-start-1 pin:row-start-2 pin:self-start pin:transition-[opacity,transform] pin:duration-500 pin:ease-[var(--ease-spring)] ${i > 0 ? 'pin:opacity-0' : ''}`}
                      style={pinned ? { opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : active > i ? -16 : 16}px)` } : undefined}
                      inert={pinned && !on ? true : undefined}
                    >
                      <p className="eyebrow">{s.eyebrow}</p>
                      <h3 className="mt-3 text-[length:var(--text-2xl)] font-bold leading-tight tracking-tight">{s.title}</h3>
                      <p className="lede mt-4 max-w-[46ch]">{s.text}</p>
                      {shots[s.id] && <Screenshot shot={shots[s.id]} />}
                    </div>
                    <div
                      className={`mx-auto mb-10 w-full max-w-[720px] pin:mb-0 pin:max-w-none pin:aspect-[4/3] pin:col-start-2 pin:row-span-2 pin:row-start-1 pin:self-center pin:transition-[opacity,transform] pin:duration-500 pin:ease-[var(--ease-spring)] ${i > 0 ? 'pin:opacity-0' : ''}`}
                      style={pinned ? { opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.96})` } : undefined}
                      inert={pinned && !on ? true : undefined}
                    >
                      {visual(i, on)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

// The real thing, small, under the text: the moving picture beside it is an illustration.
function Screenshot({ shot }: { shot: Shot }) {
  return (
    <figure className="relative mt-6 inline-block max-w-full overflow-hidden rounded-[var(--radius-md)] ring-1 ring-[var(--border)]">
      <picture>
        <source type="image/avif" srcSet={shot.avif} sizes="400px" />
        <source type="image/webp" srcSet={shot.webp} sizes="400px" />
        <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" className="block h-auto max-h-[min(28vh,260px)] w-auto max-w-full" />
      </picture>
      <figcaption className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-medium text-white">Screenshot</figcaption>
    </figure>
  );
}
