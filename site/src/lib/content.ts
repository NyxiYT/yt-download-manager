// Every word on the page. The copy is the brief's section 9, word for word, with the decisions taken on the research
// board (the app's real "Not connected" → "Connected"; "10 languages" only in the trust line). Every fact matches
// README.md; site/CHECKLIST.md lists where each line comes from. Versions, sizes, changelogs, specs and checksums
// live on GitHub only.

export const REPO = 'https://github.com/NyxiYT/yt-download-manager';
export const RELEASES = `${REPO}/releases/latest`;
export const DOWNLOAD_X64 = `${RELEASES}/download/YTDownloadManager-Setup-x64.exe`;
export const EXTENSION_ZIP = `${RELEASES}/download/YTStandaloneDownloader-Extension.zip`;
export const GUIDE = `${REPO}#install`;
export const LINUX_GUIDE = `${REPO}#linux`;
export const CHANGELOG = `${REPO}/blob/main/CHANGELOG.md`;
export const PRIVACY = `${REPO}/blob/main/PRIVACY.md`;
export const LICENSE = `${REPO}/blob/main/LICENSE`;
export const THIRD_PARTY = `${REPO}#license`;
export const ISSUES = `${REPO}/issues/new/choose`;
export const SITE_URL = 'https://nyxiyt.github.io/yt-download-manager/';

// Search engines and link previews: the previous site's tags, unchanged.
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
export const navDownload = 'Download';

export const hero = {
  eyebrow: 'Free for Windows · Open source',
  title: ['Save any YouTube video.', 'Up to 8K.'],
  sub: 'A download button under every video. Pick the quality, click, done.',
  primary: 'Download for Windows',
  secondary: 'Watch it work',
  small: 'Windows 10 and 11 · Chrome, Edge, Brave, Opera, Vivaldi',
  // Linux or macOS: the extension on its own. Phones: the page is for a PC.
  extension: 'Get the browser extension',
  phone: 'Open this page on your PC',
  copyLink: 'Copy link',
};

export const trust = ['No ads', 'No account', 'No tracking', 'Open source', '10 languages'];

export const tryIt = {
  title: 'Try it right here.',
  sub: 'Built from the real toolbar. Click anything.',
  resume: 'Resuming tour',
  tabs: [
    { id: 'video', label: 'Video', caption: 'Pick 144p to 8K. The best quality is already selected.' },
    { id: 'audio', label: 'MP3', caption: 'Just the sound. MP3 with cover art, or M4A, Opus, WAV.' },
    { id: 'trim', label: 'Clip', caption: 'Drag two handles. Keep only the part you need.' },
    { id: 'shorts', label: 'Shorts', caption: 'Every Short gets its own Download button.' },
    { id: 'history', label: 'History', caption: 'All downloads in one place. One click opens the folder.' },
  ],
} as const;
export type TabId = (typeof tryIt.tabs)[number]['id'];

export const how = {
  title: 'Two parts. Zero setup.',
  nodes: [
    { id: 'ext', name: 'Browser extension', text: 'Adds the toolbar to YouTube.' },
    { id: 'app', name: 'Windows app', text: 'Downloads in the background, even after you close the tab.' },
    { id: 'folder', name: 'Your folder', text: 'Files land in Downloads, or wherever you choose.' },
  ],
  foot: 'They find each other on their own.',
  // The app window's own words (manager/YTDownloadManager/Ui/Strings.cs: HomeNotConnected, HomeConnected).
  before: 'Not connected',
  after: 'Connected',
};

export const features = {
  title: 'Built for how you watch.',
  cards: [
    { id: 'quality', title: 'Up to 8K, 60 fps, HDR', text: 'Every quality the video has.' },
    { id: 'resume', title: 'Keeps going', text: 'Close the tab or restart. Downloads pick up again.' },
    { id: 'fast', title: 'Fast', text: 'Big files download in several parts at once.' },
    { id: 'yield', title: 'Your video comes first', text: 'Downloads slow down so your video never stutters.' },
    { id: 'members', title: 'Members and age-restricted', text: 'If your account can watch it, the app can save it.' },
    { id: 'update', title: 'Updates itself', text: 'One click installs new versions. The extension follows.' },
  ],
  chips: ['Thumbnails', 'Subtitles', 'Screenshots', 'Shorts in picture-in-picture', 'Big Picture', 'Loop', 'Light or dark'],
} as const;
export type FeatureId = (typeof features.cards)[number]['id'];

export const oldWay = {
  title: 'No more converter sites.',
  rows: [
    ['Pop-ups and redirects', 'No ads, ever'],
    ['Copy the link, paste, wait', 'One button under the video'],
    ['Quality often capped', 'Up to 8K with HDR'],
    ['Your video goes through their server', 'Straight from YouTube to your PC'],
  ],
  left: 'Converter sites',
  right: 'YT Download Manager',
};

export const install = {
  title: 'Set up in three steps.',
  steps: [
    { n: 1, title: 'Download', text: 'Open the installer. If Windows warns you, click More info, then Run anyway.', loop: '0:07' },
    { n: 2, title: 'Install', text: 'Click Install, then Open. No admin rights needed.', loop: '0:07' },
    { n: 3, title: 'Add to browser', text: 'Click Add to browser. Turn on Developer mode, click Load unpacked, paste, select.', loop: '0:10' },
  ],
  linux: 'Linux or no app? Get the extension on its own.',
  guide: 'Full guide on GitHub',
};

export const faq = [
  { q: 'Is it really free?', a: 'Yes. Free and open source. No ads, no account, no tracking.' },
  { q: 'Why does Windows warn me?', a: "The installer isn't signed with a paid certificate yet. Click More info, then Run anyway." },
  { q: 'Where do my files go?', a: 'Your Downloads folder. You can change it anytime in the app.' },
  { q: 'Does it work on Mac or Linux?', a: 'The app is Windows only. The extension works on its own on Linux. Mac is untested.' },
  { q: 'A download failed. What now?', a: 'Open the clock button to see why and retry. Still stuck? Report it on GitHub.' },
];

export const support = {
  title: 'Made by one person.',
  quote: 'I made this because I hate adware and bloated downloaders.',
  by: 'NyxiYT',
  line: 'Free, built in my spare time. If it saves you time, chip in.',
  donate: 'Donate',
  star: 'Star on GitHub',
  wallets: [
    { id: 'btc', name: 'Bitcoin (BTC)', address: 'bc1qwvn59c0yrhc9xwd9x9hrgwm4exe84xx0tdazdv' },
    {
      id: 'usdt', name: 'USDT (Ethereum, ERC-20)', address: '0x2871854E89Cf7D070e8d569A407B6432Da7F0dF5',
      warning: 'Only send USDT on the Ethereum (ERC-20) network. Other networks will lose the funds.',
    },
  ],
};

export const finalCta = {
  title: 'Stop pasting links.',
  line: 'Get the button under every video.',
  button: 'Download for Windows',
};

export const footer = {
  links: [
    { label: 'GitHub', href: REPO },
    { label: 'Full guide', href: GUIDE },
    { label: 'Changelog', href: CHANGELOG },
    { label: 'Report a bug', href: ISSUES },
    { label: 'Privacy', href: PRIVACY },
    { label: 'License', href: LICENSE },
    { label: 'Third-party licenses', href: THIRD_PARTY },
  ],
  legal: "Only download videos you're allowed to. Not affiliated with YouTube or Google.",
  credit: 'Film: Big Buck Bunny, © Blender Foundation, CC BY 3.0.',
  creditHref: 'https://peach.blender.org/',
  licenseHref: 'https://creativecommons.org/licenses/by/3.0/',
};
