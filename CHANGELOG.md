# Changelog

All notable changes to YT Download Manager are listed here. Versions follow
[semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

## [Unreleased]

### Changed

- The app needs much less memory while it downloads and gives it back afterwards. Three downloads at once
  now peak at about 150 MB instead of 340 to 440 MB, and the app goes back to about 25 MB instead of
  staying at 120 to 260 MB.
- Big Picture: the player glides into the corner and back smoothly, also while YouTube's page is busy.
  Scrolling no longer measures the page on every frame.
- Download progress bars move without re-laying out the page.
- The README and the website say plainly that the Windows builds are not code-signed, and how to check a
  download against `SHA256SUMS.txt`.

## [1.10.0] - 2026-10-04

### New

- The app speaks the same ten languages as the extension: English, German, Spanish, French, Italian,
  Portuguese, Polish, Russian, Japanese and Chinese. Its window has a language choice; **Automatic** follows
  Windows.
- A new look for the app window: each part on its own rounded card, the browser connection as a colored
  badge, a Windows 11 style switch and a dropdown in the window's own colors. The tray menu follows light or
  dark mode as well, with rounded corners on Windows 11.
- Extension options: the language dropdown uses the page's colors, with its own arrow and more room on the
  right. The connection to the app shows as a badge, with the app's version next to it.

## [1.9.0] - 2026-10-03

### New

- The app updates itself. It asks GitHub for a new release at most every 12 hours; when nothing changed, GitHub
  answers without any content. A new version shows up as a notification, at the top of the tray menu and in the
  app window. One click downloads it, checks it against the release's checksums, installs it and restarts the
  app. Settings and the download queue stay.
- The browser extension updates itself with the app: when the app brings a newer copy, the extension reloads
  itself once no YouTube tab is open. No more reload button in `chrome://extensions`.
- Install with Scoop: `scoop bucket add nyxiyt https://github.com/NyxiYT/yt-download-manager`, then
  `scoop install nyxiyt/yt-download-manager`. Every release updates the Scoop manifest and prepares the winget
  manifests.
- `YTDownloadManager-Setup-x64.exe --quiet --start` starts the app after a quiet install (`--open` opens its window).

### Fixed

- When the app was restarted while a program it had started was still running, it could come back on another
  port, and the browser lost the connection to it. Programs the app starts no longer hold on to its port.

## [1.8.0] - 2026-10-02

### New

- Download videos in up to 8K quality. With the app running, the quality list shows every resolution YouTube
  offers for the video, up to 4320p (8K), including videos that only have VP9 or AV1 at high resolutions.
- HDR videos stay HDR, and at the same resolution 60 fps is picked over 30 fps.
- The highest quality is selected for you. A quality you picked before is kept where a video has it; otherwise
  the next lower one is used.
- The quality label shows 8K for 4320p.

### Fixed

- Many videos only offered up to 1080p although YouTube has 1440p, 4K or 8K for them. The list came only from
  what YouTube gives the browser directly, which often leaves out the high-resolution streams.

## [1.7.1] - 2026-10-02

### Fixed

- Uninstalling removes everything the app put on the PC: besides its program, settings, logs, tools and
  registry entries, now also the entries Windows adds for its autostart and its `ytdm:` links, its tray icon
  setting, and files that were still in use at that moment (they go a few seconds later).
- Temporary and cache files of yt-dlp and Deno now stay in the app's own folder instead of Windows' temp
  folder and `%LOCALAPPDATA%\deno`, so uninstalling removes them too.
- Opening the installer and closing it without installing no longer leaves an empty folder behind.

## [1.7.0] - 2026-10-02

### New

- The app and its installer follow Windows' light or dark mode, title bar included.
- Opening the installer again on a PC that has the app offers **Update** (a newer version) or **Repair**
  (the same version), and **Uninstall**, which asks once more before removing anything.
- `YTDownloadManager-Setup-x64.exe --uninstall --quiet` removes the app without a window, for scripts.

## [1.6.0] - 2026-10-02

The first public release.

### New

- Installer for 32-bit Windows (`YTDownloadManager-Setup-x86.exe`). It brings 32-bit versions of yt-dlp,
  FFmpeg and Node.js.
- Picture-in-picture for Shorts keeps the video's shape when you drag the window's outer border, too.
  This needs the app to be running.
- The browser extension and the userscript are also available as separate downloads, for browsers
  without the app.
- The userscript updates itself from the latest release.

### Improved

- The installer checks every bundled tool against its official checksum and fetches it again when an
  older copy no longer matches.

### Fixed

- Resizing the Shorts picture-in-picture window from Chrome's own border no longer changes only one side.

[1.8.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.8.0
[1.7.1]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.7.1
[1.7.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.7.0
[1.6.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.6.0
