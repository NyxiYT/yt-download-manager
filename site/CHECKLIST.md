# Previous page → new page

Every item of the previous page (the live site at https://nyxiyt.github.io/yt-download-manager/, built from the
previous `site/`) and where it is on the new one. Checked by comparing the two built pages: every heading,
paragraph, list item, link, image alt text, `<head>` tag and the structured data. Facts are all kept; where the
wording changed, the new page uses the README's own sentences for the same fact. Deliberate differences are listed
at the end.

## Head (`src/layouts/Base.astro`)

- [x] `<title>`, `description`, `keywords`, `author`, `robots`: same text
- [x] `viewport`, `charset`, `theme-color` (follows the theme)
- [x] Open Graph: `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image` (same address,
      `images/social-preview.png`), `og:image:width`, `og:image:height`
- [x] Twitter: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [x] Canonical URL `https://nyxiyt.github.io/yt-download-manager/`, favicon `images/icon.png`
- [x] JSON-LD `SoftwareApplication`: every field and value as before, with `softwareVersion` and `installUrl`
- [x] JSON-LD `FAQPage`: the previous 6 questions with the same text, plus the README's other 6 (12 in all, the same
      as the visible FAQ)
- [x] `google57c9dbae6d2f93d4.html` and `sitemap.xml` at the same addresses; every picture under `images/`

## Version line → leader strip (`Announcement.astro`)

- [x] "Version 1.12.0 · October 13, 2026" → `v1.12.0 · 13 Oct 2026 is out. See what's new`, read from the GitHub
      API at build time and refreshed in the browser when the build is older than a day

## Hero (`Hero.astro`, `DownloadCta.astro`)

- [x] H1: was "YT Download Manager"; now "Up to 8K, right under the video." with the name in the eyebrow, the nav
      and the title (see the differences below)
- [x] Lead: the same facts (free, open source, Windows, up to 8K, MP3, Shorts, toolbar under every video), in the
      README's two-part wording
- [x] Download for Windows (64-bit) → `YTDownloadManager-Setup-x64.exe`, now with the real file size
- [x] "Download started" confirmation → a check mark on the button
- [x] 32-bit → `YTDownloadManager-Setup-x86.exe`; Scoop → the install guide's Scoop tab; All downloads → releases/latest
- [x] Source code on GitHub → repository
- [x] "Not on Windows? …" → per system: Linux and macOS get the extension ZIP and the README's note (untested on
      macOS); phones and tablets get "runs on a PC" and a copy-link button
- [x] "Free · No ads · No account · Windows 10 and 11 · Works with Chrome, Edge, Brave and other Chromium browsers"
      → the trust strip (`TrustStrip.astro`): MIT, yt-dlp and FFmpeg, no ads, no account, no tracking, the browsers;
      Windows 10 and 11 in the requirements (`Compatibility.astro`)
- [x] The hero's toolbar illustration → the interactive demo, rebuilt from the extension's own code

## Features (`Features.astro`)

The previous 10 cards are now the README's 24 features, in its three groups. Each previous fact is there:

- [x] Videos in up to 8K quality → "Up to 8K quality" (with "1440p+ with the app")
- [x] YouTube to MP3 → "YouTube to MP3"
- [x] YouTube Shorts downloader → "YouTube Shorts"
- [x] Clips → "Only the part you need"
- [x] Thumbnails, subtitles, screenshots → three entries: "Thumbnails", "Subtitles", "Screenshots"
- [x] Fast and reliable → "Fast" and "Keeps going"
- [x] Age-restricted and members-only videos → same, tagged "with the app"
- [x] Your video comes first → same
- [x] Updates itself (and Scoop) → "Updates itself"; Scoop in the install guide and the FAQ
- [x] 10 languages → same, and the marquee (`Marquee.astro`) writes "Download" in all ten

## See it in action → the showcase (`Showcase.astro`, `islands/Showcase.tsx`)

- [x] "See it in action" → "Every step, as the README says it." (007)
- [x] Quality, MP3, Clips, Shorts, History chapters → "Download a video", "Trim a clip", "Download music as MP3",
      "Download a Short", "Find your downloads": the README's "How to use" steps, each with a demo and the real app
- [x] The screenshots with their alt texts: same pictures (`download-video.jpg`, `download-audio.jpg`,
      `shorts-menu.png`, `download-history.png`), alt texts from the README
      (`shorts-menu.png` re-shot without NASA's insignia); four chapters also play a recording of the real app,
      History keeps its screenshot
- [x] The history panel's two items (MP4 1080p60, 268 MB; MP3 320 kb/s) → in the history demo and the screenshot
- [x] "Replay" → "Replay the tour" under each demo

## How to install (`Install.astro`)

- [x] The previous 5 steps → the README's 8 steps, each with its screenshot (the previous steps are all in them)
- [x] Links to the x64 and x86 installers
- [x] The SmartScreen dialog illustration, labelled as one
- [x] "Step-by-step pictures, updating and uninstalling are explained in the full guide." → README#installation
- [x] Unsigned builds and checksums: the text, `SHA256SUMS.txt`, both commands with copy buttons
- [x] Linux note → the Linux tab, with README#linux

## FAQ (`Faq.astro`, `islands/Faq.tsx`)

- [x] "Frequently asked questions"
- [x] All 6 previous questions and answers, word for word, plus the README's 6 others
- [x] "More answers and fixes … in the FAQ and troubleshooting sections" with both links

## Support and footer (`Maker.astro`, `Footer.astro`)

- [x] "This project is free and made in my spare time. If it saves you time, you can support it with a donation." →
      the maker's note; the donation link → README#support-the-project, and the BTC and USDT addresses with their
      QR codes and the network warning (from the README)
- [x] "YT Download Manager is open source under the MIT License. Made by NyxiYT. Privacy policy" → footer, all links
- [x] The disclaimer → the README's full legal note, which includes the previous sentence's facts ("not affiliated
      with, endorsed by, or connected to YouTube or Google")

## Deliberate differences

1. **"Star on GitHub" button**: removed. The repository has 0 stars; the page links to the source code instead.
2. **H1**: the product name moved to the eyebrow, nav and `<title>`; the H1 says what the product does. Search
   engines keep the name from `<title>`, the structured data and the first lines.
3. **Wording**: the new page uses the README's sentences for the same facts (for example the previous "Clips: Set a
   start and end time…" is the README's "Only the part you need: Set a start and end time…").
4. **Install steps**: 8 instead of 5, as in the README, with pictures.
5. **Checksum sentence**: the README's wording ("compare its checksum with the one listed for that file").
