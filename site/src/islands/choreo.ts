// The drawn cursor of the showcases (hero, install steps). It never uses stored coordinates: before every move it
// measures its target and aims at the centre, in the showcase's own (unscaled) pixels, so it lands on the same
// button at every width. A click is always: move, a short pause, the target's hover look, press (cursor 0.9, the
// target's pressed look), and then, only if the cursor really is over the target, the result.
//
// A loop ends with restart(): hold the final state, cross-fade back to the start (lib/playback.ts).
//
// For the Playwright tests (site/tests/cursor.spec.ts): every press is recorded in window.__presses, and when the
// test defines window.__choreoPause, the press waits for it, so the test can measure the page at that moment.

import { holdAndReset } from '../lib/playback';

export interface Press { show: string; target: string; t: number; cx: number; cy: number; rect: { left: number; top: number; right: number; bottom: number }; inside: boolean }
type W = Window & { __presses?: Press[]; __choreoPause?: (p: Press) => Promise<void> };

export const abortErr = () => new DOMException('stopped', 'AbortError');

// cubic-bezier(.45, 0, .2, 1), solved for x by Newton's method: the cursor's ease.
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const a = (p1: number, p2: number) => 1 - 3 * p2 + 3 * p1, b = (p1: number, p2: number) => 3 * p2 - 6 * p1, c = (p1: number) => 3 * p1;
  const at = (t: number, p1: number, p2: number) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t;
  const slope = (t: number, p1: number, p2: number) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1);
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) { const d = slope(t, x1, x2); if (Math.abs(d) < 1e-6) break; t -= (at(t, x1, x2) - x) / d; }
    return at(Math.min(1, Math.max(0, t)), y1, y2);
  };
}
const EASE = bezier(0.45, 0, 0.2, 1);
const EASE_OUT = bezier(0.22, 1, 0.36, 1);

