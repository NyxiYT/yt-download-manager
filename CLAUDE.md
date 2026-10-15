# YT Download Manager: Project Context

This file is the shared memory for every PC and every Claude Code session.
Personal Claude memory and old chats are NOT shared between PCs. This file is, through git.

## How to use this file
- Start of every session: `git pull`, then read this file. For website work, also read `site/BRIEF.md`.
- End of every session: add a dated line to "Status log" at the bottom, update "Decisions" if anything changed, then commit and push.
- If this file and the code disagree, the code and README win. Fix this file.
- Facts marked (check) were not verified in the code yet. Verify before relying on them.

## Owner
- Nyxi (GitHub: NyxiYT), apprentice application developer in Austria.
- Uses Claude Code on several PCs. Changes are made through prompts to a coding agent.
- Wants: compact answers, clear steps, nothing invented. Ask before big or irreversible changes.

## Product in one paragraph
YT Download Manager is a free, open-source (MIT) YouTube downloader for Windows.
It has two parts: a **browser extension** that adds a toolbar under every YouTube video and a Download button beside every Short,
and a **Windows app** that does the downloading in the background with yt-dlp and FFmpeg.
No ads, no account, no tracking.

## Links
- Repo: https://github.com/NyxiYT/yt-download-manager
- Website: https://nyxiyt.github.io/yt-download-manager/
- Latest release: https://github.com/NyxiYT/yt-download-manager/releases/latest
- Release assets (stable names, use `/releases/latest/download/<name>`):
  - `YTDownloadManager-Setup-x64.exe` (Windows 64-bit)
  - `YTDownloadManager-Setup-x86.exe` (Windows 32-bit)
  - `YTStandaloneDownloader-Extension.zip` (extension only, Linux or without the app)
  - `yt-standalone-downloader.user.js` (Tampermonkey userscript)
  - `SHA256SUMS.txt`

## Repo map
| Path | What it is |
|---|---|
| `extension/` | Browser extension source ("YT Standalone Downloader"). Toolbar, menus, Shorts button, history panel |
| `extension-build/` | Extension build output or build tooling (check) |
| `manager/` | Windows app source (the "Download Manager") |
| `site/` | Website (Astro), deployed to GitHub Pages |
| `docs/` | `ARCHITECTURE.md` (local API, pairing, data storage, threat model) and `docs/images/` (screenshots) |
| `bucket/` | Scoop bucket manifest |
| `.github/` | Workflows (builds, releases, Pages) |
| `yt-standalone-downloader.user.js` | Userscript version |
| `CHANGELOG.md`, `README.md`, `PRIVACY.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE` | Project docs |
| `package.json`, `eslint.config.mjs` | JS tooling |

## Tech facts
- Windows app needs .NET Framework 4.8 (built into Windows 10 1903+ and 11). Likely C# (check).
- Installer bundles yt-dlp, FFmpeg, and Deno (64-bit) or Node.js (32-bit). yt-dlp updates itself about weekly.
- Installs per user, no admin rights. Installer offers Update, Repair, Uninstall when opened again.
- App starts with Windows, sits in the system tray, follows Windows light or dark mode.
- App self-updates (since 1.9.0). The extension updates itself with the app once no YouTube tab is open.
- App checks GitHub for updates at most every 10 minutes when used, every 12 hours otherwise. Can be turned off under Advanced.
- Advanced also allows using your own `yt-dlp.exe`.
- Extension talks only to YouTube, the local app, and jsDelivr (to fetch ffmpeg.wasm when the browser must convert). Includes lamejs for MP3.
- The extension finds the app by itself. App window shows `Connected` or `Not connected`.
- Installers are NOT code-signed. SmartScreen shows "Windows protected your PC": More info, then Run anyway.
- 10 languages in extension and app: EN, DE, ES, FR, IT, PT, PL, RU, JA, ZH.
- Supported: Windows 10 and 11 (x64, x86, ARM via emulation). Browsers: Chrome, Edge, Chromium, Brave, Opera, Vivaldi, version 111+. Not Firefox. No app for Linux or macOS. Extension alone works on Linux, untested on macOS.
- Without the app, the extension usually gets up to 1080p. With the app: up to 4320p (8K), 60 fps, HDR. 1440p and up need the app.

