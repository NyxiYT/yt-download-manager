// Every text on the page, in one place. Facts come only from README.md, CHANGELOG.md, PRIVACY.md, the source and the
// GitHub API; most sentences are the README's own words. Nothing here may claim more than the app does.
import type { SiteIconName } from './site-icons';

export const REPO = 'https://github.com/NyxiYT/yt-download-manager';
export const RELEASES = `${REPO}/releases/latest`;
export const DOWNLOAD_X64 = `${RELEASES}/download/YTDownloadManager-Setup-x64.exe`;
export const DOWNLOAD_X86 = `${RELEASES}/download/YTDownloadManager-Setup-x86.exe`;
export const EXTENSION_ZIP = `${RELEASES}/download/YTStandaloneDownloader-Extension.zip`;
export const USERSCRIPT = `${RELEASES}/download/yt-standalone-downloader.user.js`;
export const SUMS = `${RELEASES}/download/SHA256SUMS.txt`;
export const CHANGELOG = `${REPO}/blob/main/CHANGELOG.md`;
export const PRIVACY = `${REPO}/blob/main/PRIVACY.md`;
export const LICENSE = `${REPO}/blob/main/LICENSE`;
export const ISSUES = `${REPO}/issues/new/choose`;
export const DISCUSSIONS = `${REPO}/discussions`;
export const README = `${REPO}#readme`;
export const SITE_URL = 'https://nyxiyt.github.io/yt-download-manager/';

export const seo = {
  title: 'YT Download Manager – Free YouTube Downloader for Windows (8K, MP3, Shorts)',
  description:
    'Free, open-source YouTube downloader for Windows. Download videos in up to 8K quality, convert YouTube to MP3, and save Shorts, thumbnails and subtitles with one click from a toolbar under every video.',
  keywords:
    'YouTube downloader, YouTube video downloader, YouTube to MP3, YouTube Shorts downloader, 8K YouTube downloader, 4K YouTube downloader, free YouTube downloader for Windows, yt-dlp GUI, Chrome extension YouTube download',
  ogTitle: 'YT Download Manager – Free YouTube Downloader for Windows',
  ogDescription:
    'Download videos in up to 8K quality, YouTube to MP3, Shorts, thumbnails and subtitles from a toolbar under every video. Free and open source.',
  twitterDescription:
    'Download videos in up to 8K quality, YouTube to MP3, Shorts, thumbnails and subtitles. Free and open source.',
  ldDescription:
    'Free, open-source YouTube downloader for Windows. Download videos in up to 8K quality, convert YouTube to MP3, and save Shorts, thumbnails and subtitles from a toolbar under every video.',
};

export const nav = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#install', label: 'Install' },
  { href: '#faq', label: 'FAQ' },
];

export const hero = {
  eyebrow: 'YT Download Manager',
  title: 'Up to 8K, right under the video.',
  lead: 'A free, open-source YouTube downloader for Windows. A small toolbar under every video, and an app that does the downloading in the background.',
  caption: 'Interactive illustration of the real toolbar. Click anything, or let it run.',
  otherOs: {
    linux: "The Windows app doesn't run on Linux. You can still use the browser extension on its own.",
    mac: "There's no app for macOS. The browser extension can be used on its own, but it isn't tested there.",
    touch: 'YT Download Manager runs on a PC: a browser extension and a Windows app.',
  },
};

// The trust strip: facts only, each with where it is written down.
export const facts = [
  { k: 'License', v: 'MIT', href: LICENSE },
  { k: 'Engine', v: 'yt-dlp and FFmpeg', href: `${REPO}#license` },
  { k: 'Ads', v: 'None', href: PRIVACY },
  { k: 'Account', v: 'None', href: PRIVACY },
  { k: 'Tracking', v: 'None', href: PRIVACY },
  { k: 'Browsers', v: 'Chrome, Edge, Brave, Opera, Vivaldi', href: `${REPO}#system-requirements-and-compatibility` },
];

