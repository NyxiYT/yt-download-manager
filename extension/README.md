# YT Standalone Downloader (browser extension)

A download toolbar under YouTube videos and beside Shorts: video in up to 8K quality, MP3 / M4A / Opus / WAV, thumbnails,
subtitles, screenshots and trimmed clips, plus Big Picture and a download history. Everything runs
locally in your browser. If the optional **YT Download Manager** app is installed and connected,
downloads go through it instead and are saved to any folder on your PC.

This is the Manifest V3 extension version of the former Tampermonkey userscript, with the same
features and interface. It doesn't need Tampermonkey.

## Install (Load unpacked)

Works in Chrome, Edge, Brave, Opera, Vivaldi and other Chromium browsers, version 111 or newer.

1. Open the extensions page: `chrome://extensions` (Edge: `edge://extensions`, Brave: `brave://extensions`, Opera: `opera://extensions`).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select this `extension` folder, the one containing `manifest.json`.
4. Reload any open YouTube tabs.

The YT Download Manager installer also puts a copy of this folder at
`%LOCALAPPDATA%\Programs\YT Download Manager\extension` and keeps it up to date. Its setup window has
an **Open extensions page** button, which also copies that path for the Load unpacked step. Load the
extension from there if you use the app. After updating the app, click the reload icon on the
extension's card.

If you used the Tampermonkey userscript before, turn it off in Tampermonkey. Otherwise the page gets
two toolbars. Settings and history from the userscript don't carry over, because they lived in
Tampermonkey's storage.

After changing the extension's files, click the reload icon on its card in the extensions page and
reload the YouTube tabs.

## Using it

- **The toolbar** under every video has buttons for video, audio, thumbnail, subtitles and screenshot.
  It also has the theme, Big Picture, picture-in-picture, loop, settings and help buttons.
- **Shorts** get two buttons at the top of YouTube's column beside the Short: **Download** (video,
  audio, thumbnail, subtitles, screenshot) and **⋮** (picture-in-picture, settings, help, hide). The
  thumbnail picker offers the Short's own portrait picture (Vertical, usually 1080×1920) first. Where
  the column has no room (low windows), ⋮ folds into Download's menu as **Settings**.
- **Picture-in-picture on Shorts** (⋮ → Picture-in-picture) opens a window you can scroll in: scrolling,
  the arrow keys or its arrows go to the previous or next Short, also while you are on another tab. A click
  plays or pauses; it also has mute and the way back. Its edges and corners resize it in the video's shape
  the whole way. With the YT Download Manager running, Chrome's own border around it does too (and stops at
  the screen's edge); without it, that border resizes freely and the shape comes back when you let go. It
  opens where and as big as it was last time. Closing it puts the Short back into the page.
- **Going back and forward through Shorts** works like a browser's history, in the page and in
  picture-in-picture alike: back shows the Shorts you watched in order, forward replays them, and only past
  the last one comes a new Short you haven't watched in this tab. Each Short goes on where you left it.
- **The clock in YouTube's top bar** (right side, next to YouTube's own buttons) is the one place for
  downloads: a ring around it fills with their progress and a badge counts them; hovering says how far
  they are ("Downloading 20%", "2 downloads, 45%"). When everything is done a check mark shows for a
  moment, then a dot stays until you open the history (red after a failure). While the Download Manager
  app starts, the ring turns. A click opens the history right under it; messages that need a choice
  ("Download again", "Download in browser") appear at the top of the history.
- **Big Picture** keeps the video in view in the corner while you scroll. Going to YouTube's home page
  (the logo, Home in the menu, or the house button above the docked video) keeps the video playing in
  YouTube's mini player; **Back to the video** above it returns to the video, with Big Picture on again.
- **The extension's icon** in the browser toolbar has two commands for the current YouTube tab: "Show
  download toolbar" (if you hid it) and "Open download history". It also links to the settings.
- **Settings** (right-click the icon, then **Options**) cover language, toolbar visibility, opening
  the history automatically, the Download Manager connection and clearing the history. Changes apply
  to open YouTube tabs right away.

### YT Download Manager (optional)

The app downloads the streams itself, converts with FFmpeg, saves into your Downloads folder (or
another folder you pick), and keeps going when the tab is closed.

The extension connects to the app on its own, with nothing to click: when it is installed, when the
browser starts, and whenever a YouTube tab finds the app running. The app recognizes the extension by
its ID, which the `key` in `manifest.json` fixes (`cgjpjebkpfjhaedhimgenbemfmgmkmjj` wherever the
folder is loaded from); anything else that asks, including the Tampermonkey script, still needs **Allow**
in the app's window. To keep downloads in the browser, turn off **Send downloads to the Download
Manager** in the options.

The extension talks to the app on `127.0.0.1` through its service worker.

### Age-restricted and members-only videos

Videos YouTube only shows to signed-in viewers download through the app with your own access. When
YouTube refuses the toolbar's anonymous request, the extension hands the app the youtube.com cookies of
this browser's sign-in; the app asks YouTube as you and lists the formats your account may watch. The
sign-in is used only for such videos, never for normal ones, stays in the app's memory (on disk only for
the moment yt-dlp reads it) and is never logged. If your account isn't eligible (age check, no channel
membership), the toolbar says so; if the browser isn't signed in to YouTube, it asks you to sign in.

