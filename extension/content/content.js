// YT Standalone Downloader: the download toolbar under YouTube videos, its pickers, the history
// panel and Big Picture. Runs as the extension's content script on www.youtube.com (isolated world).
// Generated from yt-standalone-downloader.user.js by extension-build/convert.py.
(async () => {
  'use strict';

  // ---------- extension runtime ----------
  // What a userscript manager used to provide, on standard extension APIs:
  // - settings, history and the Download Manager connection live in chrome.storage.local. They are read
  //   once here so the rest of the code reads them synchronously, and are kept in sync with other tabs,
  //   the popup and the options page;
  // - requests to other sites go through the service worker, which holds the host permissions;
  // - YouTube's own page scripts are reached through content/page-bridge.js, which runs in the page.
  // After the extension is reloaded or updated, this copy stays in pages that were already open but
  // can no longer reach it: every chrome.* call then throws "Extension context invalidated", before
  // any .catch. Calls go through these checks instead, so a cut-off copy stays quiet.
  const alive = () => { try { return !!chrome.runtime?.id; } catch { return false; } };
  function send(msg) {
    if (!alive()) return Promise.reject(new Error('Extension reloaded'));
    try { return chrome.runtime.sendMessage(msg); } catch (e) { return Promise.reject(e); }
  }
  const store = await chrome.storage.local.get(null);
  const ownWrites = new Map();
  const valueListeners = new Map();
  const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const getValue = (k, def) => (store[k] !== undefined ? clone(store[k]) : def);
  function setValue(k, v) {
    const c = clone(v);
    if (JSON.stringify(store[k]) === JSON.stringify(c)) return; // unchanged: storage wouldn't report it either
    store[k] = c;
    ownWrites.set(k, (ownWrites.get(k) || 0) + 1);
    if (!alive()) return;
    try { chrome.storage.local.set({ [k]: c }).catch((e) => console.debug('[YSD] storage', e)); } catch { /* cut off */ }
  }
  // fn(key, oldValue, newValue, remote): remote is true for changes made outside this tab.
  function onValueChange(k, fn) {
    if (!valueListeners.has(k)) valueListeners.set(k, []);
    valueListeners.get(k).push(fn);
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const [k, c] of Object.entries(changes)) {
      const own = ownWrites.get(k) || 0;
      if (own) ownWrites.set(k, own - 1);
      store[k] = c.newValue;
      for (const fn of valueListeners.get(k) || []) {
        try { fn(k, c.oldValue, clone(c.newValue), !own); } catch (e) { console.debug('[YSD]', e); }
      }
    }
  });

  // Requests the page itself may not make (other sites' images and files, the local Download Manager
  // app) go through the service worker. Call shape: { method, url, headers, data, responseType,
  // timeout, anonymous, onload, onerror, ontimeout, onabort }; returns { abort }.
  function bgRequest(o) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const binary = o.responseType === 'arraybuffer' || o.responseType === 'blob';
    let settled = false;
    let timer = 0;
    const settle = (fn, arg) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn?.(arg);
    };
    const stop = (fn) => {
      send({ type: 'abort', id }).catch(() => {});
      settle(fn);
    };
    if (o.timeout) timer = setTimeout(() => stop(o.ontimeout), o.timeout);
    send({
      type: 'fetch', id, url: o.url, method: o.method || 'GET', headers: o.headers || {},
      body: o.data ?? null, binary, anonymous: o.anonymous !== false,
    }).then((r) => {
      if (!r || r.error) {
        settle(r?.aborted ? o.onabort : o.onerror, r);
        return;
      }
      let response = r.text;
      if (binary) {
        const bytes = base64ToBytes(r.base64 || '');
        response = o.responseType === 'blob' ? new Blob([bytes], { type: r.contentType || '' }) : bytes.buffer;
      }
      settle(o.onload, { status: r.status, response, responseText: r.text || '', responseHeaders: r.headers || '', finalUrl: r.url });
    }, (e) => settle(o.onerror, e));
    return { abort: () => stop(o.onabort) };
  }

  function base64ToBytes(b64) {
    const s = atob(b64);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }

  // Synchronous call into the page's JavaScript world (content/page-bridge.js). DOM events are
  // delivered synchronously between the worlds; the payloads are JSON strings.
  function page(op, ...args) {
    let answer = null;
    const onAnswer = (e) => { answer = e.detail; };
    document.addEventListener('ysd-page-response', onAnswer, { once: true });
    document.dispatchEvent(new CustomEvent('ysd-page-request', { detail: JSON.stringify({ op, args }) }));
    document.removeEventListener('ysd-page-response', onAnswer);
    try { return answer == null ? undefined : JSON.parse(answer); } catch { return undefined; }
  }

  const VERSION = chrome.runtime.getManifest().version;
  const CHUNK = 9 * 1024 * 1024; // googlevideo throttles big single requests; fetch in ranges
  const PARALLEL = 3; // range requests per stream
  const MAX_ACTIVE = 2; // downloads running at once, the rest wait in the queue
  // The browser extension build connects to the Download Manager on its own: the app recognizes the
  // extension by its ID. The userscript asks the user once instead.
  const AUTO_CONNECT = true;
  // The extension build: true once the extension was reloaded or updated under this open page. This
  // copy of the script can't reach it any more; it stays quiet until the page is reloaded.
  const hostGone = () => !alive();
  // Hands this browser's YouTube sign-in to the Download Manager app, for videos YouTube only shows to
  // eligible signed-in accounts. Resolves { ok, signedIn }. The userscript can't read the sign-in.
  const pushSession = () => send({ type: 'dmSession' }).then((r) => r || { ok: false, signedIn: null }, () => ({ ok: false, signedIn: null }));

  // Innertube clients that return plain stream URLs (no signature cipher). Tried in order.
  const CLIENTS = [
    { id: 5, ctx: { clientName: 'IOS', clientVersion: '20.10.4', deviceMake: 'Apple', deviceModel: 'iPhone16,2', osName: 'iPhone', osVersion: '18.3.2.22D82' },
      ua: 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)' },
    { id: 28, ctx: { clientName: 'ANDROID_VR', clientVersion: '1.60.19', deviceMake: 'Oculus', deviceModel: 'Quest 3', androidSdkVersion: 32, osName: 'Android', osVersion: '12L' },
      ua: 'com.google.android.apps.youtube.vr.oculus/1.60.19 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip' },
  ];

  // ---------- small utils ----------
  // YouTube enforces Trusted Types, so no innerHTML: build DOM by hand.
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el.append(k instanceof Node ? k : String(k));
    return el;
  }

  // Material Icons, rounded filled style (Apache-2.0), 24px grid.
  const ICONS = {
    video: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l2.29 2.29c.63.63 1.71.18 1.71-.71V8.91c0-.89-1.08-1.34-1.71-.71L17 10.5z',
    music: 'M12 5v8.55c-.94-.54-2.1-.75-3.33-.32-1.34.48-2.37 1.67-2.61 3.07-.46 2.74 1.86 5.08 4.59 4.65 1.96-.31 3.35-2.11 3.35-4.1V7h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2c-1.1 0-2 .9-2 2z',
    image: 'M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-10.6-3.47 1.63 2.18 2.58-3.22c.2-.25.58-.25.78 0l2.96 3.7c.26.33.03.81-.39.81H9c-.41 0-.65-.47-.4-.8l2-2.67c.2-.26.6-.26.8 0zM2 7v13c0 1.1.9 2 2 2h13c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1-.45-1-1V7c0-.55-.45-1-1-1s-1 .45-1 1z',
    captions: 'M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 6.5c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5h-2v3h2c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v.5c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v.5zm7 0c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5h-2v3h2c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v.5c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v.5z',
    camera: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM20 4h-3.17l-1.24-1.35c-.37-.41-.91-.65-1.47-.65H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
    moon: 'M11.01 3.05C6.51 3.54 3 7.36 3 12c0 4.97 4.03 9 9 9 4.63 0 8.45-3.5 8.95-8 .09-.79-.78-1.42-1.54-.95-.84.54-1.84.85-2.91.85-2.98 0-5.4-2.42-5.4-5.4 0-1.06.31-2.06.84-2.89.45-.67-.04-1.63-.93-1.56z',
    focus: 'M5 4h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5zm2 2h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z',
    home: 'M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z',
    pip: 'M18 11h-6c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1zm5 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-3 .02H4c-.55 0-1-.45-1-1V5.97c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v12.05c0 .55-.45 1-1 1z',
    repeat: 'M7 7h10v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.2.2-.51 0-.71l-2.79-2.79c-.31-.31-.85-.09-.85.36V5H6c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V7zm10 10H7v-1.79c0-.45-.54-.67-.85-.35l-2.79 2.79c-.2.2-.2.51 0 .71l2.79 2.79c.31.31.85.09.85-.36V19h11c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1v3z',
    tune: 'M3 18c0 .55.45 1 1 1h5v-2H4c-.55 0-1 .45-1 1zM3 6c0 .55.45 1 1 1h9V5H4c-.55 0-1 .45-1 1zm10 14v-1h7c.55 0 1-.45 1-1s-.45-1-1-1h-7v-1c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1zM7 10v1H4c-.55 0-1 .45-1 1s.45 1 1 1h3v1c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1zm14 2c0-.55-.45-1-1-1h-9v2h9c.55 0 1-.45 1-1zm-5-3c.55 0 1-.45 1-1V7h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1z',
    dlLine: 'M12 16 7 11l1.4-1.45 2.6 2.6V4h2v8.15l2.6-2.6L17 11l-5 5Zm-6 4q-.825 0-1.413-.588T4 18v-3h2v3h12v-3h2v3q0 .825-.588 1.413T18 20H6Z',
    volume: 'M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z',
    volumeOff: 'M3.63 3.63a.996.996 0 0 0 0 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 1 0 1.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0 0 14 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z',
    fitScreen: 'M17 4h3c1.1 0 2 .9 2 2v2h-2V6h-3V4zM4 8V6h3V4H4c-1.1 0-2 .9-2 2v2h2zm16 8v2h-3v2h3c1.1 0 2-.9 2-2v-2h-2zM7 18H4v-2H2v2c0 1.1.9 2 2 2h3v-2zM18 8H6v8h12V8z',
    fillScreen: 'M6 14c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1H7v-2c0-.55-.45-1-1-1zm0-4c.55 0 1-.45 1-1V7h2c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm11 7h-2c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1s-1 .45-1 1v2zM14 6c0 .55.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V6c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1z',
    more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    help: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92c-.5.51-.86.97-1.04 1.69-.08.32-.13.68-.13 1.14h-2v-.5c0-.46.08-.9.22-1.31.2-.58.53-1.1.95-1.52l1.24-1.26c.46-.44.68-1.1.55-1.8-.13-.72-.69-1.33-1.39-1.53-1.11-.31-2.14.32-2.47 1.27-.12.37-.43.65-.82.65h-.3C8.4 9 8 8.44 8.16 7.88c.43-1.47 1.68-2.59 3.23-2.83 1.52-.24 2.97.55 3.87 1.8 1.18 1.63.83 3.38-.19 4.4z',
    close: 'M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z',
    history: 'M13.26 3C8.17 2.86 4 6.95 4 12H2.21c-.45 0-.67.54-.35.85l2.79 2.8c.2.2.51.2.71 0l2.79-2.8a.5.5 0 0 0-.36-.85H6c0-3.9 3.18-7.05 7.1-7 3.72.05 6.85 3.18 6.9 6.9.05 3.91-3.1 7.1-7 7.1-1.61 0-3.1-.55-4.28-1.48a.994.994 0 0 0-1.32.08c-.42.42-.39 1.12.08 1.48A8.858 8.858 0 0 0 13 21c5.05 0 9.14-4.17 9-9.26-.13-4.69-4.05-8.61-8.74-8.74zm-.51 5c-.41 0-.75.34-.75.75v3.68c0 .35.19.68.49.86l3.12 1.85c.36.21.82.09 1.03-.26.21-.36.09-.82-.26-1.03l-2.88-1.71v-3.4c0-.4-.34-.74-.75-.74z',
    download: 'M16.59 9H15V4c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v5H7.41c-.89 0-1.34 1.08-.71 1.71l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59c.63-.63.19-1.71-.7-1.71zM5 19c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1z',
    play: 'M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69L9.54 5.98A.998.998 0 0 0 8 6.82z',
    pause: 'M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z',
    delete: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z',
    refresh: 'M17.65 6.35a7.95 7.95 0 0 0-6.48-2.31c-3.67.37-6.69 3.35-7.1 7.02C3.52 15.91 7.27 20 12 20a7.98 7.98 0 0 0 7.21-4.56c.32-.67-.16-1.44-.9-1.44-.37 0-.72.2-.88.53a5.994 5.994 0 0 1-6.8 3.31c-2.22-.49-4.01-2.3-4.48-4.52A6.002 6.002 0 0 1 12 6c1.66 0 3.14.69 4.22 1.78l-1.51 1.51c-.63.63-.19 1.71.7 1.71H19c.55 0 1-.45 1-1V6.41c0-.89-1.08-1.34-1.71-.71l-.64.65z',
    folder: 'M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-1.41-1.41z',
    computer: 'M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6v2H9c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-1v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H4V5h16v10z',
    check: 'M9 16.17 5.53 12.7a.996.996 0 1 0-1.41 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71a.996.996 0 1 0-1.41-1.41L9 16.17z',
    expand: 'M15.88 9.29 12 13.17 8.12 9.29a.996.996 0 1 0-1.41 1.41l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59a.996.996 0 0 0 0-1.41c-.39-.38-1.03-.39-1.42 0z',
    chevronRight: 'M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z',
    back: 'M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42a.996.996 0 0 0-1.41 0l-6.59 6.59a.996.996 0 0 0 0 1.41l6.59 6.59a.996.996 0 1 0 1.41-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z',
    scissors: 'M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z',
    pin: 'M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z',
    timer: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61 1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
    auto: 'M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z',
    drag: 'M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    undo: 'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z',
    error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    up: 'M13 19V7.83l4.88 4.88c.39.39 1.03.39 1.42 0a.996.996 0 0 0 0-1.41l-6.59-6.59a.996.996 0 0 0-1.41 0l-6.6 6.58a.996.996 0 1 0 1.41 1.41L11 7.83V19c0 .55.45 1 1 1s1-.45 1-1z',
    warning: 'M4.47 21h15.06c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L2.74 18c-.77 1.33.19 3 1.73 3zM12 14c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z',
    okCircle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29 5.7 12.7a.996.996 0 1 1 1.41-1.41L10 14.17l6.88-6.88a.996.996 0 1 1 1.41 1.41l-7.59 7.59a.996.996 0 0 1-1.41 0z',
    info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    language: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z',
  };
  function icon(name, size = 20) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', width: size, height: size, fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' })) svg.setAttribute(k, v);
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', ICONS[name]);
    svg.append(p);
    return svg;
  }

  // ---------- translations ----------
  // Add a language by adding an object with the same keys; missing keys fall back to English.
  // A value can be a plain string or plural forms ({ one, few, many, other }) chosen with {n}.
  const LANG_NAMES = globalThis.YSD_LANG_NAMES;
  const I18N = globalThis.YSD_I18N;

  const settings = {
    autoOpenPanel: false, barHidden: false, syncTrim: true, lang: 'auto', pipFit: false,
    videoKey: '', audioKey: 'mp3-320', thumbKey: 'maxresdefault', tallThumbKey: 'oardefault', subFmt: 'srt', subsKey: '',
    ...getValue('settings', {}),
  };
  const saveSettings = () => setValue('settings', settings);

  // Follows YouTube's own UI language, then the browser's; English if neither is supported.
  function detectLang() {
    for (const c of [document.documentElement.lang, ...(navigator.languages || [navigator.language])]) {
      const base = String(c || '').toLowerCase().split('-')[0];
      if (I18N[base]) return base;
    }
    return 'en';
  }
  let LANG = 'en';
  const applyLang = () => { LANG = I18N[settings.lang] ? settings.lang : detectLang(); };
  applyLang();
  const locale = () => (LANG === 'zh' ? 'zh-CN' : LANG);

  function t(key, vars) {
    let s = I18N[LANG]?.[key] ?? I18N.en[key] ?? key;
    if (typeof s === 'object') s = s[new Intl.PluralRules(locale()).select(vars?.n ?? 0)] ?? s.other;
    return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : s;
  }

  // ---------- formatting ----------
  const numFmt = (opts) => { try { return new Intl.NumberFormat(locale(), opts); } catch { return new Intl.NumberFormat('en', opts); } };
  function fmtSize(b) {
    if (!b) return '';
    const [v, unit] = b >= 1e9 ? [b / 1e9, 'gigabyte'] : b >= 1e6 ? [b / 1e6, 'megabyte'] : [Math.max(1, b / 1e3), 'kilobyte'];
    return numFmt({ style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: v >= 100 || unit === 'kilobyte' ? 0 : 1 }).format(v);
  }
  const fmtKbps = (k) => numFmt({ style: 'unit', unit: 'kilobit-per-second', unitDisplay: 'short', maximumFractionDigits: 0 }).format(k);
  function fmtEta(s) {
    if (!isFinite(s)) return '';
    const [v, unit] = s >= 3600 ? [s / 3600, 'hour'] : s >= 60 ? [Math.ceil(s / 60), 'minute'] : [Math.max(1, Math.round(s)), 'second'];
    return numFmt({ style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: unit === 'hour' ? 1 : 0 }).format(v);
  }
  function fmtAgo(ts) {
    const s = (Date.now() - ts) / 1000;
    const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
    if (s < 45) return rtf.format(0, 'second');
    if (s < 3600) return rtf.format(-Math.round(s / 60), 'minute');
    if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
    return new Date(ts).toLocaleDateString(locale());
  }
  const pad2 = (n) => String(n).padStart(2, '0');
  // 00:03:50 style for the time fields
  const fmtTime = (s, long) => {
    s = Math.max(0, Math.round(s));
    const hh = Math.floor(s / 3600);
    return long || hh ? `${pad2(hh)}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}` : `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
  };
  // 3:50 / 1:02:03 style for labels
  const fmtClock = (s) => {
    s = Math.max(0, Math.round(s));
    const hh = Math.floor(s / 3600);
    return hh ? `${hh}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}` : `${Math.floor(s / 60)}:${pad2(s % 60)}`;
  };
  const parseTime = (str) => {
    const parts = String(str).trim().replace(',', '.').split(':');
    if (!parts[0] || parts.length > 3) return NaN;
    return parts.map(Number).reduce((acc, n) => (isFinite(n) && n >= 0 ? acc * 60 + n : NaN), 0);
  };
  // Also strips trailing dots/spaces, which the File System Access API rejects.
  // A file name Windows (and every other system) accepts: no reserved characters or names, no trailing
  // dots or spaces, at most 150 characters, never half of an emoji.
  const safeName = (s) => {
    let r = (s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').replace(/\s+/g, ' ').trim();
    r = Array.from(r).slice(0, 150).join('').replace(/[. ]+$/, '');
    if (/^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i.test(r)) r = `_${r}`;
    return r || 'video';
  };
  // Shorts play in a player of their own (#shorts-player, with YouTube's column of buttons beside it); the
  // watch page's player (#movie_player) stays in the page meanwhile, hidden and paused.
  const onShorts = () => location.pathname.startsWith('/shorts/');
  const videoId = () => (location.pathname === '/watch' ? new URLSearchParams(location.search).get('v')
    : /^\/shorts\/([\w-]{11})(?:\/|$)/.exec(location.pathname)?.[1] || null);
  const playerEl = () => document.querySelector(onShorts() ? '#shorts-player' : '#movie_player'); // a Short not playable here has none
  const pageTitle = () => document.title.replace(/^\(\d+\)\s*/, '').replace(/ - YouTube$/, '');
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // ---------- errors + retry helpers ----------
  // Errors meant for the user carry a translation key; anything else is mapped to a friendly message.
  class UserError extends Error {
    constructor(key, vars) { super(key); this.name = 'UserError'; this.key = key; this.vars = vars; }
  }
  class Canceled extends Error {
    constructor() { super('Canceled'); this.name = 'Canceled'; }
  }
  class StreamChanged extends Error {
    constructor() { super('Stream changed'); this.name = 'StreamChanged'; }
  }
  const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { status });
  const isTransient = (e) => e?.name !== 'UserError' && e?.name !== 'Canceled' &&
    (e?.status ? e.status >= 500 || e.status === 429 || e.status === 408 : /Network error|Timed out|Stalled|Short read/.test(String(e?.message)));

  function errInfo(e, fallback = 'errGeneric') {
    if (e?.name === 'UserError') return { key: e.key, vars: e.vars };
    const m = String(e?.message || '');
    if (/outside the video/.test(m)) return { key: 'errClip' };
    if (/moov|fragmented|stream layout/i.test(m)) return { key: 'errUnavailable' };
    if (isTransient(e)) return { key: fallback === 'errFormats' ? 'errReach' : 'errNetwork' };
    return { key: fallback };
  }

  // Resolves after ms, or early when the job is canceled or `stop` fires.
  function sleep(ms, ctl, stop) {
    return new Promise((res) => {
      const sigs = [ctl?.signal, stop].filter(Boolean);
      const done = () => { clearTimeout(timer); sigs.forEach((s) => s.removeEventListener('abort', done)); res(); };
      const timer = setTimeout(done, ms);
      sigs.forEach((s) => s.addEventListener('abort', done, { once: true }));
    });
  }

  function waitOnline(ctl) {
    return new Promise((res) => {
      const check = () => {
        if (navigator.onLine === false && !ctl?.signal.aborted) return;
        clearInterval(iv);
        removeEventListener('online', check);
        ctl?.signal.removeEventListener('abort', check);
        res();
      };
      const iv = setInterval(check, 5000);
      addEventListener('online', check);
      ctl?.signal.addEventListener('abort', check);
      check();
    });
  }

  // Retries temporary failures (network drops, 5xx, rate limits) with backoff; waits while offline.
  async function withRetry(fn, ctl, tries = 5) {
    for (let i = 1; ; i++) {
      if (ctl) await ctl.ready();
      if (navigator.onLine === false) await waitOnline(ctl);
      try {
        return await fn();
      } catch (e) {
        if (!isTransient(e) || i >= tries) throw e;
        await sleep(Math.min(15e3, 800 * 2 ** (i - 1)), ctl);
      }
    }
  }

  function gm(opts) {
    return new Promise((resolve, reject) => bgRequest({
      timeout: 30000,
      ...opts,
      onload: (r) => (r.status >= 200 && r.status < 300 ? resolve(r) : reject(httpError(r.status))),
      onerror: () => reject(new Error('Network error')),
      ontimeout: () => reject(new Error('Timed out')),
      onabort: () => reject(new Error('Aborted')),
    }));
  }

  // ---------- innertube ----------
  function ytcfg(key) {
    return page('ytcfg', key);
  }
  const ytHl = () => (LANG === 'zh' ? 'zh-CN' : LANG);

  // Requests go through the page's own fetch first: same connection (and IP address) as YouTube's
  // own player, which matters because stream URLs are bound to the IP that asked for them. The
  // extension's service worker is the fallback when the page context can't reach an address.
  const net = { page: true, pageOk: false };
  const noPage = () => {}; // YouTube refuses the service worker's requests: the page's connection is the only route

  // Retrieval variants, tried in order. A stream whose fresh link is still refused moves on to the
  // next one instead of asking the same way again.
  const VARIANTS = [
    { client: CLIENTS[0], visitor: true },
    { client: CLIENTS[1], visitor: true },
    { client: CLIENTS[0], visitor: false },
    { client: CLIENTS[1], visitor: false },
  ];

  // via: 'page' or 'gm' pins the transport (a stream's link and its bytes should take the same route);
  // left out, the page is used while it works.
  async function playerRequest(variant, vid, visitor, via) {
    const c = variant.client;
    const vis = variant.visitor && visitor;
    const headers = {
      'Content-Type': 'application/json',
      'X-YouTube-Client-Name': String(c.id),
      'X-YouTube-Client-Version': c.ctx.clientVersion,
      ...(vis ? { 'X-Goog-Visitor-Id': visitor } : {}),
    };
    const body = JSON.stringify({
      context: { client: { ...c.ctx, hl: ytHl(), gl: 'US', ...(vis ? { visitorData: visitor } : {}) } },
      videoId: vid, contentCheckOk: true, racyCheckOk: true,
    });
    const url = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
    if (via === 'page' || (!via && net.page)) {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 20000);
      try {
        const r = await fetch(url, { method: 'POST', credentials: 'omit', headers, body, signal: ac.signal });
        if (!r.ok) throw httpError(r.status);
        const j = await r.json();
        net.pageOk = true;
        return j;
      } catch (e) {
        if (e.status) throw e;
        if (ac.signal.aborted) throw new Error('Timed out');
        if (!via) noPage();
        if (via || net.page) throw new Error('Network error');
      } finally {
        clearTimeout(timer);
      }
    }
    const r = await gm({ method: 'POST', url, anonymous: true, headers: { ...headers, 'User-Agent': c.ua }, data: body, timeout: 20000 });
    return JSON.parse(r.responseText);
  }

  async function fetchPlayer(vid, from = 0, via) {
    const visitor = ytcfg('VISITOR_DATA');
    let netErr = null;
    let noDirect = false; // playable, but only through YouTube's own streaming protocol (no plain links)
    const refusals = [];
    const tried = new Set();
    for (let i = 0; i < VARIANTS.length; i++) {
      const vi = (from + i) % VARIANTS.length;
      const v = VARIANTS[vi];
      const sig = `${v.client.id}|${!!(v.visitor && visitor)}`;
      if (tried.has(sig)) continue; // without visitor data two variants are the same request
      tried.add(sig);
      let j;
      try {
        j = await playerRequest(v, vid, visitor, via);
      } catch (e) {
        netErr = e;
        continue;
      }
      if (j.playabilityStatus?.status === 'OK') {
        if (j.streamingData?.adaptiveFormats?.some((f) => f.url)) return { player: j, client: v.client, variant: vi };
        noDirect = true;
        continue;
      }
      refusals.push(j.playabilityStatus || {});
    }
    if (!refusals.length && netErr) throw netErr; // connection trouble on a way that may still work: getInfo retries
    if (noDirect) throw new UserError('errNoDirect');
    // YouTube's own reason text comes back in the UI language (hl), so it can be shown as is.
    const reason = refusals.map((s) => s.reason || s.messages?.[0]).find(Boolean);
    const err = new UserError(reason ? 'errReason' : 'errUnavailable', { reason });
    err.refused = refusals.map((s) => s.status || '');
    throw err;
  }

  function pageCaptions() {
    return page('captions') || [];
  }

  // Videos with dubbed audio carry each audio format once per language track (plus a volume-levelled
  // "DRC" copy), so an itag alone doesn't identify a stream.
  const xtags = (f) => { try { return new URL(f.url).searchParams.get('xtags') || ''; } catch { return ''; } };
  const isDrc = (f) => !!f.isDrc || /(^|:)drc=1/.test(xtags(f));
  const fmtId = (f) => `${f.itag}|${f.audioTrack?.id || ''}|${isDrc(f) ? 1 : 0}`;
  // Original language first (YouTube's "default" flag follows the UI language, so it can point at an
  // automatic dub), then YouTube's default track; the normal copy before the DRC one.
  const trackScore = (f) => {
    const orig = /(^|:)acont=original/.test(xtags(f));
    return (!f.audioTrack || orig ? 4 : f.audioTrack.audioIsDefault ? 2 : 0) + (isDrc(f) ? 0 : 1);
  };
  const bestTracks = (list) => {
    const top = Math.max(...list.map(trackScore));
    return list.filter((f) => trackScore(f) === top);
  };

  // Every option carries `key` (stable id for retry) and `format` + `quality` (history columns).
  function buildInfo(vid, player, client, variant) {
    const sd = player.streamingData;
    const all = (sd.adaptiveFormats || []).filter((f) => f.url);
    const len = (f) => +f.contentLength || Math.round((+f.approxDurationMs || 0) / 1000 * (f.bitrate || 0) / 8);
    const mp4a = bestTracks(all.filter((f) => f.mimeType.startsWith('audio/mp4'))).sort((a, b) => b.bitrate - a.bitrate);
    const opus = bestTracks(all.filter((f) => f.mimeType.startsWith('audio/webm'))).sort((a, b) => b.bitrate - a.bitrate);
    const bestAac = mp4a[0];
    const kbps = (f) => Math.round(f.bitrate / 1000);

    // One entry per height: prefer H.264 (plays everywhere), then AV1; mp4 only so it can be muxed locally.
    const byH = new Map();
    for (const f of all.filter((f) => f.mimeType.startsWith('video/mp4') && f.height)) {
      const h = Math.min(f.width || f.height, f.height); // portrait shorts report quality by the short side
      const score = (f.mimeType.includes('avc1') ? 2 : 1) * 1e9 + (f.fps || 0) * 1e6 + f.bitrate;
      const cur = byH.get(h);
      if (!cur || score > cur.score) byH.set(h, { f, score, h });
    }
    const video = [...byH.values()].sort((a, b) => b.h - a.h).map(({ f, h }) => ({
      kind: 'video', key: `v${h}`, format: 'MP4', quality: `${h}p${(f.fps || 0) > 30 ? f.fps : ''}`, height: h,
      badge: h >= 2160 ? '4K' : h >= 1440 ? '2K' : h >= 720 ? 'HD' : '',
      codec: f.mimeType.includes('avc1') ? 'H.264' : f.mimeType.includes('av01') ? 'AV1' : 'MP4',
      vf: f, af: bestAac, size: len(f) + (bestAac ? len(bestAac) : 0), trimmable: true,
    }));

    const audio = [];
    const secs = +player.videoDetails?.lengthSeconds || 0;
    if (bestAac) {
      for (const k of [320, 192, 128]) {
        audio.push({ kind: 'mp3', key: `mp3-${k}`, format: 'MP3', quality: `${k}kbps`, kbps: k, hintKey: 'hintCover',
          ext: 'mp3', af: bestAac, size: secs * k * 125, approx: true, trimmable: true });
      }
      audio.push({ kind: 'audio', key: 'm4a', format: 'M4A', quality: `${kbps(bestAac)}kbps`, kbps: kbps(bestAac), hintKey: 'hintOriginal',
        ext: 'm4a', af: bestAac, size: len(bestAac), trimmable: true });
    }
    if (opus[0]) {
      // Opus clips are cut with FFmpeg (WebM has no segment index to cut on locally).
      audio.push({ kind: 'audio', key: 'opus', format: 'OPUS', quality: `${kbps(opus[0])}kbps`, kbps: kbps(opus[0]), hintKey: 'hintOriginal',
        ext: 'webm', af: opus[0], size: len(opus[0]), trimmable: true, needsEngine: true });
    }
    if (bestAac) {
      audio.push({ kind: 'wav', key: 'wav', format: 'WAV', quality: '44.1 kHz', hintKey: 'hintLossless',
        ext: 'wav', af: bestAac, size: Math.round(secs * 44100 * 4), approx: true, trimmable: true });
    }

    let tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    if (!tracks.length) tracks = pageCaptions();
    const subs = tracks.map((tr) => {
      const auto = tr.kind === 'asr';
      const name = (tr.name?.simpleText || tr.name?.runs?.map((r) => r.text).join('') || tr.languageCode).replace(/\s*\([^)]*\)\s*$/, (m) => (auto ? '' : m));
      return { kind: 'subs', key: `sub-${tr.languageCode}-${auto ? 'a' : 'm'}`, format: 'SRT', quality: tr.languageCode, label: name, auto, lang: tr.languageCode, baseUrl: tr.baseUrl };
    });

    return {
      vid, client, variant, formats: all, at: Date.now(),
      expires: Math.min(...all.map((f) => urlExpiry(f.url) || Infinity)),
      title: player.videoDetails?.title || pageTitle(),
      author: player.videoDetails?.author || '',
      duration: secs,
      video, audio, subs,
    };
  }

  const THUMBS = [
    { key: 'oardefault', labelKey: 'thumbPortrait', res: '1080x1920', tall: true }, // a Short's picture in its own format
    { key: 'maxresdefault', labelKey: 'thumbMax', res: '1280x720' },
    { key: 'sddefault', labelKey: 'thumbStandard', res: '640x480' },
    { key: 'hqdefault', labelKey: 'thumbHigh', res: '480x360' },
    { key: 'mqdefault', labelKey: 'thumbMedium', res: '320x180' },
  ];
  const thumbOpt = (x, dims) => ({ kind: 'thumb', key: `thumb-${x.key}`, thumb: x.key, format: 'JPG', quality: dims?.w ? `${dims.w}x${dims.h}` : x.res });

  const SUB_FORMATS = {
    srt: { label: 'SRT', ext: 'srt', type: 'application/x-subrip' },
    vtt: { label: 'WebVTT', ext: 'vtt', type: 'text/vtt' },
    ttml: { label: 'TTML', ext: 'ttml', type: 'application/ttml+xml' },
    srv3: { label: 'SRV3', ext: 'srv3', type: 'application/xml' },
  };

  const infoCache = new Map();
  // Stream links expire after ~6 h and are bound to the address that asked for them. Info older than
  // this, or with links close to expiring, is fetched again before a download starts (a tab left open
  // for hours, a VPN switched on or off in between).
  const INFO_TTL = 30 * 60e3;
  const infoStale = (info) => Date.now() - (info.at || 0) > INFO_TTL || (info.expires || 0) - Date.now() < 20 * 60e3;
  // opts.force: fetch fresh links (cached info is reused for INFO_TTL otherwise).
  // opts.from: which retrieval variant to start with. opts.via: pin the transport (see playerRequest).
  // Forced requests within 5 s are shared.
  function getInfo(vid, opts = {}) {
    const from = opts.from ?? 0;
    const via = opts.via || '';
    const hit = infoCache.get(vid);
    const age = hit ? Date.now() - hit.at : Infinity;
    if (hit && ((age < 5000 && hit.from === from && hit.via === via) || (!opts.force && age < INFO_TTL))) return hit.p;
    const entry = { at: Date.now(), from, via };
    entry.p = withRetry(() => fetchPlayer(vid, from, via || undefined), null, 4).then(({ player, client, variant }) => buildInfo(vid, player, client, variant));
    infoCache.set(vid, entry);
    entry.p.catch(() => { if (infoCache.get(vid) === entry) infoCache.delete(vid); });
    return entry.p;
  }

  function findOption(info, key) {
    if (key?.startsWith('thumb-')) {
      const x = THUMBS.find((y) => `thumb-${y.key}` === key);
      return x ? thumbOpt(x) : null;
    }
    return [...info.video, ...info.audio, ...info.subs].find((o) => o.key === key) || null;
  }

  // ---------- pause / resume / cancel ----------
  function makeCtl() {
    const ac = new AbortController();
    let paused = false;
    const waiters = [];
    const pauseHooks = new Set();
    const ctl = {
      signal: ac.signal,
      get paused() { return paused; },
      pause() {
        if (paused || ac.signal.aborted) return;
        paused = true;
        pauseHooks.forEach((f) => f());
      },
      resume() {
        paused = false;
        waiters.splice(0).forEach((r) => r());
      },
      cancel() {
        ac.abort();
        ctl.resume();
      },
      async ready() {
        if (ac.signal.aborted) throw new Canceled();
        if (paused) await new Promise((r) => waiters.push(r));
        if (ac.signal.aborted) throw new Canceled();
      },
      onPause(f) {
        pauseHooks.add(f);
        return () => pauseHooks.delete(f);
      },
    };
    return ctl;
  }

  // ---------- stream cache ----------
  // Complete streams stay in memory for this tab, so a second download of the same video (an MP3
  // after the MP4, a clip after the full video, a retry) is processed locally instead of fetched again.
  const streamCache = new Map();
  const CACHE_MAX = 600e6;
  const cacheKey = (vid, f) => `${vid}:${f.itag}:${f.lastModified || ''}:${f.contentLength || ''}`;
  function cacheGet(k) {
    const v = streamCache.get(k);
    if (v) { streamCache.delete(k); streamCache.set(k, v); }
    return v || null;
  }
  function cachePut(k, u8) {
    if (u8.length > 300e6) return;
    streamCache.set(k, u8);
    let total = 0;
    for (const v of streamCache.values()) total += v.length;
    for (const [key, v] of streamCache) {
      if (total <= CACHE_MAX) break;
      streamCache.delete(key);
      total -= v.length;
    }
  }

  // ---------- resilient range downloader ----------
  const urlExpiry = (url) => (+(/[?&]expire=(\d+)/.exec(url) || [])[1] || 0) * 1000;
  let sawProgress = false; // some managers never fire onprogress; then the stall watchdog must be lenient

  // A stream source whose URL can be swapped for a fresh one when YouTube's link expires or is
  // refused. The bytes already downloaded stay valid only if the fresh URL points at the identical file.
  function makeSource(fmt, info) {
    // via: null follows the page/manager choice; set once this stream has been moved to the other route.
    const src = { vid: info.vid, fmt, ua: info.client.ua, variant: info.variant ?? 0, gen: 0, refreshing: null, refreshedAt: 0, via: null, switched: false };
    src.refresh = (rotate) => (src.refreshing ||= (async () => {
      const fresh = await getInfo(info.vid, { force: true, from: rotate ? (src.variant + 1) % VARIANTS.length : src.variant, via: src.via });
      const nf = fresh.formats.find((f) => fmtId(f) === fmtId(src.fmt));
      if (!nf) throw new UserError('errFormatGone');
      if (String(nf.contentLength || '') !== String(src.fmt.contentLength || '') || String(nf.lastModified || '') !== String(src.fmt.lastModified || '')) {
        throw new StreamChanged();
      }
      Object.assign(src, { fmt: nf, ua: fresh.client.ua, variant: fresh.variant, refreshedAt: Date.now() });
      src.gen++;
    })().finally(() => { src.refreshing = null; }));
    return src;
  }

  function rangeState(from, to, filled) {
    const queue = [];
    if (!filled) for (let s = from; s <= to; s += CHUNK) queue.push([s, Math.min(to, s + CHUNK - 1)]);
    return { from, to, out: filled || new Uint8Array(to - from + 1), queue, got: filled ? filled.length : 0, refreshes: 0, failed: false };
  }

  // One range through the page's fetch, streamed so progress is live and a stall can be detected.
  async function fetchChunkPage(src, a, b, cs, ctl, onBytes, stop) {
    const ac = new AbortController();
    const abort = () => ac.abort();
    let timer = 0;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { cs.stalled = true; abort(); }, 30e3);
    };
    const offPause = ctl.onPause(() => { cs.paused = true; abort(); });
    const onStop = () => { cs.stopped = true; abort(); };
    ctl.signal.addEventListener('abort', abort, { once: true });
    stop.addEventListener('abort', onStop, { once: true });
    try {
      arm();
      let r;
      try {
        r = await fetch(`${src.fmt.url}&range=${a}-${b}`, { credentials: 'omit', cache: 'no-store', signal: ac.signal });
      } catch (e) {
        if (!ac.signal.aborted) noPage();
        throw e;
      }
      if (!r.ok) throw httpError(r.status);
      net.pageOk = true;
      const out = new Uint8Array(b - a + 1);
      const reader = r.body.getReader();
      let n = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        arm();
        if (n + value.length > out.length) throw new Error('Short read');
        out.set(value, n);
        n += value.length;
        cs.loaded = n;
        onBytes(value.length);
      }
      if (n !== out.length) throw new Error('Short read');
      return out;
    } catch (e) {
      if (e.status || e.message === 'Short read') throw e;
      throw new Error(cs.stalled ? 'Stalled' : ac.signal.aborted ? 'Aborted' : 'Network error');
    } finally {
      clearTimeout(timer);
      offPause();
      ctl.signal.removeEventListener('abort', abort);
      stop.removeEventListener('abort', onStop);
    }
  }

  // The same through the extension's service worker (fallback transport).
  function fetchChunkGM(src, a, b, cs, ctl, onBytes, stop) {
    return new Promise((resolve, reject) => {
      let req = null;
      let timer = 0;
      const arm = () => {
        clearTimeout(timer);
        timer = setTimeout(() => { cs.stalled = true; req?.abort?.(); }, sawProgress ? 30e3 : 180e3);
      };
      const onAbort = () => req?.abort?.();
      const onStop = () => { cs.stopped = true; req?.abort?.(); };
      const offPause = ctl.onPause(() => { cs.paused = true; req?.abort?.(); });
      const done = (fn, v) => {
        clearTimeout(timer);
        offPause();
        ctl.signal.removeEventListener('abort', onAbort);
        stop.removeEventListener('abort', onStop);
        fn(v);
      };
      ctl.signal.addEventListener('abort', onAbort, { once: true });
      stop.addEventListener('abort', onStop, { once: true });
      arm();
      req = bgRequest({
        method: 'GET', url: `${src.fmt.url}&range=${a}-${b}`, responseType: 'arraybuffer', anonymous: true, headers: { 'User-Agent': src.ua },
        onprogress: (e) => {
          sawProgress = true;
          arm();
          if (e.loaded > cs.loaded) { onBytes(e.loaded - cs.loaded); cs.loaded = e.loaded; }
        },
        onload: (x) => (x.status >= 200 && x.status < 300 ? done(resolve, new Uint8Array(x.response)) : done(reject, httpError(x.status))),
        onerror: () => done(reject, new Error('Network error')),
        ontimeout: () => done(reject, new Error('Timed out')),
        onabort: () => done(reject, new Error(cs.stalled ? 'Stalled' : 'Aborted')),
      });
    });
  }

  const routeOf = (src) => src.via || (net.page ? 'page' : 'gm');
  const fetchChunk = (src, ...args) => (routeOf(src) === 'page' ? fetchChunkPage : fetchChunkGM)(src, ...args);

  // Moves a stream to the other connection (page <-> service worker): used when a link fetched
  // moments ago is still refused, which happens when the link request and the stream request leave
  // over different routes (IPv4 vs IPv6, a VPN or proxy that covers only one of them), or when the
  // page's connection keeps failing. The page route is only chosen if it has worked in this tab.
  function switchRoute() {
    return false; // see noPage
  }

  // ---------- sharing the connection with the video ----------
  // Downloads made in this page use the same connection as YouTube's player. Their range requests share
  // a few slots, and fewer (or none) are handed out while the video here plays with a short buffer, so
  // the player gets the bandwidth it needs first. The Download Manager app gets the same reports.
  function bufferAhead(v) {
    const t = v.currentTime;
    for (let i = 0; i < v.buffered.length; i++) {
      if (v.buffered.start(i) <= t + 0.5 && v.buffered.end(i) >= t) return v.buffered.end(i) - t;
    }
    return 0;
  }
  const isLiveNow = () => !onShorts() && !!document.querySelector('meta[itemprop="isLiveBroadcast"][content="True"]') && !document.querySelector('meta[itemprop="endDate"]');
  function playbackState() {
    const v = mainVideo();
    if (!v || v.paused || v.ended) return { playing: false, buffer: 0, live: false };
    // A tab opened in the background: the browser holds its video back until it is first shown, so
    // it "plays" without loading anything. Nothing to protect there yet.
    if (document.hidden && v.readyState === 0) return { playing: false, buffer: 0, live: false };
    return { playing: true, buffer: Math.round(bufferAhead(v) * 10) / 10, live: isLiveNow() };
  }
  // 0: nothing plays. 1: fine. 2: getting short. 3: about to run dry. YouTube's player keeps only a short
  // stretch buffered by design (often 10 to 30 s) and plays fine with it, so only a nearly empty buffer
  // counts. Live streams keep less ahead. (The app uses the same scale.)
  function playbackPressure(p = playbackState()) {
    if (!p.playing) return 0;
    const [low, ok] = p.live ? [1, 2.5] : [2.5, 5];
    return p.buffer >= ok ? 1 : p.buffer >= low ? 2 : 3;
  }
  const sharing = () => playbackPressure() >= 2;

  const slots = { used: 0, queue: [], dryAt: 0, timer: 0 };
  function slotLimit() {
    const pr = playbackPressure();
    if (pr < 3) slots.dryAt = 0;
    else slots.dryAt ||= Date.now();
    if (pr === 0) return Infinity;
    if (pr === 1) return 2;
    if (pr === 2) return 1;
    return Date.now() - slots.dryAt > 15e3 ? 1 : 0; // a video that can't keep up anyway doesn't stop downloads for good
  }
  function grantSlots() {
    clearTimeout(slots.timer);
    const limit = slotLimit();
    while (slots.queue.length && slots.used < limit) {
      slots.used++;
      slots.queue.shift().grant();
    }
    if (slots.queue.length) slots.timer = setTimeout(grantSlots, 500);
  }
  // Resolves with a release function once a range may use the connection, or with null when the job
  // is paused or canceled (or its download stopped) while waiting.
  function takeSlot(ctl, stop) {
    return new Promise((resolve) => {
      const sigs = [ctl.signal, stop];
      let offPause = () => {};
      const cleanup = () => {
        offPause();
        sigs.forEach((sg) => sg.removeEventListener('abort', drop));
      };
      const w = {
        grant: () => {
          cleanup();
          let released = false;
          resolve(() => {
            if (released) return;
            released = true;
            slots.used--;
            grantSlots();
          });
        },
      };
      function drop() {
        const i = slots.queue.indexOf(w);
        if (i >= 0) slots.queue.splice(i, 1);
        cleanup();
        resolve(null);
      }
      if (ctl.signal.aborted || stop.aborted || ctl.paused) { resolve(null); return; }
      offPause = ctl.onPause(drop);
      sigs.forEach((sg) => sg.addEventListener('abort', drop, { once: true }));
      slots.queue.push(w);
      grantSlots();
    });
  }
  // The player's own events make the slots (and the app) react at once instead of on the next tick.
  const PLAYER_EVENTS = ['waiting', 'playing', 'pause', 'seeked', 'ended', 'emptied'];
  function onPlayerEvent(e) {
    if (e.target !== mainVideo()) return;
    if (slots.queue.length) grantSlots();
    if (e.type !== 'ended') dmPlaybackSoon();
  }
  for (const type of PLAYER_EVENTS) document.addEventListener(type, onPlayerEvent, true);

  // Downloads the byte ranges still queued in `st` with parallel requests. Recovers on its own:
  // expired links get a fresh URL (and a different retrieval variant if the fresh one is refused too),
  // dropped or stalled connections back off and retry, offline waits for the connection. Every attempt
  // is bounded, so a request is never retried forever. Pausing aborts in-flight ranges and re-queues
  // them. The call only returns (or throws) once every worker has stopped, so a later resume of the
  // same state never overlaps with stragglers from this run.
  async function downloadRange(src, st, ctl, onBytes, onNotice) {
    const stop = new AbortController(); // fired on a fatal error: wakes sleeping workers, aborts in-flight ranges
    st.failed = false;
    st.error = null;
    st.refreshes = 0;
    const halt = (e) => {
      if (st.failed) return;
      st.failed = true;
      st.error = e;
      stop.abort();
    };
    const step = async (state) => {
      await ctl.ready();
      if (navigator.onLine === false) {
        onNotice('waitingOnline');
        await waitOnline(ctl);
        onNotice(null);
        return;
      }
      const exp = urlExpiry(src.fmt.url);
      if (exp && exp - Date.now() < 90e3) {
        onNotice('refreshingLink');
        await src.refresh(false);
        onNotice(null);
      }
      if (!st.queue.length) return;
      const release = await takeSlot(ctl, stop.signal);
      if (!release) {
        if (ctl.signal.aborted) throw new Canceled();
        return;
      }
      const range = st.queue.shift();
      if (!range) { release(); return; }
      const [a, b] = range;
      const cs = { loaded: 0, paused: false, stalled: false, stopped: false, gen: src.gen };
      try {
        const buf = await fetchChunk(src, a, b, cs, ctl, onBytes, stop.signal);
        if (buf.length !== b - a + 1) throw new Error('Short read');
        st.out.set(buf, a - st.from);
        st.got += buf.length;
        onBytes(buf.length - cs.loaded);
        if (state.attempt) onNotice(null);
        state.attempt = 0;
      } catch (e) {
        onBytes(-cs.loaded);
        st.queue.unshift([a, b]); // nothing is lost: the range goes back for the next attempt
        if (ctl.signal.aborted) throw new Canceled();
        if (cs.paused || cs.stopped) return;
        if (e.status === 403 || e.status === 404 || e.status === 410) {
          if (cs.gen !== src.gen) return; // another request already fetched a fresh link
          // Fresh links from every route and retrieval variant were refused: YouTube is blocking this
          // video for this connection (typically only the first 1 MiB is served without a proof-of-origin
          // token, and the clients that don't need one ask a flagged IP to sign in).
          if (!src.refreshing && ++st.refreshes > 6) throw new UserError('errBlocked');
          // A link fetched moments ago and still refused: try the other route first (its fresh link is
          // requested over that route too, so both match), then a different retrieval variant.
          const recent = Date.now() - src.refreshedAt < 60e3;
          onNotice('refreshingLink');
          if (recent && switchRoute(src)) await src.refresh(false);
          else await src.refresh(recent);
          onNotice(null);
          return;
        }
        if (!isTransient(e)) throw e;
        if (++state.attempt > 8) throw new UserError('errNetwork');
        onNotice('reconnecting');
        // The page's connection keeps failing (a blocker, a proxy that only covers extensions): move over.
        if (state.attempt === 3 && routeOf(src) === 'page' && switchRoute(src)) return;
        release(); // don't hold a slot while backing off
        await sleep(Math.min(30e3, 1000 * 2 ** (state.attempt - 1)), ctl, stop.signal);
      } finally {
        release();
      }
    };
    const worker = async () => {
      const state = { attempt: 0 };
      try {
        while (st.queue.length && !st.failed) await step(state);
      } catch (e) {
        halt(e);
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, Math.min(PARALLEL, st.queue.length)) }, worker));
    if (ctl.signal.aborted) throw new Canceled();
    if (st.failed) throw st.error;
    return st.out;
  }

  // Segment index (sidx) of a DASH stream: byte offset, size and time span of every segment.
  function parseSidx(u8) {
    const sidx = boxes(u8).find((b) => b.type === 'sidx');
    if (!sidx) return null;
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let p = sidx.body;
    const ver = u8[p];
    p += 8; // version/flags + reference_ID
    const ts = dv.getUint32(p);
    p += 4;
    let tm;
    let first;
    if (ver === 0) { tm = dv.getUint32(p); first = dv.getUint32(p + 4); p += 8; } else { tm = Number(dv.getBigUint64(p)); first = Number(dv.getBigUint64(p + 8)); p += 16; }
    const count = dv.getUint16(p + 2);
    p += 4;
    let offset = sidx.end + first;
    const segs = [];
    for (let i = 0; i < count; i++, p += 12) {
      const size = dv.getUint32(p) & 0x7fffffff;
      const dur = dv.getUint32(p + 4);
      segs.push({ offset, size, start: tm / ts, end: (tm + dur) / ts });
      offset += size;
      tm += dur;
    }
    return segs;
  }

  // Decides which bytes of a stream to fetch: nothing if the whole stream is cached; the whole
  // stream normally; when trimming an MP4 stream, the init segment plus only the media segments
  // that overlap the clip (YouTube starts every segment on a keyframe, so they can be cut locally).
  async function planStream(src, trim, ctl, onNotice) {
    const cached = cacheGet(cacheKey(src.vid, src.fmt));
    if (cached) return { head: null, from: 0, to: cached.length - 1, cached };
    const idxEnd = +(src.fmt.indexRange?.end || 0);
    if (trim && idxEnd && src.fmt.mimeType?.includes('mp4')) {
      const head = await downloadRange(src, rangeState(0, idxEnd), ctl, () => {}, onNotice);
      const segs = parseSidx(head)?.filter((s) => s.end > trim.start - 0.25 && s.start < trim.end + 0.1);
      if (segs?.length) {
        const last = segs[segs.length - 1];
        return { head, from: segs[0].offset, to: last.offset + last.size - 1 };
      }
    }
    let total = +src.fmt.contentLength;
    if (!total) {
      const r = await withRetry(() => gm({ method: 'HEAD', url: src.fmt.url, headers: { 'User-Agent': src.ua }, anonymous: true }), ctl);
      total = +(/content-length:\s*(\d+)/i.exec(r.responseHeaders) || [])[1];
      if (!total) throw new UserError('errUnavailable');
    }
    return { head: null, from: 0, to: total - 1, full: true };
  }

  // ---------- fragmented MP4 remuxer ----------
  // YouTube DASH mp4 streams are ftyp, moov(mvex), sidx, then moof/mdat pairs with
  // default-base-is-moof, so fragments can be copied verbatim once track IDs are rewritten.
  function boxes(u8, start = 0, end = u8.length) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    const list = [];
    let p = start;
    while (p + 8 <= end) {
      let size = dv.getUint32(p);
      const type = String.fromCharCode(u8[p + 4], u8[p + 5], u8[p + 6], u8[p + 7]);
      let hdr = 8;
      if (size === 1) { size = Number(dv.getBigUint64(p + 8)); hdr = 16; } else if (size === 0) size = end - p;
      if (size < hdr || p + size > end) break;
      list.push({ type, start: p, end: p + size, body: p + hdr });
      p += size;
    }
    return list;
  }
  const child = (u8, box, type) => boxes(u8, box.body, box.end).find((b) => b.type === type);
  const dvOf = (u8) => new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const u32 = (u8, off, val) => dvOf(u8).setUint32(off, val);
  const rd32 = (u8, off) => dvOf(u8).getUint32(off);

  function mkBox(type, ...parts) {
    const size = 8 + parts.reduce((n, p) => n + p.length, 0);
    const out = new Uint8Array(size);
    u32(out, 0, size);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    let o = 8;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
  }

  function trackInfo(init, frag, newId) {
    const top = boxes(init);
    const ftyp = top.find((b) => b.type === 'ftyp');
    const moov = top.find((b) => b.type === 'moov');
    if (!moov) throw new Error('Stream has no moov');
    const mvhd = child(init, moov, 'mvhd');
    const trak = child(init, moov, 'trak');
    const mvex = child(init, moov, 'mvex');
    const trex = mvex && child(init, mvex, 'trex');
    if (!trak || !trex) throw new Error('Stream is not fragmented MP4');

    const kids = boxes(init, trak.body, trak.end);
    const tkhdBox = kids.find((b) => b.type === 'tkhd');
    const tkhd = init.slice(tkhdBox.start, tkhdBox.end);
    u32(tkhd, 8 + 4 + (tkhd[8] ? 16 : 8), newId);
    const mdia = kids.find((b) => b.type === 'mdia');
    const mdhd = child(init, mdia, 'mdhd');
    const timescale = rd32(init, mdhd.body + 4 + (init[mdhd.body] ? 16 : 8));

    // Start of the existing single-entry edit list (e.g. the B-frame delay of H.264 streams).
    const edts = kids.find((b) => b.type === 'edts');
    const elst = edts && child(init, edts, 'elst');
    let mediaStart = 0;
    if (elst && rd32(init, elst.body + 4) >= 1) {
      mediaStart = init[elst.body] ? Number(dvOf(init).getBigInt64(elst.body + 16)) : dvOf(init).getInt32(elst.body + 12);
      mediaStart = Math.max(0, mediaStart);
    }

    const trexBytes = init.slice(trex.start, trex.end);
    u32(trexBytes, 12, newId);
    const minf = child(init, mdia, 'minf');
    const stbl = child(init, minf, 'stbl');
    const stsd = child(init, stbl, 'stsd');
    const sub = (b) => init.subarray(b.start, b.end);

    const fb = boxes(frag);
    const frags = [];
    for (let i = 0; i < fb.length; i++) {
      if (fb[i].type !== 'moof') continue;
      const moof = fb[i];
      const mdat = fb[i + 1]?.type === 'mdat' ? fb[i + 1] : null;
      const traf = child(frag, moof, 'traf');
      const tfdt = traf && child(frag, traf, 'tfdt');
      let time = 0;
      let tfdtOff = -1;
      let tfdtV = 0;
      if (tfdt) {
        tfdtV = frag[tfdt.body];
        tfdtOff = tfdt.body + 4 - moof.start;
        time = tfdtV ? Number(dvOf(frag).getBigUint64(tfdt.body + 4)) : rd32(frag, tfdt.body + 4);
      }
      frags.push({ bytes: frag.subarray(moof.start, mdat ? mdat.end : moof.end), moofSize: moof.end - moof.start, time, tfdtOff, tfdtV });
    }
    return {
      ftyp: ftyp && init.subarray(ftyp.start, ftyp.end),
      mvhd: mvhd && init.slice(mvhd.start, mvhd.end),
      tkhd,
      edts: edts && init.subarray(edts.start, edts.end),
      rest: kids.filter((b) => b.type !== 'tkhd' && b.type !== 'edts').map(sub),
      trex: trexBytes, timescale, mediaStart, frags,
      // pieces for rebuilding a regular (non-fragmented) track
      mdhd: init.slice(mdhd.start, mdhd.end),
      mdiaOther: boxes(init, mdia.body, mdia.end).filter((b) => b.type !== 'mdhd' && b.type !== 'minf').map(sub),
      minfOther: boxes(init, minf.body, minf.end).filter((b) => b.type !== 'stbl').map(sub),
      stsd: sub(stsd),
      isAudio: String.fromCharCode(...init.subarray(stsd.body + 12, stsd.body + 16)) === 'mp4a',
      trexDef: { dur: rd32(init, trex.body + 12), size: rd32(init, trex.body + 16), flags: rd32(init, trex.body + 20) },
    };
  }

  // Samples of one moof/mdat pair: decode time, duration, size, composition offset, keyframe flag, bytes.
  function fragSamples(f, def) {
    const b = f.bytes;
    const dv = dvOf(b);
    const out = [];
    for (const traf of boxes(b, 8, f.moofSize).filter((x) => x.type === 'traf')) {
      const tfhd = child(b, traf, 'tfhd');
      const tf = rd32(b, tfhd.body) & 0xffffff;
      if (tf & 1) throw new Error('Unsupported stream layout (explicit base offset)');
      let p = tfhd.body + 8;
      if (tf & 2) p += 4;
      let dDur = def.dur, dSize = def.size, dFlags = def.flags;
      if (tf & 8) { dDur = rd32(b, p); p += 4; }
      if (tf & 0x10) { dSize = rd32(b, p); p += 4; }
      if (tf & 0x20) dFlags = rd32(b, p);
      let t = f.time;
      let pos = f.moofSize + 8; // default: right after moof + mdat header
      for (const trun of boxes(b, traf.body, traf.end).filter((x) => x.type === 'trun')) {
        const ver = b[trun.body];
        const rf = rd32(b, trun.body) & 0xffffff;
        const n = rd32(b, trun.body + 4);
        let q = trun.body + 8;
        if (rf & 1) { pos = dv.getInt32(q); q += 4; } // relative to moof start (default-base-is-moof)
        let firstFlags = null;
        if (rf & 4) { firstFlags = rd32(b, q); q += 4; }
        for (let i = 0; i < n; i++) {
          let dur = dDur, size = dSize, flags = i === 0 && firstFlags !== null ? firstFlags : dFlags, cto = 0;
          if (rf & 0x100) { dur = rd32(b, q); q += 4; }
          if (rf & 0x200) { size = rd32(b, q); q += 4; }
          if (rf & 0x400) { flags = rd32(b, q); q += 4; }
          if (rf & 0x800) { cto = ver ? dv.getInt32(q) : rd32(b, q); q += 4; }
          out.push({ dts: t, dur, size, cto, sync: !(flags & 0x10000), data: b.subarray(pos, pos + size) });
          t += dur;
          pos += size;
        }
      }
    }
    return out;
  }

  // Joins 1..n single-track fMP4 streams ({init, frag}, video first) into one file.
  // Full length: fragmented MP4, fragments copied as-is. With trim {start, end} (seconds):
  // a regular MP4 with real sample tables, starting at the keyframe before the clip, plus an
  // edit list so playback starts and stops exactly on the cut points (players honor edit lists
  // reliably only in non-fragmented files). edit: false leaves the edit list out (used before
  // decoding audio); lead[i] then says how many seconds of track i precede the clip start.
  function remux(streams, durationSec, { trim = null, edit = true } = {}) {
    const tracks = streams.map((s, i) => trackInfo(s.init, s.frag, i + 1));
    return trim ? remuxFlat(tracks, trim, edit) : remuxFragmented(tracks, durationSec);
  }

  const setDur = (box, off0, off1, v) => {
    if (box[8]) dvOf(box).setBigUint64(off1, BigInt(Math.round(v)));
    else u32(box, off0, Math.min(0xffffffff, Math.round(v)));
  };
  const fullBox = (type, ver, flags, ...parts) => {
    const hdr = new Uint8Array(4);
    u32(hdr, 0, ((ver << 24) | flags) >>> 0);
    return mkBox(type, hdr, ...parts);
  };
  const table = (rows) => {
    const b = new Uint8Array(rows.length * 4);
    const dv = dvOf(b);
    for (let i = 0; i < rows.length; i++) { if (rows[i] < 0) dv.setInt32(i * 4, rows[i]); else dv.setUint32(i * 4, rows[i]); }
    return b;
  };
  const rle = (vals) => {
    const rows = [];
    let n = 0;
    let prev;
    for (const v of vals) {
      if (n && v === prev) n++;
      else { if (n) rows.push(n, prev); prev = v; n = 1; }
    }
    if (n) rows.push(n, prev);
    return rows;
  };
  const elstBox = (mediaTime, segDur) => {
    const b = new Uint8Array(20); // fullbox + entry_count + one v0 entry
    u32(b, 4, 1);
    u32(b, 8, Math.min(0xffffffff, segDur));
    dvOf(b).setInt32(12, mediaTime);
    b[17] = 1; // media_rate_integer = 1
    return mkBox('edts', mkBox('elst', b));
  };

  function remuxFragmented(tracks, durationSec) {
    const mvhd = tracks[0].mvhd;
    const ver = mvhd[8];
    const movieTs = rd32(mvhd, 8 + 4 + (ver ? 16 : 8));
    const dur = Math.round(durationSec * movieTs);
    setDur(mvhd, 24, 32, dur);
    u32(mvhd, mvhd.length - 4, tracks.length + 1); // next_track_ID
    const traks = tracks.map((t) => mkBox('trak', t.tkhd, ...(t.edts ? [t.edts] : []), ...t.rest));
    const mehdBody = new Uint8Array(8);
    u32(mehdBody, 4, Math.min(0xffffffff, dur));
    const moov = mkBox('moov', mvhd, ...traks, mkBox('mvex', ...(ver ? [] : [mkBox('mehd', mehdBody)]), ...tracks.map((t) => t.trex)));

    const parts = [tracks[0].ftyp || mkBox('ftyp', new TextEncoder().encode('isom\0\0\x02\0isomiso2avc1mp41')), moov];
    // Interleave fragments by relative position so players don't have to seek far between tracks.
    const idx = tracks.map(() => 0);
    let seq = 1;
    for (;;) {
      let k = -1;
      for (let i = 0; i < tracks.length; i++) {
        if (idx[i] < tracks[i].frags.length && (k < 0 || idx[i] / tracks[i].frags.length < idx[k] / tracks[k].frags.length)) k = i;
      }
      if (k < 0) break;
      const f = tracks[k].frags[idx[k]++];
      const moof = f.bytes.slice(0, f.moofSize); // copy moof only; mdat is referenced as-is
      const mfhd = child(moof, { body: 8, end: moof.length }, 'mfhd');
      if (mfhd) u32(moof, mfhd.body + 4, seq++);
      for (const traf of boxes(moof, 8, moof.length).filter((b) => b.type === 'traf')) {
        const tfhd = child(moof, traf, 'tfhd');
        if (tfhd) u32(moof, tfhd.body + 4, k + 1);
      }
      parts.push(moof, f.bytes.subarray(f.moofSize));
    }
    return { parts, lead: tracks.map(() => 0) };
  }

  function remuxFlat(tracks, { start, end }, edit) {
    const mvhd = tracks[0].mvhd;
    const movieTs = rd32(mvhd, 8 + 4 + (mvhd[8] ? 16 : 8));
    const segDur = Math.round((end - start) * movieTs);
    const lead = [];

    for (const t of tracks) {
      const ts = t.timescale;
      const all = [];
      for (const f of t.frags) for (const s of fragSamples(f, t.trexDef)) all.push(s);
      // From the last keyframe at/before the clip start to the last sample shown before its end.
      let first = 0;
      let last = -1;
      for (let i = 0; i < all.length; i++) {
        const pts = (all[i].dts + all[i].cto - t.mediaStart) / ts;
        if (all[i].sync && pts <= start + 1e-6) first = i;
        if (pts < end) last = i;
      }
      if (last < first) throw new Error('The selected clip is outside the video');
      t.samples = all.slice(first, last + 1);
      t.shift = t.samples[0].dts;
      t.editStart = Math.max(0, Math.round(start * ts) + t.mediaStart - t.shift);
      lead.push(t.editStart / ts);
    }

    // ~1 s chunks per track, interleaved by time.
    const chunks = [];
    tracks.forEach((t, k) => {
      let cur = null;
      for (const s of t.samples) {
        if (!cur || s.dts - cur.t0 >= t.timescale) {
          cur = { k, t0: s.dts, at: (s.dts - t.shift) / t.timescale, samples: [], size: 0 };
          chunks.push(cur);
        }
        cur.samples.push(s);
        cur.size += s.size;
      }
    });
    chunks.sort((a, b) => a.at - b.at || a.k - b.k);
    let payload = 0;
    for (const c of chunks) { c.off = payload; payload += c.size; }
    const wide = payload > 0xffffffff - (1 << 20);

    const trakBuilders = tracks.map((t, k) => {
      const S = t.samples;
      const own = chunks.filter((c) => c.k === k);
      const tables = [];
      const stts = rle(S.map((s) => s.dur));
      tables.push(fullBox('stts', 0, 0, table([stts.length / 2]), table(stts)));
      if (S.some((s) => s.cto)) {
        const ctts = rle(S.map((s) => s.cto));
        tables.push(fullBox('ctts', S.some((s) => s.cto < 0) ? 1 : 0, 0, table([ctts.length / 2]), table(ctts)));
      }
      if (S.some((s) => !s.sync)) {
        const sync = [];
        S.forEach((s, i) => { if (s.sync) sync.push(i + 1); });
        tables.push(fullBox('stss', 0, 0, table([sync.length]), table(sync)));
      }
      const stsc = [];
      own.forEach((c, i) => { if (!i || c.samples.length !== own[i - 1].samples.length) stsc.push(i + 1, c.samples.length, 1); });
      tables.push(fullBox('stsc', 0, 0, table([stsc.length / 3]), table(stsc)));
      tables.push(fullBox('stsz', 0, 0, table([0, S.length]), table(S.map((s) => s.size))));

      const mediaDur = S.reduce((n, s) => n + s.dur, 0);
      t.mediaDur = mediaDur;
      const mdhd = t.mdhd.slice();
      setDur(mdhd, 24, 32, mediaDur);
      const tkhd = t.tkhd.slice();
      setDur(tkhd, 28, 36, edit ? segDur : mediaDur / t.timescale * movieTs);
      const edts = edit ? elstBox(t.editStart, segDur) : null;

      return (base) => {
        let stco;
        if (wide) {
          const b = new Uint8Array(4 + own.length * 8);
          u32(b, 0, own.length);
          own.forEach((c, i) => dvOf(b).setBigUint64(4 + i * 8, BigInt(base + c.off)));
          stco = fullBox('co64', 0, 0, b);
        } else {
          stco = fullBox('stco', 0, 0, table([own.length]), table(own.map((c) => base + c.off)));
        }
        const stbl = mkBox('stbl', t.stsd, ...tables, stco);
        const mdia = mkBox('mdia', mdhd, ...t.mdiaOther, mkBox('minf', ...t.minfOther, stbl));
        return mkBox('trak', tkhd, ...(edts ? [edts] : []), mdia);
      };
    });

    const mv = mvhd.slice();
    setDur(mv, 24, 32, edit ? segDur : Math.max(...tracks.map((t) => t.mediaDur / t.timescale * movieTs)));
    u32(mv, mv.length - 4, tracks.length + 1);
    const moovAt = (base) => mkBox('moov', mv, ...trakBuilders.map((b) => b(base)));

    const audioOnly = tracks.every((t) => t.isAudio);
    const enc = new TextEncoder();
    const ftyp = mkBox('ftyp', enc.encode(audioOnly ? 'M4A ' : 'isom'), table([512]), enc.encode(audioOnly ? 'M4A isomiso2mp41' : 'isomiso2avc1mp41'));
    const mdatHdr = new Uint8Array(wide ? 16 : 8);
    if (wide) { u32(mdatHdr, 0, 1); dvOf(mdatHdr).setBigUint64(8, BigInt(payload + 16)); } else u32(mdatHdr, 0, payload + 8);
    mdatHdr.set(enc.encode('mdat'), 4);
    const base = ftyp.length + moovAt(0).length + mdatHdr.length;
    const parts = [ftyp, moovAt(base), mdatHdr];
    for (const c of chunks) for (const s of c.samples) parts.push(s.data);
    return { parts, lead };
  }

  // ---------- audio: decode, WAV, MP3 ----------
  function decodeAudio(u8) {
    // decodeAudioData resamples to the context rate, so output is always 44.1 kHz.
    const ctx = new OfflineAudioContext(2, 1, 44100);
    return ctx.decodeAudioData(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength));
  }

  function toWav(channels, rate) {
    const ch = channels.length;
    const n = channels[0].length;
    const out = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const str = (o, s) => [...s].forEach((c, k) => out.setUint8(o + k, c.charCodeAt(0)));
    str(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true); out.setUint32(24, rate, true);
    out.setUint32(28, rate * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true);
    str(36, 'data'); out.setUint32(40, n * ch * 2, true);
    let o = 44;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++, o += 2) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      out.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([out.buffer], { type: 'audio/wav' });
  }

  // lamejs, LGPL-3.0: github.com/zhuker/lamejs
  function id3Tag({ title, artist, cover }) {
    const frame = (id, body) => {
      const f = new Uint8Array(10 + body.length);
      for (let i = 0; i < 4; i++) f[i] = id.charCodeAt(i);
      u32(f, 4, body.length); // ID3v2.3 frame sizes are plain 32-bit
      f.set(body, 10);
      return f;
    };
    const utf16 = (s) => { // encoding byte 1 = UTF-16 with BOM
      const b = new Uint8Array(3 + s.length * 2);
      b[0] = 1; b[1] = 0xff; b[2] = 0xfe;
      for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); b[3 + i * 2] = c & 0xff; b[4 + i * 2] = c >> 8; }
      return b;
    };
    const frames = [];
    if (title) frames.push(frame('TIT2', utf16(title)));
    if (artist) frames.push(frame('TPE1', utf16(artist)));
    if (cover) {
      const head = new TextEncoder().encode('\0image/jpeg\0\x03\0'); // latin1 enc, mime, type 3 = front cover, empty description
      const body = new Uint8Array(head.length + cover.length);
      body.set(head);
      body.set(cover, head.length);
      frames.push(frame('APIC', body));
    }
    const size = frames.reduce((n, f) => n + f.length, 0);
    const hdr = new Uint8Array(10);
    hdr.set([0x49, 0x44, 0x33, 3, 0, 0]);
    for (let i = 0; i < 4; i++) hdr[6 + i] = (size >> (7 * (3 - i))) & 0x7f; // syncsafe
    return [hdr, ...frames];
  }

  // Yield without setTimeout so encoding doesn't crawl when the tab is in the background.
  const yieldNow = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });

  async function encodeMp3(channels, sampleRate, kbps, tags, onPct, ctl) {
    const toI16 = (f) => {
      const o = new Int16Array(f.length);
      for (let i = 0; i < f.length; i++) { const s = Math.max(-1, Math.min(1, f[i])); o[i] = s < 0 ? s * 0x8000 : s * 0x7fff; }
      return o;
    };
    const L = toI16(channels[0]);
    const R = channels[1] ? toI16(channels[1]) : null;
    const enc = new lamejs.Mp3Encoder(R ? 2 : 1, sampleRate, kbps);
    const parts = id3Tag(tags);
    const copy = (x) => new Uint8Array(x.buffer.slice(x.byteOffset, x.byteOffset + x.length));
    const BLOCK = 1152;
    for (let i = 0, n = 0; i < L.length; i += BLOCK, n++) {
      const out = R ? enc.encodeBuffer(L.subarray(i, i + BLOCK), R.subarray(i, i + BLOCK)) : enc.encodeBuffer(L.subarray(i, i + BLOCK));
      if (out.length) parts.push(copy(out));
      if (n % 300 === 0) {
        onPct(i / L.length);
        await yieldNow();
        if (ctl) await ctl.ready();
      }
    }
    const tail = enc.flush();
    if (tail.length) parts.push(copy(tail));
    return new Blob(parts, { type: 'audio/mpeg' });
  }

  async function fetchCover(vid) {
    for (const key of ['maxresdefault', 'sddefault', 'hqdefault']) {
      try {
        const r = await gm({ method: 'GET', url: `https://i.ytimg.com/vi/${vid}/${key}.jpg`, responseType: 'arraybuffer' });
        return new Uint8Array(r.response);
      } catch { /* next size */ }
    }
    return null;
  }

  // ---------- subtitles (json3 -> SRT) ----------
  function json3ToSrt(j) {
    const ts = (ms) => {
      const p = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
      return `${p(ms / 3600000)}:${p(ms / 60000 % 60)}:${p(ms / 1000 % 60)},${p(ms % 1000, 3)}`;
    };
    const cues = [];
    for (const e of j.events || []) {
      if (!e.segs) continue;
      const text = e.segs.map((s) => s.utf8 || '').join('').trim();
      if (!text) continue;
      cues.push({ start: e.tStartMs, end: e.tStartMs + (e.dDurationMs || 2000), text });
    }
    for (let i = 0; i < cues.length - 1; i++) cues[i].end = Math.min(cues[i].end, cues[i + 1].start);
    return cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n');
  }

  // ---------- FFmpeg (ffmpeg.wasm) ----------
  // The official single-threaded ffmpeg.wasm core (GPL-2.0-or-later), downloaded once from jsDelivr,
  // checked against pinned SHA-256 hashes and cached in IndexedDB. YouTube's page policy doesn't allow
  // workers, so the worker is started inside a hidden same-origin frame (/robots.txt, a plain text file
  // without that policy). FFmpeg therefore runs off the main thread and playback stays smooth.
  // It only processes media that was already downloaded; it never talks to YouTube.
  const FF = {
    base: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/',
    key: 'ff-0.12.10',
    hash: {
      js: 'b266ab5b952555881dd6310663986994a182acb2b7ff25cf10a25f7a37ac2b21',
      wasm: '9f57947a5bd530d8f00c5b3f2cb2a3492faa7e5d823315342d6a8656d0a6b7b7',
    },
    MERGE_MAX: 250e6, // bigger video merges use the built-in muxer (wasm memory is limited)
  };
  const ffmpeg = { state: 'idle', loading: null, worker: null, frame: null, seq: 0, pending: new Map(), idleTimer: 0 };

  const FF_GLUE = `
let core = null;
let current = 0;
onmessage = async ({ data: m }) => {
  try {
    if (m.type === 'load') {
      core = await createFFmpegCore({ wasmBinary: m.wasm });
      core.setProgress(({ progress }) => postMessage({ type: 'progress', id: current, progress }));
      postMessage({ id: m.id, ok: true });
      return;
    }
    current = m.id;
    const logs = [];
    core.setLogger(({ message }) => { logs.push(message); if (logs.length > 40) logs.shift(); });
    for (const [n, d] of m.files) core.FS.writeFile(n, d);
    core.exec(...m.args);
    const ret = core.ret;
    core.reset();
    const outs = [];
    for (const n of m.outputs) { try { outs.push(core.FS.readFile(n)); } catch (e) { outs.push(null); } }
    for (const [n] of m.files) { try { core.FS.unlink(n); } catch (e) {} }
    for (const n of m.outputs) { try { core.FS.unlink(n); } catch (e) {} }
    postMessage({ id: m.id, ok: true, ret, outs, logs }, outs.filter(Boolean).map((o) => o.buffer));
  } catch (e) {
    postMessage({ id: m.id, ok: false, error: String((e && e.message) || e) });
  }
};
`;

  async function sha256(u8) {
    const d = new Uint8Array(await crypto.subtle.digest('SHA-256', u8));
    return [...d].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function fetchAsset(url, onProgress) {
    if (net.page) {
      try {
        const r = await fetch(url, { credentials: 'omit' });
        if (!r.ok) throw httpError(r.status);
        const total = +r.headers.get('content-length') || 0;
        const reader = r.body.getReader();
        const chunks = [];
        let n = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          n += value.length;
          if (total) onProgress(n / total);
        }
        const out = new Uint8Array(n);
        let o = 0;
        for (const c of chunks) { out.set(c, o); o += c.length; }
        return out;
      } catch (e) {
        if (e.status) throw e; // fall through to the service worker
      }
    }
    const r = await gm({ method: 'GET', url, responseType: 'arraybuffer', timeout: 600000, onprogress: (e) => e.total && onProgress(e.loaded / e.total) });
    return new Uint8Array(r.response);
  }

  async function ffAsset(kind, onProgress) {
    const key = `${FF.key}-${kind}`;
    const cached = await idb.get(key).catch(() => null);
    if (cached && (await sha256(cached)) === FF.hash[kind]) return cached;
    const u8 = await withRetry(() => fetchAsset(`${FF.base}ffmpeg-core.${kind}`, onProgress), null, 3);
    if ((await sha256(u8)) !== FF.hash[kind]) throw new Error('Converter download failed verification');
    idb.set(key, u8).catch(() => {});
    return u8;
  }

  async function ffHostWindow() {
    if (ffmpeg.frame?.isConnected && ffmpeg.frame.contentWindow?.Worker) return ffmpeg.frame.contentWindow;
    const f = document.createElement('iframe');
    f.style.cssText = 'display:none!important';
    f.setAttribute('aria-hidden', 'true');
    f.tabIndex = -1;
    f.src = '/robots.txt';
    document.documentElement.append(f); // outside <body>, which YouTube re-renders
    await new Promise((res) => { f.onload = res; setTimeout(res, 8000); });
    ffmpeg.frame = f;
    return f.contentWindow;
  }

  function ffTerminate() {
    clearTimeout(ffmpeg.idleTimer);
    ffmpeg.worker?.terminate();
    ffmpeg.worker = null;
    if (ffmpeg.state === 'ready') ffmpeg.state = 'idle';
    for (const p of ffmpeg.pending.values()) p.reject(new Error('Converter stopped'));
    ffmpeg.pending.clear();
  }

  function ffCall(msg, transfer = []) {
    const id = ++ffmpeg.seq;
    return new Promise((resolve, reject) => {
      ffmpeg.pending.set(id, { resolve, reject, onProgress: msg.onProgress });
      const { onProgress, ...rest } = msg;
      ffmpeg.worker.postMessage({ ...rest, id }, transfer);
    });
  }

  // Resolves when FFmpeg is ready. Rejects (and remembers it for this tab) if it can't run here;
  // callers then use the built-in processing instead.
  function ffLoad(onProgress = () => {}) {
    if (ffmpeg.state === 'ready' && ffmpeg.worker) return Promise.resolve();
    if (ffmpeg.state === 'failed') return Promise.reject(new UserError('errConvert'));
    return (ffmpeg.loading ||= (async () => {
      try {
        const js = await ffAsset('js', () => {});
        const wasm = await ffAsset('wasm', onProgress);
        const W = await ffHostWindow();
        const url = W.URL.createObjectURL(new W.Blob([new TextDecoder().decode(js), '\n', FF_GLUE], { type: 'text/javascript' }));
        const worker = new W.Worker(url);
        worker.onmessage = ({ data }) => {
          const p = ffmpeg.pending.get(data.id);
          if (!p) return;
          if (data.type === 'progress') { if (data.progress >= 0 && data.progress <= 1) p.onProgress?.(data.progress); return; }
          ffmpeg.pending.delete(data.id);
          if (data.ok) p.resolve(data); else p.reject(new Error(data.error));
        };
        worker.onerror = () => ffTerminate();
        ffmpeg.worker = worker;
        const copy = wasm.slice(); // the worker takes ownership of this copy
        await ffCall({ type: 'load', wasm: copy.buffer }, [copy.buffer]);
        ffmpeg.state = 'ready';
      } catch (e) {
        console.debug('[YSD] FFmpeg is not available here, using built-in processing', e);
        ffTerminate();
        ffmpeg.state = 'failed';
        throw new UserError('errConvert');
      } finally {
        ffmpeg.loading = null;
      }
    })());
  }

  // Runs one FFmpeg command on in-memory files and returns the requested output files.
  async function ffExec(args, files, outputs, onProgress, ctl) {
    await ffLoad();
    clearTimeout(ffmpeg.idleTimer);
    const onCancel = () => ffTerminate(); // the only way to stop a running command
    ctl?.signal.addEventListener('abort', onCancel, { once: true });
    try {
      const res = await ffCall({ type: 'exec', args: ['-hide_banner', '-nostdin', ...args], files, outputs, onProgress });
      if (res.ret !== 0 || res.outs.some((o) => !o || !o.length)) {
        console.debug('[YSD] FFmpeg failed', args, res.logs);
        throw new UserError('errConvert');
      }
      return res.outs;
    } catch (e) {
      if (ctl?.signal.aborted) throw new Canceled();
      throw e;
    } finally {
      ctl?.signal.removeEventListener('abort', onCancel);
      ffmpeg.idleTimer = setTimeout(ffTerminate, 60e3); // free the converter's memory when unused
    }
  }

  const ffTime = (s) => Math.max(0, s).toFixed(3);

  // Combines separately downloaded video and audio into a regular MP4 (moov at the front).
  async function ffMerge(video, audio, onProgress, ctl) {
    const [out] = await ffExec(
      ['-i', 'v.mp4', '-i', 'a.m4a', '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-movflags', '+faststart', 'out.mp4'],
      [['v.mp4', video], ['a.m4a', audio]], ['out.mp4'], onProgress, ctl);
    return new Blob([out], { type: 'video/mp4' });
  }

  // Audio from an already downloaded stream: MP3 (with cover and tags), WAV, or an Opus clip (stream copy).
  async function ffAudio(input, inName, { format, kbps, start, dur, title, artist, cover }, onProgress, ctl) {
    // Re-encodes seek on the input (decoded, so exact). A stream copy has to cut on the output side:
    // seeking the input of a WebM copy starts at the previous cluster, seconds too early.
    const cut = [];
    if (start != null) cut.push('-ss', ffTime(start));
    if (dur != null) cut.push('-t', ffTime(dur));
    const copy = format === 'webm';
    const args = copy ? ['-i', inName, ...cut] : [...cut, '-i', inName];
    const files = [[inName, input]];
    let out;
    if (format === 'mp3') {
      if (cover) { args.push('-i', 'cover.jpg'); files.push(['cover.jpg', cover]); }
      args.push('-map', '0:a:0');
      if (cover) args.push('-map', '1:v:0', '-c:v', 'copy', '-disposition:v:0', 'attached_pic', '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)');
      args.push('-c:a', 'libmp3lame', '-b:a', `${kbps}k`, '-id3v2_version', '3');
      if (title) args.push('-metadata', `title=${title}`);
      if (artist) args.push('-metadata', `artist=${artist}`);
      out = 'out.mp3';
    } else if (format === 'wav') {
      args.push('-map', '0:a:0', '-c:a', 'pcm_s16le');
      out = 'out.wav';
    } else {
      args.push('-map', '0:a:0', '-c:a', 'copy');
      out = 'out.webm';
    }
    args.push(out);
    const [data] = await ffExec(args, files, [out], onProgress, ctl);
    return new Blob([data], { type: { mp3: 'audio/mpeg', wav: 'audio/wav' }[format] || 'audio/webm' });
  }

  // ---------- styles ----------
  // Colors follow YouTube's own theme attribute (html[dark]); YouTube's default theme is the device theme.
  // Styles: content/content.css (added to the page by the manifest).

  // ---------- download folder ----------
  let history = getValue('history', []);
  const saveHistory = () => setValue('history', history);
  function pushHistory(rec) {
    history = [rec, ...history.filter((r) => r.id !== rec.id)].slice(0, 200);
    saveHistory();
  }
  function removeHistory(id) {
    history = history.filter((r) => r.id !== id);
    sessionBlobs.delete(id);
    failedJobs.delete(id);
    saveHistory();
    renderPanel();
  }
  onValueChange('history', (_n, _o, value, remote) => { if (remote) { history = value || []; renderPanel(); } });
  onValueChange('folderRev', (_n, _o, _v, remote) => { if (remote) reloadFolder(); });

  // Folder handles can't go through GM storage (not JSON), so they live in youtube.com's IndexedDB.
  // Also used to cache the FFmpeg core.
  const idb = {
    db: null,
    open() {
      return (this.db ||= new Promise((res, rej) => {
        const r = indexedDB.open('ysd', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      }));
    },
    async get(k) {
      const db = await this.open();
      return new Promise((res, rej) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
    },
    async set(k, v) {
      const db = await this.open();
      return new Promise((res, rej) => {
        const tx = db.transaction('kv', 'readwrite');
        if (v == null) tx.objectStore('kv').delete(k); else tx.objectStore('kv').put(v, k);
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    },
  };

  // The browser's folder picker (on Windows the native "Select folder" dialog) hands out a handle to
  // the chosen directory; files are written straight into it. Chrome refuses the top level of
  // Downloads, Documents and Desktop for websites (its "contains system files" dialog), but any folder
  // inside them works, which is what the folder dialog explains before the picker opens.
  const pickerHost = typeof window.showDirectoryPicker === 'function' ? window : null;
  let dirHandle = null;
  let folderState = 'none'; // none | ok | permission | missing
  const reloadFolder = () => idb.get('dir').then((d) => { dirHandle = d || null; refreshFolderState(); }).catch(() => {});
  reloadFolder();

  async function checkFolder() {
    if (!dirHandle) return 'none';
    let p;
    try { p = await dirHandle.queryPermission({ mode: 'readwrite' }); } catch { return 'missing'; }
    if (p !== 'granted') return 'permission';
    try {
      for await (const _ of dirHandle.keys()) break; // throws if the folder or its drive is gone
      return 'ok';
    } catch (e) {
      return e.name === 'NotAllowedError' || e.name === 'SecurityError' ? 'permission' : 'missing';
    }
  }
  async function refreshFolderState() {
    folderState = await checkFolder();
    renderPanel();
    if (pop.build === folderPop) renderPopover();
  }

  async function folderWritable(d) {
    const name = `.ysd-write-test-${Date.now().toString(36)}.tmp`;
    try {
      if ((await d.queryPermission({ mode: 'readwrite' })) !== 'granted') return false;
      const fh = await d.getFileHandle(name, { create: true });
      const w = await fh.createWritable();
      await w.write(new Uint8Array([0]));
      await w.close();
      return true;
    } catch (e) {
      console.debug('[YSD] folder write test failed', e);
      return false;
    } finally {
      await d.removeEntry(name).catch(() => {});
    }
  }

  // Must be called from a click (the picker needs the user gesture).
  async function chooseFolder() {
    if (!pickerHost) return;
    state.folderMsg = null;
    let d;
    try {
      d = await pickerHost.showDirectoryPicker({ id: 'ysd-downloads', mode: 'readwrite', startIn: 'downloads' });
    } catch (e) {
      if (e.name !== 'AbortError') { state.folderMsg = 'folderPickFailed'; renderPopover(); }
      return;
    }
    if (!(await folderWritable(d))) {
      state.folderMsg = 'folderNotWritable';
      renderPopover();
      return;
    }
    dirHandle = d;
    folderState = 'ok';
    await idb.set('dir', d).catch(() => {});
    setValue('folderRev', Date.now()); // other tabs pick up the same folder
    toast(t('folderSet', { name: d.name }));
    closePopover(true);
    renderPanel();
  }

  async function allowFolder() {
    try { await dirHandle?.requestPermission({ mode: 'readwrite' }); } catch { /* dialog dismissed */ }
    refreshFolderState();
  }

  async function resetFolder() {
    dirHandle = null;
    folderState = 'none';
    state.folderMsg = null;
    await idb.set('dir', null).catch(() => {});
    setValue('folderRev', Date.now());
    toast(t('folderReset'));
    closePopover(true);
    renderPanel();
  }

  // Must be called synchronously inside a click handler: requestPermission needs the user gesture.
  function requestFolderAccess() {
    if (!dirHandle) return Promise.resolve(false);
    const o = { mode: 'readwrite' };
    return dirHandle.queryPermission(o)
      .then((p) => p === 'granted' || dirHandle.requestPermission(o).then((q) => q === 'granted'))
      .catch(() => false);
  }

  async function uniqueName(dir, name) {
    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    for (let i = 0; ; i++) {
      const cand = i ? `${stem} (${i})${ext}` : name;
      try {
        await dir.getFileHandle(cand);
      } catch (e) {
        if (e.name === 'NotFoundError') return cand;
        if (e.name !== 'TypeMismatchError') throw e; // a folder with that name: try the next number
      }
    }
  }

  function browserDownload(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: name, style: 'display:none' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  // Folder writes go through createWritable, which fills a temporary swap file and only replaces the
  // target on close(), so a failed save never leaves a half-written file behind. A missing folder or
  // lost permission falls back to a normal browser download instead of failing the download.
  async function saveOutput(blob, name, folderOk) {
    if (dirHandle && folderOk) {
      let file = null;
      let w = null;
      try {
        file = await uniqueName(dirHandle, name);
        const fh = await dirHandle.getFileHandle(file, { create: true });
        w = await fh.createWritable();
        await w.write(blob);
        await w.close();
        folderState = 'ok';
        return { where: 'folder', folder: dirHandle.name, file };
      } catch (e) {
        console.debug('[YSD] folder save failed, falling back to a browser download', e);
        await w?.abort?.().catch(() => {});
        if (file) await dirHandle.removeEntry(file).catch(() => {});
        folderState = await checkFolder();
        if (folderState === 'ok') folderState = 'missing';
      }
    } else if (dirHandle) {
      folderState = await checkFolder();
    }
    browserDownload(blob, name);
    return { where: 'browser', file: name, fellBack: !!dirHandle };
  }

  // ---------- jobs ----------
  const jobs = new Map(); // queued / running in this tab, in start order
  const sessionBlobs = new Map(); // finished this session, for the play button
  const failedJobs = new Map(); // failed this session; keeps the downloaded bytes so Retry resumes
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const STATUS = {
    queued: ['stQueued', ''],
    downloading: ['stDownloading', 'accent'],
    processing: ['stProcessing', 'accent'],
    paused: ['stPaused', 'amber'],
    completed: ['stCompleted', 'green'],
    failed: ['stFailed', 'red'],
    canceled: ['stCanceled', ''],
  };
  const jobStatus = (j) => (j.paused ? 'paused' : j.status);
  const running = () => [...jobs.values()].filter((j) => j.started);
  const jobKey = (vid, key, o = {}) => [vid, key, o.trim ? `${o.trim.start}-${o.trim.end}` : '', o.subFormat || ''].join('|');

  function runJob(meta, work, folderPerm) {
    const job = { id: uid(), at: Date.now(), status: 'queued', pct: 0, detail: '', ctl: makeCtl(), work, folderPerm, ...meta };
    jobs.set(job.id, job);
    if (settings.autoOpenPanel) openPanel();
    pump();
    renderPanel();
    updateFab();
    return job;
  }

  function pump() {
    for (const j of jobs.values()) {
      if (running().length >= MAX_ACTIVE) break;
      if (!j.started) { j.started = true; execute(j); }
    }
  }

  async function execute(job) {
    setJob(job, { status: 'downloading', detail: 'starting', notice: null }, true);
    let rec;
    try {
      const { blob, name } = await job.work(job);
      await job.ctl.ready();
      setJob(job, { status: 'processing', pct: 100, detail: 'saving', indet: true, notice: null }, true);
      const folderOk = await job.folderPerm;
      const saved = await saveOutput(blob, name, folderOk);
      job.partial = null;
      if (blob.size <= 512e6) sessionBlobs.set(job.id, blob);
      rec = finishJob(job, { status: 'completed', size: blob.size, ...saved });
      markDone();
      if (saved.fellBack) panelNote(t(folderState === 'missing' ? 'folderMissingSaved' : 'folderNoPerm'), { label: t('change'), run: () => openFolderDialog(histBtn) }, 'amber');
    } catch (e) {
      if (e.name === 'Canceled' || job.ctl.signal.aborted) {
        job.partial = null;
        rec = finishJob(job, { status: 'canceled' });
      } else {
        console.debug('[YSD] download failed', e);
        const err = errInfo(e);
        rec = finishJob(job, { status: 'failed', err });
        if (job.partial) {
          failedJobs.set(job.id, job);
          while (failedJobs.size > 3) failedJobs.delete(failedJobs.keys().next().value); // cap memory
        }
        // YouTube refused the links this page can get, but the app on this PC gets its own: offer it.
        const appCan = job.key && ['errBlocked', 'errNoDirect'].includes(err.key) && (DM.state === 'unpaired' || (DM.token && settings.useManager === false));
        markFailed();
        if (appCan) panelNote(t(err.key, err.vars), { label: t('dmUseApp'), run: () => dmTakeOver(rec) });
      }
    }
    pump();
  }

  function finishJob(job, extra) {
    jobs.delete(job.id);
    const rec = { id: job.id, vid: job.vid, title: job.title, author: job.author, format: job.format, quality: job.quality, key: job.key, opts: job.opts, at: job.at, ...extra };
    delete rec.fellBack;
    pushHistory(rec);
    renderPanel();
    updateFab();
    return rec;
  }

  // structural = status changed, so the row's buttons change too
  function setJob(job, patch, structural) {
    Object.assign(job, patch);
    if (!('indet' in patch) && structural) job.indet = false;
    const row = itemRefs.get(job.id);
    if (structural || !row) renderPanel();
    else row(job);
    updateFab();
  }

  function pauseJob(job) {
    if (!job.started || job.paused) return;
    job.ctl.pause();
    setJob(job, { paused: true }, true);
  }
  function resumeJob(job) {
    job.ctl.resume();
    setJob(job, { paused: false }, true);
  }
  function cancelJob(job) {
    if (!job.started) {
      finishJob(job, { status: 'canceled' });
      return;
    }
    job.ctl.cancel();
  }

  function tracker(job, total, initial) {
    let got = initial;
    let lastT = performance.now();
    let lastGot = got;
    let speed = 0;
    return (d) => {
      got += d;
      const now = performance.now();
      if (now - lastT < 300 && got < total) return;
      const dt = (now - lastT) / 1000;
      if (dt > 0 && dt < 5) {
        const inst = (got - lastGot) / dt;
        speed = speed ? speed * 0.75 + inst * 0.25 : inst;
      }
      lastT = now;
      lastGot = got;
      setJob(job, { pct: Math.min(99.9, got / total * 100), got, total, speed, eta: speed > 0 ? (total - got) / speed : Infinity, shaping: sharing() });
    };
  }

  // Text resources on youtube.com (subtitles) via the page, falling back to the manager's requests.
  async function fetchText(url, ctl) {
    if (net.page) {
      try {
        const r = await fetch(url, { credentials: 'omit' });
        if (!r.ok) throw httpError(r.status);
        return await r.text();
      } catch (e) {
        if (e.status) throw e;
      }
    }
    return (await withRetry(() => gm({ method: 'GET', url, anonymous: true }), ctl)).responseText;
  }

  // FFmpeg is set up on first use (one-time download of the converter, shown in the job's progress).
  async function engineReady(job) {
    if (ffmpeg.state === 'failed') return false;
    if (ffmpeg.state === 'ready' && ffmpeg.worker) return true;
    setJob(job, { status: 'processing', detail: 'preparingEngine', pct: 0, indet: false }, true);
    try {
      await ffLoad((p) => setJob(job, { pct: p * 100 }));
      return true;
    } catch {
      return false;
    }
  }

  // Pipeline: plan (what to fetch; nothing if the stream is cached) -> download (resumable ranges) ->
  // process locally (FFmpeg or the built-in muxer) -> save. Audio-only and video downloads share it.
  function optionWork(opt0, info0, { trim = null, subFormat = 'srt' } = {}) {
    let opt = opt0;
    let info = info0;
    return async (job) => {
      const ctl = job.ctl;
      // Links from a page that has been open for a while get renewed first (resumed jobs keep theirs:
      // their sources renew on their own and must stay on the same file).
      if (opt.kind !== 'thumb' && !job.partial && infoStale(info)) {
        setJob(job, { notice: 'refreshingLink' });
        const fresh = await getInfo(info.vid, { force: true });
        const o = findOption(fresh, opt.key);
        if (!o) throw new UserError('errFormatGone');
        info = fresh;
        opt = o;
        if (state.vid === info.vid) state.info = fresh;
        setJob(job, { notice: null });
      }
      const base = safeName(info.title);
      const clipTag = trim ? ` (${fmtClock(trim.start).replace(/:/g, '.')}-${fmtClock(trim.end).replace(/:/g, '.')})` : '';

      if (opt.kind === 'thumb') {
        setJob(job, { detail: 'fetchingImage', indet: true });
        for (const cand of THUMBS.slice(THUMBS.findIndex((x) => x.key === opt.thumb))) {
          try {
            const r = await withRetry(() => gm({ method: 'GET', url: `https://i.ytimg.com/vi/${info.vid}/${cand.key}.jpg`, responseType: 'blob' }), ctl);
            if (cand.key !== opt.thumb) job.quality = cand.res;
            return { blob: r.response, name: `${base}.jpg` };
          } catch (e) {
            if (!e.status) throw e; // network trouble that outlasted the retries; 404 means try the next size
          }
        }
        throw new UserError('errNoThumb');
      }

      if (opt.kind === 'subs') {
        const sf = SUB_FORMATS[subFormat] || SUB_FORMATS.srt;
        setJob(job, { detail: 'fetchingSubs', indet: true });
        const url = `${opt.baseUrl.replace(/&fmt=[^&]*/, '')}&fmt=${subFormat === 'srt' ? 'json3' : subFormat}`;
        const text = await withRetry(() => fetchText(url, ctl), ctl);
        if (!text) throw new UserError('errNoSubs');
        const body = subFormat === 'srt' ? json3ToSrt(JSON.parse(text)) : text;
        return { blob: new Blob([body], { type: sf.type }), name: `${base}.${opt.lang}.${sf.ext}` };
      }

      // Audio/video streams. job.partial keeps the plan and every finished byte range, so pausing,
      // link refreshes and a later Retry all continue where they stopped.
      let fmts = opt.kind === 'video' ? [opt.vf, opt.af].filter(Boolean) : [opt.af];
      let srcInfo = info;
      const notice = (k) => { if (job.notice !== k) setJob(job, { notice: k }); };
      let parts;
      let total = 0;
      for (let round = 0; ; round++) {
        try {
          const p = (job.partial ||= { srcs: fmts.map((f) => makeSource(f, srcInfo)), plans: null, states: null });
          if (!p.plans) {
            if (trim) setJob(job, { detail: 'findingClip', indet: true });
            p.plans = await Promise.all(p.srcs.map((s) => planStream(s, trim, ctl, notice)));
            p.states = p.plans.map((pl) => rangeState(pl.from, pl.to, pl.cached));
          }
          total = p.states.reduce((n, s) => n + s.to - s.from + 1, 0);
          const got0 = p.states.reduce((n, s) => n + s.got, 0);
          setJob(job, { indet: false, detail: '', total, got: got0, pct: got0 / total * 100 });
          const onBytes = tracker(job, total, got0);
          const bodies = await Promise.all(p.srcs.map((s, i) => downloadRange(s, p.states[i], ctl, onBytes, notice)));
          p.plans.forEach((pl, i) => { if (pl.full) cachePut(cacheKey(info.vid, p.srcs[i].fmt), bodies[i]); });
          parts = p.plans.map((pl, i) => (pl.head ? { init: pl.head, frag: bodies[i] } : { init: bodies[i], frag: bodies[i] }));
          break;
        } catch (e) {
          // YouTube re-encoded the stream while it was downloading: start that download over once.
          if (e.name !== 'StreamChanged' || round >= 1) throw e;
          job.partial = null;
          srcInfo = await getInfo(info.vid, { force: true });
          fmts = fmts.map((f) => srcInfo.formats.find((x) => fmtId(x) === fmtId(f)) || f);
        }
      }
      notice(null);
      await ctl.ready();
      const progress = (key) => (pp) => setJob(job, { detail: key, pct: pp * 100 });

      if (opt.kind === 'video') {
        const name = `${base}${clipTag}.mp4`;
        // Full-length merges up to FF.MERGE_MAX go through FFmpeg (regular MP4, index at the front).
        // Clips and larger files use the built-in muxer: frame-exact cuts, no size limit.
        if (!trim && opt.af && total <= FF.MERGE_MAX && (await engineReady(job))) {
          try {
            setJob(job, { status: 'processing', detail: 'merging', pct: 0, indet: false }, true);
            return { blob: await ffMerge(parts[0].frag, parts[1].frag, progress('merging'), ctl), name };
          } catch (e) {
            if (e.name === 'Canceled') throw e;
            console.debug('[YSD] FFmpeg merge failed, using the built-in muxer', e);
          }
        }
        setJob(job, { status: 'processing', pct: 100, detail: trim ? 'cutting' : 'merging', indet: true }, true);
        await yieldNow();
        return { blob: new Blob(remux(parts, info.duration, { trim }).parts, { type: 'video/mp4' }), name };
      }

      if (opt.kind === 'mp3' || opt.kind === 'wav') {
        setJob(job, { status: 'processing', pct: 100, detail: 'decoding', indet: true }, true);
        await yieldNow();
        let src = parts[0].frag;
        let lead = 0;
        if (trim) {
          const r = remux(parts, info.duration, { trim, edit: false });
          src = new Uint8Array(await new Blob(r.parts).arrayBuffer());
          lead = r.lead[0];
        }
        const name = `${base}${clipTag}.${opt.kind}`;
        if (await engineReady(job)) {
          try {
            setJob(job, { status: 'processing', detail: 'converting', pct: 0, indet: false }, true);
            const cover = opt.kind === 'mp3' ? await fetchCover(info.vid) : null;
            const blob = await ffAudio(src, 'in.m4a', {
              format: opt.kind, kbps: opt.kbps, start: trim ? lead : null, dur: trim ? trim.end - trim.start : null,
              title: info.title, artist: info.author, cover,
            }, progress('converting'), ctl);
            return { blob, name };
          } catch (e) {
            if (e.name === 'Canceled') throw e;
            console.debug('[YSD] FFmpeg conversion failed, using built-in conversion', e);
          }
        }
        // Built-in fallback: decode with Web Audio, encode MP3 with lamejs.
        setJob(job, { status: 'processing', pct: 100, detail: 'decoding', indet: true }, true);
        let buf;
        try { buf = await decodeAudio(src); } catch (e) { console.debug('[YSD] decode failed', e); throw new UserError('errDecode'); }
        const from = Math.round(lead * buf.sampleRate);
        const len = trim ? Math.round((trim.end - trim.start) * buf.sampleRate) : buf.length;
        const chans = [];
        for (let c = 0; c < Math.min(2, buf.numberOfChannels); c++) chans.push(buf.getChannelData(c).subarray(from, from + len));
        if (opt.kind === 'wav') return { blob: toWav(chans, buf.sampleRate), name };
        setJob(job, { pct: 0, detail: 'encodingMp3', indet: false });
        const cover = await fetchCover(info.vid);
        const blob = await encodeMp3(chans, buf.sampleRate, opt.kbps, { title: info.title, artist: info.author, cover },
          (pp) => setJob(job, { pct: pp * 100 }), ctl);
        return { blob, name };
      }

      if (trim && opt.ext === 'webm') {
        // Opus clip: stream copy with FFmpeg (every Opus packet can be cut on, so it stays exact).
        if (!(await engineReady(job))) throw new UserError('errConvert');
        setJob(job, { status: 'processing', detail: 'cutting', pct: 0, indet: false }, true);
        const blob = await ffAudio(parts[0].frag, 'in.webm', { format: 'webm', start: trim.start, dur: trim.end - trim.start }, progress('cutting'), ctl);
        return { blob, name: `${base}${clipTag}.webm` };
      }
      if (trim && opt.ext === 'm4a') {
        setJob(job, { status: 'processing', pct: 100, detail: 'cutting', indet: true }, true);
        return { blob: new Blob(remux(parts, info.duration, { trim }).parts, { type: 'audio/mp4' }), name: `${base}${clipTag}.m4a` };
      }
      return { blob: new Blob([parts[0].frag], { type: opt.ext === 'm4a' ? 'audio/mp4' : 'audio/webm' }), name: `${base}.${opt.ext}` };
    };
  }

  // With the Download Manager connected, it does the download; otherwise the browser does.
  function startOption(opt, info, opts = {}, folderPerm) {
    if (hostGone()) { noteExtReloaded(); return null; }
    if (info.viaApp && !dmOn()) { noteNoApp(); return null; }
    const dmOpts = { ...opts, trim: opt.trimmable && opts.trim ? opts.trim : null };
    if (dmOn()) return dmStartOption(opt, info, dmOpts);
    const perm = folderPerm ?? requestFolderAccess(); // needs the click, so before anything that waits
    if (AUTO_CONNECT && !DM.token && settings.useManager !== false) {
      // The app may have started since this page loaded: connect to it, and download in the browser only without it.
      dmHello().then(() => (dmOn() ? dmStartOption(opt, info, dmOpts) : startBrowserOption(opt, info, opts, perm)));
      return { dm: true };
    }
    return startBrowserOption(opt, info, opts, perm);
  }

  function startBrowserOption(opt, info, opts = {}, folderPerm = requestFolderAccess()) {
    const trim = opt.trimmable && opts.trim ? opts.trim : null;
    const o = { ...opts, trim };
    const dedupe = jobKey(info.vid, opt.key, o);
    if ([...jobs.values()].some((j) => j.dedupe === dedupe)) {
      panelNote(t('toastAlready'), null, 'accent');
      return null;
    }
    const format = opt.kind === 'subs' ? (SUB_FORMATS[o.subFormat] || SUB_FORMATS.srt).label : opt.format;
    clearNotice(); // the ring shows the new download from here on
    return runJob({ vid: info.vid, title: info.title, author: info.author, format, quality: opt.quality, key: opt.key, opts: o, dedupe },
      optionWork(opt, info, o), folderPerm);
  }

  async function retry(rec) {
    const perm = requestFolderAccess();
    if ([...jobs.values()].some((j) => j.id === rec.id)) return;
    const old = failedJobs.get(rec.id);
    if (old) {
      // Same job, same downloaded bytes: continue instead of starting over.
      failedJobs.delete(rec.id);
      history = history.filter((r) => r.id !== rec.id);
      saveHistory();
      Object.assign(old, { ctl: makeCtl(), status: 'queued', started: false, paused: false, notice: null, folderPerm: perm, at: Date.now() });
      jobs.set(old.id, old);
      pump();
      renderPanel();
      updateFab();
      return;
    }
    try {
      const info = await getInfo(rec.vid, { force: true });
      const opt = findOption(info, rec.key);
      if (!opt) throw new UserError('errFormatGone');
      if (!startOption(opt, info, rec.opts || {}, perm)) return;
      removeHistory(rec.id);
    } catch (e) {
      failNote(t(errInfo(e).key, errInfo(e).vars));
    }
  }

  const mainVideo = () => {
    if (docPip) return docPip.video; // a Short in our picture-in-picture window
    const p = playerEl();
    return p?.querySelector('video.html5-main-video') || p?.querySelector('video') || null;
  };

  function takeScreenshot() {
    if (hostGone()) return noteExtReloaded();
    const perm = dmOn() ? null : requestFolderAccess();
    const v = mainVideo();
    if (!v || !v.videoWidth) return failNote(t('errNotReady'));
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    const s = Math.floor(v.currentTime);
    const stamp = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(pad2).join('-');
    const info = liteInfo();
    if (dmOn()) {
      dmSaveShot(c, `${safeName(info.title)} ${stamp}.png`, { vid: info.vid, title: info.title, author: info.author, format: 'PNG', quality: `${c.width}x${c.height}` });
      return;
    }
    runJob({ vid: info.vid, title: info.title, author: info.author, format: 'PNG', quality: `${c.width}x${c.height}`, key: null }, async () => {
      const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
      if (!blob) throw new UserError('errFrame');
      return { blob, name: `${safeName(info.title)} ${stamp}.png` };
    }, perm);
  }

  // ---------- Download Manager (local app) ----------
  // With the YT Download Manager app installed and connected, downloads go through it: it retrieves the
  // streams (yt-dlp), processes them on the PC (FFmpeg) and saves them straight into a normal folder, and
  // it keeps going when the tab is closed. This page only sends requests and shows the progress. Without
  // the app everything keeps working inside the browser.
  const DM = {
    port: getValue('dmPort', 17724),
    token: getValue('dmToken', ''),
    state: 'unknown', // unknown | absent | offline | unpaired | ready
    status: getValue('dmStatus', null),
    jobs: getValue('dmJobs', []), // last known list, so the history shows while the app is closed
    rev: 0,
    polling: false,
    synced: false,
    kick: 0,
    launchedAt: 0,
  };
  const DM_BUSY = new Set(['queued', 'downloading', 'processing']);
  const DM_ACTIVE = new Set(['queued', 'downloading', 'processing', 'paused']);
  const dmOn = () => !!DM.token && settings.useManager !== false && !hostGone();

  function dmReq(method, path, body, timeout = 15000) {
    return new Promise((resolve, reject) => bgRequest({
      method, url: `http://127.0.0.1:${DM.port}${path}`, timeout, anonymous: true,
      headers: { 'Content-Type': 'application/json', ...(DM.token ? { 'X-YDM-Token': DM.token } : {}) },
      data: body ? JSON.stringify(body) : undefined,
      onload: (r) => {
        if (!r.status) { reject(Object.assign(new Error('Network error'), { offline: true })); return; }
        let j = null;
        try { j = JSON.parse(r.responseText); } catch { /* not the Download Manager */ }
        if (r.status >= 200 && r.status < 300 && j) resolve(j);
        else reject(Object.assign(new Error(`HTTP ${r.status}`), { status: r.status, dm: j?.error }));
      },
      onerror: () => reject(Object.assign(new Error('Network error'), { offline: true })),
      ontimeout: () => reject(Object.assign(new Error('Timed out'), { offline: true })),
    }));
  }

  // Is the app there, and does it know this browser? Cheap: a refused local connection fails at once.
  async function dmHello() {
    try {
      const r = await dmReq('GET', '/v1/hello', null, 3000);
      if (r.app !== 'ytdm') throw new Error('not the Download Manager');
      if (DM.token && !r.paired) dmForget(); // the app was reset or reinstalled: connect again
      DM.state = r.paired ? 'ready' : 'unpaired';
      if (!DM.token && AUTO_CONNECT && settings.useManager !== false) await dmAutoPair();
      else if (r.pairing && !DM.token) dmPair(); // its setup (or "Connect a browser") is waiting for this page
      return true;
    } catch {
      DM.state = DM.token ? 'offline' : 'absent';
      return false;
    }
  }

  function dmForget() {
    DM.token = '';
    setValue('dmToken', '');
    DM.state = 'unpaired';
    renderPanel();
    updateFab();
  }

  function browserName() {
    const b = navigator.userAgentData?.brands?.map((x) => x.brand).find((x) => !/Not.?A.?Brand|Chromium/i.test(x));
    if (b) return b.replace(/^Google /, '');
    const ua = navigator.userAgent;
    return /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : 'Browser';
  }

  // Asks the app for access; the user confirms in the app's own window.
  let dmPairing = null;
  function dmPair() {
    return (dmPairing ||= (async () => {
      toast(t('dmPairWaiting'));
      try {
        const handler = 'extension';
        const r = await dmReq('POST', '/v1/pair', { client: `${browserName()} (${handler})` }, 130000);
        DM.token = r.token;
        DM.port = r.port || DM.port;
        setValue('dmToken', DM.token);
        setValue('dmPort', DM.port);
        DM.state = 'ready';
        toast(t('dmConnected'));
        dmSync();
        return true;
      } catch (e) {
        if (e.status !== 409) toast(t(e.status === 403 ? 'dmDenied' : 'dmNotInstalled'));
        return false;
      } finally {
        dmPairing = null;
      }
    })());
  }

  // Connects without asking anyone (extension build only; the app refuses this from anything else).
  let dmAuto = null;
  function dmAutoPair() {
    return (dmAuto ||= (async () => {
      try {
        const r = await dmReq('POST', '/v1/pair', { client: `${browserName()} (extension)`, auto: true }, 10000);
        DM.token = r.token;
        DM.port = r.port || DM.port;
        setValue('dmToken', DM.token);
        setValue('dmPort', DM.port);
        DM.state = 'ready';
        dmSync();
        return true;
      } catch {
        return false; // another tab is connecting at the same moment, or the app said no
      } finally {
        dmAuto = null;
      }
    })());
  }

  // Starts the app through its ytdm: link (the browser asks once whether to allow that). It only works
  // right after a click, so callers do this before anything slow.
  function dmLaunch() {
    if (Date.now() - DM.launchedAt < 10000) return false;
    DM.launchedAt = Date.now();
    const a = h('a', { href: 'ytdm://start', style: 'display:none' });
    document.body.append(a);
    a.click();
    a.remove();
    return true;
  }

  // Resolves true once the app answers and knows this browser, starting it if needed. Call from a click.
  async function dmEnsure() {
    if (await dmHello()) return DM.state === 'ready';
    dmLaunch();
    hs.starting = true; // the History button's ring turns meanwhile
    updateFab();
    try {
      for (let i = 0; i < 40; i++) {
        await sleep(500);
        if (await dmHello()) return DM.state === 'ready';
      }
      return false;
    } finally {
      hs.starting = false;
      updateFab();
    }
  }

  const dmErrText = (e) => (!e ? t('errGeneric') : I18N.en[e.key] ? t(e.key, e.vars) : e.text || t('errGeneric'));

  // A manager job as a history panel item.
  function dmItem(j) {
    const offline = DM.state === 'offline' && DM_BUSY.has(j.status);
    return {
      id: `dm:${j.id}`, dmId: j.id, dm: true, vid: j.vid, title: j.title || j.fileName || '', author: j.author,
      format: j.format || '', quality: j.quality || '', key: j.key, opts: j.opts, at: j.at || 0, finishedAt: j.finishedAt,
      status: j.status, paused: j.status === 'paused', started: true,
      pct: j.pct || 0, got: j.got, total: j.total, speed: offline ? 0 : j.speed, eta: j.eta >= 0 ? j.eta : Infinity, indet: !!j.indet,
      detail: j.detail, notice: offline ? 'dmOffline' : j.notice, err: j.err, size: j.size, shaping: !!j.shaping,
      folder: (j.folder || '').split(/[\\/]/).filter(Boolean).pop() || '', file: j.fileName, exists: j.exists,
    };
  }

  // While the video in this tab plays, the tab tells the app how it is doing: every two seconds while the
  // app downloads (five otherwise, so a download started anywhere sees it at once), and right away when
  // the player starts, stops, seeks or runs dry. The app holds its downloads back while the buffer runs
  // short. A paused video is reported once, then nothing is sent.
  const TAB = uid();
  const dmPb = { timer: 0, at: 0, playing: false, busy: false, fails: 0 };
  function dmPlaybackTick() {
    clearTimeout(dmPb.timer);
    dmPb.timer = 0;
    if (!dmOn()) return;
    const p = playbackState();
    if (!p.playing && !dmPb.playing) return;
    dmPb.at = Date.now();
    dmPb.playing = p.playing;
    dmReq('POST', '/v1/playback', { tab: TAB, ...p }, 4000).then((r) => {
      dmPb.busy = !!r.busy;
      dmPb.fails = 0;
    }, () => { dmPb.fails++; });
    if (p.playing) dmPb.timer = setTimeout(dmPlaybackTick, dmPb.fails > 2 ? 30000 : dmPb.busy ? 2000 : 5000);
  }
  function dmPlaybackSoon() {
    if (Date.now() - dmPb.at > 400) dmPlaybackTick();
  }

  function dmApply(r) {
    const prev = new Map(DM.jobs.map((j) => [j.id, j]));
    const folderKey = (st) => `${st?.folder || ''}|${st?.folderState || ''}`;
    const folderBefore = folderKey(DM.status);
    DM.rev = r.rev;
    if (r.status) DM.status = r.status;
    DM.jobs = r.jobs || [];
    const folderChanged = folderKey(DM.status) !== folderBefore;
    let structural = DM.jobs.length !== prev.size || folderChanged;
    if (folderChanged && pop.el && pop.build === settingsMenu) renderPopover();
    for (const j of DM.jobs) {
      const p = prev.get(j.id);
      if (!p || ['status', 'notice', 'detail', 'indet', 'fileName', 'exists'].some((k) => p[k] !== j[k])) structural = true;
      if (!p || p.status === j.status || !DM.synced) continue;
      if (j.status === 'completed') markDone();
      else if (j.status === 'failed') markFailed();
    }
    DM.synced = true;
    if (!dmPb.timer && dmPb.playing) dmPlaybackTick();
    if (DM.status?.sessionWanted && Date.now() - (DM.sessionAt || 0) > 10000) {
      DM.sessionAt = Date.now();
      pushSession();
    }
    if (structural) {
      setValue('dmJobs', DM.jobs.slice(0, 150));
      setValue('dmStatus', DM.status);
      renderPanel();
    } else {
      for (const j of DM.jobs) itemRefs.get(`dm:${j.id}`)?.(dmItem(j));
    }
    updateFab();
  }

  async function dmSync() {
    if (!dmOn()) return;
    try {
      dmApply(await dmReq('GET', '/v1/jobs?since=0&wait=0'));
      DM.state = 'ready';
    } catch (e) {
      if (e.status === 401) dmForget();
      else {
        DM.state = 'offline';
        renderPanel();
      }
      return;
    }
    dmPoll();
  }

  // Long-polls for changes while something is running, the panel is open, or a download was just started.
  const dmWanted = () => panelOpen() || DM.jobs.some((j) => DM_BUSY.has(j.status)) || Date.now() - DM.kick < 60000;
  async function dmPoll() {
    if (DM.polling) return;
    DM.polling = true;
    let misses = 0;
    try {
      while (dmOn() && dmWanted()) {
        try {
          dmApply(await dmReq('GET', `/v1/jobs?since=${DM.rev}&wait=25`, null, 40000));
          DM.state = 'ready';
          misses = 0;
        } catch (e) {
          if (e.status === 401) { dmForget(); break; }
          DM.state = 'offline';
          renderPanel();
          if (++misses > 8) break; // the app was closed; its downloads continue when it starts again
          await sleep(4000);
        }
      }
    } finally {
      DM.polling = false;
    }
  }

  async function dmAct(id, action) {
    if (hostGone()) { noteExtReloaded(); return; }
    DM.kick = Date.now();
    if (!(await dmEnsure())) { noteNoApp(); return; }
    try {
      await dmReq('POST', `/v1/jobs/${id}/${action}`);
    } catch (e) {
      if (e.status !== 409) failNote(dmErrText(e.dm));
    }
    dmSync();
  }

  // Formats of a video only the signed-in user may watch, as the app sees them with this browser's
  // sign-in. Same shape as buildInfo(); downloads of it always go through the app.
  async function dmAuthInfo(vid, anonErr) {
    if (!(await dmHello()) || DM.state !== 'ready') throw anonErr;
    const s = await pushSession();
    if (s.signedIn === false) throw new UserError('errSignIn');
    let r;
    try {
      r = await dmReq('GET', `/v1/info?v=${encodeURIComponent(vid)}&auth=1`, null, 180000); // refused here already
    } catch (e) {
      if (e.dm?.key && I18N.en[e.dm.key]) throw new UserError(e.dm.key, e.dm.vars);
      throw anonErr;
    }
    const mb = (n) => Math.max(0, +n || 0);
    const video = (r.video || []).map((v) => ({
      kind: 'video', key: `v${v.height}`, format: 'MP4', quality: `${v.height}p${v.fps > 30 ? v.fps : ''}`, height: v.height,
      badge: v.height >= 2160 ? '4K' : v.height >= 1440 ? '2K' : v.height >= 720 ? 'HD' : '', codec: v.codec || 'MP4', size: mb(v.size), trimmable: true,
    }));
    const secs = +r.duration || 0;
    const audio = [];
    if (r.aac) {
      for (const k of [320, 192, 128]) {
        audio.push({ kind: 'mp3', key: `mp3-${k}`, format: 'MP3', quality: `${k}kbps`, kbps: k, hintKey: 'hintCover', ext: 'mp3', size: secs * k * 125, approx: true, trimmable: true });
      }
      audio.push({ kind: 'audio', key: 'm4a', format: 'M4A', quality: `${r.aac.kbps}kbps`, kbps: r.aac.kbps, hintKey: 'hintOriginal', ext: 'm4a', size: mb(r.aac.size), trimmable: true });
    }
    if (r.opus) audio.push({ kind: 'audio', key: 'opus', format: 'OPUS', quality: `${r.opus.kbps}kbps`, kbps: r.opus.kbps, hintKey: 'hintOriginal', ext: 'webm', size: mb(r.opus.size), trimmable: true });
    if (r.aac) audio.push({ kind: 'wav', key: 'wav', format: 'WAV', quality: '44.1 kHz', hintKey: 'hintLossless', ext: 'wav', size: Math.round(secs * 44100 * 4), approx: true, trimmable: true });
    const subs = (r.subs || []).map((x) => ({
      kind: 'subs', key: `sub-${x.lang}-${x.auto ? 'a' : 'm'}`, format: 'SRT', quality: x.lang, label: x.name || x.lang, auto: !!x.auto, lang: x.lang, baseUrl: '',
    }));
    return {
      vid, client: CLIENTS[0], variant: 0, formats: [], at: Date.now(), expires: Infinity, viaApp: true, auth: !!r.auth,
      title: r.title || pageTitle(), author: r.author || '', duration: secs, video, audio, subs,
    };
  }

  function dmStartOption(opt, info, o) {
    DM.kick = Date.now();
    const format = opt.kind === 'subs' ? (SUB_FORMATS[o.subFormat] || SUB_FORMATS.srt).label : opt.format;
    const body = {
      vid: info.vid, title: info.title, author: info.author, kind: opt.kind, key: opt.key, format, quality: opt.quality,
      opts: {
        height: opt.height, kbps: opt.kbps, ext: opt.ext, thumb: opt.thumb, lang: opt.lang, auto: opt.auto,
        subFormat: opt.kind === 'subs' ? o.subFormat || 'srt' : undefined, trim: o.trim || undefined,
        auth: info.auth || undefined,
      },
    };
    const send = async (force) => {
      if (!(await dmEnsure())) {
        // The app couldn't be reached: offer the in-browser download instead of failing.
        noteNoApp({ label: t('dmBrowserInstead'), run: () => startBrowserOption(opt, info, o) });
        return;
      }
      try {
        const r = await dmReq('POST', '/v1/jobs', { ...body, force });
        if (r.duplicate === 'active') panelNote(t('toastAlready'), null, 'accent');
        else if (r.duplicate === 'done') {
          markDone();
          panelNote(t('dmAlreadyDone'), { label: t('downloadAgain'), run: () => send(true) }, 'green');
        } else {
          clearNotice();
          if (settings.autoOpenPanel) openPanel();
        }
      } catch (e) {
        failNote(dmErrText(e.dm));
      }
      dmSync();
    };
    send(false);
    return { dm: true };
  }

  function blobToBase64(blob) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(',')[1] || '');
      r.onerror = () => rej(r.error);
      r.readAsDataURL(blob);
    });
  }

  // Screenshots are made in the page and saved by the app into the same folder as everything else.
  async function dmSaveShot(canvas, name, meta) {
    DM.kick = Date.now();
    const ok = await dmEnsure();
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) { failNote(t('errFrame')); return; }
    if (!ok) {
      browserDownload(blob, name);
      markDone();
      panelNote(t('dmUnavailable'), null, 'amber');
      return;
    }
    try {
      await dmReq('POST', '/v1/files', { name, data: await blobToBase64(blob), ...meta }, 60000);
      if (settings.autoOpenPanel) openPanel();
    } catch (e) {
      failNote(dmErrText(e.dm));
    }
    dmSync();
  }

  // The app's own Windows folder picker opens on the PC (in front of the browser).
  async function dmChooseFolder() {
    DM.kick = Date.now();
    if (!(await dmEnsure())) { toast(t('dmUnavailable')); return; }
    toast(t('dmFolderPicker'));
    try {
      const r = await dmReq('POST', '/v1/folder/choose', null, 600000);
      if (r.status) {
        DM.status = r.status;
        setValue('dmStatus', DM.status);
      }
      if (!r.canceled) toast(t('folderSet', { name: DM.status?.folderName || '' }));
    } catch (e) {
      toast(dmErrText(e.dm));
    }
    renderPanel();
  }

  async function dmOpenFolder() {
    if (!(await dmEnsure())) { toast(t('dmUnavailable')); return; }
    dmReq('POST', '/v1/folder/open').catch(() => {});
  }

  // Hands a download the browser couldn't get over to the app, connecting this browser first if needed.
  async function dmTakeOver(rec) {
    if (settings.useManager === false) {
      settings.useManager = true;
      saveSettings();
    }
    if (!DM.token && !(await dmPair())) return;
    failedJobs.delete(rec.id); // start it in the app, not from the browser's partial download
    retry(rec);
  }

  // Settings entry when not connected yet: start the app if it's installed, then ask it for access.
  async function dmConnect() {
    let up = await dmHello();
    if (!up) {
      if (dmLaunch()) toast(t('dmStarting'));
      for (let i = 0; i < 24 && !up; i++) {
        await sleep(500);
        up = await dmHello();
      }
    }
    if (!up) toast(t('dmNotInstalled'));
    else if (DM.state === 'unpaired') dmPair();
    else dmSync();
  }
  const dmHint = () => (!DM.token ? t('dmConnect') : DM.state === 'ready' ? t('dmConnectedHint') : t('dmNotRunning'));

  // ---------- play saved files ----------
  const canPlay = (rec) => rec.status === 'completed' && (sessionBlobs.has(rec.id) || (rec.where === 'folder' && dirHandle?.name === rec.folder && folderState !== 'missing'));

  async function play(rec) {
    try {
      let blob = sessionBlobs.get(rec.id);
      if (!blob) {
        if (!(await requestFolderAccess())) throw new UserError('errFolder');
        blob = await (await dirHandle.getFileHandle(rec.file)).getFile();
      }
      openViewer(blob, rec);
    } catch (e) {
      toast(e.name === 'NotFoundError' ? t('errMoved') : t(errInfo(e).key, errInfo(e).vars));
    }
  }

  function openViewer(blob, rec) {
    const url = URL.createObjectURL(blob);
    let media;
    if (rec.format === 'MP4') media = h('video', { src: url, controls: true, autoplay: true });
    else if (['MP3', 'M4A', 'OPUS', 'WAV'].includes(rec.format)) media = h('audio', { src: url, controls: true, autoplay: true });
    else if (['JPG', 'PNG'].includes(rec.format)) media = h('img', { src: url, alt: rec.title });
    else { media = h('pre'); blob.text().then((x) => { media.textContent = x; }); }
    mainVideo()?.pause();
    const close = () => {
      document.removeEventListener('keydown', onKey, true);
      leave(ov, () => {
        ov.remove();
        URL.revokeObjectURL(url);
      });
    };
    const onKey = (e) => {
      e.stopPropagation(); // keep YouTube's shortcuts (space, k, f...) away from the page while the viewer is open
      if (e.key === 'Escape') close();
    };
    const ov = h('div', { class: 'ysd-viewer ysd-ui', role: 'dialog', onclick: (e) => { if (e.target === ov) close(); } },
      h('div', { class: 'ysd-vbox' },
        h('div', { class: 'ysd-vhead' }, h('span', {}, rec.file || rec.title), iconBtn('close', t('close'), close)),
        media));
    document.body.append(ov);
    document.addEventListener('keydown', onKey, true);
  }

  // ---------- toast + tooltips ----------
  let toastEl = null;
  let toastTimer = 0;
  function toast(msg, action) {
    toastEl ||= h('div', { class: 'ysd-toast ysd-ui', role: 'status', 'aria-live': 'polite' });
    toastEl.replaceChildren(h('span', { class: 'ysd-toast-msg' }, msg));
    if (action) toastEl.append(h('button', { onclick: () => { toastEl.classList.remove('show'); action.run(); } }, action.label));
    if (!toastEl.isConnected) document.body.append(toastEl);
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), action ? 6000 : 4000);
  }

  // One custom tooltip for every element of ours with data-tip (instead of the browser's title popups).
  let tipEl = null;
  let tipTarget = null;
  let tipTimer = 0;
  let tipHiddenAt = 0;
  function showTip(el) {
    if (!el.isConnected || !el.dataset.tip || el.classList.contains('ysd-open') || isFullscreen()) return;
    tipEl ||= h('div', { class: 'ysd-tip', role: 'tooltip' });
    tipEl.textContent = el.dataset.tip;
    if (!tipEl.isConnected) document.body.append(tipEl);
    const r = el.getBoundingClientRect();
    const tr = tipEl.getBoundingClientRect();
    const left = clamp(r.left + r.width / 2 - tr.width / 2, 8, innerWidth - tr.width - 8);
    const top = r.bottom + 8 + tr.height > innerHeight - 4 ? r.top - tr.height - 8 : r.bottom + 8;
    tipEl.style.left = `${left}px`;
    tipEl.style.top = `${top}px`;
    tipEl.classList.add('show');
  }
  function hideTip() {
    clearTimeout(tipTimer);
    if (tipEl?.classList.contains('show')) tipHiddenAt = Date.now();
    tipEl?.classList.remove('show');
    tipTarget = null;
  }
  document.addEventListener('pointerover', (e) => {
    const el = e.target instanceof Element ? e.target.closest('[data-tip]') : null;
    if (el === tipTarget) return;
    hideTip();
    if (!el || e.pointerType === 'touch' || !el.closest('.ysd-ui')) return;
    tipTarget = el;
    tipTimer = setTimeout(() => showTip(el), Date.now() - tipHiddenAt < 600 ? 40 : 400); // quick when moving along the toolbar
  }, true);
  document.addEventListener('pointerout', (e) => { if (tipTarget && !tipTarget.contains(e.relatedTarget)) hideTip(); }, true);
  document.addEventListener('pointerdown', hideTip, true);
  document.addEventListener('focusin', (e) => {
    const el = e.target instanceof Element ? e.target.closest('[data-tip]') : null;
    if (el && el.closest('.ysd-ui') && el.matches(':focus-visible')) { tipTarget = el; showTip(el); }
  }, true);
  document.addEventListener('focusout', hideTip, true);

  const iconBtn = (name, label, onclick, cls = '', size = 20) =>
    h('button', { class: `ysd-ibtn ${cls}`, 'aria-label': label, 'data-tip': label, onclick: (e) => { e.stopPropagation(); onclick(e); } }, icon(name, size));

  // ---------- popovers (pickers + menus) ----------
  const pop = { el: null, anchor: null, build: null, dropdown: null, page: 'main', animTimer: 0 };

  // Lets something of ours fade out before it goes (with reduced motion: at once). It takes no clicks
  // meanwhile, so whatever is under it can be clicked right away.
  function leave(el, done) {
    el.classList.add('ysd-leave');
    return setTimeout(() => {
      el.classList.remove('ysd-leave');
      done();
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 140);
  }

  // Opening a second picker while one is open switches it in place, so moving between sections animates.
  function openPopover(anchor, build, cls = '', { swap = false } = {}) {
    if (pop.el && pop.anchor === anchor && pop.build === build && !swap) return closePopover(true);
    hideTip();
    const cn = `ysd-pop ysd-ui ${cls}`;
    if (pop.el) {
      closeDropdown();
      pop.anchor?.classList.remove('ysd-open');
      Object.assign(pop, { anchor, build, page: 'main' });
      pop.el.className = `${cn} ysd-moving`;
      anchor.classList.add('ysd-open');
      renderPopover('swap');
      setTimeout(() => pop.el?.classList.remove('ysd-moving'), 220);
      return;
    }
    Object.assign(pop, { anchor, build, page: 'main' });
    pop.el = h('div', {
      class: cn, role: 'dialog',
      onkeydown: (e) => {
        e.stopPropagation(); // typing in our fields must not trigger YouTube shortcuts
        if (e.key === 'Escape') { if (pop.dropdown) closeDropdown(); else closePopover(true); }
      },
    });
    document.body.append(pop.el);
    anchor.classList.add('ysd-open');
    renderPopover();
  }

  function renderPopover(anim) {
    if (!pop.el) return;
    closeDropdown();
    const scroll = anim ? 0 : pop.el.scrollTop;
    pop.el.replaceChildren(...pop.build().filter(Boolean));
    pop.el.scrollTop = scroll;
    if (anim) {
      pop.el.classList.remove('ysd-anim-swap', 'ysd-anim-fwd', 'ysd-anim-back');
      void pop.el.offsetWidth; // restart the animation
      pop.el.classList.add(`ysd-anim-${anim}`);
      clearTimeout(pop.animTimer);
      pop.animTimer = setTimeout(() => pop.el?.classList.remove(`ysd-anim-${anim}`), 220);
    }
    placePopover();
  }

  function goPage(page, dir = 'fwd') {
    pop.page = page;
    renderPopover(dir);
  }

  function placePopover() {
    if (!pop.el || !pop.anchor) return;
    // From the Shorts column: beside the button, on the side with room (over the Short otherwise).
    if (pop.anchor.closest('#ysd-shorts')) {
      const r = pop.anchor.getBoundingClientRect();
      pop.el.style.maxHeight = `${innerHeight - 16}px`;
      pop.el.style.width = '';
      let m = pop.el.getBoundingClientRect();
      const roomRight = innerWidth - r.right - 20;
      const roomLeft = r.left - 20;
      const right = roomRight >= m.width || roomRight >= roomLeft;
      const room = right ? roomRight : roomLeft;
      if (room < m.width && room >= 260) { // narrower rather than over the button
        pop.el.style.width = `${room}px`;
        m = pop.el.getBoundingClientRect();
      }
      const left = right ? r.right + 12 : r.left - m.width - 12;
      pop.el.style.left = `${clamp(left, 8, Math.max(8, innerWidth - m.width - 8))}px`;
      pop.el.style.top = `${clamp(r.top, 8, Math.max(8, innerHeight - m.height - 8))}px`;
      return;
    }
    const r = pop.anchor.getBoundingClientRect();
    const below = innerHeight - r.bottom - 12;
    const above = r.top - 12;
    pop.el.style.maxHeight = 'none';
    const need = pop.el.scrollHeight;
    // below if it fits, else above if it fits, else whichever side has more room
    const flip = need > below && (need <= above || above > below);
    pop.el.style.maxHeight = `${Math.max(160, flip ? above : below)}px`;
    const m = pop.el.getBoundingClientRect();
    let left = r.left;
    if (left + m.width > innerWidth - 8) left = r.right - m.width;
    pop.el.style.left = `${clamp(left, 8, Math.max(8, innerWidth - m.width - 8))}px`;
    pop.el.style.top = `${Math.max(8, flip ? r.top - m.height - 6 : r.bottom + 6)}px`;
  }

  function closePopover(force) {
    if (!pop.el || (!force && state.pinned)) return;
    closeDropdown();
    const el = pop.el; // fades out on its own; a new one can open meanwhile
    leave(el, () => el.remove());
    pop.anchor?.classList.remove('ysd-open');
    Object.assign(pop, { el: null, anchor: null, build: null, page: 'main' });
    state.pinned = false; // a pin keeps this picker open; the next one opens unpinned
  }

  // Custom dropdown so it matches the theme (native <select> popups don't).
  function optionContent(o) {
    return h('span', { class: 'ysd-opt' },
      o.icon ? icon(o.icon, 16) : null,
      h('span', { class: 'ysd-opt-label' }, o.label),
      o.badge ? h('span', { class: 'ysd-badge' }, o.badge) : null,
      o.hint ? h('span', { class: 'ysd-opt-hint' }, o.hint) : null,
      o.right ? h('span', { class: 'ysd-opt-right' }, o.right) : null);
  }

  function selectField(label, options, value, onChange) {
    const cur = options.find((o) => o.value === value) || options[0];
    const btn = h('button', {
      class: 'ysd-select', type: 'button', 'aria-haspopup': 'listbox', 'aria-label': `${label}: ${cur.label}`,
      onclick: (e) => { e.stopPropagation(); openDropdown(btn, options, cur.value, onChange); },
    }, optionContent(cur), icon('expand', 20));
    return h('div', {}, h('div', { class: 'ysd-label' }, label), btn);
  }

  function openDropdown(btn, options, value, onChange) {
    const same = pop.dropdown?.btn === btn;
    closeDropdown();
    if (same) return;
    const list = h('div', {
      class: 'ysd-dd ysd-ui', role: 'listbox',
      onkeydown: (e) => {
        e.stopPropagation();
        if (e.key === 'Escape') { closeDropdown(); btn.focus(); return; }
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const items = [...list.querySelectorAll('.ysd-dd-item:not(:disabled)')];
        const i = items.indexOf(document.activeElement);
        items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
      },
    }, options.map((o) => h('button', {
      class: 'ysd-dd-item', role: 'option', 'aria-selected': String(o.value === value), disabled: o.disabled,
      onclick: (e) => { e.stopPropagation(); closeDropdown(); if (o.value !== value) onChange(o.value); },
    }, optionContent(o), h('span', { class: 'ysd-check' }, o.value === value ? icon('check', 18) : null))));
    document.body.append(list);
    const r = btn.getBoundingClientRect();
    list.style.width = `${Math.min(Math.max(r.width, 220), innerWidth - 16)}px`;
    list.style.left = `${clamp(r.left, 8, innerWidth - list.offsetWidth - 8)}px`;
    const below = innerHeight - r.bottom - 8;
    const above = r.top - 8;
    const flip = below < 200 && above > below;
    list.style.maxHeight = `${Math.min(320, flip ? above : below)}px`;
    const lh = list.getBoundingClientRect().height;
    list.style.top = `${flip ? r.top - lh - 4 : r.bottom + 4}px`;
    pop.dropdown = { btn, list };
    btn.classList.add('ysd-open');
    const selEl = list.querySelector('[aria-selected="true"]') || list.querySelector('.ysd-dd-item');
    selEl?.scrollIntoView({ block: 'nearest' });
    selEl?.focus({ preventScroll: true });
  }

  function closeDropdown() {
    if (!pop.dropdown) return;
    const { list, btn } = pop.dropdown;
    pop.dropdown = null;
    btn.classList.remove('ysd-open');
    leave(list, () => list.remove());
  }

  document.addEventListener('pointerdown', (e) => {
    const tg = e.target;
    const dd = pop.dropdown;
    const inDropdown = dd && (dd.list.contains(tg) || dd.btn.contains(tg));
    if (dd && !inDropdown) closeDropdown();
    // Toolbar buttons that open a popover handle it themselves (they switch the open one in place).
    if (pop.el && !inDropdown && !pop.el.contains(tg) && !pop.anchor?.contains(tg) && !tg.closest?.('[data-pop]')) closePopover(false);
    // The history panel closes on a click anywhere else too (its button toggles it itself; the folder
    // dialog and dropdowns opened from it count as part of it).
    if (panelOpen() && !panelPinned && !panel.contains(tg) && !histBtn?.contains(tg) && !inDropdown && !pop.el?.contains(tg) && !tg.closest?.('.ysd-viewer')) closePanel();
  }, true);

  const liteInfo = () => state.info || { vid: state.vid, title: pageTitle(), author: '' };

  function popHead(iconName, title, pinnable = true) {
    return h('div', { class: 'ysd-pop-head' },
      h('span', { class: 'ysd-pop-title' }, icon(iconName, 18), h('span', {}, title)),
      pinnable ? iconBtn('pin', state.pinned ? t('unpin') : t('pin'),
        () => { state.pinned = !state.pinned; renderPopover(); }, `ysd-xs${state.pinned ? ' ysd-on' : ''}`, 18) : null,
      iconBtn('close', t('close'), () => closePopover(true), 'ysd-xs', 18));
  }
  const popBody = (...kids) => h('div', { class: 'ysd-pop-body' }, ...kids);
  const msgRow = (iconName, text) => h('div', { class: 'ysd-msg' }, iconName ? icon(iconName, 18) : null, h('span', {}, text));

  function infoGate() {
    if (state.err) {
      return [h('div', { class: 'ysd-msg ysd-err' }, icon('error', 18), h('span', {}, t(state.err.key, state.err.vars))),
        h('button', { class: 'ysd-secondary', onclick: () => loadInfo(true) }, icon('refresh', 18), t('tryAgain'))];
    }
    if (!state.info) return [h('div', { class: 'ysd-msg' }, h('span', { class: 'ysd-spin' }), t('loadingFormats'))];
    return null;
  }

  function popFoot(summary, run) {
    const btn = h('button', {
      class: 'ysd-primary',
      onclick: () => {
        const job = run();
        if (!state.pinned || !job) return job && closePopover(true);
        btn.replaceChildren(icon('check', 18), h('span', {}, t('added')));
        btn.disabled = true;
        setTimeout(() => { if (btn.isConnected) { btn.replaceChildren(icon('download', 18), h('span', {}, t('download'))); btn.disabled = false; } }, 1200);
      },
    }, icon('download', 18), h('span', {}, t('download')));
    return h('div', { class: 'ysd-pop-foot' }, h('span', { class: 'ysd-pop-sum' }, summary), btn);
  }

  // Clip shared by the video and audio pickers, per video.
  function getClip(info) {
    if (!state.clip || state.clip.vid !== info.vid) state.clip = { vid: info.vid, start: 0, end: info.duration };
    return state.clip;
  }
  const clipIsFull = (c, dur) => c.start <= 0.05 && c.end >= dur - 0.05;
  const clipTrim = (info) => {
    const c = getClip(info);
    return clipIsFull(c, info.duration) ? null : { start: c.start, end: c.end };
  };
  const estimate = (opt, info) => {
    if (!opt.size) return '';
    const c = getClip(info);
    const ratio = opt.trimmable && info.duration ? (c.end - c.start) / info.duration : 1;
    return `${opt.approx || ratio < 1 ? '~' : ''}${fmtSize(opt.size * ratio)}`;
  };
  const canTrim = (opt) => opt.trimmable && !(opt.needsEngine && ffmpeg.state === 'failed');

  function trimSection(info, enabled, onChange) {
    const dur = info.duration;
    if (!dur) return null;
    const clip = getClip(info);
    const long = dur >= 3600;
    const step = dur >= 120 ? 1 : 0.1;
    const minLen = Math.min(1, dur / 2);
    const seek = (x) => { if (settings.syncTrim) { const v = mainVideo(); if (v) v.currentTime = x; } };

    const fill = h('div', { class: 'ysd-range-fill' });
    const a = h('input', { type: 'range', min: 0, max: dur, step, 'aria-label': t('clipStart') });
    const b = h('input', { type: 'range', min: 0, max: dur, step, 'aria-label': t('clipEnd') });
    const sum = h('span', { class: 'ysd-trim-sum' });
    const reset = h('button', { class: 'ysd-mini', type: 'button' }, t('reset'));
    const startIn = h('input', { type: 'text', inputmode: 'numeric', spellcheck: 'false', 'aria-label': t('start') });
    const endIn = h('input', { type: 'text', inputmode: 'numeric', spellcheck: 'false', 'aria-label': t('end') });

    const paint = () => {
      a.value = clip.start;
      b.value = clip.end;
      fill.style.left = `${clip.start / dur * 100}%`;
      fill.style.right = `${100 - clip.end / dur * 100}%`;
      a.style.zIndex = clip.start > dur - minLen * 2 ? 3 : 1; // keep the start handle grabbable at the far end
      b.style.zIndex = 2;
      if (document.activeElement !== startIn) startIn.value = fmtTime(clip.start, long);
      if (document.activeElement !== endIn) endIn.value = fmtTime(clip.end, long);
      const full = clipIsFull(clip, dur);
      sum.replaceChildren(`${t(full ? 'fullLength' : 'clip')} \u00b7 `, h('b', {}, fmtClock(full ? dur : clip.end - clip.start)));
      reset.hidden = full;
      onChange?.();
    };
    const setStart = (x) => { clip.start = clamp(x, 0, clip.end - minLen); };
    const setEnd = (x) => { clip.end = clamp(x, clip.start + minLen, dur); };

    a.addEventListener('input', () => { setStart(+a.value); paint(); seek(clip.start); });
    b.addEventListener('input', () => { setEnd(+b.value); paint(); seek(clip.end); });
    reset.addEventListener('click', () => { clip.start = 0; clip.end = dur; paint(); });

    const timeField = (label, input, set, which) => {
      const commit = () => {
        const x = parseTime(input.value);
        if (isFinite(x)) { set(x); seek(clip[which]); }
        input.blur();
        paint();
      };
      input.addEventListener('change', commit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); });
      input.addEventListener('blur', paint);
      return h('div', { class: 'ysd-time' }, h('div', { class: 'ysd-label' }, label),
        h('div', { class: 'ysd-time-box' }, input,
          iconBtn('timer', t('setToNow'), () => {
            const v = mainVideo();
            if (v) { set(v.currentTime); paint(); }
          }, 'ysd-xs', 18)));
    };

    const syncBox = h('input', { type: 'checkbox', 'aria-label': t('syncPlayer') });
    syncBox.checked = settings.syncTrim;
    syncBox.addEventListener('change', () => { settings.syncTrim = syncBox.checked; saveSettings(); });

    const root = h('div', { class: `ysd-trim${enabled ? '' : ' ysd-disabled'}` },
      h('div', { class: 'ysd-trim-top' }, h('div', { class: 'ysd-label' }, icon('scissors', 16), t('trim')), sum, reset),
      h('div', { class: 'ysd-range' }, h('div', { class: 'ysd-range-track' }), fill, a, b),
      h('div', { class: 'ysd-range-ends' }, h('span', {}, fmtTime(0, long)), h('span', {}, fmtTime(dur, long))),
      h('div', { class: 'ysd-times' }, timeField(t('start'), startIn, setStart, 'start'), timeField(t('end'), endIn, setEnd, 'end')),
      enabled ? h('label', { class: 'ysd-switch-row' }, h('span', { class: 'ysd-switch' }, syncBox, h('i')), h('span', {}, t('syncPlayer')))
        : h('div', { class: 'ysd-note' }, icon('info', 16), t('trimNotOpus')));
    paint();
    return root;
  }

  const audioLabel = (o) => (o.kind === 'wav' ? `WAV \u00b7 ${t('hintLossless')}` : `${o.format === 'OPUS' ? 'Opus' : o.format} \u00b7 ${fmtKbps(o.kbps)}`);
  const qualityText = (q) => {
    const m = /^(\d+)kbps$/.exec(q || '');
    return m ? fmtKbps(+m[1]) : q || '';
  };

  function videoPop() {
    const head = popHead('video', t('tipVideo'));
    const gate = infoGate();
    if (gate) return [head, popBody(...gate)];
    const info = state.info;
    if (!info.video.length) return [head, popBody(msgRow('info', t('noVideo')))];
    const opt = info.video.find((o) => o.key === settings.videoKey) || info.video.find((o) => o.height <= 1080) || info.video[0];
    const sum = h('span');
    const updateSum = () => sum.replaceChildren(`MP4 \u00b7 ${opt.codec} \u00b7 ${estimate(opt, info)}`);
    const trim = trimSection(info, true, updateSum);
    updateSum();
    return [head, popBody(
      selectField(t('quality'), info.video.map((o) => ({ value: o.key, label: o.quality, badge: o.badge, hint: o.codec, right: fmtSize(o.size) })), opt.key,
        (k) => { settings.videoKey = k; saveSettings(); renderPopover(); }),
      trim,
      popFoot(sum, () => startOption(opt, info, { trim: clipTrim(info) })))];
  }

  function audioPop() {
    const head = popHead('music', t('tipAudio'));
    const gate = infoGate();
    if (gate) return [head, popBody(...gate)];
    const info = state.info;
    if (!info.audio.length) return [head, popBody(msgRow('info', t('noAudio')))];
    const opt = info.audio.find((o) => o.key === settings.audioKey) || info.audio[0];
    const sum = h('span');
    const updateSum = () => sum.replaceChildren(`${opt.format === 'OPUS' ? 'Opus' : opt.format} \u00b7 ${estimate(opt, info)}`);
    const trim = trimSection(info, canTrim(opt), updateSum);
    updateSum();
    return [head, popBody(
      selectField(t('format'), info.audio.map((o) => ({ value: o.key, label: audioLabel(o), hint: o.kind === 'wav' ? '' : t(o.hintKey),
        right: `${o.approx ? '~' : ''}${fmtSize(o.size)}` })), opt.key,
      (k) => { settings.audioKey = k; saveSettings(); renderPopover(); }),
      trim,
      popFoot(sum, () => startOption(opt, info, { trim: canTrim(opt) ? clipTrim(info) : null })))];
  }

  // Which thumbnail sizes exist (maxres/sd are missing on many videos). YouTube serves a
  // 120x90 placeholder for missing ones.
  const thumbAvail = new Map();
  function probeThumbs(vid) {
    if (thumbAvail.has(vid)) return thumbAvail.get(vid);
    const res = {};
    thumbAvail.set(vid, res);
    for (const tb of THUMBS) {
      const img = new Image();
      img.onload = () => { res[tb.key] = img.naturalWidth > 120 && { w: img.naturalWidth, h: img.naturalHeight }; if (pop.build === thumbPop && !pop.dropdown) renderPopover(); };
      img.onerror = () => { res[tb.key] = false; if (pop.build === thumbPop && !pop.dropdown) renderPopover(); };
      img.src = `https://i.ytimg.com/vi/${vid}/${tb.key}.jpg`;
    }
    return res;
  }

  function thumbPop() {
    const info = liteInfo();
    const avail = probeThumbs(info.vid);
    // Shorts have a portrait picture of their own (listed on a Shorts page before the check is back), with
    // a choice remembered apart from the one for other videos.
    const tall = !!avail.oardefault || (onShorts() && avail.oardefault === undefined);
    const list = THUMBS.filter((x) => tall || !x.tall);
    const pref = tall ? 'tallThumbKey' : 'thumbKey';
    let sel = list.find((x) => x.key === settings[pref]) || list[0];
    if (avail[sel.key] === false) sel = list.find((x) => avail[x.key] !== false) || list[list.length - 1];
    const res = (x) => (avail[x.key]?.w ? `${avail[x.key].w}x${avail[x.key].h}` : x.res).replace('x', '\u00d7');
    return [popHead('image', t('tipThumb')), popBody(
      h('img', { class: `ysd-thumb${sel.tall ? ' ysd-tall' : ''}`, alt: t('thumbPreview'), src: `https://i.ytimg.com/vi/${info.vid}/${sel.key}.jpg` }),
      selectField(t('quality'), list.map((x) => ({
        value: x.key, label: t(x.labelKey), hint: avail[x.key] === false ? t('notAvailable') : '', right: res(x), disabled: avail[x.key] === false,
      })), sel.key, (k) => { settings[pref] = k; saveSettings(); renderPopover(); }),
      popFoot(`JPG \u00b7 ${res(sel)}`, () => startOption(thumbOpt(sel, avail[sel.key]), info)))];
  }

  function subsPop() {
    const head = popHead('captions', t('tipSubs'));
    const gate = infoGate();
    if (gate) return [head, popBody(...gate)];
    const info = state.info;
    if (!info.subs.length) return [head, popBody(msgRow('info', t('noSubs')))];
    const opt = info.subs.find((s) => s.key === settings.subsKey) || info.subs.find((s) => !s.auto) || info.subs[0];
    const fmt = SUB_FORMATS[settings.subFmt] ? settings.subFmt : 'srt';
    const seg = h('div', { class: 'ysd-seg', role: 'radiogroup', 'aria-label': t('fileFormat') }, Object.entries(SUB_FORMATS).map(([k, f]) =>
      h('button', { type: 'button', role: 'radio', 'aria-checked': String(k === fmt), class: k === fmt ? 'ysd-sel' : '',
        onclick: () => { settings.subFmt = k; saveSettings(); renderPopover(); } }, f.label)));
    return [head, popBody(
      h('div', {},
        selectField(t('language'), info.subs.map((s) => ({ value: s.key, label: s.label, icon: s.auto ? 'auto' : null, hint: s.lang })), opt.key,
          (k) => { settings.subsKey = k; saveSettings(); renderPopover(); }),
        info.subs.some((s) => s.auto) ? h('div', { class: 'ysd-note', style: 'margin-top:8px' }, icon('auto', 16), t('autoSubsNote')) : null),
      h('div', {}, h('div', { class: 'ysd-label' }, t('fileFormat')), seg),
      popFoot(`${SUB_FORMATS[fmt].label} \u00b7 ${opt.label}`, () => startOption(opt, info, { subFormat: fmt })))];
  }

  // Download folder dialog: explains the browser's rule before the native picker opens.
  function folderPop() {
    const st = folderState;
    const bad = st === 'permission' || st === 'missing';
    // One primary action (full width, first), the others as equal outlined buttons below it.
    const actions = [];
    const act = (iconName, label, onclick) => h('button', { class: actions.length ? 'ysd-secondary' : 'ysd-primary', onclick }, icon(iconName, 18), h('span', {}, label));
    if (st === 'permission') actions.push(act('check', t('folderAllow'), allowFolder));
    if (pickerHost) actions.push(act('folder', t('folderChoose'), chooseFolder));
    if (dirHandle) actions.push(act('download', t('useBrowserFolder'), resetFolder));
    return [popHead('folder', t('folderTitle'), false), popBody(
      h('div', { class: `ysd-folder-cur${bad ? ' ysd-bad' : ''}` },
        h('span', { class: 'ysd-folder-ico' }, icon(bad ? 'warning' : 'folder', 22)),
        h('div', {}, h('div', { class: 'ysd-label' }, t('savingTo')), h('b', {}, dirHandle ? dirHandle.name : t('browserDownloads'))),
        st === 'permission' ? h('span', { class: 'ysd-chip ysd-c-amber' }, t('folderPermission'))
          : st === 'missing' ? h('span', { class: 'ysd-chip ysd-c-red' }, t('folderUnavailable')) : null),
      st === 'missing' ? h('div', { class: 'ysd-msg ysd-err' }, icon('warning', 18), h('span', {}, t('folderMissing', { name: dirHandle?.name || '' }))) : null,
      state.folderMsg ? h('div', { class: 'ysd-msg ysd-err' }, icon('error', 18), h('span', {}, t(state.folderMsg))) : null,
      h('div', { class: 'ysd-note ysd-folder-note' }, icon('info', 16),
        h('div', {}, h('p', {}, t(pickerHost ? 'folderHint' : 'folderNeedsChromium')), dirHandle ? h('p', {}, t('folderRestartNote')) : null)),
      actions.length ? h('div', { class: 'ysd-actions' }, ...actions) : null)];
  }
  function openFolderDialog(anchor) {
    if (dmOn()) { dmChooseFolder(); return; }
    state.folderMsg = null;
    refreshFolderState();
    if (anchor?.isConnected) openPopover(anchor, folderPop, '', { swap: !!pop.el });
  }

  // ---------- menus ----------
  const mHead = (text) => h('div', { class: 'ysd-mhead' }, text);
  const mBack = (text) => h('div', { class: 'ysd-mhead ysd-back' }, iconBtn('back', t('back'), () => goPage('main', 'back'), 'ysd-xs', 20), h('span', {}, text));
  const mSep = () => h('div', { class: 'ysd-msep' });
  const mText = (text) => h('div', { class: 'ysd-mtext' }, text);
  // checked: radio-style check mark; toggle: trailing switch; stay: keep the menu open (page navigation, toggles)
  function mItem({ label, hint, onClick, checked, toggle, iconName, disabled, stay, chevron }) {
    const lead = h('span', { class: 'ysd-mlead' }, checked ? icon('check', 20) : iconName ? icon(iconName, 20) : null);
    return h('button', {
      class: 'ysd-mitem', role: toggle !== undefined ? 'menuitemcheckbox' : checked !== undefined ? 'menuitemradio' : 'menuitem',
      'aria-checked': toggle !== undefined ? String(!!toggle) : checked !== undefined ? String(!!checked) : null, disabled,
      onclick: () => {
        if (!stay) closePopover(true);
        onClick?.();
        if (stay && pop.el && pop.build !== folderPop) renderPopover();
      },
    },
    lead, h('span', { class: 'ysd-mlabel' }, label), hint ? h('span', { class: 'ysd-opt-hint' }, hint) : null,
    toggle !== undefined ? h('span', { class: `ysd-mswitch${toggle ? ' ysd-on' : ''}` }) : null,
    chevron ? icon('chevronRight', 20) : null);
  }

  // Tiny toolbar: the download pickers grouped behind one button.
  function downloadMenu() {
    const anchor = pop.anchor;
    const go = (build) => () => openPopover(anchor, build, '', { swap: true });
    return [
      mItem({ label: t('tipVideo'), iconName: 'video', stay: true, onClick: go(videoPop) }),
      mItem({ label: t('tipAudio'), iconName: 'music', stay: true, onClick: go(audioPop) }),
      mItem({ label: t('tipThumb'), iconName: 'image', stay: true, onClick: go(thumbPop) }),
      mItem({ label: t('tipSubs'), iconName: 'captions', stay: true, onClick: go(subsPop) }),
      mSep(),
      mItem({ label: t('tipShot'), iconName: 'camera', onClick: takeScreenshot }),
      ...(shortsBox?.contains(anchor) && shortsBox.classList.contains('ysd-compact') ? [mSep(), // ⋮ had no room: its menu is here
        mItem({ label: t('settings'), iconName: 'tune', stay: true, chevron: true, onClick: () => openPopover(anchor, settingsMenu, 'ysd-menu', { swap: true }) })] : []),
    ];
  }

  // Compact toolbar: the view tools grouped behind one button.
  function viewMenu() {
    const v = mainVideo();
    return [
      mItem({ label: t('themeDark'), iconName: 'moon', toggle: isDark(), onClick: () => setYtTheme(isDark() ? 'light' : 'dark') }),
      mItem({ label: t('focusMode'), iconName: 'focus', toggle: focusOn, stay: true, onClick: () => setFocus(!focusOn) }),
      document.pictureInPictureEnabled ? mItem({ label: t('pip'), iconName: 'pip', toggle: pipOn(), onClick: togglePip }) : null,
      mItem({ label: t('loop'), iconName: 'repeat', toggle: !!v?.loop, stay: true, onClick: toggleLoop }),
    ];
  }

  function settingsMenu() {
    if (pop.page === 'lang') {
      return [
        mBack(t('language')),
        mItem({ label: t('languageAuto'), hint: LANG_NAMES[detectLang()], checked: settings.lang === 'auto', stay: true, onClick: () => setLanguage('auto') }),
        ...Object.keys(I18N).map((code) => mItem({ label: LANG_NAMES[code], checked: settings.lang === code, stay: true, onClick: () => setLanguage(code) })),
      ];
    }
    if (pop.page === 'help') return [mBack(t('help')), ...helpItems()];
    const pref = ytThemePref();
    const anchor = pop.anchor;
    const shorts = !!anchor?.closest?.('#ysd-shorts');
    const pip = shorts && document.pictureInPictureEnabled;
    return [
      pip ? mItem({ label: t('pip'), iconName: 'pip', toggle: pipOn(), onClick: togglePip }) : null,
      pip ? mSep() : null,
      mHead(t('appearance')),
      mItem({ label: t('themeDevice'), checked: pref === 'device', onClick: () => pref !== 'device' && setYtTheme('device') }),
      mItem({ label: t('themeDark'), checked: pref === 'dark', onClick: () => pref !== 'dark' && setYtTheme('dark') }),
      mItem({ label: t('themeLight'), checked: pref === 'light', onClick: () => pref !== 'light' && setYtTheme('light') }),
      mSep(),
      mHead(t('downloads')),
      mItem({ label: t('dmTitle'), iconName: 'computer', hint: dmHint(), stay: true,
        toggle: DM.token ? settings.useManager !== false : undefined,
        onClick: () => {
          if (!DM.token) { dmConnect(); return; }
          settings.useManager = settings.useManager === false;
          saveSettings();
          renderPanel();
          if (dmOn()) dmSync();
        } }),
      mItem({ label: t('changeFolder'), iconName: 'folder', hint: dmOn() ? DM.status?.folderName || t('dmTitle') : dirHandle ? dirHandle.name : t('browserDefault'),
        stay: !dmOn(), chevron: !dmOn(), onClick: () => (dmOn() ? dmChooseFolder() : openFolderDialog(anchor)) }),
      mItem({ label: t('autoOpenHistory'), iconName: 'history', toggle: settings.autoOpenPanel, stay: true,
        onClick: () => { settings.autoOpenPanel = !settings.autoOpenPanel; saveSettings(); } }),
      mSep(),
      mItem({ label: t('language'), iconName: 'language', hint: LANG_NAMES[LANG], stay: true, chevron: true, onClick: () => goPage('lang') }),
      barMode !== 'full' ? mItem({ label: t('help'), iconName: 'help', stay: true, chevron: true, onClick: () => goPage('help') }) : null,
      shorts ? mItem({ label: t('hideToolbar'), iconName: 'close', onClick: hideBar }) : null,
    ];
  }

  const helpItems = () => [
    mText(t('help1')), mText(t('help2')), mText(t('help3')), mText(t('help4')), mText(t('help5', { cmd: t('menuShowToolbar') })),
    h('div', { class: 'ysd-mtext', style: 'opacity:.7' }, `YT Standalone Downloader ${VERSION}`),
  ];
  const helpMenu = () => [mHead(t('help')), ...helpItems()];

  function setLanguage(code) {
    settings.lang = code;
    saveSettings();
    applyLang();
    const reopen = pop.build === settingsMenu && !!bar?.contains(pop.anchor); // the Shorts buttons stay, and so does their menu
    layoutBar(true);
    labelShorts();
    if (reopen && btns.more) { // the toolbar was rebuilt: keep the language page open on the new button
      openPopover(btns.more, settingsMenu, 'ysd-menu');
      goPage('lang', null);
    }
    renderPanel();
    updateFab();
    if (dockbar) buildDockbar();
    if (state.info) loadInfo(true); // subtitle names come localized from YouTube
  }

  // ---------- YouTube theme ----------
  const isDark = () => document.documentElement.hasAttribute('dark');
  function ytThemePref() {
    const m = /(?:^|;\s*)PREF=([^;]*)/.exec(document.cookie);
    const f6 = parseInt(new URLSearchParams(m ? m[1] : '').get('f6') || '0', 16);
    return f6 & 0x400 ? 'dark' : f6 & 0x80000 ? 'light' : 'device';
  }
  // Same signal YouTube's Appearance menu sends; YouTube then reloads the page itself.
  function setYtTheme(mode) {
    if (jobs.size && !confirm(t('themeConfirm', { n: jobs.size }))) return;
    const sig = { dark: 'on', light: 'off', device: 'device' }[mode];
    page('ytAction', {
      actionName: `yt-signal-action-toggle-dark-theme-${sig}`, optionalAction: false,
      args: [{ signalAction: { signal: `TOGGLE_DARK_THEME_${sig.toUpperCase()}` } }], returnValue: [],
    });
  }
  new MutationObserver(() => updateBarStates()).observe(document.documentElement, { attributes: true, attributeFilter: ['dark'] });

  // ---------- fullscreen ----------
  // While the video is fullscreen, nothing of ours is rendered (CSS on html.ysd-fs) and the docked
  // player layout is suspended, so only YouTube's player and its own controls are visible.
  function isFullscreen() {
    const fe = document.fullscreenElement || document.webkitFullscreenElement;
    if (fe?.closest?.('.ysd-viewer')) return false; // our own preview player going fullscreen
    return !!fe || !!document.querySelector('ytd-watch-flexy[fullscreen]');
  }
  function onFullscreenChange() {
    const fs = isFullscreen();
    if (fs === document.documentElement.classList.contains('ysd-fs')) return;
    document.documentElement.classList.toggle('ysd-fs', fs);
    if (fs) {
      closePopover(true);
      hideTip();
      toastEl?.classList.remove('show');
    }
    updateFocus(true);
  }
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);
  const flexyObserver = new MutationObserver(() => { onFullscreenChange(); updateFocus(true); });

  // ---------- Big Picture / PiP / loop ----------
  // Big Picture keeps the video in view: once the player scrolls out of view (description, comments,
  // related videos) it docks in the bottom-right corner (YouTube's own player container is pinned, its
  // space in the page stays reserved so nothing jumps). Scrolling back up returns it to its place.
  // Going to YouTube's home page (the logo, Home in the menu, or the house button on the docked player)
  // keeps the video playing in YouTube's own mini player; "Back to the video" returns to it, and Big
  // Picture is on again there.
  let focusOn = false;
  let docked = false;
  let dockbar = null;
  let focusRaf = 0;
  let bigPictureVid = null; // the video Big Picture was on for when it went home in the mini player
  let navBypass = false;

  function buildDockbar() {
    dockbar ||= h('div', { id: 'ysd-dockbar', class: 'ysd-ui' });
    dockbar.replaceChildren(
      iconBtn('home', t('goHome'), goHomeKeepPlaying, 'ysd-xs', 18),
      iconBtn('up', t('backToVideo'), () => scrollTo({ top: 0, behavior: 'smooth' }), 'ysd-xs', 18),
      iconBtn('close', t('tipFocusOff'), () => setFocus(false), 'ysd-xs', 18));
    if (!dockbar.isConnected) document.body.append(dockbar);
  }

  // Big Picture and picture-in-picture are never on together: turning one on turns the other off. When
  // picture-in-picture took over from Big Picture, Big Picture comes back when it ends.
  let pipTookOver = false;

  function setFocus(on) {
    if (on && onShorts()) return; // Shorts have a view of their own
    if (on && document.pictureInPictureElement) {
      pipTookOver = false;
      document.exitPictureInPicture().catch(() => {}); // the video comes back into the page (and docks if needed)
    }
    focusOn = on;
    document.documentElement.classList.toggle('ysd-focus', on);
    if (on) {
      buildDockbar();
      addEventListener('scroll', onFocusScroll, { passive: true });
    } else {
      removeEventListener('scroll', onFocusScroll);
    }
    updateFocus(true);
    updateBarStates();
  }

  function onFocusScroll() {
    if (focusRaf) return;
    focusRaf = requestAnimationFrame(() => { focusRaf = 0; updateFocus(); });
  }

  function updateFocus(force) {
    const root = document.documentElement;
    const mast = document.querySelector('#masthead-container')?.getBoundingClientRect().bottom || 56;
    let dock = false;
    if (focusOn && !isFullscreen()) {
      const target = document.querySelector('ytd-watch-flexy[theater] #player-full-bleed-container') || document.querySelector('#player-container-inner');
      if (target) {
        const r = target.getBoundingClientRect();
        const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, mast));
        const ratio = r.height ? visible / r.height : 1;
        // hysteresis so the player doesn't flip back and forth around the threshold
        dock = docked ? ratio < 0.55 : ratio < 0.4 && r.top < mast;
      }
    }
    if (dock !== docked || force) {
      const changed = dock !== docked;
      const pc = changed && !isFullscreen() ? document.querySelector('ytd-watch-flexy #player-container') : null;
      const from = pc?.getBoundingClientRect();
      docked = dock;
      root.classList.toggle('ysd-docked', dock);
      if (changed) {
        dispatchEvent(new Event('resize')); // YouTube's player re-measures at once, so the glide shows the new layout
        requestAnimationFrame(() => dispatchEvent(new Event('resize')));
        if (pc) flipPlayer(pc, from);
      }
    }
  }

  // The player glides from where it was (and how big) to where it is now, instead of jumping: into the
  // corner, back into the page, or out of view when Big Picture is turned off further down the page.
  let playerGlide = null;
  function flipPlayer(el, from) {
    playerGlide?.cancel(); // one still running: the new glide starts where the player is now (in `from`)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const to = el.getBoundingClientRect();
    if (!from?.width || !to.width) return;
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = from.width / to.width;
    const sy = from.height / to.height;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
    // Above the page while it glides (the related videos come later in the page and would cover it),
    // under YouTube's top bar. The docked player's own stacking wins while docked.
    playerGlide = el.animate([
      { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, zIndex: 2019 },
      { transformOrigin: '0 0', transform: 'none', zIndex: 2019 },
    ], { duration: 340, easing: 'cubic-bezier(.2,0,0,1)' });
  }

  // YouTube's mini player: "i" moves the playing video into it (and back); YouTube then shows the
  // previous page, so going home takes one more step.
  const miniActive = () => !!document.querySelector('ytd-app')?.hasAttribute('miniplayer-is-active');
  function toggleMini() {
    for (const type of ['keydown', 'keyup']) {
      document.dispatchEvent(new KeyboardEvent(type, { key: 'i', code: 'KeyI', keyCode: 73, which: 73, bubbles: true, cancelable: true }));
    }
  }
  function openHome() {
    const logo = document.querySelector('ytd-masthead ytd-topbar-logo-renderer a, ytd-masthead a#logo');
    navBypass = true;
    try {
      if (logo) logo.click();
      else location.assign('/');
    } finally {
      navBypass = false;
    }
  }
  async function goHomeKeepPlaying() {
    if (!state.vid) return;
    bigPictureVid = focusOn ? state.vid : null;
    if (focusOn) setFocus(false); // YouTube takes the player out of the page; nothing of ours may pin it
    toggleMini();
    for (let i = 0; i < 30 && !miniActive(); i++) await sleep(100);
    // Without a mini player (YouTube turned it off here), the home page is still where the user asked to go.
    if (location.pathname !== '/') openHome();
  }
  // In Big Picture, YouTube's own ways home (the logo, Home in the menu) keep the video playing too.
  document.addEventListener('click', (e) => {
    if (!focusOn || navBypass || !state.vid || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href]');
    if (!a || !a.closest('ytd-masthead, ytd-guide-renderer, ytd-mini-guide-renderer')) return;
    let url;
    try { url = new URL(a.href, location.href); } catch { return; }
    if (url.origin !== location.origin || url.pathname !== '/') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    goHomeKeepPlaying();
  }, true);

  // While the mini player plays: a button next to it back to the full video. YouTube's mini player can
  // be dragged, resized and snapped, and depending on the version YouTube moves a different part of it,
  // so the button follows where its video and title bar are on screen, every frame while it shows.
  let backBtn = null;
  let backRaf = 0;
  let backAt = '';

  function miniBox(mp) {
    const parts = [mp.querySelector('#player-container, ytd-player') || mp.querySelector('video'),
      mp.querySelector('ytd-miniplayer-info-bar, .ytdMiniplayerInfoBarHost, #info-bar')]
      .filter(Boolean).map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
    if (!parts.length) return mp.getBoundingClientRect();
    const left = Math.min(...parts.map((r) => r.left));
    const top = Math.min(...parts.map((r) => r.top));
    const right = Math.max(...parts.map((r) => r.right));
    const bottom = Math.max(...parts.map((r) => r.bottom));
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }

  // Above it when there's room, else below it (else over its top edge); lined up with its edge on the
  // window's nearer side; inside the window. Returns false when there's no mini player to follow.
  function placeBack() {
    const mp = document.querySelector('ytd-miniplayer');
    const r = miniActive() && mp && !isFullscreen() ? miniBox(mp) : null;
    if (!r || !r.width) {
      if (backBtn) backBtn.hidden = true;
      backAt = '';
      return false;
    }
    const vw = document.documentElement.clientWidth; // without the page's scrollbar
    const key = [r.left, r.top, r.right, r.bottom, vw, innerHeight].join(',');
    if (key === backAt && !backBtn.hidden) return true;
    backAt = key;
    backBtn.hidden = false;
    const bw = backBtn.offsetWidth;
    const bh = backBtn.offsetHeight || 36;
    let top = r.top - bh - 8;
    if (top < 8) top = r.bottom + 8 + bh <= innerHeight - 8 ? r.bottom + 8 : r.top + 8;
    const left = r.left + r.width / 2 < vw / 2 ? r.left : r.right - bw;
    backBtn.style.transform = `translate(${clamp(left, 0, Math.max(0, vw - bw))}px,${clamp(top, 0, Math.max(0, innerHeight - bh))}px)`;
    return true;
  }

  function followMini() {
    backRaf = 0;
    if (placeBack()) backRaf = requestAnimationFrame(followMini);
  }

  function updateBack() {
    if (!miniActive()) {
      placeBack();
      // Closed rather than expanded (still no mini player and no video page a moment later): forget it.
      if (bigPictureVid) {
        setTimeout(() => { if (!miniActive() && !/^\/watch/.test(location.pathname)) bigPictureVid = null; }, 1500);
      }
      return;
    }
    backBtn ||= h('button', { id: 'ysd-back', class: 'ysd-ui', hidden: true, onclick: () => toggleMini() }, icon('up', 18), h('span'));
    if (!backBtn.isConnected) document.body.append(backBtn);
    backBtn.lastChild.textContent = t('backToVideo');
    if (placeBack() && !backRaf) backRaf = requestAnimationFrame(followMini);
  }
  {
    const watch = () => {
      const app = document.querySelector('ytd-app');
      if (!app) { setTimeout(watch, 500); return; }
      const mo = new MutationObserver(updateBack); // on/off at once; the position then every frame
      mo.observe(app, { attributes: true, attributeFilter: ['miniplayer-is-active'] });
      const mp = () => document.querySelector('ytd-miniplayer');
      const hookMini = () => {
        if (mp() && !mp().dataset.ysdObserved) {
          mp().dataset.ysdObserved = '1';
          mo.observe(mp(), { attributes: true, attributeFilter: ['style', 'class'] });
        }
      };
      hookMini();
      new MutationObserver(hookMini).observe(app, { childList: true });
      addEventListener('resize', () => requestAnimationFrame(updateBack), { passive: true });
      updateBack();
    };
    watch();
  }

  async function togglePip() {
    const v = mainVideo();
    try {
      if (docPip) closeDocPip();
      else if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (v && onShorts() && 'documentPictureInPicture' in window) {
        showPipCover();
        await openDocPip(v);
      } else if (v) {
        const hadFocus = focusOn;
        if (hadFocus) {
          setFocus(false); // a docked player glides back into the page meanwhile
          pipTookOver = true;
        }
        v.disablePictureInPicture = false;
        showPipCover(); // before the browser writes its note into the player
        try {
          await v.requestPictureInPicture();
        } catch (e) {
          if (hadFocus) {
            pipTookOver = false;
            setFocus(true);
          }
          throw e;
        }
      }
    } catch (e) {
      console.debug('[YSD] picture-in-picture failed', e);
      pipSoon = 0; // didn't start: the cover goes
      toast(t('errNotReady'));
    }
    updatePipCover();
  }
  // While the video plays in the picture-in-picture window, the browser writes a note into the player
  // (in the browser's language, e.g. "Wird als Bild im Bild abgespielt"). The cover says what happened in
  // the language chosen here and brings the video back. Also when YouTube or the browser started it.
  let pipCover = null;
  let pipSoon = 0; // until then a cover without picture-in-picture (yet) stays: it is being started

  function showPipCover(wait = 1500) {
    const host = playerEl();
    if (!host) return;
    pipSoon = Date.now() + wait;
    if (!pipCover) {
      pipCover = h('div', { id: 'ysd-pipcover', class: 'ysd-ui', role: 'status' });
      // Clicks here are ours: YouTube would take them as play/pause (or fullscreen on a double click).
      for (const type of ['click', 'dblclick', 'mousedown']) pipCover.addEventListener(type, (e) => e.stopPropagation());
      pipCover.append(h('canvas', { class: 'ysd-pip-frame' }), h('div', { class: 'ysd-pip-bg' }), h('div', { class: 'ysd-pip-body' },
        icon('pip', 40), h('b', {}, t('pipActive')), h('span', { class: 'ysd-pip-hint' }, t(docPip ? 'pipHintShorts' : 'pipHint')),
        h('button', { class: 'ysd-primary', 'aria-label': t('pipBack'), onclick: () => (docPip ? closeDocPip() : document.exitPictureInPicture().catch(() => {})) },
          icon('pip', 18), h('span', {}, t('pipBack')))));
      host.append(pipCover);
      mirrorVideo(pipCover, 400); // the video keeps moving under the note while it fades in
    }
    if (pipCover.parentNode !== host) host.append(pipCover);
    pipClearance();
  }

  // A Short whose buttons lie on the video (narrow windows): the note keeps clear of them.
  function pipClearance() {
    const host = pipCover?.parentNode;
    if (!host) return;
    const col = onShorts() ? shortsColumn() : null;
    let right = 0;
    if (col) {
      const p = host.getBoundingClientRect();
      const c = col.getBoundingClientRect();
      if (c.width && c.left < p.right - 1) right = Math.round(p.right - c.left + 12);
    }
    pipCover.style.setProperty('--ysd-pip-right', `${right}px`);
  }

  // Draws the video itself into the cover, every frame for a while: what the browser shows in the player
  // meanwhile (its note, its own fade) stays hidden under it.
  function mirrorVideo(el, ms) {
    const cv = el.querySelector('.ysd-pip-frame');
    const until = performance.now() + ms;
    const draw = () => {
      const v = mainVideo();
      try {
        if (v?.videoWidth) {
          if (cv.width !== v.videoWidth || cv.height !== v.videoHeight) {
            cv.width = v.videoWidth;
            cv.height = v.videoHeight;
          }
          cv.getContext('2d').drawImage(v, 0, 0);
        }
      } catch { /* no frame to draw: black */ }
      if (el.isConnected && performance.now() < until) requestAnimationFrame(draw);
    };
    draw();
  }

  function updatePipCover() {
    const v = mainVideo();
    if (v && (document.pictureInPictureElement === v || docPip)) { showPipCover(0); return; }
    if (!pipCover || Date.now() < pipSoon) return;
    // Back in the page. The browser now fades the video in from black, its note still on top, for about
    // a third of a second: the cover shows the live video itself meanwhile while our note fades out, and
    // goes when the player looks the same without it.
    const el = pipCover;
    pipCover = null;
    mirrorVideo(el, 600);
    el.classList.add('ysd-out');
    setTimeout(() => el.remove(), 550);
  }
  // ---------- Shorts in a picture-in-picture window of our own ----------
  // The browser's picture-in-picture window only shows the video: it can't be scrolled. For Shorts the video
  // moves into a window of ours instead (Document Picture-in-Picture), where scrolling, the arrow keys and its
  // arrows go to the previous or next Short (shortsStep) and a click plays or pauses. YouTube's player keeps
  // running the video meanwhile; it goes back into the page when the window closes or Shorts are left.
  let docPip = null;
  const pipOn = () => !!document.pictureInPictureElement || !!docPip;
  const PIP_CSS = `
    *{box-sizing:border-box}
    html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000;color:#fff;font:14px/20px Roboto,Arial,sans-serif;user-select:none}
    html{--b:clamp(32px,11vmin,52px);--i:clamp(20px,6.5vmin,30px);--g:clamp(12px,3vmin,16px)} /* --g keeps the buttons off the resize edges */
    video{position:fixed!important;inset:0!important;left:0!important;top:0!important;width:100%!important;height:100%!important;
      object-fit:cover;transform:none!important}
    html.fit video{object-fit:contain}
    .ui{position:fixed;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .2s}
    html:hover .ui,.ui:focus-within{opacity:1}
    .ui>*{position:absolute;pointer-events:auto}
    button{display:grid;place-items:center;width:var(--b);height:var(--b);padding:0;border:0;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;
      cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transition:background-color .15s,transform .1s}
    button:hover{background:rgba(56,56,56,.85)}
    button:active{transform:scale(.92)}
    button:focus-visible{outline:2px solid #3ea6ff;outline-offset:2px}
    svg{width:var(--i);height:var(--i);fill:currentColor}
    .top{top:var(--g);left:var(--g)}
    .nav{right:var(--g);top:50%;display:flex;flex-direction:column;gap:var(--g);transform:translateY(-50%)}
    .down svg{transform:rotate(180deg)}
    .bottom{left:0;right:0;bottom:0;display:flex;align-items:center;gap:calc(var(--g) / 2);padding:calc(var(--b) * .8) var(--g) var(--g);
      background:linear-gradient(transparent,rgba(0,0,0,.72))}
    .bottom{pointer-events:none}.bottom button{pointer-events:auto} /* the edges under it still resize the window */
    .bottom button{background:none;-webkit-backdrop-filter:none;backdrop-filter:none}
    .bottom button:hover{background:rgba(255,255,255,.16)}
    .title{flex:1;min-width:0;margin-left:calc(var(--g) / 2);font-size:clamp(12px,3.8vmin,17px);line-height:1.4;font-weight:500;overflow:hidden;
      text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.6)}
    /* Its edges and corners resize it, in the video's shape all the way (startPipResize) */
    .grip{position:fixed;z-index:1}
    .grip.n,.grip.s{left:16px;right:16px;height:10px;cursor:ns-resize}
    .grip.e,.grip.w{top:16px;bottom:16px;width:10px;cursor:ew-resize}
    .grip.n{top:0}.grip.s{bottom:0}.grip.e{right:0}.grip.w{left:0}
    .grip.nw,.grip.ne,.grip.sw,.grip.se{width:18px;height:18px}
    .grip.nw{top:0;left:0;cursor:nwse-resize}.grip.se{bottom:0;right:0;cursor:nwse-resize}
    .grip.ne{top:0;right:0;cursor:nesw-resize}.grip.sw{bottom:0;left:0;cursor:nesw-resize}
    .grip.nw::before,.grip.ne::before,.grip.sw::before,.grip.se::before{content:'';position:absolute;width:9px;height:9px;opacity:0;
      border:2px solid rgba(255,255,255,.8);transition:opacity .2s}
    html:hover .grip::before{opacity:1}
    .grip.nw::before{top:4px;left:4px;border-right:0;border-bottom:0}
    .grip.ne::before{top:4px;right:4px;border-left:0;border-bottom:0}
    .grip.sw::before{bottom:4px;left:4px;border-right:0;border-top:0}
    .grip.se::before{bottom:4px;right:4px;border-left:0;border-top:0}
    @media (max-width:240px){.title{display:none}}
    @media (prefers-reduced-motion:reduce){*{transition:none!important}}
  `;

  async function openDocPip(v) {
    const ratio = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : 9 / 16;
    const area = settings.pipBox?.area || (ratio < 1 ? 360 * 640 : 480 * 270); // last time's size, in this shape
    const k = Math.min(1, (screen.availWidth * 0.8) / Math.sqrt(area * ratio), (screen.availHeight * 0.8) / Math.sqrt(area / ratio));
    const win = await documentPictureInPicture.requestWindow({ width: Math.round(Math.sqrt(area * ratio) * k), height: Math.round(Math.sqrt(area / ratio) * k) });
    const d = win.document;
    d.documentElement.lang = LANG;
    d.documentElement.classList.toggle('fit', !!settings.pipFit);
    d.head.append(h('style', {}, PIP_CSS));
    const btn = (name, label, run, cls) => h('button', { class: cls, title: label, 'aria-label': label,
      onclick: (e) => { e.stopPropagation(); run(); } }, icon(name, 24));
    const ui = {
      play: btn('pause', t('pipPause'), () => pipPlayPause()),
      mute: btn('volume', t('pipMute'), () => { docPip.video.muted = !docPip.video.muted; }),
      fit: btn('fitScreen', t('pipFit'), () => {
        settings.pipFit = !settings.pipFit;
        saveSettings();
        docPip.win.document.documentElement.classList.toggle('fit', settings.pipFit);
        syncDocPip();
      }),
      title: h('div', { class: 'title' }),
    };
    ui.fit.hidden = true; // only where the window can't take the video's shape (see fitDocPip)
    const layer = h('div', { class: 'ui' },
      h('div', { class: 'top' }, btn('pip', t('pipBack'), () => closeDocPip())),
      h('div', { class: 'nav' }, btn('up', t('prevShort'), () => shortsStep(-1)), btn('up', t('nextShort'), () => shortsStep(1), 'down')),
      h('div', { class: 'bottom' }, ui.play, ui.mute, ui.title, ui.fit));
    const grips = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].map((dir) => h('div', { class: `grip ${dir}`, onpointerdown: (e) => startPipResize(e, dir) }));
    const playing = !v.paused;
    docPip = { win, video: v, ui, layer, grips, timer: 0, ratio, area, size: null, bounds: null, fitting: false, canFit: undefined, dragTimer: 0, grip: null };
    d.body.append(v, ...grips, layer); // moving it pauses it: it goes on right away
    if (playing) v.play().catch(() => {});
    pipCover?.querySelector('.ysd-pip-hint')?.replaceChildren(t('pipHintShorts'));
    for (const type of ['play', 'pause', 'volumechange', 'loadedmetadata']) d.addEventListener(type, syncDocPip, true);
    d.addEventListener('loadedmetadata', (e) => { if (e.target === docPip?.video) onPipVideoShape(); }, true);
    d.addEventListener('resize', (e) => { if (e.target === docPip?.video) onPipVideoShape(); }, true);
    for (const type of PLAYER_EVENTS) d.addEventListener(type, onPlayerEvent, true);
    for (const type of ['loadeddata', 'playing', 'timeupdate']) d.addEventListener(type, onShortTime, true);
    d.addEventListener('click', (e) => { if (!e.target.closest('button, .grip')) pipPlayPause(); });
    // Its own timers: the page's slow down while its tab is in the background, this window's don't.
    win.addEventListener('resize', () => {
      const p = docPip;
      if (!p || p.fitting || p.grip) return;
      win.clearTimeout(p.dragTimer);
      p.dragTimer = win.setTimeout(() => fitDocPip('drag'), 150); // Chrome's own border: once its edges stop moving
    });
    win.addEventListener('wheel', onPipWheel, { passive: false });
    win.addEventListener('keydown', onPipKey);
    win.addEventListener('pagehide', () => closeDocPip(), { once: true }); // closed, or "back to tab" in its title bar
    docPip.timer = win.setInterval(watchDocPip, 1000);
    syncDocPip();
    updateBarStates();
    win.setTimeout(() => fitDocPip('open'), 150); // once Chrome has placed it
  }

  // Sizing and placing the picture-in-picture window takes the extension (chrome.windows): true when done,
  // false when the window wasn't found (yet), null where it isn't possible (the userscript can't).
  function pipWindowBounds(match, to, animate) {
    return send({ type: 'pipBounds', match, to, animate }).then((r) => !!r?.ok, () => null);
  }

  // The YT Download Manager app (when it runs) takes over drags on Chrome's own border of the window, so it
  // follows the pointer in the video's shape there as well; it is told the window's shape and limits.
  function pipNative(info) {
    return send({ type: 'pipNative', info }).then((r) => !!r?.ok, () => null);
  }

  // Big enough for its controls (Chrome's smallest is 240 wide inside), within Chrome's limits (80 % of the
  // screen each way, a quarter of its area), in the given shape.
  function pipLimits(nw, nh, w) {
    const sc = w.screen;
    const fw = w.outerWidth - w.innerWidth;
    const fh = w.outerHeight - w.innerHeight;
    const grow = Math.max(1, 240 / Math.min(nw, nh));
    nw *= grow;
    nh *= grow;
    const k = Math.min(1, (sc.availWidth * 0.8 - fw) / nw, (sc.availHeight * 0.8 - fh) / nh,
      Math.sqrt((sc.width * sc.height * 0.25) / ((nw + fw) * (nh + fh))) * 0.995);
    return [Math.round(nw * k), Math.round(nh * k)];
  }

  // The window in the video's shape, edge to edge. Chrome gives Document Picture-in-Picture windows no fixed
  // shape and lets a page resize its own one only right after a click in it, once per click, so the
  // extension sizes it: when it opens (last time's size and place), after Chrome's own border was dragged
  // (once its edges stop moving: the size dragged to stays, the other side follows, the edges not dragged
  // stay put) and for a video of another shape (same area, at the corner it is nearest to). Its own edges
  // and corners resize it in that shape all the way (startPipResize). It stays on its screen. Sizes are the
  // window's own CSS pixels, which Chrome keeps the same at every display scaling and page zoom.
  async function fitDocPip(why) {
    const p = docPip;
    const v = p?.video;
    if (!p || !v?.videoWidth || p.fitting || p.grip || p.canFit === false || p.win.closed) return;
    const w = p.win;
    const sc = w.screen;
    const r = v.videoWidth / v.videoHeight;
    const iw = w.innerWidth;
    const ih = w.innerHeight;
    const fw = w.outerWidth - iw; // Chrome's frame and title bar
    const fh = w.outerHeight - ih;
    let nw;
    if (why === 'drag' && Math.abs(iw / r - ih) <= 1.5) { noteDocPipBox(); return; } // in shape already (the app sized it)
    if (why === 'drag') {
      const last = p.size || { w: iw, h: ih };
      nw = Math.abs(iw - last.w) / last.w >= Math.abs(ih - last.h) / last.h ? iw : ih * r;
    } else if (why === 'clamp') { // Chrome held one side at its limit: the other one follows that
      nw = iw / ih > r ? iw : ih * r;
    } else {
      nw = Math.sqrt((why === 'open' ? settings.pipBox?.area || p.area : iw * ih) * r);
    }
    let nh;
    [nw, nh] = pipLimits(nw, nw / r, w);
    const ow = nw + fw;
    const oh = nh + fh;
    let box = docPipCorner(w);
    if (why === 'drag' && p.bounds) { // the edges not dragged stay where they are (a left or top edge dragged: the right or bottom one)
      const b = p.bounds;
      const x = w.screenX;
      const y = w.screenY;
      const right = Math.abs(x - b.x) > 1 && Math.abs(x + w.outerWidth - b.r) <= 1;
      const bottom = Math.abs(y - b.y) > 1 && Math.abs(y + w.outerHeight - b.b) <= 1;
      box = { right, bottom, x: right ? x + w.outerWidth : x, y: bottom ? y + w.outerHeight : y };
    }
    const saved = settings.pipBox;
    if (why === 'open' && saved && saved.x >= sc.availLeft && saved.x <= sc.availLeft + sc.availWidth
      && saved.y >= sc.availTop && saved.y <= sc.availTop + sc.availHeight) box = saved;
    const left = Math.round(clamp(box.right ? box.x - ow : box.x, sc.availLeft, sc.availLeft + sc.availWidth - ow));
    const top = Math.round(clamp(box.bottom ? box.y - oh : box.y, sc.availTop, sc.availTop + sc.availHeight - oh));
    if (Math.abs(ow - w.outerWidth) > 1 || Math.abs(oh - w.outerHeight) > 1 || left !== w.screenX || top !== w.screenY) {
      p.fitting = true;
      const ok = await pipWindowBounds({ left: w.screenX, top: w.screenY, width: w.outerWidth, height: w.outerHeight },
        { left, top, width: ow, height: oh, right: box.right, bottom: box.bottom }, why !== 'open');
      if (docPip !== p) return;
      p.fitting = false;
      if (ok === null) { // no extension: the video fills the window, or shows whole (its button)
        p.canFit = false;
        p.ui.fit.hidden = false;
        for (const g of p.grips) g.hidden = true;
        return;
      }
      if (!ok) { // still moving: once more in a moment
        if ((p.tries = (p.tries || 0) + 1) < 5) w.setTimeout(() => fitDocPip(why), 250);
        return;
      }
      p.tries = 0;
      if (Math.abs(w.innerWidth / w.innerHeight - r) / r > 0.02 && why !== 'clamp') { fitDocPip('clamp'); return; }
    }
    noteDocPipBox();
  }

  function noteDocPipBox() {
    const p = docPip;
    const w = p?.win;
    if (!w || w.closed) return;
    p.size = { w: w.innerWidth, h: w.innerHeight };
    p.bounds = { x: w.screenX, y: w.screenY, r: w.screenX + w.outerWidth, b: w.screenY + w.outerHeight };
    rememberDocPip();
    const v = p.video;
    const r = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : p.ratio;
    const info = { open: true, title: w.document.title, ratio: r, dpr: w.devicePixelRatio, iw: w.innerWidth, ih: w.innerHeight,
      minW: pipLimits(r, 1, w)[0], maxW: pipLimits(r * 1e4, 1e4, w)[0] };
    const key = JSON.stringify(info);
    if (key !== p.native) { p.native = key; pipNative(info); }
  }

  // Dragging one of its own edges or corners: the window follows in the video's shape the whole way (the
  // extension resizes it as the pointer moves); the edges not dragged stay where they are.
  function startPipResize(e, dir) {
    const p = docPip;
    if (!p || p.canFit === false || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const w = p.win;
    const v = p.video;
    const r = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : p.ratio;
    const g = e.currentTarget;
    g.setPointerCapture(e.pointerId);
    const st = { x: e.screenX, y: e.screenY, left: w.screenX, top: w.screenY, iw: w.innerWidth, ih: w.innerHeight,
      fw: w.outerWidth - w.innerWidth, fh: w.outerHeight - w.innerHeight };
    const right = st.left + st.iw + st.fw;
    const bottom = st.top + st.ih + st.fh;
    w.clearTimeout(p.dragTimer);
    p.grip = { target: null, busy: false };
    const move = (ev) => {
      let nw = st.iw + (dir.includes('e') ? ev.screenX - st.x : dir.includes('w') ? st.x - ev.screenX : 0);
      let nh = st.ih + (dir.includes('s') ? ev.screenY - st.y : dir.includes('n') ? st.y - ev.screenY : 0);
      if (dir === 'e' || dir === 'w') nh = nw / r;
      else if (dir === 'n' || dir === 's') nw = nh * r;
      else if (Math.abs(nw / st.iw - 1) >= Math.abs(nh / st.ih - 1)) nh = nw / r; // a corner: the side pulled further leads
      else nw = nh * r;
      [nw, nh] = pipLimits(Math.max(1, nw), Math.max(1, nh), w);
      const ow = nw + st.fw;
      const oh = nh + st.fh;
      p.grip.target = { left: dir.includes('w') ? right - ow : st.left, top: dir.includes('n') ? bottom - oh : st.top,
        width: ow, height: oh, right: dir.includes('w'), bottom: dir.includes('n') };
      pushPipResize(p);
    };
    const up = () => {
      g.removeEventListener('pointermove', move);
      g.removeEventListener('pointerup', up);
      g.removeEventListener('pointercancel', up);
      const done = () => {
        if (docPip !== p) return;
        if (p.grip?.busy) { w.setTimeout(done, 30); return; }
        p.grip = null;
        noteDocPipBox();
      };
      done();
    };
    g.addEventListener('pointermove', move);
    g.addEventListener('pointerup', up);
    g.addEventListener('pointercancel', up);
  }

  // One window update at a time, always to the latest size the pointer asks for.
  async function pushPipResize(p) {
    const gr = p.grip;
    if (!gr || gr.busy) return;
    gr.busy = true;
    while (gr.target && docPip === p) {
      const to = gr.target;
      gr.target = null;
      const w = p.win;
      const ok = await pipWindowBounds({ left: w.screenX, top: w.screenY, width: w.outerWidth, height: w.outerHeight }, to, false);
      if (ok === null) break;
    }
    gr.busy = false;
  }

  // The corner of its screen the window is nearest to, and where that corner of the window is.
  function docPipCorner(w) {
    const sc = w.screen;
    const right = w.screenX + w.outerWidth / 2 > sc.availLeft + sc.availWidth / 2;
    const bottom = w.screenY + w.outerHeight / 2 > sc.availTop + sc.availHeight / 2;
    return { right, bottom, x: right ? w.screenX + w.outerWidth : w.screenX, y: bottom ? w.screenY + w.outerHeight : w.screenY };
  }

  function rememberDocPip() {
    const w = docPip?.win;
    if (!w || w.closed || docPip.canFit === false) return;
    const box = { ...docPipCorner(w), area: w.innerWidth * w.innerHeight };
    if (JSON.stringify(box) === JSON.stringify(settings.pipBox)) return;
    settings.pipBox = box;
    saveSettings();
  }

  function onPipVideoShape() {
    const p = docPip;
    const v = p?.video;
    if (!v?.videoWidth) return;
    const r = v.videoWidth / v.videoHeight;
    if (!p.size) { p.ratio = r; fitDocPip('open'); return; } // its size wasn't known when the window opened
    if (Math.abs(r - p.ratio) / p.ratio < 0.02) return; // a sharper copy of the same video
    p.ratio = r;
    fitDocPip('shape');
  }

  function closeDocPip() {
    const p = docPip;
    if (!p) return;
    try { rememberDocPip(); } catch { /* closing */ }
    docPip = null;
    if (p.native) pipNative({ open: false });
    try { p.win.clearInterval(p.timer); p.win.clearTimeout(p.dragTimer); } catch { /* closed */ }
    const v = p.video;
    const playing = !v.paused;
    const home = document.querySelector('#shorts-player .html5-video-container');
    if (home) {
      home.prepend(v);
      if (playing) v.play().catch(() => {});
    }
    if (!p.win.closed) p.win.close();
    updateBarStates();
    updatePipCover();
    window.dispatchEvent(new Event('resize')); // YouTube sizes the video in the player again
    setTimeout(() => { fixShortSlot(); checkShortFit(); }, 300);
  }

  const pipPlayPause = () => { const v = docPip?.video; if (v) (v.paused ? v.play().catch(() => {}) : v.pause()); };

  function syncDocPip() {
    const p = docPip;
    if (!p) return;
    const v = p.video;
    const set = (b, name, label) => {
      if (b.dataset.icon !== name) { b.dataset.icon = name; b.replaceChildren(icon(name, 24)); }
      b.title = label;
      b.setAttribute('aria-label', label);
    };
    set(p.ui.play, v.paused ? 'play' : 'pause', t(v.paused ? 'pipPlay' : 'pipPause'));
    set(p.ui.mute, v.muted ? 'volumeOff' : 'volume', t(v.muted ? 'pipUnmute' : 'pipMute'));
    set(p.ui.fit, settings.pipFit ? 'fillScreen' : 'fitScreen', t(settings.pipFit ? 'pipFill' : 'pipFit'));
    const title = liteInfo().title || '';
    if (p.ui.title.textContent !== title) {
      p.ui.title.textContent = title;
      p.win.document.title = title;
    }
  }

  // Now and then: the title of the Short playing, and a new video element if YouTube made one (that one plays).
  function watchDocPip() {
    const p = docPip;
    if (!p) return;
    const fresh = document.querySelector('#shorts-player video');
    if (fresh && fresh !== p.video) {
      p.video.pause();
      p.video.remove();
      p.video = fresh;
      p.layer.before(fresh);
      fresh.play().catch(() => {});
    }
    syncDocPip();
    onPipVideoShape();
  }

  const pipWheel = { acc: 0, last: 0, hold: 0 };
  function onPipWheel(e) {
    e.preventDefault();
    const dir = wheelGesture(pipWheel, e);
    if (dir) shortsStep(dir);
  }

  function onPipKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown') shortsStep(1);
    else if (k === 'ArrowUp' || k === 'PageUp') shortsStep(-1);
    else if (k === ' ' || k === 'k') pipPlayPause();
    else if (k === 'm' && docPip) docPip.video.muted = !docPip.video.muted;
    else return;
    e.preventDefault();
  }

  // YouTube's own picture-in-picture button: covered at the click as well.
  document.addEventListener('click', (e) => {
    if (!document.pictureInPictureElement && e.target.closest?.('.ytp-pip-button')) {
      showPipCover(1000);
      setTimeout(updatePipCover, 1000); // it didn't start after all
    }
  }, true);
  document.addEventListener('enterpictureinpicture', () => {
    if (onShorts()) shortsMediaKeys();
    // Started by YouTube or the browser: Big Picture makes way here too.
    if (focusOn) {
      pipTookOver = true;
      setFocus(false);
    }
    updateBarStates();
    updatePipCover();
  }, true);
  document.addEventListener('leavepictureinpicture', () => {
    updateBarStates();
    updatePipCover();
    if (pipTookOver) {
      pipTookOver = false;
      if (!focusOn && state.vid && /^\/watch/.test(location.pathname)) setFocus(true);
    }
  }, true);
  addEventListener('resize', () => { if (pipCover?.isConnected) updatePipCover(); }, { passive: true });

  let loopedVideo = null;
  function toggleLoop() {
    const v = mainVideo();
    if (!v) return;
    v.loop = !v.loop;
    loopedVideo = v.loop ? v : null;
    toast(t(v.loop ? 'loopOn' : 'loopOff'));
    updateBarStates();
  }

  // ---------- toolbar ----------
  const state = { vid: null, info: null, err: null, loading: false, pinned: false, clip: null, folderMsg: null };
  let bar = null;
  let btns = {};
  let barMode = '';
  const barRO = new ResizeObserver(() => layoutBar());

  function barBtn(name, tip, onclick, { cls = '', size = 20, label = '', popup = false } = {}) {
    const b = h('button', {
      class: `ysd-btn ${cls}`, 'aria-label': tip, 'data-tip': tip, 'data-pop': popup || null, 'aria-haspopup': popup ? 'dialog' : null,
      onclick: (e) => { e.stopPropagation(); hideTip(); onclick(b); },
    }, icon(name, size), label ? h('span', {}, label) : null);
    return b;
  }

  function setBtn(b, on, tip) {
    if (!b) return;
    b.classList.toggle('ysd-on', !!on);
    b.setAttribute('aria-pressed', String(!!on));
    if (tip) { b.dataset.tip = tip; b.setAttribute('aria-label', tip); }
  }

  function updateBarStates() {
    if (!bar) return;
    const v = mainVideo();
    setBtn(btns.moon, isDark(), t(isDark() ? 'tipToLight' : 'tipToDark'));
    setBtn(btns.focus, focusOn, t(focusOn ? 'tipFocusOff' : 'tipFocusOn'));
    setBtn(btns.pip, pipOn(), t(pipOn() ? 'tipPipOff' : 'pip'));
    setBtn(btns.loop, !!v?.loop, t(v?.loop ? 'tipLoopOff' : 'loop'));
  }

  // full: every control visible; compact: view tools grouped behind one button;
  // tiny: download pickers grouped too. Chosen from the toolbar's own width.
  function layoutBar(force) {
    if (!bar) return;
    const w = bar.clientWidth || 640;
    const mode = w >= 470 ? 'full' : w >= 300 ? 'compact' : 'tiny';
    if (mode === barMode && !force) return;
    barMode = mode;
    if (pop.anchor && bar.contains(pop.anchor)) closePopover(true);
    btns = {};
    const picker = (name, key, build) => barBtn(name, t(key), (b) => openPopover(b, build), { popup: true });
    const left = mode === 'tiny'
      ? [barBtn('download', t('download'), (b) => openPopover(b, downloadMenu, 'ysd-menu'), { cls: 'ysd-labeled', label: t('download'), popup: true })]
      : [picker('video', 'tipVideo', videoPop), picker('music', 'tipAudio', audioPop), picker('image', 'tipThumb', thumbPop),
        picker('captions', 'tipSubs', subsPop), barBtn('camera', t('tipShot'), () => takeScreenshot())];
    const more = barBtn('more', t('settings'), (b) => { openPopover(b, settingsMenu, 'ysd-menu'); if (dmOn()) dmSync(); }, { cls: 'ysd-sm', popup: true });
    btns.more = more;
    const hide = barBtn('close', t('hideToolbar'), hideBar, { cls: 'ysd-sm' });
    let right;
    if (mode === 'full') {
      btns.moon = barBtn('moon', '', () => setYtTheme(isDark() ? 'light' : 'dark'));
      btns.focus = barBtn('focus', '', () => setFocus(!focusOn));
      btns.pip = document.pictureInPictureEnabled ? barBtn('pip', '', togglePip) : null;
      btns.loop = barBtn('repeat', '', toggleLoop);
      right = [btns.moon, btns.focus, btns.pip, btns.loop, h('span', { class: 'ysd-sep' }), more,
        barBtn('help', t('help'), (b) => openPopover(b, helpMenu, 'ysd-menu'), { cls: 'ysd-sm', popup: true }), hide];
    } else {
      right = [barBtn('tune', t('tipView'), (b) => openPopover(b, viewMenu, 'ysd-menu'), { popup: true }), more, hide];
    }
    bar.dataset.mode = mode;
    bar.setAttribute('aria-label', t('toolbarLabel'));
    bar.replaceChildren(h('div', { class: 'ysd-group' }, ...left), h('div', { class: 'ysd-group' }, ...right.filter(Boolean)));
    updateBarStates();
  }

  function hideBar() {
    settings.barHidden = true;
    saveSettings();
    unmountBar();
    unmountShorts();
    updateFab();
    toast(t('toolbarHidden', { cmd: t('menuShowToolbar') }));
  }

  function unmountBar() {
    if (!bar) return;
    if (pop.anchor && bar.contains(pop.anchor)) closePopover(true); // a dialog opened from the history panel stays
    hideTip();
    barRO.unobserve(bar);
    bar.remove();
    bar = null;
    barMode = '';
  }

  // ---------- Shorts: our buttons at the top of YouTube's column beside the Short ----------
  // YouTube builds that column anew for every Short; the buttons move into the new one. They borrow the
  // classes of YouTube's own buttons there, so they look and behave like them in every layout and theme;
  // our own look (ysd-own) only shows when there is nothing to borrow.
  let shortsBox = null;
  let shortsMO = null;
  let shortsLoad = 0;
  const sb = {};
  const shortsColumn = () => {
    // The renderer around the player; one without a player (YouTube asks to sign in first: age-restricted
    // Shorts, or a check) is the only renderer there is.
    const all = document.querySelectorAll('ytd-reel-video-renderer');
    const reel = document.querySelector('#shorts-player')?.closest('ytd-reel-video-renderer') || document.querySelector('ytd-reel-video-renderer[is-active]')
      || (all.length === 1 ? all[0] : null);
    return reel?.querySelector('reel-action-bar-view-model') || reel?.querySelector('#actions') || null;
  };
  const ensureInfo = () => { if (state.vid && !state.info && !state.loading && !state.err) loadInfo(); };

  function shortsItem(name, onclick) {
    const btn = h('button', { class: 'ysd-sbtn', 'aria-haspopup': 'dialog', onclick: (e) => { e.stopPropagation(); hideTip(); onclick(btn); } },
      h('div', { class: 'ysd-sico', 'aria-hidden': 'true' }, icon(name, 24)));
    const text = h('span', { class: 'ysd-stext' });
    const lab = h('div', { class: 'ysd-slab', 'aria-hidden': 'true' }, text);
    const label = h('label', { class: 'ysd-shost' }, btn);
    // data-pop: a press anywhere on it (the label too) toggles the menu instead of closing it first
    return { wrap: h('div', { class: 'ysd-sitem', 'data-pop': 'menu' }, label), label, btn, ico: btn.firstChild, lab, text };
  }

  function labelShorts() {
    if (!shortsBox) return;
    shortsBox.setAttribute('aria-label', t('toolbarLabel'));
    sb.download.text.textContent = t('dlShort');
    sb.download.btn.setAttribute('aria-label', t('download'));
    sb.more.btn.setAttribute('aria-label', t('settings'));
    sb.more.btn.dataset.tip = t('settings');
  }

  // YouTube's own button in the column (comments, share): its classes, part by part.
  function borrowShortsLook(col) {
    const tpl = [...col.children].find((c) => c !== shortsBox && c.querySelector(':scope > label > button') && c.querySelector(':scope > label > div'));
    const cls = (sel) => (tpl && (sel ? tpl.querySelector(sel) : tpl)?.getAttribute('class')) || '';
    const parts = tpl && {
      wrap: cls(''), label: cls(':scope > label'), btn: cls(':scope > label > button'), ico: cls(':scope > label > button > div'),
      lab: cls(':scope > label > div'), text: cls(':scope > label > div > span'),
    };
    shortsBox.classList.toggle('ysd-own', !parts);
    for (const item of [sb.download, sb.more]) {
      for (const k of ['wrap', 'label', 'btn', 'ico', 'lab', 'text']) {
        const el = item[k];
        const prev = el.dataset.ysdBorrowed || '';
        const next = parts?.[k] || '';
        if (prev === next) continue;
        if (prev) el.classList.remove(...prev.split(/\s+/).filter(Boolean));
        if (next) el.classList.add(...next.split(/\s+/).filter((c) => !c.startsWith('ysd-')));
        el.dataset.ysdBorrowed = next;
      }
    }
  }

  function mountShorts() {
    const col = shortsColumn();
    if (!col) return;
    if (!shortsBox) {
      sb.download = shortsItem('dlLine', (b) => { ensureInfo(); openPopover(b, downloadMenu, 'ysd-menu'); });
      sb.more = shortsItem('more', (b) => { openPopover(b, settingsMenu, 'ysd-menu'); if (dmOn()) dmSync(); });
      // ⋮ has an empty label: every button in the column then takes the same height (YouTube's are all labeled).
      sb.download.label.append(sb.download.lab);
      sb.more.label.append(sb.more.lab);
      sb.more.text.textContent = '\u00a0';
      shortsBox = h('div', { id: 'ysd-shorts', class: 'ysd-ui', role: 'toolbar' }, sb.download.wrap, sb.more.wrap);
      labelShorts();
    }
    if (col.firstElementChild !== shortsBox) col.prepend(shortsBox);
    borrowShortsLook(col);
    fitShorts(col);
    pipClearance();
    // The next Short gets a new column (and YouTube rebuilds it now and then in between): the buttons go into
    // it in the same moment (an observer's callback runs before anything is drawn), so they never show up
    // after YouTube's own.
    const root = col.closest('ytd-shorts');
    if (root && shortsMO?.root !== root) {
      shortsMO?.disconnect();
      shortsMO = new MutationObserver(() => {
        if (!shortsBox || !onShorts()) return;
        const c = shortsColumn();
        if (c && c.firstElementChild !== shortsBox) mountShorts();
        fixShortSlot();
      });
      shortsMO.root = root;
      shortsMO.observe(root, { childList: true, subtree: true });
    }
  }

  // A Short opened directly (picture-in-picture with the tab in the background, a step of more than one) plays
  // in whatever slot of YouTube's feed the player is in, and YouTube keeps that slot in the shape of the Short
  // it was made for: after a square one, the next 9:16 Short sits in a square player with bars and a blurred
  // picture around it. Until the feed is back on the Short playing, that slot takes the shape of the video
  // playing; it gets its own back afterwards.
  let slotFix = null; // { el, orig }
  function fixShortSlot() {
    const sp = document.querySelector('#shorts-player');
    const slot = sp?.closest('.reel-video-in-sequence-new');
    const restore = () => {
      if (slotFix?.el.isConnected) slotFix.el.style.setProperty('--ytd-shorts-player-ratio', slotFix.orig);
      slotFix = null;
    };
    if (!onShorts() || !slot || shortIdOf(slot) === videoId()) { restore(); return; } // its own Short: YouTube's shape
    if (slotFix && slotFix.el !== slot) restore();
    const v = docPip?.video || sp.querySelector('video');
    if (!v?.videoWidth) return;
    const want = v.videoWidth / v.videoHeight;
    const cur = slot.style.getPropertyValue('--ytd-shorts-player-ratio').trim();
    if (Math.abs(parseFloat(cur) - want) < 0.01) return;
    if (!slotFix) slotFix = { el: slot, orig: cur };
    slot.style.setProperty('--ytd-shorts-player-ratio', want.toFixed(4));
    window.dispatchEvent(new Event('resize')); // YouTube sizes the video in the player again
  }

  // Safety net: a Short's video that YouTube left at an old size (its own box no longer fits the player, so it
  // sits in a corner with the blurred picture around it) is fitted into the player, as YouTube would.
  function checkShortFit() {
    const sp = document.querySelector('#shorts-player');
    const v = sp?.querySelector('video');
    if (!onShorts() || !v?.videoWidth) return;
    const pw = sp.clientWidth;
    const ph = sp.clientHeight;
    const [w, hh, l, t] = ['width', 'height', 'left', 'top'].map((k) => parseFloat(v.style[k]) || 0);
    if (!pw || !ph || !w || !hh) return;
    const fits = (Math.abs(w - pw) < 2 || Math.abs(hh - ph) < 2) && l >= -1 && t >= -1 && l + w <= pw + 2 && t + hh <= ph + 2;
    sp.classList.toggle('ysd-fit', !fits);
  }
  for (const type of ['loadedmetadata', 'resize']) {
    document.addEventListener(type, (e) => {
      if (e.target instanceof HTMLVideoElement && e.target.closest?.('#shorts-player')) { fixShortSlot(); checkShortFit(); }
    }, true);
  }

  // Too little room above YouTube's buttons (a low window; or the column lies on the Short, whose own buttons
  // at the top need their space): ⋮ goes and its menu moves into Download's. Measured with both buttons, so it
  // doesn't flip back and forth.
  function fitShorts(col = shortsColumn()) {
    const player = document.querySelector('#shorts-player');
    if (!shortsBox?.isConnected || !col || !player) return;
    if (!col.querySelector('like-button-view-model, #like-button')) return; // YouTube's buttons aren't all there yet
    const p = player.getBoundingClientRect();
    const c = col.getBoundingClientRect();
    if (!p.height || !c.height) return;
    const theirs = c.height - shortsBox.getBoundingClientRect().height;
    const top = c.bottom - theirs - 2 * sb.download.wrap.offsetHeight;
    const over = c.left < p.right - 1;
    const compact = top < p.top + (over ? 80 : 0);
    if (compact === shortsBox.classList.contains('ysd-compact')) return;
    shortsBox.classList.toggle('ysd-compact', compact);
    if (pop.anchor && (pop.anchor === sb.more.btn || pop.build === downloadMenu) && shortsBox.contains(pop.anchor)) closePopover(true);
  }

  // ---------- Shorts: one history for the session, like a browser's ----------
  // Every Short watched in this tab, in order, and where we are in that list. Back goes back through it and
  // forward replays it in the same order; only past its end comes a new Short: the next one in YouTube's feed
  // not watched in this session yet. A Short goes on where it was left. The page (scrolling, the arrow keys,
  // YouTube's arrows) and the picture-in-picture window (scrolling, its arrows and buttons) all go through it.
  // YouTube's feed alone can't be relied on for that: a Short opened directly (the only way while the tab is
  // in the background) gets a new feed after it, which may hold Shorts already watched, and going back and
  // forward then no longer follows what was watched.
  const shortIdOf = (slot) => /\/vi\/([\w-]{11})\//.exec(slot?.querySelector('.reel-video-in-sequence-thumbnail')?.style.backgroundImage || '')?.[1] || null;
  // pending: on the way to a Short (the list already points at it); seek: where the Short coming back goes on.
  const shortsHist = { list: [], pos: -1, cur: null, seen: new Set(), at: new Map(), pending: null, skips: 0, since: 0, seek: null };

  function shortsStep(dir, retry) {
    if (!onShorts()) return;
    const hs = shortsHist;
    const now = videoId();
    if (hs.pending && Date.now() - hs.pending.at > 4000) hs.pending = null; // it never came
    // From the Short actually playing (unless one is on its way: then from that one, for quick steps).
    if (!retry && !hs.pending && hs.list[hs.pos] !== now) {
      const i = hs.list.reduce((best, id, j) => (id === now && (best < 0 || Math.abs(j - hs.pos) < Math.abs(best - hs.pos)) ? j : best), -1);
      if (i >= 0) hs.pos = i;
      else noteShortVisit(now);
    }
    let vid;
    if (dir < 0) {
      if (hs.pos <= 0) return; // nothing before it, like the first page in a browser
      vid = hs.list[--hs.pos];
    } else if (hs.pos < hs.list.length - 1) {
      vid = hs.list[++hs.pos];
    } else {
      vid = nextUnseen();
      if (!vid) { // not known yet: YouTube's own next, checked when it comes
        hs.pending = { fresh: true, at: Date.now() };
        document.querySelector('#navigation-button-down button')?.click();
        return;
      }
      hs.list.push(vid);
      hs.pos = hs.list.length - 1;
    }
    hs.pending = { vid, at: Date.now() };
    const left = hs.at.get(vid);
    hs.seek = left?.t > 1 ? { vid, ...left, until: Date.now() + 5000 } : null;
    openShortHere(vid);
  }

  // A Short that is now playing (mount): its place in the history.
  function noteShortVisit(vid) {
    const hs = shortsHist;
    const p = hs.pending;
    if (p?.vid && p.vid !== vid && Date.now() - p.at < 4000) return; // still on the way there
    hs.pending = null;
    hs.cur = vid;
    hs.since = Date.now();
    if (p?.fresh && (hs.seen.has(vid) || hs.list.includes(vid)) && hs.skips < 5) {
      hs.skips++; // YouTube's next was one already watched: on to the one after it
      shortsStep(1, true);
      return;
    }
    hs.skips = 0;
    if (hs.list[hs.pos] !== vid) {
      // Came another way (YouTube's own next, a swipe, a link).
      let again = true;
      if (hs.list[hs.pos + 1] === vid) hs.pos++;
      else if (hs.list[hs.pos - 1] === vid) hs.pos--;
      else {
        hs.list.splice(hs.pos + 1);
        hs.list.push(vid);
        hs.pos = hs.list.length - 1;
        again = false;
      }
      const left = again ? hs.at.get(vid) : null;
      if (left?.t > 1) hs.seek = { vid, ...left, until: Date.now() + 5000 };
    }
    hs.seen.add(vid);
  }

  // The next Short in YouTube's feed after the one the history is at, not watched yet.
  function nextUnseen() {
    const hs = shortsHist;
    const slots = [...document.querySelectorAll('.reel-video-in-sequence-new')];
    let i = slots.findIndex((sl) => shortIdOf(sl) === hs.list[hs.pos]);
    if (i < 0) i = slots.findIndex((sl) => sl.contains(playerEl()));
    if (i < 0) return null;
    for (let j = i + 1; j < slots.length; j++) {
      const id = shortIdOf(slots[j]);
      if (!id) return null;
      if (!hs.seen.has(id) && !hs.list.includes(id)) return id;
    }
    return null;
  }

  // A Short in the feed is scrolled to (YouTube plays the one in view; the neighbour glides in like with
  // YouTube's arrows). One that isn't there, or any while the tab is in the background (a feed that isn't
  // drawn doesn't move), is opened directly.
  function openShortHere(vid) {
    const slots = [...document.querySelectorAll('.reel-video-in-sequence-new')];
    const target = slots.find((sl) => shortIdOf(sl) === vid);
    const feed = document.querySelector('#shorts-container');
    const mid = innerHeight / 2;
    const inView = slots.find((sl) => { const r = sl.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    // YouTube's feed moves one Short per scroll at most: only the neighbour of the one in view is scrolled to.
    if (!document.hidden && target && inView && feed && Math.abs(slots.indexOf(target) - slots.indexOf(inView)) === 1) {
      const synced = inView.contains(playerEl()) && shortIdOf(inView) === videoId();
      feed.scrollBy({ top: target.getBoundingClientRect().top - inView.getBoundingClientRect().top, behavior: synced ? 'smooth' : 'instant' });
    } else {
      openShort(vid); // further away, in view already (with another Short playing in it), or not in the feed
    }
  }

  // Where each Short was left (and how long it is: YouTube reuses one video element, and right after a step
  // it may still hold the Short before); going on there when it comes back.
  function onShortTime(e) {
    const hs = shortsHist;
    const v = e.target;
    if (!onShorts() || v !== mainVideo() || hs.cur !== videoId()) return;
    const sk = hs.seek;
    if (sk) {
      if (sk.vid !== hs.cur || Date.now() > sk.until) hs.seek = null;
      else if (v.readyState >= 1 && Math.abs(v.duration - sk.d) < 0.25) {
        if (Math.abs(v.currentTime - sk.t) > 0.6) v.currentTime = sk.t;
        else hs.seek = null;
      }
      return;
    }
    if (Date.now() - hs.since > 700 && v.currentTime > 0 && v.duration) hs.at.set(hs.cur, { t: v.currentTime, d: v.duration });
  }
  for (const type of ['loadeddata', 'playing', 'timeupdate']) document.addEventListener(type, onShortTime, true);

  // One step per scroll gesture (a wheel notch, a swipe on the touchpad), however long it goes on.
  function wheelGesture(g, e) {
    const now = Date.now();
    if (now - g.last > 250) g.acc = 0;
    g.last = now;
    if (now < g.hold) { g.hold = Math.max(g.hold, now + 250); return 0; }
    g.acc += e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
    if (Math.abs(g.acc) < 50) return 0;
    g.hold = now + 450;
    const dir = Math.sign(g.acc);
    g.acc = 0;
    return dir;
  }

  // On Shorts pages scrolling, the arrow keys and YouTube's arrows go through the history (not inside the
  // comments or description, nor in fields). Only listening there: a wheel listener that can stop scrolling
  // makes every scroll wait for it.
  const pageWheel = { acc: 0, last: 0, hold: 0 };
  const shortsPanel = (el) => el.closest?.('ytd-engagement-panel-section-list-renderer, [id*="panel"], input, textarea, select, [contenteditable], .ysd-pop');
  function onShortsWheel(e) {
    if (e.ctrlKey || !e.target.closest?.('ytd-shorts') || shortsPanel(e.target) || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    e.stopPropagation();
    const dir = wheelGesture(pageWheel, e);
    if (dir) shortsStep(dir);
  }
  function onShortsKey(e) {
    if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || shortsPanel(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    shortsStep(e.key === 'ArrowDown' ? 1 : -1);
  }
  function onShortsArrow(e) {
    const nav = e.isTrusted ? e.target.closest?.('#navigation-button-down, #navigation-button-up') : null;
    if (!nav) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    shortsStep(nav.id === 'navigation-button-down' ? 1 : -1);
  }
  let shortsInput = false;
  function armShortsInput(on) {
    if (on === shortsInput) return;
    shortsInput = on;
    const f = on ? 'addEventListener' : 'removeEventListener';
    window[f]('wheel', onShortsWheel, { capture: true, passive: false });
    window[f]('keydown', onShortsKey, true);
    window[f]('click', onShortsArrow, true);
  }
  // YouTube's own navigation (the page stays, the Short in picture-in-picture keeps playing).
  function openShort(vid) {
    page('openShort', vid);
  }
  // YouTube takes the buttons away again for every Short: on Shorts pages that becomes ours.
  function shortsMediaKeys() {
    page('shortsMediaKeys');
  }
  document.addEventListener('ysd-media', (e) => shortsStep(e.detail === 'prev' ? -1 : 1));

  function unmountShorts() {
    if (!shortsBox) return;
    if (pop.anchor && shortsBox.contains(pop.anchor)) closePopover(true);
    shortsMO?.disconnect();
    shortsMO = null;
    shortsBox.remove();
    shortsBox = null;
  }

  // ---------- history: one button in YouTube's top bar for downloads and history, the panel under it ----------
  // The button is the download status too: a ring fills with the progress of what runs (the badge counts
  // it), a check mark shows for a moment when everything is done, and a dot stays for results not seen
  // yet (red after a failure) until the panel is opened. Its size and place never change.
  let histBtn = null;
  let histArc = null;
  let histCount = null;
  let histDot = null;
  const HIST_C = 2 * Math.PI * 18;
  const panelOpen = () => panel && !panel.hidden && !panel.classList.contains('ysd-leave'); // fading out counts as closed
  let panelLeaving = 0;
  // batch: each download's share of the ring since the button was last idle; ended ones count as full, so
  // the ring never runs backwards when one of several ends. unseen: 'done' or 'failed'. notice: see panelNote.
  const hs = { batch: new Map(), done: false, failed: false, ending: false, unseen: '', notice: null, flash: '', flashTimer: 0, starting: false };

  // The download itself fills the ring up to 90 %, converting and saving the rest.
  const ringPct = (st, pct) => (st === 'processing' ? 90 + pct / 10 : st === 'queued' ? 0 : pct * 0.9);

  function updateFab() {
    const dmActive = DM.token ? DM.jobs.filter((j) => DM_ACTIVE.has(j.status)) : [];
    const list = [...[...jobs.values()].map((j) => ({ id: j.id, st: jobStatus(j), pct: j.pct || 0 })),
      ...dmActive.map((j) => ({ id: `dm:${j.id}`, st: j.status, pct: j.pct || 0 }))];
    const count = list.length;
    const want = count > 0 || panelOpen() || hs.starting || !!hs.unseen || !!hs.notice || !settings.barHidden;
    if (!histBtn) {
      const NS = 'http://www.w3.org/2000/svg';
      const ring = document.createElementNS(NS, 'svg');
      ring.setAttribute('class', 'ysd-hist-ring');
      ring.setAttribute('viewBox', '0 0 40 40');
      const circle = (cls, extra = {}) => {
        const c = document.createElementNS(NS, 'circle');
        for (const [k, v] of Object.entries({ cx: 20, cy: 20, r: 18, class: cls, ...extra })) c.setAttribute(k, v);
        return c;
      };
      histArc = circle('ysd-hist-arc', { 'stroke-dasharray': HIST_C.toFixed(2), 'stroke-dashoffset': HIST_C.toFixed(2) });
      ring.append(circle('ysd-hist-track'), histArc);
      const clock = icon('history', 24);
      clock.setAttribute('class', 'ysd-hist-ico');
      const check = icon('check', 22);
      check.setAttribute('class', 'ysd-hist-check');
      histCount = h('span', { class: 'ysd-count', hidden: true });
      histDot = h('span', { class: 'ysd-hist-dot', hidden: true });
      histBtn = h('button', { id: 'ysd-hist', class: 'ysd-ui ysd-idle', onclick: (e) => { e.stopPropagation(); hideTip(); togglePanel(); } },
        ring, clock, check, histCount, histDot);
    }
    // Right side of the top bar, before YouTube's own buttons (it keeps that part across page changes).
    const end = document.querySelector('ytd-masthead #end');
    if (end && histBtn.parentNode !== end) end.insertBefore(histBtn, end.querySelector('#buttons') || end.firstChild);
    histBtn.hidden = !want;
    for (const x of list) hs.batch.set(x.id, Math.max(hs.batch.get(x.id) || 0, ringPct(x.st, x.pct)));
    const live = new Set(list.map((x) => x.id));
    let sum = 0;
    for (const [id, share] of hs.batch) sum += live.has(id) ? share : 100;
    const pct = hs.batch.size ? sum / hs.batch.size : 0;
    histArc.setAttribute('stroke-dashoffset', (HIST_C * (1 - pct / 100)).toFixed(2));
    // Deferred: whoever ended the last download says first whether it failed.
    if (!count && hs.batch.size && !hs.ending) {
      hs.ending = true;
      setTimeout(endBatch, 0);
    }
    histBtn.classList.toggle('ysd-idle', !count);
    histBtn.classList.toggle('ysd-failed', count > 0 && hs.failed);
    histBtn.classList.toggle('ysd-paused', count > 0 && list.every((x) => x.st === 'paused'));
    histBtn.classList.toggle('ysd-starting', hs.starting && !count);
    histBtn.classList.toggle('ysd-on', panelOpen());
    histCount.textContent = String(count);
    histCount.hidden = !count;
    histDot.hidden = !hs.unseen || count > 0 || !!hs.flash;
    histDot.classList.toggle('ysd-dot-red', hs.unseen === 'failed');
    let tip = t('history');
    if (count > 1) tip = t('tipMany', { n: count, p: Math.floor(pct) });
    else if (count === 1) {
      const x = list[0];
      tip = x.st === 'queued' ? t('stQueued') : x.st === 'processing' ? t('stProcessing') : `${t(x.st === 'paused' ? 'stPaused' : 'stDownloading')} ${Math.floor(x.pct)}%`;
    } else if (hs.starting) tip = t('dmStarting');
    else if (hs.unseen) tip = t(hs.unseen === 'failed' ? 'statusFailed' : 'toastSaved');
    if (histBtn.dataset.tip !== tip) {
      histBtn.dataset.tip = tip;
      histBtn.setAttribute('aria-label', tip);
      if (tipTarget === histBtn && tipEl) tipEl.textContent = tip; // hovering while it changes
    }
  }

  function endBatch() {
    hs.ending = false;
    if (jobs.size || (DM.token && DM.jobs.some((j) => DM_ACTIVE.has(j.status)))) return;
    const kind = hs.failed ? 'failed' : hs.done ? 'done' : ''; // only canceled: nothing to show
    hs.batch.clear();
    hs.done = false;
    hs.failed = false;
    if (kind) flashHist(kind);
    else updateFab();
  }

  // Full ring for about a second: green with a check mark, or red.
  function flashHist(kind) {
    if (!histBtn) updateFab();
    hs.flash = kind;
    histBtn.classList.remove('ysd-flash-done', 'ysd-flash-failed');
    histBtn.classList.add(`ysd-flash-${kind}`);
    clearTimeout(hs.flashTimer);
    hs.flashTimer = setTimeout(() => {
      hs.flash = '';
      histBtn.classList.remove('ysd-flash-done', 'ysd-flash-failed');
      updateFab();
    }, 1100);
    updateFab();
  }

  // A download ended (or turned out done already). With others still running it only counts for the
  // batch; the check mark comes when the last one ends.
  function markDone() {
    if (!panelOpen() && hs.unseen !== 'failed') hs.unseen = 'done';
    if (hs.batch.size) hs.done = true;
    else flashHist('done');
    updateFab();
  }
  function markFailed() {
    if (!panelOpen()) hs.unseen = 'failed';
    if (hs.batch.size) hs.failed = true;
    else flashHist('failed');
    updateFab();
  }

  // A message at the top of the panel, for what the ring can't say: why a download couldn't start, or a
  // choice to make ("Download again"). It stays until acted on, dismissed, or the panel closes after
  // showing it.
  function panelNote(text, action = null, tone = 'red') {
    hs.notice = { text, action, tone };
    renderPanel();
    updateFab();
  }
  function clearNotice() {
    if (!hs.notice) return;
    hs.notice = null;
    renderPanel();
    updateFab();
  }
  const failNote = (text, action = null) => { markFailed(); panelNote(text, action); };
  const noteExtReloaded = () => failNote(t('extReloaded'), { label: t('reloadPage'), run: () => location.reload() });
  const noteNoApp = (action = null) => failNote(t('dmUnavailable'), action);

  let panel = null;
  const itemRefs = new Map();
  const rows = new Map(); // history id -> row element, kept across renders so rows animate in and out

  // Header, list and footer are built once and reused by every render.
  let pTitle = null;
  let pCount = null;
  let pClear = null;
  let pClose = null;
  let pPin = null;
  let panelPinned = false; // like the pickers' pin: open until closed on purpose, reset when closed
  let pHead = null;
  let pNote = null;
  let pList = null;
  let pSpacer = null;
  let pEmpty = null;
  let pFoot = null;
  let pChange = null; // kept across renders: the folder dialog is anchored to it
  let pOpen = null;
  function openPanel() {
    if (!panel) {
      pTitle = h('span');
      pCount = h('small');
      pClear = h('button', { class: 'ysd-textbtn', onclick: clearHistory });
      pClose = iconBtn('close', t('close'), closePanel);
      pPin = iconBtn('pin', t('pin'), () => { panelPinned = !panelPinned; paintPanelPin(); });
      pSpacer = h('div', { class: 'ysd-pspacer', 'aria-hidden': 'true' });
      pList = h('div', { class: 'ysd-plist' }, pSpacer);
      pList.addEventListener('scroll', () => {
        const hgt = pSpacer.offsetHeight;
        const below = pList.scrollHeight - pList.clientHeight - pList.scrollTop;
        if (hgt && below > 0) pSpacer.style.height = `${Math.max(0, hgt - below)}px`;
      }, { passive: true });
      pEmpty = h('div', { class: 'ysd-pempty' });
      pFoot = h('div', { class: 'ysd-pfoot' });
      pChange = h('button', { class: 'ysd-link', onclick: () => openFolderDialog(pChange) });
      pOpen = h('button', { class: 'ysd-link', onclick: dmOpenFolder });
      pHead = h('div', { class: 'ysd-phead' }, h('span', { class: 'ysd-ptitle' }, pTitle, pCount), pClear, pPin, pClose);
      pNote = h('div', { class: 'ysd-pnote', role: 'status', hidden: true });
      panel = h('div', { id: 'ysd-panel', class: 'ysd-ui', role: 'dialog', hidden: true },
        pHead, pNote, h('div', { class: 'ysd-plist-wrap' }, pList, pEmpty), pFoot);
      document.body.append(panel);
      // It grows and shrinks with its list: keep it inside the window when it does.
      new ResizeObserver(() => placePanel()).observe(panel);
    }
    clearTimeout(panelLeaving); // opened again while it was fading out
    panel.classList.remove('ysd-leave');
    panel.hidden = false;
    hs.unseen = ''; // seen now
    refreshFolderState();
    renderPanel();
    placePanel();
    updateFab();
    if (DM.token) dmSync();
  }
  function closePanel() {
    if (panelOpen()) panelLeaving = leave(panel, () => { panel.hidden = true; });
    hs.notice = null; // it was seen
    panelPinned = false;
    paintPanelPin();
    if (pop.anchor && panel?.contains(pop.anchor)) closePopover(true);
    updateFab();
  }
  const togglePanel = () => (panelOpen() ? closePanel() : openPanel());

  function paintPanelPin() {
    if (!pPin) return;
    const tip = t(panelPinned ? 'unpin' : 'pin');
    pPin.classList.toggle('ysd-on', panelPinned);
    pPin.dataset.tip = tip;
    pPin.setAttribute('aria-label', tip);
    pPin.setAttribute('aria-pressed', String(panelPinned));
  }

  // Always right under its button, aligned to its right edge (also after the window changes size).
  function placePanel() {
    if (!panelOpen()) return;
    const w = panel.offsetWidth;
    const b = histBtn?.isConnected && !histBtn.hidden ? histBtn.getBoundingClientRect() : null;
    const p = b?.width ? { left: b.right - w, top: b.bottom + 8 } : { left: innerWidth - w - 16, top: 64 };
    panel.style.left = `${clamp(p.left, 8, Math.max(8, innerWidth - w - 8))}px`;
    panel.style.top = `${clamp(p.top, 8, Math.max(8, innerHeight - panel.offsetHeight - 8))}px`;
  }

  function clearHistory() {
    for (const r of history) failedJobs.delete(r.id);
    history = [];
    sessionBlobs.clear();
    saveHistory();
    if (DM.token && DM.jobs.some((j) => !DM_ACTIVE.has(j.status))) {
      DM.jobs = DM.jobs.filter((j) => DM_ACTIVE.has(j.status));
      setValue('dmJobs', DM.jobs);
      dmEnsure().then((ok) => ok && dmReq('POST', '/v1/jobs/clear').then(dmSync)).catch(() => {});
    }
    renderPanel();
  }

  const DETAIL = {
    starting: 'starting', findingClip: 'findingClip', merging: 'merging', cutting: 'cutting', decoding: 'decoding',
    saving: 'saving', fetchingImage: 'fetchingImage', fetchingSubs: 'fetchingSubs',
    downloading: 'stDownloading', downloadingVideo: 'downloadingVideo', downloadingAudio: 'downloadingAudio', verifying: 'verifying',
  };
  function itemSub(it) {
    const st = jobStatus(it);
    if (it.notice && (st === 'downloading' || st === 'paused' || st === 'processing')) return t(it.notice);
    if (st === 'queued') return t('waitingOthers');
    if (st === 'downloading' || st === 'paused') {
      if (!it.total) return it.detail ? t(DETAIL[it.detail] || it.detail) : t('starting');
      const out = [`${Math.floor(it.pct)}%`, t('progressOf', { got: fmtSize(it.got) || '0', total: fmtSize(it.total) })];
      if (st === 'downloading' && it.speed) out.push(t('perSecond', { speed: fmtSize(it.speed) }), isFinite(it.eta) ? t('timeLeft', { t: fmtEta(it.eta) }) : '');
      if (st === 'downloading' && it.shaping) out.push(t('sharingBandwidth'));
      return out.filter(Boolean).join(' \u00b7 ');
    }
    if (st === 'processing') {
      if (['encodingMp3', 'preparingEngine', 'converting'].includes(it.detail)) return t(it.detail, { p: Math.floor(it.pct || 0) });
      if (it.detail === 'merging' && !it.indet) return `${t('merging')} ${Math.floor(it.pct || 0)}%`;
      return t(DETAIL[it.detail] || 'stProcessing');
    }
    if (st === 'completed' && it.dm) return [fmtSize(it.size), it.exists === false ? t('errMoved') : t('inFolder', { folder: it.folder }), fmtAgo(it.finishedAt || it.at)].filter(Boolean).join(' \u00b7 ');
    if (st === 'failed' && it.dm) return dmErrText(it.err);
    if (st === 'completed') return [fmtSize(it.size), it.where === 'folder' ? t('inFolder', { folder: it.folder }) : t('inBrowser'), fmtAgo(it.at)].filter(Boolean).join(' \u00b7 ');
    if (st === 'failed') return it.err ? t(it.err.key, it.err.vars) : it.error || t('errGeneric');
    if (st === 'canceled') return fmtAgo(it.at);
    return '';
  }

  function panelItem(it) {
    const active = it.dm ? DM_ACTIVE.has(it.status) : jobs.has(it.id);
    const st = jobStatus(it);
    const [labelKey, color] = STATUS[st] || ['stFailed', 'red'];
    const chip = h('span', { class: `ysd-chip${color ? ` ysd-c-${color}` : ''}` }, t(labelKey));
    const sub = h('div', { class: `ysd-item-sub${it.notice && active ? ' ysd-notice' : ''}`, role: active ? 'status' : null }, itemSub(it));
    const fill = h('i');
    const barEl = active ? h('div', { class: 'ysd-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100 }, fill) : null;
    const paintBar = (j) => {
      if (!barEl) return;
      barEl.classList.toggle('ysd-indet', !!j.indet && !j.paused);
      fill.style.width = `${j.pct || 0}%`;
      barEl.setAttribute('aria-valuenow', String(Math.floor(j.pct || 0)));
    };
    paintBar(it);

    const actions = h('div', { class: 'ysd-item-actions' });
    if (active && it.dm) {
      if (st !== 'processing') actions.append(it.paused ? iconBtn('play', t('resume'), () => dmAct(it.dmId, 'resume')) : iconBtn('pause', t('pause'), () => dmAct(it.dmId, 'pause')));
      actions.append(iconBtn('close', t('cancel'), () => dmAct(it.dmId, 'cancel'), 'ysd-danger'));
    } else if (active) {
      if (it.started && st !== 'processing') {
        actions.append(it.paused ? iconBtn('play', t('resume'), () => resumeJob(it)) : iconBtn('pause', t('pause'), () => pauseJob(it)));
      }
      actions.append(iconBtn('close', t('cancel'), () => cancelJob(it), 'ysd-danger'));
    }
    if (active) {
      itemRefs.set(it.id, (j) => {
        sub.textContent = itemSub(j);
        sub.classList.toggle('ysd-notice', !!j.notice);
        paintBar(j);
      });
    } else if (it.dm) {
      if (st === 'completed' && it.exists !== false) actions.append(iconBtn('folder', t('showInFolder'), () => dmAct(it.dmId, 'reveal')));
      if (st === 'failed' || st === 'canceled') actions.append(iconBtn('refresh', t(st === 'failed' ? 'retry' : 'restart'), () => dmAct(it.dmId, 'retry')));
      actions.append(iconBtn('delete', t('remove'), () => dmAct(it.dmId, 'remove'), 'ysd-danger'));
    } else {
      if (canPlay(it)) actions.append(iconBtn('play', t('play'), () => play(it)));
      if ((st === 'failed' || st === 'canceled') && it.key) actions.append(iconBtn('refresh', t(st === 'failed' ? 'retry' : 'restart'), () => retry(it)));
      actions.append(iconBtn('delete', t('remove'), () => removeHistory(it.id), 'ysd-danger'));
    }

    const clip = it.opts?.trim ? h('span', { class: 'ysd-clip', 'data-tip': t('trimmedClip') }, icon('scissors', 14), `${fmtClock(it.opts.trim.start)}\u2013${fmtClock(it.opts.trim.end)}`) : null;
    return h('div', { class: `ysd-item ysd-st-${st}` },
      h('div', { class: 'ysd-item-main' },
        h('a', { class: 'ysd-item-title', href: `/watch?v=${it.vid}`, 'data-tip': it.title }, it.title),
        h('div', { class: 'ysd-item-meta' },
          it.author ? h('span', { class: 'ysd-item-author' }, it.author) : null,
          h('b', {}, it.format === 'OPUS' ? 'Opus' : it.format), h('span', {}, qualityText(it.quality)), clip, chip),
        sub, barEl),
      actions);
  }

  // Keyed update: rows are reused, new ones grow in, removed ones collapse out. The panel itself keeps
  // its size and bottom anchor, so nothing outside the list moves.
  function renderPanel() {
    if (!panelOpen()) return;
    itemRefs.clear();
    // Newest first by start time, so an entry never moves when its state changes.
    const dmItems = DM.token ? DM.jobs.map(dmItem) : [];
    const items = [...jobs.values(), ...history, ...dmItems].sort((a, b) => (b.at || 0) - (a.at || 0));
    const keep = new Set(items.map((i) => i.id));
    // When the list is scrolled near its end, the rows that collapse would pull everything above them
    // down (the scroll position shrinks with the content). The spacer takes their height instead and
    // is trimmed away later, only from the part scrolled out of view below.
    const gone = [...rows].reduce((n, [id, row]) => n + (keep.has(id) ? 0 : row.offsetHeight), 0);
    if (!items.length) pSpacer.style.height = '0px';
    else if (gone) {
      const below = pList.scrollHeight - pList.clientHeight - pList.scrollTop;
      const pad = Math.max(0, Math.min(pList.scrollTop, gone - below));
      if (pad) pSpacer.style.height = `${pSpacer.offsetHeight + pad}px`;
    }
    for (const [id, row] of rows) {
      if (keep.has(id)) continue;
      rows.delete(id);
      row.classList.add('ysd-leave');
      // Only the row's own collapse counts: hover fades of its buttons end sooner and bubble up here,
      // and removing the row on those cut the collapse short and made the rows below jump.
      const drop = (e) => { if (!e || (e.target === row && e.propertyName === 'grid-template-rows')) row.remove(); };
      row.addEventListener('transitionend', drop);
      setTimeout(drop, 400); // no transition (reduced motion)
    }
    // Rows that are still collapsing keep their place; the rest are positioned around them, so a
    // re-render during a collapse never reorders anything on screen.
    const nextLive = (el) => { while (el?.classList.contains('ysd-leave')) el = el.nextElementSibling; return el; };
    let prev = null;
    for (const it of items) {
      let row = rows.get(it.id);
      const content = h('div', {}, panelItem(it));
      if (!row) {
        row = h('div', { class: 'ysd-row ysd-enter' }, content);
        rows.set(it.id, row);
        if (prev) prev.after(row); else pList.prepend(row);
        requestAnimationFrame(() => requestAnimationFrame(() => row.classList.remove('ysd-enter')));
      } else {
        row.replaceChildren(content);
        if (nextLive(prev ? prev.nextElementSibling : pList.firstElementChild) !== row) { if (prev) prev.after(row); else pList.prepend(row); }
      }
      prev = row;
    }
    // Empty: one compact line. The panel grows with the list as downloads arrive.
    pEmpty.replaceChildren(h('div', {}, h('div', { class: 'ysd-pempty-in' }, icon('download', 24),
      h('div', {}, h('b', {}, t('noDownloads')), h('span', {}, t('noDownloadsHint'))))));
    pEmpty.classList.toggle('ysd-hide', items.length > 0);
    const n = hs.notice;
    pNote.hidden = !n;
    if (n) {
      pNote.style.setProperty('--c', `var(--ysd-${n.tone})`);
      pNote.replaceChildren(icon(n.tone === 'red' ? 'warning' : n.tone === 'green' ? 'check' : 'download', 18), h('span', {}, n.text),
        n.action ? h('button', { class: 'ysd-link', onclick: () => { clearNotice(); n.action.run(); } }, n.action.label) : null,
        iconBtn('close', t('close'), clearNotice));
    }
    panel.setAttribute('aria-label', t('history'));
    pTitle.textContent = t('downloads');
    const dmActive = dmItems.filter((i) => DM_ACTIVE.has(i.status)).length;
    const nActive = jobs.size + dmActive;
    const nDone = history.length + dmItems.length - dmActive;
    pCount.textContent = nActive ? t('nActive', { n: nActive }) : nDone ? t('nFinished', { n: nDone }) : '';
    pClear.textContent = t('clear');
    pClear.dataset.tip = t('clearFinished');
    pClear.classList.toggle('ysd-invisible', !nDone); // keeps its space so the header doesn't shift
    pClose.dataset.tip = t('close');
    pClose.setAttribute('aria-label', t('close'));
    paintPanelPin();
    if (dmOn()) {
      const ds = DM.status;
      const dbad = !!ds && !!ds.folderState && ds.folderState !== 'ok';
      pChange.textContent = t('change');
      pOpen.textContent = t('openFolder');
      pFoot.replaceChildren(
        h('span', { 'data-tip': ds?.folder || '' }, icon(dbad ? 'warning' : 'computer', 16), `${t('savingTo')} `, h('b', {}, ds?.folderName || t('dmTitle')),
          dbad ? h('span', { class: 'ysd-chip ysd-c-red' }, t('folderUnavailable')) : null),
        pOpen, pChange);
      return;
    }
    const bad = folderState === 'permission' || folderState === 'missing';
    pChange.textContent = t(dirHandle ? 'change' : 'chooseFolder');
    pFoot.replaceChildren(...[
      h('span', {}, icon(bad ? 'warning' : 'folder', 16), `${t('savingTo')} `, h('b', {}, dirHandle ? dirHandle.name : t('browserDownloads')),
        bad ? h('span', { class: `ysd-chip ${folderState === 'missing' ? 'ysd-c-red' : 'ysd-c-amber'}` }, t(folderState === 'missing' ? 'folderUnavailable' : 'folderPermission')) : null),
      pickerHost || dirHandle ? pChange : null,
    ].filter(Boolean));
  }

  // ---------- page lifecycle ----------
  async function loadInfo(force) {
    const vid = state.vid;
    state.loading = true;
    state.err = null;
    if (pop.el && pop.build !== folderPop) renderPopover();
    try {
      let info;
      try {
        info = await getInfo(vid, { force: !!force });
      } catch (e) {
        // YouTube refused this browser's anonymous request, but not because the video is gone: maybe
        // it is only for signed-in, eligible viewers (age restricted, members only). The app checks
        // with this browser's sign-in and lists the formats.
        if (!(e.refused?.length && e.refused.some((st) => st !== 'ERROR') && dmOn())) throw e;
        info = await dmAuthInfo(vid, e);
      }
      if (state.vid === vid) state.info = info;
    } catch (e) {
      console.debug('[YSD] could not load formats', e);
      if (state.vid === vid) state.err = errInfo(e, 'errFormats');
    }
    if (state.vid === vid) {
      state.loading = false;
      if (pop.el && ![settingsMenu, helpMenu, viewMenu, folderPop].includes(pop.build)) renderPopover();
    }
  }

  function mount() {
    const vid = videoId();
    if (docPip && !onShorts()) closeDocPip();
    armShortsInput(!!vid && onShorts() && !settings.barHidden);
    if (!vid) {
      if (focusOn) setFocus(false);
      unmountBar();
      unmountShorts();
      state.vid = null;
      updateFab();
      return;
    }
    const shorts = onShorts();
    if (shorts && focusOn) setFocus(false); // Big Picture is for the watch page
    const flexy = document.querySelector('ytd-watch-flexy');
    if (flexy && !flexy.dataset.ysdObserved) {
      flexy.dataset.ysdObserved = '1';
      flexyObserver.observe(flexy, { attributes: true, attributeFilter: ['fullscreen', 'theater'] });
    }
    if (shorts && !settings.barHidden && shortsHist.cur !== vid) noteShortVisit(vid);
    if (settings.barHidden) { unmountBar(); unmountShorts(); updateFab(); return; }
    if (state.vid !== vid) {
      if (loopedVideo) loopedVideo.loop = false;
      loopedVideo = null;
      Object.assign(state, { vid, info: null, err: null, clip: null, loading: false });
      closePopover(true);
      clearTimeout(shortsLoad);
      // Shorts are flicked through: their formats are looked up once one stays a moment (or at the button).
      if (shorts) shortsLoad = setTimeout(() => { if (state.vid === vid) ensureInfo(); }, 700);
      if (shorts) shortsMediaKeys();
      else loadInfo();
      updateFocus(true);
    }
    // Back from the mini player to the video Big Picture was on for: on again, once YouTube has put the
    // player back into the page.
    if (bigPictureVid === vid) {
      setTimeout(() => {
        if (state.vid !== vid || focusOn || miniActive() || bigPictureVid !== vid) return;
        bigPictureVid = null;
        setFocus(true);
      }, 400);
    } else if (bigPictureVid) {
      bigPictureVid = null; // a different video: Big Picture stays off
    }
    updateFab();
    if (shorts) {
      unmountBar();
      mountShorts();
      fixShortSlot();
      checkShortFit();
      return;
    }
    unmountShorts();
    if (bar?.isConnected) return;
    const anchor = document.querySelector('ytd-watch-flexy #below');
    if (!anchor) return;
    bar = h('div', { id: 'ysd-bar', class: 'ysd-ui', role: 'toolbar' });
    anchor.prepend(bar);
    barMode = '';
    layoutBar(true);
    barRO.observe(bar);
  }

  // Commands from the extension's popup for this tab (formerly the userscript manager's menu).
  chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (sender.id !== chrome.runtime.id || !msg) return;
    if (msg.type === 'showToolbar') {
      settings.barHidden = false;
      saveSettings();
      mount();
      reply({ ok: true });
    } else if (msg.type === 'openHistory') {
      openPanel();
      reply({ ok: true });
    } else if (msg.type === 'state') {
      reply({ vid: state.vid, toolbar: !settings.barHidden, active: jobs.size + (DM.token ? DM.jobs.filter((j) => DM_ACTIVE.has(j.status)).length : 0) });
    }
  });

  // Settings changed in the options page (or another tab) apply right away.
  onValueChange('settings', (_k, _o, value, remote) => {
    if (!remote || !value) return;
    const lang = settings.lang;
    Object.assign(settings, value);
    if (settings.lang !== lang) {
      applyLang();
      layoutBar(true);
      if (dockbar) buildDockbar();
    }
    if (settings.barHidden) unmountBar();
    mount();
    renderPanel();
    updateFab();
  });
  onValueChange('dmToken', (_k, _o, value, remote) => {
    if (!remote) return;
    DM.token = value || '';
    DM.state = DM.token ? 'unknown' : 'unpaired';
    if (DM.token) dmHello();
    renderPanel();
    updateFab();
  });
  // Finds the app (and a setup waiting to connect); picks up downloads still running in it.
  dmHello().then((up) => {
    if (up && dmOn() && DM.jobs.some((j) => DM_BUSY.has(j.status))) dmSync();
    if (up) dmPlaybackTick(); // a video that started playing before this script ran
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (pop.dropdown) closeDropdown();
    else if (pop.el) closePopover(true);
    else if (panelOpen()) closePanel();
    else if (focusOn && !isFullscreen()) setFocus(false);
  });
  let rafPending = false;
  addEventListener('scroll', () => {
    hideTip();
    if (!pop.el || rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      closeDropdown();
      if (pop.anchor?.isConnected) placePopover();
    });
  }, { passive: true });
  addEventListener('resize', (e) => {
    if (!e.isTrusted) return; // our own nudge for YouTube's player after docking
    hideTip();
    closeDropdown();
    placePopover();
    if (panelOpen()) placePanel();
    if (focusOn) updateFocus();
    if (shortsBox) fitShorts();
    if (onShorts()) setTimeout(checkShortFit, 300); // YouTube resizes the video after the player
  });
  // A folder on a removable drive may come back (or disappear) while the tab is in the background.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && dirHandle) refreshFolderState(); });
  document.addEventListener('yt-navigate-finish', () => { mount(); setTimeout(mount, 50); });
  setInterval(mount, 1000); // #below can be recreated after navigation
  mount();
})();
