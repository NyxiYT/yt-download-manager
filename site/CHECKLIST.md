# Previous page → new page

Every item of the previous page (`docs/index.html`) and where it is on the new one. Checked by comparing the two
built pages item by item: the `<head>` tags, every link, every heading, paragraph and list item, every image's alt
text and the structured data. 141 of 143 items are unchanged; the two differences are explained at the end.

## Head

- [x] `<title>`: same text
- [x] `description`, `keywords`, `author`, `robots`: same
- [x] `viewport`, `charset`; `theme-color` (now follows the dark or light theme)
- [x] Open Graph: `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image` (same address,
      `images/social-preview.png`), `og:image:width`, `og:image:height`
- [x] Twitter: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- [x] Canonical URL `https://nyxiyt.github.io/yt-download-manager/`
- [x] Favicon `images/icon.png`
- [x] JSON-LD `SoftwareApplication`: every field and value as before (name, alternateName, description, category,
      operating system, free offer, download URL, URL, image, screenshot, license, author, code repository), plus
      `softwareVersion` (from the latest release) and `installUrl`
- [x] JSON-LD `FAQPage`: all 6 questions and answers, same text
- [x] `google57c9dbae6d2f93d4.html` (Search Console) and `sitemap.xml`: same addresses
- [x] Every picture under `images/`: same addresses (all of `docs/images` is copied into the build)

## Hero (`Hero.astro`)

- [x] Icon, alt "YT Download Manager icon"
- [x] H1 "YT Download Manager"
- [x] Lead paragraph, same text
- [x] Download for Windows (64-bit) → `YTDownloadManager-Setup-x64.exe`
- [x] All downloads → releases/latest
- [x] Source code on GitHub → repository
- [x] New: a line under the buttons, "64-bit installer · 32-bit and other files" (→ releases/latest); visitors
      not on Windows see the Linux and macOS note there instead
- [x] "Free · No ads · No account · Windows 10 and 11 · Works with Chrome, Edge, Brave and other Chromium browsers"
- [x] Toolbar screenshot, alt "The download toolbar under a YouTube video in dark mode": now in install step 5;
      the hero shows an animated illustration of the toolbar

## Features (`Bento.astro`)

All 10, headings and texts word for word:

- [x] Videos in up to 8K quality
- [x] YouTube to MP3
- [x] YouTube Shorts downloader
- [x] Clips
- [x] Thumbnails, subtitles, screenshots
- [x] Fast and reliable
- [x] Age-restricted and members-only videos
- [x] Your video comes first
- [x] Updates itself (with the Scoop and winget install line)
- [x] 10 languages

## See it in action (`ShowcaseSection.astro`, `islands/Showcase.tsx`)

- [x] H2 "See it in action"
- [x] Download a video in the quality you want: text, and the screenshot (alt "Choosing the video quality and
      trimming a clip on YouTube")
- [x] Turn any video into an MP3: text, and the screenshot (alt "Converting a YouTube video to MP3")
- [x] Download Shorts: text, and the screenshot (alt "The Download button and its menu beside a YouTube Short")
- [x] All your downloads in one place: text, and the screenshot (alt "The download history with finished downloads")
- [x] New: a Clips chapter, using the Clips feature text above; each chapter also has an interactive illustration,
      labeled as one

## How to install (`Install.astro`)

- [x] H2 "How to install"
- [x] Steps 1 to 5, word for word, with their links (x64 installer, 32-bit installer)
- [x] "Step-by-step pictures, updating and uninstalling are explained in the full guide." → README#installation
- [x] Unsigned builds and checksums: heading and SmartScreen text
- [x] SHA256SUMS.txt link and both commands (PowerShell and Linux), now in blocks with copy buttons

## FAQ (`FaqSection.astro`, `islands/Faq.tsx`)

- [x] H2 "Frequently asked questions"
- [x] All 6 questions and answers, word for word (all answers are shown when JavaScript is off, as `<details>` did)
- [x] "More answers and fixes … in the FAQ and troubleshooting sections" with both links

## Support and footer (`Closing.astro`)

- [x] H2 "Support the project", text and donation link → README#support-the-project
- [x] "YT Download Manager is open source under the MIT License. Made by NyxiYT. Privacy policy", all three links
- [x] The disclaimer, word for word

## The two differences

1. `<link rel="preconnect" href="https://cdn.jsdelivr.net">`: removed on purpose. The old page loaded its pictures
   from jsDelivr; the new one serves them itself, so the page makes no third-party requests.
2. The checksum paragraph: the sentence and both commands are all there, but the commands moved from inline text to
   labeled blocks ("on Windows (PowerShell)", "on Linux") with copy buttons, so the paragraph no longer matches as
   one block.