// "Download" as the extension writes it (extension/content/i18n.js, key "download").
export const downloadWords = [
  { lang: 'en', code: 'EN', word: 'Download' },
  { lang: 'de', code: 'DE', word: 'Herunterladen' },
  { lang: 'es', code: 'ES', word: 'Descargar' },
  { lang: 'fr', code: 'FR', word: 'Télécharger' },
  { lang: 'it', code: 'IT', word: 'Scarica' },
  { lang: 'pt', code: 'PT', word: 'Baixar' },
  { lang: 'pl', code: 'PL', word: 'Pobierz' },
  { lang: 'ru', code: 'RU', word: 'Скачать' },
  { lang: 'ja', code: 'JA', word: 'ダウンロード' },
  { lang: 'zh-Hans', code: 'ZH', word: '下载' },
];
export const languageNames = 'English, German, Spanish, French, Italian, Portuguese, Polish, Russian, Japanese and Chinese';

export const twoParts = {
  title: 'Two parts, one tool.',
  lede: 'YT Download Manager has two parts that work together.',
  a: {
    side: 'Side A',
    name: 'The browser extension',
    text: 'Adds a small toolbar under every YouTube video and buttons beside every Short. This is where you pick what to download.',
    alt: 'The download toolbar under a YouTube video in dark mode',
  },
  b: {
    side: 'Side B',
    name: 'The Windows app',
    text: 'Does the downloading in the background. It saves the files to a folder on your PC, converts them, and keeps going even when you close the tab.',
    alt: 'The app window: saving to the Downloads folder, the browser connected, settings',
  },
  caption: 'The extension finds the app on its own. There is nothing to set up.',
};

// "How to use", chapter by chapter, in the README's words.
export const chapters = [
  {
    id: 'video', counter: '01', title: 'Download a video', loop: '0:09',
    steps: ['Open a video on YouTube.', 'Click the camera button (the first button in the toolbar under the video).', 'Pick a Quality. The highest one is already selected. The size of the file is shown next to it.', 'Click Download.'],
  },
  {
    id: 'trim', counter: '02', title: 'Trim a clip', loop: '0:08',
    steps: ['Open the camera button\'s picker.', 'Drag the two dots under Trim to keep only a part of the video.', 'Click Download.'],
  },
  {
    id: 'audio', counter: '03', title: 'Download music as MP3', loop: '0:08',
    steps: ['Click the music note button in the toolbar.', 'Pick a Format. MP3 at 320 kb/s works on every device and gets the video\'s picture as cover art.', 'Click Download.'],
  },
  {
    id: 'shorts', counter: '04', title: 'Download a Short', loop: '0:07',
    steps: ['Open a Short.', 'Click Download beside the Short (above YouTube\'s like button).', 'Pick what you want: the video, the audio, the thumbnail, the subtitles or a screenshot.'],
  },
  {
    id: 'history', counter: '05', title: 'Find your downloads', loop: '0:10',
    steps: ['Click the clock button in YouTube\'s top bar, next to YouTube\'s own buttons. It lists your downloads.', 'While something downloads, a ring around the clock fills up to show the progress.', 'Click the folder icon next to a download to open the folder it is in.'],
  },
] as const;
export type ChapterId = (typeof chapters)[number]['id'];

