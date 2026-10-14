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
credited in the footer). The player in the hero and in Try it shows it sharp; behind the hero and the final call to
action runs a small copy that is already blurred and graded blue. Posters paint first; the videos start after the
page has loaded and stand still while off screen.

```sh
# Blender's own file: https://download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_30fps_normal.mp4.zip
npm run hero -- path/to/bbb_sunflower_1080p_30fps_normal.mp4
```

Why not an 8K film: no Blender open movie is on YouTube above 4K (Charge 3840×1608, Big Buck Bunny 2160p60), so the
hero highlights Big Buck Bunny's real top row, `2160p60 4K`, and the headline says "Up to 8K".

## Rules the page keeps

- No raster pictures of the app, the extension or the installer: every screen is HTML, CSS and SVG, with its real
  labels. The only raster media are the film (and its posters) and the social preview image.
- One interactive section (Try it). Everything else plays by itself; the drawn cursor in the hero and the install
  loops must hit what it clicks, which `tests/cursor.spec.ts` checks at 390, 768, 1280 and 1920 px.
- Motion is on for everyone; the footer's "Reduce motion" turns it off. The system setting isn't read.
- Blue only: `#3D7BFF` for accents, `#2F6BF0` under white text (AA). The product mockups keep the product's own colours.

## Deploy

`.github/workflows/site.yml` builds, type-checks, runs Lighthouse (phone) and the cursor tests, and publishes to GitHub
Pages on every push to `site/`, `docs/images/` or `CHANGELOG.md`, after every release and once a day.
