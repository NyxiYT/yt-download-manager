// The end of the hero's intro: a small file pill lifts off the picker's Download button, arcs up into the nav's
// Download button, and a ring fills around that button. Plain DOM and the Web Animations API, nothing else.
import { getMotion } from './motion-pref';

export function flyToNav(from: DOMRect) {
  const nav = document.querySelector<HTMLElement>('[data-nav-download]');
  if (!nav || getMotion() === 'reduced') return;
  const to = nav.getBoundingClientRect();
  const pill = document.createElement('div');
  pill.className = 'file-pill';
  pill.setAttribute('aria-hidden', 'true');
  pill.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/></svg><span>MP4</span>';
  document.body.append(pill);
  const w = pill.offsetWidth, h = pill.offsetHeight;
  const x0 = from.left + from.width / 2 - w / 2, y0 = from.top + from.height / 2 - h / 2;
  const x1 = to.left + to.width / 2 - w / 2, y1 = to.top + to.height / 2 - h / 2;
  // A quadratic arc that rises first, sampled into keyframes.
  const cx = x0 + (x1 - x0) * 0.25, cy = Math.min(y0, y1) - 120;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12, u = 1 - t;
    const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
    const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    frames.push({ transform: `translate(${x}px, ${y}px) scale(${1 - t * 0.45})`, opacity: t > 0.9 ? 1 - (t - 0.9) * 10 : 1 });
  }
  frames[0] = { ...frames[0], transform: `translate(${x0}px, ${y0 + 6}px) scale(0.9)`, opacity: 0 };
  frames[1] = { ...frames[1], opacity: 1 };
  pill.animate(frames, { duration: 760, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' }).finished.then(() => {
    pill.remove();
    nav.setAttribute('data-progress', '');
    nav.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' });
    setTimeout(() => nav.removeAttribute('data-progress'), 2600);
  });
}
