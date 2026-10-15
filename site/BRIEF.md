# YT Download Manager: Website Redesign Brief (v2, 15 Oct 2026)

This brief replaces v1. Section 14 lists the fixes for the current local build. Do section 14 first, then keep every other section true while you work.
After each session, update `CLAUDE.md` (Decisions and Status log), then commit and push.

## 1. Goal
A product site a visitor understands in 5 seconds and downloads from in 2 clicks.
Two jobs only: get people to **install the app** and get happy users to **support the project**.
Everything technical (versions, changelogs, specs, checksums, test matrices) lives on GitHub, linked from the footer and the install section.

Feel: calm, dark, cinematic, blue. One wow moment at the top, satisfying micro-interactions everywhere else. Designed by a human studio, never generated.

## 2. Current build: what works and what is wrong
Analysis of the current build (already blue).

**Works, keep it:**
- Blue accent, compact copy, the toolbar rebuilt as vectors, the quality list and feature mini-scenes, liquid glass nav, the overall type scale.

**Wrong, fix it (details in section 14):**
1. Animations play once and stop. Visitors must press Replay, so sections look frozen or broken afterwards.
2. Features ("Built for how you watch") is a horizontal rail with a drag scrollbar. Bad UX on desktop.
3. "No more converter sites": the right column is too narrow, text wraps to 3 or 4 lines, the same download icon repeats on 3 rows.
4. Install stepper does not advance by itself. The illustration sits still.
5. FAQ opens and closes with no animation.
6. Hero and final CTA backgrounds (blurred clouds, plain blue glow) have nothing to do with downloading.
7. Hero and CTA backgrounds end in hard edges. In light mode the hero is a dark block on a white page.
8. An empty white band sits above the nav. The nav sits too close to the top.
9. Theme and motion toggles live in the footer. Footer links are one flat row.
10. The custom dot and ring cursor trails behind the pointer and distracts.
11. Some icons do not match their meaning (the "Members and age-restricted" card uses a clock).

## 3. Research references
Open each in a real browser. Look at visuals and motion, not only text.

| Source | Takeaway for this site |
|---|---|
| FrameZero (framezero.app, Nuxt UI showcase) | Features as tiny live UI inside each card, about 10 words each. 3-step "how it works" with a visual per step |
| Fixa (fixaplan.com, Framer Gallery) | Hero video, one-sentence subline, the single CTA repeated after every 2 sections, 5-question FAQ |
| CodeSnap (codesnap.dev), Wiredash (wiredash.com), Nuxt UI showcase | Product video right after the hero. "Try it in your browser" section |
| Infisical (infisical.com), Anara (anara.com), Magic UI showcase | Hero shows real product UI rebuilt in HTML, tabs that switch live states |
| Atlas (youratlas.com), Framer Gallery | "Old way vs new way" comparison. Its long copy is the counter-example |
| Art Direction Daily #134 "The Community Listing" | App icon lockup plus one real action at the top. Captions that carry content |
| Art Direction Daily #147 "The Mod Listing" | Explain a layered system with a diagram where position does the explaining |
| websiteprompts.ai (game-studio, app-landing-page) | One signature element. Every section a different layout skeleton. Full copy in the brief. A "Never" list |
| Framer Academy | Lessons with a short clip and a duration label (`0:09`). Model for install steps |
| Framer Marketplace (plugins, vectors) | Listings are icon, name, one line |
| lucide-animated.com | Icon hover animation with Motion `pathLength` variants |

Also browse at least 15 showcase sites from the Framer Gallery, Nuxt UI showcase, Magic UI showcase, and 21st.dev "animated heroes", focused on software products and downloads. Look specifically for: auto-advancing steppers, feature grids with live previews, animated accordions, section transitions without hard edges, and subtle custom cursors.

## 4. Tech stack
Existing Astro project in `site/`.

```
Astro (static) + React islands + TypeScript + Tailwind CSS v4
Motion (motion/react) for UI animation, springs, gestures, layout
GSAP ScrollTrigger for pinned scroll sections only
Lenis for smooth scrolling, synced to the GSAP ticker
Radix primitives (Dialog, Accordion, Tabs, Tooltip) for accessibility only
Canvas 2D for the hero and CTA background engine
Fontsource for self-hosted fonts
Playwright for showcase and playback tests
```

