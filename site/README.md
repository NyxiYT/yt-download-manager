# The website

The page at <https://nyxiyt.github.io/yt-download-manager/>: one screen that says what the app is, one demo to try it,
and the way to install it. Everything technical (versions, changelog, checksums, test matrix, Scoop) stays on GitHub
and is linked from the footer and the install section.

Astro (static) with React islands, TypeScript, Tailwind CSS 4, Motion, GSAP ScrollTrigger and Lenis, Radix
(Accordion, Dialog, Tabs) for accessibility, fonts from Fontsource. Every visual part is built here; nothing is
copied from a component library.

```sh
npm install
npm run dev          # http://localhost:4321/yt-download-manager/
npm run check        # types
npm run build        # dist/
npm run test:cursor  # the showcase cursor tests (after a build); PW_CHANNEL=chrome uses the installed Chrome
```

## Where things are

| Path | What |
|---|---|
| `src/lib/content.ts` | Every word on the page. Facts only from README.md. |
| `src/pages/index.astro` | The sections, top to bottom. |
| `src/components/` | One file per section: Header, Hero, TrustLine, TrySection, HowItWorks, Features, OldWay, Install, Faq, Support, FinalCta, Footer. |
| `src/islands/Demo.tsx`, `demo/` | The extension's toolbar, pickers, Shorts menu and history, rebuilt from `content.js` (`demo/parts.tsx`, `styles/ysd.css`). `mode="hero"` plays the intro, `mode="try"` is Try it. |
| `src/islands/screens.tsx` | The app's windows (installer, app window) from `manager/` and the neutral third-party screens around the install. |
| `src/islands/choreo.ts` | The drawn cursor of the showcases: measured targets, hover, press, result only on a hit. |
| `src/islands/InstallSteps.tsx`, `TryIt.tsx`, `Faq.tsx`, `Donate.tsx`, `flight.ts` | The other islands. |
| `src/lib/anim-icons.ts`, `src/styles/icons.css` | The site's icon set (24 px grid, 1.75 px strokes) and its hover motions. |
| `src/lib/app-icon.ts` | The app's icon as a vector. |
| `src/scripts/ui.ts`, `cursor.ts`, `glass.ts`, `scroll-engine.ts` | Behaviour without React: settings, nav, films, tilt, reveals, the visitor's cursor, the nav's glass, smooth scrolling. |
| `scripts/encode-hero.mjs` | Encodes the film (see below). |
| `scripts/formats.mjs` | The quality and format lists the demo shows, from yt-dlp's answer for the video, run through the app's own rules. |
| `tests/cursor.spec.ts` | The cursor tests. |

## The film

The only moving picture is one loop of the opening shot of *Big Buck Bunny* (© Blender Foundation, CC BY 3.0,
credited in the footer), in the player in the hero and in Try it. Posters paint first; the videos start after the
page has loaded and stand still while off screen.

```sh
# Blender's own file: https://download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_30fps_normal.mp4.zip
npm run hero -- path/to/bbb_sunflower_1080p_30fps_normal.mp4
```

Why not an 8K film: no Blender open movie is on YouTube above 4K (Charge 3840×1608, Big Buck Bunny 2160p60), so the
hero highlights Big Buck Bunny's real top row, `2160p60 4K`, and the headline says "Up to 8K".

## Rules the page keeps

- No raster pictures of the app, the extension or the installer: every screen is HTML, CSS and SVG, with its real
  labels. The only raster media are the film (and its posters), the thumbnails behind the hero and the final call to
  action, and the social preview image.
- One interactive section (Try it). Everything else plays by itself; the drawn cursor in the hero and the install
  loops must hit what it clicks, which `tests/cursor.spec.ts` checks at 390, 768, 1280 and 1920 px.
- Theme and motion follow the visitor's system (light or dark, Reduce motion) until they pick in the nav; their
  pick is remembered and wins (`tests/toggles.spec.ts`).
- Blue only: `#3D7BFF` for accents, `#2F6BF0` under white text (AA). The product mockups keep the product's own colours.
- Every section, background and illustration has a designed light version; nothing shows as a dark block on a light
  page. The tokens are in `src/styles/global.css`.
- Type: Funnel Display for headings, Onest for text (17 px at least, line height 1.6), JetBrains Mono for labels such
  as `4320p`.