export interface Feature { name: string; text: string; icon: SiteIconName; tag?: string; shot?: string }
export const featureGroups: { id: string; title: string; note?: string; items: Feature[] }[] = [
  {
    id: 'downloading', title: 'Downloading',
    items: [
      { name: 'Up to 8K quality', icon: 'resolution', tag: '1440p+ with the app', shot: 'download-video', text: 'Every resolution the video has, from 144p up to 4320p (8K), with 60 fps and HDR where YouTube offers them. The highest one is picked for you.' },
      { name: 'YouTube to MP3', icon: 'note', shot: 'download-audio', text: "Save just the audio as MP3 (with the video's picture as cover art), M4A, Opus or WAV." },
      { name: 'Only the part you need', icon: 'trim', text: 'Set a start and end time to download a short clip instead of the whole video.' },
      { name: 'Thumbnails', icon: 'picture', text: "Save a video's preview picture in full size. Shorts also offer their tall portrait picture." },
      { name: 'Subtitles', icon: 'subtitles', text: "Save the video's subtitles as a file." },
      { name: 'Screenshots', icon: 'frame', text: 'Save the exact frame you are watching as a picture.' },
      { name: 'YouTube Shorts', icon: 'short', shot: 'shorts-menu', text: 'Every Short gets a Download button beside it, with the same choices as normal videos.' },
      { name: 'Age-restricted and members-only videos', icon: 'key', tag: 'with the app', text: 'If your YouTube account may watch a video, the app can download it too, using your own sign-in from the browser.' },
    ],
  },
  {
    id: 'app', title: 'The app', note: 'The Windows app',
    items: [
      { name: 'Saves to any folder', icon: 'folder', shot: 'app-window', text: 'Your Downloads folder by default. You can pick another one at any time.' },
      { name: 'Fast', icon: 'parts', text: 'Large files are downloaded in several parts at once.' },
      { name: 'Keeps going', icon: 'resume', text: 'Downloads continue when you close the tab, and pick up again after a restart.' },
      { name: 'Your video comes first', icon: 'yield', text: "When the video you are watching needs the connection, downloads slow down for a moment so your video doesn't stutter." },
      { name: 'Runs quietly', icon: 'tray', text: 'It starts with Windows and waits in the system tray (the small icons next to the clock).' },
      { name: 'Light or dark', icon: 'contrast', text: 'The app and its installer follow your Windows setting for light or dark mode.' },
      { name: 'Updates itself', icon: 'update', text: 'When a new version is out, one click installs it. The browser extension follows on its own.' },
      { name: 'Easy to repair or remove', icon: 'repair', text: 'Open the installer again and pick Repair or Uninstall.' },
      { name: 'Stays up to date with YouTube', icon: 'engine', text: 'Its download engine (yt-dlp) updates itself about once a week.' },
      { name: 'Connects by itself', icon: 'link', text: 'The extension finds the app on its own. There is nothing to set up.' },
    ],
  },
  {
    id: 'watching', title: 'Watching',
    items: [
      { name: 'Download history', icon: 'clock', shot: 'download-history', text: 'A clock button in YouTube\'s top bar shows your downloads, their progress and where they were saved.' },
      { name: 'Big Picture', icon: 'corner', text: 'Keeps the video in view in a corner while you scroll through comments.' },
      { name: 'Picture-in-picture for Shorts', icon: 'pip', text: "Watch Shorts in a small window on top of your other windows. Scroll or use the arrow keys to go to the next Short. The window keeps the video's shape when you resize it." },
      { name: 'Back and forward through Shorts', icon: 'backforth', text: 'Going back shows the Shorts you already watched, in order.' },
      { name: 'Loop and theme', icon: 'loop', text: 'Repeat a video, or switch YouTube between light and dark with one click.' },
      { name: '10 languages', icon: 'language', shot: 'settings', text: `The extension and the app speak ${languageNames}.` },
    ],
  },
];

export const compare = {
  title: 'The same video, with and without the app.',
  lede: 'With the Windows app, you get every quality YouTube offers for a video, up to 8K (4320p), including 60 fps and HDR. Without the app, the browser only gets what YouTube gives it directly: usually up to 1080p.',
  left: { label: 'The extension alone', value: 'Usually up to 1080p' },
  right: { label: 'With the Windows app', value: 'Up to 4320p, 60 fps, HDR' },
};

export const numbers = [
  { value: 4320, suffix: 'p', label: 'Highest resolution', caption: 'Every resolution the video has, from 144p up to 4320p (8K), with 60 fps and HDR where YouTube offers them.' },
  { value: 320, suffix: ' kb/s', label: 'MP3', caption: "MP3 at 320 kb/s works on every device and gets the video's picture as cover art." },
  { value: 10, suffix: '', label: 'Languages', caption: `The extension and the app speak ${languageNames}.` },
  { value: 1.5, suffix: ' MB', decimals: 1, label: 'Waiting in the tray', caption: 'What the app usually uses while it waits (2.5 MB at most). Measured with the 64-bit app on Windows 11.' },
];