Build every visual component yourself. Magic UI, React Bits, 21st.dev, shadcn, and lucide-animated are study material, not installs. No library credits in the footer.

## 5. Design system

```css
:root {
  --bg: #07080B;
  --surface: #0E1015;
  --surface-2: #151821;
  --line: rgba(237, 240, 247, 0.08);
  --text: #EDF0F7;
  --muted: #8B92A3;
  --accent: #3D7BFF;
  --accent-hi: #6E9BFF;
  --accent-glow: rgba(61, 123, 255, 0.35);
  --radius-s: 8px;
  --radius-m: 14px;
  --radius-l: 24px;
}
```
- Light theme: matching tokens, accent AA on white. **Every section, background, and illustration must have a designed light version.** Nothing may appear as a dark block on a light page.
- Blue only. No orange, no purple, no gradient text.
- Type: Funnel Display (headings), Onest (body), JetBrains Mono (labels like `4320p`).
- Body 17px minimum, 1.6 line height.

## 6. Copy rules
- Use the copy in section 9 word for word. If a line feels wrong, ask me.
- Headings 6 words max. Body blocks 20 words max. Paragraphs 2 lines max on desktop.
- Total visible copy under 500 words, FAQ answers excluded.
- Every fact must match the README. No version numbers, file sizes, changelogs, spec tables, RAM figures, checksums, or star counts on the page.

## 7. Signature elements

### 7.1 Hero background: the frame stream
Replace the blurred cloud footage with a background that shows downloading.
- 3 to 5 depth layers of 16:9 frame tiles (stills from Blender Studio open movies, CC BY, credit each film in the footer), graded into a calm blue duotone.
- Tiles drift slowly **downward**. Back layers are smaller, slower, and more blurred (2px to 14px). Front layers are sharper.
- Every few seconds one tile shows a thin progress line filling, then dissolves into small blue light particles that fall toward a soft glow at the bottom center. The glow is where downloads "land".
- Rendered in one `<canvas>` (Canvas 2D), device pixel ratio capped at 1.5, 30 fps cap on mobile, paused when off screen or when the tab is hidden.
- Tiles are tiny AVIF files (about 320px wide). No background video file.
- Light theme: pale tiles, soft blue glow, light ground.
- Foreground stays the same: the sharp vector player and toolbar (7.6), with the intro sequence looping per 7.7.
- If research finds a stronger idea that clearly says "downloading", propose it on the board. No landscapes, clouds, or generic gradients.

### 7.2 "Two parts, zero setup": network diagram
Read `docs/ARCHITECTURE.md` so it stays truthful.
- Three nodes: Browser extension, Windows app, Your folder. Custom illustrated nodes, not icons in boxes.
- Sequence: the extension pings (expanding ring), a dashed line draws to the app, a handshake packet goes and returns, the status chip flips from `Looking for the app…` to `Connected`, data packets stream to the folder, a file card drops in.
- Loops while in view (7.7). No replay button. No hover or click on nodes.
- GSAP pin on desktop, plain stacked animation on mobile.

### 7.3 Cursor
Replace the dot and ring. The visitor's cursor uses **the same arrow design as the showcase cursor**, so the page feels like one system.
- Arrow: white fill, 1px dark outline, soft small shadow, about 20px tall. Tracks the pointer 1:1 with no lag, no spring on position.
- Variants, all subtle and under 150ms:
  - **Hover** (links, buttons): a 10px blue halo appears at the tip.
  - **Press**: arrow scales to 0.9 and a 20px ring ripples out from the tip once.
  - **Try** (inside the Try it section only): a small pill `Try it` sits 14px below and right of the tip.
  - **Download buttons**: the pill shows a small down arrow instead of text.
  - **Drag** (trim handles in Try it): grab hand.
  - **Text** (inputs, selectable text): native I-beam.
