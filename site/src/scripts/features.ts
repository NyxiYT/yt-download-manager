// The features grid's spotlight: one card plays at a time, with a soft blue light on its border.
//   Wide screens  the spotlight walks the cards in order, about 4 s each. Hovering a card plays and loops it and
//                 holds the walk; leaving goes on with the card after it.
//   Phones        (one column) the card nearest the middle of the screen plays, and loops.
// A card plays by getting .play (its CSS animations start); playing it again fades it out, restarts, fades it in.
// Everything stands still while the grid is off screen or the tab is hidden (lib/playback.ts).
import { getMotion, onMotion } from '../islands/motion-pref';
import { FADE_MS, HOLD_MS, liveFade, liveWait, scenePlayback } from '../lib/playback';

const SLOT_MS = 4000; // a card's turn in the walk: its animation, then a short rest on the last frame

const grid = document.querySelector<HTMLElement>('[data-feats]');
if (grid) {
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-card]')];
  const scene = (c: HTMLElement) => c.querySelector<HTMLElement>('.frag') ?? c;
  const anims = (c: HTMLElement) => scene(c).getAnimations({ subtree: true });
  const pb = scenePlayback(grid);
  const phone = matchMedia('(max-width: 639px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const live = pb.live;

  let run: AbortController | null = null;
  let spot: HTMLElement | null = null;
  let hovered: HTMLElement | null = null;

  function light(card: HTMLElement) {
    if (spot === card) return;
    spot?.removeAttribute('data-spot');
    card.setAttribute('data-spot', '');
    spot = card;
  }

  /** Plays the card from the start; resolves with the length of its animations (ms). */
  async function play(card: HTMLElement, signal: AbortSignal) {
    light(card);
    const again = card.classList.contains('play');
    if (again) await liveFade(scene(card), 0, FADE_MS / 2, live, signal);
    card.classList.remove('play');
    void card.offsetWidth; // restart the CSS animations
    card.classList.add('play');
    await new Promise((r) => requestAnimationFrame(r));
    if (!live()) anims(card).forEach((a) => a.pause());
    if (again) await liveFade(scene(card), 1, FADE_MS / 2, live, signal);
    return Math.max(0, ...anims(card).map((a) => Number(a.effect?.getComputedTiming().endTime) || 0));
  }

  /** The walk: each card in turn from `from`, round and round. */
  async function walk(from: number, signal: AbortSignal) {
    for (let i = from; ; i = (i + 1) % cards.length) {
      const ms = await play(cards[i], signal);
      await liveWait(Math.max(SLOT_MS, ms + 600), live, signal);
    }
  }

  /** One card on its own: play, hold, fade back, again (hover, and phones). */
  async function loop(card: HTMLElement, signal: AbortSignal) {
    for (;;) {
      const ms = await play(card, signal);
      await liveWait(ms + HOLD_MS, live, signal);
    }
  }

  function start(job: (signal: AbortSignal) => Promise<void>) {
    run?.abort();
    if (spot) scene(spot).style.opacity = ''; // stopped mid-fade: show it whole
    const c = new AbortController();
    run = c;
    job(c.signal).catch((e) => { if ((e as Error).name !== 'AbortError') throw e; });
  }

  // Phones: the card whose middle is closest to the middle of the screen.
  const nearest = () => {
    const mid = innerHeight / 2;
    let best = cards[0], d = Infinity;
    for (const c of cards) { const r = c.getBoundingClientRect(); const x = Math.abs(r.top + r.height / 2 - mid); if (x < d) { d = x; best = c; } }
    return best;
  };

  function choose() {
    if (getMotion() === 'reduced') {
      // Nothing moves: every card shows its last frame, no spotlight.
      run?.abort(); run = null;
      spot?.removeAttribute('data-spot'); spot = null;
      cards.forEach((c) => { c.classList.add('play'); scene(c).style.opacity = ''; });
      return;
    }
    if (phone.matches) {
      const c = nearest();
      if (c !== spot || !run) start((s) => loop(c, s));
    } else if (hovered) {
      start((s) => loop(hovered!, s));
    } else if (!run) {
      start((s) => walk(0, s));
    }
  }

  // Off screen or hidden tab: the playing card's animations pause where they are (the waits stand still too).
  pb.onChange((on) => {
    if (spot) anims(spot).forEach((a) => (on ? a.play() : a.pause()));
    if (on) choose();
  });

  if (fine.matches) {
    for (const [i, card] of cards.entries()) {
      card.addEventListener('pointerenter', () => {
        if (phone.matches || getMotion() === 'reduced') return;
        hovered = card;
        start((s) => loop(card, s));
      });
      card.addEventListener('pointerleave', () => {
        if (hovered !== card) return;
        hovered = null;
        if (phone.matches || getMotion() === 'reduced') return;
        start((s) => walk((i + 1) % cards.length, s));
      });
    }
  }

  let ticking = false;
  addEventListener('scroll', () => {
    if (!phone.matches || ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; if (live()) choose(); });
  }, { passive: true });
  phone.addEventListener('change', () => { run?.abort(); run = null; hovered = null; if (live()) choose(); });
  onMotion(() => { run?.abort(); run = null; if (getMotion() === 'full') cards.forEach((c) => c.classList.remove('play')); if (live()) choose(); });
}
