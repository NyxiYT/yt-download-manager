// Compatibility run of the browser extension in one Chromium-based browser: loads the unpacked extension,
// then checks its background worker, options page and popup, and on a YouTube video the toolbar, Big Picture
// with the scroll-to-mini-player switch, picture-in-picture, the download history, the message about the
// Windows app, the quality list, a thumbnail and a video downloaded in the browser, the preview player, a
// Short, a playlist and a right-to-left page. Writes one result per area to <out>.json and exits with 1
// when any area failed. Areas that need YouTube to answer this machine count as skipped when it refuses.
//
// usage: node ext-check.js --browser <path> --out <file> [--ext <dir>] [--name <label>] [--headless]
//        [--port <n>] [--launcher "<command> <args>"] [--profile <dir>] [--skip <area,...>] [--only <area,...>]
//        [--extra "<switches>"] [--app]
// --app: the Windows app is installed and running; checks the connection to it (and starting it).
// --launcher runs the browser through a wrapper (flatpak run ...); such browsers are driven over a
// debugging port instead of a pipe, and load the extension with --load-extension.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const BROWSER = opt('browser');
const OUT = opt('out', 'ext-result.json');
const EXT = path.resolve(opt('ext', path.join(__dirname, '..', '..', 'extension')));
const NAME = opt('name', path.basename(BROWSER || 'browser'));
const LAUNCHER = opt('launcher', '');
const PORT = Number(opt('port', 9333));
const PROFILE = opt('profile', fs.mkdtempSync(path.join(os.tmpdir(), 'ysd-')));
const SKIP = new Set(opt('skip', '').split(',').filter(Boolean)); // areas not to run here
const EXTRA = opt('extra', '').split(' ').filter(Boolean); // more browser switches
const ONLY = new Set(opt('only', '').split(',').filter(Boolean)); // run just these areas
const APP = flag('app'); // the Windows app is installed and running
const DOWNLOADS = path.join(PROFILE, 'Downloads');
const EXT_ID = 'cgjpjebkpfjhaedhimgenbemfmgmkmjj';
const VIDEO = 'jNQXAC9IVRw'; // "Me at the zoo": 19 seconds, always there
fs.mkdirSync(DOWNLOADS, { recursive: true });

const result = { name: NAME, browser: BROWSER, platform: `${os.type()} ${os.release()} ${os.arch()}`, session: sessionKind(), areas: {} };
function sessionKind() {
  if (process.platform !== 'linux') return process.platform;
  const desktop = process.env.XDG_CURRENT_DESKTOP || 'none';
  return `${desktop} on ${process.env.WAYLAND_DISPLAY ? 'Wayland' : process.env.DISPLAY ? 'X11' : 'headless'}`;
}
fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
const save = () => fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- DevTools protocol over a pipe or a port ----------
let send, onEvent = () => {};
const pending = new Map();
let seq = 0;
function dispatch(msg) {
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else onEvent(msg);
}
function request(write) {
  return (method, params = {}, sessionId, timeout = 30000) => new Promise((resolve, reject) => {
    const id = ++seq;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, timeout);
    pending.set(id, (m) => { clearTimeout(timer); m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result); });
    write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

let child;
let stderr = '';
// Starts the browser with the given switches, talking over a pipe (file descriptors 3 and 4). Resolves with
// the browser's version, or rejects when it doesn't answer.
async function startPipe(cmd, argv) {
  child = spawn(cmd, argv, { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
  const me = child;
  me.stdio[2].on('data', (d) => { stderr = (stderr + d).slice(-4000); });
  for (const s of me.stdio.slice(2)) s.on('error', () => {}); // a browser that closes the pipe just stops answering
  me.on('exit', (c) => { result.browserExit = c; result.browserStderr = stderr.slice(-1500); });
  let buf = Buffer.alloc(0);
  me.stdio[4].on('data', (d) => {
    buf = Buffer.concat([buf, d]);
    let i;
    while ((i = buf.indexOf(0)) >= 0) { dispatch(JSON.parse(buf.subarray(0, i).toString('utf8'))); buf = buf.subarray(i + 1); }
  });
  send = request((x) => { if (!me.stdio[3].destroyed) me.stdio[3].write(x + '\0'); });
  return (await send('Browser.getVersion', {}, undefined, 45000)).product;
}

// The same over a debugging port (for browsers in a sandbox that keeps the pipe out).
async function startPort(cmd, argv) {
  child = spawn(cmd, argv, { stdio: ['ignore', 'ignore', 'pipe'] });
  child.stderr.on('data', (d) => { stderr = (stderr + d).slice(-4000); });
  child.on('exit', (c) => { result.browserExit = c; result.browserStderr = stderr.slice(-1500); });
  let ws;
  for (let i = 0; i < 60 && !ws; i++) {
    await sleep(1000);
    try {
      const v = await (await fetch(`http://127.0.0.1:${PORT || 9333}/json/version`)).json();
      ws = new WebSocket(v.webSocketDebuggerUrl);
    } catch { /* not up yet */ }
  }
  if (!ws) throw new Error('the browser did not open its debugging port');
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('debugging port refused')); });
  ws.onmessage = (e) => dispatch(JSON.parse(e.data));
  send = request((x) => ws.send(x));
  return (await send('Browser.getVersion')).product;
}