export interface InstallStep { title: string; body: string[]; shot?: { src: string; alt: string }; illustration?: 'smartscreen' | 'download'; list?: string[] }
export const installSteps: InstallStep[] = [
  { title: 'Download', body: ['Download YTDownloadManager-Setup-x64.exe and open it.'], illustration: 'download' },
  { title: 'Windows protected your PC', body: ['If Windows shows "Windows protected your PC", click More info, then Run anyway.', "Windows shows this for new apps that aren't signed with a paid certificate."], illustration: 'smartscreen' },
  { title: 'Click Install', body: ["You don't need administrator rights. The app installs only for your Windows user."], shot: { src: 'install-1-setup', alt: 'The installer' } },
  { title: 'Wait a few seconds', body: ['It installs.'], shot: { src: 'install-2-installing', alt: 'The installer while installing' } },
  { title: 'Click Open', body: [], shot: { src: 'install-3-ready', alt: 'The installer when it is done' } },
  { title: 'Click "Add to browser"', body: ['Your browser opens its extensions page, and the app copies the extension\'s folder path for you (it is now on your clipboard).'], shot: { src: 'app-window-not-connected', alt: 'The app window before the extension is added' } },
  {
    title: 'Add the extension to your browser', body: ['The extension now shows up on the page.'],
    list: ['Turn on Developer mode (the switch in the top right corner).', 'Click Load unpacked (top left).', 'A folder window opens. Click into its address bar at the top, press Ctrl+V to paste the path, and press Enter.', 'Click Select Folder.'],
    shot: { src: 'install-4-extensions-page', alt: "The browser's extensions page with Developer mode on and the extension added" },
  },
  { title: 'Open any YouTube video', body: ['If YouTube was already open, refresh the tab first (press F5). The toolbar appears under the video, and the app window now says Connected.', "That's it. From now on the app starts with Windows, and the extension connects to it by itself."], shot: { src: 'toolbar', alt: 'The download toolbar under a YouTube video' } },
];

export const scoop = {
  commands: ['scoop bucket add nyxiyt https://github.com/NyxiYT/yt-download-manager', 'scoop install nyxiyt/yt-download-manager'],
  after: 'Scoop picks the 64-bit or 32-bit version for you. Then open YT Download Manager from the Start menu and continue with step 6 of the 64-bit guide to add the extension.',
};

export const linux = {
  intro: "The Windows app doesn't run on Linux. You can still use the browser extension on its own, in Chrome, Chromium, Edge, Brave, Opera or Vivaldi:",
  steps: [
    'Download YTStandaloneDownloader-Extension.zip and unzip it into a folder you keep (for example ~/yt-extension).',
    'Open chrome://extensions in your browser.',
    'Turn on Developer mode and click Load unpacked.',
    'Select the unzipped folder (the one that contains manifest.json).',
    'Open a YouTube video. The toolbar appears under it.',
  ],
  sandboxes: [
    "Snap (Chromium on Ubuntu): unzip into a folder in your home folder that doesn't start with a dot, like ~/yt-extension.",
    "Flatpak (from Flathub): unzip into the browser's own folder, for example ~/.var/app/com.google.Chrome/yt-extension for Chrome, or let the browser see your folder with flatpak override --user --filesystem=~/yt-extension com.google.Chrome.",
  ],
  caveat: "Without the app, the extension downloads inside the browser. YouTube blocks this on some internet connections. Vivaldi asks where to save each download (its own setting). Opera on Linux has no H.264, so its preview player can't play MP4 files; the downloaded files themselves are fine.",
};

export const checksums = {
  title: 'Unsigned builds and checksums',
  text: 'The Windows installers are currently not code-signed. Windows SmartScreen may show "Windows protected your PC" the first time you open one: click More info, then Run anyway.',
  sums: 'Every release ships SHA256SUMS.txt with the SHA-256 checksum of each of its files. To check a download, compare its checksum with the one listed for that file.',
  commands: [
    { label: 'Windows (PowerShell)', command: 'Get-FileHash .\\YTDownloadManager-Setup-x64.exe -Algorithm SHA256' },
    { label: 'Linux, in the folder with the downloads', command: 'sha256sum -c SHA256SUMS.txt --ignore-missing' },
  ],
};

