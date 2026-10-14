// Side A, Side B, and the line between them: when the section comes into view, a line runs from the toolbar to
// the app's "Connected" badge, carrying the two calls the extension really makes (docs/ARCHITECTURE.md): it asks
// the app who it is, then pairs with it. After Magic UI's Animated Beam (MIT), drawn for this page.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m, useInView } from 'motion/react';
import { useMotionPref } from './motion-pref';

interface Img { src: string; srcset: string; width: number; height: number; alt: string }
interface Props {
  a: { side: string; name: string; text: string; img: Img };
  b: { side: string; name: string; text: string; img: Img };
  caption: string;
  children?: ReactNode;
}

// Where the line starts and ends, as fractions of each picture: the toolbar's first button, the app's badge.
const FROM = { x: 18 / 989, y: 587 / 612 };
const TO = { x: 92 / 445, y: 280 / 509 };
const STEPS = ['GET /v1/hello', 'POST /v1/pair', 'Connected'];
const EASE = [0.45, 0, 0.55, 1] as const;

export default function Beam({ a, b, caption }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const imgA = useRef<HTMLImageElement>(null);
  const imgB = useRef<HTMLImageElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; d: string; ok: { x: number; y: number }; pts: { x: number; y: number }[] } | null>(null);
  const inView = useInView(box, { once: true, amount: 0.45 });
  const reduced = useMotionPref() === 'reduced';

  useLayoutEffect(() => {
    const measure = () => {
      const r = box.current!.getBoundingClientRect();
      const ra = imgA.current!.getBoundingClientRect();
      const rb = imgB.current!.getBoundingClientRect();
      const p0 = { x: ra.left - r.left + ra.width * FROM.x, y: ra.top - r.top + ra.height * FROM.y };
      const p1 = { x: rb.left - r.left + rb.width * TO.x, y: rb.top - r.top + rb.height * TO.y };
      const stacked = rb.top > ra.bottom - 4;
      const d = stacked
        ? `M${p0.x} ${p0.y} C ${p0.x} ${p0.y + (p1.y - p0.y) * 0.6}, ${p1.x} ${p0.y + (p1.y - p0.y) * 0.4}, ${p1.x} ${p1.y}`
        : `M${p0.x} ${p0.y} C ${p0.x + (p1.x - p0.x) * 0.25} ${p0.y + 90}, ${p0.x + (p1.x - p0.x) * 0.75} ${p1.y - 30}, ${p1.x} ${p1.y}`;
      setGeo({ w: r.width, h: r.height, d, ok: p1, pts: [] });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box.current!);
    return () => ro.disconnect();
  }, []);
  // Points along the path for the labels, once the path exists.
  useEffect(() => {
    const p = pathRef.current;
    if (!p || !geo || geo.pts.length) return;
    const L = p.getTotalLength();
    setGeo({ ...geo, pts: [0.3, 0.64].map((f) => { const q = p.getPointAtLength(L * f); return { x: q.x, y: q.y }; }) });
  }, [geo]);

  const run = inView || reduced;
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <LazyMotion features={domAnimation} strict>
        <div className="beam" ref={box}>
          <article className="side side-a">
            <p className="label"><span className="side-tag">{a.side}</span></p>
            <h3>{a.name}</h3>
            <p className="side-text">{a.text}</p>
            <div className="media shot"><img ref={imgA} src={a.img.src} srcSet={a.img.srcset} sizes="(min-width: 1024px) 560px, 100vw" width={a.img.width} height={a.img.height} alt={a.img.alt} loading="lazy" decoding="async" /></div>
          </article>
          <article className="side side-b">
            <p className="label"><span className="side-tag">{b.side}</span></p>
            <h3>{b.name}</h3>
            <p className="side-text">{b.text}</p>
            <div className="media shot app"><img ref={imgB} src={b.img.src} srcSet={b.img.srcset} sizes="(min-width: 1024px) 445px, 90vw" width={b.img.width} height={b.img.height} alt={b.img.alt} loading="lazy" decoding="async" /></div>
          </article>
          {geo && (
            <svg className="beam-svg" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
              <path d={geo.d} className="beam-track" />
              <m.path ref={pathRef} d={geo.d} className="beam-line" initial={{ pathLength: 0 }} animate={{ pathLength: run ? 1 : 0 }} transition={{ duration: 1.6, ease: EASE, delay: 0.2 }} />
              {/* After it connected: a short pulse runs along now and then, the way the extension checks in. */}
              {run && !reduced && (
                <m.path d={geo.d} className="beam-pulse" initial={{ pathLength: 0.08, pathOffset: 0, opacity: 0 }}
                  animate={{ pathOffset: [0, 0.92], opacity: [0, 1, 1, 0] }} transition={{ duration: 2.4, ease: EASE, delay: 2.6, repeat: Infinity, repeatDelay: 3.2 }} />
              )}
            </svg>
          )}
          {geo?.pts.map((p, i) => (
            <m.span key={STEPS[i]} className="beam-label mono" style={{ left: p.x, top: p.y }}
              initial={{ opacity: 0, y: 6 }} animate={run ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }} transition={{ duration: 0.4, ease: [0.2, 0, 0, 1], delay: 0.6 + i * 0.6 }}>
              {STEPS[i]}
            </m.span>
          ))}
          <m.span className="beam-ok" initial={{ opacity: 0, scale: 0.8 }} animate={run ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35, ease: [0.2, 0, 0, 1], delay: 1.8 }} aria-hidden="true"
            style={geo ? { left: geo.ok.x, top: geo.ok.y } : { display: 'none' }} />
        </div>
        <p className="caption beam-caption">{caption}</p>
      </LazyMotion>
    </MotionConfig>
  );
}