async function stop() {
  if (!child || child.exitCode !== null) return;
  const gone = new Promise((r) => child.once('exit', r));
  child.kill();
  await Promise.race([gone, sleep(8000)]);
  await sleep(1000); // the profile's lock goes with the last process
}

async function launch() {
  const common = [`--user-data-dir=${PROFILE}`, '--no-first-run', '--no-default-browser-check', '--mute-audio', '--lang=en-US',
    '--autoplay-policy=no-user-gesture-required', '--window-size=1440,900', '--disable-search-engine-choice-screen',
    '--password-store=basic', '--disable-features=DisableLoadExtensionCommandLineSwitch', ...EXTRA];
  if (flag('headless')) common.push('--headless=new');
  if (process.env.WAYLAND_DISPLAY && !flag('headless')) common.push('--ozone-platform=wayland');
  const [cmd, ...pre] = LAUNCHER ? LAUNCHER.split(' ').filter(Boolean) : [BROWSER];
  // First choice: the pipe, and the extension loaded through it (works in every branded Chrome).
  try {
    result.version = await startPipe(cmd, [...pre, ...common, '--remote-debugging-pipe', '--enable-unsafe-extension-debugging', 'about:blank']);
    const r = await send('Extensions.loadUnpacked', { path: EXT });
    if (r.id !== EXT_ID) throw new Error(`loaded as ${r.id}`);
    return 'pipe';
  } catch (e) {
    result.firstTry = e.message;
    await stop();
  }
  // Then the command line (browsers without that command), over the pipe or, failing that, a port.
  try {
    result.version = await startPipe(cmd, [...pre, ...common, '--remote-debugging-pipe', `--load-extension=${EXT}`, 'about:blank']);
    return 'load-extension over a pipe';
  } catch (e) {
    result.secondTry = e.message;
    await stop();
  }
  result.version = await startPort(cmd, [...pre, ...common, `--remote-debugging-port=${PORT || 9333}`, `--load-extension=${EXT}`, 'about:blank']);
  return 'load-extension over a port';
}

// ---------- pages ----------
const errors = []; // uncaught errors from the extension's own code
const targets = new Map();
onEvent = (m) => {
  if (m.method === 'Target.targetCreated' || m.method === 'Target.targetInfoChanged') targets.set(m.params.targetInfo.targetId, m.params.targetInfo);
  if (m.method === 'Target.targetDestroyed') targets.delete(m.params.targetId);
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    const where = `${d.url || ''} ${d.stackTrace?.callFrames?.[0]?.url || ''}`;
    if (where.includes(EXT_ID)) errors.push(`${d.exception?.description || d.text}`.split('\n')[0]);
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    const url = m.params.stackTrace?.callFrames?.[0]?.url || '';
    if (url.includes(EXT_ID)) errors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300));
  }
};

