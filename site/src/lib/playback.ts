// The one playback model for every animated scene (BRIEF 7.7): a scene plays while at least 35% of it is on screen
// (or it fills 35% of the screen, for scenes taller than that) and the tab is visible, pauses otherwise, and resumes
// where it stopped. A loop plays, holds its final state for 1.8 s, cross-fades back to the start over 0.4 s, and
// plays again. No replay buttons. Plain DOM, so the Astro scripts and the React islands (islands/playback.ts) share it.

export const PLAY_AT = 0.35;
export const HOLD_MS = 1800;
export const FADE_MS = 400;

export interface Playback {
  /** True while the scene may move: enough of it on screen, and the tab visible. */
  live: () => boolean;
  /** Called with the new value whenever live() changes. Returns an unsubscribe. */
  onChange: (cb: (live: boolean) => void) => () => void;
  dispose: () => void;
}

export function scenePlayback(el: Element, at = PLAY_AT): Playback {
  let seen = false;
  let last = false;
  const subs = new Set<(live: boolean) => void>();
  const live = () => seen && !document.hidden;
  const emit = () => { const l = live(); if (l !== last) { last = l; subs.forEach((f) => f(l)); } };
  const io = new IntersectionObserver(([e]) => {
    const vh = e.rootBounds?.height || innerHeight;
    seen = e.isIntersecting && (e.intersectionRatio >= at || e.intersectionRect.height >= vh * at);
    emit();
  }, { threshold: [0, 0.1, 0.2, at, 0.5, 0.75, 1] });
  io.observe(el);
  document.addEventListener('visibilitychange', emit);
  return {
    live,
    onChange: (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    dispose: () => { io.disconnect(); document.removeEventListener('visibilitychange', emit); subs.clear(); },
  };
}

const abortErr = () => new DOMException('stopped', 'AbortError');

/** Waits ms of time in which live() was true: a scene's clock that stands still while nobody can see it. */
export function liveWait(ms: number, live: () => boolean, signal?: AbortSignal) {
  return new Promise<void>((res, rej) => {
    let left = ms;
    let last = performance.now();
    const tick = (now: number) => {
      if (signal?.aborted) return rej(abortErr());
      if (live()) left -= now - last;
      last = now;
      if (left <= 0) res(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/** Fades el's opacity from its current value to `to` over ms of live time. */
export function liveFade(el: HTMLElement, to: number, ms: number, live: () => boolean, signal?: AbortSignal) {
  const from = Number(getComputedStyle(el).opacity) || 0;
  return new Promise<void>((res, rej) => {
    let t = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (signal?.aborted) return rej(abortErr());
      if (live()) t += now - last;
      last = now;
      const k = Math.min(1, t / ms);
      el.style.opacity = String(from + (to - from) * k);
      if (k >= 1) res(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

/** The end of a loop: hold the final state, fade out, reset (and let the page paint it), fade back in. */
export async function holdAndReset(el: HTMLElement, reset: () => void, live: () => boolean, signal?: AbortSignal) {
  await liveWait(HOLD_MS, live, signal);
  await liveFade(el, 0, FADE_MS / 2, live, signal);
  reset();
  await frame();
  await liveFade(el, 1, FADE_MS / 2, live, signal);
}