Signed in, YouTube often gives downloaders no separate video and sound streams (the web app gets only
its SABR stream, the TV app may be refused). The app then asks the Safari app's way too and offers the
finished video+sound streams YouTube provides for signed-in sessions (HLS, up to 1080p). Sound options
come from those streams when there is no separate one. When YouTube offers nothing downloadable, the
toolbar says "YouTube doesn't offer this video for download" (or that it is copy-protected) instead of
listing nothing. The app's log (`%LOCALAPPDATA%\YT Download Manager\logs\manager.log`) records every
stage: the sign-in (cookie names only), each YouTube answer per app, what it offered, the plan, the
download, conversion and the saved file.

If YouTube refuses the links the browser can get (it does on many connections), the error message
offers **Use the Download Manager**, which connects the browser if needed and hands the download over.

### Playback comes first

Downloads never take the connection away from the video you are watching. While a video plays, each
YouTube tab tells the app every few seconds how many seconds are buffered ahead. When that runs short,
the app's downloads drop to a fraction of the connection until the buffer has recovered, and the
history panel shows "slower while your video plays". Downloads made in the browser itself do the same
by using fewer parallel requests. The app also runs yt-dlp and FFmpeg at below-normal priority, so
converting never takes processor time from the browser.

## Structure

```text
extension/
├── manifest.json               Manifest V3
├── background/
│   └── service-worker.js       Requests the page itself can't make, and Download Manager status
├── content/
│   ├── content.js              The toolbar, pickers, downloads, history panel, Big Picture
│   ├── content.css             Its styles, which follow YouTube's light and dark theme
│   ├── i18n.js                 Interface text in 10 languages, shared with the popup and options page
│   ├── page-bridge.js          Runs in YouTube's own page context (see below)
│   └── vendor/lame.min.js      lamejs 1.2.1, the built-in MP3 encoder (LGPL-3.0)
├── popup/                      The toolbar button's menu
├── options/                    The settings page
├── assets/
│   ├── icons/                  16, 32, 48 and 128 px
│   └── images/logo.png
└── README.md
```

`content.js`, `content.css` and `i18n.js` are generated from `../yt-standalone-downloader.user.js`
by `../extension-build/convert.py`, so the userscript remains the single source for the toolbar.
Run `python extension-build/convert.py` after changing the userscript.

### What replaced the userscript APIs

| Userscript | Extension |
|---|---|
| `GM_getValue` / `GM_setValue` / `GM_addValueChangeListener` | `chrome.storage.local` and `chrome.storage.onChanged` (synced between tabs, the popup and the options page) |
| `GM_xmlhttpRequest` + `@connect` | The page's own `fetch` for YouTube, googlevideo and jsDelivr. Everything else goes through the service worker, which has the host permissions |
| `GM_addStyle` | `content/content.css`, declared in the manifest |
| `GM_registerMenuCommand` | The popup behind the toolbar button, which sends commands with `chrome.tabs.sendMessage` |
| `unsafeWindow` | `content/page-bridge.js`, a content script in the page's JavaScript context (`"world": "MAIN"`) |
| `@require` (lamejs) | Bundled copy in `content/vendor`, SHA-256-verified against the version the userscript pinned |

The page bridge is needed because a content script can't see YouTube's own scripts. The toolbar
reads YouTube's configuration and the player's caption list through it, and it switches the site
theme with the same signal as YouTube's Appearance menu. Both sides talk through JSON strings in DOM
events. The bridge answers only those three requests.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Settings, download history and the Download Manager connection |
| `cookies` | Your YouTube sign-in, read only for a video YouTube shows to signed-in, eligible viewers only (age restricted, members only), and handed to the Download Manager app on this PC for that download |
| `https://*.youtube.com/*` | The toolbar runs on www.youtube.com and asks YouTube for stream links. The sign-in cookies for age-restricted and members-only videos are set for youtube.com itself, so reading them needs the whole domain |
| `https://*.googlevideo.com/*` | YouTube's video servers, the streams being downloaded |
| `https://i.ytimg.com/*` | Thumbnails and MP3 cover art |
| `https://cdn.jsdelivr.net/*` | FFmpeg (ffmpeg.wasm), downloaded on first use and cached in the browser |
| `http://127.0.0.1/*`, `http://localhost/*` | The optional YT Download Manager app on this PC |

There is no `tabs`, `downloads`, `scripting` or `<all_urls>` permission. Files are saved with the
browser's normal download, or into a folder you pick with the browser's folder picker. The extension
exposes no `web_accessible_resources`: nothing in it needs to be loaded by web pages.

## Privacy

Nothing is sent anywhere except to YouTube, to jsDelivr (the FFmpeg download), and to the Download
Manager app on your own PC if you connect it. There's no analytics and no account.

## Licenses

- lamejs: LGPL-3.0, https://github.com/zhuker/lamejs
- FFmpeg (ffmpeg.wasm core 0.12.10): GPL-2.0-or-later. Downloaded from jsDelivr on first use and
  checked against its SHA-256 hash.
