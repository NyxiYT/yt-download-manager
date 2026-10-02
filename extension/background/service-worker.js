// Service worker: makes the network requests the YouTube page itself isn't allowed to make (other
// sites' images and files, and the local YT Download Manager app), on behalf of the content script,
// and answers the popup's and options page's status questions. It keeps no state of its own.

// Only these addresses (the same as the manifest's host permissions) can be requested.
const ALLOWED = [
  /^https:\/\/www\.youtube\.com\//,
  /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.googlevideo\.com\//,
  /^https:\/\/i\.ytimg\.com\//,
  /^https:\/\/cdn\.jsdelivr\.net\//,
  /^http:\/\/(127\.0\.0\.1|localhost):\d{2,5}\//,
];
const METHODS = new Set(['GET', 'HEAD', 'POST']);
const running = new Map(); // request id -> AbortController

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (sender.id !== chrome.runtime.id || !msg) return false;
  switch (msg.type) {
    case 'fetch':
      proxyFetch(msg).then(reply);
      return true; // answers asynchronously
    case 'abort':
      running.get(msg.id)?.abort();
      return false;
    case 'dmStatus':
      dmStatus().then(reply);
      return true;
    case 'dmClear':
      dmClear().then(reply);
      return true;
    case 'dmAutoConnect':
      dmAutoConnect().then(reply);
      return true;
    case 'dmSession':
      dmSession().then(reply);
      return true;
    case 'pipBounds':
      pipBounds(msg, sender).then(reply, () => reply({ ok: false }));
      return true;
    case 'pipNative':
      pipNative(msg.info, sender).then(reply, () => reply({ ok: false }));
      return true;
    default:
      return false;
  }
});

// The Shorts picture-in-picture window (Document Picture-in-Picture) has no fixed shape, and its page can
// resize it only right after a click in it, once per click; the content script asks here to give it the
// video's shape (window bounds, in CSS pixels like the page's). Only a window with one tab that sits where
// the content script sees its window, and isn't the browser window of that tab, is changed; once found, it
// is remembered for that tab, so it can follow a pointer quickly. With `animate` it glides there (about
// 150 ms). Chrome keeps it within its limits: smaller than asked, it is put back at the corner it is held at.
const pipWindows = new Map(); // tab id -> its picture-in-picture window's id

async function pipBounds(m, sender) {
  const b = m.match || {};
  const to = {};
  for (const k of ['left', 'top', 'width', 'height']) to[k] = Math.round(Number(m.to?.[k]));
  if (Object.values(to).some((x) => !Number.isFinite(x)) || to.width < 120 || to.height < 120) return { ok: false };
  const tabId = sender.tab?.id;
  let win = null;
  if (pipWindows.has(tabId)) {
    try {
      const w = await chrome.windows.get(pipWindows.get(tabId), { populate: true });
      if (w.tabs?.length === 1 && w.id !== sender.tab?.windowId) win = w;
    } catch { /* closed */ }
  }
  if (!win) {
    const off = (w) => Math.abs(w.left - b.left) + Math.abs(w.top - b.top) + Math.abs(w.width - b.width) + Math.abs(w.height - b.height);
    win = (await chrome.windows.getAll({ populate: true }))
      .filter((w) => w.id !== sender.tab?.windowId && w.tabs?.length === 1 && off(w) <= 4)
      .sort((x, y) => off(x) - off(y))[0];
    if (!win) return { ok: false };
    pipWindows.set(tabId, win.id);
  }
  const from = { left: win.left, top: win.top, width: win.width, height: win.height };
  const steps = m.animate ? 9 : 1;
  for (let i = 1; i <= steps; i++) {
    const k = 1 - (1 - i / steps) ** 3; // ease out
    const at = {};
    for (const key of Object.keys(to)) at[key] = Math.round(from[key] + (to[key] - from[key]) * k);
    await chrome.windows.update(win.id, at);
    if (i < steps) await new Promise((r) => setTimeout(r, 16));
  }
  const got = await chrome.windows.get(win.id);
  const left = m.to.right ? to.left + to.width - got.width : to.left;
  const top = m.to.bottom ? to.top + to.height - got.height : to.top;
  if (got.left !== left || got.top !== top) await chrome.windows.update(win.id, { left, top });
  return { ok: true };
}

