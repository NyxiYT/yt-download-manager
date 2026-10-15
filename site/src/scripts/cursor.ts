// The visitor's cursor on desktop (BRIEF 7.3): the same arrow as the showcases (lib/arrow.ts), placed on the pointer
// 1:1 on every move: no spring, no trail. Small variants, each under 150 ms:
//   hover     links and buttons: a 10 px blue halo at the tip
//   press     the arrow scales to 0.9 and a 20 px ring ripples out from the tip, once
//   try       inside Try it: a small "Try it" pill 14 px below and right of the tip
//   download  download buttons: the pill shows a small down arrow instead
//   drag      Try it's trim handles: a grab hand
//   text      text fields: the native I-beam comes back
// Only with a fine pointer (index.astro loads this). The native cursor returns when the pointer leaves the window and
// during keyboard navigation. Things that are not clickable (the hero's demo is inert) get no hover look.
const found = document.querySelector<HTMLElement>('[data-cursor-el]');
if (found) {
  const el = found;
  const root = document.documentElement;
  const ripple = el.querySelector<HTMLElement>('.cur-ripple')!;

  const on = () => { root.setAttribute('data-cursor', ''); el.setAttribute('data-on', ''); };
  const off = () => { root.removeAttribute('data-cursor'); el.removeAttribute('data-on'); };

  const set = (k: string, v: boolean) => { if (el.hasAttribute(k) !== v) el.toggleAttribute(k, v); };
  function read(t: Element | null) {
    const text = !!t?.closest('input:not([type="checkbox"]):not([type="radio"]):not([type="button"]), textarea, [contenteditable="true"]');
    const live = t && !t.closest('[inert]') ? t : null;
    const drag = !!live?.closest('[data-cursor="try"] .ysd-thumb-dot');
    const download = !!live?.closest('[data-download], [data-nav-download]');
    const tryIt = !!live?.closest('[data-cursor="try"]');
    const hover = !!live?.closest('a, button, [role="tab"], [role="slider"], label, summary');
    set('data-text', text);
    set('data-drag', drag && !text);
    set('data-hover', hover && !drag && !text);
    const pill = text || drag ? '' : download ? 'download' : tryIt ? 'try' : '';
    if ((el.dataset.pill ?? '') !== pill) { if (pill) el.dataset.pill = pill; else delete el.dataset.pill; }
  }

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') { off(); return; }
    el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    on();
    read(e.target as Element);
  }, { passive: true });
  addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    el.setAttribute('data-press', '');
    ripple.getAnimations().forEach((a) => a.cancel());
    ripple.animate([{ transform: 'scale(.3)', opacity: 0.9 }, { transform: 'scale(1)', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
  });
  addEventListener('pointerup', () => el.removeAttribute('data-press'));
  // The page scrolled under a resting pointer: what's under the tip changed.
  addEventListener('scroll', () => { if (el.hasAttribute('data-on')) { const r = el.getBoundingClientRect(); read(document.elementFromPoint(r.left, r.top)); } }, { passive: true });
  document.documentElement.addEventListener('pointerleave', off);
  addEventListener('blur', off);
  // Keyboard navigation: the native cursor (and the focus rings) take over until the mouse moves again.
  addEventListener('keydown', (e) => { if (e.key === 'Tab' || e.key.startsWith('Arrow')) off(); });
}
export {};
