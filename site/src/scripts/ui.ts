// The page's small behaviours, without React: theme and motion switches, the leader strip, copy buttons, the
// download buttons' confirmation and magnetic pull, the menu on phones, the nav (condensing, the section you're
// in, the right download for your system), the feature filter and previews, and the install guide's step list.
// Then, once the browser is idle: smooth scrolling and title reveals (scroll-engine.ts) and the nav's glass.
import { getMotion, setMotion } from '../islands/motion-pref';

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
const root = document.documentElement;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const store = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };

// ---------- theme ----------
const themeBtn = $('[data-theme-toggle]');
const themeSwitch = $<HTMLInputElement>('[data-theme-switch]');
function paintTheme() {
  const light = root.dataset.theme === 'light';
  themeBtn?.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  if (themeSwitch) themeSwitch.checked = light;
  $<HTMLMetaElement>('meta[name=theme-color]')!.content = light ? '#faf6f2' : '#0f0f0f';
}
function setTheme(light: boolean) {
  root.dataset.theme = light ? 'light' : 'dark';
  store.set('theme', light ? 'light' : 'dark');
  paintTheme();
}
themeBtn?.addEventListener('click', () => setTheme(root.dataset.theme !== 'light'));
themeSwitch?.addEventListener('change', () => setTheme(themeSwitch.checked));
paintTheme();

// ---------- motion (off only when the visitor turns it down here) ----------
const motionSwitch = $<HTMLInputElement>('[data-motion-toggle]');
if (motionSwitch) {
  motionSwitch.checked = getMotion() === 'reduced';
  motionSwitch.addEventListener('change', () => setMotion(motionSwitch.checked ? 'reduced' : 'full'));
}

// ---------- leader strip ----------
$('[data-leader-close]')?.addEventListener('click', () => {
  const l = $('[data-leader]')!;
  store.set('leader', l.dataset.leader!);
  l.hidden = true;
});

// ---------- copy buttons: a checkmark, and "Copied" for screen readers ----------
document.addEventListener('click', async (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-copy]');
  if (!btn) return;
  const text = btn.dataset.copy!;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  btn.setAttribute('data-copied', '');
  const status = $('[data-copy-status]', btn);
  if (status) status.textContent = 'Copied';
  setTimeout(() => { btn.removeAttribute('data-copied'); if (status) status.textContent = ''; }, 1800);
});

// ---------- download buttons: a short check when the download starts (the link itself downloads) ----------
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLElement>('[data-download]');
  if (!a || !$('.done', a)) return;
  a.setAttribute('data-started', '');
  setTimeout(() => a.removeAttribute('data-started'), 2200);
});

