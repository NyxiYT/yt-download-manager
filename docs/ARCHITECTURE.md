# How YT Download Manager is built

This is for contributors and security reviewers: what the parts are, how they talk to each other, where
they keep their data, and what they protect against. [CONTRIBUTING.md](../CONTRIBUTING.md) explains how to
build and test them; [SECURITY.md](../SECURITY.md) how to report a problem.

## The parts

| Part | Where it lives | What it does |
|---|---|---|
| Userscript | `yt-standalone-downloader.user.js` | The toolbar under YouTube videos and beside Shorts, the pickers, the history, Big Picture. Downloads in the browser on its own, or hands them to the app |
| Browser extension (Manifest V3) | `extension/` | The same toolbar as the content script: `content/content.js` is generated from the userscript by `extension-build/convert.py`. Its service worker (`background/service-worker.js`) makes the requests the YouTube page may not make, talks to the app, and reads the YouTube sign-in when it is needed |
| Windows app | `manager/YTDownloadManager/` (C#, .NET Framework 4.8, Windows Forms) | A tray app with a local HTTP API on `127.0.0.1`. Keeps the download queue, fetches the streams itself (or with yt-dlp), puts them together with FFmpeg and saves them into a normal folder |
| Installer | `manager/Setup/` | One exe that carries the app, the extension and the tools; installs, updates, repairs and removes |
| Tools | `%LOCALAPPDATA%\YT Download Manager\bin` | yt-dlp (asks YouTube for the stream links, downloads what the app's own downloader doesn't), FFmpeg and ffprobe (merging, converting, checking), Deno or Node.js (the JavaScript runtime yt-dlp needs for YouTube) |

The app's code is sorted by what it does: `Downloads/` (the queue `Jobs.cs`, the own downloader
`Fetch.cs`, yt-dlp answers and stream choice `Media.cs`, error sorting `Errors.cs`, the sign-in `Auth.cs`,
the tools `Components.cs`), `Browser/` (the API `Api.cs`, its proof `AppProof.cs`, pairing helpers), `Ui/` and
`Core/` (start, settings, updates, Windows entries).

### A download, step by step

1. The toolbar sends `POST /v1/jobs` with the video ID, the kind (video, mp3, m4a, opus, wav, thumb, subs) and
   its options. The app checks every field (`ApiServer.BuildJob`) and queues the job.
