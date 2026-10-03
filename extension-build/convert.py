"""Builds the extension's content script, stylesheet and translations from the userscript.

The userscript stays the single source for the toolbar's logic; this script swaps the userscript
manager's APIs for extension ones and writes:
  extension/content/content.js   the toolbar (isolated content-script world)
  extension/content/content.css  its styles (formerly GM_addStyle)
  extension/content/i18n.js      translations shared with the popup and options page
Run: python convert.py
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'yt-standalone-downloader.user.js')
EXT = os.path.join(ROOT, 'extension')
VERSION = json.load(open(os.path.join(EXT, 'manifest.json'), encoding='utf-8'))['version']
NL = chr(10)

src = open(SRC, encoding='utf-8').read()
assert chr(13) not in src


def cut(text, start, end, inclusive=True):
    """Returns (before, block, after) around the first `start` ... following `end`."""
    i = text.index(start)
    j = text.index(end, i + len(start))
    k = j + len(end) if inclusive else j
    return text[:i], text[i:k], text[k:]


def rep(text, old, new, count=1):
    n = text.count(old)
    assert n == count, (n, old[:90])
    return text.replace(old, new)


# ---------- header ----------
body = src[src.index('// ==/UserScript==') + len('// ==/UserScript=='):].lstrip(NL)

# ---------- translations -> i18n.js ----------
before, names_line, after = cut(body, '  const LANG_NAMES = {', '};' + NL)
body = before + '  const LANG_NAMES = globalThis.YSD_LANG_NAMES;' + NL + after
before, i18n_block, after = cut(body, '  const I18N = {', NL + '  };' + NL)
body = before + '  const I18N = globalThis.YSD_I18N;' + NL + after

HELP5 = {
    'en': "Hid the toolbar? Click the extension's icon in the browser toolbar and choose “{cmd}”.",
    'de': "Leiste ausgeblendet? Klicke auf das Symbol der Erweiterung in der Browserleiste und wähle „{cmd}“.",
    'es': "¿Has ocultado la barra? Haz clic en el icono de la extensión en la barra del navegador y elige «{cmd}».",
    'fr': "Barre masquée ? Cliquez sur l'icône de l'extension dans la barre du navigateur et choisissez « {cmd} ».",
    'it': "Hai nascosto la barra? Fai clic sull'icona dell'estensione nella barra del browser e scegli «{cmd}».",
    'pt': "Ocultou a barra? Clique no ícone da extensão na barra do navegador e escolha “{cmd}”.",
    'pl': "Ukryto pasek? Kliknij ikonę rozszerzenia na pasku przeglądarki i wybierz „{cmd}”.",
    'ru': "Скрыли панель? Нажмите значок расширения на панели браузера и выберите «{cmd}».",
    'ja': "ツールバーを隠した場合は、ブラウザーのツールバーにある拡張機能のアイコンをクリックし、「{cmd}」を選んでください。",
    'zh': "隐藏了工具栏？点击浏览器工具栏中的扩展程序图标，然后选择“{cmd}”。",
}
HIDDEN = {
    'en': "Toolbar hidden. Bring it back with the extension's icon: “{cmd}”",
    'de': "Leiste ausgeblendet. Über das Symbol der Erweiterung zurückholen: „{cmd}“",
    'es': "Barra oculta. Vuelve a mostrarla desde el icono de la extensión: «{cmd}»",
    'fr': "Barre masquée. Réaffichez-la depuis l'icône de l'extension : « {cmd} »",
    'it': "Barra nascosta. Puoi ripristinarla dall'icona dell'estensione: «{cmd}»",
    'pt': "Barra oculta. Mostre-a novamente pelo ícone da extensão: “{cmd}”",
    'pl': "Pasek ukryty. Przywrócisz go ikoną rozszerzenia: „{cmd}”",
    'ru': "Панель скрыта. Вернуть её можно через значок расширения: «{cmd}»",
    'ja': "ツールバーを隠しました。拡張機能のアイコンの「{cmd}」で元に戻せます",
    'zh': "工具栏已隐藏。可通过扩展程序图标中的“{cmd}”恢复",
}
EXTRA_KEYS = ['popNoYoutube', 'popOpenYoutube', 'optGeneral', 'optShowToolbar', 'optDmHint', 'optDmDisconnect',
              'optDmNotConnected', 'optAbout', 'optAboutText', 'optHistoryCleared', 'optDmUse']
EXTRA = {
    'en': ["Open a YouTube video to use the download toolbar.", "Open YouTube", "General", "Show the download toolbar under videos",
           "With the YT Download Manager app installed, downloads are saved to a folder on your PC (your Downloads folder unless you pick another) and keep going when the tab is closed. The extension connects to the app on its own.",
           "Disconnect", "not connected", "About",
           "Everything runs on your PC. MP3 encoding uses lamejs (LGPL-3.0). FFmpeg (ffmpeg.wasm, GPL) is downloaded from jsDelivr the first time it's needed and kept in your browser.",
           "Download history cleared.", "Send downloads to the Download Manager"],
    'de': ["Öffne ein YouTube-Video, um die Download-Leiste zu nutzen.", "YouTube öffnen", "Allgemein", "Download-Leiste unter Videos anzeigen",
           "Ist die App YT Download Manager installiert, werden Downloads in einem Ordner auf deinem PC gespeichert (deinem Downloads-Ordner, wenn du keinen anderen wählst) und laufen weiter, wenn der Tab geschlossen wird. Die Erweiterung verbindet sich von selbst mit der App.",
           "Trennen", "nicht verbunden", "Info",
           "Alles läuft auf deinem PC. Die MP3-Umwandlung nutzt lamejs (LGPL-3.0). FFmpeg (ffmpeg.wasm, GPL) wird beim ersten Bedarf von jsDelivr geladen und im Browser gespeichert.",
           "Download-Verlauf gelöscht.", "Downloads an den Download-Manager senden"],
    'es': ["Abre un vídeo de YouTube para usar la barra de descargas.", "Abrir YouTube", "General", "Mostrar la barra de descargas debajo de los vídeos",
           "Con la app YT Download Manager instalada, las descargas se guardan en una carpeta de tu PC (tu carpeta de Descargas, salvo que elijas otra) y continúan aunque cierres la pestaña. La extensión se conecta a la app por sí sola.",
           "Desconectar", "no conectado", "Información",
           "Todo se ejecuta en tu PC. La conversión a MP3 usa lamejs (LGPL-3.0). FFmpeg (ffmpeg.wasm, GPL) se descarga de jsDelivr la primera vez que hace falta y se guarda en el navegador.",
           "Historial de descargas borrado.", "Enviar las descargas al Gestor de descargas"],
    'fr': ["Ouvrez une vidéo YouTube pour utiliser la barre de téléchargement.", "Ouvrir YouTube", "Général", "Afficher la barre de téléchargement sous les vidéos",
           "Avec l'application YT Download Manager installée, les téléchargements sont enregistrés dans un dossier de votre PC (votre dossier Téléchargements, sauf si vous en choisissez un autre) et continuent même si l'onglet est fermé. L'extension se connecte à l'application toute seule.",
           "Déconnecter", "non connecté", "À propos",
           "Tout s'exécute sur votre PC. La conversion MP3 utilise lamejs (LGPL-3.0). FFmpeg (ffmpeg.wasm, GPL) est téléchargé depuis jsDelivr la première fois qu'il est nécessaire et conservé dans le navigateur.",
           "Historique des téléchargements effacé.", "Envoyer les téléchargements au Gestionnaire de téléchargements"],
    'it': ["Apri un video di YouTube per usare la barra dei download.", "Apri YouTube", "Generale", "Mostra la barra dei download sotto i video",
           "Con l'app YT Download Manager installata, i download vengono salvati in una cartella del PC (la cartella Download, se non ne scegli un'altra) e continuano anche se chiudi la scheda. L'estensione si collega all'app da sola.",
           "Disconnetti", "non connesso", "Informazioni",
           "Tutto funziona sul tuo PC. La conversione in MP3 usa lamejs (LGPL-3.0). FFmpeg (ffmpeg.wasm, GPL) viene scaricato da jsDelivr la prima volta che serve e conservato nel browser.",
           "Cronologia dei download cancellata.", "Invia i download al Gestore download"],
    'pt': ["Abra um vídeo do YouTube para usar a barra de downloads.", "Abrir o YouTube", "Geral", "Mostrar a barra de downloads abaixo dos vídeos",
           "Com o app YT Download Manager instalado, os downloads são salvos em uma pasta do seu PC (sua pasta Downloads, a menos que você escolha outra) e continuam mesmo com a aba fechada. A extensão se conecta ao app sozinha.",
           "Desconectar", "não conectado", "Sobre",
           "Tudo roda no seu PC. A conversão para MP3 usa lamejs (LGPL-3.0). O FFmpeg (ffmpeg.wasm, GPL) é baixado do jsDelivr na primeira vez que for necessário e fica guardado no navegador.",
           "Histórico de downloads apagado.", "Enviar downloads para o Gerenciador de downloads"],
    'pl': ["Otwórz film w YouTube, aby korzystać z paska pobierania.", "Otwórz YouTube", "Ogólne", "Pokazuj pasek pobierania pod filmami",
           "Gdy aplikacja YT Download Manager jest zainstalowana, pobrane pliki trafiają do folderu na komputerze (do folderu Pobrane, chyba że wybierzesz inny), a pobieranie trwa nawet po zamknięciu karty. Rozszerzenie łączy się z aplikacją samo.",
           "Rozłącz", "nie połączono", "Informacje",
           "Wszystko działa na Twoim komputerze. Konwersja do MP3 używa lamejs (LGPL-3.0). FFmpeg (ffmpeg.wasm, GPL) jest pobierany z jsDelivr przy pierwszym użyciu i przechowywany w przeglądarce.",
           "Historia pobierania wyczyszczona.", "Wysyłaj pobieranie do Menedżera pobierania"],
    'ru': ["Откройте видео на YouTube, чтобы пользоваться панелью загрузки.", "Открыть YouTube", "Общие", "Показывать панель загрузки под видео",
           "Если установлено приложение YT Download Manager, файлы сохраняются в папку на компьютере (в папку «Загрузки», если не выбрать другую), а загрузка продолжается даже после закрытия вкладки. Расширение подключается к приложению само.",
           "Отключить", "не подключён", "О расширении",
           "Всё работает на вашем компьютере. Для MP3 используется lamejs (LGPL-3.0). FFmpeg (ffmpeg.wasm, GPL) загружается с jsDelivr при первой необходимости и хранится в браузере.",
           "История загрузок очищена.", "Передавать загрузки Менеджеру загрузок"],
    'ja': ["ダウンロードツールバーを使うには YouTube の動画を開いてください。", "YouTube を開く", "全般", "動画の下にダウンロードツールバーを表示",
           "YT Download Manager アプリがインストールされていると、ダウンロードは PC 上のフォルダー（別のフォルダーを選ばない限り「ダウンロード」フォルダー）に保存され、タブを閉じても続きます。拡張機能はアプリに自動で接続します。",
           "接続を解除", "未接続", "このアプリについて",
           "すべて PC 上で動作します。MP3 変換には lamejs (LGPL-3.0) を使用します。FFmpeg (ffmpeg.wasm、GPL) は初めて必要になったときに jsDelivr からダウンロードされ、ブラウザーに保存されます。",
           "ダウンロード履歴を消去しました。", "ダウンロードをダウンロードマネージャーに送る"],
    'zh': ["打开一个 YouTube 视频即可使用下载工具栏。", "打开 YouTube", "常规", "在视频下方显示下载工具栏",
           "安装 YT Download Manager 应用后，下载内容会保存到电脑上的文件夹（除非另选，否则为“下载”文件夹），即使关闭标签页也会继续下载。扩展程序会自动连接到该应用。",
           "断开连接", "未连接", "关于",
           "一切都在你的电脑上运行。MP3 转换使用 lamejs（LGPL-3.0）。FFmpeg（ffmpeg.wasm，GPL）会在首次需要时从 jsDelivr 下载并保存在浏览器中。",
           "下载历史已清除。", "将下载交给下载管理器"],
}
ORDER = ['en', 'de', 'es', 'fr', 'it', 'pt', 'pl', 'ru', 'ja', 'zh']
js = lambda v: json.dumps(v, ensure_ascii=True)

lines = i18n_block.split(NL)
out, lang_i, seen_help, seen_hidden = [], -1, 0, 0
for ln in lines:
    m = re.match(r'^    ([a-z]{2}): \{$', ln)
    if m:
        lang_i += 1
        assert m.group(1) == ORDER[lang_i], m.group(1)
    if ln.startswith('      help5: '):
        ln = '      help5: ' + js(HELP5[ORDER[lang_i]]) + ','
        seen_help += 1
    elif ln.startswith('      toolbarHidden: '):
        ln = '      toolbarHidden: ' + js(HIDDEN[ORDER[lang_i]]) + ','
        seen_hidden += 1
    out.append(ln)
    if ln.startswith('      errEngineMissing: '):
        for k, v in zip(EXTRA_KEYS, EXTRA[ORDER[lang_i]]):
            out.append('      ' + k + ': ' + js(v) + ',')
assert seen_help == 10 and seen_hidden == 10 and lang_i == 9
i18n_block = NL.join(out)
dedent = lambda t: NL.join(l[2:] if l.startswith('  ') else l for l in t.split(NL))
i18n_js = (
    "// Interface text in 10 languages, shared by the content script, the popup and the options page.\n"
    "// Add a language by adding an object with the same keys; missing keys fall back to English. A value\n"
    "// can be a plain string or plural forms ({ one, few, many, other }) chosen with {n}.\n"
    + dedent(names_line).replace('const LANG_NAMES =', 'globalThis.YSD_LANG_NAMES =', 1)
    + dedent(i18n_block).replace('const I18N =', 'globalThis.YSD_I18N =', 1) + NL
    + r"""
