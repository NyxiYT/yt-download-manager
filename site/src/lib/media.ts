// The film (scripts/encode-hero.mjs): the only moving picture on the page. The player in the hero and in Try it
// shows it sharp (1080p on wide screens, 720p on narrow ones); the hero and the final call to action show the
// small, blurred, blue-graded copy behind everything.
const base = import.meta.env.BASE_URL;
const m = (f: string) => `${base}media/${f}`;
const WIDE = '(min-width: 900px)';

export const film = {
  poster: m('film-720.avif'),
  sources: [
    { src: m('film-1080.webm'), type: 'video/webm; codecs="av01.0.08M.08"', media: WIDE },
    { src: m('film-1080.mp4'), type: 'video/mp4', media: WIDE },
    { src: m('film-720.webm'), type: 'video/webm; codecs="av01.0.05M.08"' },
    { src: m('film-720.mp4'), type: 'video/mp4' },
  ],
};
export const back = {
  poster: m('back.avif'),
  sources: [
    { src: m('back.webm'), type: 'video/webm; codecs="av01.0.04M.08"' },
    { src: m('back.mp4'), type: 'video/mp4' },
  ],
};
// A frame of the film, shown as the MP3's cover art in Try it's folder window.
export const cover = m('film-720.avif');
