// The thumbnails behind the hero and the final call to action (data/thumbs.json, made by scripts/thumbs.mjs), handed
// out from one pool for the whole page. A thumbnail belongs to one tile at a time, so it never shows twice, in one
// section or across both; one that just left rests until COOL others have been handed out; one whose file fails is
// dropped for the visit. Thumbnails are told apart by their video ID. New ones only need adding to the library.
import library from '../data/thumbs.json';

export interface Thumb { id: string; creator: string; title: string; src: string; file: string }

export const THUMBS: readonly Thumb[] = library;
const COOL = Math.min(30, Math.floor(THUMBS.length / 4));

const owners = new Map<string, string>(); // video ID → the stream holding it
const resting: string[] = []; // most recently returned last
const broken = new Set<string>();

/** A free thumbnail for `owner`, picked at random, or null when every one is taken. */
export function takeThumb(owner: string, rand = Math.random): Thumb | null {
  const free = THUMBS.filter((t) => !owners.has(t.id) && !broken.has(t.id));
  const rested = free.filter((t) => !resting.includes(t.id));
  // All free ones still resting (a small library): the one that has rested longest.
  const pick = rested.length ? rested[Math.floor(rand() * rested.length)] : free.sort((a, b) => resting.indexOf(a.id) - resting.indexOf(b.id))[0];
  if (!pick) return null;
  owners.set(pick.id, owner);
  const i = resting.indexOf(pick.id);
  if (i >= 0) resting.splice(i, 1);
  return pick;
}

/** Gives a thumbnail back once it has left the screen. */
export function returnThumb(id: string) {
  if (!owners.delete(id)) return;
  resting.push(id);
  if (resting.length > COOL) resting.shift();
}

/** Its file couldn't be loaded: never hand it out again during this visit. */
export function dropThumb(id: string) {
  owners.delete(id);
  broken.add(id);
}

const base = import.meta.env.BASE_URL;
export const thumbUrl = (t: Thumb) => `${base}${t.file}`;