// Picks the language for a stored preference ('auto' or a code): YouTube's/the browser's language.
globalThis.YSD_PICK_LANG = (pref, extra = []) => {
  if (globalThis.YSD_I18N[pref]) return pref;
  for (const c of [...extra, ...(navigator.languages || [navigator.language])]) {
    const base = String(c || '').toLowerCase().split('-')[0];
    if (globalThis.YSD_I18N[base]) return base;
  }
  return 'en';
};

globalThis.YSD_TR = (lang, key, vars) => {
  const I = globalThis.YSD_I18N;
  let s = I[lang]?.[key] ?? I.en[key] ?? key;
  if (typeof s === 'object') s = s[new Intl.PluralRules(lang === 'zh' ? 'zh-CN' : lang).select(vars?.n ?? 0)] ?? s.other;
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : s;
};
""")

# ---------- styles -> content.css ----------
before, style_block, after = cut(body, '  GM_addStyle(`', NL + '  `);' + NL)
body = before + '  // Styles: content/content.css (added to the page by the manifest).' + NL + after
css = style_block[len('  GM_addStyle(`'):-len(NL + '  `);' + NL)]
css = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), css)
css = css.replace('\\`', '`').replace('\\\\', '\\')
assert '${' not in css
css = dedent(dedent(css.strip(NL)))
css_out = ("/* YT Standalone Downloader: toolbar, pickers, history panel and Big Picture on YouTube.\n"
           "   Colors follow YouTube's own theme attribute (html[dark]). */\n" + css + NL)

# ---------- runtime shim ----------
SHIM = r"""
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
"""

HEAD = ("// YT Standalone Downloader: the download toolbar under YouTube videos, its pickers, the history\n"
        "// panel and Big Picture. Runs as the extension's content script on www.youtube.com (isolated world).\n"
        "// Generated from yt-standalone-downloader.user.js by extension-build/convert.py.\n")

body = rep(body, "(() => {" + NL + "  'use strict';" + NL, "(async () => {" + NL + "  'use strict';" + NL + SHIM)
body = rep(body, "  const pageWin = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;" + NL, "")
body = re.sub(r"const VERSION = '[^']*';", "const VERSION = chrome.runtime.getManifest().version;", body, count=1)

# YouTube's page scripts
body = rep(body, "    try { return pageWin.ytcfg?.get?.(key); } catch { return undefined; }", "    return page('ytcfg', key);")
b, block, a = cut(body, "  function pageCaptions() {", NL + "  }" + NL)
body = b + "  function pageCaptions() {" + NL + "    return page('captions') || [];" + NL + "  }" + NL + a
body = rep(body, "const pickerHost = typeof pageWin.showDirectoryPicker === 'function' ? pageWin : typeof window.showDirectoryPicker === 'function' ? window : null;",
           "const pickerHost = typeof window.showDirectoryPicker === 'function' ? window : null;")
b, block, a = cut(body, "  function pipWindowBounds(match, to, animate) {", NL + "  }" + NL)
body = b + ("  function pipWindowBounds(match, to, animate) {" + NL +
            "    return send({ type: 'pipBounds', match, to, animate }).then((r) => !!r?.ok, () => null);" + NL + "  }" + NL) + a
b, block, a = cut(body, "  function pipNative(info) {", NL + "  }" + NL)
body = b + ("  function pipNative(info) {" + NL +
            "    return send({ type: 'pipNative', info }).then((r) => !!r?.ok, () => null);" + NL + "  }" + NL) + a
b, block, a = cut(body, "  function extensionOnDisk(version) {}" + NL, "")
body = b + ("  function extensionOnDisk(version) {" + NL +
            "    if (!version || version === extensionOnDisk.seen) return;" + NL + "    extensionOnDisk.seen = version;" + NL +
            "    send({ type: 'extOnDisk', version }).catch(() => {});" + NL + "  }" + NL) + a
b, block, a = cut(body, "  function openShort(vid) {", NL + "  }" + NL)
body = b + "  function openShort(vid) {" + NL + "    page('openShort', vid);" + NL + "  }" + NL + a
b, block, a = cut(body, "  let mediaKeysHooked = false;" + NL, NL + "  }" + NL + NL)
body = b + ("  function shortsMediaKeys() {" + NL + "    page('shortsMediaKeys');" + NL + "  }" + NL +
            "  document.addEventListener('ysd-media', (e) => shortsStep(e.detail === 'prev' ? -1 : 1));" + NL + NL) + a
b, block, a = cut(body, "    const detail = pageWin.JSON.parse(JSON.stringify({", "composed: true, detail }));" + NL)
body = b + ("    page('ytAction', {" + NL +
            "      actionName: `yt-signal-action-toggle-dark-theme-${sig}`, optionalAction: false," + NL +
            "      args: [{ signalAction: { signal: `TOGGLE_DARK_THEME_${sig.toUpperCase()}` } }], returnValue: []," + NL +
            "    });" + NL) + a

# storage, requests
body = body.replace('GM_getValue(', 'getValue(').replace('GM_setValue(', 'setValue(').replace('GM_xmlhttpRequest(', 'bgRequest(')
b, block, a = cut(body, "  if (typeof GM_addValueChangeListener === 'function') {", NL + "  }" + NL)
body = b + ("  onValueChange('history', (_n, _o, value, remote) => { if (remote) { history = value || []; renderPanel(); } });" + NL +
            "  onValueChange('folderRev', (_n, _o, _v, remote) => { if (remote) reloadFolder(); });" + NL) + a
body = rep(body, "        const handler = (typeof GM_info !== 'undefined' && GM_info?.scriptHandler) || 'userscript';", "        const handler = 'extension';")

# menu -> popup messages; settings changed elsewhere
body = rep(body, "    registerMenu();" + NL + "    const reopen", "    const reopen")
b, block, a = cut(body, "  // Tampermonkey menu entries,", "  registerMenu();" + NL)
body = b + r"""  // Commands from the extension's popup for this tab (formerly the userscript manager's menu).
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
""" + a

# YouTube refuses stream and player requests that come from the service worker (its extension
# origin), so in the extension the page's own connection is the only route: no switching over.
body = rep(body, "  const noPage = () => { if (!net.pageOk && navigator.onLine !== false) net.page = false; };",
           "  const noPage = () => {}; // YouTube refuses the service worker's requests: the page's connection is the only route")
b, block, a = cut(body, "  function switchRoute(src) {", NL + "  }" + NL)
body = b + "  function switchRoute() {" + NL + "    return false; // see noPage" + NL + "  }" + NL + a

# The extension connects to the Download Manager app on its own (the app knows its fixed ID).
body = rep(body, "  const AUTO_CONNECT = false;", "  const AUTO_CONNECT = true;")

body = rep(body, "  const hostGone = () => false;", "  const hostGone = () => !alive();")
body = rep(body, "  const pushSession = () => Promise.resolve({ ok: false, signedIn: null });",
           "  const pushSession = () => send({ type: 'dmSession' }).then((r) => r || { ok: false, signedIn: null }, () => ({ ok: false, signedIn: null }));")

# comments that named the userscript manager
body = body.replace("userscript manager's request API is the fallback", "extension's service worker is the fallback")
body = body.replace("// The same through the userscript manager (fallback transport).", "// The same through the extension's service worker (fallback transport).")
body = body.replace("(page <-> userscript manager)", "(page <-> service worker)")
body = body.replace("fall through to the manager's request API", "fall through to the service worker")

left = re.findall(r'GM_\w+|unsafeWindow|pageWin|Tampermonkey', body)
assert not left, set(left)

os.makedirs(os.path.join(EXT, 'content'), exist_ok=True)
open(os.path.join(EXT, 'content', 'content.js'), 'w', encoding='utf-8', newline=NL).write(HEAD + body)
open(os.path.join(EXT, 'content', 'content.css'), 'w', encoding='utf-8', newline=NL).write(css_out)
open(os.path.join(EXT, 'content', 'i18n.js'), 'w', encoding='utf-8', newline=NL).write(i18n_js)
print('content.js', len(HEAD + body), 'content.css', len(css_out), 'i18n.js', len(i18n_js), 'version', VERSION)
