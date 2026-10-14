// The app's icon (docs/images/icon.png, a cassette), redrawn as a vector on its own 128 grid with the colours
// sampled from the PNG, so it stays sharp at any size and the page carries no raster picture of the product.
export function appIcon(id = 'ai', size = 128) {
  const g = `${id}-g`;
  return `<svg viewBox="0 0 128 128" width="${size}" height="${size}" aria-hidden="true" focusable="false">` +
    `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FD5E45"/><stop offset="1" stop-color="#DB263D"/></linearGradient></defs>` +
    `<rect x="4" y="17" width="120" height="94" rx="14" fill="url(#${g})" stroke="#A0122D" stroke-width="2.5"/>` +
    `<rect x="15" y="29" width="98" height="57" rx="6" fill="#FFF5EF"/>` +
    `<rect x="23" y="35.5" width="82" height="3.5" rx="1.75" fill="#EE4545"/>` +
    `<rect x="28" y="46" width="72.5" height="30.5" rx="6" fill="#221E26"/>` +
    `<circle cx="45.5" cy="62" r="11.5" fill="#6A3C36"/><circle cx="82" cy="62" r="11.5" fill="#6A3C36"/>` +
    `<circle cx="45.5" cy="62" r="8" fill="#FEFDFD"/><circle cx="82" cy="62" r="8" fill="#FEFDFD"/>` +
    `<path d="M45.5 59.2l.8 1.6 1.7.2-1.3 1.2.4 1.8-1.6-.9-1.6.9.4-1.8-1.3-1.2 1.7-.2zM82 59.2l.8 1.6 1.7.2-1.3 1.2.4 1.8-1.6-.9-1.6.9.4-1.8-1.3-1.2 1.7-.2z" fill="#221E26"/>` +
    `<path d="M35 111l6-16.5h47l6 16.5z" fill="#B21832"/>` +
    `<circle cx="54" cy="102" r="3.3" fill="#221E26"/><circle cx="74" cy="102" r="3.3" fill="#221E26"/>` +
    `</svg>`;
}
