# Self-review (BRIEF section 13, item 6)

The page after revision 2 (all of section 14), checked on 15 Oct 2026 against the brief's section 12 ("Never") and
its other requirements: what was found, what was fixed, and what is still open or unmeasured. Checks were done in
Chrome with Playwright (`site/tests/`, 62+ tests) and by looking at screenshots of every section in both themes.

## Section 12, item by item

| Never | Found | Fixed / status |
|---|---|---|
| Orange, purple | The extension's amber is defined in its palette but unused; no purple anywhere (source grep) | — |
| Neon glow, gradient text, emoji | None (no `background-clip: text`, no emoji in the source); glows are soft accent light | — |
| Version numbers, changelogs, spec tables, RAM figures, checksums, star counts | None visible; "Star on GitHub" is a button, not a count | — |
| Testimonials, invented numbers | The quote is the maker's own (BRIEF 9); no figures beyond the README's | — |
| Section numbers like `006` | None; the install steps are numbered because their order is real | — |
| Bento grids of icon boxes | Features are an equal 3 × 2 grid of live mini-scenes, not icon boxes | Fix #2 |
| Raster screenshots of the app | None; see `SCREENS.md`. Raster media: the film, its 16 small tiles, the social preview | — |
| Replay buttons | None (test: `playback.spec.ts`) | Fix #1 |
| Horizontal scroll rails, drag scrollbars | None; no sideways scroll at 360–1920 px (test) | Fix #2 |
| The same icon repeated down a list | The Members card had a clock and refresh was used twice | Fix #12 (test: `icons.spec.ts`) |
| Icons that do not match their meaning | Same as above; "Up to 8K" had a download arrow | Fix #12 |
| Cramped table columns, 3+ line cells | "No more converter sites" wrapped to 3–4 lines | Fix #3; one line per cell at 1280 px (test) |
| Visible section edges | Hero and CTA backgrounds ended in hard edges | Fixes #6, #7: mask fades |
| Dark blocks in light mode | Hero and CTA backgrounds; then, found in this review: the Try it demo, the install screens, the diagram's video picture, the "Your video comes first" player | All have light versions now: the extension's and the app's own light palettes, light Windows and browser screens |
| An empty band above the nav | 54 px from the skip link and the nav's margin | Fix #8 (test: `top.spec.ts`) |
| A lagging or trailing cursor | The dot and spring ring | Fix #11: the arrow sits on the pointer 1:1 (test) |
| Cloud or landscape backgrounds | The frame stream's tiles are small stills of the film showing its meadow and trees (clouds left out) | Kept: Nyxi judged they read as film frames, not a landscape (15 Oct 2026) |
| More than one interactive demo | Only Try it | — |
| A showcase cursor that clicks beside its target | None at 390, 768, 1280, 1920 px (test: `cursor.spec.ts`) | One positioning bug found and fixed (Shorts picker) |
| Copy-pasted library components, library credits | None; references are listed in `RESEARCH.md` as study material only | — |
| YouTube logos or red play buttons | None; the page around the toolbar is neutral. The small red quality labels (`4K`, `8K`) are the extension's own | — |

## Other requirements

- **Copy:** 479 visible words (limit 500), see `CHECKLIST.md` for how it was counted. Headings 6 words or fewer.
- **First JavaScript:** 123 KB gzipped for the first view without interaction (budget 150 KB), measured in Chrome.
- **Loops:** every scene runs under the shared playback model (35 % visible, paused off screen and in hidden tabs,
  1.8 s hold, 0.4 s cross-fade). Longest loop: install step 3, 11 s (under 12 s). At the top of the page two run at
  once (the hero's demo and its frame stream); elsewhere one or two. Not covered by a test.
- **Feature mini-scenes:** four were lengthened to tell their story in about 3–4 s ("Up to 8K" ends on its
  60 fps · HDR tag, "Updates itself" starts with the new-version row arriving). Each card's turn in the spotlight
  is at least 4 s.
- **Chips under the features:** their scroll reveal never ran (Astro scoped `.js`); fixed.

## Not measured in this pass

- **Lighthouse** (90+ on mobile, LCP, CLS, INP): not run after revision 2. `lighthouserc.json` is in the repo.
- **Before and after screenshots of each fix** (section 13, item 1): not made. The "before" state is commit
  `6ebf62b` and can be built from it.
- **Other browsers:** the tests run in Chrome only; Safari and Firefox were not checked (the glass nav and canvas
  blur have fallbacks, but they were not looked at).
- **The live site:** these checks ran on a local build, not on GitHub Pages.
