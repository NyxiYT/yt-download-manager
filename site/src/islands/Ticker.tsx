// A number that counts up once when it comes into view (after Magic UI's Number Ticker, MIT, on Motion). The page
// is built with the final value, so it reads right without scripts; it only drops to zero if it's still below
// the fold when this loads.
import { useEffect, useRef } from 'react';
import { animate, useInView } from 'motion/react';
import { getMotion } from './motion-pref';

interface Props { value: number; decimals?: number; suffix?: string }

export default function Ticker({ value, decimals = 0, suffix = '' }: Props) {
  const el = useRef<HTMLSpanElement>(null);
  const inView = useInView(el, { once: true, amount: 0.6 });
  const armed = useRef(false);
  const fmt = (v: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false }).format(v);

  useEffect(() => {
    const r = el.current!.getBoundingClientRect();
    if (getMotion() === 'full' && r.top > window.innerHeight) {
      armed.current = true;
      el.current!.textContent = fmt(0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!inView || !armed.current) return;
    const c = animate(0, value, { duration: 1.4, ease: [0.2, 0, 0, 1], onUpdate: (v) => { if (el.current) el.current.textContent = fmt(v); } });
    return () => c.stop();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span className="ticker">
      <span ref={el} className="ticker-n">{fmt(value)}</span>
      {suffix && <span className="ticker-s">{suffix}</span>}
    </span>
  );
}