export type Result = 'yes' | 'no';
export const platforms: { name: string; result: Result; text: string }[] = [
  { name: 'Windows 11 (x64)', result: 'yes', text: 'App and extension: install, upgrade, uninstall, downloads up to 8K, other languages and regions' },
  { name: 'Windows 11 on ARM', result: 'yes', text: "Both installers, through Windows' emulation" },
  { name: 'Windows 10 22H2 (x64)', result: 'yes', text: "Extension; the app's install, upgrade and uninstall" },
  { name: 'Windows 10 22H2 (32-bit)', result: 'yes', text: 'App and extension: install, upgrade, uninstall, standard user, downloads, a dropped connection, display scaling up to 200 %, two monitors' },
  { name: 'Windows Server 2022 and 2025', result: 'yes', text: 'App: both installers, standard user, long paths, other regions' },
  { name: 'Windows 7 and 8.1', result: 'no', text: 'Not supported. Chrome and Edge stopped at version 109 there, and the tools the app brings need Windows 10' },
  { name: 'Ubuntu 22.04 and 24.04, Debian 12, Fedora 44, Arch, Linux Mint 22.3', result: 'yes', text: 'Extension (no app on Linux), on GNOME and KDE, X11 and Wayland' },
  { name: 'macOS', result: 'no', text: "No app. The extension isn't tested there" },
];
export const browsers: { name: string; result: Result; text: string }[] = [
  { name: 'Google Chrome', result: 'yes', text: 'Windows and Linux (also from Flatpak)' },
  { name: 'Microsoft Edge', result: 'yes', text: 'Windows and Linux' },
  { name: 'Chromium', result: 'yes', text: 'Linux: Debian, Fedora, Arch and Mint packages, Snap and Flatpak' },
  { name: 'Brave', result: 'yes', text: 'Linux (also from Flatpak)' },
  { name: 'Opera', result: 'yes', text: "Linux. No H.264 there, so the preview player can't play MP4 files (it says so)" },
  { name: 'Vivaldi', result: 'yes', text: 'Linux. Asks where to save each download' },
  { name: 'Firefox and Firefox ESR', result: 'no', text: 'Not supported by the extension' },
];
export const requirements = [
  { k: 'Windows', v: "Windows 10 or 11: 64-bit, 32-bit or ARM. Windows 7 and 8.1 aren't supported" },
  { k: 'Browser', v: 'Chrome, Edge, Chromium, Brave, Opera or Vivaldi, version 111 or newer. Not Firefox' },
  { k: 'Memory', v: '2 GB. The app uses under 2 MB while it waits and up to about 250 MB while several downloads run at once, plus yt-dlp and FFmpeg while they work' },
  { k: 'Disk space', v: 'About 300 MB for the 64-bit app (230 MB for 32-bit), plus space for your downloads. While a video downloads, it needs about twice its size for a moment' },
  { k: 'Internet', v: 'Needed for every download' },
  { k: 'Other software', v: 'None. The installer brings everything it needs: yt-dlp, FFmpeg, and Deno (64-bit) or Node.js (32-bit). .NET Framework 4.8 is already part of Windows 10 (version 1903 and newer) and Windows 11' },
];
export const qualityNote = {
  big: 'An hour of 8K video is about 14 GB.',
  text: 'Playing 8K files smoothly needs a fast PC. Downloading them works on every PC the app runs on.',
};