2. The app asks yt-dlp for the video's details (`yt-dlp -J`). Videos only signed-in viewers may watch go the
   signed-in way (see [The YouTube sign-in](#the-youtube-sign-in)).
3. `Media.Plan` picks the streams: separate video and sound, or a finished stream with both.
4. The own downloader fetches HTTPS streams in ranged pieces, and HLS streams segment by segment, into the
   job's work folder. It continues after a pause, a dropped connection or a restart, gets fresh links when
   YouTube's expire, and slows down while a video plays in the browser (`Bandwidth`, fed by
   `POST /v1/playback`). What it can't handle goes to yt-dlp.
5. FFmpeg merges or converts; ffprobe checks the result.
6. `Deliver` saves the file into the download folder under a free name, through a temporary name of the
   job's own, and the browser sees it as finished in `GET /v1/jobs`.

## The local API

The app listens on `127.0.0.1` only, on port 17724 (or the next free one of the following nine). Every
answer is JSON with `Cache-Control: no-store`, and no answer carries CORS headers, so web pages can't read
them. Before anything else, a request is refused (403) when its `Host` isn't `127.0.0.1:<port>` or
`localhost:<port>` (DNS rebinding), or when its `Origin` is a web page other than YouTube, or `null`
(sandboxed frames, local files). Bodies are at most 30 MB, except a file sent as it is to `/v1/files`
(64 MB).

| Method and path | Token | What it does |
|---|---|---|
| `GET /v1/hello?nonce=` | no | App name, version, port, the extension version next to the app. With a nonce: the proofs (see below) |
| `POST /v1/pair` | no | Asks for a token. Our own extension (by its fixed ID in `Origin`) gets one at once; anything else only after the user allows it in the app's prompt. `auto: true` never opens a prompt |
| `GET /v1/status` | yes | Version, download folder and its state, whether the tools are ready, start with Windows, downloads running, whether a job waits for the sign-in (`sessionWanted`) |
| `GET /v1/jobs?since=&wait=` | yes | The queue; waits up to 30 s for a change after revision `since` (long poll) |
| `POST /v1/jobs` | yes | A new download (see above). Answers with the job, or with the one already running or done |
| `POST /v1/jobs/<id>/pause` `resume` `cancel` `retry` `remove` `reveal` | yes | What the history panel's buttons do; `reveal` shows the file in Explorer |
| `POST /v1/jobs/clear` | yes | Removes finished jobs from the list (not their files) |
| `POST /v1/files?name=&vid=&title=…` | yes | A file the browser made (a screenshot), as it is (`application/octet-stream`); older browsers send JSON with base64 |
| `GET /v1/info?v=&auth=` | yes | The formats of a video as the app sees them, with the sign-in when YouTube wants one (`auth=1`) |
| `POST /v1/session` | yes | The browser's YouTube sign-in as Netscape cookies, or empty for "not signed in". Memory only |
| `POST /v1/playback` | yes | A tab reports its playing video's buffer; downloads slow down while it runs short |
| `POST /v1/pip` | yes | The Shorts picture-in-picture window opened, changed or closed |
| `POST /v1/folder/choose`, `POST /v1/folder/open` | yes | The download folder: Windows' folder picker, or open it in Explorer |

## Pairing, tokens and proofs

**Tokens.** A browser that is allowed in gets a random token (32 bytes) and sends it as `X-YDM-Token` with
every request. The app stores only its SHA-256 (`settings.json`, `tokens`, the last eight browsers).

**Who gets one.** Our extension: at once, recognized by `Origin: chrome-extension://<its fixed ID>` (the ID
comes from the key in `extension/manifest.json`; web pages can't send another extension's origin).
Anything else, the userscript for one: only when the user clicks **Allow** in the app's prompt. The prompt
names the program at the other end of the connection (its port mapped to a process, `LocalPeer`), not only
the name the request gives itself; it doesn't take the keyboard, Enter and Esc mean **Don't allow**, and
**Allow** can only be clicked after a second.

**Proofs: is it really the app?** Another program can listen on the app's port while the app isn't running,
and would then receive tokens, downloads and the sign-in. So the browser makes the app prove itself
(`AppProof`):

- The installer makes a random 32-byte **install key**, keeps it in the data folder (`app-key.json`) and puts
  a copy into the installed extension (`extension/app-key.json`). Web pages can't read extension files (the
  extension has no `web_accessible_resources`).
- The browser asks `GET /v1/hello?nonce=<random>`, without its token. The app answers with
  `proof = HMAC-SHA256(install key, nonce + "|" + port)` and with
  `tokenProofs = [HMAC-SHA256(SHA-256(token), nonce + "|" + port), …]`, one per browser it knows: the browser
  can work out SHA-256 of its own token, the app stores exactly that. The port is part of it, so the app on
  one port can't be used to answer for another.
- The service worker checks the proof **before it pairs**, **before requests with the token**, and **every time
  before it sends the sign-in**. With the install key, only the install-key proof counts; without it (an
  extension loaded from another folder), a proof for its own token. A wrong or missing proof where one is
  due means: the app isn't running. The userscript can't read the install key: it checks its token's proof
  before it sends the token, and relies on the prompt for its first pairing.
- An app from before the proofs answers without them. It still gets downloads, but **never the sign-in**,
  and not even that once the browser has seen a proof from the app or has an install key.

## The YouTube sign-in

