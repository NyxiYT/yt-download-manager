# Changelog

All notable changes to YT Download Manager are listed here. Versions follow
[semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

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

[1.6.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.6.0