- Only on devices with a fine pointer. Native cursor on touch, when the pointer leaves the window, and during keyboard navigation.
- One shared SVG component for the visitor cursor and every showcase cursor.

### 7.4 Animated icon set
Custom set matching the extension's own icons: download, camera, music note, scissors, Shorts, clock, folder, lock (members), no-ads, globe, refresh, bolt, pause, GitHub, heart, sun, moon, motion.
- 24px grid, 1.75px stroke, round caps.
- Hover: a short motion that means something (arrow drops, folder opens, globe turns, lock clicks shut, sun rays rotate). Under 400ms.
- Press: spring to 0.9 and back. Success: a checkmark draws in where it fits.
- **Every icon must match its meaning.** No icon used twice in the same list.
- Technique: Motion variants with `pathLength`.

### 7.5 Navigation
- Liquid glass (SVG `feDisplacementMap` through `backdrop-filter` on Chromium, blur and saturate fallback elsewhere).
- Floats **16px from the top** on desktop, 12px on mobile, over the hero. Condenses on scroll.
- **Remove the empty band above the nav.** Find its source (leftover announcement bar, body or main padding, scroll padding) and delete it. The hero starts at the very top of the page under the floating nav.
- Contents: logo, Features, How it works, Install, FAQ, then two icon buttons, then Download.
  - **Theme**: sun and moon icon that morphs. Tooltip `Light theme` or `Dark theme`. Remembers the choice.
  - **Reduce motion**: motion icon with `aria-pressed`. Tooltip `Reduce motion`. Off by default. Remembers the choice.
- Mobile: links and both toggles move into a menu sheet.
- Hosts the download progress ring from the hero intro.

### 7.6 Vector screens
No raster screenshots of the app, extension, or installer.
- Rebuild every screen as HTML, CSS, and inline SVG from the source in `extension/` and `manager/`. Use `docs/images/` only as a reference.
- Real text, reusable components with props for their states.
- Third-party screens (Windows dialog, browser extensions page) drawn neutral, without Microsoft, Google, or browser logos.
- The only raster media: hero and CTA frame tiles, and the social preview image.

### 7.7 Playback model (replaces replay buttons)
**No replay buttons anywhere.** Every animated scene plays by itself, loops, and pauses only when nobody can see it.

One shared hook (for example `useScenePlayback`) controls all scenes:
- Plays when at least 35% of the scene is visible (IntersectionObserver).
- Pauses when off screen or when the tab is hidden. Resumes where it stopped.
- Loop: play, hold the final state for 1.8s, cross-fade back to the start over 400ms, play again.
- The footer of every scene shows nothing extra. No controls unless listed below.

| Section | Behavior |
|---|---|
| Hero | Intro sequence loops while visible |
| Try it | Guided tour loops while visible. Any pointer or keyboard input inside takes over and pauses the tour. After 8s without input, a small `Resuming tour` hint shows and the tour continues from the current tab |
| How it works | Diagram loops while visible |
| Features grid | Spotlight cycle (8.6) |
| The old way | Rows reveal once on scroll. Static after that |
| Install | Auto-advancing steps (8.8) |
| FAQ, Support, Footer | Normal controls only |

Rules:
- Never two interactive demos on one screen.
- Things that look clickable but are not get no hover state and no pointer cursor.

### 7.8 Showcase accuracy and cursor choreography
Showcases may be stylized and simplified. They must be clean, satisfying, and never wrong.

**What may change:** simplified surfaces, fewer list items, calmer colors, zoomed framing.
**What must stay true:** button order, labels, icons, what each button does, where menus open, and the flow from the README's "How to use".

**Cursor rules**
- Never hardcode coordinates. Before each move, measure the target with `getBoundingClientRect()` and aim at its center, relative to the scene container.
- Re-measure on resize, font load, layout change, and at every loop start.
- Click sequence: move, pause about 150ms, target hover state, cursor press, target pressed state, then the result.
- The result is triggered by the click step, not a separate timer. A miss changes nothing.
- List selections highlight the exact row under the cursor, and that row stays selected.
- Paths curve gently and never cross unrelated controls.
- Drags move the handle 1:1 with the cursor.
- At loop reset, the cursor fades out, the scene resets, the cursor fades in. No teleporting.

