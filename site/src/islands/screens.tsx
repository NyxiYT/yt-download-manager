// The app's windows and the third-party screens around the install, rebuilt as HTML and SVG (styles/screens.css).
// Labels are the app's own English strings (manager/YTDownloadManager/Ui/Strings.cs), sizes and colours come from
// UiKit.cs and Setup/SetupForm.cs; docs/images/ only served to check the result. Simplified on purpose: no version
// numbers, nothing a visitor doesn't need. Windows' and the browser's screens are drawn neutral, without logos.
// Every part the drawn cursor points at carries data-t (see choreo.ts), and shows its hover and pressed look.
import type { ReactNode } from 'react';
import { appIcon } from '../lib/app-icon';
import { useT } from './demo/parts';

const Logo = ({ size, id }: { size: number; id: string }) => <span className="scr-logo" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: appIcon(id, size) }} />;

function TitleBar({ title, icon = true, controls = true }: { title: string; icon?: boolean; controls?: boolean }) {
  return (
    <div className="w-title">
      {icon && <Logo size={16} id={`tb-${title.length}`} />}
      <span>{title}</span>
      {controls && (
        <span className="w-ctl" aria-hidden="true">
          <i className="min" /><i className="max" /><i className="x" />
        </span>
      )}
    </div>
  );
}

function Btn({ t, children, primary = false, className = '' }: { t?: string; children: ReactNode; primary?: boolean; className?: string }) {
  const props = useT(t ?? '');
  return <span className={`w-btn${primary ? ' w-primary' : ''} ${className}`} {...(t ? props : {})}>{children}</span>;
}

// ---------- the installer (SetupForm: 420×300, logo 80, title 15 pt, status, bar, buttons 20 px from the edges) ----------
export type SetupStage = 'start' | 'working' | 'done';
export function Installer({ stage, pct = 0 }: { stage: SetupStage; pct?: number }) {
  return (
    <div className="win w-setup" role="img" aria-label={stage === 'start' ? 'The installer, with its Install button' : stage === 'working' ? 'The installer while installing' : 'The installer when it is done: Ready, with Close and Open'}>
      <TitleBar title="YT Download Manager Setup" controls={stage !== 'working'} />
      <div className="w-body">
        <Logo size={80} id="setup" />
        <p className="w-h">YT Download Manager</p>
        <p className="w-status">{stage === 'working' ? 'Installing…' : stage === 'done' ? 'Ready.' : ''}</p>
        {stage === 'working' && <div className="w-slim"><i style={{ transform: `scaleX(${pct / 100})` }} /></div>}
        <div className="w-btns">
          {stage === 'done' && <Btn t="setup-close">Close</Btn>}
          {stage === 'start' && <Btn t="setup-install" primary>Install</Btn>}
          {stage === 'done' && <Btn t="setup-open" primary>Open</Btn>}
        </div>
      </div>
    </div>
  );
}

// ---------- "Windows protected your PC" (neutral: no logos; the button labels and the flow are Windows' own) ----------
export function Protected({ more }: { more: boolean }) {
  return (
    <div className="win w-ss" role="img" aria-label={more ? 'Windows protected your PC, with Run anyway and Don\'t run' : 'Windows protected your PC, with More info'}>
      <div className="w-ss-x" aria-hidden="true" />
      <div className="w-ss-body">
        <p className="w-ss-h">Windows protected your PC</p>
        <p>This app isn't recognized yet. Running it might put your PC at risk.</p>
        {!more && <Btn t="ss-more" className="w-ss-link">More info</Btn>}
        {more && (
          <dl className="w-ss-app">
            <dt>App:</dt><dd>YTDownloadManager-Setup-x64.exe</dd>
            <dt>Publisher:</dt><dd>Unknown publisher</dd>
          </dl>
        )}
      </div>
      <div className="w-ss-foot">
        {more && <Btn t="ss-run" className="w-ss-btn">Run anyway</Btn>}
        <Btn t="ss-dont" className="w-ss-btn">Don't run</Btn>
      </div>
    </div>
  );
}