async function openPage(url) {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  await send('Page.navigate', { url }, sessionId);
  return { targetId, sessionId };
}
async function ev(page, expr, timeout = 30000) {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true, userGesture: true }, page.sessionId, timeout);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description?.split('\n')[0] || r.exceptionDetails.text);
  return r.result.value;
}
async function until(page, expr, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { if (await ev(page, `return !!(${expr});`, 10000)) return true; } catch { /* page still loading */ }
    await sleep(300);
  }
  return false;
}
async function click(page, sel) {
  const ok = await ev(page, `const b = document.querySelector(${JSON.stringify(sel)}); if (!b) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true;`);
  if (!ok) throw new Error(`nothing to click: ${sel}`);
}
async function mouse(page, x, y) {
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: type === 'mouseMoved' ? 0 : 1 }, page.sessionId);
}

let refused = null; // YouTube refused this machine: the reason
async function area(name, fn) {
  if (SKIP.has(name) || (ONLY.size && !ONLY.has(name))) return;
  const t0 = Date.now();
  const before = errors.length;
  try {
    const note = await fn();
    const extra = errors.slice(before);
    if (extra.length) throw new Error(`the extension reported errors: ${extra.slice(0, 3).join(' | ')}`);
    const skip = typeof note === 'string' && note.startsWith('skip: ');
    result.areas[name] = { result: skip ? 'skip' : 'pass', note: skip ? note.slice(6) : note || '', seconds: Math.round((Date.now() - t0) / 1000) };
  } catch (e) {
    result.areas[name] = { result: 'fail', note: String(e.message || e), seconds: Math.round((Date.now() - t0) / 1000) };
  }
  console.log(`${name}: ${result.areas[name].result} ${result.areas[name].note}`);
  save();
}

// The page plays the video muted; the consent page some regions get first is declined.
async function youtube(page) {
  await until(page, `document.readyState === 'complete'`, 30000);
  await ev(page, `const b = [...document.querySelectorAll('button')].find((x) => /^(Reject all|Alle ablehnen)$/i.test(x.innerText.trim())); if (b) { b.click(); await new Promise((r) => setTimeout(r, 4000)); } return !!b;`).catch(() => {});
  await until(page, `document.querySelector('#movie_player video')`, 30000);
  await ev(page, `const v = document.querySelector('#movie_player video'); if (v) { v.muted = true; v.play().catch(() => {}); } return true;`).catch(() => {});
  const why = await ev(page, `const e = document.querySelector('.ytp-error, yt-playability-error-supported-renderers, #error-screen'); return e && e.offsetParent ? e.innerText.trim().replace(/\\s+/g, ' ').slice(0, 160) : '';`).catch(() => '');
  if (why && /bot|sign in|confirm/i.test(why)) refused = why;
}

