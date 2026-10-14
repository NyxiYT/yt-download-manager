# Website

The website of YT Download Manager: https://nyxiyt.github.io/yt-download-manager/

One static page built with [Astro](https://astro.build). The parts that move are React islands, hydrated when they
come into view: the demos of the toolbar, the showcase, the line between the extension and the app, the comparison,
the counting numbers, the install tabs and the FAQ. No tracking, no cookies, no third-party requests: fonts,
pictures and videos are served with the page.

The look is called **The J-Card**: the page is the paper insert of a cassette case, like the app's icon. It has ruled
rows, counter digits for section numbers, Side A and Side B, and one accent, the icon's tape red. The product
mockups keep the extension's own colours.

## Run it

Node.js 22.12 or newer.

```sh
cd site
npm ci
npm run dev       # http://localhost:4321/yt-download-manager/
npm run check     # TypeScript and Astro checks
npm run build     # the site in site/dist
npm run preview   # serves site/dist at http://localhost:4321/yt-download-manager/
```

To run Lighthouse the way the deploy does (needs Chrome): `npm run build`, then
`npx @lhci/cli@0.15.1 autorun --config=lighthouserc.json`. Reports go to `site/.lighthouseci/` (not committed).

## Where things are

| | |
|---|---|
| `src/lib/content.ts` | Every text on the page, taken from the README (most sentences word for word). Change copy here. |
| `src/lib/release.ts` | The latest version, its date and the installer sizes, read from the GitHub API while building (`GITHUB_TOKEN` raises the rate limit). Without the API, the version and date come from `CHANGELOG.md` and the sizes are left out. |
| `src/lib/changelog.ts` | "What's new": the last five releases, read from `CHANGELOG.md`. |
| `src/data/videos/*.json` | What the toolbar's pickers list for each demo video: generated from yt-dlp's real answer by `npm run formats` (see below). |
| `src/data/recordings.json` | The encoded recordings of the real app, written by `npm run media`. |
| `src/layouts/Base.astro` | `<head>`: title, description, Open Graph and Twitter tags, canonical URL, JSON-LD (`SoftwareApplication`, `FAQPage`), fonts, and the script that sets theme, system and motion before the first paint. |
| `src/components/` | The sections of the page, top to bottom as in `src/pages/index.astro`. |
| `src/islands/Demo.tsx`, `src/islands/demo/` | The extension's interface rebuilt for the page: a typed state machine (`model.ts`), the parts (`parts.tsx`), and the guided tour. |
| `src/styles/ysd.css` | The extension's own CSS (`extension/content/content.css`), scoped to the demos. Keep the two in step. |
| `src/styles/global.css` | The design tokens (colours, type, radius) for dark and light, and the shared classes. |
| `src/scripts/` | Small scripts without React (`ui.ts`), smooth scrolling and title reveals (`scroll-engine.ts`), the nav's glass (`glass.ts`), the version refresh (`live.ts`). |
| `src/directives/lazy.ts` | `client:lazy`: hydrates the hero's demo after the first paint, so React stays out of it. |
| `scripts/` | `formats.mjs` (picker data), `frames.mjs` (the pictures inside the demos), `subset-cjk.mjs` (the Japanese and Chinese words of the marquee), `encode-media.mjs` (the recordings). |
| `public/` | Copied as is: the Search Console file, `sitemap.xml`, the CJK font subsets, and the recordings once encoded. |

Screenshots come from `../docs/images`, the same files the main README uses; Astro makes AVIF and WebP versions in
the sizes the page needs. All of `docs/images` is also copied to `images/` in the build, so addresses other sites
use (the link preview picture, the icon in the structured data) keep working.

## Keeping the demos true

The demos must offer exactly what the real toolbar would. Three things keep them honest:

- **Labels, sizes and formats** come from yt-dlp's answer for the video, run through the same rules the app
  (`Media.Summary` in `manager/YTDownloadManager/Downloads/Media.cs`) and the extension (`appVideoOpt` and the audio
  list in `extension/content/content.js`) use. `scripts/formats.mjs` is a port of that code; if either changes,
  change the script and run it again:

  ```sh
  yt-dlp -J "https://www.youtube.com/watch?v=<id>" > video.json
  node scripts/formats.mjs video.json            # writes src/data/videos/<id>.json
  npm run formats                                # the test fixtures in manager/Tests/Fixtures/info
  ```

- **The look** is the extension's CSS (`src/styles/ysd.css`), with the same sizes, radii, easing and timings, and its
  icons (`src/lib/icons.ts`). The only difference: Arial instead of YouTube's Roboto.
- **The words** in the pickers, menus and history are the extension's English strings (`extension/content/i18n.js`).

The hero runs on *Big Buck Bunny* (YouTube offers it up to 2160p60), with its real quality list from the test
fixture. To make the hero show an 8K video, use a video that YouTube serves at 7680×4320 and that you may show,
run `formats.mjs` on it, cut a frame into `src/assets/frames/`, and point `Hero.astro` at both.

## Recordings of the real app

Each chapter of the showcase has "Try it" (the demo) and "The real app". Until a chapter has a recording, "The real
app" shows the README's screenshot for it.

Recorded so far: `video`, `trim`, `audio` and `shorts`. `history` isn't: YouTube answered the recording browser
with "Sign in to confirm you're not a bot" while the download ran, so that chapter shows
`docs/images/download-history.png` for now. Its entry in `shots.json` is a placeholder; set its crop once it's recorded.

1. Record the shots below. Put the raw files in `site/recordings/raw/` (they're not committed).
2. Set where each clip starts, how long it runs and what to crop in `site/recordings/shots.json`.
3. Run `npm run media` (needs FFmpeg on `PATH` with libx264, libsvtav1 and AVIF, e.g. the gyan.dev full build).

That writes `public/recordings/<chapter>.mp4` (H.264), `.webm` (AV1) and `-poster.avif`, muted and up to 1600 px wide,
and lists them, with their width and height, in `src/data/recordings.json`. The page plays a clip only while it's on screen, never with
"Reduce motion" on, and uses the label from `shots.json` as its text alternative.

### Shot list

Setup, once:

- The four clips on the page were taken from a 1440×900 headless Chrome over the DevTools protocol
  (`Page.startScreencast`, frames joined by FFmpeg), with a copy of the extension pointed at a separate copy of the
  app (its own data folder and port), so nothing of a real profile shows. OBS works as well: Window Capture of
  Chrome; canvas and output 1920×1080 at 60 fps; record to MKV with x264 CRF 14 (or NVENC CQP 16); mute every
  audio source.
- Windows display scaling at 100 %; Focus assist on (no notifications); download folder `C:\Users\Public\Downloads`
  (as in the README's screenshots), so no user name shows.
- A fresh Chrome profile with only the extension; YouTube in dark mode and English; bookmarks bar hidden. Move the
  mouse slowly and straight to each target.
- Hold still for a second before and after each action, and record every shot two or three times.

| Shot | Scene | Length | Crop | What to click |
|---|---|---|---|---|
| `video` | Player and toolbar, video paused at about 01:20 | 10 s | 1012×632 | Camera button → open Quality → pick the top quality → Download → move to the clock button as its ring starts to fill |
| `trim` | The video picker open | 8 s | 1012×632 | Drag the start dot to 01:20 and the end dot to 04:05, until the summary reads "Clip · 2:45" → Download |
| `audio` | Player and toolbar | 8 s | 1012×632 | Music note → open Format (MP3 320, 192, 128, M4A, Opus, WAV) → MP3 320 kb/s → Download |
| `shorts` | A Short you may show, with no third-party logos | 6 s | 898×852 | Download beside the Short → the menu opens → Download video |
| `history` | Top bar, one download running | 12 s | 1200×900 | Clock button with the ring filling → panel opens → the item turns Completed → folder icon → the folder opens with the file selected (hold 1.5 s) |

Use *Big Buck Bunny* (CC BY 3.0, as in the README's screenshots) or another video you may show.

## Deploy

`.github/workflows/site.yml` builds the site, runs Lighthouse (as a phone; accessibility, best practices and SEO
must stay at 90 or more, performance is reported) and publishes it with GitHub Pages. It runs when `site/`,
`docs/images/` or `CHANGELOG.md` change on `main`, after every release, once a day and by hand. It needs
**Settings → Pages → Source: GitHub Actions**.

## Rules the page keeps

- Only real facts about the app, from the README, CHANGELOG, PRIVACY, the source and the GitHub API. No invented
  numbers, quotes, logos or features. No star count while it says little.
- Motion is on for everyone; the footer's "Reduce motion" switch turns it off at once and is remembered. The system
  setting isn't read, by choice.
- Keyboard: every control can be reached and used, with a visible focus ring. The demos' buttons are real buttons;
  on phones the demos play as illustrations (their real-size buttons would be too small to tap).
- Only `transform`, `opacity`, `clip-path` and filters are animated, except the FAQ's folding (grid rows, like the
  extension's own history rows). Nothing moves the layout while the page loads (CLS 0).
- Lighthouse, last run (Moto G Power, simulated slow 4G): Performance 98, Accessibility 100, Best Practices 100,
  SEO 100; desktop 100 / 100 / 100 / 100. First load: about 130 KB of JavaScript (gzip) once the hero's demo
  hydrates, none before the first paint.
- No YouTube or Google logos, no red play button, no YouTube fonts.

## Credits

- Icons in the demos: Material Icons, rounded (Apache License 2.0), the same ones the extension uses. The site's own
  icons are drawn for it (`src/lib/site-icons.ts`).
- Fonts: Funnel Display, Onest, JetBrains Mono, and Noto Sans JP and SC for two words (SIL Open Font License), via
  Fontsource.
- The liquid glass of the nav follows the approach of [rizzytoday/liquid-glass](https://github.com/rizzytoday/liquid-glass)
  and [deepika-builds/liquid-glass](https://github.com/deepika-builds/liquid-glass) (both MIT). The marquee, the
  animated line and the number ticker follow [Magic UI](https://magicui.design) (MIT); the magnetic buttons and the
  split-text reveals follow [React Bits](https://reactbits.dev) (MIT). The accordion, tabs and slider are
  [Radix](https://www.radix-ui.com) primitives, used the shadcn/ui way (MIT).
- Astro, React, Tailwind CSS, Motion, GSAP and Lenis: their own licenses (MIT, or GSAP's standard "no charge" license).
- The pictures in the demos: *Big Buck Bunny*, © Blender Foundation, CC BY 3.0. The Shorts demo lists the qualities of
  a Short by Blender Studio (test fixture `short-portrait.json`).
