# Changelog

All notable changes to YT Download Manager are listed here. Versions follow
[semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

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

[1.7.1]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.7.1
[1.7.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.7.0
[1.6.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.6.0