// The app, when it runs, takes over drags on Chrome's own border of that window (Chrome lets the border
// change one side only): it is told the window's title, size, shape and limits, and when it closes.
async function pipNative(info, sender) {
  const { dmToken = '', dmPort = 17724, settings = {} } = await chrome.storage.local.get(['dmToken', 'dmPort', 'settings']);
  if (!dmToken || settings.useManager === false || !info || typeof info !== 'object') return { ok: false };
  const body = { open: !!info.open, tab: String(sender.tab?.id ?? '') };
  if (body.open) {
    for (const k of ['ratio', 'dpr', 'iw', 'ih', 'minW', 'maxW']) body[k] = Number(info[k]) || 0;
    body.title = String(info.title || '').slice(0, 400);
  }
  try {
    const r = await fetch(`http://127.0.0.1:${dmPort}/v1/pip`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-YDM-Token': dmToken }, cache: 'no-store',
      body: JSON.stringify(body), signal: AbortSignal.timeout(3000),
    });
    return { ok: r.ok };
  } catch {
    return { ok: false };
  }
}

async function proxyFetch(m) {
  const url = String(m.url || '');
  const method = String(m.method || 'GET').toUpperCase();
  if (!ALLOWED.some((re) => re.test(url)) || !METHODS.has(method)) return { error: 'not allowed' };
  const ac = new AbortController();
  running.set(m.id, ac);
  try {
    const headers = { ...(m.headers || {}) };
    delete headers['User-Agent']; // can't be set from an extension; the servers don't need it
    const r = await fetch(url, {
      method, headers, body: method === 'POST' ? m.body : undefined,
      credentials: m.anonymous ? 'omit' : 'include', cache: 'no-store', signal: ac.signal,
    });
    const buf = method === 'HEAD' ? new ArrayBuffer(0) : await r.arrayBuffer();
    return {
      status: r.status,
      url: r.url,
      contentType: r.headers.get('content-type') || '',
      headers: [...r.headers].map(([k, v]) => `${k}: ${v}`).join('\r\n'),
      text: m.binary ? undefined : new TextDecoder().decode(buf),
      base64: m.binary ? bytesToBase64(new Uint8Array(buf)) : undefined,
    };
  } catch (e) {
    return { error: String(e?.message || e), aborted: ac.signal.aborted };
  } finally {
    running.delete(m.id);
  }
}

function bytesToBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// Is the YT Download Manager app running, and does it know this browser?
async function dmStatus() {
  const { dmToken = '', dmPort = 17724 } = await chrome.storage.local.get(['dmToken', 'dmPort']);
  try {
    const r = await fetch(`http://127.0.0.1:${dmPort}/v1/hello`, {
      headers: dmToken ? { 'X-YDM-Token': dmToken } : {}, cache: 'no-store', signal: AbortSignal.timeout(3000),
    });
    const j = await r.json();
    return { running: j.app === 'ytdm', paired: !!j.paired, token: !!dmToken, version: j.version };
  } catch {
    return { running: false, paired: false, token: !!dmToken };
  }
}

