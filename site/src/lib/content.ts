// Every text of the page, word for word from the previous site (docs/index.html), in one place: the sections
// and the structured data read it from here, so they can't drift apart. Nothing here may claim more than the
// app does; see README.md and CHANGELOG.md for what is true.
import type { IconName } from './icons';

export const REPO = 'https://github.com/NyxiYT/yt-download-manager';
export const RELEASES = `${REPO}/releases/latest`;
export const DOWNLOAD_X64 = `${RELEASES}/download/YTDownloadManager-Setup-x64.exe`;
export const DOWNLOAD_X86 = `${RELEASES}/download/YTDownloadManager-Setup-x86.exe`;
export const EXTENSION_ZIP = `${RELEASES}/download/YTStandaloneDownloader-Extension.zip`;
export const SUMS = `${RELEASES}/download/SHA256SUMS.txt`;
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

export const hero = {
  title: 'YT Download Manager',
  lead: 'A free, open-source YouTube downloader for Windows. Download videos in up to 8K quality, convert YouTube to MP3, and save Shorts, thumbnails and subtitles with one click, right from a toolbar under every video.',
  badges: 'Free · No ads · No account · Windows 10 and 11 · Works with Chrome, Edge, Brave and other Chromium browsers',
  // From the README: the app is for Windows; the extension can be used on its own on Linux and macOS (not tested on macOS).
  otherOs: "Not on Windows? The app doesn't run on Linux or macOS, but the browser extension can be used on its own (on macOS it isn't tested).",
};

export interface Feature {
  title: string;
  text: string;
  icon: IconName;
}

export const features: Feature[] = [
  { title: 'Videos in up to 8K quality', text: 'Every resolution the video has, from 144p to 4320p (8K), with 60 fps and HDR where YouTube offers them.', icon: 'video' },
  { title: 'YouTube to MP3', text: 'Save just the audio as MP3 with cover art, or as M4A, Opus or WAV.', icon: 'music' },
  { title: 'YouTube Shorts downloader', text: 'Every Short gets a Download button beside it.', icon: 'download' },
  { title: 'Clips', text: 'Set a start and end time to download only the part you need.', icon: 'scissors' },
  { title: 'Thumbnails, subtitles, screenshots', text: "Save a video's preview picture, its subtitles, or the frame you are watching.", icon: 'image' },
  { title: 'Fast and reliable', text: 'The Windows app downloads in several parts at once, keeps going when you close the tab, and resumes after a restart.', icon: 'dlLine' },
  { title: 'Age-restricted and members-only videos', text: 'If your YouTube account may watch a video, the app can download it too.', icon: 'okCircle' },
  { title: 'Your video comes first', text: 'Downloads slow down for a moment when the video you are watching needs the connection.', icon: 'timer' },
  { title: 'Updates itself', text: 'When a new version is out, one click installs it, and the browser extension follows on its own. Install with Scoop if you like.', icon: 'refresh' },
  { title: '10 languages', text: 'The extension and the app speak English, German, Spanish, French, Italian, Portuguese, Polish, Russian, Japanese and Chinese.', icon: 'language' },
];

// "See it in action", one chapter per part of the scroll story.
export const showcase = [
  {
    id: 'quality',
    eyebrow: 'Quality',
    title: 'Download a video in the quality you want',
    text: 'Click the camera button under any video, pick a quality from 144p up to 8K and click Download. Drag the two dots under Trim to keep only a part of it.',
  },
  {
    id: 'mp3',
    eyebrow: 'MP3',
    title: 'Turn any video into an MP3',
    text: "The music note button saves just the sound: MP3 up to 320 kb/s with the video's picture as cover art, or M4A, Opus or WAV.",
  },
  {
    id: 'clips',
    eyebrow: 'Clips',
    title: 'Clips',
    text: 'Set a start and end time to download only the part you need.',
  },
  {
    id: 'shorts',
    eyebrow: 'Shorts',
    title: 'Download Shorts',
    text: 'Every Short gets a Download button beside it, with the same choices: the video, the sound, the thumbnail, the subtitles or a screenshot.',
  },
  {
    id: 'history',
    eyebrow: 'History',
    title: 'All your downloads in one place',
    text: 'A clock button in YouTube\'s top bar shows what is downloading, what is done and where it was saved. One click opens the folder.',
  },
] as const;

export const faq = [
  { q: 'Is YT Download Manager free?', a: 'Yes. It is free and open source under the MIT License, with no ads, no accounts and no tracking.' },
  { q: 'Can it download YouTube videos in 4K or 8K?', a: 'Yes. You can pick any quality YouTube offers for a video, from 144p up to 4320p (8K), with 60 fps and HDR where YouTube offers them. 1440p, 4K and 8K need the Windows app.' },
  { q: 'Can it convert YouTube to MP3?', a: "Yes. Save just the audio as MP3 (up to 320 kb/s, with the video's picture as cover art), M4A, Opus or WAV." },
  { q: 'Can it download YouTube Shorts?', a: 'Yes. Every Short gets a Download button beside it, with the same choices as normal videos.' },
  { q: 'Where are the downloaded files saved?', a: 'In your Downloads folder, unless you pick another folder in the app.' },
  // The page shows the question with quotation marks; the structured data keeps the previous wording without them.
  { q: 'Why does Windows say "Windows protected your PC"?', ldQ: 'Why does Windows say Windows protected your PC?', a: 'Windows shows this for new apps that are not signed with a paid certificate. Click More info, then Run anyway. The checksums of every file are published with each release.' },
];

export const checksumCommands = [
  { label: 'Windows (PowerShell)', command: 'Get-FileHash .\\YTDownloadManager-Setup-x64.exe -Algorithm SHA256' },
  { label: 'Linux', command: 'sha256sum -c SHA256SUMS.txt --ignore-missing' },
];

export const legal =
  "Only download videos you are allowed to download. You are responsible for following YouTube's Terms of Service and the copyright laws of your country. This project is not affiliated with YouTube or Google.";
