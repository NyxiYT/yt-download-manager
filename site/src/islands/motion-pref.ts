// The footer's "Reduce motion" switch (off by default, kept in localStorage). Motion is on for everyone
// unless they turn it down here; the system setting isn't read. Changing it applies at once, without a reload.
import { useSyncExternalStore } from 'react';

export type MotionPref = 'full' | 'reduced';
const EVENT = 'ydm:motion';

export const getMotion = (): MotionPref =>
  typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced' ? 'reduced' : 'full';

export function setMotion(pref: MotionPref) {
  document.documentElement.dataset.motion = pref;
  try { localStorage.setItem('motion', pref); } catch { /* private mode: it still applies to this visit */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: pref }));
}

export const onMotion = (cb: (p: MotionPref) => void) => {
  const h = () => cb(getMotion());
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
};

export const useMotionPref = () => useSyncExternalStore(onMotion, getMotion, () => 'full' as MotionPref);
