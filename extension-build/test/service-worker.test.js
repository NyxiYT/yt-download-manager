// Checks the extension's service worker against a pretend app on 127.0.0.1: the app has to prove itself
// (see proveApp) before it is paired with and before it gets the YouTube sign-in. Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const CODE = fs.readFileSync(path.join(ROOT, 'extension', 'background', 'service-worker.js'), 'utf8');
const V = JSON.parse(fs.readFileSync(path.join(ROOT, 'manager', 'Tests', 'Fixtures', 'proof-vectors.json'), 'utf8'));

const hmac = (keyHex, text) => crypto.createHmac('sha256', Buffer.from(keyHex, 'hex')).update(text).digest('hex');
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

const COOKIES = ['LOGIN_INFO', 'SAPISID', '__Secure-3PAPISID', 'SID', 'HSID', 'SSID', '__Secure-3PSID', 'PREF', 'VISITOR_INFO1_LIVE', 'YSC', 'SIDCC']
  .map((name) => ({ name, value: `v-${name}`, domain: '.youtube.com', hostOnly: false, path: '/', secure: true, session: false, expirationDate: 2000000000 }));

// One service worker with its own fake browser and app. `app`: what the app on the port is like.
//   key: its install key (hex) or null; tokens: the tokens it knows; proofs: false for an app from before them;
//   lie: a program that answers with made-up proofs; port: the port it computes its proofs for.
// `ext`: what the extension has: key (app-key.json) or null, and its storage.
function load({ app = {}, ext = {} } = {}) {
  const store = { dmPort: 17724, ...ext.storage };
  const requests = [];
  const listeners = [];
  const event = () => ({ addListener() {}, removeListener() {}, hasListener: () => false });
  const chrome = {
    runtime: {
      id: 'self', onMessage: { addListener: (fn) => listeners.push(fn) }, onInstalled: event(), onStartup: event(),
      getURL: (p) => `chrome-extension://self/${p}`, getManifest: () => ({ version: '6.13.0' }), reload() {},
    },
    storage: {
      local: {
        get: async (keys) => Object.fromEntries([].concat(keys).filter((k) => k in store).map((k) => [k, store[k]])),
        set: async (o) => { Object.assign(store, o); },
        remove: async (k) => { delete store[k]; },
      },
    },
    cookies: { getAll: async () => COOKIES },
    tabs: { onRemoved: event(), onUpdated: event(), query: async () => [] },
    management: { getSelf: async () => ({ installType: 'development' }) },
  };
  const json = (body, status = 200) => ({ ok: status < 300, status, json: async () => body });
  async function fetch(url, opts = {}) {
    if (url === 'chrome-extension://self/app-key.json') {
      if (!ext.key) throw new TypeError('Failed to fetch');
      return json({ key: ext.key });
    }
    const u = new URL(url);
    requests.push({ path: u.pathname, query: u.search, token: opts.headers?.['X-YDM-Token'] || '', body: opts.body ? JSON.parse(opts.body) : null });
    const tokens = app.tokens || [];
    switch (u.pathname) {
      case '/v1/hello': {
        const hello = { app: 'ytdm', version: '1.12.0', port: 17724, paired: tokens.includes(opts.headers?.['X-YDM-Token']) };
        const nonce = u.searchParams.get('nonce');
        if (nonce && app.proofs !== false) {
          const text = `${nonce}|${app.port || 17724}`;
          hello.tokenProofs = app.lie ? [crypto.randomBytes(32).toString('hex')] : tokens.map((t) => hmac(sha256(t), text));
          if (app.lie) hello.proof = crypto.randomBytes(32).toString('hex');
          else if (app.key) hello.proof = hmac(app.key, text);
        }
        return json(hello);
      }
      case '/v1/pair': return json({ token: 'new-token', port: 17724 });
      case '/v1/session': return json({ ok: true });
      default: return json({ ok: true });
    }
  }
  const navigator = { userAgent: 'Chrome/140', userAgentData: { brands: [{ brand: 'Google Chrome' }] } };
  const api = new Function('chrome', 'fetch', 'navigator', `${CODE}\nreturn { hmacHex, tokenKey };`)(chrome, fetch, navigator);
  const send = (msg) => new Promise((resolve) => listeners[0](msg, { id: 'self' }, resolve));
  const sent = (p) => requests.filter((r) => r.path === p);
  return { api, send, sent, store, requests };
}

const KEY = V.key;
const OTHER_KEY = 'ff'.repeat(32);

