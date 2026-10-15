// The site's own icons, drawn to sit beside the extension's: a 24 px grid, 1.75 px strokes, round caps and joins.
// Each has one short motion on hover that says what it is (styles/icons.css): the arrow drops, the hand turns, the
// folder opens. The parts that move carry a class; pathLength="1" lets a line draw itself in.
const svg = (name: string, body: string) =>
  `<svg class="ai ai-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const AI = {
  download: svg('download', '<path class="m-drop" d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5"/><path d="M5 19.5h14"/><path class="m-done" pathLength="1" d="m7.5 12 3 3 6-6.5"/>'),
  camera: svg('camera', '<path d="M3.5 8.5a2 2 0 0 1 2-2h2l1.5-2h6l1.5 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/><circle class="m-shutter" cx="12" cy="13" r="3.5"/>'),
  music: svg('music', '<g class="m-bob"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></g>'),
  scissors: svg('scissors', '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path class="m-blade-a" d="M8 8.5 19 17"/><path class="m-blade-b" d="M8 15.5 19 7"/>'),
  shorts: svg('shorts', '<rect x="6.5" y="3" width="11" height="18" rx="3"/><path class="m-play" d="m10.5 9.5 4 2.5-4 2.5Z"/>'),
  clock: svg('clock', '<circle cx="12" cy="12" r="8.5"/><path class="m-hand" d="M12 7.5V12l3 2"/>'),
  folder: svg('folder', '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/><path class="m-lid" d="M3.5 10.5h17"/>'),
  noads: svg('noads', '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M8 14.5l1.8-5 1.8 5M8.6 13h2.4M14 9.5v5h1.2a2.5 2.5 0 0 0 0-5Z"/><path class="m-strike" pathLength="1" d="M4 20 20 4"/>'),
  globe: svg('globe', '<circle cx="12" cy="12" r="8.5"/><g class="m-spin"><path d="M12 3.5c2.4 2.3 3.5 5.2 3.5 8.5s-1.1 6.2-3.5 8.5c-2.4-2.3-3.5-5.2-3.5-8.5s1.1-6.2 3.5-8.5Z"/></g><path d="M3.8 9.5h16.4M3.8 14.5h16.4"/>'),
  refresh: svg('refresh', '<g class="m-turn"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/></g>'),
  bolt: svg('bolt', '<path class="m-flash" d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12Z"/>'),
  pause: svg('pause', '<rect class="m-bar-a" x="7" y="5" width="3.5" height="14" rx="1"/><rect class="m-bar-b" x="13.5" y="5" width="3.5" height="14" rx="1"/>'),
  github: svg('github', '<path class="m-tail" d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>'),
  heart: svg('heart', '<path class="m-beat" d="M12 20s-7.5-4.6-7.5-10a4.3 4.3 0 0 1 7.5-2.9A4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20Z"/>'),
  copy: svg('copy', '<g class="m-idle"><rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/></g><path class="m-done" pathLength="1" d="m6.5 12.5 3.5 3.5 7.5-8"/>'),
  image: svg('image', '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle class="m-sun" cx="15.5" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2.5-2.5L20 18"/>'),
  captions: svg('captions', '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path class="m-line-a" d="M7 12.5h5.5"/><path class="m-line-b" d="M7 15.5h3M13 15.5h4"/>'),
  pip: svg('pip', '<rect x="3" y="5" width="18" height="14" rx="2"/><rect class="m-mini" x="12" y="11" width="6" height="5" rx="1"/>'),
  corner: svg('corner', '<rect x="3" y="4" width="18" height="16" rx="2"/><path class="m-corner" d="M14 13h4v4h-4Z"/>'),
  loop: svg('loop', '<g class="m-turn"><path d="M5 11V9a3 3 0 0 1 3-3h11l-3-3M19 13v2a3 3 0 0 1-3 3H5l3 3"/></g>'),
  // The feature cards: each says its own thing (BRIEF 7.4: no icon twice in a list, every icon matches its label).
  res: svg('res', '<path class="m-c1" d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9"/><path class="m-c2" d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9"/><path class="m-c3" d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15"/><path class="m-c4" d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/><rect x="8" y="8.5" width="8" height="7" rx="1"/>'),
  resume: svg('resume', '<g class="m-turn"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/></g><path class="m-play" d="m10.5 9.2 4.2 2.8-4.2 2.8Z"/>'),
  yield: svg('yield', '<rect x="3.5" y="4" width="17" height="11.5" rx="2"/><path class="m-play" d="m10.5 7.5 4 2.25-4 2.25Z"/><path class="m-slow" d="M12 17.5v3.5m0 0-1.75-1.75M12 21l1.75-1.75"/>'),
  lock: svg('lock', '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path class="m-shackle" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.5v2.5"/>'),
  theme: svg('theme', '<circle cx="12" cy="12" r="8.5"/><path class="m-half" d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" stroke="none"/>'),
} as const;
export type AnimIcon = keyof typeof AI;