**Verification:** Playwright tests assert the cursor center is inside the target's box at every click step, at 390, 768, 1280, and 1920 px.

### 7.9 Seamless section transitions
- No visible block edges between sections, in either theme.
- Hero and final CTA backgrounds fade into `--bg` with `mask-image` gradients on the background layer (bottom 30% for the hero, top and bottom 25% for the CTA). No overlay boxes.
- Section backgrounds share the page ground. Depth comes from light and blur, not from rectangles.
- Check both themes at all widths before calling a section done.

## 8. Sections (each a different layout)
1. **Nav:** see 7.5.
2. **Hero:** frame stream background (7.1), vector product in front. Text left on desktop, above on mobile.
3. **Trust line:** one row of 5 short items between hairlines. Not cards.
4. **Try it:** the only interactive section. Large vector demo with 5 tabs, caption under the player per tab.
5. **How it works:** network diagram (7.2).
6. **Features grid** (replaces the horizontal rail):
   - 3 columns by 2 rows on desktop, 2 columns on tablet, 1 column on mobile. No horizontal scroll, no scrollbar.
   - Each card: a vector mini-scene (4:3), an icon, a title, one line.
   - Each mini-scene tells one clear story in about 4s. Examples: "Keeps going" shows a tab closing, the bar pausing, then resuming. "Updates itself" shows a `New version` toast, a click on Update, a checkmark.
   - **Spotlight cycle (desktop):** one card plays at a time, in order, about 4s each, with a soft blue light on its border. Hovering a card plays and loops that card and pauses the cycle. Leaving resumes the cycle with the next card.
   - **Mobile:** the card closest to the viewport center plays.
   - Below the grid: one row of animated chips for the smaller features.
7. **The old way** (redesign):
   - Heading on top, comparison below at full content width (max 960px), not squeezed beside the heading.
   - Two equal columns, labelled `Converter sites` (muted) and `YT Download Manager` (blue).
   - 4 rows. **No icons.** Contrast comes from type: left in muted text, right in text color and medium weight.
   - Every cell fits on one line on desktop. Use the short copy in section 9.
   - On reveal, a thin strike line draws through each left item, then the right item fades in. Once.
   - Mobile: each row becomes a small card, left item small and struck through, right item below it.
8. **Install** (auto-advancing):
   - 3 steps on the left, vector illustration on the right.
   - Each step item has a thin progress line that fills over the step's loop duration (the label, for example `0:07`, must equal the real duration).
   - When a step finishes, the next one starts. After step 3, back to step 1.
   - Clicking a step stops auto-advance and loops that step's illustration. A small `Play all steps` link appears under the list to resume auto-advance. Leaving the section and coming back also resumes it.
   - Pauses when off screen.
   - Mobile: illustration above, steps below, same behavior.
9. **FAQ:** 5 questions, Radix Accordion. Opening animates height using `--radix-accordion-content-height` (260ms, ease out), content fades in and moves up 6px, the plus rotates 45 degrees into a cross. Closing reverses. One open at a time.
10. **Support:** compact split panel. Donate opens a dialog with QR codes, copy buttons, and the USDT network warning.
11. **Final CTA:** the frame stream (7.1) condensed, with fewer tiles, the particles falling toward the button. Seamless top and bottom fades (7.9).
12. **Footer** (categorized):
    - Left: logo, one line `Free YouTube downloader for Windows.`, small Download button.
    - Four link columns: **Product**, **Help**, **Project**, **Legal** (copy in section 9).
    - Bottom bar: legal line left, video credits right, a hairline above.
    - No toggles in the footer (they moved to the nav).

## 9. Full copy

**Nav:** Features · How it works · Install · FAQ · [theme icon] · [motion icon] · `Download`
Tooltips: `Light theme` / `Dark theme` · `Reduce motion`