test('the HMAC matches the vectors the app is tested against', async () => {
  const { api } = load();
  const text = `${V.nonce}|${V.port}`;
  const key = Uint8Array.from(Buffer.from(V.key, 'hex'));
  assert.equal(await api.hmacHex(key, text), V.proof);
  assert.equal(await api.hmacHex(key, `${V.nonce}|17725`), V.otherPortProof);
  const tk = await api.tokenKey(V.token);
  assert.equal(Buffer.from(tk).toString('hex'), V.tokenHash);
  assert.equal(await api.hmacHex(tk, text), V.tokenProof);
});

test('the sign-in goes to an app that proves itself, and only the cookies it needs', async () => {
  const { send, sent } = load({ app: { key: KEY, tokens: ['tok'] }, ext: { key: KEY, storage: { dmToken: 'tok' } } });
  const r = await send({ type: 'dmSession' });
  assert.equal(r.ok, true);
  const s = sent('/v1/session');
  assert.equal(s.length, 1);
  assert.equal(s[0].token, 'tok');
  const names = s[0].body.cookies.trim().split('\n').slice(1).map((l) => l.split('\t')[5]);
  assert.deepEqual(names.sort(), ['HSID', 'LOGIN_INFO', 'PREF', 'SAPISID', 'SID', 'SSID', '__Secure-3PAPISID', '__Secure-3PSID']);
  // The hello that checked the proof carried no token.
  assert.ok(sent('/v1/hello').every((h) => h.token === ''));
});

for (const [name, app, ext] of [
  ['made-up proofs', { lie: true, tokens: ['tok'] }, { key: KEY }],
  ['a different install key', { key: OTHER_KEY, tokens: ['tok'] }, { key: KEY }],
  ['proofs passed on from the app on another port', { key: KEY, tokens: ['tok'], port: 17725 }, { key: KEY }],
  ['an app from before the proofs', { proofs: false, tokens: ['tok'] }, { key: null }],
  ['no install key and a token the app doesn\'t prove', { key: KEY, tokens: [] }, { key: null }],
]) {
  test(`no sign-in for ${name}`, async () => {
    const { send, sent } = load({ app, ext: { ...ext, storage: { dmToken: 'tok' } } });
    const r = await send({ type: 'dmSession' });
    assert.equal(r.ok, false);
    assert.equal(sent('/v1/session').length, 0);
  });
}

test('without an install key, a token the app proves is enough (the pairing was trusted)', async () => {
  const { send, sent, store } = load({ app: { key: KEY, tokens: ['tok'] }, ext: { key: null, storage: { dmToken: 'tok' } } });
  assert.equal((await send({ type: 'dmSession' })).ok, true);
  assert.equal(sent('/v1/session').length, 1);
  assert.equal(store.dmVerified, true);
});

test('no pairing with a program that fails the proof', async () => {
  const { send, sent, store } = load({ app: { key: OTHER_KEY }, ext: { key: KEY } });
  assert.equal((await send({ type: 'dmAutoConnect' })).ok, false);
  assert.equal(sent('/v1/pair').length, 0);
  assert.equal(store.dmToken, undefined);
});

test('pairing with the app that proves itself', async () => {
  const { send, sent, store } = load({ app: { key: KEY }, ext: { key: KEY } });
  assert.equal((await send({ type: 'dmAutoConnect' })).ok, true);
  assert.equal(sent('/v1/pair').length, 1);
  assert.equal(store.dmToken, 'new-token');
});

test('an app from before the proofs still gets downloads, with the token', async () => {
  const { send, sent } = load({ app: { proofs: false, tokens: ['tok'] }, ext: { key: null, storage: { dmToken: 'tok' } } });
  const st = await send({ type: 'dmStatus' });
  assert.equal(st.running, true);
  assert.equal(st.paired, true);
  assert.equal((await send({ type: 'dmClear' })).ok, true);
  assert.equal(sent('/v1/jobs/clear').length, 1);
});

test('once the app proved itself, one without proofs counts as not running', async () => {
  const { send, sent } = load({ app: { proofs: false, tokens: ['tok'] }, ext: { key: null, storage: { dmToken: 'tok', dmVerified: true } } });
  assert.equal((await send({ type: 'dmStatus' })).running, false);
  assert.equal((await send({ type: 'dmClear' })).ok, false);
  assert.ok(sent('/v1/hello').every((h) => h.token === ''), 'the token went to it');
  assert.equal(sent('/v1/jobs/clear').length, 0);
});

test('with an install key, an app without proofs counts as not running', async () => {
  const { send, sent } = load({ app: { proofs: false, tokens: ['tok'] }, ext: { key: KEY, storage: { dmToken: 'tok' } } });
  assert.equal((await send({ type: 'dmStatus' })).running, false);
  assert.equal((await send({ type: 'dmAutoConnect' })).ok, false);
  assert.ok(sent('/v1/hello').every((h) => h.token === ''));
});
