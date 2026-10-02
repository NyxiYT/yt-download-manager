# Contributing

Thanks for helping! Bug fixes, translations and small improvements are very welcome.
For bigger changes, please [start a discussion](https://github.com/NyxiYT/yt-download-manager/discussions)
first, so we can agree on the idea before you spend time on it.

## What is where

| Folder or file | What it is |
|---|---|
| `yt-standalone-downloader.user.js` | The toolbar, menus, downloads and history. This is the main source for the extension's page code |
| `extension/` | The browser extension (Manifest V3). `content/content.js`, `content.css` and `i18n.js` are generated, don't edit them by hand |
| `extension-build/convert.py` | Turns the userscript into the extension's `content` files |
| `manager/YTDownloadManager/` | The Windows app (C#, .NET Framework 4.8, Windows Forms) |
| `manager/Setup/` | The installer, which carries the app, the extension and the tools |
| `manager/build.cmd` | Builds everything into `dist/` |
| `manager/fetch-components.ps1` | Downloads and checks yt-dlp, FFmpeg and Deno or Node.js for the installers |
| `docs/images/` | Pictures used in the README |

## 1. Set up

You need Windows 10 or 11 and:

1. [Git](https://git-scm.com/download/win)
2. [.NET SDK](https://dotnet.microsoft.com/download) 8 or newer
3. [Python](https://www.python.org/downloads/) 3.9 or newer
4. [Node.js](https://nodejs.org) (only to check JavaScript for mistakes)
5. Google Chrome (or another Chromium browser)

Then get the code:

```bash
git clone https://github.com/NyxiYT/yt-download-manager.git
cd yt-download-manager
```

## 2. Change the code

- **Toolbar and downloads in the browser:** edit `yt-standalone-downloader.user.js`, then run
  `python extension-build/convert.py`. Commit both the userscript and the generated files.
- **Texts and translations:** all interface texts are in the `I18N` object near the top of
  `yt-standalone-downloader.user.js`, one block per language. Add a key to every language.
- **The extension's background, popup and options:** edit the files in `extension/` directly.
- **The Windows app:** edit the files in `manager/YTDownloadManager/`. Keep the interface texts in
  `Strings.cs`, in English and German.

## 3. Build

```bash
manager\build.cmd
```

This builds both installers (64-bit and 32-bit) into `dist/`, together with the extension as a zip and
the userscript. The first build downloads about 250 MB of tools. To build only one installer, add `x64`
or `x86`:

```bash
manager\build.cmd x64
```

## 4. Test

There are no automated tests yet, so please check your change by hand.

1. Check the JavaScript for mistakes:

   ```bash
   node --check extension/content/content.js
   node --check extension/background/service-worker.js
   ```

2. Load your extension: open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and
   select the `extension` folder. After every change, click the reload icon on its card and refresh the
   YouTube tab.
3. Run your build of the app: install `dist\YTDownloadManager-Setup-x64.exe`. It replaces an installed copy
   and keeps its settings.
4. Try what you changed, and at least these basics:
   - Download a video and an MP3 from a freely licensed video, for example
     [Big Buck Bunny](https://www.youtube.com/watch?v=aqz-KE-bpKQ).
   - Download something from a Short.
   - Open the download history (the clock in YouTube's top bar).

The app writes a log to `%LOCALAPPDATA%\YT Download Manager\logs\manager.log`. It helps a lot when
something doesn't work.

## 5. Send your fix

1. [Fork](https://github.com/NyxiYT/yt-download-manager/fork) the repository.
2. Create a branch: `git checkout -b fix/short-description`.
3. Commit with a short message in this style:
   - `fix: keep the toolbar after switching videos`
   - `feat: add a Dutch translation`
   - `docs: explain where downloads are saved`
4. Push the branch and open a pull request. Fill in the template: what you changed, why, and how you
   tested it.

Keep pull requests small and about one thing. Match the style of the code around your change.

By contributing, you agree that your contribution is released under the [MIT License](LICENSE).