- Copy: under 500 visible words (FAQ answers aside), headings 6 words at most, text blocks 20 words at most. Every
  fact matches the README; no versions, file sizes, changelogs, spec tables, RAM figures, checksums or star counts.
- Every scene plays by itself while at least 35% of it is on screen, pauses off screen or in a hidden tab, holds its
  last frame 1.8 s and cross-fades to the start in 0.4 s (`src/lib/playback.ts`). No replay buttons. Try it hands
  over to the visitor on any input and resumes its tour after 8 s without one.
- The drawn cursor measures its target with `getBoundingClientRect()` before every move (again on resize, font load
  and at every loop start), and the click step triggers the result: a miss changes nothing.
- Icons: 24 px grid, 1.75 px strokes, round caps. Each icon means its label and none appears twice in a list.
- Motion: reveals fade up 24 px with `cubic-bezier(.22, 1, .36, 1)`, 0.08 s apart, once. Loops stay under 12 s and at
  most two run at a time. Only `transform`, `opacity`, `clip-path`, filters and the canvas are animated.
- Every link that leaves the page opens in a new tab, except the download buttons: GitHub sends release files as
  attachments, so they save the file where the visitor is. Links within the page stay (`tests/links.spec.ts`).
- Checked at 360, 390, 768, 1024, 1440 and 1920 px in both themes, with no horizontal page scroll. Budgets on a phone:
  Lighthouse 90+, LCP under 2.5 s, CLS under 0.1, INP under 200 ms, first JavaScript under 150 KB gzipped, the frame
  stream fetches only the thumbnails on screen (about 40, 10 KB each), never the library.
- Never: orange, purple, gradient text, emoji, testimonials, invented numbers, section numbers like `006`, bento grids,
  horizontal scroll rails, YouTube logos or red play buttons, copied library components or library credits.

## Notes

- The features grid walks its cards on desktop and tablets (640 px and up); a turn lasts the longer of 4 s and the
  card's animation plus 0.6 s. Phones play the card nearest the middle.
- Each install step lasts exactly its label (`0:07`, `0:08`, `0:11` in `content.ts`). If a step's choreography grows,
  raise its label: the console warns when a step rests under 0.9 s on its last frame.
- The FAQ uses Radix Accordion without `forceMount`; with it, Radix doesn't re-render after measuring and nothing
  animates. Closed answers are therefore not in the static HTML (only the first one is).
- The backgrounds behind the hero and the final call to action (`src/scripts/frame-stream.ts`) draw real YouTube
  thumbnails from one library: `src/data/thumbs.json` (video ID, channel, title, source) with the pictures in
  `public/media/thumbs`, both made by `scripts/thumbs.mjs` from popular channels' regular uploads (no Shorts). One
  pool hands them out (`src/lib/thumb-pool.ts`): a thumbnail belongs to one tile at a time, so none shows twice on the
  page; one that just left rests a while; one whose file fails is replaced. Adding pictures means running the script
  again (or adding entries); the animation doesn't change. The hero's drift down in depth layers, the final call to
  action's circle its button on a tilted ring, both laid out anew on every visit. Downloads fly into the section's
  download button (measured each frame) on a second canvas above the text wash, and the button wiggles when they
  land.
- Try it's thumbnail, subtitle and screenshot buttons save real files (`src/islands/demo/save.ts`): the thumbnail from
  YouTube's image server (it allows any site to fetch it), the largest size the video has; the subtitles from tracks
  `scripts/subs.mjs` saves next to the page with yt-dlp (YouTube doesn't let another site fetch them; the video has
  none and says so, the Short has YouTube's automatic English ones); a PNG of the film's current frame.
  `tests/demo-files.spec.ts` checks each file.
- Astro scopes every class in a component's `<style>`, also `.js` and `.in` set on other elements: page-level hooks
  need `:global(.js)`.
- Building needs Node 22.12 or newer. On an older Node, npm skips Rolldown's native binary and the build fails with
  "Cannot find native binding".
- One test fails now and then when the whole suite runs in parallel and passes on its own: `cursor.spec.ts` "input
  stops the tour, 8 s of quiet resumes it".

## Deploy

`.github/workflows/site.yml` builds, type-checks, runs Lighthouse (phone) and the cursor tests, and publishes to GitHub
Pages on every push to `site/`, `docs/images/` or `CHANGELOG.md`, after every release and once a day.