**Hero**
- Eyebrow: `Free for Windows · Open source`
- H1: `Save any YouTube video. Up to 8K.`
- Subline: `A download button under every video. Pick the quality, click, done.`
- Primary: `Download for Windows`
- Secondary: `Watch it work`
- Small line: `Windows 10 and 11 · Chrome, Edge, Brave, Opera, Vivaldi`
- Linux or macOS: primary becomes `Get the browser extension`. Phones: `Open this page on your PC` with `Copy link`.

**Trust line:** `No ads` · `No account` · `No tracking` · `Open source` · `10 languages`

**Try it**
- H2: `Try it right here.`
- Sub: `Built from the real toolbar. Click anything.`
- `Video`: `Pick 144p to 8K. The best quality is already selected.`
- `MP3`: `Just the sound. MP3 with cover art, or M4A, Opus, WAV.`
- `Clip`: `Drag two handles. Keep only the part you need.`
- `Shorts`: `Every Short gets its own Download button.`
- `History`: `All downloads in one place. One click opens the folder.`
- Resume hint: `Resuming tour`

**How it works**
- H2: `Two parts. Zero setup.`
- `Browser extension`: `Adds the toolbar to YouTube.`
- `Windows app`: `Downloads in the background, even after you close the tab.`
- `Your folder`: `Files land in Downloads, or wherever you choose.`
- Footnote: `They find each other on their own.`

**Features**
- H2: `Built for how you watch.`
- `Up to 8K, 60 fps, HDR`: `Every quality the video has.`
- `Keeps going`: `Close the tab or restart. Downloads pick up again.`
- `Fast`: `Big files download in several parts at once.`
- `Your video comes first`: `Downloads slow down so your video never stutters.`
- `Members and age-restricted`: `If your account can watch it, the app can save it.`
- `Updates itself`: `One click installs new versions. The extension follows.`
- Chips: `Thumbnails` `Subtitles` `Screenshots` `Shorts in picture-in-picture` `Big Picture` `Loop` `Light or dark` `10 languages`

**The old way**
- H2: `No more converter sites.`
- Column labels: `Converter sites` · `YT Download Manager`
- `Pop-ups and redirects` → `No ads, ever`
- `Copy, paste, wait` → `One button under the video`
- `Quality often capped` → `Up to 8K with HDR`
- `Files pass through their server` → `Straight to your PC`

**Install**
- H2: `Set up in three steps.`
- `1 Download`: `Open the installer. If Windows warns you, click More info, then Run anyway.`
- `2 Install`: `Click Install, then Open. No admin rights needed.`
- `3 Add to browser`: `Click Add to browser. Turn on Developer mode, click Load unpacked, paste, select.`
- Resume link: `Play all steps`
- Under the steps: `Linux or no app? Get the extension on its own.` · `Full guide on GitHub`

**FAQ**
- `Is it really free?` `Yes. Free and open source. No ads, no account, no tracking.`
- `Why does Windows warn me?` `The installer isn't signed with a paid certificate yet. Click More info, then Run anyway.`
- `Where do my files go?` `Your Downloads folder. You can change it anytime in the app.`
- `Does it work on Mac or Linux?` `The app is Windows only. The extension works on its own on Linux. Mac is untested.`
- `A download failed. What now?` `Open the clock button to see why and retry. Still stuck? Report it on GitHub.`

**Support**
- H2: `Made by one person.`
- Quote: `"I made this because I hate adware and bloated downloaders." NyxiYT`
- Line: `Free, built in my spare time. If it saves you time, chip in.`
- Buttons: `Donate` · `Star on GitHub`

**Final CTA**
- H2: `Stop pasting links.`
- Line: `Get the button under every video.`
- Button: `Download for Windows`

**Footer**
- Brand line: `Free YouTube downloader for Windows.`
- **Product:** Download · Features · How it works · Install
- **Help:** FAQ · Full guide · Report a bug
- **Project:** GitHub · Changelog · Support the project
- **Legal:** Privacy · License · Third-party licenses
- Legal line: `Only download videos you're allowed to. Not affiliated with YouTube or Google.`
- Credits: each Blender film used in the frame stream, with its license.