For videos YouTube shows only to signed-in viewers (age restricted, members only, private), and, if the
user turned it on in the app's window, after YouTube's "confirm you're not a bot", the app asks YouTube as
the user. A job that needs it sets `sessionWanted`; the toolbar then asks the service worker, which (after the
proof) reads the youtube.com cookies and sends only these: `LOGIN_INFO`, `SID`, `HSID`, `SSID`, `APISID`,
`SAPISID`, `__Secure-1PSID`, `__Secure-3PSID`, `__Secure-1PAPISID`, `__Secure-3PAPISID`, `__Secure-1PSIDTS`,
`__Secure-3PSIDTS`, `PREF`. The app keeps them in memory for at most two hours, writes them to a file in
`work\_auth` only while yt-dlp runs (deleted right after), and logs only their names.

## Where data is kept

All in `%LOCALAPPDATA%\YT Download Manager` (another folder with `YTDM_DATA_DIR`, which the tests use):

| Path | What |
|---|---|
| `settings.json` | Settings: download folder, port, language, start with Windows, downloads at once, speed limit, the bot-check switch, update check, own tool paths, token hashes, what the last update check found |
| `jobs.json` | The queue and the history (the last 300 finished jobs), written atomically: progress of each stream, and a file being saved into the download folder under its temporary name |
| `app-key.json` | The install key (see proofs) |
| `work\<job id>\` | A job's partial and finished streams until it is saved. Removed when the job is done, canceled or removed, and at start for jobs that no longer exist |
| `work\_info\` | yt-dlp's answers (`-J`), one file per lookup, removed after a day |
| `work\_auth\` | Cookie files for one yt-dlp run each, deleted right after it |
| `work\tmp\`, `cache\` | Temporary files, and yt-dlp's cache |
| `work\update\` | The installer of an app update while it is being installed |
| `bin\` | yt-dlp, FFmpeg, ffprobe, Deno or Node.js |
| `logs\manager.log` (`.1`, `.2`) | The log, 1 MB each: video IDs, what happened, the tools' command lines with stream links cut to `<stream-url>`. Never cookie values or tokens |

The app itself is in `%LOCALAPPDATA%\Programs\YT Download Manager` (with the extension in `extension\`). In
the registry (current user only): the `ytdm:` link, the entry in Windows' installed apps, and the
"start with Windows" entry under `Run`.

## Updates

The app asks GitHub where the "latest release" link leads, and reads the release only when the version is
new. It downloads the installer, checks it against the release's `SHA256SUMS.txt` and, from the version
that has a key built in (`update-keys.pem`), installs only when `SHA256SUMS.txt.sig` is that list's
Ed25519 signature by the release workflow's key. The installer replaces the app and the extension folder;
settings, queue and a newer yt-dlp stay. yt-dlp updates itself (`yt-dlp -U`) about once a week.

## Threat model

**Protected against:**

- **Web pages.** They can't use the API: no CORS, a foreign `Origin` is refused, so is `null`, and DNS
  rebinding fails the `Host` check. Nothing on it changes anything without a token.
- **Another program or user on the same PC taking the port** while the app isn't running: it can't prove
  itself, so it gets no token, no requests with one and no sign-in (see proofs). A program that asks for
  pairing is named in the prompt.
- **A changed release or download server.** The installer is checked against signed checksums. Tools the
  app fetches itself are checked against their published checksums, and not used without one.
- **Files planted where any account can write** (`C:\ffmpeg` and the like): not searched for tools.
- **Badly formed requests** (paths, names, IDs, languages, sizes): checked before they reach the queue,
  yt-dlp or the file system; file names are made safe for Windows.

**Not protected against:**

- **Malware running as the same Windows user.** It can read the browser's cookies and the app's data
  folder (install key, token hashes) directly; nothing here can keep those from it.
- **An administrator** of the PC.
- **YouTube and GitHub themselves**, and the tool projects' own releases (yt-dlp, FFmpeg builds, Deno,
  Node.js), beyond checking the published checksums.
- **The userscript's first pairing.** It can't check a proof before it has a token; the user's click in the
  app's own prompt is what makes it safe. It never sends the sign-in.
