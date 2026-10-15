// The page's small behaviours, without React: theme and motion switches, copy buttons, the download buttons' check,
// the menu on phones, the nav (condensing, the section in view, the right download for the system), the films in
// the background (after the page has loaded; still while off screen), the hero's tilt, the section reveals, and the
// visitor's cursor. Smooth scrolling and the nav's glass load on the first interaction.
import { getMotion, onMotion, setMotion } from '../islands/motion-pref';
import { FADE_MS, HOLD_MS, liveFade, liveWait, scenePlayback } from '../lib/playback';

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
const root = document.documentElement;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const store = { set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };

// ---------- theme ----------
const themeSwitch = $<HTMLInputElement>('[data-theme-switch]');
function paintTheme() {
  const light = root.dataset.theme === 'light';
  if (themeSwitch) themeSwitch.checked = light;
  $<HTMLMetaElement>('meta[name=theme-color]')!.content = light ? '#F5F7FB' : '#07080B';
}
themeSwitch?.addEventListener('change', () => { root.dataset.theme = themeSwitch.checked ? 'light' : 'dark'; store.set('theme', root.dataset.theme); paintTheme(); });
paintTheme();

// ---------- motion (turned down only here, never by the system setting) ----------
const motionSwitch = $<HTMLInputElement>('[data-motion-toggle]');
if (motionSwitch) {
  motionSwitch.checked = getMotion() === 'reduced';
  motionSwitch.addEventListener('change', () => setMotion(motionSwitch.checked ? 'reduced' : 'full'));
}

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
if (navDl && os === 'phone') navDl.href = '#install';

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

// ---------- the films behind the hero and the final call: after load, only while on screen ----------
function films() {
  $$<HTMLVideoElement>('video[data-back]').forEach((v) => {
    let on = false;
    const start = () => {
      if (!v.dataset.loaded) {
        $$<HTMLSourceElement>('source[data-src]', v).forEach((s) => { s.src = s.dataset.src!; });
        v.load();
        v.dataset.loaded = '1';
        if (v.hasAttribute('data-slow')) v.playbackRate = 0.6;
      }
      if (getMotion() === 'full') v.play().catch(() => {});
    };
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) start(); else v.pause(); }).observe(v);
    onMotion((p) => { if (p === 'reduced') v.pause(); else if (on) start(); });
    v.addEventListener('loadedmetadata', () => { if (v.hasAttribute('data-slow')) v.playbackRate = 0.6; });
  });
}
if (document.readyState === 'complete') setTimeout(films, 200); else addEventListener('load', () => setTimeout(films, 200), { once: true });

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

// ---------- the feature cards: each mini-scene loops while in view (lib/playback.ts) ----------
// A loop: add .play (the CSS animations run), wait until they all end, hold, fade the scene out, restart it, fade in.
// Off screen, its animations pause where they are and resume from there.
$$('[data-loop]').forEach((card) => {
  const scene = $('.frag', card) ?? card;
  const pb = scenePlayback(card);
  const anims = () => scene.getAnimations({ subtree: true });
  let running = false;
  const run = async () => {
    running = true;
    for (let first = true; ; first = false) {
      card.classList.remove('play');
      void card.offsetWidth; // restart the CSS animations
      card.classList.add('play');
      if (!first) await liveFade(scene, 1, FADE_MS / 2, pb.live);
      await new Promise((r) => requestAnimationFrame(r));
      await Promise.all(anims().map((a) => a.finished.catch(() => {})));
      if (getMotion() === 'reduced') { running = false; return; } // rests on its last frame
      await liveWait(HOLD_MS, pb.live);
      await liveFade(scene, 0, FADE_MS / 2, pb.live);
    }
  };
  pb.onChange((live) => {
    anims().forEach((a) => (live ? a.play() : a.pause()));
    if (live && !running) run();
  });
  onMotion((p) => { if (p === 'full' && pb.live() && !running) run(); });
});

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
