# Self-review

The built page, checked at 390 to 1920 px in dark and light against the brief's section 12 ("Never") and its other
requirements: what I found and what I changed.

## Section 12, item by item

| Never | Found | Fixed |
|---|---|---|
| Orange | An amber "Age-restricted" chip in a feature card, an amber USDT warning, red 8K/4K labels in a feature fragment, a yellow folder icon in the demo's folder window | All four turned blue or neutral. The app's icon (a red cassette) and the red quality labels inside the real toolbar demo stay: they are the product's own look |
| Purple, neon glow, gradient text, emoji | None | — |
| Version numbers, changelogs, spec tables, RAM figures, checksums, star counts | None visible (the structured data for search engines names the version) | — |
| Testimonials, invented numbers | "4 parts at once" in the Fast card: the README says "several parts" | Removed the label |
| Section numbers | None; the install steps are numbered because their order is real | — |
| Bento grids, three identical icon cards | None | — |
| Copy-pasted library components, library credits | None; every component is built here | — |
| Raster screenshots of the app | None. The only raster media are the film (with its posters) and the social preview | — |
| More than one interactive demo | Only Try it | — |
| A cursor that clicks beside its target | 16 of 16 cursor tests pass at 390, 768, 1280 and 1920 px | Fixed a test that clicked before the stepper was ready |
| More than 2 buttons per section | Hero: Download and Watch it work, plus the small replay icon the brief asks for | — |
| Paragraphs over 2 lines | The install steps wrapped to 3 lines in their column | Wider column, slightly smaller text |
| YouTube logos or red play buttons | None; the player and page around the toolbar are neutral | — |

## Other requirements

- **White text on `#3D7BFF`** is 3.8:1, below AA for 16 px text. Filled buttons and tabs use `#2F6BF0` (4.7:1); `#3D7BFF`
  stays for rings, lines and glow. Lighthouse accessibility went from 97 to 100.
- **Lighthouse (phone, simulated)**: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.8–2.0 s
  (the film's poster), CLS 0, TBT 0 ms.
- **First JavaScript**: about 120 KB gzipped once the hero's demo has loaded; it loads after the first paint.
- **Hero**: the toolbar used to appear only once the script ran (about 3 s on a slow load); it now rises with CSS on
  the first paint, and the cursor part starts when the script is ready. The cursor part takes about 3.5 s, the whole
  intro with the pill's flight about 4.5 s.
- **Install loops**: labels match the measured loops (6.7 s, 6.9 s, 10.3 s → `0:07`, `0:07`, `0:10`).
  The last step now ends on the app window saying Connected; before, that change happened behind the extensions page.
- **The 8K hero**: no Blender open movie is on YouTube above 4K, so the player shows Big Buck Bunny's real top
  quality, `2160p60 4K`.
- **Phones**: no custom cursor, no tilt, no pinning; Try it is a picture there (its real-size buttons would be too
  small to tap) and its tabs still switch it; the hero plays its intro without a cursor.

## Not verified

- Glass refraction, the custom cursor and the tilt on a real phone or tablet (checked in desktop Chrome and its phone
  emulation only).
- Safari and Firefox (the glass falls back to blur there by design; not opened).
