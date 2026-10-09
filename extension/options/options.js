// Options page: the settings the toolbar keeps in chrome.storage.local (the same values its settings
// menu on YouTube changes), the Download Manager connection, and the download history. Open YouTube
// tabs pick up every change right away.
const $ = (id) => document.getElementById(id);

// Only the changed fields are written, so values the toolbar keeps in the same object (last chosen
// formats and so on) are never overwritten with stale ones.
async function saveSettings(patch) {
  const { settings = {} } = await chrome.storage.local.get('settings');
  await chrome.storage.local.set({ settings: { ...settings, ...patch } });
}

let statusTimer = 0;
function showStatus(text) {
  const s = $('status');
  s.textContent = text;
  s.classList.add('show');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => s.classList.remove('show'), 2400);
}

(async () => {
  let { settings = {} } = await chrome.storage.local.get('settings');
  const { history = [], dmJobs = [] } = await chrome.storage.local.get(['history', 'dmJobs']);
  const lang = YSD_PICK_LANG(settings.lang || 'auto');
  const T = (key, vars) => YSD_TR(lang, key, vars);
  document.documentElement.lang = lang;
  document.title = `YT Standalone Downloader · ${T('settings')}`;
  $('version').textContent = chrome.runtime.getManifest().version;

  // General
  $('h-general').textContent = T('optGeneral');
  $('l-language').textContent = T('language');
  const sel = $('language');
  sel.append(new Option(`${T('languageAuto')} (${YSD_LANG_NAMES[YSD_PICK_LANG('auto')]})`, 'auto'));
  for (const [code, name] of Object.entries(YSD_LANG_NAMES)) sel.append(new Option(name, code));
  sel.value = YSD_I18N[settings.lang] ? settings.lang : 'auto';
  sel.addEventListener('change', async () => {
    await saveSettings({ lang: sel.value });
    location.reload(); // show this page in the new language too
  });

  $('l-toolbar').textContent = T('optShowToolbar');
  $('toolbar').addEventListener('change', (e) => saveSettings({ barHidden: !e.target.checked }));
  $('l-autoopen').textContent = T('autoOpenHistory');
  $('autoopen').addEventListener('change', (e) => saveSettings({ autoOpenPanel: e.target.checked }));

  // Download Manager: one switch. While it is on, the extension connects to the app on its own.
  $('h-dm').textContent = T('dmTitle');
  $('dm-hint').textContent = T('optDmHint');
  $('l-dm-use').textContent = T('optDmUse');
  async function showDm() {
    const dm = await chrome.runtime.sendMessage({ type: 'dmStatus' }).catch(() => null);
    const connected = !!dm?.token && settings.useManager !== false;
    const ok = connected && dm.running && dm.paired;
    $('dm-state-text').textContent = !connected ? T('optDmNotConnected') : ok ? T('dmConnectedHint') : T('dmNotRunning');
    $('dm-state').className = `pill ${ok ? 'ok' : connected ? 'wait' : ''}`;
    $('dm-version').textContent = dm?.running && dm.version ? `YT Download Manager ${dm.version}` : '';
  }
  $('dm-use').addEventListener('change', async (e) => {
    settings.useManager = e.target.checked;
    await saveSettings({ useManager: e.target.checked });
    if (e.target.checked) await chrome.runtime.sendMessage({ type: 'dmAutoConnect' }).catch(() => {});
    showDm();
  });

  // History
  $('h-history').textContent = T('history');
  $('history-clear').textContent = T('clearFinished');
  const finished = (jobs) => jobs.filter((j) => !['queued', 'downloading', 'processing', 'paused'].includes(j.status));
  const showCount = (n) => {
    $('history-count').textContent = n ? T('nFinished', { n }) : T('noDownloads');
    $('history-clear').disabled = !n;
  };
  let counts = { history: history.length, dm: finished(dmJobs).length };
  $('history-clear').addEventListener('click', async () => {
    const { dmJobs: current = [] } = await chrome.storage.local.get('dmJobs');
    await chrome.storage.local.set({ history: [], dmJobs: current.filter((j) => !finished([j]).length) });
    await chrome.runtime.sendMessage({ type: 'dmClear' }).catch(() => {});
    showStatus(T('optHistoryCleared'));
  });

  // Everything here mirrors what the toolbar on YouTube changes, and follows it live.
  function show() {
    $('toolbar').checked = !settings.barHidden;
    $('autoopen').checked = !!settings.autoOpenPanel;
    $('dm-use').checked = settings.useManager !== false;
    showCount(counts.history + counts.dm);
    showDm();
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.settings) {
      const next = changes.settings.newValue || {};
      if ((next.lang || 'auto') !== (settings.lang || 'auto')) { location.reload(); return; }
      settings = next;
    }
    if (changes.history) counts.history = (changes.history.newValue || []).length;
    if (changes.dmJobs) counts.dm = finished(changes.dmJobs.newValue || []).length;
    if (changes.settings || changes.history || changes.dmJobs || changes.dmToken) show();
  });
  show();

  // About
  $('h-about').textContent = T('optAbout');
  $('about').textContent = T('optAboutText');
})();