// The first six keep the previous site's wording (and its structured data); the rest are the README's FAQ.
export interface Faq { q: string; a: string; ldQ?: string; group: 'about' | 'using' | 'fixing'; links?: { label: string; href: string }[] }
export const faq: Faq[] = [
  { group: 'about', q: 'Is YT Download Manager free?', a: 'Yes. It is free and open source under the MIT License, with no ads, no accounts and no tracking.' },
  { group: 'about', q: 'Can it download YouTube videos in 4K or 8K?', a: 'Yes. You can pick any quality YouTube offers for a video, from 144p up to 4320p (8K), with 60 fps and HDR where YouTube offers them. 1440p, 4K and 8K need the Windows app.' },
  { group: 'about', q: 'Can it convert YouTube to MP3?', a: "Yes. Save just the audio as MP3 (up to 320 kb/s, with the video's picture as cover art), M4A, Opus or WAV." },
  { group: 'about', q: 'Can it download YouTube Shorts?', a: 'Yes. Every Short gets a Download button beside it, with the same choices as normal videos.' },
  { group: 'using', q: 'Where are the downloaded files saved?', a: 'In your Downloads folder, unless you pick another folder in the app.' },
  { group: 'fixing', q: 'Why does Windows say "Windows protected your PC"?', ldQ: 'Why does Windows say Windows protected your PC?', a: 'Windows shows this for new apps that are not signed with a paid certificate. Click More info, then Run anyway. The checksums of every file are published with each release.' },
  { group: 'about', q: 'Does it collect data?', a: 'No. There are no ads, no accounts and no tracking. The extension talks only to YouTube, to the app on your own PC, and to jsDelivr (a public file host) to fetch FFmpeg if the browser has to convert a file itself. The app asks GitHub for a new version when it starts or is used, at most every 10 minutes, and every 12 hours otherwise. That request carries nothing about you or your PC. To turn it off, open the app, click Advanced at the bottom of its window and turn off Look for new versions.', links: [{ label: 'Every connection is listed in the privacy policy', href: PRIVACY }] },
  { group: 'using', q: 'How do I update?', a: 'The app does it for you (version 1.9.0 and newer). When a new version is out, a notification says so. Click it, or click Update in the app window or at the top of the tray icon\'s menu. The app downloads the new version, installs it and starts again. Your settings and downloads stay. The browser extension updates itself as well, as soon as no YouTube tab is open. Installed with Scoop? scoop update yt-download-manager works too.' },
  { group: 'using', q: 'Can the app use my own yt-dlp?', a: "Yes. Open the app, click Advanced at the bottom of its window, then Use my own… and pick your yt-dlp.exe. The app checks that it answers with a yt-dlp version. It doesn't update your copy, so keep it up to date yourself; Use the built-in one goes back to the copy the app keeps up to date." },
  { group: 'fixing', q: 'What do I do when a download fails?', a: "Open the download history (the clock button). It shows the reason and, often, a button to try again. Make sure the app is running: its icon should be in the system tray, next to the clock. Try again a few minutes later; YouTube sometimes refuses downloads for a short while. Still failing? Open an issue and add the app's log: open the app, click Diagnostics, and attach manager.log.", links: [{ label: 'Open an issue', href: ISSUES }] },
  { group: 'fixing', q: 'Something is broken. How do I repair the app?', a: "Open the installer again (the same version you have). It offers Repair. Click it. This puts back all of the app's files and tools and keeps your settings." },
  { group: 'fixing', q: 'How do I uninstall?', a: "Open the installer again and click Uninstall. It asks once more before it removes anything. You can also uninstall it like any other app, in Windows Settings → Apps → Installed apps. Uninstalling removes everything the app put on your PC; your downloaded videos stay where they are. Afterwards, click Remove on the YT Standalone Downloader card in chrome://extensions." },
];
export const faqGroups = [
  { id: 'about', title: 'About the app' },
  { id: 'using', title: 'Using it' },
  { id: 'fixing', title: 'Fixing things' },
] as const;

export const maker = {
  // The maker's own reason, in their words (lightly tidied for spelling).
  letter: [
    'I made this because I hate adware, and downloaders that ship with bloatware, take up space for nothing and still don\'t support what I want.',
  ],
  pull: 'This project is free and made in my spare time.',
  sign: 'NyxiYT',
  donate: 'If it saves you time, you can support it with a donation. Thank you!',
  wallets: [
    { name: 'Bitcoin (BTC)', address: 'bc1qwvn59c0yrhc9xwd9x9hrgwm4exe84xx0tdazdv', qr: 'donate-btc', alt: 'QR code for the Bitcoin address' },
    { name: 'USDT (Ethereum, ERC-20)', address: '0x2871854E89Cf7D070e8d569A407B6432Da7F0dF5', qr: 'donate-usdt-erc20', alt: 'QR code for the USDT address on Ethereum (ERC-20)', warning: 'Only send USDT on the Ethereum (ERC-20) network. Other networks will lose the funds.' },
  ],
};

export const closing = {
  title: "That's it.",
  text: 'From now on the app starts with Windows, and the extension connects to it by itself.',
};

export const legal =
  "This tool is meant for downloading videos you are allowed to download: your own videos, videos with a free license (such as Creative Commons), or videos you have permission to save. You are responsible for following YouTube's Terms of Service and the copyright laws of your country. This project is not affiliated with, endorsed by, or connected to YouTube or Google.";

export const thirdParty = [
  { name: 'yt-dlp', license: 'The Unlicense', href: 'https://github.com/yt-dlp/yt-dlp' },
  { name: 'FFmpeg', license: 'GNU GPL 3.0 or later', href: 'https://ffmpeg.org' },
  { name: 'Deno (64-bit installer)', license: 'MIT', href: 'https://github.com/denoland/deno' },
  { name: 'Node.js (32-bit installer)', license: 'MIT', href: 'https://nodejs.org' },
  { name: 'lamejs (extension, MP3)', license: 'LGPL 3.0', href: 'https://github.com/zhuker/lamejs' },
  { name: 'ffmpeg.wasm (extension, when needed)', license: 'GPL 2.0 or later', href: 'https://github.com/ffmpegwasm/ffmpeg.wasm' },
];
