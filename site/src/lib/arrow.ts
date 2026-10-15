// The one arrow (BRIEF 7.3): the visitor's cursor and every showcase cursor draw this same shape, so the page feels
// like one system. White fill, a 1 px dark outline, a soft small shadow (styles/demo.css .d-cursor-svg); about 18 px
// tall in a 26 px box whose top-left corner is the hotspot (the margins on .d-cursor-svg put the tip there).
export const ARROW_PATH = 'M5.5 3.2 19 12.4l-6.1 1.3-3.3 5.6Z';
export const ARROW_SIZE = 26;

/** The arrow as markup, for the Astro pages (the React showcases render the same path in demo/parts.tsx). */
export const arrowSvg = (cls = 'd-cursor-svg') =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="${ARROW_SIZE}" height="${ARROW_SIZE}" aria-hidden="true"><path d="${ARROW_PATH}" fill="#fff" stroke="#0f0f0f" stroke-width="1" stroke-linejoin="round"/></svg>`;
