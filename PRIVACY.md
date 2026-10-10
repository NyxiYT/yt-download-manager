# Privacy policy

YT Download Manager (the Windows app, the browser extension and the userscript) has no accounts, no ads, no
analytics and no tracking. Nothing is sent to the project or its maintainer. Everything it saves stays on your
PC. This page lists every connection it makes and why.

## The Windows app

- **YouTube** (`youtube.com`, `googlevideo.com`, `ytimg.com`): looks up and downloads the videos, music,
  thumbnails and subtitles you ask for. yt-dlp does the lookups, and the app downloads the files.
- **Your YouTube sign-in, only when needed:** when YouTube shows a video only to signed-in viewers
  (age-restricted or members-only), the browser extension hands the app the browser's `youtube.com` cookies.
  The app keeps them in memory for at most two hours. For each lookup it writes them into a temporary file that
  yt-dlp reads, and deletes that file right after. They are only ever sent to YouTube. The log records only
  which cookies came (by name), never their values.
- **GitHub** (`api.github.com`, `github.com` and its download servers):
  - Checks for a new version of the app when it starts, when its window or tray menu opens, when the browser
    uses it, and when Windows wakes up or goes back online (each at most every few minutes), and every 12 hours
    otherwise. A check reads where the "latest release" link on `github.com` leads to; only when that is a
    version the app doesn't know yet does it read the release from `api.github.com`. The requests carry the
    app's version in their user agent and nothing else. An update is downloaded only when you click **Update**.
  - yt-dlp updates itself about once a week from its own GitHub releases.
  - If a tool is missing (only when the app wasn't installed with its installer), it is downloaded from the
    tool's official GitHub releases: yt-dlp, FFmpeg (yt-dlp/FFmpeg-Builds) and Deno.
- **Your browser:** the app answers only on `127.0.0.1` (your own PC). Only browsers you connected can use it.

To turn off the update check, close the app and add `"checkUpdates": false` to
`%LOCALAPPDATA%\YT Download Manager\settings.json`.

**Saved on your PC** in `%LOCALAPPDATA%\YT Download Manager`: settings, the download queue, logs, temporary
files and the tools. The logs record what the app did, including which videos it looked up, but never cookie
values. Uninstalling removes all of it. Your downloaded files stay in the folder you chose.

## The browser extension and the userscript

- **YouTube** (`youtube.com`, `googlevideo.com`, `i.ytimg.com`): the pages you visit, and the files you
  download when the browser downloads them itself.
- **The app on your own PC** (`127.0.0.1`), when it runs.
- **jsDelivr** (`cdn.jsdelivr.net`): fetches FFmpeg when the browser has to convert a file itself, without the
  app. Userscript managers also fetch the script's MP3 encoder from there when they install it.

Settings and the download history are saved in your browser's extension storage, or in your userscript
manager. Removing the extension deletes them.

## The website

The website (`nyxiyt.github.io/yt-download-manager`) is hosted by GitHub Pages and loads its images from
jsDelivr. It has no analytics and sets no cookies.

## Other services' privacy policies

These services handle the requests listed above under their own policies:

- YouTube: [Google Privacy Policy](https://policies.google.com/privacy)
- GitHub: [GitHub General Privacy Statement](https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement)
- jsDelivr: [jsDelivr Privacy Policy](https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net)

## Questions

Open an [issue](https://github.com/NyxiYT/yt-download-manager/issues), or for anything sensitive follow the
[security policy](SECURITY.md).
