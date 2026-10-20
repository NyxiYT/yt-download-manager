// The page's small behaviours, without React: the theme and motion buttons, copy buttons, the download buttons' check,
// the menu on phones, the nav (condensing, the section in view, the right download for the system), the hero's
// tilt, the section reveals, and the visitor's cursor. Smooth scrolling and the nav's glass load on the first
// interaction. The features grid's spotlight is in scripts/features.ts; the frame stream behind the hero and the
// final call to action is in scripts/frame-stream.ts.
import { followSystemMotion, getMotion, onMotion, setMotion } from '../islands/motion-pref';

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
const root = document.documentElement;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

// ---------- theme and motion: the icon buttons in the nav and in the phone menu (components/Toggles.astro) ----------
const themeBtns = $$<HTMLButtonElement>('[data-theme-btn]');
function paintTheme() {
  const light = root.dataset.theme === 'light';
  const label = light ? 'Dark theme' : 'Light theme'; // what a click does
  themeBtns.forEach((b) => b.setAttribute('aria-label', label));
  $$('[data-theme-label]').forEach((t) => { t.textContent = label; });
  $<HTMLMetaElement>('meta[name=theme-color]')!.content = light ? '#F5F7FB' : '#07080B';
}
themeBtns.forEach((b) => b.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  store.set('theme', root.dataset.theme);
  paintTheme();
}));
paintTheme();
// Until the visitor picks a theme, the page follows the system's appearance, also when it changes (Auto at dusk).
const systemLight = matchMedia('(prefers-color-scheme: light)');
systemLight.addEventListener('change', () => {
  if (store.get('theme')) return;
  root.dataset.theme = systemLight.matches ? 'light' : 'dark';
  paintTheme();
});

// Motion follows the system's Reduce motion setting until the visitor presses the button.
followSystemMotion();
const motionBtns = $$<HTMLButtonElement>('[data-motion-btn]');
const paintMotion = () => motionBtns.forEach((b) => b.setAttribute('aria-pressed', String(getMotion() === 'reduced')));
motionBtns.forEach((b) => b.addEventListener('click', () => setMotion(getMotion() === 'reduced' ? 'full' : 'reduced')));
onMotion(paintMotion);
paintMotion();

// ---------- copy buttons ----------
document.addEventListener('click', async (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-copy]');
  if (!btn) return;
  const text = btn.dataset.copy!;
  try { await navigator.clipboard.writeText(text); } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  btn.setAttribute('data-done', '');
  const status = $('[data-copy-status]', btn);
  if (status) status.textContent = 'Copied';
  setTimeout(() => { btn.removeAttribute('data-done'); if (status) status.textContent = ''; }, 1800);
});

// ---------- download buttons: the arrow becomes a check when the download starts (the link itself downloads) ----------
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLElement>('[data-download]');
  if (!a || !$('.ai-download', a)) return;
  a.setAttribute('data-done', '');
  setTimeout(() => a.removeAttribute('data-done'), 2200);
});

// ---------- the right download for this system ----------
const os = root.dataset.os;
const navDl = $<HTMLAnchorElement>('[data-nav-download]');
if (navDl && (os === 'linux' || os === 'mac')) navDl.href = navDl.dataset.zip!;
if (navDl && os === 'phone') { navDl.href = '#install'; navDl.removeAttribute('target'); navDl.removeAttribute('rel'); } // in the page: same tab

// ---------- the menu on phones ----------
const sheet = $('[data-menu]');
const openBtn = $<HTMLButtonElement>('[data-menu-open]');
function menu(open: boolean) {
  if (!sheet || !openBtn) return;
  sheet.hidden = !open;
  openBtn.setAttribute('aria-expanded', String(open));
  if (open) $<HTMLElement>('[data-menu-close]', sheet)?.focus(); else openBtn.focus();
}
openBtn?.addEventListener('click', () => menu(true));
$('[data-menu-close]')?.addEventListener('click', () => menu(false));
sheet?.addEventListener('click', (e) => { if (e.target === sheet || (e.target as Element).closest('[data-menu-link]')) menu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet && !sheet.hidden) menu(false); });