// ---------- the browser's download, finished (neutral) ----------
export function DownloadDone() {
  return (
    <div className="win w-dl" role="img" aria-label="The browser's download list with the finished installer">
      <p className="w-dl-h">Recent downloads</p>
      <div className="w-dl-row" {...useT('dl-file')}>
        <span className="w-dl-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"><path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /></svg></span>
        <span className="w-dl-name">YTDownloadManager-Setup-x64.exe<small>Open file</small></span>
      </div>
    </div>
  );
}

// ---------- the app window (HomeForm), simplified: no version, no extra settings ----------
export function AppWindow({ connected, copied = false }: { connected: boolean; copied?: boolean }) {
  return (
    <div className="win w-app" role="img" aria-label={connected ? 'The app window: Browser, Connected' : 'The app window: Browser, Not connected, with Add to browser'}>
      <TitleBar title="YT Download Manager" />
      <div className="w-app-body">
        <div className="w-app-head"><Logo size={44} id="home" /><div><p className="w-h">YT Download Manager</p><p className="w-status">Ready</p></div></div>
        <div className="w-card">
          <p className="w-cap">Saving to</p>
          <p className="w-path">C:\Users\Public\Downloads</p>
          <div className="w-row"><Btn>Open</Btn><Btn>Change…</Btn></div>
        </div>
        <div className="w-card">
          <p className="w-cap">Browser</p>
          <span className={`w-pill${connected ? ' on' : ''}`}><i />{connected ? 'Connected' : 'Not connected'}</span>
          {!connected && <div className="w-row"><Btn t="app-add" primary>Add to browser</Btn></div>}
          {!connected && copied && <p className="w-hint">Turn on Developer mode, click Load unpacked, and paste. The folder path is copied.</p>}
        </div>
      </div>
    </div>
  );
}

// ---------- the browser's extensions page (neutral: no browser name or logo) ----------
export function Extensions({ dev, loaded }: { dev: boolean; loaded: boolean }) {
  return (
    <div className="win w-ext" role="img" aria-label={loaded ? 'The extensions page with YT Standalone Downloader added' : dev ? 'The extensions page with Developer mode on and Load unpacked' : 'The extensions page with the Developer mode switch'}>
      <div className="w-ext-top">
        <span className="w-ext-h">Extensions</span>
        <span className="w-ext-search" aria-hidden="true" />
        <span className="w-ext-dev">Developer mode<span className={`w-switch${dev ? ' on' : ''}`} {...useT('ext-dev')} /></span>
      </div>
      <div className={`w-ext-tools${dev ? ' on' : ''}`}>
        <Btn t="ext-load" className="w-pillbtn">Load unpacked</Btn><Btn className="w-pillbtn">Pack extension</Btn><Btn className="w-pillbtn">Update</Btn>
      </div>
      <div className="w-ext-list">
        {loaded ? (
          <div className="w-ext-card">
            <div className="w-ext-card-top"><Logo size={36} id="ext" /><div><p className="w-ext-name">YT Standalone Downloader</p><p className="w-ext-desc">Download toolbar under YouTube videos.</p></div></div>
            <div className="w-ext-card-foot"><Btn className="w-pillbtn">Details</Btn><Btn className="w-pillbtn">Remove</Btn><span className="w-switch on" /></div>
          </div>
        ) : <div className="w-ext-empty" aria-hidden="true" />}
      </div>
    </div>
  );
}

// ---------- the folder window that Load unpacked opens (neutral) ----------
export function FolderDialog({ path }: { path: string }) {
  return (
    <div className="win w-fd" role="img" aria-label="A folder window: the copied path pasted into its address bar, and Select Folder">
      <TitleBar title="Select the extension directory." icon={false} />
      <div className="w-fd-bar" {...useT('fd-bar')}>{path || <span className="w-fd-ph">Downloads</span>}{path && <span className="w-caret" />}</div>
      <div className="w-fd-list" aria-hidden="true"><i /><i /><i /></div>
      <div className="w-fd-foot"><span className="w-fd-label">Folder:</span><span className="w-fd-field" /><Btn t="fd-select" primary>Select Folder</Btn><Btn>Cancel</Btn></div>
    </div>
  );
}

export function KeyChip({ keys }: { keys: string }) {
  return <span className="w-keys" aria-hidden="true">{keys.split('+').map((k) => <kbd key={k}>{k}</kbd>)}</span>;
}
