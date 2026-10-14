// The visitor's own cursor on desktop: an 8 px dot that follows exactly and a 32 px ring that follows on a soft
// spring. Over links the ring grows; over a download button it fills blue with a down arrow; inside Try it it says
// "Try"; over text fields the native cursor comes back. Hidden when the pointer leaves the window. Transforms only.
const el = document.querySelector<HTMLElement>('[data-cursor-el]');
if (el) {
  const dot = el.querySelector<HTMLElement>('.cur-dot')!;
  const ring = el.querySelector<HTMLElement>('.cur-ring')!;
  const root = document.documentElement;
  root.setAttribute('data-cursor', '');
  let mx = -100, my = -100, rx = -100, ry = -100, vx = 0, vy = 0, raf = 0;
  const step = () => {
    const k = 260, d = 26, dt = 1 / 60; // a soft spring for the ring
    vx += (k * (mx - rx) - d * vx) * dt; rx += vx * dt;
    vy += (k * (my - ry) - d * vy) * dt; ry += vy * dt;
    ring.style.translate = `${rx}px ${ry}px`;
    raf = Math.abs(mx - rx) + Math.abs(my - ry) + Math.abs(vx) + Math.abs(vy) > 0.05 ? requestAnimationFrame(step) : 0;
  };
  const stateOf = (t: Element | null): string => {
    if (!t) return '';
    if (t.closest('input[type="text"], input[type="search"], textarea, [contenteditable="true"]')) return 'text';
    if (t.closest('[data-cursor="try"]')) return 'try';
    if (t.closest('[data-download], [data-nav-download]')) return 'download';
    if (t.closest('a, button, [role="tab"], label, summary')) return 'link';
    return '';
  };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') { el.removeAttribute('data-on'); return; }
    mx = e.clientX; my = e.clientY;
    dot.style.translate = `${mx}px ${my}px`;
    if (rx < 0) { rx = mx; ry = my; }
    el.setAttribute('data-on', '');
    const s = stateOf(e.target as Element);
    if (el.dataset.state !== s) el.dataset.state = s;
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.removeAttribute('data-on'));
  addEventListener('blur', () => el.removeAttribute('data-on'));
  document.addEventListener('pointerdown', () => ring.animate([{ scale: '1' }, { scale: '0.82' }, { scale: '1' }], { duration: 260, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
}
export {};