// ---------- magnetic primary buttons (after React Bits' Magnet): they lean toward the pointer, then settle ----------
if (fine) {
  $$('[data-magnetic]').forEach((el) => {
    el.style.transition = 'transform 0.45s cubic-bezier(0.2, 0, 0, 1)';
    el.addEventListener('pointermove', (e) => {
      if (getMotion() === 'reduced') return;
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.18}px, ${(e.clientY - (r.top + r.height / 2)) * 0.3}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// ---------- the right download for this system in the nav ----------
const navDl = $<HTMLAnchorElement>('[data-nav-download]');
if (navDl && (root.dataset.os === 'linux' || root.dataset.os === 'mac')) navDl.href = navDl.dataset.zip!;
if (navDl && root.dataset.os === 'touch') navDl.href = '#install';

// ---------- the menu on phones ----------
const sheet = $('[data-menu]');
const openBtn = $<HTMLButtonElement>('[data-menu-open]');
function menu(open: boolean) {
  if (!sheet || !openBtn) return;
  sheet.hidden = !open;
  openBtn.setAttribute('aria-expanded', String(open));
  if (open) $<HTMLElement>('[data-menu-close]', sheet)?.focus();
  else openBtn.focus();
}
openBtn?.addEventListener('click', () => menu(true));
$('[data-menu-close]')?.addEventListener('click', () => menu(false));
sheet?.addEventListener('click', (e) => { if (e.target === sheet || (e.target as Element).closest('[data-menu-link]')) menu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet && !sheet.hidden) menu(false); });

// ---------- the nav: condenses after the hero's top, marks the section in view ----------
const bar = $('[data-nav-bar]');
const word = $('[data-nav-word]');
// Condensed, the capsule shrinks by the same amount on both sides (clip-path) and the ends move in with it
// (transform), as far as the gap to the centred links allows. Nothing is laid out again.
function measureNav() {
  if (!bar) return;
  const w = bar.offsetWidth;
  const start = $('[data-nav-start]', bar)!;
  const end = $('[data-nav-end]', bar)!;
  const links = $('.links', bar);
  const shown = links && getComputedStyle(links).display !== 'none';
  const icon = $('img', start)?.offsetWidth ?? 28;
  const gap = 20;
  const left = shown ? links.offsetLeft - start.offsetLeft - icon - gap : w / 2 - start.offsetLeft - icon - gap;
  const right = shown ? end.offsetLeft - (links.offsetLeft + links.offsetWidth) - gap : end.offsetLeft - w / 2 - gap;
  const dx = Math.max(0, Math.min(left, right));
  bar.style.setProperty('--dx', `${dx}px`);
}
let condensed = false;
function onScroll() {
  const c = window.scrollY > 120;
  if (c === condensed || !bar) return;
  condensed = c;
  bar.toggleAttribute('data-condensed', c);
  const glass = $('[data-glass]', bar);
  glass?.style.setProperty('--cx', c ? bar.style.getPropertyValue('--dx') : '0px');
  window.dispatchEvent(new CustomEvent('ydm:nav', { detail: c }));
}
measureNav();
addEventListener('resize', () => { measureNav(); condensed = !condensed; onScroll(); }, { passive: true });
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const links = $$<HTMLAnchorElement>('[data-nav-link]');
const targets = links.map((a) => $(a.hash)).filter(Boolean) as HTMLElement[];
if ('IntersectionObserver' in window && targets.length) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach((a) => (a.hash === `#${e.target.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  targets.forEach((t) => io.observe(t));
}

// ---------- features: filter, and a picture of the feature where the README has one ----------
const chips = $$<HTMLButtonElement>('[data-chip]');
chips.forEach((c) => c.addEventListener('click', () => {
  chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
  $$('[data-group]').forEach((g) => { g.hidden = c.dataset.chip !== 'all' && g.dataset.group !== c.dataset.chip; });
}));
const peek = $('[data-peek]');
if (peek && fine) {
  const img = $<HTMLImageElement>('img', peek)!;
  $$('[data-preview]').forEach((row) => {
    const name = $('.name', row)!;
    name.addEventListener('pointerenter', () => { img.src = row.dataset.preview!; peek.setAttribute('data-on', ''); });
    name.addEventListener('pointerleave', () => peek.removeAttribute('data-on'));
    name.addEventListener('pointermove', (e) => {
      const x = Math.min(e.clientX + 24, innerWidth - 320);
      const y = Math.min(e.clientY + 24, innerHeight - 220);
      peek.style.setProperty('--px', `${x}px`);
      peek.style.setProperty('--py', `${y}px`);
    });
  });
}

// ---------- install: the step list follows the steps ----------
const stepLinks = $$<HTMLAnchorElement>('[data-step-link]');
if (stepLinks.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const n = (e.target as HTMLElement).dataset.step;
      stepLinks.forEach((a) => (a.dataset.stepLink === n ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current')));
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('[data-step]').forEach((s) => io.observe(s));
}

// ---------- the marquee rests while it's off screen ----------
const track = $('[data-marquee]');
if (track && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => track.toggleAttribute('data-paused', !e.isIntersecting)).observe(track);
}

// ---------- later: on the first scroll, touch or key (or after a few seconds) ----------
// Smooth scrolling, the title reveals and the nav's glass only matter once the page moves, so they stay out of the
// first paint entirely.
let started = false;
const later = () => {
  if (started) return;
  started = true;
  root.classList.add('fonts-late');
  import('./scroll-engine');
  import('./glass').then((m) => m.initGlass());
  import('./live');
};
for (const ev of ['scroll', 'wheel', 'pointerdown', 'touchstart', 'keydown']) addEventListener(ev, later, { once: true, passive: true });
setTimeout(later, 5000);