// Connects to the app on its own, without asking anyone: the app recognizes this extension by its ID
// (fixed by the key in manifest.json, sent by the browser as the request's Origin). Runs when the
// extension is installed or updated and when the browser starts; YouTube tabs do the same when they
// find the app running but not connected. Turning "Use the Download Manager" off stops it.
async function dmAutoConnect() {
  const { dmToken = '', dmPort = 17724, settings = {} } = await chrome.storage.local.get(['dmToken', 'dmPort', 'settings']);
  if (settings.useManager === false) return { ok: false };
  try {
    const hello = await (await fetch(`http://127.0.0.1:${dmPort}/v1/hello`, {
      headers: dmToken ? { 'X-YDM-Token': dmToken } : {}, cache: 'no-store', signal: AbortSignal.timeout(3000),
    })).json();
    if (hello.app !== 'ytdm') return { ok: false };
    if (hello.paired) return { ok: true };
    const r = await fetch(`http://127.0.0.1:${dmPort}/v1/pair`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ client: `${browserName()} (extension)`, auto: true }),
    });
    const j = await r.json();
    if (!r.ok || !j.token) return { ok: false };
    await chrome.storage.local.set({ dmToken: j.token, dmPort: j.port || dmPort });
    return { ok: true };
  } catch {
    return { ok: false }; // the app isn't running (or isn't installed)
  }
}

// This browser's YouTube sign-in for the app, for videos YouTube only shows to eligible signed-in
// accounts (age restricted, members only). Sent only when such a video comes up; the app keeps it in
// memory. When the browser isn't signed in to YouTube, nothing is sent except "not signed in".
async function dmSession() {
  const { dmToken = '', dmPort = 17724, settings = {} } = await chrome.storage.local.get(['dmToken', 'dmPort', 'settings']);
  if (!dmToken || settings.useManager === false) return { ok: false, signedIn: null };
  let list = [];
  // Exactly what www.youtube.com receives (its own cookies and the .youtube.com ones).
  try { list = await chrome.cookies.getAll({ url: 'https://www.youtube.com/' }); } catch { return { ok: false, signedIn: null }; }
  // Signed in the way YouTube (and yt-dlp) count it: LOGIN_INFO plus one of the SAPISID cookies.
  const has = (n) => list.some((c) => c.name === n);
  const signedIn = has('LOGIN_INFO') && ['SAPISID', '__Secure-1PAPISID', '__Secure-3PAPISID'].some(has);
  const cookies = signedIn ? `# Netscape HTTP Cookie File\n${list.map(netscapeLine).join('\n')}\n` : '';
  try {
    const r = await fetch(`http://127.0.0.1:${dmPort}/v1/session`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-YDM-Token': dmToken }, cache: 'no-store',
      body: JSON.stringify({ cookies }), signal: AbortSignal.timeout(5000),
    });
    return { ok: r.ok && signedIn, signedIn };
  } catch {
    return { ok: false, signedIn };
  }
}

// One cookie in the cookies.txt format yt-dlp reads.
function netscapeLine(c) {
  const domain = c.hostOnly || c.domain.startsWith('.') ? c.domain : `.${c.domain}`;
  const expires = c.session ? 0 : Math.floor(c.expirationDate || 0);
  return [domain, c.hostOnly ? 'FALSE' : 'TRUE', c.path, c.secure ? 'TRUE' : 'FALSE', expires, c.name, c.value].join('\t');
}

function browserName() {
  const b = navigator.userAgentData?.brands?.map((x) => x.brand).find((x) => !/Not.?A.?Brand|Chromium/i.test(x));
  if (b) return b.replace(/^Google /, '');
  const ua = navigator.userAgent;
  return /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : 'Chrome';
}

chrome.runtime.onInstalled.addListener(() => { dmAutoConnect(); });
chrome.runtime.onStartup.addListener(() => { dmAutoConnect(); });

// Clears the finished downloads the app lists (options page "Clear"). Does nothing if it isn't running.
async function dmClear() {
  const { dmToken = '', dmPort = 17724 } = await chrome.storage.local.get(['dmToken', 'dmPort']);
  if (!dmToken) return { ok: false };
  try {
    const r = await fetch(`http://127.0.0.1:${dmPort}/v1/jobs/clear`, {
      method: 'POST', headers: { 'X-YDM-Token': dmToken }, cache: 'no-store', signal: AbortSignal.timeout(3000),
    });
    return { ok: r.ok };
  } catch {
    return { ok: false };
  }
}
