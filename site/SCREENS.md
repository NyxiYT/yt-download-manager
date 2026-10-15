# Vector screens and their references (BRIEF section 13, item 5)

Every screen on the page is rebuilt in HTML, CSS and SVG (BRIEF 7.6). Each one below names its component and the
screenshot in `docs/images/` it follows. All of them have a dark and a light version: the extension follows YouTube's
two themes (`extension/content/content.css`), the app follows its own two (`manager/YTDownloadManager/Ui/UiKit.cs`),
third-party screens use their neutral light or dark look without logos.

"Compared" means the vector and the reference were looked at side by side on 15 Oct 2026; "mapped" means the
component was built from that source but not re-compared in this pass.

| Screen on the page | Component | Reference | Status | Simplified on purpose |
|---|---|---|---|---|
| Toolbar under the player (hero, Try it) | `islands/demo/parts.tsx` `Toolbar` | `toolbar.jpg` | Mapped | Neutral page around it, no YouTube logo |
| Video picker with quality list and Trim | `VideoPicker`, `DropdownList` | `download-video.jpg` | Mapped | — |
| Audio picker | `AudioPicker` | `download-audio.jpg` | Mapped | — |
| Shorts column and menu | `ShortsColumn`, `ShortsMenu` | `shorts.png`, `shorts-menu.png` | Mapped | YouTube's own Shorts buttons drawn as plain circles |
| History button and panel | `HistButton`, `HistPanel` | `download-history.png` | Mapped | — |
| Folder window after "Show in folder" | `FolderWindow` | none (Windows Explorer, neutral) | — | Neutral window, no Windows branding |
| "Windows protected your PC" | `islands/screens.tsx` `Protected` | none in `docs/images` (Windows' own dialog) | — | No logos; stays blue in both themes, as on Windows |
| Browser download done | `DownloadDone` | none (browser's list, neutral) | — | Neutral, no browser logo |
| Installer: Install, progress, Open | `Installer` | `install-1-setup.png`, `install-2-installing.png`, `install-3-ready.png` | Mapped | — |
| App window: Not connected, Copied, Connected | `AppWindow` | `app-window.png`, `app-window-not-connected.png` | Compared | Settings card and footer left out |
| Browser extensions page | `Extensions` | `install-4-extensions-page.png` | Compared | No sidebar, no browser logo, one extension card |
| Folder picker with the pasted path | `FolderDialog` | none (Windows dialog, neutral) | — | Neutral dialog |
| How it works: extension, app, folder | `components/HowItWorks.astro` | `app-window.png` for the status chip | Mapped | Illustrated nodes, not full screens |
| Feature mini-scenes | `components/Features.astro` | the toolbar, history and app screenshots | Mapped | One fact per scene |

Not on the page (they stay on GitHub): `installer-repair.png`, `installer-update.png`, `installer-uninstall.png`,
`settings.png`, the donation QR codes (the Donate dialog renders them from the README's addresses), `social-preview.png`
(the page's link preview image, the one raster image besides the film and its tiles).
