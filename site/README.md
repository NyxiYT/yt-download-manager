# Website

The website of YT Download Manager: https://nyxiyt.github.io/yt-download-manager/

One static page, built with [Astro](https://astro.build) (React islands for the moving parts), Tailwind CSS,
[Motion](https://motion.dev) and two [HeroUI](https://heroui.com) components (the FAQ accordion and the sliders,
built on React Aria). No tracking, no cookies, no third-party requests: fonts and pictures are served with the page.

## Run it

Node.js 22.12 or newer.

```sh
cd site
npm ci
npm run dev       # http://localhost:4321/yt-download-manager/
npm run check     # TypeScript and Astro checks
npm run build     # the site in site/dist
npm run preview   # serves site/dist
```

## Where things are

| | |
|---|---|
| `src/lib/content.ts` | All text: titles, descriptions, features, FAQ, install steps, links. Taken word for word from the previous page; change it here. |
| `src/lib/release.ts` | The latest version, its date and the star count, read from the GitHub API while building (`GITHUB_TOKEN` raises the rate limit). Without the API, the version and date come from `CHANGELOG.md`. |
| `src/layouts/Base.astro` | `<head>`: title, description, Open Graph and Twitter tags, canonical URL, JSON-LD (`SoftwareApplication` and `FAQPage`). |
| `src/components/` | The sections of the page (Astro, rendered at build time). |
| `src/islands/` | The parts that run in the browser: the hero's toolbar demo, the "See it in action" story, the FAQ. |
| `src/scripts/` | Small scripts: magnetic buttons, card glow and tilt, reveals, copy buttons (`interact.ts`); a fallback refresh of the version and stars (`live.ts`). |
| `src/styles/global.css` | Colors and type for the dark (default) and light theme, shared component classes. |
| `public/` | Copied as is: the Google Search Console file and `sitemap.xml`. |

Pictures come from `../docs/images`, the same files the main README uses. Astro makes AVIF and WebP versions in
the sizes the page needs. All of `docs/images` is also copied to `images/` in the build, so addresses other sites
use (the link preview picture, the icon in the structured data) keep working.

## Deploy

`.github/workflows/site.yml` builds the site and publishes it with GitHub Pages. It runs when `site/` or
`docs/images/` change on `main`, after every release, once a day (for the star count) and by hand from the Actions
tab. It needs **Settings → Pages → Source: GitHub Actions** (instead of the `docs/` folder).

## Rules the page keeps

- Only real facts about the app: no invented numbers, quotes or features. The demos are labeled illustrations,
  next to real screenshots.
- `prefers-reduced-motion` turns every animation off; the page reads the same without JavaScript.
- Keyboard: every control can be reached and used, with a visible focus ring.
- Only `transform` and `opacity` are animated; nothing moves the layout while the page loads (CLS 0).
- Lighthouse (mobile) at 90 or more in all four categories. Last run: Performance 99, Accessibility 100,
  Best Practices 100, SEO 100.
- No YouTube or Google logos.

## Credits

- Icons: Material Symbols by Google, Apache License 2.0 (the same ones the extension uses).
- The video frames in the screenshots: *Big Buck Bunny*, © Blender Foundation, CC BY 3.0.
- HeroUI, Motion, Astro, React and Tailwind CSS: MIT License. Inter typeface: SIL Open Font License.
