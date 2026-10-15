# Research board (BRIEF section 13, item 2)

Three references for each pattern the revision 2 fixes needed, what each one teaches, and what the page took from
it. Found by web search on 15 Oct 2026 and read as text; they were **not** opened and judged visually in a browser,
so treat the visual notes as the sources' own descriptions. Study material only: nothing was installed or copied
(BRIEF section 4).

## Auto-advancing steppers (Install, fix #4)

| Reference | Takeaway | Used on the page |
|---|---|---|
| [Framer Marketplace: Auto Tab Showcase](https://www.framer.com/community/marketplace/components/auto-tab-showcase/) | Each tab advances on a fixed timer with a visible progress fill; a click jumps to that tab | Thin progress line under the active step, filling over its real duration |
| [Framer Marketplace: Process Section](https://www.framer.com/marketplace/components/process-section/) | Stories-style progress bars; auto-advance pauses on keyboard focus; ARIA tabs with arrow keys | Steps stay ARIA tabs with arrow keys; a click (or arrow key) pins the step |
| [shadcn.io: Stepper Auto Advance](https://www.shadcn.io/blocks/stepper-auto-advance) | A step advances when its own progress completes, plus a global pause | The step's own loop decides when it ends (not a separate timer); "Play all steps" resumes the walk |

## Feature grids with live previews (Features, fix #2)

| Reference | Takeaway | Used on the page |
|---|---|---|
| [21st.dev: Feature Bento Grid (Mohammad Shehadeh)](https://21st.dev/@mohammadshehadeh/components/feature-03.md) | A tile shows a small faux product UI instead of an icon | Every card holds a vector mini-scene of the real product, not an icon box |
| [21st.dev: Feature Section with Bento Grid (Aceternity UI)](https://21st.dev/@manuarora700/components/feature-section-with-bento-grid.md) | Tiles with moving content need one clear focus or the grid gets noisy | One card plays at a time (the spotlight); the rest rest on their last frame |
| [21st.dev: Bento Grid (Arihant Jain)](https://21st.dev/@arihantcodes_1f7b8c4d/components/bento-grid.md) | Staggered scroll-in for the tiles | Cards reveal with the page's shared stagger; equal cells (3 × 2), not a bento of mixed sizes (BRIEF 12) |

## Animated accordions (FAQ, fix #5)

| Reference | Takeaway | Used on the page |
|---|---|---|
| [Radix Primitives: Accordion](https://www.radix-ui.com/primitives/docs/components/accordion.md) | Animate the height with `--radix-accordion-content-height` | Exactly that, 260 ms ease out, both ways |
| [Radix animation guide (Mintlify)](https://www.mintlify.com/radix-ui/primitives/guides/animation) | Radix keeps closing content mounted (Presence) until its animation ends | Why `forceMount` had to go: with it the variable lagged and nothing animated |
| [Supabase design system: Accordion](https://supabase.com/design-system/docs/components/accordion) | Named open/close keyframes keyed off `data-state` | `faq-open` / `faq-close`, plus a fade and a 6 px rise for the answer |

## Seamless section transitions (hero and CTA, fixes #6 and #7)

| Reference | Takeaway | Used on the page |
|---|---|---|
| [Ahmad Shadeed: CSS masking](https://ishadeed.com/article/css-masking/) | An overlay fading to a colour breaks when the page colour changes; a mask does not | `mask-image` on the background layer only, so both themes fade into their own ground |
| [Verpex: Guide to CSS masks](https://verpex.com/blog/website-tips/a-beginners-guide-to-css-masks-how-to-hide-reveal-and-fade-with-style) | Fade the image layer, keep the text layer fully opaque | The canvas fades; the hero and CTA text sit above it untouched |
| [Savvy: CSS mask-image](https://savvy.co.il/blog/css/css-mask-image/) | Ship `-webkit-mask-image` beside the standard property | Both properties on `.hero-back` and `.fin-back` |

## Subtle custom cursors (visitor cursor, fix #11)

| Reference | Takeaway | Used on the page |
|---|---|---|
| [Awwwards: Customize your mouse cursor](https://awwwards.com/customize-your-mouse-cursor-inspirational-examples-implementation-tricks.html) | A plain, small shape stays readable on every background | The plain arrow, white with a 1 px outline and a soft shadow |
| [Wix: Custom cursor examples](https://www.wix.com/studio/blog/custom-cursor-examples) | Custom cursors don't exist on touch; the page must not depend on them | Fine pointers only; native cursor on touch and during keyboard navigation |
| [OpenReplay: Creating custom cursors for better UX](https://blog.openreplay.com/creating-custom-cursors-for-better-ux/) | Match the cursor to the product; keep states small and meaningful | The showcase's own arrow; states only where they explain something (download, Try it, drag) |