// ---------- the nav: condenses after the hero's top, marks the section in view ----------
const bar = $('[data-nav-bar]');
function measureNav() {
  if (!bar) return;
  const w = bar.offsetWidth;
  const start = $('[data-nav-start]', bar)!;
  const end = $('[data-nav-end]', bar)!;
  const links = $('.links', bar);
  const shown = links && getComputedStyle(links).display !== 'none';
  const icon = 28, gap = 20;
  const left = shown ? links.offsetLeft - start.offsetLeft - icon - gap : w / 2 - start.offsetLeft - icon - gap;
  const right = shown ? end.offsetLeft - (links.offsetLeft + links.offsetWidth) - gap : end.offsetLeft - w / 2 - gap;
  bar.style.setProperty('--dx', `${Math.max(0, Math.min(left, right))}px`);
}
let condensed = false;
function onScroll() {
  const c = window.scrollY > 120;
  if (c === condensed || !bar) return;
  condensed = c;
  bar.toggleAttribute('data-condensed', c);
  $('[data-glass]', bar)?.style.setProperty('--cx', c ? bar.style.getPropertyValue('--dx') : '0px');
}
measureNav();
addEventListener('resize', () => { measureNav(); condensed = !condensed; onScroll(); }, { passive: true });
addEventListener('scroll', onScroll, { passive: true });
onScroll();
const links = $$<HTMLAnchorElement>('[data-nav-link]');
const targets = links.map((a) => $(a.hash)).filter(Boolean) as HTMLElement[];
if (targets.length) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) links.forEach((a) => (a.hash === `#${e.target.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }, { rootMargin: '-45% 0px -50% 0px' });
  targets.forEach((t) => io.observe(t));
}

// ---------- the hero's player tilts toward the pointer (at most 4°, on a spring; wide screens only) ----------
const tilt = $('[data-tilt]');
if (tilt && fine && matchMedia('(min-width: 900px)').matches) {
  const hero = tilt.closest('section')!;
  let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0;
  const step = () => {
    // a damped spring: stiffness 120, damping 18, 60 fps
    const k = 120, d = 18, dt = 1 / 60;
    vx += (k * (tx - x) - d * vx) * dt; x += vx * dt;
    vy += (k * (ty - y) - d * vy) * dt; y += vy * dt;
    tilt.style.transform = `rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) > 0.01 ? requestAnimationFrame(step) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
  hero.addEventListener('pointermove', (e) => {
    if (getMotion() === 'reduced') return;
    const r = tilt.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2))) * 4;
    ty = Math.max(-1, Math.min(1, -(e.clientY - (r.top + r.height / 2)) / (r.height / 2))) * 4;
    kick();
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
}

// ---------- reveals (fade up 24 px, staggered, once) and the feature fragments (play when they come into view) ----------
const rev = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px' });
$$('[data-reveal]').forEach((el) => rev.observe(el));
const play = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting && e.intersectionRatio > 0.5) e.target.classList.add('play');
    else if (!e.isIntersecting) e.target.classList.remove('play');
  }
}, { threshold: [0, 0.5] });
$$('[data-play]').forEach((el) => play.observe(el));

// ---------- the visitor's cursor (fine pointers only) ----------
if (fine) import('./cursor');

// ---------- later: smooth scrolling and the glass, on the first interaction (or after a few seconds) ----------
let started = false;
const later = () => {
  if (started) return;
  started = true;
  import('./scroll-engine');
  import('./glass').then((m) => m.initGlass());
};
for (const ev of ['scroll', 'wheel', 'pointerdown', 'touchstart', 'keydown']) addEventListener(ev, later, { once: true, passive: true });
setTimeout(later, 5000);
