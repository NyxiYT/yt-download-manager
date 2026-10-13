// Small touches on the static parts of the page, with Motion's vanilla API (no React here): the magnetic
// download buttons and their confirmation, the glow and tilt of the feature cards, things sliding in as they
// come into view, the install steps' line, and the copy buttons. Pointer effects only with a fine pointer;
// nothing moves with reduced motion.
import { animate, inView, scroll } from 'motion';

const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const spring = { type: 'spring', stiffness: 260, damping: 20, mass: 0.6 } as const;

// ---------- Download buttons: a short confirmation (the link itself downloads) ----------
document.querySelectorAll<HTMLElement>('[data-download]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!btn.querySelector('.dl-done')) return;
    btn.setAttribute('data-started', '');
    setTimeout(() => btn.removeAttribute('data-started'), 2400);
  });
});

if (motionOk && finePointer) {
  // ---------- Magnetic buttons: they lean toward the pointer, then spring back ----------
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
      animate(el, { x, y }, spring);
    });
    el.addEventListener('pointerleave', () => animate(el, { x: 0, y: 0 }, { type: 'spring', stiffness: 200, damping: 12 }));
  });

  // ---------- Feature cards: a glow under the pointer and a slight tilt ----------
  document.querySelectorAll<HTMLElement>('[data-glow]').forEach((card) => {
    let frame = 0;
    card.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.setProperty('--gx', `${x}px`);
        card.style.setProperty('--gy', `${y}px`);
        card.setAttribute('data-hover', '');
        if (card.hasAttribute('data-tilt')) {
          const rx = ((y / r.height) - 0.5) * -4;
          const ry = ((x / r.width) - 0.5) * 4;
          animate(card, { rotateX: rx, rotateY: ry, transformPerspective: 900 }, spring);
        }
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      card.removeAttribute('data-hover');
      animate(card, { rotateX: 0, rotateY: 0 }, { type: 'spring', stiffness: 180, damping: 18 });
    });
  });
}

// ---------- Sliding in as they come into view (only what starts below the fold) ----------
if (motionOk) {
  const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
  items.forEach((el) => el.classList.add('reveal-pending'));
  items.forEach((el) => {
    inView(el, () => {
      const i = Number(getComputedStyle(el).getPropertyValue('--i')) || 0;
      animate(el, { opacity: [0, 1], y: [18, 0] }, { type: 'spring', stiffness: 140, damping: 20, delay: Math.min(i, 6) * 0.05 })
        .then(() => el.classList.remove('reveal-pending'));
      el.classList.remove('reveal-pending');
    }, { amount: 0.2 });
  });

  // ---------- The install steps' line fills with the scroll ----------
  const stepper = document.querySelector<HTMLElement>('[data-stepper]');
  const fill = document.querySelector<HTMLElement>('[data-stepper-fill]');
  if (stepper && fill) {
    scroll(animate(fill, { scaleY: [0, 1] }, { ease: 'linear' }), { target: stepper, offset: ['start 70%', 'end 70%'] });
  }
}

// ---------- Copy buttons ----------
const status = document.querySelector<HTMLElement>('[data-copy-status]');
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const label = btn.querySelector('.copy-label');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? '');
    } catch {
      return; // no clipboard access (an old browser, or not allowed): the command stays selectable
    }
    btn.setAttribute('data-copied', '');
    if (label) label.textContent = 'Copied';
    if (status) status.textContent = 'Copied to the clipboard';
    if (motionOk) animate(btn, { scale: [0.92, 1] }, { type: 'spring', stiffness: 500, damping: 15 });
    setTimeout(() => {
      btn.removeAttribute('data-copied');
      if (label) label.textContent = 'Copy';
    }, 1800);
  });
});
