// The nav's "Reduce motion" button. Until the visitor presses it, the page follows their system's Reduce motion
// setting (read before the first paint in layouts/Base.astro, and followed while the page is open); once pressed,
// their choice is kept in localStorage. Changing it applies at once, without a reload.
import { useSyncExternalStore } from 'react';

export type MotionPref = 'full' | 'reduced';
const EVENT = 'ydm:motion';

export const getMotion = (): MotionPref =>
  typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced' ? 'reduced' : 'full';

function apply(pref: MotionPref) {
  document.documentElement.dataset.motion = pref;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: pref }));
}

export function setMotion(pref: MotionPref) {
  try { localStorage.setItem('motion', pref); } catch { /* private mode: it still applies to this visit */ }
  apply(pref);
}

// The system setting changing while the page is open, for visitors who haven't picked in the nav.
export function followSystemMotion() {
  const q = matchMedia('(prefers-reduced-motion: reduce)');
  q.addEventListener('change', () => {
    try { if (localStorage.getItem('motion')) return; } catch { /* no storage: follow the system */ }
    apply(q.matches ? 'reduced' : 'full');
  });
}

export const onMotion = (cb: (p: MotionPref) => void) => {
  const h = () => cb(getMotion());
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
};

export const useMotionPref = () => useSyncExternalStore(onMotion, getMotion, () => 'full' as MotionPref);
