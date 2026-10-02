// Runs in YouTube's own JavaScript world (the manifest's "world": "MAIN") and answers the content
// script's few questions that only YouTube's scripts can: its config (visitor data), the player's
// caption list, the Appearance switch, opening a Short, and the picture-in-picture window's previous and
// next buttons on Shorts. Requests and answers are JSON strings in DOM events, which both worlds see
// synchronously. Only the operations below exist; nothing else is reachable.
(() => {
  // YouTube removes the picture-in-picture window's previous and next buttons for every Short. On Shorts
  // pages they stay and tell the content script, which picks the Short ('ysd-media': 'prev' or 'next').
  const media = navigator.mediaSession;
  const setAction = media?.setActionHandler?.bind(media);
  const onShorts = () => location.pathname.startsWith('/shorts/');
  const ours = {
    nexttrack: () => document.dispatchEvent(new CustomEvent('ysd-media', { detail: 'next' })),
    previoustrack: () => document.dispatchEvent(new CustomEvent('ysd-media', { detail: 'prev' })),
  };
  if (setAction) media.setActionHandler = (action, handler) => setAction(action, !handler && ours[action] && onShorts() ? ours[action] : handler);

  const ops = {
    ytcfg: (key) => window.ytcfg?.get?.(String(key)),
    captions: () => document.querySelector(location.pathname.startsWith('/shorts/') ? '#shorts-player' : '#movie_player')
      ?.getPlayerResponse?.()?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [],
    shortsMediaKeys: () => {
      if (!setAction || !onShorts()) return false;
      for (const [action, fn] of Object.entries(ours)) {
        try { setAction(action, fn); } catch { /* not supported here */ }
      }
      return true;
    },
    // YouTube's own navigation to a Short (also in a tab in the background, where its arrows don't work).
    openShort: (vid) => {
      if (!/^[\w-]{11}$/.test(String(vid))) return false;
      document.querySelector('ytd-app')?.dispatchEvent(new CustomEvent('yt-navigate', { bubbles: true, composed: true, detail: { endpoint: {
        commandMetadata: { webCommandMetadata: { url: `/shorts/${vid}`, webPageType: 'WEB_PAGE_TYPE_SHORTS', rootVe: 37414 } },
        reelWatchEndpoint: { videoId: vid },
      } } }));
      return true;
    },
    // Same signal YouTube's Appearance menu sends; YouTube then reloads the page itself.
    ytAction: (detail) => {
      if (!/^yt-signal-action-toggle-dark-theme-(on|off|device)$/.test(detail?.actionName || '')) return false;
      document.querySelector('ytd-app')?.dispatchEvent(new CustomEvent('yt-action', { bubbles: true, composed: true, detail }));
      return true;
    },
  };

  document.addEventListener('ysd-page-request', (e) => {
    let out = null;
    try {
      const { op, args } = JSON.parse(e.detail);
      if (Object.prototype.hasOwnProperty.call(ops, op)) out = ops[op](...(Array.isArray(args) ? args : []));
    } catch {
      out = null;
    }
    document.dispatchEvent(new CustomEvent('ysd-page-response', { detail: JSON.stringify(out === undefined ? null : out) }));
  });
})();
