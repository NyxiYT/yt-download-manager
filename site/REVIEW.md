# Self-review

The finished page, opened at 360 to 1920 px in dark and light, checked against the brief's anti-AI-look rules and
its other requirements. What I found and what I changed.

## The anti-AI-look rules

| Rule | Where the page stands |
|---|---|
| No three identical icon cards in a row | None. Features are a ruled two-column list; numbers are a ledger; the two parts are an asymmetric 7/4 split. |
| No bento of icon-plus-two-lines boxes | None. The previous site's bento is gone. |
| No generic icon library as decoration | The demos use the extension's own icons. The feature list uses 24 icons drawn for the page (`src/lib/site-icons.ts`) in the same filled, rounded style. |
| Glass only on the nav | Only the nav. Nothing else blurs. |
| No shadow on every element | Shadows only on things that float: the nav, the demo stage, the menus inside the demos (the extension's own), the compare handle and the hover preview. |
| No coloured left-border stripes | None. |
| No sparkles, "AI-native", "supercharge", "unlock", "seamless", "next-level" | None. The copy is the README's. |
| No headline that fits any product | "Up to 8K, right under the video." only fits a toolbar that downloads; section titles say what the section shows. |
| No fake logos, stats or testimonials | None. Every number is in the README; the star count isn't shown. |
| No animation that explains nothing | Every moving part shows something real: the tour (how the toolbar works), the ring (progress), the line (the extension finding the app), the ticker (the figure), the marquee (the ten languages). The headline rise and title reveals are the only ornament, once each, under a second. |

## Fixed during the review

- **Condensed nav overlapped "FAQ"**: the shift was computed from total widths; it's now limited by the measured gap
  on each side of the centred links.
- **Links had no underline**: Tailwind's reset made links inherit `text-decoration: none`; links in text are
  underlined again (Lighthouse "link in text block").
- **Inactive showcase chapters were dimmed with opacity**: that failed contrast; they now step back in colour only.
- **The quality select's spoken name didn't match its text**: now labelled by its label and its own content.
- **The extension's 8K/4K badge** (`#ff0033` on `#2c2c2c`, 3.5:1): the demos use the extension's dark-theme red
  (5:1). The extension and the userscript now use that red too (`CHANGELOG.md`, Unreleased).
- **Tiny tap targets on phones**: the scaled demos' buttons were ~20 px; on phones the demos play as illustrations
  (inert, with a text alternative).
- **The trim summary**: the previous site showed "Clip · 02:45"; the extension writes "Clip · 2:45" (`fmtClock`).
- **Before/after collapsed on phones**: the extension's floating dropdown style won over the in-flow one.
- **The line between Side A and Side B crossed the text when stacked**: hidden below 1024 px; the caption says it.
- **Checksum code blocks widened the page at 360 px**: grid children now shrink.
- **Tooltips near the stage edge were cut off**: they're kept inside, as the extension clamps them to the window.
- **The Shorts screenshot** (`docs/images/shorts-menu.png`) showed NASA's insignia; it's re-shot with Blender
  Studio's Short, the menu open.
- **Light theme**: the size label inside the download button failed contrast (it was dimmed); now full colour.
- **Performance** (Lighthouse mobile went from 82 to 98): the hero's demo hydrates after the first paint
  (a small `client:lazy` directive), smooth scrolling and the glass load on the first scroll, the glass map is
  drawn only along the rim at half size (300 ms → a few ms), the marquee's Cyrillic and CJK fonts load late, the body
  font doesn't swap after the first paint, long sections use `content-visibility`.

## Requirements, checked

- Lighthouse (mobile, simulated): Performance 98, Accessibility 100, Best Practices 100, SEO 100; LCP 2.3 s, CLS 0,
  TBT under 50 ms. Desktop: 100 / 100 / 100 / 100.
- No horizontal scroll at 360, 390, 768, 1024, 1280, 1440 and 1920 px.
- One `h1`, no skipped heading levels, alt text on every image, every control reachable by keyboard.
- Every fact, link and section of the previous page: see `CHECKLIST.md`.

## Not verified, or not done

- **The 8K hero**: the hero shows *Big Buck Bunny* at up to 2160p60, because that's what YouTube serves for it.
  NASA's public-domain 8K video is 7680×3840, which the toolbar currently labels "3840p · 4K"; see the open issue
  about labelling wide videos.
- **The glass's refraction** was checked in headless Chrome 155 only, with the hero's picture scrolled under the
  nav: the nav gets `backdrop-filter: url(#ydm-glass) blur(3px) saturate(1.5)`, and the picture behind it is
  visibly displaced compared with the same spot under the plain blur. Not checked on a real phone or a low-memory
  device (both should get the blur), and whether the effect reads well is a matter of taste.
- **Recordings**: four of five chapters have a clip of the real app (`video`, `trim`, `audio`, `shorts`).
  `history` still shows the README's screenshot: YouTube asked the recording browser to sign in ("confirm you're
  not a bot") during the download, twice, and I didn't sign in.