(async () => {
  try {
    result.loadedBy = await launch();
    await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOADS, eventsEnabled: true }).catch(() => {});
    // The extension's pages and worker, as the browser lists them (some browsers never answer a subscription).
    let sw;
    for (let i = 0; i < 20 && !sw; i++) {
      await sleep(500);
      for (const t of (await send('Target.getTargets', {}, undefined, 10000).catch(() => ({ targetInfos: [] }))).targetInfos) targets.set(t.targetId, t);
      sw = [...targets.values()].find((t) => t.type === 'service_worker' && t.url.includes(EXT_ID));
    }
    if (sw) {
      const { sessionId } = await send('Target.attachToTarget', { targetId: sw.targetId, flatten: true });
      await send('Runtime.enable', {}, sessionId).catch(() => {});
    }

    await area('extension-loads', async () => {
      const info = [...targets.values()].filter((t) => t.url.includes(EXT_ID)).map((t) => t.type);
      if (!info.includes('service_worker')) throw new Error(`no background worker (${info.join(', ') || 'nothing'} from the extension)`);
      return `${result.version}, background worker running, loaded with ${result.loadedBy}`;
    });

    await area('options-page', async () => {
      const p = await openPage(`chrome-extension://${EXT_ID}/options/options.html`);
      if (!(await until(p, `document.querySelector('select') && document.body.innerText.length > 50`))) throw new Error('the options page stays empty');
      const s = await ev(p, `return { selects: document.querySelectorAll('select').length, status: (document.querySelector('.pill, #status, [data-status]')?.innerText || '').trim() };`);
      await send('Target.closeTarget', { targetId: p.targetId });
      return `${s.selects} choices, status "${s.status}"`;
    });

    await area('popup', async () => {
      const p = await openPage(`chrome-extension://${EXT_ID}/popup/popup.html`);
      if (!(await until(p, `document.body && document.body.innerText.trim().length > 10`))) throw new Error('the popup stays empty');
      await send('Target.closeTarget', { targetId: p.targetId });
    });

    const yt = await openPage(`https://www.youtube.com/watch?v=${VIDEO}`);
    await youtube(yt);

    await area('toolbar', async () => {
      if (!(await until(yt, `document.querySelector('#ysd-bar .ysd-btn')`, 30000))) throw new Error('no toolbar under the video');
      const n = await ev(yt, `return document.querySelectorAll('#ysd-bar .ysd-btn').length;`);
      return `${n} buttons`;
    });

    await area('playback', async () => {
      if (refused) return `skip: YouTube refuses this machine (${refused})`;
      // An ad may play first; either way the picture has to move.
      let ok = false;
      const t0 = await ev(yt, `return document.querySelector('#movie_player video')?.currentTime || 0;`);
      for (let i = 0; i < 40 && !ok; i++) {
        await sleep(1000);
        ok = await ev(yt, `const v = document.querySelector('#movie_player video'); if (v?.paused) v.play().catch(() => {}); return !!v && v.videoWidth > 0 && Math.abs(v.currentTime - ${t0}) > 1;`);
      }
      const codecs = await ev(yt, `const t = (m) => MediaSource.isTypeSupported(m); return { h264: t('video/mp4; codecs="avc1.4d401f"'), vp9: t('video/webm; codecs="vp09.00.10.08"'), av1: t('video/mp4; codecs="av01.0.05M.08"') };`);
      const list = Object.entries(codecs).map(([k, v]) => `${k} ${v ? 'yes' : 'no'}`).join(', ');
      if (!ok) throw new Error(`the video doesn't play (${list})`);
      return list;
    });

    await area('big-picture', async () => {
      await click(yt, '#ysd-bar button[aria-label^="Big Picture"]');
      if (!(await until(yt, `document.documentElement.classList.contains('ysd-focus')`, 5000))) throw new Error('Big Picture did not turn on');
      // Scrolling down docks the player in the corner, scrolling back up brings it back.
      await ev(yt, `window.scrollTo(0, 1600); return true;`);
      const docked = await until(yt, `document.documentElement.classList.contains('ysd-docked')`, 5000);
      await ev(yt, `window.scrollTo(0, 0); return true;`);
      const back = await until(yt, `!document.documentElement.classList.contains('ysd-docked')`, 5000);
      await click(yt, '#ysd-bar button[aria-label^="Exit Big Picture"]');
      const off = await until(yt, `!document.documentElement.classList.contains('ysd-focus')`, 5000);
      if (!docked || !back || !off) throw new Error(`docked ${docked}, undocked ${back}, off ${off}`);
      return 'on, docks on scroll, undocks, off';
    });

    await area('picture-in-picture', async () => {
      if (refused) return `skip: YouTube refuses this machine, nothing plays`;
      await click(yt, '#ysd-bar button[aria-label="Picture-in-picture"]');
      const on = await until(yt, `document.pictureInPictureElement || window.documentPictureInPicture?.window`, 6000);
      if (!on) throw new Error('picture-in-picture did not open');
      await ev(yt, `if (document.pictureInPictureElement) await document.exitPictureInPicture(); window.documentPictureInPicture?.window?.close(); return true;`);
      const off = await until(yt, `!document.pictureInPictureElement && !window.documentPictureInPicture?.window`, 6000);
      if (!off) throw new Error('picture-in-picture did not close');
      return 'opens and closes';
    });

    await area('windows-app-message', async () => {
      // Without the Windows app (always on Linux): the settings entry for it says what to expect.
      await click(yt, '#ysd-bar button[aria-label="More"], #ysd-bar button[aria-label="Settings"], #ysd-bar .ysd-btn[data-pop]:last-of-type');
      await sleep(600);
      const item = await ev(yt, `const it = [...document.querySelectorAll('.ysd-pop [role="menuitem"], .ysd-pop .ysd-mi, .ysd-pop button')].find((x) => /Download Manager/.test(x.innerText)); if (!it) return null; it.click(); return it.innerText.replace(/\\s+/g, ' ').trim();`);
      if (!item) throw new Error('no Download Manager entry in the menu');
      // The last word counts: "Starting..." first, then what happened.
      let msg = '';
      for (let i = 0; i < 40; i++) {
        await sleep(500);
        const m = await ev(yt, `const t = document.querySelector('.ysd-toast.show .ysd-toast-msg'); return t ? t.innerText : '';`);
        if (m) msg = m;
        if (msg && !/Starting/i.test(msg)) break;
      }
      await ev(yt, `document.body.click(); return true;`);
      if (!msg) throw new Error('clicking it says nothing');
      return msg;
    });

    let quality = false;
    await area('quality-list', async () => {
      await click(yt, '#ysd-bar button[aria-label="Download video"]');
      const ok = await until(yt, `document.querySelector('.ysd-pop .ysd-primary')`, 40000);
      const note = await ev(yt, `return (document.querySelector('.ysd-pop')?.innerText || '').replace(/\\s+/g, ' ').slice(0, 160);`);
      if (!ok) {
        if (refused || /bot|sign in/i.test(note)) return `skip: YouTube refuses this machine (${note})`;
        throw new Error(`no quality list: ${note}`);
      }
      quality = true;
      return note;
    });

    await area('download-video', async () => {
      if (!quality) return 'skip: no quality list';
      const before = new Set(fs.readdirSync(DOWNLOADS));
      await click(yt, '.ysd-pop .ysd-primary');
      const t0 = Date.now();
      let file = null, state = '';
      while (Date.now() - t0 < 240000 && !file) {
        await sleep(1000);
        file = fs.readdirSync(DOWNLOADS).find((f) => !before.has(f) && !/\.(crdownload|tmp)$/.test(f) && fs.statSync(path.join(DOWNLOADS, f)).size > 0);
        state = await ev(yt, `return [...document.querySelectorAll('.ysd-toast .ysd-toast-msg, .ysd-panel-note, .ysd-note')].map((x) => x.innerText).join(' | ').slice(0, 200);`).catch(() => state);
        if (/couldn't|failed|blocked|error/i.test(state) && Date.now() - t0 > 20000) break;
      }
      if (!file) {
        if (/blocking|bot|sign in/i.test(state)) return `skip: YouTube refuses this machine (${state})`;
        throw new Error(`no file after ${Math.round((Date.now() - t0) / 1000)} s: ${state}`);
      }
      return `${file} (${Math.round(fs.statSync(path.join(DOWNLOADS, file)).size / 1024)} KB)`;
    });

    await area('app-connection', async () => {
      if (!APP) return 'skip: the Windows app is not part of this run';
      // Running: the extension connected by itself when it was installed.
      const o = await openPage(`chrome-extension://${EXT_ID}/options/options.html`);
      let token = '';
      for (let i = 0; i < 30 && !token; i++) {
        await sleep(500);
        token = await ev(o, `return (await chrome.storage.local.get('dmToken')).dmToken || '';`).catch(() => '');
      }
      await send('Target.closeTarget', { targetId: o.targetId });
      if (!token) throw new Error('the extension did not connect to the running app');
      const appApi = async (p) => (await fetch(`http://127.0.0.1:17724${p}`, { headers: { 'X-YDM-Token': token, Origin: `chrome-extension://${EXT_ID}` } })).json();
      // A download from the page goes to the app.
      const hand = async (page, vid) => {
        const before = (await appApi('/v1/jobs')).jobs.length;
        await click(page, '#ysd-bar button[aria-label="Download video"]');
        if (!(await until(page, `document.querySelector('.ysd-pop .ysd-primary')`, 60000))) throw new Error('no quality list from the app');
        await click(page, '.ysd-pop .ysd-primary');
        for (let i = 0; i < 120; i++) {
          await sleep(1000);
          const jobs = await appApi('/v1/jobs').catch(() => null);
          const j = jobs?.jobs.find((x) => x.vid === vid);
          if (jobs && jobs.jobs.length > before && j && ['completed', 'failed'].includes(j.status)) return j;
        }
        throw new Error(`the download of ${vid} did not reach the app`);
      };
      const page = await openPage(`https://www.youtube.com/watch?v=${VIDEO}`);
      await youtube(page);
      await until(page, `document.querySelector('#ysd-bar .ysd-btn')`, 30000);
      const j1 = await hand(page, VIDEO);
      const notes = [`connected; a download went to the app (${j1.status}${j1.err ? ` ${j1.err.key}` : ''})`];
      // Closed: the next download starts the app (its ytdm: link), then goes to it.
      require('child_process').execSync('taskkill /IM YTDownloadManager.exe /F', { stdio: 'ignore' });
      await sleep(1500);
      const other = 'R6DiFlAXrS0';
      await send('Page.navigate', { url: `https://www.youtube.com/watch?v=${other}` }, page.sessionId);
      await youtube(page);
      await until(page, `document.querySelector('#ysd-bar .ysd-btn')`, 30000);
      await click(page, '#ysd-bar button[aria-label="Download video"]');
      let up = false;
      for (let i = 0; i < 60 && !up; i++) {
        await sleep(1000);
        up = await fetch('http://127.0.0.1:17724/v1/hello').then((r) => r.ok, () => false);
      }
      if (!up) throw new Error('the app did not start from the page');
      const j2 = await hand(page, other);
      notes.push(`closed app started by the page; download went to it (${j2.status}${j2.err ? ` ${j2.err.key}` : ''})`);
      await send('Target.closeTarget', { targetId: page.targetId });
      return notes.join('; ');
    });

    await area('history-and-preview', async () => {
      await click(yt, '#ysd-hist');
      if (!(await until(yt, `document.querySelector('#ysd-panel') && document.querySelector('#ysd-panel').getBoundingClientRect().height > 50`, 5000))) throw new Error('the history did not open');
      const rows = await ev(yt, `return document.querySelectorAll('#ysd-panel .ysd-row').length;`);
      let note = `${rows} downloads listed`;
      if (result.areas['download-video']?.result === 'pass') {
        // The preview player: it plays the file, or says it can't instead of showing a black picture.
        await ev(yt, `const r = document.querySelector('#ysd-panel .ysd-row'); const b = r && [...r.querySelectorAll('button')].find((x) => /play|preview/i.test(x.getAttribute('aria-label') || '')); if (b) b.click(); else r?.click(); return true;`);
        const shown = await until(yt, `document.querySelector('.ysd-viewer video, .ysd-viewer audio')`, 8000);
        if (shown) {
          await sleep(3000);
          const v = await ev(yt, `const m = document.querySelector('.ysd-viewer video, .ysd-viewer audio'); const msg = document.querySelector('.ysd-viewer .ysd-vmsg, .ysd-viewer [role="alert"]')?.innerText || ''; return { t: m.currentTime, w: m.videoWidth || 0, err: m.error?.code || 0, msg };`);
          if (v.w === 0 && !v.msg) throw new Error(`the preview shows no picture and no message (time ${v.t}, error ${v.err})`);
          note += v.w ? `; preview plays (${v.w} px wide)` : `; preview says: ${v.msg}`;
          await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, yt.sessionId);
          await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, yt.sessionId);
          if (!(await until(yt, `!document.querySelector('.ysd-viewer')`, 3000))) throw new Error('the preview did not close');
        }
      }
      await mouse(yt, 200, 850);
      await sleep(600);
      const closed = await ev(yt, `const p = document.querySelector('#ysd-panel'); return !p || !p.isConnected || getComputedStyle(p).display === 'none' || p.getBoundingClientRect().height < 5 || p.classList.contains('ysd-out');`);
      if (!closed) throw new Error('the history stays open after a click outside');
      return note;
    });

    await area('shorts', async () => {
      // The newest Short of YouTube's own channel.
      const p = await openPage('https://www.youtube.com/@YouTube/shorts');
      if (!(await until(p, `document.querySelector('a[href^="/shorts/"]')`, 30000))) throw new Error('no Shorts listed on the channel page');
      await ev(p, `location.href = document.querySelector('a[href^="/shorts/"]').href; return true;`).catch(() => {});
      await until(p, `/^\/shorts\/[\w-]{11}/.test(location.pathname) && document.readyState === 'complete'`, 30000);
      const ok = await until(p, `document.querySelector('#ysd-shorts .ysd-sbtn, #ysd-shorts button')`, 30000);
      const why = ok ? '' : await ev(p, `return JSON.stringify({ url: location.pathname, shorts: !!document.querySelector('ytd-shorts'), reels: document.querySelectorAll('ytd-reel-video-renderer').length, player: !!document.querySelector('#shorts-player'), box: !!document.querySelector('#ysd-shorts'), bar: !!document.querySelector('reel-action-bar-view-model, ytd-reel-video-renderer #actions') });`).catch((e) => e.message);
      await send('Target.closeTarget', { targetId: p.targetId });
      if (!ok) return refused ? `skip: YouTube refuses this machine (${refused})` : Promise.reject(new Error(`no buttons beside the Short ${why}`));
      return 'buttons beside the Short';
    });

    await area('playlist', async () => {
      const p = await openPage(`https://www.youtube.com/watch?v=${VIDEO}&list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI`);
      await youtube(p);
      const ok = await until(p, `document.querySelector('#ysd-bar .ysd-btn')`, 30000);
      await send('Target.closeTarget', { targetId: p.targetId });
      if (!ok) throw new Error('no toolbar on a video in a playlist');
      return 'toolbar on a playlist video';
    });

    await area('right-to-left', async () => {
      await send('Storage.setCookies', { cookies: [{ name: 'PREF', value: 'hl=ar&f6=40000000', domain: '.youtube.com', path: '/', secure: true }] });
      const p = await openPage(`https://www.youtube.com/watch?v=${VIDEO}&hl=ar&persist_hl=1`);
      await youtube(p);
      if (!(await until(p, `document.querySelector('#ysd-bar .ysd-btn')`, 30000))) throw new Error('no toolbar on the Arabic page');
      const r = await ev(p, `const b = document.querySelector('#ysd-bar').getBoundingClientRect(); return { lang: document.documentElement.lang, dir: document.documentElement.dir || getComputedStyle(document.querySelector('ytd-app') || document.body).direction, left: Math.round(b.left), right: Math.round(b.right), vw: innerWidth, scroll: document.documentElement.scrollWidth > innerWidth + 1 };`);
      await send('Target.closeTarget', { targetId: p.targetId });
      if (r.left < 0 || r.right > r.vw || r.scroll) throw new Error(`the toolbar leaves the page (${JSON.stringify(r)})`);
      await send('Storage.setCookies', { cookies: [{ name: 'PREF', value: 'hl=en', domain: '.youtube.com', path: '/', secure: true }] });
      if (r.dir !== 'rtl') throw new Error(`YouTube did not switch to Arabic (${JSON.stringify(r)})`);
      return 'Arabic page, toolbar inside the page';
    });
  } catch (e) {
    result.error = String(e.stack || e);
    console.error(result.error);
  }
  result.extensionErrors = errors.slice(0, 20);
  save();
  try { await send('Browser.close', {}, undefined, 5000); } catch { /* gone */ }
  setTimeout(() => {
    try { child?.kill(); } catch { /* gone */ }
    const failed = result.error || Object.values(result.areas).some((a) => a.result === 'fail');
    process.exit(failed ? 1 : 0);
  }, 1500);
})();