## 10. Motion
- Always animate, regardless of the OS reduced-motion or Windows animation setting: `<MotionConfig reducedMotion="never">`, no reduced-motion media queries on animations, Lenis on for everyone. Only the nav's Reduce motion toggle turns motion down.
- Ease `cubic-bezier(.22, 1, .36, 1)` for reveals. Springs for anything the user touches.
- Section reveals: fade up 24px, stagger 0.08s, once.
- Every loop follows 7.7. Loops stay under 12 seconds.
- Every animation explains something.
- Animate only `transform`, `opacity`, `clip-path`, filters, and canvas.

## 11. Responsive and performance
- Test at 360, 390, 768, 1024, 1440, 1920 px, in both themes. No horizontal page scroll anywhere.
- Mobile: stacked layouts, no pinning, native cursor, no tilt.
- Lighthouse 90+ on mobile. LCP under 2.5s, CLS under 0.1, INP under 200ms.
- Frame stream: tiles lazy-load after LCP, total under 600 KB, canvas paused off screen.
- Initial JS under 150 KB gzipped. Islands hydrate on `client:visible`.
- Only scenes in view run. Never more than 2 animation loops running at once.

## 12. Never
Orange, purple, neon glow, gradient text, emoji, version numbers, changelogs, spec tables, RAM figures, checksums, star counts, testimonials, invented numbers, section numbers like `006`, bento grids of icon boxes, raster screenshots of the app, replay buttons, horizontal scroll rails or drag scrollbars, the same icon repeated down a list, icons that do not match their meaning, cramped table columns, text wrapping to 3 or more lines in a table cell, visible section edges, dark blocks in light mode, an empty band above the nav, a lagging or trailing cursor, cloud or landscape backgrounds, more than one interactive demo, a showcase cursor that clicks beside its target, copy-pasted library components, library credits in the footer, YouTube logos or red play buttons.

## 13. Deliverables
1. Section 14 done, each item checked off with before and after screenshots in both themes.
2. Research board update: 3 references each for auto-advancing steppers, live feature grids, animated accordions, seamless section transitions, subtle custom cursors.
3. Full source in `site/`, deployed by the existing GitHub Actions workflow.
4. Playwright tests: cursor hits at all four widths, scenes pause off screen and resume, loops reset cleanly, install auto-advance and click-to-pause, FAQ animation, no horizontal overflow.
5. A list of every vector screen next to its reference image from `docs/images/`.
6. A self-review against section 12, with fixes made.
7. `CLAUDE.md` updated (Decisions and Status log).

If you cannot open a site or a repo file, say so and stop. Mark any assumption as an assumption.

## 14. Revision 2: fixes for the current build (do these first)
| # | Fix | Done when |
|---|---|---|
| 1 | Remove every Replay button. Add the shared playback hook (7.7) to hero, Try it, diagram, features, install | No scene ever rests frozen while visible. Scenes pause off screen |
| 2 | Replace the features rail with the 3 x 2 grid and spotlight cycle (8.6) | No horizontal scroll. One card plays at a time, hover takes over |
| 3 | Redesign "No more converter sites" (8.7) with the new short copy | No icons, equal columns, every cell on one line at 1280px |
| 4 | Install auto-advance with progress lines, click to pause and loop, `Play all steps` (8.8) | Steps cycle 1, 2, 3, 1. Labels match real durations |
| 5 | Animate the FAQ accordion (8.9) | Smooth open and close, plus turns into a cross |
| 6 | Replace hero and CTA backgrounds with the frame stream (7.1, 8.11) | Background reads as downloading, in both themes |
| 7 | Seamless fades (7.9) and a real light theme for hero and CTA | No hard edges, no dark blocks in light mode |
| 8 | Remove the empty band at the top. Nav floats 16px from the top (7.5) | Hero starts at the top edge under the nav |
| 9 | Move theme and Reduce motion into the nav as animated icon buttons (7.5) | Both toggles work from the nav and persist |
| 10 | Categorized footer (8.12) | Brand block plus Product, Help, Project, Legal columns |
| 11 | Replace the cursor with the shared arrow and its variants (7.3) | No lag, no trailing ring, variants under 150ms |
| 12 | Fix icon meanings (7.4), starting with the Members card | Every icon matches its label, no repeats in a list |
