// "How to use", chapter by chapter, in the README's words. On wide screens the stage holds still (CSS sticky) while
// the chapters scroll past; GSAP's ScrollTrigger picks the chapter in view and fills the progress rail. Each
// chapter can be tried (the demo, which runs as a guided loop until clicked) or seen in the real app (a recording,
// or the README's screenshot until the recording exists). On small screens the chapters stack.
import { useEffect, useRef, useState } from 'react';
import Demo from './Demo';
import type { Frame, Scene, VideoData } from './demo/model';
import type { Recording } from '../data/recordings';
import { onMotion, getMotion } from './motion-pref';

interface Chapter { id: Scene; counter: string; title: string; loop: string; steps: readonly string[] }
interface Shot { src: string; srcset: string; width: number; height: number; alt: string }
interface Props {
  chapters: Chapter[];
  video: VideoData;
  short: VideoData;
  frame: Frame;
  tall: Frame;
  cover: string;
  shots: Record<string, Shot>;
  recordings: Partial<Record<string, Recording>>;
}

function useWide() {
  const [wide, setWide] = useState(true); // the page is built for wide screens; phones switch after loading
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

function Real({ id, shot, rec }: { id: string; shot: Shot; rec?: Recording }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Plays only while on screen, and not with motion turned down.
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && getMotion() === 'full') v.play().catch(() => {}); else v.pause(); }, { threshold: 0.3 });
    io.observe(v);
    const off = onMotion((p) => { if (p === 'reduced') v.pause(); });
    return () => { io.disconnect(); off(); };
  }, []);
  if (rec) {
    return (
      <figure className="real">
        <video ref={ref} muted playsInline loop preload="none" poster={rec.poster} aria-label={rec.label} width={rec.width} height={rec.height}>
          <source src={rec.webm} type='video/webm; codecs="av01.0.08M.08"' />
          <source src={rec.mp4} type="video/mp4" />
        </video>
        <figcaption className="caption">Recording of the real app. {rec.label}</figcaption>
      </figure>
    );
  }
  return (
    <figure className="real" data-chapter={id}>
      <img src={shot.src} srcSet={shot.srcset} sizes="(min-width: 1024px) 760px, 100vw" width={shot.width} height={shot.height} alt={shot.alt} loading="lazy" decoding="async" />
      <figcaption className="caption">Screenshot of the real extension, from the README.</figcaption>
    </figure>
  );
}

function ViewSwitch({ view, onView }: { view: 'try' | 'real'; onView: (v: 'try' | 'real') => void }) {
  return (
    <div className="view-switch" role="group" aria-label="Show">
      <button type="button" aria-pressed={view === 'try'} onClick={() => onView('try')}>Try it</button>
      <button type="button" aria-pressed={view === 'real'} onClick={() => onView('real')}>The real app</button>
    </div>
  );
}

export default function Showcase({ chapters, video, short, frame, tall, cover, shots, recordings }: Props) {
  const wide = useWide();
  const [active, setActive] = useState(0);
  const [view, setView] = useState<'try' | 'real'>('try');
  const [mobileView, setMobileView] = useState<Record<string, 'try' | 'real'>>({});
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!wide) return;
    let revert = () => {};
    let alive = true;
    import('../scripts/scroll-engine').then(({ gsap, ScrollTrigger }) => {
      if (!alive) return;
      const ctx = gsap.context(() => {
        list.current!.querySelectorAll<HTMLElement>('[data-chapter-text]').forEach((el, i) => {
          ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (self) => { if (self.isActive) setActive(i); } });
        });
        gsap.fromTo(fill.current, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list.current, start: 'top 55%', end: 'bottom 55%', scrub: 0.6 } });
      });
      revert = () => ctx.revert();
    });
    return () => { alive = false; revert(); };
  }, [wide]);

  const go = (i: number) => {
    const el = list.current?.querySelectorAll<HTMLElement>('[data-chapter-text]')[i];
    if (!el) return;
    const lenis = (window as Window & { __lenis?: { scrollTo: (t: HTMLElement, o: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -window.innerHeight * 0.25 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const demoFor = (c: Chapter, autoplay = true) => (
    <Demo key={c.id} scene={c.id} data={c.id === 'shorts' ? short : video} frame={frame} tall={tall} cover={cover} width={960} autoplay={autoplay}
      label={`Illustration: ${c.title}`} />
  );
  const cur = chapters[active];

  return (
    <div className="showcase" data-wide={wide || undefined}>
      <div className="sc-rail">
        <span className="sc-progress" aria-hidden="true"><span ref={fill} /></span>
        <ol ref={list}>
          {chapters.map((c, i) => (
            <li key={c.id} className={i === active ? 'on' : ''} data-chapter-text>
              <h3 className="sc-h3">
                <button type="button" className="sc-head" onClick={() => go(i)} aria-current={i === active ? 'step' : undefined}>
                  <span className="counter">{c.counter}</span>
                  <span className="sc-title">{c.title}</span>
                </button>
              </h3>
              <ol className="sc-steps">
                {c.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
              <p className="sc-loop label">Loop · <span className="mono">{c.loop}</span></p>
              {!wide && (
                <div className="sc-inline">
                  <ViewSwitch view={mobileView[c.id] ?? 'real'} onView={(v) => setMobileView((m) => ({ ...m, [c.id]: v }))} />
                  {(mobileView[c.id] ?? 'real') === 'try' ? demoFor(c) : <Real id={c.id} shot={shots[c.id]} rec={recordings[c.id]} />}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
      {wide && (
        <div className="sc-stage">
          <div className="sc-sticky">
            <div className="sc-stage-head">
              <p className="label"><span className="counter-inline">{cur.counter}</span> {cur.title}</p>
              <ViewSwitch view={view} onView={setView} />
            </div>
            <div className="sc-swap" key={`${cur.id}-${view}`}>
              {view === 'try' ? demoFor(cur) : <Real id={cur.id} shot={shots[cur.id]} rec={recordings[cur.id]} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