## Features (source of truth: README)
Downloading: up to 8K with 60 fps and HDR (highest preselected), audio as MP3 320 kb/s with cover art or M4A, Opus, WAV, clips via start and end time (Trim), thumbnails, subtitles, screenshots of the current frame, Shorts button with the same choices, age-restricted and members-only videos via the browser's own sign-in.
App: any download folder (default Downloads), parallel parts for speed, resume after tab close or restart, slows down when your video needs bandwidth, parallel downloads 1 to 4 and optional speed limit, optional retry with YouTube sign-in when YouTube suspects a bot.
Watching: download history (clock button in YouTube's top bar, progress ring), Big Picture, picture-in-picture for Shorts, back and forward through Shorts, loop, theme switch.

## How the user flow works
1. Toolbar under the video: camera button (video), music note button (audio), more buttons for thumbnail, subtitles, screenshot (check exact order in `extension/`).
2. Camera: pick a Quality (size shown), optional Trim with two dots, Download.
3. Shorts: Download button above YouTube's like button, menu with video, audio, thumbnail, subtitles, screenshot.
4. History: clock button in YouTube's top bar, folder icon opens the file's folder.
5. Settings: app window ("Saving to", Change…, Advanced, Diagnostics) and extension Options (language, hide toolbar, "Send downloads to the Download Manager").

## App UX principles (from Nyxi)
- Installer as simple as possible: open, install, done, open the app. Short texts, no technical explanations.
- After a download: minimal feedback. No technical details like "720p" or video IDs in messages or file names (file name like `Example Video.mp4`).
- Download status and output belong at the top right, directly left of the history icon. Not bottom left.
- History panel shows active, finished, paused, and failed downloads.
- One distinctive app icon, the same everywhere (EXE, installer, taskbar, Start menu, extension).

## Legal and money (copy exactly from README, never retype)
- Legal note: only download videos you are allowed to. Not affiliated with YouTube or Google.
- Donations: BTC and USDT (Ethereum, ERC-20 only) addresses and QR codes are in the README "Support the project" section and `docs/images/donate-*.png`. Always copy them from there. A typo loses money.

## Website: current state (checked 15 Oct 2026)
- Astro static site in `site/`, GitHub Pages.
- Fonts: Funnel Display, Onest, JetBrains Mono. Accent is already blue. Dark theme default. Theme and "Reduce motion" are icon buttons in the nav (`site/src/components/Toggles.astro`), in the menu on phones.
- Liquid glass nav (SVG displacement, Chromium, blur fallback elsewhere).
- Interactive guided tour of the toolbar using a Big Buck Bunny frame (CC BY 3.0, Blender Foundation).
- About 4,500 words in 15 sections: hero with download block, trust row, language marquee, "Two parts, one tool", 5 how-to chapters, 24-feature list, with vs without app comparison, numbers, 8-step install with checksums and Scoop, compatibility tables, "What's new" (last 5 releases), FAQ, "From the maker" with donations, final download block, footer with credits.
- Uses effects modeled on Magic UI and React Bits, credited in the footer.

## Website: redesign decisions (full spec in `site/BRIEF.md`)
- Goal: install the app, and support the project. Customer-facing only.
- Accent: **blue** (`#3D7BFF`). No orange, no purple.
- Copy: very compact. Under 500 visible words, headings 6 words max, body blocks 20 words max. Exact copy is in the brief.
- Removed from the site (stay on GitHub): versions, changelog, spec and compatibility tables, RAM figures, checksums, Scoop, star counts, section numbers like `006`, long FAQ.
- Hero: the frame stream (Canvas 2D, `site/src/scripts/frame-stream.ts`) behind a sharp vector rebuild of the player and toolbar. Intro loops while in view (no replay buttons anywhere).
- Only ONE fully interactive showcase: "Try it". Everything else plays by itself.
- No raster screenshots: every app, extension, and installer screen is rebuilt as HTML, CSS, and SVG from the source code.
- Showcase cursors must hit their targets: measure with `getBoundingClientRect()`, never hardcode coordinates, verify with Playwright at 390, 768, 1280, 1920 px.
- Network-style diagram explains extension to app to folder (ping, handshake, `Connected`).
- Custom cursor (desktop only), custom animated icon set (hover, press, success states).
- Build all components ourselves. Library sites are inspiration only. No library credits in the footer.
- Animations always run, regardless of OS reduced-motion settings. The nav's "Reduce motion" button stays, off by default.
- Stack: Astro, React islands, TypeScript, Tailwind v4, Motion, GSAP ScrollTrigger, Lenis, Radix primitives, Playwright.
- Work in phases: research board, tokens and nav, hero, Try it, diagram, features and install, FAQ and support, performance and tests.

## Open issues
- Some videos fail with "No downloadable video formats" (noted early October 2026, check if still open).
- Installers are unsigned (SmartScreen warning).
- Section 14 of `site/BRIEF.md`: all 12 fixes done. Still open from BRIEF section 13: research board update, the list of vector screens next to `docs/images/`, the self-review against section 12, before/after screenshots.
- `site/public/media/back.{avif,webm,mp4}` (the old blurred background film) are no longer used by the page. Delete them only after asking Nyxi.
- Astro scopes every class in a component `<style>`, including `.js` and `.in` on other elements. Page-level hooks need `:global(.js)`. The feature chips' reveal (`Features.astro`, `.js .chips`) has this bug and never runs.
- Feature card mini-scenes are the old ones, now 4:3. Their animations run 1.8 to 4.2 s, not all a clear 4 s story yet (BRIEF 8.6 examples). The card icons are still wrong (Members uses a clock, refresh is used twice): fix #12.
- Building needs Node 22.12+. If npm runs on an older Node, it skips Rolldown's native binary and the build fails with "Cannot find native binding". Reinstall with Node 22.

## Working rules for Claude Code
- Read before writing. Never guess file contents.
- Never invent features, numbers, or quotes. The README is the source of truth for product facts.
- Small, reviewable commits with clear messages.
- Run lint and tests before saying something is done.
- Ask before deleting files, rewriting history, or publishing a release.

## Decisions
- 2026-10-13: Website gets a full redesign. Focus on customers, not developers.
- 2026-10-14: Accent switches from orange to blue. Copy cut to under 500 words. Own components only.
- 2026-10-14: Screens rebuilt as vectors. Only "Try it" is interactive. Cursor accuracy rules and Playwright tests added.
- 2026-10-15: This CLAUDE.md is the shared context across all PCs.
- 2026-10-15: One playback model for all scenes (`site/src/lib/playback.ts`, React hook `site/src/islands/playback.ts`). The hero's file pill flies to the nav only on the first loop.
- 2026-10-15: Features spotlight lives in `site/src/scripts/features.ts`. A walk turn is max(4 s, animation + 0.6 s).
- 2026-10-15: Install steps last exactly their label (`InstallSteps.tsx` pads each step with a rest on its last frame). Labels changed to `0:07`, `0:08`, `0:11` so every step rests at least about 1.1 s. If a step's choreography grows, raise its label in `content.ts`: the console warns when the rest drops under 0.9 s.
- 2026-10-15: FAQ uses Radix Accordion without `forceMount`. With it, Radix never re-renders after measuring, so `--radix-accordion-content-height` lags and nothing animates. Trade-off: closed answers are not in the HTML until opened (only the first answer is in the static page).
- 2026-10-15: Frame stream tiles are stills of the film already in the repo (Big Buck Bunny, CC BY 3.0, already credited), meadow and trees only (no clouds), made by `site/scripts/tiles.mjs` with Chrome and sharp (no FFmpeg). 8 tiles per theme, 52 KB. Fixes #6 and #7 were done together: the hero and CTA text now use theme tokens. Tablets (640 to 1023 px) use the walk like desktop, and phones (under 640 px) play the card nearest the middle.

## Status log
- 2026-10-15: Created CLAUDE.md. Site redesign is in progress and already blue. Next step: put BRIEF v2 at `site/BRIEF.md`, then do its section 14 fixes in order.
- 2026-10-15: Added CLAUDE.md and BRIEF v2 at `site/BRIEF.md` to the repo (committed on main, not pushed: gh on this PC is signed in as another account). Next step: BRIEF section 14 fixes in order, starting with #1 (playback hook, remove Replay buttons).
- 2026-10-15: BRIEF section 14 fix #1 done: shared playback hook (35% visible, pause off screen or hidden tab, hold 1.8s, 0.4s cross-fade), Replay buttons removed, Try it guided tour with takeover and 8s resume, diagram and feature cards loop. Also fixed the Shorts picker jumping on phones. Build, `astro check` and 24 Playwright tests pass (Node 22, Chrome). Committed, not pushed. Next: fix #2 (features grid with spotlight cycle).
- 2026-10-15: BRIEF section 14 fix #2 done: features rail replaced by a 3/2/1-column grid with a spotlight walk, hover takeover, and nearest-card play on phones. No horizontal scroll at 360 to 1920 px. 32 Playwright tests pass. Committed, not pushed. Next: fix #3 ("No more converter sites").
- 2026-10-15: BRIEF section 14 fix #3 done: "No more converter sites" rebuilt (heading on top, 960 px table, equal columns, no icons, short copy from BRIEF 9, strike then fade-in once, cards on phones). Its reveal never worked before (scoped `.js`); fixed. 35 Playwright tests pass. Committed, not pushed. Next: fix #4 (install auto-advance).
- 2026-10-15: BRIEF section 14 fix #4 done: install steps auto-advance 1, 2, 3, 1 with progress lines; a click pins and loops a step; "Play all steps" and leaving the section resume the walk; illustration above steps on phones. 40 Playwright tests pass. Committed, not pushed. Next: fix #5 (FAQ accordion animation).
- 2026-10-15: BRIEF section 14 fix #5 done: FAQ opens and closes with a 260 ms height animation (Radix variable), the answer fades in and rises 6 px, the plus turns 45° into a cross, one open at a time. 41 Playwright tests pass. Committed, not pushed. Next: fix #6 (frame stream backgrounds for hero and CTA).
- 2026-10-15: BRIEF section 14 fixes #6 and #7 done: the frame stream replaces the background film in the hero and the final CTA (particles fall into a glow at the bottom or onto the CTA button), seamless mask fades, real light theme for both. 45 Playwright tests pass. Next: fix #8 (the empty band above the nav, nav 16 px from the top).
- 2026-10-15: BRIEF section 14 fix #8 done: the 54 px band above the nav came from the skip link (`.btn` overrode its `position: fixed`) plus the nav's top margin passing through the zero-height sticky shell. The hero now starts at the top edge; the nav floats 16 px (12 px on phones) via `top`. 48 Playwright tests pass. Next: fix #9 (theme and Reduce motion toggles into the nav).
- 2026-10-15: BRIEF section 14 fix #9 done: Theme (sun morphs into moon) and Reduce motion (speed lines pull in, aria-pressed) are icon buttons with tooltips in the nav, in the menu on phones, remembered in localStorage; removed from the footer. 53 Playwright tests pass. Next: fix #10 (categorized footer).
- 2026-10-15: BRIEF section 14 fix #10 done: categorized footer (brand line and small Download, Product / Help / Project / Legal with the brief's links, legal left and film credit right under a hairline). Support section got `id="support"` for its footer link. 55 Playwright tests pass. Next: fix #11 (shared arrow cursor).
- 2026-10-15: BRIEF section 14 fix #11 done: the visitor's cursor is the showcases' arrow (`site/src/lib/arrow.ts`), placed 1:1 on every pointer move, with hover halo, press ripple, "Try it" pill, download arrow, grab hand on trim handles, native I-beam in text fields; native cursor back on keyboard navigation. Press scale unified at 0.9. 59 Playwright tests pass. Next: fix #12 (icon meanings).
- 2026-10-15: BRIEF section 14 fix #12 done: feature card icons are now res (8K), resume (Keeps going), bolt, yield (Your video comes first), lock (Members), refresh (Updates itself); new icons in `site/src/lib/anim-icons.ts` with hover motions in `icons.css`. No icon repeats in a list. 62 Playwright tests pass. All of section 14 is done. Next: BRIEF section 13 deliverables, and the open issues above (unused `back.*` files, chips reveal).
