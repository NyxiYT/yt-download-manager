// Toolbar button popup: the two commands the userscript manager's menu used to offer (show the
// download toolbar, open the download history) for the current YouTube tab, the Download Manager's
// state, and a way into the settings.
const ICONS = {
  toolbar: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-6h14v6zm0-8H5V5h14v6z',
  history: 'M13.26 3C8.17 2.86 4 6.95 4 12H2.21c-.45 0-.67.54-.35.85l2.79 2.8c.2.2.51.2.71 0l2.79-2.8a.5.5 0 0 0-.36-.85H6c0-3.9 3.18-7.05 7.1-7 3.72.05 6.85 3.18 6.9 6.9.05 3.91-3.1 7.1-7 7.1-1.61 0-3.1-.55-4.28-1.48a.994.994 0 0 0-1.32.08c-.42.42-.39 1.12.08 1.48A8.858 8.858 0 0 0 13 21c5.05 0 9.14-4.17 9-9.26-.13-4.69-4.05-8.61-8.74-8.74zm-.51 5c-.41 0-.75.34-.75.75v3.68c0 .35.19.68.49.86l3.12 1.85c.36.21.82.09 1.03-.26.21-.36.09-.82-.26-1.03l-2.88-1.71v-3.4c0-.4-.34-.74-.75-.74z',
};

function icon(name) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', ICONS[name]);
  svg.append(p);
  return svg;
}

function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  e.append(...kids.filter((k) => k != null));
  return e;
}

(async () => {
  const { settings = {} } = await chrome.storage.local.get('settings');
  const lang = YSD_PICK_LANG(settings.lang || 'auto');
  const T = (key, vars) => YSD_TR(lang, key, vars);
  document.documentElement.lang = lang;
  document.getElementById('version').textContent = chrome.runtime.getManifest().version;
  const settingsBtn = document.getElementById('settings');
  settingsBtn.textContent = T('settings');
  settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

  const main = document.getElementById('main');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const onYouTube = /^https:\/\/www\.youtube\.com\//.test(tab?.url || '');

  // Sends a command to the toolbar in this tab. A tab opened before the extension was installed (or
  // updated) has no toolbar yet: reload it, and the command applies after the reload.
  async function command(type) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type });
    } catch {
      if (type === 'showToolbar') {
        const next = { ...settings, barHidden: false };
        await chrome.storage.local.set({ settings: next });
      }
      await chrome.tabs.reload(tab.id);
    }
    window.close();
  }

  if (onYouTube) {
    main.append(
      el('button', { className: 'item', type: 'button', onclick: () => command('showToolbar') }, icon('toolbar'), el('span', {}, T('menuShowToolbar'))),
      el('button', { className: 'item', type: 'button', onclick: () => command('openHistory') }, icon('history'), el('span', {}, T('menuOpenHistory'))),
    );
  } else {
    main.append(
      el('p', { className: 'note' }, T('popNoYoutube')),
      el('button', { className: 'primary', type: 'button', onclick: () => { chrome.tabs.create({ url: 'https://www.youtube.com/' }); window.close(); } }, T('popOpenYoutube')),
    );
  }

  // Download Manager app: only mentioned once it has been connected.
  const dm = await chrome.runtime.sendMessage({ type: 'dmStatus' }).catch(() => null);
  if (dm?.token) {
    document.getElementById('dm').hidden = false;
    document.getElementById('dm-label').textContent = T('dmTitle');
    const st = document.getElementById('dm-state');
    st.textContent = dm.running && dm.paired ? T('dmConnectedHint') : T('dmNotRunning');
    st.classList.toggle('ok', dm.running && dm.paired);
  }
})();
