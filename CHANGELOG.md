# Changelog

All notable changes to YT Download Manager are listed here. Versions follow
[semantic versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

## [Unreleased]

### Fixed

- Another program on the PC could pose as the app while the app wasn't running (by taking its local port) and
  receive the browser's YouTube sign-in. The app now proves itself with a key its installer shares only with
  the extension next to it, and the browser checks that before it connects, before it sends its access token,
  and every time before it hands over the sign-in. An app from before this version still gets downloads, but
  never the sign-in. The sign-in itself is now only the cookies YouTube needs for it, plus `PREF`.
- When the app fetches yt-dlp, FFmpeg or Deno itself (installed without the setup program) and can't read the
  published checksum, it no longer uses the download unchecked. The window says the tools couldn't be
  installed and offers **Try again**.
- The app no longer looks for FFmpeg in `C:fmpeg` or Chocolatey's shared folder, where any account on the PC
  can put a program. It still finds FFmpeg on `PATH`, in Program Files, from winget or Scoop, and in a folder
  you set yourself (`ffmpegDir` in `settings.json`).
- Two downloads with the same title that finished at the same moment could pick the same file name, and one
  of them failed (or removed the other's half-saved file). Each now gets its own name (`Title.mp4`,
  `Title (2).mp4`) and saves under a temporary name of its own first.
- A file that was being saved when the app or the PC stopped no longer stays in the download folder as
  `….partial`: the app removes it when it starts again, or when you press **Retry**.
- A download from an HLS stream (the finished video+sound streams some signed-in videos get) that YouTube
  changed while it was paused or refused could continue with segments of the new version after those of
  the old one. It now starts that stream over, once.
- An HLS stream with a very long segment list (a stream of many hours) was cut short after the first 4 MB of
  the list, without a word. The app now reads lists up to 32 MB whole and hands longer ones to yt-dlp.
- Screenshots of 4K and 8K videos that the app saves for you could be too big (more than about 22 MB) and
  failed. They now go to the app as they are, up to 64 MB.
- With finished downloads on a slow, sleeping or disconnected drive (a network folder, a USB disk), every
  look at the download list waited for that drive, and running downloads waited with it. The app now
  checks whether finished files are still there at most every 10 seconds, without holding anything up.
- The app downloads streams itself again. Since 1.11.0 it handed every one to yt-dlp, which still finished the
  download but without the app's own parallel pieces and its slowing down while a video plays. With the app's
  downloader, three downloads at once peak at about 240 MB (1.10.0: 340 to 440 MB), not at 150 MB as the notes
  for 1.11.0 said.
- A file whose path would be longer than Windows allows (260 characters, a long title in a deep folder) failed
  at the very end with "Something went wrong". The title is now cut short to fit; in a folder so deep that
  nothing fits, the file is saved anyway.
- A connection that drops while a video is being looked up now waits and tries again, as one that drops
  during the download does. It used to fail the download.
- In Windows' list of installed apps, the install date was written in the calendar of the user's region
  (Hijri, Thai, Persian) instead of the Gregorian calendar Windows expects.
- The preview player says when the browser can't play a file (Opera on Linux has no H.264, for one) instead of
  showing a black picture.
- A video titled like a Windows device name that wasn't recognized as one yet (`COM¹`, `CONIN$`, `CON .txt`)
  is saved with a `_` in front, as `CON` already was. It used to fail to save.
- On Linux and other systems without the Windows app, its entry in the extension's menu says that the app is
  for Windows, instead of asking to install it.

### New

- A switch in the app's window, **Use my YouTube sign-in when YouTube suspects a bot** (off unless you turn it
  on): when YouTube answers a download with "Sign in to confirm you're not a bot", the app tries it again with
  your browser's YouTube sign-in, the way it does for age-restricted videos. YouTube then sees that download
  as made with your account.
- The app's window sets how many downloads run at once (1 to 4, 2 as before) and an optional speed limit for
  all of them together (1 to 50 MB/s, or no limit). The limit holds whether or not a video plays in the
  browser; a playing video can still slow downloads further. Both are kept in `settings.json`
  (`maxDownloads`, `speedLimitMBps`).

- **Advanced** at the bottom of the app's window: turn the check for new versions off or on, and use your own
  copy of yt-dlp instead of the built-in one. Both used to need an edit of `settings.json`.

### Changed

- Updates of the app are signed: each release's `SHA256SUMS.txt` comes with `SHA256SUMS.txt.sig`, and the app
  installs a new version only when that signature matches the key built into it. A changed release page or
  download server can't hand it another installer.
- Screen readers: the app's switches are check boxes that say whether they are on (in Windows' language, not
  an English "on"/"off"), its progress bars are progress bars with a percentage, and its colored buttons are
  buttons.
- The prompt that asks whether a browser may connect names the program that really asked (for example
  `Google Chrome (C:\...\chrome.exe)`), not only the name the request gives itself. It no longer takes the
  keyboard from the window you're typing in, Enter and Esc both answer "Don't allow", and **Allow** can be
  clicked only after a second. Requests from sandboxed frames and local files (`Origin: null`) are refused.
- Before a release is published, it is installed and run on Windows 11 (also on ARM) and Windows Server 2022
  and 2025, and the extension in Chrome, Edge, Chromium, Brave, Opera and Vivaldi on Ubuntu, Debian, Fedora,
  Arch and Linux Mint. A release that fails any of it isn't published.
- New versions show up within minutes. Besides every 12 hours, the app looks for one when it starts, when its
  window or tray menu opens, when the browser uses it (at most every 10 minutes), and when Windows wakes up or
  goes back online. A check reads only where GitHub's "latest release" link leads; the release itself is read
  only when that version is new.

## [1.11.0] - 2026-10-10

### Changed

- The app needs much less memory while it downloads and gives it back afterwards. Three downloads at once
  now peak at about 150 MB instead of 340 to 440 MB, and the app goes back to about 25 MB instead of
  staying at 120 to 260 MB.
- Big Picture: the player glides into the corner and back smoothly, also while YouTube's page is busy.
  Scrolling no longer measures the page on every frame.
- Download progress bars move without re-laying out the page.
- The toolbar under the video is transparent, so YouTube's ambient mode glow shows through it.
- A minute after it was last used, the app hands its memory back to Windows: about 1.5 MB instead of 9 MB
  while it waits in the tray, and instead of 15 to 27 MB after downloads.
- The extension no longer starts its background script for pages on other sites. It listens to tabs only
  while an update waits for the YouTube tabs to close.
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

[1.11.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.11.0
[1.10.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.10.0
[1.9.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.9.0
[1.8.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.8.0
[1.7.1]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.7.1
[1.7.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.7.0
[1.6.0]: https://github.com/NyxiYT/yt-download-manager/releases/tag/v1.6.0
