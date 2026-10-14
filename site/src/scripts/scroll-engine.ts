// One animation loop for the whole page: Lenis smooth scrolling driven by GSAP's ticker, with ScrollTrigger kept in
// step. Loaded on the first interaction (and by How it works when it needs ScrollTrigger), so it stays out of
// the first load. "Reduce motion" in the footer turns smooth scrolling off and back on at once.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { getMotion, onMotion } from '../islands/motion-pref';

gsap.registerPlugin(ScrollTrigger);

type W = Window & { __lenis?: Lenis | null; __scrollEngine?: boolean };
const w = window as W;

if (!w.__scrollEngine) {
  w.__scrollEngine = true;
  let raf: ((time: number) => void) | null = null;
  const start = () => {
    if (w.__lenis) return;
    const lenis = new Lenis({ anchors: { offset: -88 }, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    w.__lenis = lenis;
  };
  const stop = () => {
    if (raf) gsap.ticker.remove(raf);
    w.__lenis?.destroy();
    w.__lenis = null;
    raf = null;
  };
  gsap.ticker.lagSmoothing(0);
  if (getMotion() === 'full') start();
  onMotion((p) => (p === 'full' ? start() : stop()));

}

export { gsap, ScrollTrigger };