/** A tween on the page's frame loop that stands still while the showcase is off screen. */
export function tween(ms: number, onUpdate: (k: number) => void, opts: { live: () => boolean; signal: AbortSignal; ease?: (x: number) => number }) {
  const ease = opts.ease ?? EASE;
  return new Promise<void>((res, rej) => {
    let t = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (opts.signal.aborted) return rej(abortErr());
      if (opts.live()) t += now - last;
      last = now;
      const k = Math.min(1, t / ms);
      onUpdate(ease(k));
      if (k >= 1) res(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
export { EASE, EASE_OUT };

export interface ChoreoOpts {
  /** The showcase's root: positions are relative to it, in its unscaled pixels. */
  root: HTMLElement;
  /** The drawn cursor element (absolutely positioned inside root). Its hotspot is its top-left corner. */
  cursor: HTMLElement;
  /** Name of the showcase, for the test log. */
  show: string;
  signal: AbortSignal;
  /** Plays only while this is true (on screen, tab visible). */
  live: () => boolean;
  /** Sets the hover and pressed look on a target (by its data-t). */
  setUi: (ui: { hover: string | null; press: string | null }) => void;
}

export function createChoreo(o: ChoreoOpts) {
  const { root, cursor, signal } = o;
  let at = { x: 0, y: 0 };

  const scale = () => root.getBoundingClientRect().width / root.offsetWidth || 1;
  const find = (t: string) => root.querySelector<HTMLElement>(`[data-t="${t}"]`);
  const rel = (el: Element) => {
    const k = scale();
    const a = root.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    return { x: (b.left - a.left) / k, y: (b.top - a.top) / k, w: b.width / k, h: b.height / k };
  };
  const place = (p: { x: number; y: number }) => { at = p; cursor.style.transform = `translate(${p.x}px, ${p.y}px)`; };

  const wait = (ms: number) => new Promise<void>((res, rej) => {
    let left = ms;
    let last = performance.now();
    const tick = (now: number) => {
      if (signal.aborted) return rej(abortErr());
      if (o.live()) left -= now - last;
      last = now;
      if (left <= 0) res(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const until = (cond: () => boolean) => new Promise<void>((res, rej) => {
    const tick = () => { if (signal.aborted) return rej(abortErr()); if (cond()) res(); else requestAnimationFrame(tick); };
    tick();
  });
  const whenLive = () => until(o.live);

  // A gentle arc: the control point sits a little to the side of the straight line, below it when going up,
  // so the path bows away from the controls that sit in rows. Measured at the start and corrected at the end,
  // in case the layout moved while the cursor travelled.
  async function move(t: string, ms = 650, fx = 0.5, fy = 0.5) {
    await until(() => !!find(t));
    await whenLive();
    const target = () => { const r = rel(find(t)!); return { x: r.x + r.w * fx, y: r.y + r.h * fy }; };
    const from = { ...at };
    const to = target();
    const dx = to.x - from.x, dy = to.y - from.y;
    const dist = Math.hypot(dx, dy) || 1;
    const bend = Math.min(60, dist * 0.18) * (dx >= 0 ? 1 : -1);
    const c = { x: (from.x + to.x) / 2 - (dy / dist) * bend, y: (from.y + to.y) / 2 + (dx / dist) * bend * 0.6 };
    await tween(ms, (k) => {
        const end = k > 0.85 ? target() : to; // follow the target if it moved
        const u = 1 - k;
        place({ x: u * u * from.x + 2 * u * k * c.x + k * k * end.x, y: u * u * from.y + 2 * u * k * c.y + k * k * end.y });
    }, { live: o.live, signal });
    if (signal.aborted) throw abortErr();
    place(target());
  }

  function record(t: string): Press {
    const el = find(t);
    const r = el?.getBoundingClientRect();
    const c = cursor.getBoundingClientRect(); // the hotspot is the cursor box's top-left corner
    const cx = c.left, cy = c.top;
    const rect = r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : { left: 0, top: 0, right: 0, bottom: 0 };
    const inside = !!r && cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    const p = { show: o.show, target: t, t: Math.round(performance.now()), cx, cy, rect, inside };
    const w = window as W;
    (w.__presses ??= []).push(p);
    return p;
  }

  async function hover(t: string, ms = 650) {
    await move(t, ms);
    o.setUi({ hover: t, press: null });
  }

  /** Move, pause, hover, press; the result happens only when the press lands on the target. */
  async function click(t: string, act: () => void, ms = 650) {
    await hover(t, ms);
    await wait(150);
    cursor.dataset.press = '';
    o.setUi({ hover: t, press: t });
    const p = record(t);
    const pause = (window as W).__choreoPause;
    if (pause) await pause(p);
    await wait(120);
    if (p.inside) act();
    delete cursor.dataset.press;
    o.setUi({ hover: t, press: null });
    await wait(80);
  }

  /** Drag a handle along its track: the handle and the cursor move together, 1:1. */
  async function drag(t: string, track: string, from: number, to: number, onValue: (v: number) => void, ms = 900) {
    await hover(t, 700);
    await wait(150);
    cursor.dataset.press = '';
    o.setUi({ hover: t, press: t });
    const p = record(t);
    const pause = (window as W).__choreoPause;
    if (pause) await pause(p);
    if (!p.inside) { delete cursor.dataset.press; return; }
    const tr = rel(find(track)!);
    const y = at.y;
    await tween(ms, (k) => { const v = from + (to - from) * k; onValue(v); place({ x: tr.x + v * tr.w, y }); }, { live: o.live, signal });
    if (signal.aborted) throw abortErr();
    delete cursor.dataset.press;
    o.setUi({ hover: t, press: null });
  }

  /** Start of a loop: the cursor fades in at a resting spot. */
  async function enter(x: number, y: number) {
    place({ x, y });
    await tween(350, (k) => { cursor.style.opacity = String(k); }, { live: o.live, signal, ease: EASE_OUT });
  }
  /** End of a loop: the cursor fades out before the scene resets (no teleporting). */
  async function leave() {
    await tween(300, (k) => { cursor.style.opacity = String(1 - k); }, { live: o.live, signal, ease: EASE_OUT });
  }

  /** End of a loop, after leave(): hold, fade the scene out, reset it, fade it back in. */
  const restart = (scene: HTMLElement, reset: () => void) => holdAndReset(scene, reset, o.live, signal);

  const tw = (ms: number, fn: (k: number) => void, ease?: (x: number) => number) => tween(ms, fn, { live: o.live, signal, ease });
  return { move, hover, click, drag, wait, until, enter, leave, restart, rel, find, place, tween: tw };
}
export type Choreo = ReturnType<typeof createChoreo>;
