// ==UserScript==
// @name         YT Standalone Downloader
// @namespace    local.yt-standalone-dl
// @author       NyxiYT
// @homepageURL  https://github.com/NyxiYT/yt-download-manager
// @supportURL   https://github.com/NyxiYT/yt-download-manager/issues
// @updateURL    https://github.com/NyxiYT/yt-download-manager/releases/latest/download/yt-standalone-downloader.user.js
// @downloadURL  https://github.com/NyxiYT/yt-download-manager/releases/latest/download/yt-standalone-downloader.user.js
// @license      MIT
// @version      6.10.0
// @description  Toolbar under the YouTube player and beside Shorts: video (up to 8K), MP3/M4A/Opus/WAV, thumbnails, subtitles, screenshots, clip trimming, resumable downloads, FFmpeg processing, a sticky focus mode and a movable history. Runs in your browser, or hands downloads to the optional YT Download Manager app to save them to any folder on your PC.
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAGHklEQVR42sWXa4xdVRXHf2vvc+67Mx3LQBVTsLSl1AkMRBGJpq1+MlGjiTQG0USIqU1DfEEQqQ6IpUSwIRib+gj4+KAWYzTBJkarlCak9GETSpu2QRJjmzLpdMbeuc9z7l7LD+femTtthYYWOcnOzdln7bv+a63/Xg94mx/pfzGQZ8C9lQoPgT0Ees6HbeD/X1ZvA29d4+d4YCNLhhW5TlGvmFxKpQ4xBxYjr3yTV473IiBj4B687TbZ/OxLjyyo5L40PD835M7FdokeY+JMWpuoJr+9suK+uubU4bog8IPitVtuWTR/3ehohVIpVkIA00vMNgEf0W533KGX6+w8Nvns1z5+/afk0WjpzYsuL764ZvXCjvfiklrDSbkChQKYXTrlSYJNV/Glonkvne27JuKXjtfWRIp8bOnCkvnYSXOy5uIPr8LfficSRRkAuchQdI0wEfSP20j+9Acpzi+7xe8s2sET1U9EIlrxzgnNNvKuRURf/jrkc5CmF6+8D4Q4h79rPe7VV+HYQZxzEomUIkGCmRCaCSy7Ago5qDfAuwz8xYZBJKNzmkA+Dwvfjb58ALMcIqKROSdYxjlNQ6bQOVQN5z14n6UopPt7ofmte0YD2gm4rjctTbscN8xMol6YtNMzVjAzXLmM1utUp/5DHMeoGSKCasD0fNwwBMF5n50XIe10KJeKxIOD2HQVAdQECbOOzQCood2bp6q4YpHnd+xkw9gmqtM1arUaThxBA5VKhairZK6nBTVjulrFOY+qUq6UKRYK3HfP3Xz6M5/EVMHAOpYZ4XoADDSABkO8J6nX+fbYJg4eOsLgwDzWrV/LRz66mn1797P58SdoNJvEUTwDQiQDDrD+7nUzsk9sfpITJ06yYWwTK299P++46j2EYNCXZpzrB6Ag3tM4U6XWaBJHno2bvst999/L0NAQ69av5adPbUWAXBwRd1c+nydJEh559HtzZH/8sy0UiwXaScrk5BTgsWAZB6yXoh2gXbeEbNd5TyftsGDBAj73+dvZ9pvfsXTZEr7/6OOsWr2SJUuuod5oIF0etNtthoeHueML58ouvmYx7VaLKIqY9bbNeqC3GXQWlQHeO5rNJlNTU1y3Yjkf/MCHGL1xlBAC09PTRFGEmWWEc5ns5OR5ZKvT+D7OmIL1haDLAUN7xADEDANazRYb7h/jR1uf5IXduwB4+MGNvHZynIHBAUIIAHjvqVarbPjWd9iy9Yezsg9tZHx8nEKhkBGwS3gLGXAR17sFGQdQwdKUecOXcdPoCL8+9k9+8fNf8eKevdw4OsrRo0fZt3c/5XKZUxOn52Q65xxPP/VL9uzZNyP7j/0HAGH0+hGuvHoRZgkgXWN7HnCZ6y3MJhAJgc2PPcyK5ct4bfwUaZLQbLW44b3XcuvNN80w/uw84Jyn2WzSarUYHVnOLe8bZWBehbvuvIN8Po9ZAFx25efmgewGUG8huRw0zjBYKfONB+7JPorr0sXeuEyL9MmG7GyjgTUaSHEeodGkmw5mSUhQyBdpHThM/ffbYf5lUC5h2smIpgHTtPuur7/myBqmHSjmkQVX0Hp+F42/74ZCCUsz/kQOUDM0GGrCqbHN1He8gJs/ACGclXLtAjqls2S6tcWaLRo7d6OtNlbIob1MKJhgZMSQrPBMb3+uG5O+nq5X1S6o8cqMOjs0rlzCohjtWNaCg0TmSIKaZZlQERGkXJkpaAZ4Eapph3pfVfvfpd8oeM9gLsoKWN83VcVSRZ0jBMywJFKVHeOt5IGrigUDLGAi3fs9c9CM47Um7aBv2KOYQeSEfKVE7OScAUAyGZ1oJb4Df/V/SU//62/R0EjJopFyFFmMBGeivRUjerqd6lQn1dg5FUHd6ywvaMdMPehQFKv0/ZczUVPsZKMdHW7UdzNQu1cM5JnhFeXxxH4yGEWfvTzKiYj0uR9i5whmF9yhGeAROmp0+sMgMJmmTHaSP0exfXHtxJGT0t/qPFZePuK93RBMIyObDmLg6lL5Tc1r/261mNYUj0MQ86h65w5/5cyR/b1RcGYmHHuLZ8KzZ9Ce8qjrGQMsA7HyHCCr3qSi5867u1PlfMPp2/X8F53geMNbPPZDAAAAAElFTkSuQmCC
// @icon64       data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAMaUlEQVR42u2bf3Bc11XHP+fet29Xu5Il2/LPkDjFwRPFSUmTupA0E7uEJoUJmYZBZgYI0zZTaOK6aRqmBPqHbShDCWmbaVLolClTCqFgh3RoCEkzw4CbDgzUhibUses4iR3btS3bklban+/HPfzx3kralbRaCYJt0J15I2l19+y958f3fM+5d2FxLI7FsTgWx//fIe3+txvMATbLlktsU/8EbEl/bmSlbmWPA7RjAbvB/l+z9G4GbUcesBvsVoh1xw7zpc8+dVM1jK93Qr/DXVIbNhiM6Kjvm+/fftO672x4/vn6DjC7aN5IkwIaE77YO/D+KGBnocv++Open1zGzsuDLpboDiLHUDFgrBK+an35g23Fg19RkHTT2qSA3QzareyJH+8Z+P0uYx++dn2BDT9acEt7Mg5zifq9wlg5MkeOVcyBwyVGguirH3to6717du2SrYknqEx1+8d7Bh5Ylsk89u6f6I3W/UheCNXGsV5ytp9qWWsFPHFDZ+vxt/9lNHOiUv/8g6WDnxgEuwdiabj9n/YP/Fipqt//6RuX24EN3RJUnDGp5UUEzCXmBqqoS8LdOfC7jB4/WY2e++fzGTHu1l8bPfjibgatB5sN7HWjFXf/1Su7/YErC1FYcdZIGiXGoPUaWq9PRs8lsHkyPtLVBc5hBIKKk8vXdMmGy/L672+MfQJ4EcDbxd5YBJzKbVeszSmCcQ6MJJunVEauXI95xybI+Inwi933Y4ce+B566AB05QFNlh2rvWJNTv7j2Pi7v/X2txfueHlP2QP02fXvWnL49NhlPQUrxInl1RgolzC3/Qzeh7YlglTBXeQKMJJ4ahQS/9XXiJ/+y4m1xzF05z1yvll+8I1wLfCqB3CyVvKEBOudpqBXrSLr1iebF4HiKHge5LsubvNXKxCG4HnYX/4Q7sgPcC/tR7vyqFNAETCRxhbAA8gbqxUcOFAHikFrAZnrN0E+D6Mj4GfR8RL1Z56FenBx4oEI/pZbMSv6oV4HAbPpZqLv/ivkEgfWlAZZEZ1QwJS0mUzSNAwyfvIPp5DPU//G31La+XtI7xKILzJmaC1udJT82bMUHnoQarXk9Yyf2FxnpnJNCsCBSzEAx2S8GwO1Gv4tN5Pf9pHExS5GD1Al+7Pvg3otRXFQ1XQvk3ucVQFKYn6dcIM0rkQgDDGrVpH/+EdbMoFeOJYsLWxeJHH9oBGi0rQfJf19JgUIafy7dH9Om/eZKoGUD6gqzjms5104kqRKHIYYYxKyppqsRWTSKI24d2mIt/OA1AEmMGCaZUXAWlBFrMUWCtTPD1OtVpH/ZSWoKn4mQ35lP1SrEMXNhtBmXGs4qrbDgAZKaooBM3EeTTmCInzu04/y1NPPEDYwQRVJvWNKAE28Nj9AbyMn/SxjDbfftoVPfeoh8l05iKLEE1qN2qkHaKsHzDCci7E9vTz66UfZ8buPsHJFPwqIJhgSOrAGfCMIQuAckQPPgBGZk0gme+tADsnPx574MtVqlc8//oe4MJyugFYP0NkUIA0PSIHCTQcMVcVmPGrDw+x5+hlW9Pfj+z7qHJEqGRGu6vZZ250ln7EIUI1iTpcDjo7XCWIlY2RWzBSYlxxEWLtmNc8+/w/85tGjrL78MrQeNCkhsboiLgVBpx1iwGxdNGOoVWuJ2wPqHKFzdGcsNyzPsyzvUymXqZXrAPhZn4GlBS4rZPjeuQrD9QhPpitBgFB1fnJM4lFxHFMqVZLCLQ3DSWRv9gB0HiCobeJzIiQ0cdNNK/L0+B4jo0XWX3sdG2+6GWs9Du37Nw7t30d3Ic+mFQW+c7pEJXJYaZbvWICceLJXY4zM2hRRR2dEqMnyHfRRRRKXvbovR282w0hxjDs/eC+/sP3BKVlhGy/8xdf4+uceYUl3gYG+HN89V8ZOyd8ChE4ZWNY1Lzn7zpU7I2RTiFArCJrZQLAdEE5aX+nyDJd1ZxkbG+eGLe9h8IGHAKhWKowVi0RhyO2/8qv81OAvMlossqo7y5KMJdZJCuNgQXJ6MpZYta0OWvfUCoKJAooN7Wjzo+3TlFPo9gxZa4hdzC133Y2qcvbsOT58733c9+vbGTp7DnWOW+56P17Gx6Is8ZOFN6zvVBckp9e3KVuXto3B5n21wwA6t34DT6wkSGOtR0/fUgCOHz/Bt/e+iOd5vPHaG6xZs5rCkl78XA51itdisoXKsR24fyumtSdCDjSeJAztPEBT96k7hyJEYcCbhw+x4YYbue7aa/jil75AFEa8c9MNiAgnXz9CZXyc3r5earFrcluDLEyOc0gHVpo/EaIDL1DFiDAeOsbqEfl8gRee/HPe9d73sWT5cn7urjsnpgb1Gn/3lT8hk/GoRo7ReoydkgqNsGA5Se9S5/SC2dKgaa0GG0RIZyBCM2WB2Cmvj9XI5bKcPXmCz97/YX6wfx/1Wo0wCDh28ACPbb+fIy+/RE93N0eLNapx81FD0sabv5xa5JoUOWsItGBb237AhAe4Trh6krtPlAOWFatc1dfDydeP8MhH7mX1Fesw1nLmzWNEQcCyvl5Ojtd4bbw+jQ0qkFmAHM8YFJ0zEzpVzJxUmJYKsB0PSEthSbVvRfjP4RrVSLmqL4dvhOETbwJKLpslzmQ4PFLh0GhtTkCdn5yE9bm5vHWG6jbbthqUmXOmiKBRRM/SpaxetYJTp4dYtqyPKIqxwGulkDN1x6q8R4/vIUBpLGSoElIMYjxrG+x01lpA5yFHjKFcrrByxXJWrV4FMxVD2tznmCcITl+qxorpyvLwJx/gng9u4/SZs1hjkooQGFXlWMvbrDBnrLYqYi45kmKWiOGTv7Gd7hX9xGNjWNt8Ct7I/bMRIa+12nNOQVLAMHbaO4w1aLnE5ve+h+e++XWe+ptvUiqXMcZMTJVZvPB/4vaGTllr1ve5887b+clbb0ZLpWmbRxWsnQB05zquBhVFiE8NgZikAzxFuBiDK5XYeP21bHznjVzQpqAL0VJ5ekcqjkE8olNDqQLSBsvc/YAENSVfoPzCXnp+6W68qwdgfLSp8DDG4Co1nFaQC3f6jRHBzNSOW7YUd+YUpW88h+S60MjNXQ5PxIlTMBZXqjD08Z0s+63tZN+xEUGa/NIYwVx0t2kSKwf7X2bkM08QnjyD5LvQRtbSOc4FGo+6GPGzhMdPcea+h/HWXY74mUvgcFTQOCY6dhKNIkxXFxrFaXufToqhBDAE0NiBnwGF8OiJjjavF/Ba29RJkvURL4fG8STLZXpmm70rPAEm6R++3/EC5S1ChfncVUnQ3rXjQrNUg7NWgdoxMDl1b9HJ98JVq6QEr/3R2MxkYT4LPD5eZSyIphEfN1P1NUv3aqZ5DiXvWd7W07WgMFPa1AIBRhGUpk6QzisyjUA5jBitR0l6bvmkfHIfi6q0d+TZ5gkwFkQU6xF9vkekIPMJicaVsKQvoB7J8bgB+EDxpaJTztQihyjaIAydPi7lz+drIQ7FTGBB8gEG+Ecb8LwXEJNcQ5WWp9N55+thwlbnucZGT6AWxUTqRroy0WkAs4PNXnp6/uL5Wohz6iawoMPHKFTCmGLY7PoOyCH8vQ34slfjq7bGX3t1MkwPj7nmNUhPKYwZD2OMSsfra1z8EMUN10ONne67Z/jI2CBY8worFcAX88cngxqnawE+onGHGlUFUWEkCJMO7QzV3WGJyQAFhFclJmTh80AZDsJpa2j3xAoZhOF66E7VAvGs9zjANWwW+wqv6G6wH6if++Ed2f5sFOnmvGfDgrXGKdJ0UtzyaNrarsfK6SCYEaE9hB6EV0wEwM/HWd6mlqglp3c6T0SoO6VgDBkxSZZu8wiQEdFyFIevlSr++Th48mPFg58ZBPtHHItl8mr8oBlkj3ui9+o/67P+PWtzWVb5fpwzRmWOJsbJeo2hMJjxyEuBrAoj4oiAlWqoi84oq5N5AsSq9NoMV+ZyuDbkSIHQOYbC0Pthrc75KHjhinz+7v2n9td2plmxSblpna1P9F3zUVF+u9d6a5Z6Hp5M1vutxMQTg2cE1waRFfA0yeGhaNsFdzKv0UmOnRKqm0a8dIqiinHESBSMKHzh/uLW3xF2OZ1yhaL1M2QHyC5wT/Zet7So4R0B3Aj0uxnZFnRnLGuzOXSO6/T/XR4wnfIbzgZ1RurBjJczkqwio0bkpd6M+9Y95w6dSpUjMleOn+3LBVz6X5iQjmsLBdnJ5o4UsYUL99WYTsZO9sbCJXnpfXEsjsWxOBbHWzr+CwAlbJ2IU/YPAAAAAElFTkSuQmCC
// @match        https://www.youtube.com/*
// @run-at       document-idle
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        unsafeWindow
// @require      https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js#sha256=15d285e2587b3bdbfd18a68de6ce07cc074f7480a82c3815da2dc1c348ec6df4
// @connect      youtube.com
// @connect      www.youtube.com
// @connect      googlevideo.com
// @connect      i.ytimg.com
// @connect      cdn.jsdelivr.net
// @connect      127.0.0.1
// @connect      localhost
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '6.10.0';
  const CHUNK = 9 * 1024 * 1024; // googlevideo throttles big single requests; fetch in ranges
  const PARALLEL = 3; // range requests per stream
  const MAX_ACTIVE = 2; // downloads running at once, the rest wait in the queue
  // The browser extension build connects to the Download Manager on its own: the app recognizes the
  // extension by its ID. The userscript asks the user once instead.
  const AUTO_CONNECT = false;
  // The extension build: true once the extension was reloaded or updated under this open page. This
  // copy of the script can't reach it any more; it stays quiet until the page is reloaded.
  const hostGone = () => false;
  // Hands this browser's YouTube sign-in to the Download Manager app, for videos YouTube only shows to
  // eligible signed-in accounts. Resolves { ok, signedIn }. The userscript can't read the sign-in.
  const pushSession = () => Promise.resolve({ ok: false, signedIn: null });
  const pageWin = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

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
  const LANG_NAMES = { en: 'English', de: 'Deutsch', es: 'Espa\u00f1ol', fr: 'Fran\u00e7ais', it: 'Italiano', pt: 'Portugu\u00eas', pl: 'Polski', ru: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', ja: '\u65e5\u672c\u8a9e', zh: '\u7b80\u4f53\u4e2d\u6587' };
  const I18N = {
    en: {
      toolbarLabel: 'Download tools',
      tipVideo: 'Download video', tipAudio: 'Download audio', tipThumb: 'Download thumbnail', tipSubs: 'Download subtitles',
      tipShot: 'Save a screenshot of this frame', download: 'Download', dlShort: 'Download', tipView: 'View options',
      tipToDark: 'Switch to dark theme', tipToLight: 'Switch to light theme',
      focusMode: 'Big Picture', tipFocusOn: 'Big Picture: keep the video in view while you scroll, and playing when you go to Home', tipFocusOff: 'Exit Big Picture',
      pip: 'Picture-in-picture', tipPipOff: 'Exit picture-in-picture', loop: 'Loop video', tipLoopOff: 'Stop looping',
      pipActive: 'Playing in picture-in-picture', pipHint: 'The video keeps playing in a small window that stays on top of your other windows, even when you switch tabs.', pipBack: 'Play here again', prevShort: 'Previous video', nextShort: 'Next video', pipPlay: 'Play', pipPause: 'Pause', pipMute: 'Mute', pipUnmute: 'Unmute', pipFit: 'Show the whole video', pipFill: 'Fill the window', pipHintShorts: 'Scroll in the window for the next Short. It stays on top of your other windows, even when you switch tabs.',
      settings: 'Settings', help: 'Help', hideToolbar: 'Hide toolbar', back: 'Back', close: 'Close',
      pin: 'Keep open', unpin: 'Close when clicking outside',
      quality: 'Quality', format: 'Format', language: 'Language', fileFormat: 'File format',
      trim: 'Trim', start: 'Start', end: 'End', clipStart: 'Clip start', clipEnd: 'Clip end',
      fullLength: 'Full length', clip: 'Clip', reset: 'Reset', syncPlayer: 'Sync with player', setToNow: 'Use the current video time',
      trimNotOpus: 'Trimming works with MP3, M4A and WAV.',
      added: 'Added', tryAgain: 'Try again', loadingFormats: 'Loading formats\u2026',
      noVideo: 'No downloadable video formats', noAudio: 'No downloadable audio formats', noSubs: 'This video has no subtitles',
      autoSubsNote: 'Auto-generated subtitles are marked with this icon',
      hintCover: 'with cover art', hintOriginal: 'original quality', hintLossless: 'lossless',
      thumbMax: 'Maximum resolution', thumbStandard: 'Standard', thumbHigh: 'High', thumbMedium: 'Medium', thumbPortrait: 'Vertical',
      notAvailable: 'not available', thumbPreview: 'Thumbnail preview',
      appearance: 'Appearance', themeDevice: 'Use device theme', themeDark: 'Dark theme', themeLight: 'Light theme',
      downloads: 'Downloads', changeFolder: 'Change downloads folder', browserDefault: 'browser default',
      useBrowserFolder: 'Use the browser download folder', autoOpenHistory: 'Open history when a download starts',
      clearFinished: 'Clear finished downloads', languageAuto: 'Automatic',
      help1: 'The video, audio, thumbnail and subtitle buttons open a picker. Drag the trim handles or type times to download just a clip.',
      help2: 'The camera saves the current frame as an image. The clock at the top right of YouTube opens your download history; drag its header to move it.',
      help3: 'Big Picture keeps the video in view in the corner while you scroll. Going to Home keeps it playing in the mini player; \u201cBack to the video\u201d returns to it.',
      help4: 'Everything is downloaded and converted in your browser. Nothing is sent anywhere except YouTube.',
      help5: 'Hid the toolbar? Open the Tampermonkey menu and choose \u201c{cmd}\u201d.',
      history: 'Download history', historyActive: 'Download history ({n} active)',
      nActive: '{n} active', nFinished: '{n} finished', clear: 'Clear', dragToMove: 'Drag to move',
      noDownloads: 'No downloads yet', noDownloadsHint: 'Use the toolbar under the video to download.',
      savingTo: 'Saving to', browserDownloads: 'browser downloads', chooseFolder: 'Choose folder', change: 'Change',
      inFolder: 'in {folder}', inBrowser: 'in browser downloads',
      pause: 'Pause', resume: 'Resume', cancel: 'Cancel', play: 'Play', retry: 'Retry', restart: 'Start again', remove: 'Remove from history',
      trimmedClip: 'Trimmed clip', view: 'View', show: 'Show',
      stQueued: 'Queued', stDownloading: 'Downloading', stPaused: 'Paused', stProcessing: 'Processing', stCompleted: 'Completed', stFailed: 'Failed', stCanceled: 'Canceled',
      waitingOthers: 'Waiting for other downloads to finish', starting: 'Starting\u2026', findingClip: 'Finding the clip\u2026',
      merging: 'Merging video and audio\u2026', cutting: 'Cutting the clip\u2026', decoding: 'Preparing audio\u2026', encodingMp3: 'Converting to MP3 \u00b7 {p}%',
      saving: 'Saving\u2026', fetchingImage: 'Fetching image\u2026', fetchingSubs: 'Fetching subtitles\u2026',
      reconnecting: 'Connection interrupted, reconnecting\u2026', waitingOnline: 'Offline. The download continues when you are back online.',
      refreshingLink: 'Refreshing the download link\u2026', waitingSession: 'Waiting for your YouTube sign-in\u2026 Open YouTube in your browser.',
      sharingBandwidth: 'slower while your video plays',
      progressOf: '{got} of {total}', perSecond: '{speed}/s', timeLeft: '{t} left',
      toastDownloading: 'Downloading', toastQueued: 'Queued', whatClip: '{what} (clip)',
      toastSaved: 'Downloaded', toastCanceled: 'Download canceled', toastFailed: 'Download failed \u00b7 {err}',
      statusFailed: 'Download failed', reloadPage: 'Reload page', tipMany: '{n} downloads, {p}%',
      toastAlready: 'This download is already in progress',
      folderSet: 'Downloads now go to \u201c{name}\u201d', folderReset: 'Downloads now go to the browser download folder',
      folderNoPerm: 'No permission for the chosen folder, so it was saved to your browser downloads',
      folderNeedsChromium: 'Choosing a folder needs Chrome, Edge or another Chromium-based browser',
      loopOn: 'Loop on', loopOff: 'Loop off',
      toolbarHidden: 'Toolbar hidden. Bring it back from the Tampermonkey menu: \u201c{cmd}\u201d',
      themeConfirm: {
        one: 'YouTube reloads the page to change its theme. This cancels {n} running download. Continue?',
        other: 'YouTube reloads the page to change its theme. This cancels {n} running downloads. Continue?',
      },
      menuShowToolbar: 'Show download toolbar', menuOpenHistory: 'Open download history',
      errNetwork: 'The connection kept dropping. Your progress is kept; press Retry when your connection is stable.',
      errReach: "Couldn't reach YouTube. Check your connection and try again.",
      errExpired: 'YouTube didn\'t allow this download to finish. Your progress is kept, so you can press Retry later.',
      errFormatGone: 'This format is no longer available.',
      errNoDirect: "YouTube doesn't offer this video as a direct download right now. Try again later.",
      errBlocked: "YouTube is blocking downloads of this video on your current connection. If you use a VPN, turn it off or switch servers, then press Retry. Your progress is kept.",
      dmTitle: "Download Manager",
      dmConnectedHint: "connected",
      dmNotRunning: "starts when needed",
      dmConnect: "Connect\u2026",
      dmConnected: "Connected to the Download Manager. Downloads now go to the folder you chose in it.",
      dmPairWaiting: "Confirm the connection in the Download Manager window on your PC.",
      dmDenied: "The Download Manager didn't allow the connection.",
      dmNotInstalled: "The Download Manager app isn't running. Install YT Download Manager, finish its setup, then try again.",
      dmStarting: "Starting the Download Manager\u2026",
      dmUnavailable: "The Download Manager couldn't be started. You can start it from the Start menu, or download in the browser.",
      dmBrowserInstead: "Download in browser",
      dmUseApp: 'Use the Download Manager',
      extReloaded: 'The extension was updated. Reload this page to continue.',
      dmAlreadyDone: "You've already downloaded this.",
      dmOffline: "The Download Manager isn't running. This download continues when it starts again.",
      downloadAgain: "Download again",
      showInFolder: "Show in folder",
      openFolder: "Open folder",
      dmFolderPicker: "Choose the folder in the window that opened on your PC.",
      downloadingVideo: "Downloading video\u2026",
      downloadingAudio: "Downloading audio\u2026",
      verifying: "Checking the file\u2026",
      updatingEngine: "Updating the download engine\u2026",
      waitingFolder: "Waiting for the download folder. Reconnect its drive or choose another folder.",
      errPrivate: "This video is private.",
      errNoDownload: 'YouTube doesn\u2019t offer this video for download.', errDrm: 'This video is copy-protected, so it can\u2019t be downloaded.', errSessionExpired: 'Your YouTube sign-in has changed. Reload the page, then try again.', errMembers: "This video is only for channel members.", errSignIn: 'Sign in to YouTube in this browser to download this video.', errAgeAccount: 'YouTube doesn\u2019t let your account watch this video (age check).', errMembersAccount: 'This video is for members of the channel. Your account isn\u2019t a member.', errPrivateAccount: 'This video is private, and your account doesn\u2019t have access to it.',
      errAge: "This video is age-restricted and can't be downloaded without signing in.",
      errGeo: "This video isn't available in your country.",
      errLive: "Live streams and premieres can be downloaded once they have ended.",
      errDiskFull: "There isn't enough free space. Free up some space, then press Retry.",
      errVerify: "The downloaded file was damaged, so it wasn't saved. Press Retry to download it again.",
      errEngine: "The download engine needs an update that couldn't be installed. Check your internet connection, then press Retry.",
      errEngineMissing: "Parts of the Download Manager are missing. Run its setup again from the Start menu.",
      errReason: 'YouTube says: {reason}',
      errUnavailable: "This video can't be downloaded.",
      errFormats: "Couldn't load the formats for this video.",
      errNoThumb: 'No thumbnail is available for this video.',
      errNoSubs: 'YouTube returned empty subtitles.',
      errClip: 'The selected clip is outside the video.',
      errNotReady: "The video isn't ready yet.",
      errFrame: "Couldn't capture this frame.",
      errFolder: 'No permission for the downloads folder.',
      errMoved: 'The file was moved or deleted.',
      errDecode: "This audio couldn't be converted.",
      errGeneric: 'Something went wrong. Please try again.',
      backToVideo: 'Back to the video', goHome: 'Home, keep playing',
      preparingEngine: 'Setting up the converter (first time only) \u00b7 {p}%',
      converting: 'Converting \u00b7 {p}%',
      folderTitle: 'Download folder',
      folderHint: 'Choose a folder or create a new one, for example Downloads \u203a YouTube. Browsers don\'t allow websites to save directly into the main Downloads, Documents or Desktop folder, so use a folder inside them. The picker has a \u201cNew folder\u201d button.',
      folderChoose: 'Choose folder\u2026',
      folderNotWritable: 'Files can\'t be saved in this folder. Please choose a different one.',
      folderPickFailed: 'This folder can\'t be used. Please choose a different one.',
      folderMissing: 'The folder \u201c{name}\u201d is no longer available. It may have been moved or deleted, or its drive is disconnected.',
      folderMissingSaved: 'Your download folder isn\'t available, so the file was saved to your browser downloads.',
      folderPermission: 'needs permission',
      folderAllow: 'Allow access',
      folderUnavailable: 'not available',
      folderRestartNote: 'After restarting the browser you may be asked once to allow access again.',
      errConvert: 'This file couldn\'t be converted.',
    },
    de: {
      toolbarLabel: 'Download-Werkzeuge',
      tipVideo: 'Video herunterladen', tipAudio: 'Audio herunterladen', tipThumb: 'Vorschaubild herunterladen', tipSubs: 'Untertitel herunterladen',
      tipShot: 'Screenshot dieses Bildes speichern', download: 'Herunterladen', dlShort: 'Download', tipView: 'Ansichtsoptionen',
      tipToDark: 'Zum dunklen Design wechseln', tipToLight: 'Zum hellen Design wechseln',
      focusMode: 'Gro\u00dfbild', tipFocusOn: 'Gro\u00dfbild: Video beim Scrollen im Blick behalten und beim Wechsel zur Startseite weiterspielen', tipFocusOff: 'Gro\u00dfbild beenden',
      pip: 'Bild-im-Bild', tipPipOff: 'Bild-im-Bild beenden', loop: 'Video wiederholen', tipLoopOff: 'Wiederholen beenden',
      pipActive: 'Wird im Bild-im-Bild-Fenster abgespielt', pipHint: 'Das Video l\u00e4uft in einem kleinen Fenster weiter, das \u00fcber deinen anderen Fenstern bleibt, auch wenn du den Tab wechselst.', pipBack: 'Wieder hier abspielen', prevShort: 'Vorheriges Video', nextShort: 'N\u00e4chstes Video', pipPlay: 'Abspielen', pipPause: 'Pausieren', pipMute: 'Stummschalten', pipUnmute: 'Ton an', pipFit: 'Ganzes Video zeigen', pipFill: 'Fenster ausf\u00fcllen', pipHintShorts: 'Scrolle im Fenster zum n\u00e4chsten Short. Es bleibt \u00fcber deinen anderen Fenstern, auch wenn du den Tab wechselst.',
      settings: 'Einstellungen', help: 'Hilfe', hideToolbar: 'Leiste ausblenden', back: 'Zur\u00fcck', close: 'Schlie\u00dfen',
      pin: 'Ge\u00f6ffnet lassen', unpin: 'Beim Klick daneben schlie\u00dfen',
      quality: 'Qualit\u00e4t', format: 'Format', language: 'Sprache', fileFormat: 'Dateiformat',
      trim: 'Zuschneiden', start: 'Anfang', end: 'Ende', clipStart: 'Clip-Anfang', clipEnd: 'Clip-Ende',
      fullLength: 'Volle L\u00e4nge', clip: 'Clip', reset: 'Zur\u00fccksetzen', syncPlayer: 'Mit Player synchronisieren', setToNow: 'Aktuelle Videozeit \u00fcbernehmen',
      trimNotOpus: 'Zuschneiden funktioniert mit MP3, M4A und WAV.',
      added: 'Hinzugef\u00fcgt', tryAgain: 'Erneut versuchen', loadingFormats: 'Formate werden geladen\u2026',
      noVideo: 'Keine herunterladbaren Videoformate', noAudio: 'Keine herunterladbaren Audioformate', noSubs: 'Dieses Video hat keine Untertitel',
      autoSubsNote: 'Automatisch erstellte Untertitel sind mit diesem Symbol gekennzeichnet',
      hintCover: 'mit Cover', hintOriginal: 'Originalqualit\u00e4t', hintLossless: 'verlustfrei',
      thumbMax: 'Maximale Aufl\u00f6sung', thumbStandard: 'Standard', thumbHigh: 'Hoch', thumbMedium: 'Mittel', thumbPortrait: 'Hochformat',
      notAvailable: 'nicht verf\u00fcgbar', thumbPreview: 'Vorschau des Vorschaubilds',
      appearance: 'Design', themeDevice: 'Ger\u00e4tedesign verwenden', themeDark: 'Dunkles Design', themeLight: 'Helles Design',
      downloads: 'Downloads', changeFolder: 'Download-Ordner \u00e4ndern', browserDefault: 'Browser-Standard',
      useBrowserFolder: 'Download-Ordner des Browsers verwenden', autoOpenHistory: 'Verlauf beim Start eines Downloads \u00f6ffnen',
      clearFinished: 'Abgeschlossene Downloads entfernen', languageAuto: 'Automatisch',
      help1: 'Die Schaltfl\u00e4chen f\u00fcr Video, Audio, Vorschaubild und Untertitel \u00f6ffnen eine Auswahl. Ziehe die Zuschnitt-Griffe oder gib Zeiten ein, um nur einen Clip herunterzuladen.',
      help2: 'Die Kamera speichert das aktuelle Bild. Die Uhr oben rechts auf YouTube \u00f6ffnet deinen Download-Verlauf; ziehe ihn an der Kopfzeile, um ihn zu verschieben.',
      help3: 'Gro\u00dfbild h\u00e4lt das Video beim Scrollen in der Ecke im Blick. Beim Wechsel zur Startseite spielt es im Miniplayer weiter; \u201eZur\u00fcck zum Video\u201c bringt dich zur\u00fcck.',
      help4: 'Alles wird in deinem Browser heruntergeladen und umgewandelt. Es wird nichts an andere Stellen als YouTube gesendet.',
      help5: 'Leiste ausgeblendet? \u00d6ffne das Tampermonkey-Men\u00fc und w\u00e4hle \u201e{cmd}\u201c.',
      history: 'Download-Verlauf', historyActive: 'Download-Verlauf ({n} aktiv)',
      nActive: '{n} aktiv', nFinished: '{n} abgeschlossen', clear: 'Leeren', dragToMove: 'Zum Verschieben ziehen',
      noDownloads: 'Noch keine Downloads', noDownloadsHint: 'Nutze die Leiste unter dem Video zum Herunterladen.',
      savingTo: 'Speichern in', browserDownloads: 'Browser-Downloads', chooseFolder: 'Ordner w\u00e4hlen', change: '\u00c4ndern',
      inFolder: 'in {folder}', inBrowser: 'in den Browser-Downloads',
      pause: 'Pausieren', resume: 'Fortsetzen', cancel: 'Abbrechen', play: 'Abspielen', retry: 'Erneut versuchen', restart: 'Neu starten', remove: 'Aus dem Verlauf entfernen',
      trimmedClip: 'Zugeschnittener Clip', view: 'Anzeigen', show: 'Anzeigen',
      stQueued: 'Wartet', stDownloading: 'L\u00e4dt herunter', stPaused: 'Pausiert', stProcessing: 'Wird verarbeitet', stCompleted: 'Fertig', stFailed: 'Fehlgeschlagen', stCanceled: 'Abgebrochen',
      waitingOthers: 'Wartet, bis andere Downloads fertig sind', starting: 'Wird gestartet\u2026', findingClip: 'Clip wird gesucht\u2026',
      merging: 'Video und Audio werden zusammengef\u00fchrt\u2026', cutting: 'Clip wird zugeschnitten\u2026', decoding: 'Audio wird vorbereitet\u2026', encodingMp3: 'Umwandlung in MP3 \u00b7 {p} %',
      saving: 'Wird gespeichert\u2026', fetchingImage: 'Bild wird geladen\u2026', fetchingSubs: 'Untertitel werden geladen\u2026',
      reconnecting: 'Verbindung unterbrochen, neuer Versuch\u2026', waitingOnline: 'Offline. Der Download geht weiter, sobald du wieder online bist.',
      refreshingLink: 'Download-Link wird erneuert\u2026', waitingSession: 'Warte auf deine YouTube-Anmeldung\u2026 \u00d6ffne YouTube in deinem Browser.',
      sharingBandwidth: 'langsamer, solange dein Video l\u00e4uft',
      progressOf: '{got} von {total}', perSecond: '{speed}/s', timeLeft: 'noch {t}',
      toastDownloading: 'Wird heruntergeladen', toastQueued: 'In der Warteschlange', whatClip: '{what} (Clip)',
      toastSaved: 'Heruntergeladen', toastCanceled: 'Download abgebrochen', toastFailed: 'Download fehlgeschlagen \u00b7 {err}',
      statusFailed: 'Download fehlgeschlagen', reloadPage: 'Seite neu laden', tipMany: '{n} Downloads, {p}%',
      toastAlready: 'Dieser Download l\u00e4uft bereits',
      folderSet: 'Downloads werden jetzt in \u201e{name}\u201c gespeichert', folderReset: 'Downloads werden jetzt im Download-Ordner des Browsers gespeichert',
      folderNoPerm: 'Keine Berechtigung f\u00fcr den gew\u00e4hlten Ordner, daher in den Browser-Downloads gespeichert',
      folderNeedsChromium: 'Zum W\u00e4hlen eines Ordners wird Chrome, Edge oder ein anderer Chromium-Browser ben\u00f6tigt',
      loopOn: 'Wiederholen an', loopOff: 'Wiederholen aus',
      toolbarHidden: 'Leiste ausgeblendet. \u00dcber das Tampermonkey-Men\u00fc zur\u00fcckholen: \u201e{cmd}\u201c',
      themeConfirm: 'YouTube l\u00e4dt die Seite neu, um das Design zu \u00e4ndern. Laufende Downloads ({n}) werden abgebrochen. Fortfahren?',
      menuShowToolbar: 'Download-Leiste anzeigen', menuOpenHistory: 'Download-Verlauf \u00f6ffnen',
      errNetwork: 'Die Verbindung ist immer wieder abgebrochen. Dein Fortschritt bleibt erhalten \u2013 versuche es erneut, wenn die Verbindung stabil ist.',
      errReach: 'YouTube ist nicht erreichbar. Pr\u00fcfe deine Verbindung und versuche es erneut.',
      errExpired: 'YouTube hat diesen Download nicht abschlie\u00dfen lassen. Dein Fortschritt bleibt erhalten \u2013 versuche es sp\u00e4ter mit \u201eErneut versuchen\u201c.',
      errFormatGone: 'Dieses Format ist nicht mehr verf\u00fcgbar.',
      errNoDirect: "YouTube bietet dieses Video gerade nicht als direkten Download an. Versuche es sp\u00e4ter noch einmal.",
      errBlocked: "YouTube blockiert Downloads dieses Videos \u00fcber deine aktuelle Verbindung. Falls du ein VPN nutzt, schalte es aus oder wechsle den Server und tippe dann auf \u201eErneut versuchen\u201c. Dein Fortschritt bleibt erhalten.",
      dmTitle: "Download-Manager",
      dmConnectedHint: "verbunden",
      dmNotRunning: "startet bei Bedarf",
      dmConnect: "Verbinden\u2026",
      dmConnected: "Mit dem Download-Manager verbunden. Downloads landen jetzt in dem Ordner, den du dort gew\u00e4hlt hast.",
      dmPairWaiting: "Best\u00e4tige die Verbindung im Fenster des Download-Managers auf deinem PC.",
      dmDenied: "Der Download-Manager hat die Verbindung nicht zugelassen.",
      dmNotInstalled: "Die Download-Manager-App l\u00e4uft nicht. Installiere YT Download Manager, f\u00fchre die Einrichtung aus und versuche es dann erneut.",
      dmStarting: "Download-Manager wird gestartet\u2026",
      dmUnavailable: "Der Download-Manager konnte nicht gestartet werden. Du kannst ihn \u00fcber das Startmen\u00fc starten oder im Browser herunterladen.",
      dmBrowserInstead: "Im Browser herunterladen",
      dmUseApp: 'Download-Manager verwenden',
      extReloaded: 'Die Erweiterung wurde aktualisiert. Lade diese Seite neu, um fortzufahren.',
      dmAlreadyDone: "Das hast du bereits heruntergeladen.",
      dmOffline: "Der Download-Manager l\u00e4uft nicht. Dieser Download wird fortgesetzt, sobald er wieder startet.",
      downloadAgain: "Erneut herunterladen",
      showInFolder: "Im Ordner anzeigen",
      openFolder: "Ordner \u00f6ffnen",
      dmFolderPicker: "W\u00e4hle den Ordner in dem Fenster, das sich auf deinem PC ge\u00f6ffnet hat.",
      downloadingVideo: "Video wird heruntergeladen\u2026",
      downloadingAudio: "Audio wird heruntergeladen\u2026",
      verifying: "Datei wird gepr\u00fcft\u2026",
      updatingEngine: "Download-Programm wird aktualisiert\u2026",
      waitingFolder: "Warte auf den Download-Ordner. Schlie\u00dfe das Laufwerk wieder an oder w\u00e4hle einen anderen Ordner.",
      errPrivate: "Dieses Video ist privat.",
      errNoDownload: 'YouTube bietet dieses Video nicht zum Herunterladen an.', errDrm: 'Dieses Video ist kopiergesch\u00fctzt und kann nicht heruntergeladen werden.', errSessionExpired: 'Deine YouTube-Anmeldung hat sich ge\u00e4ndert. Lade die Seite neu und versuch es noch einmal.', errMembers: "Dieses Video ist nur f\u00fcr Kanalmitglieder.", errSignIn: 'Melde dich in diesem Browser bei YouTube an, um dieses Video herunterzuladen.', errAgeAccount: 'YouTube l\u00e4sst dein Konto dieses Video nicht ansehen (Alterspr\u00fcfung).', errMembersAccount: 'Dieses Video ist f\u00fcr Kanalmitglieder. Dein Konto ist kein Mitglied.', errPrivateAccount: 'Dieses Video ist privat, und dein Konto hat keinen Zugriff darauf.',
      errAge: "Dieses Video hat eine Altersbeschr\u00e4nkung und kann ohne Anmeldung nicht heruntergeladen werden.",
      errGeo: "Dieses Video ist in deinem Land nicht verf\u00fcgbar.",
      errLive: "Livestreams und Premieren k\u00f6nnen heruntergeladen werden, sobald sie beendet sind.",
      errDiskFull: "Nicht genug freier Speicherplatz. Schaffe Platz und tippe dann auf \u201eErneut versuchen\u201c.",
      errVerify: "Die heruntergeladene Datei war besch\u00e4digt und wurde nicht gespeichert. Tippe auf \u201eErneut versuchen\u201c, um sie neu herunterzuladen.",
      errEngine: "Das Download-Programm braucht ein Update, das nicht installiert werden konnte. Pr\u00fcfe deine Internetverbindung und tippe dann auf \u201eErneut versuchen\u201c.",
      errEngineMissing: "Teile des Download-Managers fehlen. F\u00fchre die Einrichtung \u00fcber das Startmen\u00fc erneut aus.",
      errReason: 'YouTube meldet: {reason}',
      errUnavailable: 'Dieses Video kann nicht heruntergeladen werden.',
      errFormats: 'Die Formate f\u00fcr dieses Video konnten nicht geladen werden.',
      errNoThumb: 'F\u00fcr dieses Video ist kein Vorschaubild verf\u00fcgbar.',
      errNoSubs: 'YouTube hat leere Untertitel geliefert.',
      errClip: 'Der gew\u00e4hlte Clip liegt au\u00dferhalb des Videos.',
      errNotReady: 'Das Video ist noch nicht bereit.',
      errFrame: 'Dieses Bild konnte nicht aufgenommen werden.',
      errFolder: 'Keine Berechtigung f\u00fcr den Download-Ordner.',
      errMoved: 'Die Datei wurde verschoben oder gel\u00f6scht.',
      errDecode: 'Dieses Audio konnte nicht umgewandelt werden.',
      errGeneric: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
      backToVideo: 'Zur\u00fcck zum Video', goHome: 'Startseite, weiterspielen',
      preparingEngine: 'Konverter wird eingerichtet (nur beim ersten Mal) \u00b7 {p} %',
      converting: 'Wird umgewandelt \u00b7 {p} %',
      folderTitle: 'Download-Ordner',
      folderHint: 'W\u00e4hle einen Ordner oder lege einen neuen an, zum Beispiel Downloads \u203a YouTube. Browser erlauben Websites nicht, direkt im Hauptordner Downloads, Dokumente oder Desktop zu speichern \u2013 nutze daher einen Unterordner. Im Auswahlfenster gibt es daf\u00fcr die Schaltfl\u00e4che \u201eNeuer Ordner\u201c.',
      folderChoose: 'Ordner ausw\u00e4hlen\u2026',
      folderNotWritable: 'In diesem Ordner k\u00f6nnen keine Dateien gespeichert werden. Bitte w\u00e4hle einen anderen.',
      folderPickFailed: 'Dieser Ordner kann nicht verwendet werden. Bitte w\u00e4hle einen anderen.',
      folderMissing: 'Der Ordner \u201e{name}\u201c ist nicht mehr verf\u00fcgbar. Er wurde vielleicht verschoben oder gel\u00f6scht, oder das Laufwerk ist nicht verbunden.',
      folderMissingSaved: 'Dein Download-Ordner ist nicht verf\u00fcgbar, daher wurde die Datei in den Browser-Downloads gespeichert.',
      folderPermission: 'Zugriff erforderlich',
      folderAllow: 'Zugriff erlauben',
      folderUnavailable: 'nicht verf\u00fcgbar',
      folderRestartNote: 'Nach einem Neustart des Browsers wirst du eventuell einmal gefragt, ob der Zugriff wieder erlaubt werden soll.',
      errConvert: 'Diese Datei konnte nicht umgewandelt werden.',
    },
    es: {
      toolbarLabel: 'Herramientas de descarga',
      tipVideo: 'Descargar v\u00eddeo', tipAudio: 'Descargar audio', tipThumb: 'Descargar miniatura', tipSubs: 'Descargar subt\u00edtulos',
      tipShot: 'Guardar una captura de este fotograma', download: 'Descargar', dlShort: 'Descargar', tipView: 'Opciones de vista',
      tipToDark: 'Cambiar al tema oscuro', tipToLight: 'Cambiar al tema claro',
      focusMode: 'Imagen grande', tipFocusOn: 'Imagen grande: mantiene el v\u00eddeo a la vista al desplazarte y reproduci\u00e9ndose al ir al inicio', tipFocusOff: 'Salir de imagen grande',
      pip: 'Imagen en imagen', tipPipOff: 'Salir de imagen en imagen', loop: 'Repetir v\u00eddeo', tipLoopOff: 'Dejar de repetir',
      pipActive: 'Reproduciendo en imagen en imagen', pipHint: 'El v\u00eddeo sigue en una ventana peque\u00f1a que se queda encima de tus otras ventanas, aunque cambies de pesta\u00f1a.', pipBack: 'Volver a reproducir aqu\u00ed', prevShort: 'V\u00eddeo anterior', nextShort: 'Siguiente v\u00eddeo', pipPlay: 'Reproducir', pipPause: 'Pausar', pipMute: 'Silenciar', pipUnmute: 'Activar sonido', pipFit: 'Mostrar el v\u00eddeo completo', pipFill: 'Llenar la ventana', pipHintShorts: 'Despl\u00e1zate en la ventana para ir al siguiente Short. Se queda encima de tus otras ventanas, aunque cambies de pesta\u00f1a.',
      settings: 'Ajustes', help: 'Ayuda', hideToolbar: 'Ocultar barra', back: 'Atr\u00e1s', close: 'Cerrar',
      pin: 'Mantener abierto', unpin: 'Cerrar al hacer clic fuera',
      quality: 'Calidad', format: 'Formato', language: 'Idioma', fileFormat: 'Formato de archivo',
      trim: 'Recortar', start: 'Inicio', end: 'Fin', clipStart: 'Inicio del clip', clipEnd: 'Fin del clip',
      fullLength: 'Duraci\u00f3n completa', clip: 'Clip', reset: 'Restablecer', syncPlayer: 'Sincronizar con el reproductor', setToNow: 'Usar el tiempo actual del v\u00eddeo',
      trimNotOpus: 'El recorte funciona con MP3, M4A y WAV.',
      added: 'A\u00f1adido', tryAgain: 'Reintentar', loadingFormats: 'Cargando formatos\u2026',
      noVideo: 'No hay formatos de v\u00eddeo descargables', noAudio: 'No hay formatos de audio descargables', noSubs: 'Este v\u00eddeo no tiene subt\u00edtulos',
      autoSubsNote: 'Los subt\u00edtulos generados autom\u00e1ticamente llevan este icono',
      hintCover: 'con portada', hintOriginal: 'calidad original', hintLossless: 'sin p\u00e9rdida',
      thumbMax: 'Resoluci\u00f3n m\u00e1xima', thumbStandard: 'Est\u00e1ndar', thumbHigh: 'Alta', thumbMedium: 'Media', thumbPortrait: 'Vertical',
      notAvailable: 'no disponible', thumbPreview: 'Vista previa de la miniatura',
      appearance: 'Apariencia', themeDevice: 'Usar el tema del dispositivo', themeDark: 'Tema oscuro', themeLight: 'Tema claro',
      downloads: 'Descargas', changeFolder: 'Cambiar carpeta de descargas', browserDefault: 'predeterminada del navegador',
      useBrowserFolder: 'Usar la carpeta de descargas del navegador', autoOpenHistory: 'Abrir el historial al iniciar una descarga',
      clearFinished: 'Borrar descargas terminadas', languageAuto: 'Autom\u00e1tico',
      help1: 'Los botones de v\u00eddeo, audio, miniatura y subt\u00edtulos abren un selector. Arrastra los controles de recorte o escribe los tiempos para descargar solo un clip.',
      help2: 'La c\u00e1mara guarda el fotograma actual como imagen. El reloj arriba a la derecha de YouTube abre tu historial de descargas; arrastra su encabezado para moverlo.',
      help3: 'Imagen grande mantiene el v\u00eddeo a la vista en la esquina al desplazarte. Al ir al inicio sigue en el minirreproductor; \u00abVolver al v\u00eddeo\u00bb te lleva de vuelta.',
      help4: 'Todo se descarga y convierte en tu navegador. No se env\u00eda nada a ning\u00fan sitio salvo a YouTube.',
      help5: '\u00bfHas ocultado la barra? Abre el men\u00fa de Tampermonkey y elige \u00ab{cmd}\u00bb.',
      history: 'Historial de descargas', historyActive: 'Historial de descargas ({n} activas)',
      nActive: 'Activas: {n}', nFinished: 'Terminadas: {n}', clear: 'Borrar', dragToMove: 'Arrastra para mover',
      noDownloads: 'A\u00fan no hay descargas', noDownloadsHint: 'Usa la barra bajo el v\u00eddeo para descargar.',
      savingTo: 'Guardando en', browserDownloads: 'descargas del navegador', chooseFolder: 'Elegir carpeta', change: 'Cambiar',
      inFolder: 'en {folder}', inBrowser: 'en las descargas del navegador',
      pause: 'Pausar', resume: 'Reanudar', cancel: 'Cancelar', play: 'Reproducir', retry: 'Reintentar', restart: 'Empezar de nuevo', remove: 'Quitar del historial',
      trimmedClip: 'Clip recortado', view: 'Ver', show: 'Mostrar',
      stQueued: 'En cola', stDownloading: 'Descargando', stPaused: 'En pausa', stProcessing: 'Procesando', stCompleted: 'Completada', stFailed: 'Error', stCanceled: 'Cancelada',
      waitingOthers: 'Esperando a que terminen otras descargas', starting: 'Iniciando\u2026', findingClip: 'Buscando el clip\u2026',
      merging: 'Uniendo v\u00eddeo y audio\u2026', cutting: 'Recortando el clip\u2026', decoding: 'Preparando el audio\u2026', encodingMp3: 'Convirtiendo a MP3 \u00b7 {p} %',
      saving: 'Guardando\u2026', fetchingImage: 'Obteniendo la imagen\u2026', fetchingSubs: 'Obteniendo los subt\u00edtulos\u2026',
      reconnecting: 'Conexi\u00f3n interrumpida, reconectando\u2026', waitingOnline: 'Sin conexi\u00f3n. La descarga continuar\u00e1 cuando vuelvas a estar en l\u00ednea.',
      refreshingLink: 'Renovando el enlace de descarga\u2026', waitingSession: 'Esperando tu sesi\u00f3n de YouTube\u2026 Abre YouTube en tu navegador.',
      sharingBandwidth: 'm\u00e1s lento mientras se reproduce tu video',
      progressOf: '{got} de {total}', perSecond: '{speed}/s', timeLeft: 'quedan {t}',
      toastDownloading: 'Descargando', toastQueued: 'En cola', whatClip: '{what} (clip)',
      toastSaved: 'Descargado', toastCanceled: 'Descarga cancelada', toastFailed: 'Error en la descarga \u00b7 {err}',
      statusFailed: 'Error en la descarga', reloadPage: 'Recargar p\u00e1gina', tipMany: '{n} descargas, {p}%',
      toastAlready: 'Esta descarga ya est\u00e1 en curso',
      folderSet: 'Las descargas se guardar\u00e1n en \u00ab{name}\u00bb', folderReset: 'Las descargas se guardar\u00e1n en la carpeta de descargas del navegador',
      folderNoPerm: 'Sin permiso para la carpeta elegida; se guard\u00f3 en las descargas del navegador',
      folderNeedsChromium: 'Para elegir una carpeta se necesita Chrome, Edge u otro navegador basado en Chromium',
      loopOn: 'Repetici\u00f3n activada', loopOff: 'Repetici\u00f3n desactivada',
      toolbarHidden: 'Barra oculta. Vuelve a mostrarla desde el men\u00fa de Tampermonkey: \u00ab{cmd}\u00bb',
      themeConfirm: 'YouTube recarga la p\u00e1gina para cambiar el tema. Se cancelar\u00e1n las descargas en curso ({n}). \u00bfContinuar?',
      menuShowToolbar: 'Mostrar barra de descargas', menuOpenHistory: 'Abrir historial de descargas',
      errNetwork: 'La conexi\u00f3n se cortaba una y otra vez. Tu progreso se conserva; pulsa Reintentar cuando la conexi\u00f3n sea estable.',
      errReach: 'No se pudo conectar con YouTube. Revisa tu conexi\u00f3n e int\u00e9ntalo de nuevo.',
      errExpired: 'YouTube no permiti\u00f3 terminar esta descarga. Tu progreso se conserva; pulsa Reintentar m\u00e1s tarde.',
      errFormatGone: 'Este formato ya no est\u00e1 disponible.',
      errNoDirect: "YouTube no ofrece este v\u00eddeo como descarga directa en este momento. Int\u00e9ntalo m\u00e1s tarde.",
      errBlocked: "YouTube est\u00e1 bloqueando las descargas de este v\u00eddeo en tu conexi\u00f3n actual. Si usas una VPN, desact\u00edvala o cambia de servidor y pulsa Reintentar. Tu progreso se conserva.",
      dmTitle: "Gestor de descargas",
      dmConnectedHint: "conectado",
      dmNotRunning: "se inicia cuando hace falta",
      dmConnect: "Conectar\u2026",
      dmConnected: "Conectado al Gestor de descargas. Las descargas se guardan ahora en la carpeta que elegiste en \u00e9l.",
      dmPairWaiting: "Confirma la conexi\u00f3n en la ventana del Gestor de descargas de tu PC.",
      dmDenied: "El Gestor de descargas no permiti\u00f3 la conexi\u00f3n.",
      dmNotInstalled: "La app Gestor de descargas no est\u00e1 en ejecuci\u00f3n. Instala YT Download Manager, completa su configuraci\u00f3n y vuelve a intentarlo.",
      dmStarting: "Iniciando el Gestor de descargas\u2026",
      dmUnavailable: "No se pudo iniciar el Gestor de descargas. Puedes iniciarlo desde el men\u00fa Inicio o descargar en el navegador.",
      dmBrowserInstead: "Descargar en el navegador",
      dmUseApp: 'Usar el gestor de descargas',
      extReloaded: 'La extensi\u00f3n se actualiz\u00f3. Vuelve a cargar esta p\u00e1gina para continuar.',
      dmAlreadyDone: "Ya descargaste esto.",
      dmOffline: "El Gestor de descargas no est\u00e1 en ejecuci\u00f3n. Esta descarga continuar\u00e1 cuando vuelva a iniciarse.",
      downloadAgain: "Descargar de nuevo",
      showInFolder: "Mostrar en la carpeta",
      openFolder: "Abrir carpeta",
      dmFolderPicker: "Elige la carpeta en la ventana que se abri\u00f3 en tu PC.",
      downloadingVideo: "Descargando v\u00eddeo\u2026",
      downloadingAudio: "Descargando audio\u2026",
      verifying: "Comprobando el archivo\u2026",
      updatingEngine: "Actualizando el motor de descarga\u2026",
      waitingFolder: "Esperando la carpeta de descargas. Vuelve a conectar su unidad o elige otra carpeta.",
      errPrivate: "Este v\u00eddeo es privado.",
      errNoDownload: 'YouTube no ofrece este v\u00eddeo para descargar.', errDrm: 'Este v\u00eddeo est\u00e1 protegido contra copia, as\u00ed que no se puede descargar.', errSessionExpired: 'Tu sesi\u00f3n de YouTube ha cambiado. Recarga la p\u00e1gina e int\u00e9ntalo de nuevo.', errMembers: "Este v\u00eddeo es solo para miembros del canal.", errSignIn: 'Inicia sesi\u00f3n en YouTube en este navegador para descargar este v\u00eddeo.', errAgeAccount: 'YouTube no permite que tu cuenta vea este v\u00eddeo (verificaci\u00f3n de edad).', errMembersAccount: 'Este v\u00eddeo es para miembros del canal. Tu cuenta no es miembro.', errPrivateAccount: 'Este v\u00eddeo es privado y tu cuenta no tiene acceso.',
      errAge: "Este v\u00eddeo tiene restricci\u00f3n de edad y no se puede descargar sin iniciar sesi\u00f3n.",
      errGeo: "Este v\u00eddeo no est\u00e1 disponible en tu pa\u00eds.",
      errLive: "Las emisiones en directo y los estrenos se pueden descargar cuando terminan.",
      errDiskFull: "No hay suficiente espacio libre. Libera espacio y pulsa Reintentar.",
      errVerify: "El archivo descargado estaba da\u00f1ado y no se guard\u00f3. Pulsa Reintentar para descargarlo de nuevo.",
      errEngine: "El motor de descarga necesita una actualizaci\u00f3n que no se pudo instalar. Comprueba tu conexi\u00f3n a internet y pulsa Reintentar.",
      errEngineMissing: "Faltan partes del Gestor de descargas. Vuelve a ejecutar su configuraci\u00f3n desde el men\u00fa Inicio.",
      errReason: 'YouTube indica: {reason}',
      errUnavailable: 'Este v\u00eddeo no se puede descargar.',
      errFormats: 'No se pudieron cargar los formatos de este v\u00eddeo.',
      errNoThumb: 'No hay miniatura disponible para este v\u00eddeo.',
      errNoSubs: 'YouTube devolvi\u00f3 subt\u00edtulos vac\u00edos.',
      errClip: 'El clip seleccionado est\u00e1 fuera del v\u00eddeo.',
      errNotReady: 'El v\u00eddeo a\u00fan no est\u00e1 listo.',
      errFrame: 'No se pudo capturar este fotograma.',
      errFolder: 'Sin permiso para la carpeta de descargas.',
      errMoved: 'El archivo se ha movido o eliminado.',
      errDecode: 'No se pudo convertir este audio.',
      errGeneric: 'Algo sali\u00f3 mal. Int\u00e9ntalo de nuevo.',
      backToVideo: 'Volver al v\u00eddeo', goHome: 'Inicio, sin detener',
      preparingEngine: 'Preparando el conversor (solo la primera vez) \u00b7 {p} %',
      converting: 'Convirtiendo \u00b7 {p} %',
      folderTitle: 'Carpeta de descargas',
      folderHint: 'Elige una carpeta o crea una nueva, por ejemplo Descargas \u203a YouTube. Los navegadores no permiten que los sitios web guarden directamente en la carpeta principal de Descargas, Documentos o Escritorio, as\u00ed que usa una carpeta dentro de ellas. El selector tiene un bot\u00f3n \u00abNueva carpeta\u00bb.',
      folderChoose: 'Elegir carpeta\u2026',
      folderNotWritable: 'No se pueden guardar archivos en esta carpeta. Elige otra.',
      folderPickFailed: 'Esta carpeta no se puede usar. Elige otra.',
      folderMissing: 'La carpeta \u00ab{name}\u00bb ya no est\u00e1 disponible. Puede que se haya movido o eliminado, o que su unidad est\u00e9 desconectada.',
      folderMissingSaved: 'Tu carpeta de descargas no est\u00e1 disponible, as\u00ed que el archivo se guard\u00f3 en las descargas del navegador.',
      folderPermission: 'necesita permiso',
      folderAllow: 'Permitir acceso',
      folderUnavailable: 'no disponible',
      folderRestartNote: 'Despu\u00e9s de reiniciar el navegador, puede que se te pida una vez que vuelvas a permitir el acceso.',
      errConvert: 'No se pudo convertir este archivo.',
    },
    fr: {
      toolbarLabel: 'Outils de t\u00e9l\u00e9chargement',
      tipVideo: 'T\u00e9l\u00e9charger la vid\u00e9o', tipAudio: "T\u00e9l\u00e9charger l'audio", tipThumb: 'T\u00e9l\u00e9charger la miniature', tipSubs: 'T\u00e9l\u00e9charger les sous-titres',
      tipShot: 'Enregistrer une capture de cette image', download: 'T\u00e9l\u00e9charger', dlShort: 'T\u00e9l\u00e9charger', tipView: "Options d'affichage",
      tipToDark: 'Passer au th\u00e8me sombre', tipToLight: 'Passer au th\u00e8me clair',
      focusMode: 'Grand format', tipFocusOn: 'Grand format : garde la vid\u00e9o visible pendant le d\u00e9filement et la laisse jouer quand vous allez \u00e0 l\u2019accueil', tipFocusOff: 'Quitter le grand format',
      pip: "Image dans l'image", tipPipOff: "Quitter l'image dans l'image", loop: 'Lire en boucle', tipLoopOff: 'Arr\u00eater la lecture en boucle',
      pipActive: 'Lecture en image dans l\u2019image', pipHint: 'La vid\u00e9o continue dans une petite fen\u00eatre qui reste au-dessus de vos autres fen\u00eatres, m\u00eame si vous changez d\u2019onglet.', pipBack: 'Lire \u00e0 nouveau ici', prevShort: 'Vid\u00e9o pr\u00e9c\u00e9dente', nextShort: 'Vid\u00e9o suivante', pipPlay: 'Lire', pipPause: 'Pause', pipMute: 'Couper le son', pipUnmute: 'R\u00e9activer le son', pipFit: 'Afficher toute la vid\u00e9o', pipFill: 'Remplir la fen\u00eatre', pipHintShorts: 'Faites d\u00e9filer dans la fen\u00eatre pour passer au Short suivant. Elle reste au-dessus de vos autres fen\u00eatres, m\u00eame si vous changez d\u2019onglet.',
      settings: 'Param\u00e8tres', help: 'Aide', hideToolbar: 'Masquer la barre', back: 'Retour', close: 'Fermer',
      pin: 'Garder ouvert', unpin: "Fermer en cliquant \u00e0 l'ext\u00e9rieur",
      quality: 'Qualit\u00e9', format: 'Format', language: 'Langue', fileFormat: 'Format de fichier',
      trim: 'D\u00e9couper', start: 'D\u00e9but', end: 'Fin', clipStart: "D\u00e9but de l'extrait", clipEnd: "Fin de l'extrait",
      fullLength: 'Dur\u00e9e compl\u00e8te', clip: 'Extrait', reset: 'R\u00e9initialiser', syncPlayer: 'Synchroniser avec le lecteur', setToNow: 'Utiliser le temps actuel de la vid\u00e9o',
      trimNotOpus: 'Le d\u00e9coupage fonctionne avec MP3, M4A et WAV.',
      added: 'Ajout\u00e9', tryAgain: 'R\u00e9essayer', loadingFormats: 'Chargement des formats\u2026',
      noVideo: 'Aucun format vid\u00e9o t\u00e9l\u00e9chargeable', noAudio: 'Aucun format audio t\u00e9l\u00e9chargeable', noSubs: "Cette vid\u00e9o n'a pas de sous-titres",
      autoSubsNote: 'Les sous-titres g\u00e9n\u00e9r\u00e9s automatiquement portent cette ic\u00f4ne',
      hintCover: 'avec pochette', hintOriginal: "qualit\u00e9 d'origine", hintLossless: 'sans perte',
      thumbMax: 'R\u00e9solution maximale', thumbStandard: 'Standard', thumbHigh: 'Haute', thumbMedium: 'Moyenne', thumbPortrait: 'Vertical',
      notAvailable: 'non disponible', thumbPreview: 'Aper\u00e7u de la miniature',
      appearance: 'Apparence', themeDevice: "Utiliser le th\u00e8me de l'appareil", themeDark: 'Th\u00e8me sombre', themeLight: 'Th\u00e8me clair',
      downloads: 'T\u00e9l\u00e9chargements', changeFolder: 'Changer le dossier de t\u00e9l\u00e9chargement', browserDefault: 'par d\u00e9faut du navigateur',
      useBrowserFolder: 'Utiliser le dossier de t\u00e9l\u00e9chargement du navigateur', autoOpenHistory: "Ouvrir l'historique au d\u00e9but d'un t\u00e9l\u00e9chargement",
      clearFinished: 'Effacer les t\u00e9l\u00e9chargements termin\u00e9s', languageAuto: 'Automatique',
      help1: "Les boutons vid\u00e9o, audio, miniature et sous-titres ouvrent un s\u00e9lecteur. Faites glisser les poign\u00e9es de d\u00e9coupe ou saisissez des temps pour ne t\u00e9l\u00e9charger qu'un extrait.",
      help2: 'L\u2019appareil photo enregistre l\u2019image affich\u00e9e. L\u2019horloge en haut \u00e0 droite de YouTube ouvre votre historique de t\u00e9l\u00e9chargements ; faites glisser son en-t\u00eate pour le d\u00e9placer.',
      help3: 'Le grand format garde la vid\u00e9o visible dans un coin pendant le d\u00e9filement. En allant \u00e0 l\u2019accueil, elle continue dans le mini-lecteur ; \u00ab Revenir \u00e0 la vid\u00e9o \u00bb vous y ram\u00e8ne.',
      help4: "Tout est t\u00e9l\u00e9charg\u00e9 et converti dans votre navigateur. Rien n'est envoy\u00e9 ailleurs qu'\u00e0 YouTube.",
      help5: 'Barre masqu\u00e9e ? Ouvrez le menu Tampermonkey et choisissez \u00ab {cmd} \u00bb.',
      history: 'Historique des t\u00e9l\u00e9chargements', historyActive: 'Historique des t\u00e9l\u00e9chargements ({n} en cours)',
      nActive: 'En cours : {n}', nFinished: 'Termin\u00e9s : {n}', clear: 'Effacer', dragToMove: 'Faire glisser pour d\u00e9placer',
      noDownloads: 'Aucun t\u00e9l\u00e9chargement pour le moment', noDownloadsHint: 'Utilisez la barre sous la vid\u00e9o pour t\u00e9l\u00e9charger.',
      savingTo: 'Enregistrement dans', browserDownloads: 't\u00e9l\u00e9chargements du navigateur', chooseFolder: 'Choisir un dossier', change: 'Changer',
      inFolder: 'dans {folder}', inBrowser: 'dans les t\u00e9l\u00e9chargements du navigateur',
      pause: 'Pause', resume: 'Reprendre', cancel: 'Annuler', play: 'Lire', retry: 'R\u00e9essayer', restart: 'Recommencer', remove: "Retirer de l'historique",
      trimmedClip: 'Extrait d\u00e9coup\u00e9', view: 'Voir', show: 'Afficher',
      stQueued: 'En attente', stDownloading: 'T\u00e9l\u00e9chargement', stPaused: 'En pause', stProcessing: 'Traitement', stCompleted: 'Termin\u00e9', stFailed: '\u00c9chec', stCanceled: 'Annul\u00e9',
      waitingOthers: 'En attente de la fin des autres t\u00e9l\u00e9chargements', starting: 'D\u00e9marrage\u2026', findingClip: "Recherche de l'extrait\u2026",
      merging: "Fusion de la vid\u00e9o et de l'audio\u2026", cutting: "D\u00e9coupe de l'extrait\u2026", decoding: "Pr\u00e9paration de l'audio\u2026", encodingMp3: 'Conversion en MP3 \u00b7 {p} %',
      saving: 'Enregistrement\u2026', fetchingImage: "R\u00e9cup\u00e9ration de l'image\u2026", fetchingSubs: 'R\u00e9cup\u00e9ration des sous-titres\u2026',
      reconnecting: 'Connexion interrompue, reconnexion\u2026', waitingOnline: 'Hors ligne. Le t\u00e9l\u00e9chargement reprendra d\u00e8s le retour de la connexion.',
      refreshingLink: 'Renouvellement du lien de t\u00e9l\u00e9chargement\u2026', waitingSession: 'En attente de votre connexion YouTube\u2026 Ouvrez YouTube dans votre navigateur.',
      sharingBandwidth: 'ralenti pendant la lecture de votre vid\u00e9o',
      progressOf: '{got} sur {total}', perSecond: '{speed}/s', timeLeft: '{t} restant',
      toastDownloading: 'T\u00e9l\u00e9chargement', toastQueued: 'En attente', whatClip: '{what} (extrait)',
      toastSaved: 'T\u00e9l\u00e9charg\u00e9', toastCanceled: 'T\u00e9l\u00e9chargement annul\u00e9', toastFailed: '\u00c9chec du t\u00e9l\u00e9chargement \u00b7 {err}',
      statusFailed: '\u00c9chec du t\u00e9l\u00e9chargement', reloadPage: 'Recharger la page', tipMany: '{n} t\u00e9l\u00e9chargements, {p}%',
      toastAlready: 'Ce t\u00e9l\u00e9chargement est d\u00e9j\u00e0 en cours',
      folderSet: 'Les t\u00e9l\u00e9chargements iront dans \u00ab {name} \u00bb', folderReset: 'Les t\u00e9l\u00e9chargements iront dans le dossier du navigateur',
      folderNoPerm: "Pas d'autorisation pour le dossier choisi : enregistr\u00e9 dans les t\u00e9l\u00e9chargements du navigateur",
      folderNeedsChromium: 'Choisir un dossier n\u00e9cessite Chrome, Edge ou un autre navigateur bas\u00e9 sur Chromium',
      loopOn: 'Lecture en boucle activ\u00e9e', loopOff: 'Lecture en boucle d\u00e9sactiv\u00e9e',
      toolbarHidden: 'Barre masqu\u00e9e. R\u00e9affichez-la depuis le menu Tampermonkey : \u00ab {cmd} \u00bb',
      themeConfirm: 'YouTube recharge la page pour changer de th\u00e8me. Les t\u00e9l\u00e9chargements en cours ({n}) seront annul\u00e9s. Continuer ?',
      menuShowToolbar: 'Afficher la barre de t\u00e9l\u00e9chargement', menuOpenHistory: "Ouvrir l'historique des t\u00e9l\u00e9chargements",
      errNetwork: 'La connexion n\'a cess\u00e9 de se couper. Votre progression est conserv\u00e9e : appuyez sur R\u00e9essayer quand la connexion sera stable.',
      errReach: 'Impossible de joindre YouTube. V\u00e9rifiez votre connexion et r\u00e9essayez.',
      errExpired: 'YouTube n\'a pas permis de terminer ce t\u00e9l\u00e9chargement. Votre progression est conserv\u00e9e : appuyez sur R\u00e9essayer plus tard.',
      errFormatGone: "Ce format n'est plus disponible.",
      errNoDirect: "YouTube ne propose pas cette vid\u00e9o en t\u00e9l\u00e9chargement direct pour le moment. R\u00e9essayez plus tard.",
      errBlocked: "YouTube bloque le t\u00e9l\u00e9chargement de cette vid\u00e9o sur votre connexion actuelle. Si vous utilisez un VPN, d\u00e9sactivez-le ou changez de serveur, puis appuyez sur R\u00e9essayer. Votre progression est conserv\u00e9e.",
      dmTitle: "Gestionnaire de t\u00e9l\u00e9chargements",
      dmConnectedHint: "connect\u00e9",
      dmNotRunning: "d\u00e9marre si n\u00e9cessaire",
      dmConnect: "Connecter\u2026",
      dmConnected: "Connect\u00e9 au Gestionnaire de t\u00e9l\u00e9chargements. Les t\u00e9l\u00e9chargements vont maintenant dans le dossier choisi dans l'application.",
      dmPairWaiting: "Confirmez la connexion dans la fen\u00eatre du Gestionnaire de t\u00e9l\u00e9chargements sur votre PC.",
      dmDenied: "Le Gestionnaire de t\u00e9l\u00e9chargements n'a pas autoris\u00e9 la connexion.",
      dmNotInstalled: "L'application Gestionnaire de t\u00e9l\u00e9chargements n'est pas lanc\u00e9e. Installez YT Download Manager, terminez sa configuration, puis r\u00e9essayez.",
      dmStarting: "D\u00e9marrage du Gestionnaire de t\u00e9l\u00e9chargements\u2026",
      dmUnavailable: "Le Gestionnaire de t\u00e9l\u00e9chargements n'a pas pu d\u00e9marrer. Vous pouvez le lancer depuis le menu D\u00e9marrer ou t\u00e9l\u00e9charger dans le navigateur.",
      dmBrowserInstead: "T\u00e9l\u00e9charger dans le navigateur",
      dmUseApp: 'Utiliser le gestionnaire de t\u00e9l\u00e9chargements',
      extReloaded: 'L\u2019extension a \u00e9t\u00e9 mise \u00e0 jour. Rechargez cette page pour continuer.',
      dmAlreadyDone: "Vous avez d\u00e9j\u00e0 t\u00e9l\u00e9charg\u00e9 ceci.",
      dmOffline: "Le Gestionnaire de t\u00e9l\u00e9chargements n'est pas lanc\u00e9. Ce t\u00e9l\u00e9chargement reprendra \u00e0 son prochain d\u00e9marrage.",
      downloadAgain: "T\u00e9l\u00e9charger \u00e0 nouveau",
      showInFolder: "Afficher dans le dossier",
      openFolder: "Ouvrir le dossier",
      dmFolderPicker: "Choisissez le dossier dans la fen\u00eatre qui s'est ouverte sur votre PC.",
      downloadingVideo: "T\u00e9l\u00e9chargement de la vid\u00e9o\u2026",
      downloadingAudio: "T\u00e9l\u00e9chargement de l'audio\u2026",
      verifying: "V\u00e9rification du fichier\u2026",
      updatingEngine: "Mise \u00e0 jour du moteur de t\u00e9l\u00e9chargement\u2026",
      waitingFolder: "En attente du dossier de t\u00e9l\u00e9chargement. Reconnectez son disque ou choisissez un autre dossier.",
      errPrivate: "Cette vid\u00e9o est priv\u00e9e.",
      errNoDownload: 'YouTube ne propose pas cette vid\u00e9o au t\u00e9l\u00e9chargement.', errDrm: 'Cette vid\u00e9o est prot\u00e9g\u00e9e contre la copie : elle ne peut pas \u00eatre t\u00e9l\u00e9charg\u00e9e.', errSessionExpired: 'Votre connexion YouTube a chang\u00e9. Rechargez la page, puis r\u00e9essayez.', errMembers: "Cette vid\u00e9o est r\u00e9serv\u00e9e aux membres de la cha\u00eene.", errSignIn: 'Connectez-vous \u00e0 YouTube dans ce navigateur pour t\u00e9l\u00e9charger cette vid\u00e9o.', errAgeAccount: 'YouTube ne permet pas \u00e0 votre compte de regarder cette vid\u00e9o (v\u00e9rification de l\u2019\u00e2ge).', errMembersAccount: 'Cette vid\u00e9o est r\u00e9serv\u00e9e aux membres de la cha\u00eene. Votre compte n\u2019en fait pas partie.', errPrivateAccount: 'Cette vid\u00e9o est priv\u00e9e et votre compte n\u2019y a pas acc\u00e8s.',
      errAge: "Cette vid\u00e9o est soumise \u00e0 une limite d'\u00e2ge et ne peut pas \u00eatre t\u00e9l\u00e9charg\u00e9e sans connexion.",
      errGeo: "Cette vid\u00e9o n'est pas disponible dans votre pays.",
      errLive: "Les diffusions en direct et les premi\u00e8res peuvent \u00eatre t\u00e9l\u00e9charg\u00e9es une fois termin\u00e9es.",
      errDiskFull: "Il n'y a pas assez d'espace libre. Lib\u00e9rez de l'espace, puis appuyez sur R\u00e9essayer.",
      errVerify: "Le fichier t\u00e9l\u00e9charg\u00e9 \u00e9tait endommag\u00e9 et n'a pas \u00e9t\u00e9 enregistr\u00e9. Appuyez sur R\u00e9essayer pour le t\u00e9l\u00e9charger \u00e0 nouveau.",
      errEngine: "Le moteur de t\u00e9l\u00e9chargement a besoin d'une mise \u00e0 jour qui n'a pas pu \u00eatre install\u00e9e. V\u00e9rifiez votre connexion internet, puis appuyez sur R\u00e9essayer.",
      errEngineMissing: "Des \u00e9l\u00e9ments du Gestionnaire de t\u00e9l\u00e9chargements manquent. Relancez sa configuration depuis le menu D\u00e9marrer.",
      errReason: 'YouTube indique : {reason}',
      errUnavailable: 'Cette vid\u00e9o ne peut pas \u00eatre t\u00e9l\u00e9charg\u00e9e.',
      errFormats: 'Impossible de charger les formats de cette vid\u00e9o.',
      errNoThumb: 'Aucune miniature disponible pour cette vid\u00e9o.',
      errNoSubs: 'YouTube a renvoy\u00e9 des sous-titres vides.',
      errClip: "L'extrait choisi est en dehors de la vid\u00e9o.",
      errNotReady: "La vid\u00e9o n'est pas encore pr\u00eate.",
      errFrame: 'Impossible de capturer cette image.',
      errFolder: "Pas d'autorisation pour le dossier de t\u00e9l\u00e9chargement.",
      errMoved: 'Le fichier a \u00e9t\u00e9 d\u00e9plac\u00e9 ou supprim\u00e9.',
      errDecode: 'Impossible de convertir cet audio.',
      errGeneric: 'Un probl\u00e8me est survenu. Veuillez r\u00e9essayer.',
      backToVideo: 'Revenir \u00e0 la vid\u00e9o', goHome: 'Accueil, sans arr\u00eater',
      preparingEngine: 'Pr\u00e9paration du convertisseur (la premi\u00e8re fois seulement) \u00b7 {p} %',
      converting: 'Conversion \u00b7 {p} %',
      folderTitle: 'Dossier de t\u00e9l\u00e9chargement',
      folderHint: 'Choisissez un dossier ou cr\u00e9ez-en un, par exemple T\u00e9l\u00e9chargements \u203a YouTube. Les navigateurs n\'autorisent pas les sites web \u00e0 enregistrer directement dans le dossier principal T\u00e9l\u00e9chargements, Documents ou Bureau : utilisez un dossier \u00e0 l\'int\u00e9rieur. Le s\u00e9lecteur propose un bouton \u00ab Nouveau dossier \u00bb.',
      folderChoose: 'Choisir un dossier\u2026',
      folderNotWritable: 'Impossible d\'enregistrer des fichiers dans ce dossier. Veuillez en choisir un autre.',
      folderPickFailed: 'Ce dossier ne peut pas \u00eatre utilis\u00e9. Veuillez en choisir un autre.',
      folderMissing: 'Le dossier \u00ab {name} \u00bb n\'est plus disponible. Il a peut-\u00eatre \u00e9t\u00e9 d\u00e9plac\u00e9 ou supprim\u00e9, ou son disque est d\u00e9connect\u00e9.',
      folderMissingSaved: 'Votre dossier de t\u00e9l\u00e9chargement n\'est pas disponible : le fichier a \u00e9t\u00e9 enregistr\u00e9 dans les t\u00e9l\u00e9chargements du navigateur.',
      folderPermission: 'autorisation requise',
      folderAllow: 'Autoriser l\'acc\u00e8s',
      folderUnavailable: 'indisponible',
      folderRestartNote: 'Apr\u00e8s un red\u00e9marrage du navigateur, il vous sera peut-\u00eatre demand\u00e9 une fois d\'autoriser \u00e0 nouveau l\'acc\u00e8s.',
      errConvert: 'Impossible de convertir ce fichier.',
    },
    it: {
      toolbarLabel: 'Strumenti di download',
      tipVideo: 'Scarica video', tipAudio: 'Scarica audio', tipThumb: 'Scarica miniatura', tipSubs: 'Scarica sottotitoli',
      tipShot: 'Salva uno screenshot di questo fotogramma', download: 'Scarica', dlShort: 'Scarica', tipView: 'Opzioni di visualizzazione',
      tipToDark: 'Passa al tema scuro', tipToLight: 'Passa al tema chiaro',
      focusMode: 'Immagine grande', tipFocusOn: 'Immagine grande: mantiene il video visibile mentre scorri e in riproduzione quando vai alla Home', tipFocusOff: 'Esci da immagine grande',
      pip: 'Picture-in-picture', tipPipOff: 'Esci da picture-in-picture', loop: 'Ripeti video', tipLoopOff: 'Interrompi ripetizione',
      pipActive: 'In riproduzione in picture-in-picture', pipHint: 'Il video continua in una piccola finestra che resta sopra le altre finestre, anche se cambi scheda.', pipBack: 'Riproduci di nuovo qui', prevShort: 'Video precedente', nextShort: 'Video successivo', pipPlay: 'Riproduci', pipPause: 'Pausa', pipMute: 'Disattiva audio', pipUnmute: 'Attiva audio', pipFit: 'Mostra tutto il video', pipFill: 'Riempi la finestra', pipHintShorts: 'Scorri nella finestra per passare allo Short successivo. Resta sopra le altre finestre, anche se cambi scheda.',
      settings: 'Impostazioni', help: 'Guida', hideToolbar: 'Nascondi barra', back: 'Indietro', close: 'Chiudi',
      pin: 'Tieni aperto', unpin: 'Chiudi facendo clic fuori',
      quality: 'Qualit\u00e0', format: 'Formato', language: 'Lingua', fileFormat: 'Formato file',
      trim: 'Taglia', start: 'Inizio', end: 'Fine', clipStart: 'Inizio clip', clipEnd: 'Fine clip',
      fullLength: 'Durata intera', clip: 'Clip', reset: 'Ripristina', syncPlayer: 'Sincronizza con il player', setToNow: 'Usa il tempo attuale del video',
      trimNotOpus: 'Il taglio funziona con MP3, M4A e WAV.',
      added: 'Aggiunto', tryAgain: 'Riprova', loadingFormats: 'Caricamento formati\u2026',
      noVideo: 'Nessun formato video scaricabile', noAudio: 'Nessun formato audio scaricabile', noSubs: 'Questo video non ha sottotitoli',
      autoSubsNote: 'I sottotitoli generati automaticamente sono contrassegnati da questa icona',
      hintCover: 'con copertina', hintOriginal: 'qualit\u00e0 originale', hintLossless: 'senza perdita',
      thumbMax: 'Risoluzione massima', thumbStandard: 'Standard', thumbHigh: 'Alta', thumbMedium: 'Media', thumbPortrait: 'Verticale',
      notAvailable: 'non disponibile', thumbPreview: 'Anteprima della miniatura',
      appearance: 'Aspetto', themeDevice: 'Usa il tema del dispositivo', themeDark: 'Tema scuro', themeLight: 'Tema chiaro',
      downloads: 'Download', changeFolder: 'Cambia cartella dei download', browserDefault: 'predefinita del browser',
      useBrowserFolder: 'Usa la cartella download del browser', autoOpenHistory: "Apri la cronologia all'avvio di un download",
      clearFinished: 'Cancella i download completati', languageAuto: 'Automatica',
      help1: 'I pulsanti video, audio, miniatura e sottotitoli aprono un selettore. Trascina le maniglie di taglio o digita i tempi per scaricare solo una clip.',
      help2: 'La fotocamera salva il fotogramma corrente come immagine. L\u2019orologio in alto a destra su YouTube apre la cronologia dei download; trascina l\u2019intestazione per spostarla.',
      help3: 'Immagine grande mantiene il video visibile nell\u2019angolo mentre scorri. Andando alla Home continua nel mini player; \u00abTorna al video\u00bb ti riporta indietro.',
      help4: 'Tutto viene scaricato e convertito nel tuo browser. Nulla viene inviato altrove se non a YouTube.',
      help5: 'Hai nascosto la barra? Apri il menu di Tampermonkey e scegli \u00ab{cmd}\u00bb.',
      history: 'Cronologia download', historyActive: 'Cronologia download ({n} attivi)',
      nActive: 'Attivi: {n}', nFinished: 'Completati: {n}', clear: 'Cancella', dragToMove: 'Trascina per spostare',
      noDownloads: 'Ancora nessun download', noDownloadsHint: 'Usa la barra sotto il video per scaricare.',
      savingTo: 'Salvataggio in', browserDownloads: 'download del browser', chooseFolder: 'Scegli cartella', change: 'Cambia',
      inFolder: 'in {folder}', inBrowser: 'nei download del browser',
      pause: 'Pausa', resume: 'Riprendi', cancel: 'Annulla', play: 'Riproduci', retry: 'Riprova', restart: 'Ricomincia', remove: 'Rimuovi dalla cronologia',
      trimmedClip: 'Clip tagliata', view: 'Visualizza', show: 'Mostra',
      stQueued: 'In coda', stDownloading: 'Download in corso', stPaused: 'In pausa', stProcessing: 'Elaborazione', stCompleted: 'Completato', stFailed: 'Non riuscito', stCanceled: 'Annullato',
      waitingOthers: 'In attesa che finiscano altri download', starting: 'Avvio\u2026', findingClip: 'Ricerca della clip\u2026',
      merging: 'Unione di video e audio\u2026', cutting: 'Taglio della clip\u2026', decoding: "Preparazione dell'audio\u2026", encodingMp3: 'Conversione in MP3 \u00b7 {p}%',
      saving: 'Salvataggio\u2026', fetchingImage: "Recupero dell'immagine\u2026", fetchingSubs: 'Recupero dei sottotitoli\u2026',
      reconnecting: 'Connessione interrotta, riconnessione\u2026', waitingOnline: 'Offline. Il download riprender\u00e0 quando tornerai online.',
      refreshingLink: 'Rinnovo del link di download\u2026', waitingSession: 'In attesa del tuo accesso a YouTube\u2026 Apri YouTube nel browser.',
      sharingBandwidth: 'pi\u00f9 lento mentre il video \u00e8 in riproduzione',
      progressOf: '{got} di {total}', perSecond: '{speed}/s', timeLeft: '{t} rimanenti',
      toastDownloading: 'Download in corso', toastQueued: 'In coda', whatClip: '{what} (clip)',
      toastSaved: 'Scaricato', toastCanceled: 'Download annullato', toastFailed: 'Download non riuscito \u00b7 {err}',
      statusFailed: 'Download non riuscito', reloadPage: 'Ricarica pagina', tipMany: '{n} download, {p}%',
      toastAlready: 'Questo download \u00e8 gi\u00e0 in corso',
      folderSet: 'I download verranno salvati in \u00ab{name}\u00bb', folderReset: 'I download verranno salvati nella cartella del browser',
      folderNoPerm: 'Nessuna autorizzazione per la cartella scelta, salvato nei download del browser',
      folderNeedsChromium: 'Per scegliere una cartella serve Chrome, Edge o un altro browser basato su Chromium',
      loopOn: 'Ripetizione attiva', loopOff: 'Ripetizione disattivata',
      toolbarHidden: 'Barra nascosta. Puoi ripristinarla dal menu di Tampermonkey: \u00ab{cmd}\u00bb',
      themeConfirm: 'YouTube ricarica la pagina per cambiare tema. I download in corso ({n}) verranno annullati. Continuare?',
      menuShowToolbar: 'Mostra barra dei download', menuOpenHistory: 'Apri cronologia download',
      errNetwork: 'La connessione continuava a interrompersi. I progressi sono salvati: premi Riprova quando la connessione sar\u00e0 stabile.',
      errReach: 'Impossibile raggiungere YouTube. Controlla la connessione e riprova.',
      errExpired: 'YouTube non ha permesso di completare questo download. I progressi sono salvati: premi Riprova pi\u00f9 tardi.',
      errFormatGone: 'Questo formato non \u00e8 pi\u00f9 disponibile.',
      errNoDirect: "YouTube al momento non offre questo video come download diretto. Riprova pi\u00f9 tardi.",
      errBlocked: "YouTube sta bloccando i download di questo video sulla tua connessione attuale. Se usi una VPN, disattivala o cambia server, poi premi Riprova. I progressi sono salvati.",
      dmTitle: "Gestore download",
      dmConnectedHint: "connesso",
      dmNotRunning: "si avvia quando serve",
      dmConnect: "Connetti\u2026",
      dmConnected: "Connesso al Gestore download. I download ora vanno nella cartella scelta nell'app.",
      dmPairWaiting: "Conferma la connessione nella finestra del Gestore download sul tuo PC.",
      dmDenied: "Il Gestore download non ha consentito la connessione.",
      dmNotInstalled: "L'app Gestore download non \u00e8 in esecuzione. Installa YT Download Manager, completa la configurazione e riprova.",
      dmStarting: "Avvio del Gestore download\u2026",
      dmUnavailable: "Impossibile avviare il Gestore download. Puoi avviarlo dal menu Start oppure scaricare nel browser.",
      dmBrowserInstead: "Scarica nel browser",
      dmUseApp: 'Usa il gestore download',
      extReloaded: 'L\u2019estensione \u00e8 stata aggiornata. Ricarica questa pagina per continuare.',
      dmAlreadyDone: "L'hai gi\u00e0 scaricato.",
      dmOffline: "Il Gestore download non \u00e8 in esecuzione. Questo download riprender\u00e0 al prossimo avvio.",
      downloadAgain: "Scarica di nuovo",
      showInFolder: "Mostra nella cartella",
      openFolder: "Apri cartella",
      dmFolderPicker: "Scegli la cartella nella finestra che si \u00e8 aperta sul tuo PC.",
      downloadingVideo: "Download del video\u2026",
      downloadingAudio: "Download dell'audio\u2026",
      verifying: "Controllo del file\u2026",
      updatingEngine: "Aggiornamento del motore di download\u2026",
      waitingFolder: "In attesa della cartella di download. Ricollega l'unit\u00e0 o scegli un'altra cartella.",
      errPrivate: "Questo video \u00e8 privato.",
      errNoDownload: 'YouTube non offre questo video per il download.', errDrm: 'Questo video \u00e8 protetto da copia, quindi non si pu\u00f2 scaricare.', errSessionExpired: 'Il tuo accesso a YouTube \u00e8 cambiato. Ricarica la pagina e riprova.', errMembers: "Questo video \u00e8 riservato ai membri del canale.", errSignIn: 'Accedi a YouTube in questo browser per scaricare questo video.', errAgeAccount: 'YouTube non consente al tuo account di guardare questo video (verifica dell\u2019et\u00e0).', errMembersAccount: 'Questo video \u00e8 per i membri del canale. Il tuo account non \u00e8 un membro.', errPrivateAccount: 'Questo video \u00e8 privato e il tuo account non vi ha accesso.',
      errAge: "Questo video ha limiti di et\u00e0 e non pu\u00f2 essere scaricato senza accedere.",
      errGeo: "Questo video non \u00e8 disponibile nel tuo paese.",
      errLive: "Le dirette e le prime visioni si possono scaricare quando sono terminate.",
      errDiskFull: "Spazio libero insufficiente. Libera spazio, poi premi Riprova.",
      errVerify: "Il file scaricato era danneggiato e non \u00e8 stato salvato. Premi Riprova per scaricarlo di nuovo.",
      errEngine: "Il motore di download richiede un aggiornamento che non \u00e8 stato possibile installare. Controlla la connessione a internet, poi premi Riprova.",
      errEngineMissing: "Mancano alcune parti del Gestore download. Esegui di nuovo la configurazione dal menu Start.",
      errReason: 'YouTube segnala: {reason}',
      errUnavailable: 'Questo video non pu\u00f2 essere scaricato.',
      errFormats: 'Impossibile caricare i formati di questo video.',
      errNoThumb: 'Nessuna miniatura disponibile per questo video.',
      errNoSubs: 'YouTube ha restituito sottotitoli vuoti.',
      errClip: 'La clip selezionata \u00e8 fuori dal video.',
      errNotReady: 'Il video non \u00e8 ancora pronto.',
      errFrame: 'Impossibile catturare questo fotogramma.',
      errFolder: 'Nessuna autorizzazione per la cartella dei download.',
      errMoved: 'Il file \u00e8 stato spostato o eliminato.',
      errDecode: 'Impossibile convertire questo audio.',
      errGeneric: 'Si \u00e8 verificato un problema. Riprova.',
      backToVideo: 'Torna al video', goHome: 'Home, senza interrompere',
      preparingEngine: 'Preparazione del convertitore (solo la prima volta) \u00b7 {p}%',
      converting: 'Conversione \u00b7 {p}%',
      folderTitle: 'Cartella dei download',
      folderHint: 'Scegli una cartella o creane una nuova, ad esempio Download \u203a YouTube. I browser non consentono ai siti web di salvare direttamente nella cartella principale Download, Documenti o Desktop, quindi usa una cartella al loro interno. Il selettore ha un pulsante \u00abNuova cartella\u00bb.',
      folderChoose: 'Scegli cartella\u2026',
      folderNotWritable: 'Impossibile salvare file in questa cartella. Scegline un\'altra.',
      folderPickFailed: 'Questa cartella non pu\u00f2 essere usata. Scegline un\'altra.',
      folderMissing: 'La cartella \u00ab{name}\u00bb non \u00e8 pi\u00f9 disponibile. Potrebbe essere stata spostata o eliminata, oppure l\'unit\u00e0 \u00e8 scollegata.',
      folderMissingSaved: 'La cartella dei download non \u00e8 disponibile, quindi il file \u00e8 stato salvato nei download del browser.',
      folderPermission: 'serve l\'autorizzazione',
      folderAllow: 'Consenti accesso',
      folderUnavailable: 'non disponibile',
      folderRestartNote: 'Dopo il riavvio del browser potrebbe esserti chiesto una volta di consentire di nuovo l\'accesso.',
      errConvert: 'Impossibile convertire questo file.',
    },
    pt: {
      toolbarLabel: 'Ferramentas de download',
      tipVideo: 'Baixar v\u00eddeo', tipAudio: 'Baixar \u00e1udio', tipThumb: 'Baixar miniatura', tipSubs: 'Baixar legendas',
      tipShot: 'Salvar uma captura deste quadro', download: 'Baixar', dlShort: 'Baixar', tipView: 'Op\u00e7\u00f5es de visualiza\u00e7\u00e3o',
      tipToDark: 'Mudar para o tema escuro', tipToLight: 'Mudar para o tema claro',
      focusMode: 'Imagem grande', tipFocusOn: 'Imagem grande: mant\u00e9m o v\u00eddeo vis\u00edvel enquanto voc\u00ea rola e tocando ao ir para o in\u00edcio', tipFocusOff: 'Sair da imagem grande',
      pip: 'Picture-in-picture', tipPipOff: 'Sair do picture-in-picture', loop: 'Repetir v\u00eddeo', tipLoopOff: 'Parar de repetir',
      pipActive: 'Reproduzindo em picture-in-picture', pipHint: 'O v\u00eddeo continua em uma janela pequena que fica sobre as suas outras janelas, mesmo se voc\u00ea trocar de aba.', pipBack: 'Reproduzir aqui de novo', prevShort: 'V\u00eddeo anterior', nextShort: 'Pr\u00f3ximo v\u00eddeo', pipPlay: 'Reproduzir', pipPause: 'Pausar', pipMute: 'Desativar som', pipUnmute: 'Ativar som', pipFit: 'Mostrar o v\u00eddeo inteiro', pipFill: 'Preencher a janela', pipHintShorts: 'Role na janela para ir ao pr\u00f3ximo Short. Ela fica acima das outras janelas, mesmo se voc\u00ea mudar de guia.',
      settings: 'Configura\u00e7\u00f5es', help: 'Ajuda', hideToolbar: 'Ocultar barra', back: 'Voltar', close: 'Fechar',
      pin: 'Manter aberto', unpin: 'Fechar ao clicar fora',
      quality: 'Qualidade', format: 'Formato', language: 'Idioma', fileFormat: 'Formato do arquivo',
      trim: 'Cortar', start: 'In\u00edcio', end: 'Fim', clipStart: 'In\u00edcio do clipe', clipEnd: 'Fim do clipe',
      fullLength: 'Dura\u00e7\u00e3o completa', clip: 'Clipe', reset: 'Redefinir', syncPlayer: 'Sincronizar com o player', setToNow: 'Usar o tempo atual do v\u00eddeo',
      trimNotOpus: 'O corte funciona com MP3, M4A e WAV.',
      added: 'Adicionado', tryAgain: 'Tentar novamente', loadingFormats: 'Carregando formatos\u2026',
      noVideo: 'Nenhum formato de v\u00eddeo dispon\u00edvel para download', noAudio: 'Nenhum formato de \u00e1udio dispon\u00edvel para download', noSubs: 'Este v\u00eddeo n\u00e3o tem legendas',
      autoSubsNote: 'Legendas geradas automaticamente s\u00e3o marcadas com este \u00edcone',
      hintCover: 'com capa', hintOriginal: 'qualidade original', hintLossless: 'sem perdas',
      thumbMax: 'Resolu\u00e7\u00e3o m\u00e1xima', thumbStandard: 'Padr\u00e3o', thumbHigh: 'Alta', thumbMedium: 'M\u00e9dia', thumbPortrait: 'Vertical',
      notAvailable: 'indispon\u00edvel', thumbPreview: 'Pr\u00e9via da miniatura',
      appearance: 'Apar\u00eancia', themeDevice: 'Usar o tema do dispositivo', themeDark: 'Tema escuro', themeLight: 'Tema claro',
      downloads: 'Downloads', changeFolder: 'Alterar pasta de downloads', browserDefault: 'padr\u00e3o do navegador',
      useBrowserFolder: 'Usar a pasta de downloads do navegador', autoOpenHistory: 'Abrir o hist\u00f3rico ao iniciar um download',
      clearFinished: 'Limpar downloads conclu\u00eddos', languageAuto: 'Autom\u00e1tico',
      help1: 'Os bot\u00f5es de v\u00eddeo, \u00e1udio, miniatura e legendas abrem um seletor. Arraste as al\u00e7as de corte ou digite os tempos para baixar s\u00f3 um clipe.',
      help2: 'A c\u00e2mera salva o quadro atual como imagem. O rel\u00f3gio no canto superior direito do YouTube abre seu hist\u00f3rico de downloads; arraste o cabe\u00e7alho para mov\u00ea-lo.',
      help3: 'Imagem grande mant\u00e9m o v\u00eddeo vis\u00edvel no canto enquanto voc\u00ea rola. Ao ir para o in\u00edcio, ele continua no miniplayer; \u201cVoltar ao v\u00eddeo\u201d leva voc\u00ea de volta.',
      help4: 'Tudo \u00e9 baixado e convertido no seu navegador. Nada \u00e9 enviado para outro lugar al\u00e9m do YouTube.',
      help5: 'Ocultou a barra? Abra o menu do Tampermonkey e escolha \u201c{cmd}\u201d.',
      history: 'Hist\u00f3rico de downloads', historyActive: 'Hist\u00f3rico de downloads ({n} ativos)',
      nActive: 'Ativos: {n}', nFinished: 'Conclu\u00eddos: {n}', clear: 'Limpar', dragToMove: 'Arraste para mover',
      noDownloads: 'Nenhum download ainda', noDownloadsHint: 'Use a barra abaixo do v\u00eddeo para baixar.',
      savingTo: 'Salvando em', browserDownloads: 'downloads do navegador', chooseFolder: 'Escolher pasta', change: 'Alterar',
      inFolder: 'em {folder}', inBrowser: 'nos downloads do navegador',
      pause: 'Pausar', resume: 'Retomar', cancel: 'Cancelar', play: 'Reproduzir', retry: 'Tentar novamente', restart: 'Recome\u00e7ar', remove: 'Remover do hist\u00f3rico',
      trimmedClip: 'Clipe cortado', view: 'Ver', show: 'Mostrar',
      stQueued: 'Na fila', stDownloading: 'Baixando', stPaused: 'Pausado', stProcessing: 'Processando', stCompleted: 'Conclu\u00eddo', stFailed: 'Falhou', stCanceled: 'Cancelado',
      waitingOthers: 'Aguardando outros downloads terminarem', starting: 'Iniciando\u2026', findingClip: 'Localizando o clipe\u2026',
      merging: 'Juntando v\u00eddeo e \u00e1udio\u2026', cutting: 'Cortando o clipe\u2026', decoding: 'Preparando o \u00e1udio\u2026', encodingMp3: 'Convertendo para MP3 \u00b7 {p}%',
      saving: 'Salvando\u2026', fetchingImage: 'Obtendo a imagem\u2026', fetchingSubs: 'Obtendo as legendas\u2026',
      reconnecting: 'Conex\u00e3o interrompida, reconectando\u2026', waitingOnline: 'Sem conex\u00e3o. O download continua quando voc\u00ea voltar a ficar on-line.',
      refreshingLink: 'Renovando o link de download\u2026', waitingSession: 'Aguardando seu login no YouTube\u2026 Abra o YouTube no navegador.',
      sharingBandwidth: 'mais lento enquanto seu v\u00eddeo \u00e9 reproduzido',
      progressOf: '{got} de {total}', perSecond: '{speed}/s', timeLeft: 'faltam {t}',
      toastDownloading: 'Baixando', toastQueued: 'Na fila', whatClip: '{what} (clipe)',
      toastSaved: 'Baixado', toastCanceled: 'Download cancelado', toastFailed: 'Falha no download \u00b7 {err}',
      statusFailed: 'Falha no download', reloadPage: 'Recarregar p\u00e1gina', tipMany: '{n} downloads, {p}%',
      toastAlready: 'Este download j\u00e1 est\u00e1 em andamento',
      folderSet: 'Os downloads agora v\u00e3o para \u201c{name}\u201d', folderReset: 'Os downloads agora v\u00e3o para a pasta de downloads do navegador',
      folderNoPerm: 'Sem permiss\u00e3o para a pasta escolhida, ent\u00e3o foi salvo nos downloads do navegador',
      folderNeedsChromium: 'Escolher uma pasta requer Chrome, Edge ou outro navegador baseado no Chromium',
      loopOn: 'Repeti\u00e7\u00e3o ativada', loopOff: 'Repeti\u00e7\u00e3o desativada',
      toolbarHidden: 'Barra oculta. Mostre-a novamente pelo menu do Tampermonkey: \u201c{cmd}\u201d',
      themeConfirm: 'O YouTube recarrega a p\u00e1gina para mudar o tema. Os downloads em andamento ({n}) ser\u00e3o cancelados. Continuar?',
      menuShowToolbar: 'Mostrar barra de downloads', menuOpenHistory: 'Abrir hist\u00f3rico de downloads',
      errNetwork: 'A conex\u00e3o caiu v\u00e1rias vezes. Seu progresso foi mantido; tente novamente quando a conex\u00e3o estiver est\u00e1vel.',
      errReach: 'N\u00e3o foi poss\u00edvel acessar o YouTube. Verifique sua conex\u00e3o e tente novamente.',
      errExpired: 'O YouTube n\u00e3o permitiu concluir este download. Seu progresso foi mantido; toque em Tentar novamente mais tarde.',
      errFormatGone: 'Este formato n\u00e3o est\u00e1 mais dispon\u00edvel.',
      errNoDirect: "O YouTube n\u00e3o oferece este v\u00eddeo como download direto no momento. Tente novamente mais tarde.",
      errBlocked: "O YouTube est\u00e1 bloqueando downloads deste v\u00eddeo na sua conex\u00e3o atual. Se voc\u00ea usa uma VPN, desative-a ou troque de servidor e toque em Tentar novamente. Seu progresso foi mantido.",
      dmTitle: "Gerenciador de downloads",
      dmConnectedHint: "conectado",
      dmNotRunning: "inicia quando necess\u00e1rio",
      dmConnect: "Conectar\u2026",
      dmConnected: "Conectado ao Gerenciador de downloads. Os downloads agora v\u00e3o para a pasta escolhida nele.",
      dmPairWaiting: "Confirme a conex\u00e3o na janela do Gerenciador de downloads no seu PC.",
      dmDenied: "O Gerenciador de downloads n\u00e3o permitiu a conex\u00e3o.",
      dmNotInstalled: "O app Gerenciador de downloads n\u00e3o est\u00e1 em execu\u00e7\u00e3o. Instale o YT Download Manager, conclua a configura\u00e7\u00e3o e tente novamente.",
      dmStarting: "Iniciando o Gerenciador de downloads\u2026",
      dmUnavailable: "N\u00e3o foi poss\u00edvel iniciar o Gerenciador de downloads. Voc\u00ea pode inici\u00e1-lo pelo menu Iniciar ou baixar no navegador.",
      dmBrowserInstead: "Baixar no navegador",
      dmUseApp: 'Usar o gerenciador de downloads',
      extReloaded: 'A extens\u00e3o foi atualizada. Recarregue esta p\u00e1gina para continuar.',
      dmAlreadyDone: "Voc\u00ea j\u00e1 baixou isto.",
      dmOffline: "O Gerenciador de downloads n\u00e3o est\u00e1 em execu\u00e7\u00e3o. Este download continua quando ele iniciar de novo.",
      downloadAgain: "Baixar novamente",
      showInFolder: "Mostrar na pasta",
      openFolder: "Abrir pasta",
      dmFolderPicker: "Escolha a pasta na janela que se abriu no seu PC.",
      downloadingVideo: "Baixando o v\u00eddeo\u2026",
      downloadingAudio: "Baixando o \u00e1udio\u2026",
      verifying: "Verificando o arquivo\u2026",
      updatingEngine: "Atualizando o mecanismo de download\u2026",
      waitingFolder: "Aguardando a pasta de downloads. Reconecte a unidade ou escolha outra pasta.",
      errPrivate: "Este v\u00eddeo \u00e9 privado.",
      errNoDownload: 'O YouTube n\u00e3o oferece este v\u00eddeo para download.', errDrm: 'Este v\u00eddeo \u00e9 protegido contra c\u00f3pia e n\u00e3o pode ser baixado.', errSessionExpired: 'Seu login no YouTube mudou. Recarregue a p\u00e1gina e tente de novo.', errMembers: "Este v\u00eddeo \u00e9 s\u00f3 para membros do canal.", errSignIn: 'Fa\u00e7a login no YouTube neste navegador para baixar este v\u00eddeo.', errAgeAccount: 'O YouTube n\u00e3o permite que sua conta assista a este v\u00eddeo (verifica\u00e7\u00e3o de idade).', errMembersAccount: 'Este v\u00eddeo \u00e9 para membros do canal. Sua conta n\u00e3o \u00e9 membro.', errPrivateAccount: 'Este v\u00eddeo \u00e9 privado e sua conta n\u00e3o tem acesso a ele.',
      errAge: "Este v\u00eddeo tem restri\u00e7\u00e3o de idade e n\u00e3o pode ser baixado sem fazer login.",
      errGeo: "Este v\u00eddeo n\u00e3o est\u00e1 dispon\u00edvel no seu pa\u00eds.",
      errLive: "Transmiss\u00f5es ao vivo e estreias podem ser baixadas depois que terminarem.",
      errDiskFull: "N\u00e3o h\u00e1 espa\u00e7o livre suficiente. Libere espa\u00e7o e toque em Tentar novamente.",
      errVerify: "O arquivo baixado estava danificado e n\u00e3o foi salvo. Toque em Tentar novamente para baix\u00e1-lo de novo.",
      errEngine: "O mecanismo de download precisa de uma atualiza\u00e7\u00e3o que n\u00e3o p\u00f4de ser instalada. Verifique sua conex\u00e3o com a internet e toque em Tentar novamente.",
      errEngineMissing: "Faltam partes do Gerenciador de downloads. Execute a configura\u00e7\u00e3o novamente pelo menu Iniciar.",
      errReason: 'O YouTube informa: {reason}',
      errUnavailable: 'Este v\u00eddeo n\u00e3o pode ser baixado.',
      errFormats: 'N\u00e3o foi poss\u00edvel carregar os formatos deste v\u00eddeo.',
      errNoThumb: 'Nenhuma miniatura dispon\u00edvel para este v\u00eddeo.',
      errNoSubs: 'O YouTube retornou legendas vazias.',
      errClip: 'O clipe selecionado est\u00e1 fora do v\u00eddeo.',
      errNotReady: 'O v\u00eddeo ainda n\u00e3o est\u00e1 pronto.',
      errFrame: 'N\u00e3o foi poss\u00edvel capturar este quadro.',
      errFolder: 'Sem permiss\u00e3o para a pasta de downloads.',
      errMoved: 'O arquivo foi movido ou exclu\u00eddo.',
      errDecode: 'N\u00e3o foi poss\u00edvel converter este \u00e1udio.',
      errGeneric: 'Algo deu errado. Tente novamente.',
      backToVideo: 'Voltar ao v\u00eddeo', goHome: 'In\u00edcio, sem parar',
      preparingEngine: 'Preparando o conversor (s\u00f3 na primeira vez) \u00b7 {p}%',
      converting: 'Convertendo \u00b7 {p}%',
      folderTitle: 'Pasta de downloads',
      folderHint: 'Escolha uma pasta ou crie uma nova, por exemplo Downloads \u203a YouTube. Os navegadores n\u00e3o permitem que sites salvem diretamente na pasta principal de Downloads, Documentos ou \u00c1rea de Trabalho, ent\u00e3o use uma pasta dentro delas. O seletor tem um bot\u00e3o \u201cNova pasta\u201d.',
      folderChoose: 'Escolher pasta\u2026',
      folderNotWritable: 'N\u00e3o \u00e9 poss\u00edvel salvar arquivos nesta pasta. Escolha outra.',
      folderPickFailed: 'Esta pasta n\u00e3o pode ser usada. Escolha outra.',
      folderMissing: 'A pasta \u201c{name}\u201d n\u00e3o est\u00e1 mais dispon\u00edvel. Ela pode ter sido movida ou exclu\u00edda, ou a unidade foi desconectada.',
      folderMissingSaved: 'Sua pasta de downloads n\u00e3o est\u00e1 dispon\u00edvel, ent\u00e3o o arquivo foi salvo nos downloads do navegador.',
      folderPermission: 'precisa de permiss\u00e3o',
      folderAllow: 'Permitir acesso',
      folderUnavailable: 'indispon\u00edvel',
      folderRestartNote: 'Depois de reiniciar o navegador, talvez seja pedido uma vez que voc\u00ea permita o acesso novamente.',
      errConvert: 'N\u00e3o foi poss\u00edvel converter este arquivo.',
    },
    pl: {
      toolbarLabel: 'Narz\u0119dzia pobierania',
      tipVideo: 'Pobierz wideo', tipAudio: 'Pobierz d\u017awi\u0119k', tipThumb: 'Pobierz miniatur\u0119', tipSubs: 'Pobierz napisy',
      tipShot: 'Zapisz zrzut tej klatki', download: 'Pobierz', dlShort: 'Pobierz', tipView: 'Opcje widoku',
      tipToDark: 'Prze\u0142\u0105cz na ciemny motyw', tipToLight: 'Prze\u0142\u0105cz na jasny motyw',
      focusMode: 'Du\u017cy obraz', tipFocusOn: 'Du\u017cy obraz: film pozostaje widoczny podczas przewijania i gra dalej po przej\u015bciu na stron\u0119 g\u0142\u00f3wn\u0105', tipFocusOff: 'Wy\u0142\u0105cz du\u017cy obraz',
      pip: 'Obraz w obrazie', tipPipOff: 'Zamknij obraz w obrazie', loop: 'Zap\u0119tl film', tipLoopOff: 'Wy\u0142\u0105cz zap\u0119tlanie',
      pipActive: 'Odtwarzanie w trybie obraz w obrazie', pipHint: 'Film leci dalej w ma\u0142ym oknie, kt\u00f3re zostaje nad innymi oknami, tak\u017ce po zmianie karty.', pipBack: 'Odtwarzaj znowu tutaj', prevShort: 'Poprzedni film', nextShort: 'Nast\u0119pny film', pipPlay: 'Odtw\u00f3rz', pipPause: 'Wstrzymaj', pipMute: 'Wycisz', pipUnmute: 'W\u0142\u0105cz d\u017awi\u0119k', pipFit: 'Poka\u017c ca\u0142y film', pipFill: 'Wype\u0142nij okno', pipHintShorts: 'Przewi\u0144 w oknie, aby przej\u015b\u0107 do nast\u0119pnego Shorta. Okno zostaje nad innymi oknami, nawet gdy zmienisz kart\u0119.',
      settings: 'Ustawienia', help: 'Pomoc', hideToolbar: 'Ukryj pasek', back: 'Wstecz', close: 'Zamknij',
      pin: 'Nie zamykaj', unpin: 'Zamykaj po klikni\u0119ciu obok',
      quality: 'Jako\u015b\u0107', format: 'Format', language: 'J\u0119zyk', fileFormat: 'Format pliku',
      trim: 'Przytnij', start: 'Pocz\u0105tek', end: 'Koniec', clipStart: 'Pocz\u0105tek klipu', clipEnd: 'Koniec klipu',
      fullLength: 'Ca\u0142a d\u0142ugo\u015b\u0107', clip: 'Klip', reset: 'Resetuj', syncPlayer: 'Synchronizuj z odtwarzaczem', setToNow: 'U\u017cyj bie\u017c\u0105cego czasu filmu',
      trimNotOpus: 'Przycinanie dzia\u0142a z MP3, M4A i WAV.',
      added: 'Dodano', tryAgain: 'Spr\u00f3buj ponownie', loadingFormats: 'Wczytywanie format\u00f3w\u2026',
      noVideo: 'Brak format\u00f3w wideo do pobrania', noAudio: 'Brak format\u00f3w d\u017awi\u0119ku do pobrania', noSubs: 'Ten film nie ma napis\u00f3w',
      autoSubsNote: 'Napisy generowane automatycznie s\u0105 oznaczone t\u0105 ikon\u0105',
      hintCover: 'z ok\u0142adk\u0105', hintOriginal: 'oryginalna jako\u015b\u0107', hintLossless: 'bezstratnie',
      thumbMax: 'Maksymalna rozdzielczo\u015b\u0107', thumbStandard: 'Standardowa', thumbHigh: 'Wysoka', thumbMedium: '\u015arednia', thumbPortrait: 'Pionowa',
      notAvailable: 'niedost\u0119pna', thumbPreview: 'Podgl\u0105d miniatury',
      appearance: 'Wygl\u0105d', themeDevice: 'Motyw urz\u0105dzenia', themeDark: 'Ciemny motyw', themeLight: 'Jasny motyw',
      downloads: 'Pobrane', changeFolder: 'Zmie\u0144 folder pobierania', browserDefault: 'domy\u015blny przegl\u0105darki',
      useBrowserFolder: 'U\u017cyj folderu pobierania przegl\u0105darki', autoOpenHistory: 'Otwieraj histori\u0119 po rozpocz\u0119ciu pobierania',
      clearFinished: 'Wyczy\u015b\u0107 uko\u0144czone pobrania', languageAuto: 'Automatycznie',
      help1: 'Przyciski wideo, d\u017awi\u0119ku, miniatury i napis\u00f3w otwieraj\u0105 wyb\u00f3r. Przeci\u0105gnij uchwyty przycinania lub wpisz czasy, aby pobra\u0107 tylko fragment.',
      help2: 'Aparat zapisuje bie\u017c\u0105c\u0105 klatk\u0119 jako obraz. Zegar w prawym g\u00f3rnym rogu YouTube otwiera histori\u0119 pobierania; przeci\u0105gnij jej nag\u0142\u00f3wek, aby j\u0105 przesun\u0105\u0107.',
      help3: 'Du\u017cy obraz utrzymuje film w rogu podczas przewijania. Po przej\u015bciu na stron\u0119 g\u0142\u00f3wn\u0105 gra dalej w miniodtwarzaczu; \u201eWr\u00f3\u0107 do filmu\u201d przenosi z powrotem.',
      help4: 'Wszystko jest pobierane i konwertowane w przegl\u0105darce. Nic nie jest wysy\u0142ane nigdzie poza YouTube.',
      help5: 'Ukryto pasek? Otw\u00f3rz menu Tampermonkey i wybierz \u201e{cmd}\u201d.',
      history: 'Historia pobierania', historyActive: 'Historia pobierania (aktywne: {n})',
      nActive: 'Aktywne: {n}', nFinished: 'Uko\u0144czone: {n}', clear: 'Wyczy\u015b\u0107', dragToMove: 'Przeci\u0105gnij, aby przesun\u0105\u0107',
      noDownloads: 'Nic jeszcze nie pobrano', noDownloadsHint: 'U\u017cyj paska pod filmem, aby pobra\u0107.',
      savingTo: 'Zapis do', browserDownloads: 'pobranych przegl\u0105darki', chooseFolder: 'Wybierz folder', change: 'Zmie\u0144',
      inFolder: 'w {folder}', inBrowser: 'w pobranych przegl\u0105darki',
      pause: 'Wstrzymaj', resume: 'Wzn\u00f3w', cancel: 'Anuluj', play: 'Odtw\u00f3rz', retry: 'Pon\u00f3w', restart: 'Zacznij od nowa', remove: 'Usu\u0144 z historii',
      trimmedClip: 'Przyci\u0119ty klip', view: 'Poka\u017c', show: 'Poka\u017c',
      stQueued: 'W kolejce', stDownloading: 'Pobieranie', stPaused: 'Wstrzymano', stProcessing: 'Przetwarzanie', stCompleted: 'Uko\u0144czono', stFailed: 'B\u0142\u0105d', stCanceled: 'Anulowano',
      waitingOthers: 'Czeka na zako\u0144czenie innych pobra\u0144', starting: 'Uruchamianie\u2026', findingClip: 'Szukanie klipu\u2026',
      merging: '\u0141\u0105czenie obrazu i d\u017awi\u0119ku\u2026', cutting: 'Przycinanie klipu\u2026', decoding: 'Przygotowywanie d\u017awi\u0119ku\u2026', encodingMp3: 'Konwersja do MP3 \u00b7 {p}%',
      saving: 'Zapisywanie\u2026', fetchingImage: 'Pobieranie obrazu\u2026', fetchingSubs: 'Pobieranie napis\u00f3w\u2026',
      reconnecting: 'Po\u0142\u0105czenie przerwane, ponowne \u0142\u0105czenie\u2026', waitingOnline: 'Brak po\u0142\u0105czenia. Pobieranie wznowi si\u0119 po powrocie do sieci.',
      refreshingLink: 'Od\u015bwie\u017canie linku pobierania\u2026', waitingSession: 'Czekam na Twoje logowanie do YouTube\u2026 Otw\u00f3rz YouTube w przegl\u0105darce.',
      sharingBandwidth: 'wolniej podczas odtwarzania filmu',
      progressOf: '{got} z {total}', perSecond: '{speed}/s', timeLeft: 'zosta\u0142o {t}',
      toastDownloading: 'Pobieranie', toastQueued: 'W kolejce', whatClip: '{what} (klip)',
      toastSaved: 'Pobrano', toastCanceled: 'Anulowano pobieranie', toastFailed: 'Pobieranie nie powiod\u0142o si\u0119 \u00b7 {err}',
      statusFailed: 'Pobieranie nieudane', reloadPage: 'Od\u015bwie\u017c stron\u0119', tipMany: 'Pobierane: {n}, {p}%',
      toastAlready: 'To pobieranie ju\u017c trwa',
      folderSet: 'Pobrane pliki trafi\u0105 do \u201e{name}\u201d', folderReset: 'Pobrane pliki trafi\u0105 do folderu pobierania przegl\u0105darki',
      folderNoPerm: 'Brak uprawnie\u0144 do wybranego folderu, zapisano w pobranych przegl\u0105darki',
      folderNeedsChromium: 'Wyb\u00f3r folderu wymaga Chrome, Edge lub innej przegl\u0105darki opartej na Chromium',
      loopOn: 'Zap\u0119tlanie w\u0142\u0105czone', loopOff: 'Zap\u0119tlanie wy\u0142\u0105czone',
      toolbarHidden: 'Pasek ukryty. Przywr\u00f3cisz go w menu Tampermonkey: \u201e{cmd}\u201d',
      themeConfirm: 'YouTube prze\u0142aduje stron\u0119, aby zmieni\u0107 motyw. Trwaj\u0105ce pobrania ({n}) zostan\u0105 anulowane. Kontynuowa\u0107?',
      menuShowToolbar: 'Poka\u017c pasek pobierania', menuOpenHistory: 'Otw\u00f3rz histori\u0119 pobierania',
      errNetwork: 'Po\u0142\u0105czenie ci\u0105gle si\u0119 zrywa\u0142o. Post\u0119p zosta\u0142 zachowany \u2014 u\u017cyj \u201ePon\u00f3w\u201d, gdy po\u0142\u0105czenie b\u0119dzie stabilne.',
      errReach: 'Nie mo\u017cna po\u0142\u0105czy\u0107 si\u0119 z YouTube. Sprawd\u017a po\u0142\u0105czenie i spr\u00f3buj ponownie.',
      errExpired: 'YouTube nie pozwoli\u0142 doko\u0144czy\u0107 tego pobierania. Post\u0119p zosta\u0142 zachowany \u2014 u\u017cyj \u201ePon\u00f3w\u201d p\u00f3\u017aniej.',
      errFormatGone: 'Ten format nie jest ju\u017c dost\u0119pny.',
      errNoDirect: "YouTube nie udost\u0119pnia teraz tego filmu do bezpo\u015bredniego pobrania. Spr\u00f3buj ponownie p\u00f3\u017aniej.",
      errBlocked: "YouTube blokuje pobieranie tego filmu przez Twoje obecne po\u0142\u0105czenie. Je\u015bli u\u017cywasz VPN, wy\u0142\u0105cz go lub zmie\u0144 serwer, a potem u\u017cyj \u201ePon\u00f3w\u201d. Post\u0119p zosta\u0142 zachowany.",
      dmTitle: "Mened\u017cer pobierania",
      dmConnectedHint: "po\u0142\u0105czono",
      dmNotRunning: "uruchamia si\u0119 w razie potrzeby",
      dmConnect: "Po\u0142\u0105cz\u2026",
      dmConnected: "Po\u0142\u0105czono z Mened\u017cerem pobierania. Pobrane pliki trafiaj\u0105 teraz do folderu wybranego w aplikacji.",
      dmPairWaiting: "Potwierd\u017a po\u0142\u0105czenie w oknie Mened\u017cera pobierania na komputerze.",
      dmDenied: "Mened\u017cer pobierania nie zezwoli\u0142 na po\u0142\u0105czenie.",
      dmNotInstalled: "Aplikacja Mened\u017cer pobierania nie dzia\u0142a. Zainstaluj YT Download Manager, doko\u0144cz konfiguracj\u0119 i spr\u00f3buj ponownie.",
      dmStarting: "Uruchamianie Mened\u017cera pobierania\u2026",
      dmUnavailable: "Nie uda\u0142o si\u0119 uruchomi\u0107 Mened\u017cera pobierania. Mo\u017cesz go uruchomi\u0107 z menu Start albo pobra\u0107 w przegl\u0105darce.",
      dmBrowserInstead: "Pobierz w przegl\u0105darce",
      dmUseApp: 'U\u017cyj mened\u017cera pobierania',
      extReloaded: 'Rozszerzenie zosta\u0142o zaktualizowane. Od\u015bwie\u017c t\u0119 stron\u0119, aby kontynuowa\u0107.',
      dmAlreadyDone: "Ten plik zosta\u0142 ju\u017c pobrany.",
      dmOffline: "Mened\u017cer pobierania nie dzia\u0142a. To pobieranie b\u0119dzie kontynuowane po jego ponownym uruchomieniu.",
      downloadAgain: "Pobierz ponownie",
      showInFolder: "Poka\u017c w folderze",
      openFolder: "Otw\u00f3rz folder",
      dmFolderPicker: "Wybierz folder w oknie, kt\u00f3re otworzy\u0142o si\u0119 na komputerze.",
      downloadingVideo: "Pobieranie wideo\u2026",
      downloadingAudio: "Pobieranie d\u017awi\u0119ku\u2026",
      verifying: "Sprawdzanie pliku\u2026",
      updatingEngine: "Aktualizowanie programu do pobierania\u2026",
      waitingFolder: "Oczekiwanie na folder pobierania. Pod\u0142\u0105cz ponownie dysk lub wybierz inny folder.",
      errPrivate: "Ten film jest prywatny.",
      errNoDownload: 'YouTube nie udost\u0119pnia tego filmu do pobrania.', errDrm: 'Ten film jest zabezpieczony przed kopiowaniem, wi\u0119c nie mo\u017cna go pobra\u0107.', errSessionExpired: 'Twoje logowanie do YouTube si\u0119 zmieni\u0142o. Od\u015bwie\u017c stron\u0119 i spr\u00f3buj ponownie.', errMembers: "Ten film jest tylko dla cz\u0142onk\u00f3w kana\u0142u.", errSignIn: 'Zaloguj si\u0119 do YouTube w tej przegl\u0105darce, aby pobra\u0107 ten film.', errAgeAccount: 'YouTube nie pozwala Twojemu kontu obejrze\u0107 tego filmu (weryfikacja wieku).', errMembersAccount: 'Ten film jest dla cz\u0142onk\u00f3w kana\u0142u. Twoje konto nie jest cz\u0142onkiem.', errPrivateAccount: 'Ten film jest prywatny, a Twoje konto nie ma do niego dost\u0119pu.',
      errAge: "Ten film ma ograniczenie wiekowe i nie mo\u017cna go pobra\u0107 bez zalogowania.",
      errGeo: "Ten film nie jest dost\u0119pny w Twoim kraju.",
      errLive: "Transmisje na \u017cywo i premiery mo\u017cna pobra\u0107 po ich zako\u0144czeniu.",
      errDiskFull: "Za ma\u0142o wolnego miejsca. Zwolnij miejsce, a potem u\u017cyj \u201ePon\u00f3w\u201d.",
      errVerify: "Pobrany plik by\u0142 uszkodzony i nie zosta\u0142 zapisany. U\u017cyj \u201ePon\u00f3w\u201d, aby pobra\u0107 go ponownie.",
      errEngine: "Program do pobierania wymaga aktualizacji, kt\u00f3rej nie uda\u0142o si\u0119 zainstalowa\u0107. Sprawd\u017a po\u0142\u0105czenie z internetem, a potem u\u017cyj \u201ePon\u00f3w\u201d.",
      errEngineMissing: "Brakuje cz\u0119\u015bci Mened\u017cera pobierania. Uruchom ponownie jego konfiguracj\u0119 z menu Start.",
      errReason: 'YouTube zg\u0142asza: {reason}',
      errUnavailable: 'Tego filmu nie mo\u017cna pobra\u0107.',
      errFormats: 'Nie uda\u0142o si\u0119 wczyta\u0107 format\u00f3w tego filmu.',
      errNoThumb: 'Brak miniatury dla tego filmu.',
      errNoSubs: 'YouTube zwr\u00f3ci\u0142 puste napisy.',
      errClip: 'Wybrany klip wykracza poza film.',
      errNotReady: 'Film nie jest jeszcze gotowy.',
      errFrame: 'Nie uda\u0142o si\u0119 przechwyci\u0107 tej klatki.',
      errFolder: 'Brak uprawnie\u0144 do folderu pobierania.',
      errMoved: 'Plik zosta\u0142 przeniesiony lub usuni\u0119ty.',
      errDecode: 'Nie uda\u0142o si\u0119 przekonwertowa\u0107 tego d\u017awi\u0119ku.',
      errGeneric: 'Co\u015b posz\u0142o nie tak. Spr\u00f3buj ponownie.',
      backToVideo: 'Wr\u00f3\u0107 do filmu', goHome: 'Strona g\u0142\u00f3wna, bez przerywania',
      preparingEngine: 'Przygotowywanie konwertera (tylko za pierwszym razem) \u00b7 {p}%',
      converting: 'Konwertowanie \u00b7 {p}%',
      folderTitle: 'Folder pobierania',
      folderHint: 'Wybierz folder lub utw\u00f3rz nowy, np. Pobrane \u203a YouTube. Przegl\u0105darki nie pozwalaj\u0105 stronom zapisywa\u0107 bezpo\u015brednio w g\u0142\u00f3wnym folderze Pobrane, Dokumenty ani Pulpit, wi\u0119c u\u017cyj folderu w ich wn\u0119trzu. Okno wyboru ma przycisk \u201eNowy folder\u201d.',
      folderChoose: 'Wybierz folder\u2026',
      folderNotWritable: 'W tym folderze nie mo\u017cna zapisywa\u0107 plik\u00f3w. Wybierz inny.',
      folderPickFailed: 'Tego folderu nie mo\u017cna u\u017cy\u0107. Wybierz inny.',
      folderMissing: 'Folder \u201e{name}\u201d nie jest ju\u017c dost\u0119pny. M\u00f3g\u0142 zosta\u0107 przeniesiony lub usuni\u0119ty albo jego dysk jest od\u0142\u0105czony.',
      folderMissingSaved: 'Folder pobierania jest niedost\u0119pny, wi\u0119c plik zapisano w pobranych przegl\u0105darki.',
      folderPermission: 'wymaga zgody',
      folderAllow: 'Zezw\u00f3l na dost\u0119p',
      folderUnavailable: 'niedost\u0119pny',
      folderRestartNote: 'Po ponownym uruchomieniu przegl\u0105darki mo\u017cesz zosta\u0107 raz poproszony o ponowne zezwolenie na dost\u0119p.',
      errConvert: 'Nie uda\u0142o si\u0119 przekonwertowa\u0107 tego pliku.',
    },
    ru: {
      toolbarLabel: '\u0418\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438',
      tipVideo: '\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0432\u0438\u0434\u0435\u043e', tipAudio: '\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0430\u0443\u0434\u0438\u043e', tipThumb: '\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u043e\u0431\u043b\u043e\u0436\u043a\u0443', tipSubs: '\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0441\u0443\u0431\u0442\u0438\u0442\u0440\u044b',
      tipShot: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0441\u043d\u0438\u043c\u043e\u043a \u044d\u0442\u043e\u0433\u043e \u043a\u0430\u0434\u0440\u0430', download: '\u0421\u043a\u0430\u0447\u0430\u0442\u044c', dlShort: '\u0421\u043a\u0430\u0447\u0430\u0442\u044c', tipView: '\u041f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430',
      tipToDark: '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0442\u0451\u043c\u043d\u0443\u044e \u0442\u0435\u043c\u0443', tipToLight: '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0441\u0432\u0435\u0442\u043b\u0443\u044e \u0442\u0435\u043c\u0443',
      focusMode: '\u0411\u043e\u043b\u044c\u0448\u043e\u0439 \u044d\u043a\u0440\u0430\u043d', tipFocusOn: '\u0411\u043e\u043b\u044c\u0448\u043e\u0439 \u044d\u043a\u0440\u0430\u043d: \u0432\u0438\u0434\u0435\u043e \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u043d\u0430 \u0432\u0438\u0434\u0443 \u043f\u0440\u0438 \u043f\u0440\u043e\u043a\u0440\u0443\u0442\u043a\u0435 \u0438 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0435\u0442 \u0438\u0433\u0440\u0430\u0442\u044c \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u043e\u0439', tipFocusOff: '\u0412\u044b\u0439\u0442\u0438 \u0438\u0437 \u0440\u0435\u0436\u0438\u043c\u0430 \u0431\u043e\u043b\u044c\u0448\u043e\u0433\u043e \u044d\u043a\u0440\u0430\u043d\u0430',
      pip: '\u041a\u0430\u0440\u0442\u0438\u043d\u043a\u0430 \u0432 \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0435', tipPipOff: '\u0412\u044b\u0439\u0442\u0438 \u0438\u0437 \u0440\u0435\u0436\u0438\u043c\u0430 \u00ab\u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0430 \u0432 \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0435\u00bb', loop: '\u041f\u043e\u0432\u0442\u043e\u0440\u044f\u0442\u044c \u0432\u0438\u0434\u0435\u043e', tipLoopOff: '\u041d\u0435 \u043f\u043e\u0432\u0442\u043e\u0440\u044f\u0442\u044c',
      pipActive: '\u0412\u043e\u0441\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0441\u044f \u0432 \u0440\u0435\u0436\u0438\u043c\u0435 \u00ab\u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0430 \u0432 \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0435\u00bb', pipHint: '\u0412\u0438\u0434\u0435\u043e \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0435\u0442 \u0438\u0433\u0440\u0430\u0442\u044c \u0432 \u043c\u0430\u043b\u0435\u043d\u044c\u043a\u043e\u043c \u043e\u043a\u043d\u0435 \u043f\u043e\u0432\u0435\u0440\u0445 \u0434\u0440\u0443\u0433\u0438\u0445 \u043e\u043a\u043e\u043d, \u0434\u0430\u0436\u0435 \u0435\u0441\u043b\u0438 \u0432\u044b \u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u0432\u043a\u043b\u0430\u0434\u043a\u0443.', pipBack: '\u0421\u043d\u043e\u0432\u0430 \u0432\u043e\u0441\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u044c \u0437\u0434\u0435\u0441\u044c', prevShort: '\u041f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0435\u0435 \u0432\u0438\u0434\u0435\u043e', nextShort: '\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0435 \u0432\u0438\u0434\u0435\u043e', pipPlay: '\u0412\u043e\u0441\u043f\u0440\u043e\u0438\u0437\u0432\u0435\u0441\u0442\u0438', pipPause: '\u041f\u0430\u0443\u0437\u0430', pipMute: '\u0412\u044b\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0437\u0432\u0443\u043a', pipUnmute: '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0437\u0432\u0443\u043a', pipFit: '\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0441\u0451 \u0432\u0438\u0434\u0435\u043e', pipFill: '\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u044c \u043e\u043a\u043d\u043e', pipHintShorts: '\u041f\u0440\u043e\u043a\u0440\u0443\u0442\u0438\u0442\u0435 \u0432 \u043e\u043a\u043d\u0435, \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u0439\u0442\u0438 \u043a \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u043c\u0443 Short. \u041e\u043a\u043d\u043e \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u043f\u043e\u0432\u0435\u0440\u0445 \u0434\u0440\u0443\u0433\u0438\u0445 \u043e\u043a\u043e\u043d, \u0434\u0430\u0436\u0435 \u0435\u0441\u043b\u0438 \u0432\u044b \u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u0432\u043a\u043b\u0430\u0434\u043a\u0443.',
      settings: '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438', help: '\u0421\u043f\u0440\u0430\u0432\u043a\u0430', hideToolbar: '\u0421\u043a\u0440\u044b\u0442\u044c \u043f\u0430\u043d\u0435\u043b\u044c', back: '\u041d\u0430\u0437\u0430\u0434', close: '\u0417\u0430\u043a\u0440\u044b\u0442\u044c',
      pin: '\u041d\u0435 \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u0442\u044c', unpin: '\u0417\u0430\u043a\u0440\u044b\u0432\u0430\u0442\u044c \u043f\u0440\u0438 \u043a\u043b\u0438\u043a\u0435 \u0441\u043d\u0430\u0440\u0443\u0436\u0438',
      quality: '\u041a\u0430\u0447\u0435\u0441\u0442\u0432\u043e', format: '\u0424\u043e\u0440\u043c\u0430\u0442', language: '\u042f\u0437\u044b\u043a', fileFormat: '\u0424\u043e\u0440\u043c\u0430\u0442 \u0444\u0430\u0439\u043b\u0430',
      trim: '\u041e\u0431\u0440\u0435\u0437\u043a\u0430', start: '\u041d\u0430\u0447\u0430\u043b\u043e', end: '\u041a\u043e\u043d\u0435\u0446', clipStart: '\u041d\u0430\u0447\u0430\u043b\u043e \u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442\u0430', clipEnd: '\u041a\u043e\u043d\u0435\u0446 \u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442\u0430',
      fullLength: '\u041f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e', clip: '\u0424\u0440\u0430\u0433\u043c\u0435\u043d\u0442', reset: '\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c', syncPlayer: '\u0421\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441 \u043f\u043b\u0435\u0435\u0440\u043e\u043c', setToNow: '\u0412\u0437\u044f\u0442\u044c \u0442\u0435\u043a\u0443\u0449\u0435\u0435 \u0432\u0440\u0435\u043c\u044f \u0432\u0438\u0434\u0435\u043e',
      trimNotOpus: '\u041e\u0431\u0440\u0435\u0437\u043a\u0430 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u0434\u043b\u044f MP3, M4A \u0438 WAV.',
      added: '\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e', tryAgain: '\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c', loadingFormats: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0444\u043e\u0440\u043c\u0430\u0442\u043e\u0432\u2026',
      noVideo: '\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0432\u0438\u0434\u0435\u043e\u0444\u043e\u0440\u043c\u0430\u0442\u043e\u0432', noAudio: '\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u0430\u0443\u0434\u0438\u043e\u0444\u043e\u0440\u043c\u0430\u0442\u043e\u0432', noSubs: '\u0423 \u044d\u0442\u043e\u0433\u043e \u0432\u0438\u0434\u0435\u043e \u043d\u0435\u0442 \u0441\u0443\u0431\u0442\u0438\u0442\u0440\u043e\u0432',
      autoSubsNote: '\u0410\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u0441\u0443\u0431\u0442\u0438\u0442\u0440\u044b \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u044b \u044d\u0442\u0438\u043c \u0437\u043d\u0430\u0447\u043a\u043e\u043c',
      hintCover: '\u0441 \u043e\u0431\u043b\u043e\u0436\u043a\u043e\u0439', hintOriginal: '\u0438\u0441\u0445\u043e\u0434\u043d\u043e\u0435 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e', hintLossless: '\u0431\u0435\u0437 \u043f\u043e\u0442\u0435\u0440\u044c',
      thumbMax: '\u041c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435', thumbStandard: '\u0421\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u043d\u043e\u0435', thumbHigh: '\u0412\u044b\u0441\u043e\u043a\u043e\u0435', thumbMedium: '\u0421\u0440\u0435\u0434\u043d\u0435\u0435', thumbPortrait: '\u0412\u0435\u0440\u0442\u0438\u043a\u0430\u043b\u044c\u043d\u0430\u044f',
      notAvailable: '\u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e', thumbPreview: '\u041f\u0440\u0435\u0434\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043e\u0431\u043b\u043e\u0436\u043a\u0438',
      appearance: '\u041e\u0444\u043e\u0440\u043c\u043b\u0435\u043d\u0438\u0435', themeDevice: '\u041a\u0430\u043a \u043d\u0430 \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u0435', themeDark: '\u0422\u0451\u043c\u043d\u0430\u044f \u0442\u0435\u043c\u0430', themeLight: '\u0421\u0432\u0435\u0442\u043b\u0430\u044f \u0442\u0435\u043c\u0430',
      downloads: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0438', changeFolder: '\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u0430\u043f\u043a\u0443 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a', browserDefault: '\u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435',
      useBrowserFolder: '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u043f\u0430\u043f\u043a\u0443 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430', autoOpenHistory: '\u041e\u0442\u043a\u0440\u044b\u0432\u0430\u0442\u044c \u0438\u0441\u0442\u043e\u0440\u0438\u044e \u043f\u0440\u0438 \u043d\u0430\u0447\u0430\u043b\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438',
      clearFinished: '\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043d\u043d\u044b\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438', languageAuto: '\u0410\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438',
      help1: '\u041a\u043d\u043e\u043f\u043a\u0438 \u0432\u0438\u0434\u0435\u043e, \u0430\u0443\u0434\u0438\u043e, \u043e\u0431\u043b\u043e\u0436\u043a\u0438 \u0438 \u0441\u0443\u0431\u0442\u0438\u0442\u0440\u043e\u0432 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u044e\u0442 \u0432\u044b\u0431\u043e\u0440 \u0444\u043e\u0440\u043c\u0430\u0442\u0430. \u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u043c\u0430\u0440\u043a\u0435\u0440\u044b \u043e\u0431\u0440\u0435\u0437\u043a\u0438 \u0438\u043b\u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u0440\u0435\u043c\u044f, \u0447\u0442\u043e\u0431\u044b \u0441\u043a\u0430\u0447\u0430\u0442\u044c \u0442\u043e\u043b\u044c\u043a\u043e \u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442.',
      help2: '\u041a\u0430\u043c\u0435\u0440\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u0442 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043a\u0430\u0434\u0440 \u043a\u0430\u043a \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435. \u0427\u0430\u0441\u044b \u0432 \u043f\u0440\u0430\u0432\u043e\u043c \u0432\u0435\u0440\u0445\u043d\u0435\u043c \u0443\u0433\u043b\u0443 YouTube \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u044e\u0442 \u0438\u0441\u0442\u043e\u0440\u0438\u044e \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a; \u043f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0435\u0451 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a, \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c.',
      help3: '\u0411\u043e\u043b\u044c\u0448\u043e\u0439 \u044d\u043a\u0440\u0430\u043d \u0434\u0435\u0440\u0436\u0438\u0442 \u0432\u0438\u0434\u0435\u043e \u0432 \u0443\u0433\u043b\u0443 \u043f\u0440\u0438 \u043f\u0440\u043e\u043a\u0440\u0443\u0442\u043a\u0435. \u041d\u0430 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u043e\u043d\u043e \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0435\u0442 \u0438\u0433\u0440\u0430\u0442\u044c \u0432 \u043c\u0438\u043d\u0438-\u043f\u043b\u0435\u0435\u0440\u0435; \u00ab\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043a \u0432\u0438\u0434\u0435\u043e\u00bb \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u043a \u043d\u0435\u043c\u0443.',
      help4: '\u0412\u0441\u0451 \u0441\u043a\u0430\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u0438 \u043a\u043e\u043d\u0432\u0435\u0440\u0442\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u0432 \u0432\u0430\u0448\u0435\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. \u0414\u0430\u043d\u043d\u044b\u0435 \u043d\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u043d\u0438\u043a\u0443\u0434\u0430, \u043a\u0440\u043e\u043c\u0435 YouTube.',
      help5: '\u0421\u043a\u0440\u044b\u043b\u0438 \u043f\u0430\u043d\u0435\u043b\u044c? \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043c\u0435\u043d\u044e Tampermonkey \u0438 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u00ab{cmd}\u00bb.',
      history: '\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a', historyActive: '\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a (\u0430\u043a\u0442\u0438\u0432\u043d\u043e: {n})',
      nActive: '\u0410\u043a\u0442\u0438\u0432\u043d\u043e: {n}', nFinished: '\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043e: {n}', clear: '\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c', dragToMove: '\u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c',
      noDownloads: '\u0417\u0430\u0433\u0440\u0443\u0437\u043e\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442', noDownloadsHint: '\u0421\u043a\u0430\u0447\u0438\u0432\u0430\u0439\u0442\u0435 \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e \u043f\u0430\u043d\u0435\u043b\u0438 \u043f\u043e\u0434 \u0432\u0438\u0434\u0435\u043e.',
      savingTo: '\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435 \u0432', browserDownloads: '\u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430', chooseFolder: '\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u043f\u0430\u043f\u043a\u0443', change: '\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c',
      inFolder: '\u0432 \u00ab{folder}\u00bb', inBrowser: '\u0432 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430\u0445 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430',
      pause: '\u041f\u0430\u0443\u0437\u0430', resume: '\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c', cancel: '\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c', play: '\u0412\u043e\u0441\u043f\u0440\u043e\u0438\u0437\u0432\u0435\u0441\u0442\u0438', retry: '\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c', restart: '\u041d\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e', remove: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0438\u0437 \u0438\u0441\u0442\u043e\u0440\u0438\u0438',
      trimmedClip: '\u041e\u0431\u0440\u0435\u0437\u0430\u043d\u043d\u044b\u0439 \u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442', view: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c', show: '\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c',
      stQueued: '\u0412 \u043e\u0447\u0435\u0440\u0435\u0434\u0438', stDownloading: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430', stPaused: '\u041f\u0430\u0443\u0437\u0430', stProcessing: '\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430', stCompleted: '\u0413\u043e\u0442\u043e\u0432\u043e', stFailed: '\u041e\u0448\u0438\u0431\u043a\u0430', stCanceled: '\u041e\u0442\u043c\u0435\u043d\u0435\u043d\u043e',
      waitingOthers: '\u041e\u0436\u0438\u0434\u0430\u0435\u0442 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0438\u044f \u0434\u0440\u0443\u0433\u0438\u0445 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a', starting: '\u0417\u0430\u043f\u0443\u0441\u043a\u2026', findingClip: '\u041f\u043e\u0438\u0441\u043a \u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442\u0430\u2026',
      merging: '\u041e\u0431\u044a\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435 \u0432\u0438\u0434\u0435\u043e \u0438 \u0430\u0443\u0434\u0438\u043e\u2026', cutting: '\u041e\u0431\u0440\u0435\u0437\u043a\u0430 \u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442\u0430\u2026', decoding: '\u041f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430 \u0430\u0443\u0434\u0438\u043e\u2026', encodingMp3: '\u041a\u043e\u043d\u0432\u0435\u0440\u0442\u0430\u0446\u0438\u044f \u0432 MP3 \u00b7 {p}%',
      saving: '\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435\u2026', fetchingImage: '\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f\u2026', fetchingSubs: '\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0435 \u0441\u0443\u0431\u0442\u0438\u0442\u0440\u043e\u0432\u2026',
      reconnecting: '\u0421\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435 \u043f\u0440\u0435\u0440\u0432\u0430\u043d\u043e, \u043f\u0435\u0440\u0435\u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435\u2026', waitingOnline: '\u041d\u0435\u0442 \u0441\u0435\u0442\u0438. \u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u0441\u044f, \u043a\u043e\u0433\u0434\u0430 \u0441\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435 \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0441\u044f.',
      refreshingLink: '\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u0441\u0441\u044b\u043b\u043a\u0438 \u0434\u043b\u044f \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438\u2026', waitingSession: '\u041e\u0436\u0438\u0434\u0430\u043d\u0438\u0435 \u0432\u0445\u043e\u0434\u0430 \u0432 YouTube\u2026 \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 YouTube \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435.',
      sharingBandwidth: '\u043c\u0435\u0434\u043b\u0435\u043d\u043d\u0435\u0435, \u043f\u043e\u043a\u0430 \u0438\u0434\u0451\u0442 \u0432\u0438\u0434\u0435\u043e',
      progressOf: '{got} \u0438\u0437 {total}', perSecond: '{speed}/\u0441', timeLeft: '\u043e\u0441\u0442\u0430\u043b\u043e\u0441\u044c {t}',
      toastDownloading: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430', toastQueued: '\u0412 \u043e\u0447\u0435\u0440\u0435\u0434\u0438', whatClip: '{what} (\u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442)',
      toastSaved: '\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043e', toastCanceled: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u0430', toastFailed: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043a\u0430\u0447\u0430\u0442\u044c \u00b7 {err}',
      statusFailed: '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u043a\u0430\u0447\u0438\u0432\u0430\u043d\u0438\u044f', reloadPage: '\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443', tipMany: '\u0417\u0430\u0433\u0440\u0443\u0437\u043e\u043a: {n}, {p}%',
      toastAlready: '\u042d\u0442\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0443\u0436\u0435 \u0438\u0434\u0451\u0442',
      folderSet: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0442\u0435\u043f\u0435\u0440\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u044e\u0442\u0441\u044f \u0432 \u00ab{name}\u00bb', folderReset: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0442\u0435\u043f\u0435\u0440\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u044e\u0442\u0441\u044f \u0432 \u043f\u0430\u043f\u043a\u0443 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430',
      folderNoPerm: '\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u0430 \u043a \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0439 \u043f\u0430\u043f\u043a\u0435, \u0444\u0430\u0439\u043b \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d \u0432 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430',
      folderNeedsChromium: '\u0414\u043b\u044f \u0432\u044b\u0431\u043e\u0440\u0430 \u043f\u0430\u043f\u043a\u0438 \u043d\u0443\u0436\u0435\u043d Chrome, Edge \u0438\u043b\u0438 \u0434\u0440\u0443\u0433\u043e\u0439 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u0435 Chromium',
      loopOn: '\u041f\u043e\u0432\u0442\u043e\u0440 \u0432\u043a\u043b\u044e\u0447\u0451\u043d', loopOff: '\u041f\u043e\u0432\u0442\u043e\u0440 \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d',
      toolbarHidden: '\u041f\u0430\u043d\u0435\u043b\u044c \u0441\u043a\u0440\u044b\u0442\u0430. \u0412\u0435\u0440\u043d\u0443\u0442\u044c \u0435\u0451 \u043c\u043e\u0436\u043d\u043e \u0432 \u043c\u0435\u043d\u044e Tampermonkey: \u00ab{cmd}\u00bb',
      themeConfirm: 'YouTube \u043f\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443, \u0447\u0442\u043e\u0431\u044b \u0441\u043c\u0435\u043d\u0438\u0442\u044c \u0442\u0435\u043c\u0443. \u0422\u0435\u043a\u0443\u0449\u0438\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 ({n}) \u0431\u0443\u0434\u0443\u0442 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u044b. \u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c?',
      menuShowToolbar: '\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043f\u0430\u043d\u0435\u043b\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a', menuOpenHistory: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0438\u0441\u0442\u043e\u0440\u0438\u044e \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a',
      errNetwork: '\u0421\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435 \u043f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u043e \u043e\u0431\u0440\u044b\u0432\u0430\u043b\u043e\u0441\u044c. \u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d \u2014 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c\u00bb, \u043a\u043e\u0433\u0434\u0430 \u0441\u0432\u044f\u0437\u044c \u0441\u0442\u0430\u043d\u0435\u0442 \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0439.',
      errReach: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f \u0441 YouTube. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u0438 \u043f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u0435 \u043f\u043e\u043f\u044b\u0442\u043a\u0443.',
      errExpired: 'YouTube \u043d\u0435 \u0434\u0430\u043b \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044c \u044d\u0442\u0443 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0443. \u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d \u2014 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c\u00bb \u043f\u043e\u0437\u0436\u0435.',
      errFormatGone: '\u042d\u0442\u043e\u0442 \u0444\u043e\u0440\u043c\u0430\u0442 \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d.',
      errNoDirect: "YouTube \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0435 \u0434\u0430\u0451\u0442 \u0441\u043a\u0430\u0447\u0430\u0442\u044c \u044d\u0442\u043e \u0432\u0438\u0434\u0435\u043e \u043d\u0430\u043f\u0440\u044f\u043c\u0443\u044e. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435.",
      errBlocked: "YouTube \u0431\u043b\u043e\u043a\u0438\u0440\u0443\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0443 \u044d\u0442\u043e\u0433\u043e \u0432\u0438\u0434\u0435\u043e \u0447\u0435\u0440\u0435\u0437 \u0432\u0430\u0448\u0435 \u0442\u0435\u043a\u0443\u0449\u0435\u0435 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435. \u0415\u0441\u043b\u0438 \u0432\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0435 VPN, \u043e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u0435\u0433\u043e \u0438\u043b\u0438 \u0441\u043c\u0435\u043d\u0438\u0442\u0435 \u0441\u0435\u0440\u0432\u0435\u0440, \u0437\u0430\u0442\u0435\u043c \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c\u00bb. \u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d.",
      dmTitle: "\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a",
      dmConnectedHint: "\u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0451\u043d",
      dmNotRunning: "\u0437\u0430\u043f\u0443\u0441\u043a\u0430\u0435\u0442\u0441\u044f \u043f\u0440\u0438 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e\u0441\u0442\u0438",
      dmConnect: "\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c\u2026",
      dmConnected: "\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0451\u043d. \u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0442\u0435\u043f\u0435\u0440\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u044e\u0442\u0441\u044f \u0432 \u043f\u0430\u043f\u043a\u0443, \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u0443\u044e \u0432 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0438.",
      dmPairWaiting: "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u0432 \u043e\u043a\u043d\u0435 \u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a \u043d\u0430 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u0435.",
      dmDenied: "\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a \u043d\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u043b \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435.",
      dmNotInstalled: "\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u00ab\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a\u00bb \u043d\u0435 \u0437\u0430\u043f\u0443\u0449\u0435\u043d\u043e. \u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0435 YT Download Manager, \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0443 \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.",
      dmStarting: "\u0417\u0430\u043f\u0443\u0441\u043a \u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a\u2026",
      dmUnavailable: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u044c \u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a. \u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u0435\u0433\u043e \u0438\u0437 \u043c\u0435\u043d\u044e \u00ab\u041f\u0443\u0441\u043a\u00bb \u0438\u043b\u0438 \u0441\u043a\u0430\u0447\u0430\u0439\u0442\u0435 \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435.",
      dmBrowserInstead: "\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435",
      dmUseApp: '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a',
      extReloaded: '\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e. \u041f\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u044d\u0442\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c.',
      dmAlreadyDone: "\u0412\u044b \u0443\u0436\u0435 \u0441\u043a\u0430\u0447\u0430\u043b\u0438 \u044d\u0442\u043e.",
      dmOffline: "\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a \u043d\u0435 \u0437\u0430\u043f\u0443\u0449\u0435\u043d. \u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u0435\u0433\u043e \u0437\u0430\u043f\u0443\u0441\u043a\u0430.",
      downloadAgain: "\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0441\u043d\u043e\u0432\u0430",
      showInFolder: "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432 \u043f\u0430\u043f\u043a\u0435",
      openFolder: "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0430\u043f\u043a\u0443",
      dmFolderPicker: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0430\u043f\u043a\u0443 \u0432 \u043e\u043a\u043d\u0435, \u043a\u043e\u0442\u043e\u0440\u043e\u0435 \u043e\u0442\u043a\u0440\u044b\u043b\u043e\u0441\u044c \u043d\u0430 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u0435.",
      downloadingVideo: "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0432\u0438\u0434\u0435\u043e\u2026",
      downloadingAudio: "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0430\u0443\u0434\u0438\u043e\u2026",
      verifying: "\u041f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u0444\u0430\u0439\u043b\u0430\u2026",
      updatingEngine: "\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0447\u0438\u043a\u0430\u2026",
      waitingFolder: "\u041e\u0436\u0438\u0434\u0430\u043d\u0438\u0435 \u043f\u0430\u043f\u043a\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a. \u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u0434\u0438\u0441\u043a \u0441\u043d\u043e\u0432\u0430 \u0438\u043b\u0438 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u0443\u044e \u043f\u0430\u043f\u043a\u0443.",
      errPrivate: "\u042d\u0442\u043e \u0432\u0438\u0434\u0435\u043e \u0441 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u043d\u044b\u043c \u0434\u043e\u0441\u0442\u0443\u043f\u043e\u043c.",
      errNoDownload: 'YouTube \u043d\u0435 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u044d\u0442\u043e \u0432\u0438\u0434\u0435\u043e \u0434\u043b\u044f \u0441\u043a\u0430\u0447\u0438\u0432\u0430\u043d\u0438\u044f.', errDrm: '\u042d\u0442\u043e \u0432\u0438\u0434\u0435\u043e \u0437\u0430\u0449\u0438\u0449\u0435\u043d\u043e \u043e\u0442 \u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0435\u0433\u043e \u043d\u0435\u043b\u044c\u0437\u044f \u0441\u043a\u0430\u0447\u0430\u0442\u044c.', errSessionExpired: '\u0412\u0430\u0448 \u0432\u0445\u043e\u0434 \u0432 YouTube \u0438\u0437\u043c\u0435\u043d\u0438\u043b\u0441\u044f. \u041e\u0431\u043d\u043e\u0432\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.', errMembers: "\u042d\u0442\u043e \u0432\u0438\u0434\u0435\u043e \u0442\u043e\u043b\u044c\u043a\u043e \u0434\u043b\u044f \u0441\u043f\u043e\u043d\u0441\u043e\u0440\u043e\u0432 \u043a\u0430\u043d\u0430\u043b\u0430.", errSignIn: '\u0412\u043e\u0439\u0434\u0438\u0442\u0435 \u0432 YouTube \u0432 \u044d\u0442\u043e\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435, \u0447\u0442\u043e\u0431\u044b \u0441\u043a\u0430\u0447\u0430\u0442\u044c \u044d\u0442\u043e \u0432\u0438\u0434\u0435\u043e.', errAgeAccount: 'YouTube \u043d\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0430\u0435\u0442 \u0432\u0430\u0448\u0435\u043c\u0443 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0443 \u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u044d\u0442\u043e \u0432\u0438\u0434\u0435\u043e (\u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u0432\u043e\u0437\u0440\u0430\u0441\u0442\u0430).', errMembersAccount: '\u042d\u0442\u043e \u0432\u0438\u0434\u0435\u043e \u0434\u043b\u044f \u0441\u043f\u043e\u043d\u0441\u043e\u0440\u043e\u0432 \u043a\u0430\u043d\u0430\u043b\u0430. \u0412\u0430\u0448 \u0430\u043a\u043a\u0430\u0443\u043d\u0442 \u043d\u0435 \u0441\u043f\u043e\u043d\u0441\u043e\u0440.', errPrivateAccount: '\u042d\u0442\u043e \u0432\u0438\u0434\u0435\u043e \u0437\u0430\u043a\u0440\u044b\u0442\u043e, \u0438 \u0443 \u0432\u0430\u0448\u0435\u0433\u043e \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430 \u043d\u0435\u0442 \u043a \u043d\u0435\u043c\u0443 \u0434\u043e\u0441\u0442\u0443\u043f\u0430.',
      errAge: "\u0423 \u044d\u0442\u043e\u0433\u043e \u0432\u0438\u0434\u0435\u043e \u0432\u043e\u0437\u0440\u0430\u0441\u0442\u043d\u044b\u0435 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f, \u0441\u043a\u0430\u0447\u0430\u0442\u044c \u0435\u0433\u043e \u0431\u0435\u0437 \u0432\u0445\u043e\u0434\u0430 \u0432 \u0430\u043a\u043a\u0430\u0443\u043d\u0442 \u043d\u0435\u043b\u044c\u0437\u044f.",
      errGeo: "\u042d\u0442\u043e \u0432\u0438\u0434\u0435\u043e \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e \u0432 \u0432\u0430\u0448\u0435\u0439 \u0441\u0442\u0440\u0430\u043d\u0435.",
      errLive: "\u0422\u0440\u0430\u043d\u0441\u043b\u044f\u0446\u0438\u0438 \u0438 \u043f\u0440\u0435\u043c\u044c\u0435\u0440\u044b \u043c\u043e\u0436\u043d\u043e \u0441\u043a\u0430\u0447\u0430\u0442\u044c \u043f\u043e\u0441\u043b\u0435 \u0438\u0445 \u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f.",
      errDiskFull: "\u041d\u0435\u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0433\u043e \u043c\u0435\u0441\u0442\u0430. \u041e\u0441\u0432\u043e\u0431\u043e\u0434\u0438\u0442\u0435 \u043c\u0435\u0441\u0442\u043e \u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c\u00bb.",
      errVerify: "\u0421\u043a\u0430\u0447\u0430\u043d\u043d\u044b\u0439 \u0444\u0430\u0439\u043b \u043f\u043e\u0432\u0440\u0435\u0436\u0434\u0451\u043d \u0438 \u043d\u0435 \u0431\u044b\u043b \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c\u00bb, \u0447\u0442\u043e\u0431\u044b \u0441\u043a\u0430\u0447\u0430\u0442\u044c \u0435\u0433\u043e \u0441\u043d\u043e\u0432\u0430.",
      errEngine: "\u0417\u0430\u0433\u0440\u0443\u0437\u0447\u0438\u043a\u0443 \u043d\u0443\u0436\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435, \u043a\u043e\u0442\u043e\u0440\u043e\u0435 \u043d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u043a \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u0443 \u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c\u00bb.",
      errEngineMissing: "\u041d\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u043e\u0432 \u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a. \u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u0435\u0433\u043e \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0443 \u0441\u043d\u043e\u0432\u0430 \u0438\u0437 \u043c\u0435\u043d\u044e \u00ab\u041f\u0443\u0441\u043a\u00bb.",
      errReason: '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 YouTube: {reason}',
      errUnavailable: '\u042d\u0442\u043e \u0432\u0438\u0434\u0435\u043e \u043d\u0435\u043b\u044c\u0437\u044f \u0441\u043a\u0430\u0447\u0430\u0442\u044c.',
      errFormats: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0444\u043e\u0440\u043c\u0430\u0442\u044b \u044d\u0442\u043e\u0433\u043e \u0432\u0438\u0434\u0435\u043e.',
      errNoThumb: '\u0414\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u0432\u0438\u0434\u0435\u043e \u043d\u0435\u0442 \u043e\u0431\u043b\u043e\u0436\u043a\u0438.',
      errNoSubs: 'YouTube \u0432\u0435\u0440\u043d\u0443\u043b \u043f\u0443\u0441\u0442\u044b\u0435 \u0441\u0443\u0431\u0442\u0438\u0442\u0440\u044b.',
      errClip: '\u0412\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442 \u0432\u044b\u0445\u043e\u0434\u0438\u0442 \u0437\u0430 \u043f\u0440\u0435\u0434\u0435\u043b\u044b \u0432\u0438\u0434\u0435\u043e.',
      errNotReady: '\u0412\u0438\u0434\u0435\u043e \u0435\u0449\u0451 \u043d\u0435 \u0433\u043e\u0442\u043e\u0432\u043e.',
      errFrame: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0445\u0432\u0430\u0442\u0438\u0442\u044c \u044d\u0442\u043e\u0442 \u043a\u0430\u0434\u0440.',
      errFolder: '\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u0430 \u043a \u043f\u0430\u043f\u043a\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a.',
      errMoved: '\u0424\u0430\u0439\u043b \u0431\u044b\u043b \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0451\u043d \u0438\u043b\u0438 \u0443\u0434\u0430\u043b\u0451\u043d.',
      errDecode: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043a\u043e\u043d\u0432\u0435\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u044d\u0442\u043e \u0430\u0443\u0434\u0438\u043e.',
      errGeneric: '\u0427\u0442\u043e-\u0442\u043e \u043f\u043e\u0448\u043b\u043e \u043d\u0435 \u0442\u0430\u043a. \u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u0435 \u043f\u043e\u043f\u044b\u0442\u043a\u0443.',
      backToVideo: '\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043a \u0432\u0438\u0434\u0435\u043e', goHome: '\u041d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e, \u043d\u0435 \u043e\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u044f',
      preparingEngine: '\u041f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430 \u043a\u043e\u043d\u0432\u0435\u0440\u0442\u0435\u0440\u0430 (\u0442\u043e\u043b\u044c\u043a\u043e \u0432 \u043f\u0435\u0440\u0432\u044b\u0439 \u0440\u0430\u0437) \u00b7 {p}%',
      converting: '\u041a\u043e\u043d\u0432\u0435\u0440\u0442\u0430\u0446\u0438\u044f \u00b7 {p}%',
      folderTitle: '\u041f\u0430\u043f\u043a\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a',
      folderHint: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0430\u043f\u043a\u0443 \u0438\u043b\u0438 \u0441\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u043d\u043e\u0432\u0443\u044e, \u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 \u00ab\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u203a YouTube\u00bb. \u0411\u0440\u0430\u0443\u0437\u0435\u0440\u044b \u043d\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0430\u044e\u0442 \u0441\u0430\u0439\u0442\u0430\u043c \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0442\u044c \u0444\u0430\u0439\u043b\u044b \u043f\u0440\u044f\u043c\u043e \u0432 \u043e\u0441\u043d\u043e\u0432\u043d\u0443\u044e \u043f\u0430\u043f\u043a\u0443 \u00ab\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0438\u00bb, \u00ab\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b\u00bb \u0438\u043b\u0438 \u00ab\u0420\u0430\u0431\u043e\u0447\u0438\u0439 \u0441\u0442\u043e\u043b\u00bb, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u043f\u0430\u043f\u043a\u0443 \u0432\u043d\u0443\u0442\u0440\u0438 \u043d\u0438\u0445. \u0412 \u043e\u043a\u043d\u0435 \u0432\u044b\u0431\u043e\u0440\u0430 \u0435\u0441\u0442\u044c \u043a\u043d\u043e\u043f\u043a\u0430 \u00ab\u041d\u043e\u0432\u0430\u044f \u043f\u0430\u043f\u043a\u0430\u00bb.',
      folderChoose: '\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u043f\u0430\u043f\u043a\u0443\u2026',
      folderNotWritable: '\u0412 \u044d\u0442\u0443 \u043f\u0430\u043f\u043a\u0443 \u043d\u0435\u043b\u044c\u0437\u044f \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0442\u044c \u0444\u0430\u0439\u043b\u044b. \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u0443\u044e.',
      folderPickFailed: '\u042d\u0442\u0443 \u043f\u0430\u043f\u043a\u0443 \u043d\u0435\u043b\u044c\u0437\u044f \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c. \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u0443\u044e.',
      folderMissing: '\u041f\u0430\u043f\u043a\u0430 \u00ab{name}\u00bb \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430. \u0412\u043e\u0437\u043c\u043e\u0436\u043d\u043e, \u0435\u0451 \u043f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u043b\u0438 \u0438\u043b\u0438 \u0443\u0434\u0430\u043b\u0438\u043b\u0438 \u043b\u0438\u0431\u043e \u0434\u0438\u0441\u043a \u043e\u0442\u043a\u043b\u044e\u0447\u0451\u043d.',
      folderMissingSaved: '\u041f\u0430\u043f\u043a\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043e\u043a \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0444\u0430\u0439\u043b \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d \u0432 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430.',
      folderPermission: '\u043d\u0443\u0436\u043d\u043e \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435',
      folderAllow: '\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044c \u0434\u043e\u0441\u0442\u0443\u043f',
      folderUnavailable: '\u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430',
      folderRestartNote: '\u041f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0437\u0430\u043f\u0443\u0441\u043a\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430 \u043c\u043e\u0436\u0435\u0442 \u043f\u043e\u043d\u0430\u0434\u043e\u0431\u0438\u0442\u044c\u0441\u044f \u043e\u0434\u0438\u043d \u0440\u0430\u0437 \u0441\u043d\u043e\u0432\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044c \u0434\u043e\u0441\u0442\u0443\u043f.',
      errConvert: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043a\u043e\u043d\u0432\u0435\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u044d\u0442\u043e\u0442 \u0444\u0430\u0439\u043b.',
    },
    ja: {
      toolbarLabel: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30c4\u30fc\u30eb',
      tipVideo: '\u52d5\u753b\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9', tipAudio: '\u97f3\u58f0\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9', tipThumb: '\u30b5\u30e0\u30cd\u30a4\u30eb\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9', tipSubs: '\u5b57\u5e55\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9',
      tipShot: '\u3053\u306e\u30d5\u30ec\u30fc\u30e0\u306e\u30b9\u30af\u30ea\u30fc\u30f3\u30b7\u30e7\u30c3\u30c8\u3092\u4fdd\u5b58', download: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9', dlShort: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9', tipView: '\u8868\u793a\u30aa\u30d7\u30b7\u30e7\u30f3',
      tipToDark: '\u30c0\u30fc\u30af\u30c6\u30fc\u30de\u306b\u5207\u308a\u66ff\u3048', tipToLight: '\u30e9\u30a4\u30c8\u30c6\u30fc\u30de\u306b\u5207\u308a\u66ff\u3048',
      focusMode: '\u30d3\u30c3\u30b0\u30d4\u30af\u30c1\u30e3\u30fc', tipFocusOn: '\u30d3\u30c3\u30b0\u30d4\u30af\u30c1\u30e3\u30fc\uff1a\u30b9\u30af\u30ed\u30fc\u30eb\u4e2d\u3082\u52d5\u753b\u3092\u8868\u793a\u3057\u3001\u30db\u30fc\u30e0\u306b\u79fb\u52d5\u3057\u3066\u3082\u518d\u751f\u3092\u7d9a\u3051\u307e\u3059', tipFocusOff: '\u30d3\u30c3\u30b0\u30d4\u30af\u30c1\u30e3\u30fc\u3092\u7d42\u4e86',
      pip: '\u30d4\u30af\u30c1\u30e3\u30fc \u30a4\u30f3 \u30d4\u30af\u30c1\u30e3\u30fc', tipPipOff: '\u30d4\u30af\u30c1\u30e3\u30fc \u30a4\u30f3 \u30d4\u30af\u30c1\u30e3\u30fc\u3092\u7d42\u4e86', loop: '\u30eb\u30fc\u30d7\u518d\u751f', tipLoopOff: '\u30eb\u30fc\u30d7\u518d\u751f\u3092\u505c\u6b62',
      pipActive: '\u30d4\u30af\u30c1\u30e3\u30fc \u30a4\u30f3 \u30d4\u30af\u30c1\u30e3\u30fc\u3067\u518d\u751f\u4e2d', pipHint: '\u52d5\u753b\u306f\u4ed6\u306e\u30a6\u30a3\u30f3\u30c9\u30a6\u306e\u624b\u524d\u306b\u8868\u793a\u3055\u308c\u308b\u5c0f\u3055\u306a\u30a6\u30a3\u30f3\u30c9\u30a6\u3067\u518d\u751f\u3055\u308c\u7d9a\u3051\u307e\u3059\u3002\u30bf\u30d6\u3092\u5207\u308a\u66ff\u3048\u3066\u3082\u8868\u793a\u3055\u308c\u307e\u3059\u3002', pipBack: '\u3053\u3053\u3067\u518d\u751f\u306b\u623b\u3059', prevShort: '\u524d\u306e\u52d5\u753b', nextShort: '\u6b21\u306e\u52d5\u753b', pipPlay: '\u518d\u751f', pipPause: '\u4e00\u6642\u505c\u6b62', pipMute: '\u30df\u30e5\u30fc\u30c8', pipUnmute: '\u30df\u30e5\u30fc\u30c8\u89e3\u9664', pipFit: '\u52d5\u753b\u5168\u4f53\u3092\u8868\u793a', pipFill: '\u30a6\u30a3\u30f3\u30c9\u30a6\u3044\u3063\u3071\u3044\u306b\u8868\u793a', pipHintShorts: '\u30a6\u30a3\u30f3\u30c9\u30a6\u5185\u3067\u30b9\u30af\u30ed\u30fc\u30eb\u3059\u308b\u3068\u6b21\u306e\u30b7\u30e7\u30fc\u30c8\u306b\u79fb\u52d5\u3057\u307e\u3059\u3002\u30bf\u30d6\u3092\u5207\u308a\u66ff\u3048\u3066\u3082\u3001\u307b\u304b\u306e\u30a6\u30a3\u30f3\u30c9\u30a6\u306e\u524d\u9762\u306b\u8868\u793a\u3055\u308c\u307e\u3059\u3002',
      settings: '\u8a2d\u5b9a', help: '\u30d8\u30eb\u30d7', hideToolbar: '\u30c4\u30fc\u30eb\u30d0\u30fc\u3092\u96a0\u3059', back: '\u623b\u308b', close: '\u9589\u3058\u308b',
      pin: '\u958b\u3044\u305f\u307e\u307e\u306b\u3059\u308b', unpin: '\u5916\u5074\u3092\u30af\u30ea\u30c3\u30af\u3057\u305f\u3089\u9589\u3058\u308b',
      quality: '\u753b\u8cea', format: '\u5f62\u5f0f', language: '\u8a00\u8a9e', fileFormat: '\u30d5\u30a1\u30a4\u30eb\u5f62\u5f0f',
      trim: '\u30c8\u30ea\u30df\u30f3\u30b0', start: '\u958b\u59cb', end: '\u7d42\u4e86', clipStart: '\u30af\u30ea\u30c3\u30d7\u306e\u958b\u59cb', clipEnd: '\u30af\u30ea\u30c3\u30d7\u306e\u7d42\u4e86',
      fullLength: '\u5168\u4f53', clip: '\u30af\u30ea\u30c3\u30d7', reset: '\u30ea\u30bb\u30c3\u30c8', syncPlayer: '\u30d7\u30ec\u30fc\u30e4\u30fc\u3068\u540c\u671f', setToNow: '\u73fe\u5728\u306e\u518d\u751f\u4f4d\u7f6e\u3092\u4f7f\u7528',
      trimNotOpus: '\u30c8\u30ea\u30df\u30f3\u30b0\u306f MP3\u3001M4A\u3001WAV \u3067\u4f7f\u3048\u307e\u3059\u3002',
      added: '\u8ffd\u52a0\u3057\u307e\u3057\u305f', tryAgain: '\u518d\u8a66\u884c', loadingFormats: '\u5f62\u5f0f\u3092\u8aad\u307f\u8fbc\u307f\u4e2d\u2026',
      noVideo: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u308b\u52d5\u753b\u5f62\u5f0f\u304c\u3042\u308a\u307e\u305b\u3093', noAudio: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u308b\u97f3\u58f0\u5f62\u5f0f\u304c\u3042\u308a\u307e\u305b\u3093', noSubs: '\u3053\u306e\u52d5\u753b\u306b\u306f\u5b57\u5e55\u304c\u3042\u308a\u307e\u305b\u3093',
      autoSubsNote: '\u81ea\u52d5\u751f\u6210\u3055\u308c\u305f\u5b57\u5e55\u306b\u306f\u3053\u306e\u30a2\u30a4\u30b3\u30f3\u304c\u4ed8\u3044\u3066\u3044\u307e\u3059',
      hintCover: '\u30ab\u30d0\u30fc\u753b\u50cf\u4ed8\u304d', hintOriginal: '\u30aa\u30ea\u30b8\u30ca\u30eb\u54c1\u8cea', hintLossless: '\u30ed\u30b9\u30ec\u30b9',
      thumbMax: '\u6700\u5927\u89e3\u50cf\u5ea6', thumbStandard: '\u6a19\u6e96', thumbHigh: '\u9ad8', thumbMedium: '\u4e2d', thumbPortrait: '\u7e26\u9577',
      notAvailable: '\u5229\u7528\u4e0d\u53ef', thumbPreview: '\u30b5\u30e0\u30cd\u30a4\u30eb\u306e\u30d7\u30ec\u30d3\u30e5\u30fc',
      appearance: '\u30c7\u30b6\u30a4\u30f3', themeDevice: '\u30c7\u30d0\u30a4\u30b9\u306e\u30c6\u30fc\u30de\u3092\u4f7f\u7528', themeDark: '\u30c0\u30fc\u30af\u30c6\u30fc\u30de', themeLight: '\u30e9\u30a4\u30c8\u30c6\u30fc\u30de',
      downloads: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9', changeFolder: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5148\u30d5\u30a9\u30eb\u30c0\u3092\u5909\u66f4', browserDefault: '\u30d6\u30e9\u30a6\u30b6\u306e\u65e2\u5b9a',
      useBrowserFolder: '\u30d6\u30e9\u30a6\u30b6\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30d5\u30a9\u30eb\u30c0\u3092\u4f7f\u7528', autoOpenHistory: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u958b\u59cb\u6642\u306b\u5c65\u6b74\u3092\u958b\u304f',
      clearFinished: '\u5b8c\u4e86\u3057\u305f\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u6d88\u53bb', languageAuto: '\u81ea\u52d5',
      help1: '\u52d5\u753b\u30fb\u97f3\u58f0\u30fb\u30b5\u30e0\u30cd\u30a4\u30eb\u30fb\u5b57\u5e55\u306e\u30dc\u30bf\u30f3\u3067\u9078\u629e\u753b\u9762\u304c\u958b\u304d\u307e\u3059\u3002\u30c8\u30ea\u30df\u30f3\u30b0\u306e\u30cf\u30f3\u30c9\u30eb\u3092\u30c9\u30e9\u30c3\u30b0\u3059\u308b\u304b\u6642\u9593\u3092\u5165\u529b\u3059\u308b\u3068\u3001\u4e00\u90e8\u5206\u3060\u3051\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u307e\u3059\u3002',
      help2: '\u30ab\u30e1\u30e9\u306f\u73fe\u5728\u306e\u30d5\u30ec\u30fc\u30e0\u3092\u753b\u50cf\u3068\u3057\u3066\u4fdd\u5b58\u3057\u307e\u3059\u3002YouTube \u53f3\u4e0a\u306e\u6642\u8a08\u3067\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5c65\u6b74\u304c\u958b\u304d\u307e\u3059\u3002\u898b\u51fa\u3057\u3092\u30c9\u30e9\u30c3\u30b0\u3059\u308b\u3068\u79fb\u52d5\u3067\u304d\u307e\u3059\u3002',
      help3: '\u30d3\u30c3\u30b0\u30d4\u30af\u30c1\u30e3\u30fc\u3067\u306f\u30b9\u30af\u30ed\u30fc\u30eb\u4e2d\u3082\u52d5\u753b\u304c\u9685\u306b\u8868\u793a\u3055\u308c\u307e\u3059\u3002\u30db\u30fc\u30e0\u306b\u79fb\u52d5\u3059\u308b\u3068\u30df\u30cb\u30d7\u30ec\u30fc\u30e4\u30fc\u3067\u518d\u751f\u304c\u7d9a\u304d\u3001\u300c\u52d5\u753b\u306b\u623b\u308b\u300d\u3067\u623b\u308c\u307e\u3059\u3002',
      help4: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3068\u5909\u63db\u306f\u3059\u3079\u3066\u30d6\u30e9\u30a6\u30b6\u5185\u3067\u884c\u308f\u308c\u307e\u3059\u3002YouTube \u4ee5\u5916\u306b\u30c7\u30fc\u30bf\u306f\u9001\u4fe1\u3055\u308c\u307e\u305b\u3093\u3002',
      help5: '\u30c4\u30fc\u30eb\u30d0\u30fc\u3092\u96a0\u3057\u305f\u5834\u5408\u306f\u3001Tampermonkey \u306e\u30e1\u30cb\u30e5\u30fc\u304b\u3089\u300c{cmd}\u300d\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002',
      history: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5c65\u6b74', historyActive: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5c65\u6b74\uff08{n} \u4ef6\u5b9f\u884c\u4e2d\uff09',
      nActive: '{n} \u4ef6\u5b9f\u884c\u4e2d', nFinished: '{n} \u4ef6\u5b8c\u4e86', clear: '\u6d88\u53bb', dragToMove: '\u30c9\u30e9\u30c3\u30b0\u3057\u3066\u79fb\u52d5',
      noDownloads: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093', noDownloadsHint: '\u52d5\u753b\u306e\u4e0b\u306e\u30c4\u30fc\u30eb\u30d0\u30fc\u304b\u3089\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u307e\u3059\u3002',
      savingTo: '\u4fdd\u5b58\u5148', browserDownloads: '\u30d6\u30e9\u30a6\u30b6\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9', chooseFolder: '\u30d5\u30a9\u30eb\u30c0\u3092\u9078\u629e', change: '\u5909\u66f4',
      inFolder: '{folder} \u5185', inBrowser: '\u30d6\u30e9\u30a6\u30b6\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5185',
      pause: '\u4e00\u6642\u505c\u6b62', resume: '\u518d\u958b', cancel: '\u30ad\u30e3\u30f3\u30bb\u30eb', play: '\u518d\u751f', retry: '\u518d\u8a66\u884c', restart: '\u6700\u521d\u304b\u3089\u3084\u308a\u76f4\u3059', remove: '\u5c65\u6b74\u304b\u3089\u524a\u9664',
      trimmedClip: '\u30c8\u30ea\u30df\u30f3\u30b0\u3057\u305f\u30af\u30ea\u30c3\u30d7', view: '\u8868\u793a', show: '\u8868\u793a',
      stQueued: '\u5f85\u6a5f\u4e2d', stDownloading: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u4e2d', stPaused: '\u4e00\u6642\u505c\u6b62\u4e2d', stProcessing: '\u51e6\u7406\u4e2d', stCompleted: '\u5b8c\u4e86', stFailed: '\u5931\u6557', stCanceled: '\u30ad\u30e3\u30f3\u30bb\u30eb\u6e08\u307f',
      waitingOthers: '\u307b\u304b\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306e\u5b8c\u4e86\u3092\u5f85\u3063\u3066\u3044\u307e\u3059', starting: '\u958b\u59cb\u3057\u3066\u3044\u307e\u3059\u2026', findingClip: '\u30af\u30ea\u30c3\u30d7\u3092\u63a2\u3057\u3066\u3044\u307e\u3059\u2026',
      merging: '\u52d5\u753b\u3068\u97f3\u58f0\u3092\u7d50\u5408\u3057\u3066\u3044\u307e\u3059\u2026', cutting: '\u30af\u30ea\u30c3\u30d7\u3092\u5207\u308a\u51fa\u3057\u3066\u3044\u307e\u3059\u2026', decoding: '\u97f3\u58f0\u3092\u6e96\u5099\u3057\u3066\u3044\u307e\u3059\u2026', encodingMp3: 'MP3 \u306b\u5909\u63db\u4e2d \u00b7 {p}%',
      saving: '\u4fdd\u5b58\u3057\u3066\u3044\u307e\u3059\u2026', fetchingImage: '\u753b\u50cf\u3092\u53d6\u5f97\u3057\u3066\u3044\u307e\u3059\u2026', fetchingSubs: '\u5b57\u5e55\u3092\u53d6\u5f97\u3057\u3066\u3044\u307e\u3059\u2026',
      reconnecting: '\u63a5\u7d9a\u304c\u5207\u308c\u307e\u3057\u305f\u3002\u518d\u63a5\u7d9a\u3057\u3066\u3044\u307e\u3059\u2026', waitingOnline: '\u30aa\u30d5\u30e9\u30a4\u30f3\u3067\u3059\u3002\u63a5\u7d9a\u304c\u623b\u308b\u3068\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u518d\u958b\u3057\u307e\u3059\u3002',
      refreshingLink: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30ea\u30f3\u30af\u3092\u66f4\u65b0\u3057\u3066\u3044\u307e\u3059\u2026', waitingSession: 'YouTube \u3078\u306e\u30ed\u30b0\u30a4\u30f3\u3092\u5f85\u3063\u3066\u3044\u307e\u3059\u2026 \u30d6\u30e9\u30a6\u30b6\u30fc\u3067 YouTube \u3092\u958b\u3044\u3066\u304f\u3060\u3055\u3044\u3002',
      sharingBandwidth: '\u52d5\u753b\u518d\u751f\u4e2d\u306e\u305f\u3081\u4f4e\u901f',
      progressOf: '{got} / {total}', perSecond: '{speed}/\u79d2', timeLeft: '\u6b8b\u308a {t}',
      toastDownloading: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u4e2d', toastQueued: '\u5f85\u6a5f\u4e2d', whatClip: '{what}\uff08\u30af\u30ea\u30c3\u30d7\uff09',
      toastSaved: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5b8c\u4e86', toastCanceled: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u30ad\u30e3\u30f3\u30bb\u30eb\u3057\u307e\u3057\u305f', toastFailed: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306b\u5931\u6557\u3057\u307e\u3057\u305f \u00b7 {err}',
      statusFailed: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306b\u5931\u6557\u3057\u307e\u3057\u305f', reloadPage: '\u30da\u30fc\u30b8\u3092\u518d\u8aad\u307f\u8fbc\u307f', tipMany: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9 {n} \u4ef6\u3001{p}%',
      toastAlready: '\u3053\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306f\u3059\u3067\u306b\u5b9f\u884c\u4e2d\u3067\u3059',
      folderSet: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306f\u300c{name}\u300d\u306b\u4fdd\u5b58\u3055\u308c\u307e\u3059', folderReset: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306f\u30d6\u30e9\u30a6\u30b6\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30d5\u30a9\u30eb\u30c0\u306b\u4fdd\u5b58\u3055\u308c\u307e\u3059',
      folderNoPerm: '\u9078\u629e\u3057\u305f\u30d5\u30a9\u30eb\u30c0\u3078\u306e\u30a2\u30af\u30bb\u30b9\u8a31\u53ef\u304c\u306a\u3044\u305f\u3081\u3001\u30d6\u30e9\u30a6\u30b6\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306b\u4fdd\u5b58\u3057\u307e\u3057\u305f',
      folderNeedsChromium: '\u30d5\u30a9\u30eb\u30c0\u3092\u9078\u3076\u306b\u306f Chrome\u3001Edge \u306a\u3069\u306e Chromium \u30d9\u30fc\u30b9\u306e\u30d6\u30e9\u30a6\u30b6\u304c\u5fc5\u8981\u3067\u3059',
      loopOn: '\u30eb\u30fc\u30d7\u518d\u751f\u30aa\u30f3', loopOff: '\u30eb\u30fc\u30d7\u518d\u751f\u30aa\u30d5',
      toolbarHidden: '\u30c4\u30fc\u30eb\u30d0\u30fc\u3092\u96a0\u3057\u307e\u3057\u305f\u3002Tampermonkey \u306e\u30e1\u30cb\u30e5\u30fc\u306e\u300c{cmd}\u300d\u3067\u5143\u306b\u623b\u305b\u307e\u3059',
      themeConfirm: '\u30c6\u30fc\u30de\u3092\u5909\u66f4\u3059\u308b\u305f\u3081\u306b YouTube \u306f\u30da\u30fc\u30b8\u3092\u518d\u8aad\u307f\u8fbc\u307f\u3057\u307e\u3059\u3002\u5b9f\u884c\u4e2d\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\uff08{n} \u4ef6\uff09\u306f\u30ad\u30e3\u30f3\u30bb\u30eb\u3055\u308c\u307e\u3059\u3002\u7d9a\u884c\u3057\u307e\u3059\u304b\uff1f',
      menuShowToolbar: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30c4\u30fc\u30eb\u30d0\u30fc\u3092\u8868\u793a', menuOpenHistory: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5c65\u6b74\u3092\u958b\u304f',
      errNetwork: '\u63a5\u7d9a\u304c\u4f55\u5ea6\u3082\u5207\u308c\u307e\u3057\u305f\u3002\u9032\u884c\u72b6\u6cc1\u306f\u4fdd\u5b58\u3055\u308c\u3066\u3044\u307e\u3059\u3002\u63a5\u7d9a\u304c\u5b89\u5b9a\u3057\u305f\u3089\u300c\u518d\u8a66\u884c\u300d\u3092\u62bc\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
      errReach: 'YouTube \u306b\u63a5\u7d9a\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u63a5\u7d9a\u3092\u78ba\u8a8d\u3057\u3066\u518d\u8a66\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
      errExpired: 'YouTube \u304c\u3053\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306e\u5b8c\u4e86\u3092\u8a31\u53ef\u3057\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u9032\u884c\u72b6\u6cc1\u306f\u4fdd\u5b58\u3055\u308c\u3066\u3044\u307e\u3059\u3002\u5f8c\u3067\u300c\u518d\u8a66\u884c\u300d\u3092\u62bc\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
      errFormatGone: '\u3053\u306e\u5f62\u5f0f\u306f\u5229\u7528\u3067\u304d\u306a\u304f\u306a\u308a\u307e\u3057\u305f\u3002',
      errNoDirect: "YouTube \u306f\u73fe\u5728\u3053\u306e\u52d5\u753b\u3092\u76f4\u63a5\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u308b\u5f62\u5f0f\u3067\u63d0\u4f9b\u3057\u3066\u3044\u307e\u305b\u3093\u3002\u3057\u3070\u3089\u304f\u3057\u3066\u304b\u3089\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002",
      errBlocked: "YouTube \u304c\u73fe\u5728\u306e\u63a5\u7d9a\u3067\u306e\u3053\u306e\u52d5\u753b\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u30d6\u30ed\u30c3\u30af\u3057\u3066\u3044\u307e\u3059\u3002VPN \u3092\u4f7f\u7528\u3057\u3066\u3044\u308b\u5834\u5408\u306f\u30aa\u30d5\u306b\u3059\u308b\u304b\u30b5\u30fc\u30d0\u30fc\u3092\u5909\u66f4\u3057\u3066\u304b\u3089\u3001\u300c\u518d\u8a66\u884c\u300d\u3092\u62bc\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u9032\u884c\u72b6\u6cc1\u306f\u4fdd\u5b58\u3055\u308c\u3066\u3044\u307e\u3059\u3002",
      dmTitle: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc",
      dmConnectedHint: "\u63a5\u7d9a\u6e08\u307f",
      dmNotRunning: "\u5fc5\u8981\u306a\u3068\u304d\u306b\u8d77\u52d5",
      dmConnect: "\u63a5\u7d9a\u2026",
      dmConnected: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u306b\u63a5\u7d9a\u3057\u307e\u3057\u305f\u3002\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306f\u30a2\u30d7\u30ea\u3067\u9078\u3093\u3060\u30d5\u30a9\u30eb\u30c0\u30fc\u306b\u4fdd\u5b58\u3055\u308c\u307e\u3059\u3002",
      dmPairWaiting: "PC \u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u306e\u30a6\u30a3\u30f3\u30c9\u30a6\u3067\u63a5\u7d9a\u3092\u8a31\u53ef\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
      dmDenied: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u304c\u63a5\u7d9a\u3092\u8a31\u53ef\u3057\u307e\u305b\u3093\u3067\u3057\u305f\u3002",
      dmNotInstalled: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u306e\u30a2\u30d7\u30ea\u304c\u8d77\u52d5\u3057\u3066\u3044\u307e\u305b\u3093\u3002YT Download Manager \u3092\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3057\u3066\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u3092\u5b8c\u4e86\u3057\u3066\u304b\u3089\u3001\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002",
      dmStarting: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u3092\u8d77\u52d5\u3057\u3066\u3044\u307e\u3059\u2026",
      dmUnavailable: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u3092\u8d77\u52d5\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u30b9\u30bf\u30fc\u30c8\u30e1\u30cb\u30e5\u30fc\u304b\u3089\u8d77\u52d5\u3059\u308b\u304b\u3001\u30d6\u30e9\u30a6\u30b6\u30fc\u3067\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
      dmBrowserInstead: "\u30d6\u30e9\u30a6\u30b6\u30fc\u3067\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9",
      dmUseApp: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u3092\u4f7f\u3046',
      extReloaded: '\u62e1\u5f35\u6a5f\u80fd\u304c\u66f4\u65b0\u3055\u308c\u307e\u3057\u305f\u3002\u7d9a\u3051\u308b\u306b\u306f\u3053\u306e\u30da\u30fc\u30b8\u3092\u518d\u8aad\u307f\u8fbc\u307f\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
      dmAlreadyDone: "\u3053\u308c\u306f\u3059\u3067\u306b\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u6e08\u307f\u3067\u3059\u3002",
      dmOffline: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u304c\u8d77\u52d5\u3057\u3066\u3044\u307e\u305b\u3093\u3002\u6b21\u306b\u8d77\u52d5\u3057\u305f\u3068\u304d\u306b\u3053\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u518d\u958b\u3057\u307e\u3059\u3002",
      downloadAgain: "\u3082\u3046\u4e00\u5ea6\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9",
      showInFolder: "\u30d5\u30a9\u30eb\u30c0\u30fc\u306b\u8868\u793a",
      openFolder: "\u30d5\u30a9\u30eb\u30c0\u30fc\u3092\u958b\u304f",
      dmFolderPicker: "PC \u3067\u958b\u3044\u305f\u30a6\u30a3\u30f3\u30c9\u30a6\u3067\u30d5\u30a9\u30eb\u30c0\u30fc\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002",
      downloadingVideo: "\u52d5\u753b\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u4e2d\u2026",
      downloadingAudio: "\u97f3\u58f0\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u4e2d\u2026",
      verifying: "\u30d5\u30a1\u30a4\u30eb\u3092\u78ba\u8a8d\u4e2d\u2026",
      updatingEngine: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30a8\u30f3\u30b8\u30f3\u3092\u66f4\u65b0\u4e2d\u2026",
      waitingFolder: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30d5\u30a9\u30eb\u30c0\u30fc\u3092\u5f85\u3063\u3066\u3044\u307e\u3059\u3002\u30c9\u30e9\u30a4\u30d6\u3092\u63a5\u7d9a\u3057\u76f4\u3059\u304b\u3001\u5225\u306e\u30d5\u30a9\u30eb\u30c0\u30fc\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002",
      errPrivate: "\u3053\u306e\u52d5\u753b\u306f\u975e\u516c\u958b\u3067\u3059\u3002",
      errNoDownload: 'YouTube \u306f\u3053\u306e\u52d5\u753b\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u63d0\u4f9b\u3057\u3066\u3044\u307e\u305b\u3093\u3002', errDrm: '\u3053\u306e\u52d5\u753b\u306f\u30b3\u30d4\u30fc\u4fdd\u8b77\u3055\u308c\u3066\u3044\u308b\u305f\u3081\u3001\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u307e\u305b\u3093\u3002', errSessionExpired: 'YouTube \u306e\u30ed\u30b0\u30a4\u30f3\u72b6\u614b\u304c\u5909\u308f\u308a\u307e\u3057\u305f\u3002\u30da\u30fc\u30b8\u3092\u518d\u8aad\u307f\u8fbc\u307f\u3057\u3066\u304b\u3089\u3001\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002', errMembers: "\u3053\u306e\u52d5\u753b\u306f\u30c1\u30e3\u30f3\u30cd\u30eb\u30e1\u30f3\u30d0\u30fc\u9650\u5b9a\u3067\u3059\u3002", errSignIn: '\u3053\u306e\u52d5\u753b\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3059\u308b\u306b\u306f\u3001\u3053\u306e\u30d6\u30e9\u30a6\u30b6\u30fc\u3067 YouTube \u306b\u30ed\u30b0\u30a4\u30f3\u3057\u3066\u304f\u3060\u3055\u3044\u3002', errAgeAccount: 'YouTube \u3067\u306f\u304a\u4f7f\u3044\u306e\u30a2\u30ab\u30a6\u30f3\u30c8\u3067\u3053\u306e\u52d5\u753b\u3092\u8996\u8074\u3067\u304d\u307e\u305b\u3093\uff08\u5e74\u9f62\u78ba\u8a8d\uff09\u3002', errMembersAccount: '\u3053\u306e\u52d5\u753b\u306f\u30c1\u30e3\u30f3\u30cd\u30eb\u30e1\u30f3\u30d0\u30fc\u9650\u5b9a\u3067\u3059\u3002\u304a\u4f7f\u3044\u306e\u30a2\u30ab\u30a6\u30f3\u30c8\u306f\u30e1\u30f3\u30d0\u30fc\u3067\u306f\u3042\u308a\u307e\u305b\u3093\u3002', errPrivateAccount: '\u3053\u306e\u52d5\u753b\u306f\u975e\u516c\u958b\u3067\u3001\u304a\u4f7f\u3044\u306e\u30a2\u30ab\u30a6\u30f3\u30c8\u306b\u306f\u30a2\u30af\u30bb\u30b9\u6a29\u304c\u3042\u308a\u307e\u305b\u3093\u3002',
      errAge: "\u3053\u306e\u52d5\u753b\u306b\u306f\u5e74\u9f62\u5236\u9650\u304c\u3042\u308a\u3001\u30ed\u30b0\u30a4\u30f3\u3057\u306a\u3044\u3068\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u307e\u305b\u3093\u3002",
      errGeo: "\u3053\u306e\u52d5\u753b\u306f\u304a\u4f4f\u307e\u3044\u306e\u56fd\u3067\u306f\u5229\u7528\u3067\u304d\u307e\u305b\u3093\u3002",
      errLive: "\u30e9\u30a4\u30d6\u914d\u4fe1\u3068\u30d7\u30ec\u30df\u30a2\u516c\u958b\u306f\u7d42\u4e86\u5f8c\u306b\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u307e\u3059\u3002",
      errDiskFull: "\u7a7a\u304d\u5bb9\u91cf\u304c\u8db3\u308a\u307e\u305b\u3093\u3002\u5bb9\u91cf\u3092\u7a7a\u3051\u3066\u304b\u3089\u300c\u518d\u8a66\u884c\u300d\u3092\u62bc\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
      errVerify: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3057\u305f\u30d5\u30a1\u30a4\u30eb\u304c\u58ca\u308c\u3066\u3044\u305f\u305f\u3081\u4fdd\u5b58\u3057\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u300c\u518d\u8a66\u884c\u300d\u3092\u62bc\u3057\u3066\u3082\u3046\u4e00\u5ea6\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
      errEngine: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30a8\u30f3\u30b8\u30f3\u306e\u66f4\u65b0\u304c\u5fc5\u8981\u3067\u3059\u304c\u3001\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u30a4\u30f3\u30bf\u30fc\u30cd\u30c3\u30c8\u63a5\u7d9a\u3092\u78ba\u8a8d\u3057\u3066\u304b\u3089\u300c\u518d\u8a66\u884c\u300d\u3092\u62bc\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
      errEngineMissing: "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u306e\u4e00\u90e8\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002\u30b9\u30bf\u30fc\u30c8\u30e1\u30cb\u30e5\u30fc\u304b\u3089\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u3092\u3082\u3046\u4e00\u5ea6\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
      errReason: 'YouTube \u304b\u3089\u306e\u30e1\u30c3\u30bb\u30fc\u30b8\uff1a{reason}',
      errUnavailable: '\u3053\u306e\u52d5\u753b\u306f\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3067\u304d\u307e\u305b\u3093\u3002',
      errFormats: '\u3053\u306e\u52d5\u753b\u306e\u5f62\u5f0f\u3092\u8aad\u307f\u8fbc\u3081\u307e\u305b\u3093\u3067\u3057\u305f\u3002',
      errNoThumb: '\u3053\u306e\u52d5\u753b\u306b\u306f\u30b5\u30e0\u30cd\u30a4\u30eb\u304c\u3042\u308a\u307e\u305b\u3093\u3002',
      errNoSubs: 'YouTube \u304b\u3089\u7a7a\u306e\u5b57\u5e55\u304c\u8fd4\u3055\u308c\u307e\u3057\u305f\u3002',
      errClip: '\u9078\u629e\u3057\u305f\u30af\u30ea\u30c3\u30d7\u304c\u52d5\u753b\u306e\u7bc4\u56f2\u5916\u3067\u3059\u3002',
      errNotReady: '\u52d5\u753b\u306e\u6e96\u5099\u304c\u3067\u304d\u3066\u3044\u307e\u305b\u3093\u3002',
      errFrame: '\u3053\u306e\u30d5\u30ec\u30fc\u30e0\u3092\u30ad\u30e3\u30d7\u30c1\u30e3\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002',
      errFolder: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30d5\u30a9\u30eb\u30c0\u3078\u306e\u30a2\u30af\u30bb\u30b9\u8a31\u53ef\u304c\u3042\u308a\u307e\u305b\u3093\u3002',
      errMoved: '\u30d5\u30a1\u30a4\u30eb\u304c\u79fb\u52d5\u307e\u305f\u306f\u524a\u9664\u3055\u308c\u307e\u3057\u305f\u3002',
      errDecode: '\u3053\u306e\u97f3\u58f0\u3092\u5909\u63db\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002',
      errGeneric: '\u554f\u984c\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002',
      backToVideo: '\u52d5\u753b\u306b\u623b\u308b', goHome: '\u518d\u751f\u3057\u305f\u307e\u307e\u30db\u30fc\u30e0\u3078',
      preparingEngine: '\u5909\u63db\u30c4\u30fc\u30eb\u3092\u6e96\u5099\u3057\u3066\u3044\u307e\u3059\uff08\u521d\u56de\u306e\u307f\uff09 \u00b7 {p}%',
      converting: '\u5909\u63db\u4e2d \u00b7 {p}%',
      folderTitle: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5148\u30d5\u30a9\u30eb\u30c0',
      folderHint: '\u30d5\u30a9\u30eb\u30c0\u3092\u9078\u3076\u304b\u3001\u65b0\u3057\u304f\u4f5c\u6210\u3057\u3066\u304f\u3060\u3055\u3044\uff08\u4f8b: \u30c0\u30a6\u30f3\u30ed\u30fc\u30c9 \u203a YouTube\uff09\u3002\u30d6\u30e9\u30a6\u30b6\u306f\u3001\u30a6\u30a7\u30d6\u30b5\u30a4\u30c8\u304c\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30fb\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u30fb\u30c7\u30b9\u30af\u30c8\u30c3\u30d7\u306e\u5404\u30d5\u30a9\u30eb\u30c0\u76f4\u4e0b\u306b\u4fdd\u5b58\u3059\u308b\u3053\u3068\u3092\u8a31\u53ef\u3057\u3066\u3044\u306a\u3044\u305f\u3081\u3001\u305d\u306e\u4e2d\u306e\u30d5\u30a9\u30eb\u30c0\u3092\u4f7f\u3063\u3066\u304f\u3060\u3055\u3044\u3002\u9078\u629e\u753b\u9762\u306b\u306f\u300c\u65b0\u3057\u3044\u30d5\u30a9\u30eb\u30c0\u30fc\u300d\u30dc\u30bf\u30f3\u304c\u3042\u308a\u307e\u3059\u3002',
      folderChoose: '\u30d5\u30a9\u30eb\u30c0\u3092\u9078\u629e\u2026',
      folderNotWritable: '\u3053\u306e\u30d5\u30a9\u30eb\u30c0\u306b\u306f\u30d5\u30a1\u30a4\u30eb\u3092\u4fdd\u5b58\u3067\u304d\u307e\u305b\u3093\u3002\u5225\u306e\u30d5\u30a9\u30eb\u30c0\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002',
      folderPickFailed: '\u3053\u306e\u30d5\u30a9\u30eb\u30c0\u306f\u4f7f\u7528\u3067\u304d\u307e\u305b\u3093\u3002\u5225\u306e\u30d5\u30a9\u30eb\u30c0\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002',
      folderMissing: '\u30d5\u30a9\u30eb\u30c0\u300c{name}\u300d\u306f\u5229\u7528\u3067\u304d\u306a\u304f\u306a\u308a\u307e\u3057\u305f\u3002\u79fb\u52d5\u30fb\u524a\u9664\u3055\u308c\u305f\u304b\u3001\u30c9\u30e9\u30a4\u30d6\u304c\u63a5\u7d9a\u3055\u308c\u3066\u3044\u306a\u3044\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u3002',
      folderMissingSaved: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5148\u30d5\u30a9\u30eb\u30c0\u304c\u5229\u7528\u3067\u304d\u306a\u3044\u305f\u3081\u3001\u30d6\u30e9\u30a6\u30b6\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306b\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002',
      folderPermission: '\u8a31\u53ef\u304c\u5fc5\u8981',
      folderAllow: '\u30a2\u30af\u30bb\u30b9\u3092\u8a31\u53ef',
      folderUnavailable: '\u5229\u7528\u4e0d\u53ef',
      folderRestartNote: '\u30d6\u30e9\u30a6\u30b6\u3092\u518d\u8d77\u52d5\u3057\u305f\u5f8c\u3001\u30a2\u30af\u30bb\u30b9\u306e\u8a31\u53ef\u3092\u3082\u3046\u4e00\u5ea6\u6c42\u3081\u3089\u308c\u308b\u3053\u3068\u304c\u3042\u308a\u307e\u3059\u3002',
      errConvert: '\u3053\u306e\u30d5\u30a1\u30a4\u30eb\u3092\u5909\u63db\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002',
    },
    zh: {
      toolbarLabel: '\u4e0b\u8f7d\u5de5\u5177',
      tipVideo: '\u4e0b\u8f7d\u89c6\u9891', tipAudio: '\u4e0b\u8f7d\u97f3\u9891', tipThumb: '\u4e0b\u8f7d\u7f29\u7565\u56fe', tipSubs: '\u4e0b\u8f7d\u5b57\u5e55',
      tipShot: '\u4fdd\u5b58\u5f53\u524d\u753b\u9762\u622a\u56fe', download: '\u4e0b\u8f7d', dlShort: '\u4e0b\u8f7d', tipView: '\u663e\u793a\u9009\u9879',
      tipToDark: '\u5207\u6362\u5230\u6df1\u8272\u4e3b\u9898', tipToLight: '\u5207\u6362\u5230\u6d45\u8272\u4e3b\u9898',
      focusMode: '\u5927\u753b\u9762', tipFocusOn: '\u5927\u753b\u9762\uff1a\u6eda\u52a8\u65f6\u4fdd\u6301\u89c6\u9891\u53ef\u89c1\uff0c\u524d\u5f80\u9996\u9875\u65f6\u7ee7\u7eed\u64ad\u653e', tipFocusOff: '\u9000\u51fa\u5927\u753b\u9762',
      pip: '\u753b\u4e2d\u753b', tipPipOff: '\u9000\u51fa\u753b\u4e2d\u753b', loop: '\u5faa\u73af\u64ad\u653e', tipLoopOff: '\u505c\u6b62\u5faa\u73af\u64ad\u653e',
      pipActive: '\u6b63\u5728\u4ee5\u753b\u4e2d\u753b\u6a21\u5f0f\u64ad\u653e', pipHint: '\u89c6\u9891\u4f1a\u5728\u4e00\u4e2a\u59cb\u7ec8\u7f6e\u9876\u7684\u5c0f\u7a97\u53e3\u4e2d\u7ee7\u7eed\u64ad\u653e\uff0c\u5207\u6362\u6807\u7b7e\u9875\u4e5f\u4e0d\u53d7\u5f71\u54cd\u3002', pipBack: '\u56de\u5230\u6b64\u5904\u64ad\u653e', prevShort: '\u4e0a\u4e00\u4e2a\u89c6\u9891', nextShort: '\u4e0b\u4e00\u4e2a\u89c6\u9891', pipPlay: '\u64ad\u653e', pipPause: '\u6682\u505c', pipMute: '\u9759\u97f3', pipUnmute: '\u53d6\u6d88\u9759\u97f3', pipFit: '\u663e\u793a\u5b8c\u6574\u89c6\u9891', pipFill: '\u586b\u6ee1\u7a97\u53e3', pipHintShorts: '\u5728\u7a97\u53e3\u4e2d\u6eda\u52a8\u5373\u53ef\u5207\u6362\u5230\u4e0b\u4e00\u4e2a Short\u3002\u5373\u4f7f\u5207\u6362\u6807\u7b7e\u9875\uff0c\u5b83\u4e5f\u4f1a\u663e\u793a\u5728\u5176\u4ed6\u7a97\u53e3\u4e0a\u65b9\u3002',
      settings: '\u8bbe\u7f6e', help: '\u5e2e\u52a9', hideToolbar: '\u9690\u85cf\u5de5\u5177\u680f', back: '\u8fd4\u56de', close: '\u5173\u95ed',
      pin: '\u4fdd\u6301\u6253\u5f00', unpin: '\u70b9\u51fb\u5916\u90e8\u65f6\u5173\u95ed',
      quality: '\u753b\u8d28', format: '\u683c\u5f0f', language: '\u8bed\u8a00', fileFormat: '\u6587\u4ef6\u683c\u5f0f',
      trim: '\u526a\u8f91', start: '\u5f00\u59cb', end: '\u7ed3\u675f', clipStart: '\u7247\u6bb5\u5f00\u59cb', clipEnd: '\u7247\u6bb5\u7ed3\u675f',
      fullLength: '\u5b8c\u6574\u65f6\u957f', clip: '\u7247\u6bb5', reset: '\u91cd\u7f6e', syncPlayer: '\u4e0e\u64ad\u653e\u5668\u540c\u6b65', setToNow: '\u4f7f\u7528\u5f53\u524d\u64ad\u653e\u65f6\u95f4',
      trimNotOpus: '\u526a\u8f91\u9002\u7528\u4e8e MP3\u3001M4A \u548c WAV\u3002',
      added: '\u5df2\u6dfb\u52a0', tryAgain: '\u91cd\u8bd5', loadingFormats: '\u6b63\u5728\u52a0\u8f7d\u683c\u5f0f\u2026',
      noVideo: '\u6ca1\u6709\u53ef\u4e0b\u8f7d\u7684\u89c6\u9891\u683c\u5f0f', noAudio: '\u6ca1\u6709\u53ef\u4e0b\u8f7d\u7684\u97f3\u9891\u683c\u5f0f', noSubs: '\u6b64\u89c6\u9891\u6ca1\u6709\u5b57\u5e55',
      autoSubsNote: '\u81ea\u52a8\u751f\u6210\u7684\u5b57\u5e55\u5e26\u6709\u6b64\u56fe\u6807',
      hintCover: '\u542b\u5c01\u9762', hintOriginal: '\u539f\u59cb\u97f3\u8d28', hintLossless: '\u65e0\u635f',
      thumbMax: '\u6700\u9ad8\u5206\u8fa8\u7387', thumbStandard: '\u6807\u51c6', thumbHigh: '\u9ad8', thumbMedium: '\u4e2d', thumbPortrait: '\u7ad6\u7248',
      notAvailable: '\u4e0d\u53ef\u7528', thumbPreview: '\u7f29\u7565\u56fe\u9884\u89c8',
      appearance: '\u5916\u89c2', themeDevice: '\u4f7f\u7528\u8bbe\u5907\u4e3b\u9898', themeDark: '\u6df1\u8272\u4e3b\u9898', themeLight: '\u6d45\u8272\u4e3b\u9898',
      downloads: '\u4e0b\u8f7d', changeFolder: '\u66f4\u6539\u4e0b\u8f7d\u6587\u4ef6\u5939', browserDefault: '\u6d4f\u89c8\u5668\u9ed8\u8ba4',
      useBrowserFolder: '\u4f7f\u7528\u6d4f\u89c8\u5668\u4e0b\u8f7d\u6587\u4ef6\u5939', autoOpenHistory: '\u5f00\u59cb\u4e0b\u8f7d\u65f6\u6253\u5f00\u5386\u53f2\u8bb0\u5f55',
      clearFinished: '\u6e05\u9664\u5df2\u5b8c\u6210\u7684\u4e0b\u8f7d', languageAuto: '\u81ea\u52a8',
      help1: '\u89c6\u9891\u3001\u97f3\u9891\u3001\u7f29\u7565\u56fe\u548c\u5b57\u5e55\u6309\u94ae\u4f1a\u6253\u5f00\u9009\u62e9\u9762\u677f\u3002\u62d6\u52a8\u526a\u8f91\u624b\u67c4\u6216\u8f93\u5165\u65f6\u95f4\uff0c\u5373\u53ef\u53ea\u4e0b\u8f7d\u4e00\u4e2a\u7247\u6bb5\u3002',
      help2: '\u76f8\u673a\u6309\u94ae\u5c06\u5f53\u524d\u753b\u9762\u4fdd\u5b58\u4e3a\u56fe\u7247\u3002YouTube \u53f3\u4e0a\u89d2\u7684\u65f6\u949f\u53ef\u6253\u5f00\u4e0b\u8f7d\u5386\u53f2\uff1b\u62d6\u52a8\u5176\u6807\u9898\u680f\u5373\u53ef\u79fb\u52a8\u3002',
      help3: '\u5927\u753b\u9762\u4f1a\u5728\u6eda\u52a8\u65f6\u5c06\u89c6\u9891\u56fa\u5b9a\u5728\u89d2\u843d\u3002\u524d\u5f80\u9996\u9875\u65f6\u89c6\u9891\u4f1a\u5728\u8ff7\u4f60\u64ad\u653e\u5668\u4e2d\u7ee7\u7eed\u64ad\u653e\uff1b\u70b9\u51fb\u201c\u8fd4\u56de\u89c6\u9891\u201d\u5373\u53ef\u56de\u6765\u3002',
      help4: '\u6240\u6709\u5185\u5bb9\u90fd\u5728\u4f60\u7684\u6d4f\u89c8\u5668\u4e2d\u4e0b\u8f7d\u548c\u8f6c\u6362\u3002\u9664 YouTube \u5916\u4e0d\u4f1a\u5411\u4efb\u4f55\u5730\u65b9\u53d1\u9001\u6570\u636e\u3002',
      help5: '\u9690\u85cf\u4e86\u5de5\u5177\u680f\uff1f\u6253\u5f00 Tampermonkey \u83dc\u5355\u5e76\u9009\u62e9\u201c{cmd}\u201d\u3002',
      history: '\u4e0b\u8f7d\u5386\u53f2\u8bb0\u5f55', historyActive: '\u4e0b\u8f7d\u5386\u53f2\u8bb0\u5f55\uff08{n} \u4e2a\u8fdb\u884c\u4e2d\uff09',
      nActive: '{n} \u4e2a\u8fdb\u884c\u4e2d', nFinished: '{n} \u4e2a\u5df2\u5b8c\u6210', clear: '\u6e05\u9664', dragToMove: '\u62d6\u52a8\u4ee5\u79fb\u52a8',
      noDownloads: '\u8fd8\u6ca1\u6709\u4e0b\u8f7d', noDownloadsHint: '\u4f7f\u7528\u89c6\u9891\u4e0b\u65b9\u7684\u5de5\u5177\u680f\u8fdb\u884c\u4e0b\u8f7d\u3002',
      savingTo: '\u4fdd\u5b58\u5230', browserDownloads: '\u6d4f\u89c8\u5668\u4e0b\u8f7d', chooseFolder: '\u9009\u62e9\u6587\u4ef6\u5939', change: '\u66f4\u6539',
      inFolder: '\u4f4d\u4e8e {folder}', inBrowser: '\u4f4d\u4e8e\u6d4f\u89c8\u5668\u4e0b\u8f7d',
      pause: '\u6682\u505c', resume: '\u7ee7\u7eed', cancel: '\u53d6\u6d88', play: '\u64ad\u653e', retry: '\u91cd\u8bd5', restart: '\u91cd\u65b0\u5f00\u59cb', remove: '\u4ece\u5386\u53f2\u8bb0\u5f55\u4e2d\u79fb\u9664',
      trimmedClip: '\u526a\u8f91\u7247\u6bb5', view: '\u67e5\u770b', show: '\u663e\u793a',
      stQueued: '\u6392\u961f\u4e2d', stDownloading: '\u4e0b\u8f7d\u4e2d', stPaused: '\u5df2\u6682\u505c', stProcessing: '\u5904\u7406\u4e2d', stCompleted: '\u5df2\u5b8c\u6210', stFailed: '\u5931\u8d25', stCanceled: '\u5df2\u53d6\u6d88',
      waitingOthers: '\u6b63\u5728\u7b49\u5f85\u5176\u4ed6\u4e0b\u8f7d\u5b8c\u6210', starting: '\u6b63\u5728\u5f00\u59cb\u2026', findingClip: '\u6b63\u5728\u67e5\u627e\u7247\u6bb5\u2026',
      merging: '\u6b63\u5728\u5408\u5e76\u89c6\u9891\u548c\u97f3\u9891\u2026', cutting: '\u6b63\u5728\u526a\u8f91\u7247\u6bb5\u2026', decoding: '\u6b63\u5728\u51c6\u5907\u97f3\u9891\u2026', encodingMp3: '\u6b63\u5728\u8f6c\u6362\u4e3a MP3 \u00b7 {p}%',
      saving: '\u6b63\u5728\u4fdd\u5b58\u2026', fetchingImage: '\u6b63\u5728\u83b7\u53d6\u56fe\u7247\u2026', fetchingSubs: '\u6b63\u5728\u83b7\u53d6\u5b57\u5e55\u2026',
      reconnecting: '\u8fde\u63a5\u4e2d\u65ad\uff0c\u6b63\u5728\u91cd\u65b0\u8fde\u63a5\u2026', waitingOnline: '\u5df2\u79bb\u7ebf\u3002\u6062\u590d\u8054\u7f51\u540e\u5c06\u7ee7\u7eed\u4e0b\u8f7d\u3002',
      refreshingLink: '\u6b63\u5728\u5237\u65b0\u4e0b\u8f7d\u94fe\u63a5\u2026', waitingSession: '\u6b63\u5728\u7b49\u5f85\u4f60\u7684 YouTube \u767b\u5f55\u2026 \u8bf7\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00 YouTube\u3002',
      sharingBandwidth: '\u89c6\u9891\u64ad\u653e\u65f6\u964d\u901f',
      progressOf: '{got} / {total}', perSecond: '{speed}/\u79d2', timeLeft: '\u5269\u4f59 {t}',
      toastDownloading: '\u6b63\u5728\u4e0b\u8f7d', toastQueued: '\u5df2\u52a0\u5165\u961f\u5217', whatClip: '{what}\uff08\u7247\u6bb5\uff09',
      toastSaved: '\u5df2\u4e0b\u8f7d', toastCanceled: '\u5df2\u53d6\u6d88\u4e0b\u8f7d', toastFailed: '\u4e0b\u8f7d\u5931\u8d25 \u00b7 {err}',
      statusFailed: '\u4e0b\u8f7d\u5931\u8d25', reloadPage: '\u91cd\u65b0\u52a0\u8f7d\u9875\u9762', tipMany: '{n} \u4e2a\u4e0b\u8f7d\uff0c{p}%',
      toastAlready: '\u6b64\u4e0b\u8f7d\u5df2\u5728\u8fdb\u884c\u4e2d',
      folderSet: '\u4e0b\u8f7d\u5185\u5bb9\u5c06\u4fdd\u5b58\u5230\u201c{name}\u201d', folderReset: '\u4e0b\u8f7d\u5185\u5bb9\u5c06\u4fdd\u5b58\u5230\u6d4f\u89c8\u5668\u4e0b\u8f7d\u6587\u4ef6\u5939',
      folderNoPerm: '\u6ca1\u6709\u6240\u9009\u6587\u4ef6\u5939\u7684\u6743\u9650\uff0c\u5df2\u4fdd\u5b58\u5230\u6d4f\u89c8\u5668\u4e0b\u8f7d',
      folderNeedsChromium: '\u9009\u62e9\u6587\u4ef6\u5939\u9700\u8981 Chrome\u3001Edge \u6216\u5176\u4ed6\u57fa\u4e8e Chromium \u7684\u6d4f\u89c8\u5668',
      loopOn: '\u5df2\u5f00\u542f\u5faa\u73af\u64ad\u653e', loopOff: '\u5df2\u5173\u95ed\u5faa\u73af\u64ad\u653e',
      toolbarHidden: '\u5de5\u5177\u680f\u5df2\u9690\u85cf\u3002\u53ef\u5728 Tampermonkey \u83dc\u5355\u4e2d\u9009\u62e9\u201c{cmd}\u201d\u6062\u590d',
      themeConfirm: 'YouTube \u4f1a\u91cd\u65b0\u52a0\u8f7d\u9875\u9762\u4ee5\u66f4\u6539\u4e3b\u9898\u3002\u6b63\u5728\u8fdb\u884c\u7684\u4e0b\u8f7d\uff08{n} \u4e2a\uff09\u5c06\u88ab\u53d6\u6d88\u3002\u662f\u5426\u7ee7\u7eed\uff1f',
      menuShowToolbar: '\u663e\u793a\u4e0b\u8f7d\u5de5\u5177\u680f', menuOpenHistory: '\u6253\u5f00\u4e0b\u8f7d\u5386\u53f2\u8bb0\u5f55',
      errNetwork: '\u8fde\u63a5\u591a\u6b21\u4e2d\u65ad\u3002\u8fdb\u5ea6\u5df2\u4fdd\u7559\uff0c\u8bf7\u5728\u7f51\u7edc\u7a33\u5b9a\u540e\u70b9\u51fb\u201c\u91cd\u8bd5\u201d\u3002',
      errReach: '\u65e0\u6cd5\u8fde\u63a5\u5230 YouTube\u3002\u8bf7\u68c0\u67e5\u7f51\u7edc\u540e\u91cd\u8bd5\u3002',
      errExpired: 'YouTube \u672a\u5141\u8bb8\u5b8c\u6210\u6b64\u4e0b\u8f7d\u3002\u8fdb\u5ea6\u5df2\u4fdd\u7559\uff0c\u8bf7\u7a0d\u540e\u70b9\u51fb\u201c\u91cd\u8bd5\u201d\u3002',
      errFormatGone: '\u6b64\u683c\u5f0f\u5df2\u4e0d\u53ef\u7528\u3002',
      errNoDirect: "YouTube \u76ee\u524d\u4e0d\u63d0\u4f9b\u6b64\u89c6\u9891\u7684\u76f4\u63a5\u4e0b\u8f7d\u3002\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
      errBlocked: "YouTube \u6b63\u5728\u963b\u6b62\u901a\u8fc7\u60a8\u5f53\u524d\u7684\u7f51\u7edc\u8fde\u63a5\u4e0b\u8f7d\u6b64\u89c6\u9891\u3002\u5982\u679c\u60a8\u5728\u4f7f\u7528 VPN\uff0c\u8bf7\u5c06\u5176\u5173\u95ed\u6216\u5207\u6362\u670d\u52a1\u5668\uff0c\u7136\u540e\u70b9\u51fb\u201c\u91cd\u8bd5\u201d\u3002\u8fdb\u5ea6\u5df2\u4fdd\u7559\u3002",
      dmTitle: "\u4e0b\u8f7d\u7ba1\u7406\u5668",
      dmConnectedHint: "\u5df2\u8fde\u63a5",
      dmNotRunning: "\u9700\u8981\u65f6\u81ea\u52a8\u542f\u52a8",
      dmConnect: "\u8fde\u63a5\u2026",
      dmConnected: "\u5df2\u8fde\u63a5\u5230\u4e0b\u8f7d\u7ba1\u7406\u5668\u3002\u4e0b\u8f7d\u5185\u5bb9\u73b0\u5728\u4f1a\u4fdd\u5b58\u5230\u4f60\u5728\u5176\u4e2d\u9009\u62e9\u7684\u6587\u4ef6\u5939\u3002",
      dmPairWaiting: "\u8bf7\u5728\u7535\u8111\u4e0a\u7684\u4e0b\u8f7d\u7ba1\u7406\u5668\u7a97\u53e3\u4e2d\u786e\u8ba4\u8fde\u63a5\u3002",
      dmDenied: "\u4e0b\u8f7d\u7ba1\u7406\u5668\u672a\u5141\u8bb8\u8fde\u63a5\u3002",
      dmNotInstalled: "\u4e0b\u8f7d\u7ba1\u7406\u5668\u5e94\u7528\u672a\u8fd0\u884c\u3002\u8bf7\u5b89\u88c5 YT Download Manager \u5e76\u5b8c\u6210\u8bbe\u7f6e\uff0c\u7136\u540e\u91cd\u8bd5\u3002",
      dmStarting: "\u6b63\u5728\u542f\u52a8\u4e0b\u8f7d\u7ba1\u7406\u5668\u2026",
      dmUnavailable: "\u65e0\u6cd5\u542f\u52a8\u4e0b\u8f7d\u7ba1\u7406\u5668\u3002\u4f60\u53ef\u4ee5\u4ece\u201c\u5f00\u59cb\u201d\u83dc\u5355\u542f\u52a8\u5b83\uff0c\u6216\u5728\u6d4f\u89c8\u5668\u4e2d\u4e0b\u8f7d\u3002",
      dmBrowserInstead: "\u5728\u6d4f\u89c8\u5668\u4e2d\u4e0b\u8f7d",
      dmUseApp: '\u4f7f\u7528\u4e0b\u8f7d\u7ba1\u7406\u5668',
      extReloaded: '\u6269\u5c55\u7a0b\u5e8f\u5df2\u66f4\u65b0\u3002\u8bf7\u91cd\u65b0\u52a0\u8f7d\u6b64\u9875\u9762\u4ee5\u7ee7\u7eed\u3002',
      dmAlreadyDone: "\u4f60\u5df2\u7ecf\u4e0b\u8f7d\u8fc7\u8fd9\u4e2a\u4e86\u3002",
      dmOffline: "\u4e0b\u8f7d\u7ba1\u7406\u5668\u672a\u8fd0\u884c\u3002\u5b83\u518d\u6b21\u542f\u52a8\u540e\uff0c\u6b64\u4e0b\u8f7d\u4f1a\u7ee7\u7eed\u3002",
      downloadAgain: "\u518d\u6b21\u4e0b\u8f7d",
      showInFolder: "\u5728\u6587\u4ef6\u5939\u4e2d\u663e\u793a",
      openFolder: "\u6253\u5f00\u6587\u4ef6\u5939",
      dmFolderPicker: "\u8bf7\u5728\u7535\u8111\u4e0a\u6253\u5f00\u7684\u7a97\u53e3\u4e2d\u9009\u62e9\u6587\u4ef6\u5939\u3002",
      downloadingVideo: "\u6b63\u5728\u4e0b\u8f7d\u89c6\u9891\u2026",
      downloadingAudio: "\u6b63\u5728\u4e0b\u8f7d\u97f3\u9891\u2026",
      verifying: "\u6b63\u5728\u68c0\u67e5\u6587\u4ef6\u2026",
      updatingEngine: "\u6b63\u5728\u66f4\u65b0\u4e0b\u8f7d\u5f15\u64ce\u2026",
      waitingFolder: "\u6b63\u5728\u7b49\u5f85\u4e0b\u8f7d\u6587\u4ef6\u5939\u3002\u8bf7\u91cd\u65b0\u8fde\u63a5\u5176\u6240\u5728\u7684\u9a71\u52a8\u5668\uff0c\u6216\u9009\u62e9\u5176\u4ed6\u6587\u4ef6\u5939\u3002",
      errPrivate: "\u6b64\u89c6\u9891\u4e3a\u79c1\u4eab\u89c6\u9891\u3002",
      errNoDownload: 'YouTube \u4e0d\u63d0\u4f9b\u6b64\u89c6\u9891\u7684\u4e0b\u8f7d\u3002', errDrm: '\u6b64\u89c6\u9891\u53d7\u590d\u5236\u4fdd\u62a4\uff0c\u65e0\u6cd5\u4e0b\u8f7d\u3002', errSessionExpired: '\u4f60\u7684 YouTube \u767b\u5f55\u5df2\u66f4\u6539\u3002\u8bf7\u5237\u65b0\u9875\u9762\u540e\u91cd\u8bd5\u3002', errMembers: "\u6b64\u89c6\u9891\u4ec5\u9650\u9891\u9053\u4f1a\u5458\u89c2\u770b\u3002", errSignIn: '\u8bf7\u5728\u6b64\u6d4f\u89c8\u5668\u4e2d\u767b\u5f55 YouTube \u4ee5\u4e0b\u8f7d\u6b64\u89c6\u9891\u3002', errAgeAccount: 'YouTube \u4e0d\u5141\u8bb8\u4f60\u7684\u5e10\u53f7\u89c2\u770b\u6b64\u89c6\u9891\uff08\u5e74\u9f84\u9a8c\u8bc1\uff09\u3002', errMembersAccount: '\u6b64\u89c6\u9891\u4ec5\u9650\u9891\u9053\u4f1a\u5458\u89c2\u770b\u3002\u4f60\u7684\u5e10\u53f7\u4e0d\u662f\u4f1a\u5458\u3002', errPrivateAccount: '\u6b64\u89c6\u9891\u4e3a\u79c1\u4eab\u89c6\u9891\uff0c\u4f60\u7684\u5e10\u53f7\u65e0\u6743\u8bbf\u95ee\u3002',
      errAge: "\u6b64\u89c6\u9891\u6709\u5e74\u9f84\u9650\u5236\uff0c\u4e0d\u767b\u5f55\u65e0\u6cd5\u4e0b\u8f7d\u3002",
      errGeo: "\u6b64\u89c6\u9891\u5728\u4f60\u6240\u5728\u7684\u56fd\u5bb6/\u5730\u533a\u4e0d\u53ef\u7528\u3002",
      errLive: "\u76f4\u64ad\u548c\u9996\u6620\u7ed3\u675f\u540e\u624d\u80fd\u4e0b\u8f7d\u3002",
      errDiskFull: "\u53ef\u7528\u7a7a\u95f4\u4e0d\u8db3\u3002\u8bf7\u91ca\u653e\u7a7a\u95f4\u540e\u70b9\u51fb\u201c\u91cd\u8bd5\u201d\u3002",
      errVerify: "\u4e0b\u8f7d\u7684\u6587\u4ef6\u5df2\u635f\u574f\uff0c\u56e0\u6b64\u672a\u4fdd\u5b58\u3002\u70b9\u51fb\u201c\u91cd\u8bd5\u201d\u91cd\u65b0\u4e0b\u8f7d\u3002",
      errEngine: "\u4e0b\u8f7d\u5f15\u64ce\u9700\u8981\u66f4\u65b0\uff0c\u4f46\u65e0\u6cd5\u5b89\u88c5\u3002\u8bf7\u68c0\u67e5\u7f51\u7edc\u8fde\u63a5\u540e\u70b9\u51fb\u201c\u91cd\u8bd5\u201d\u3002",
      errEngineMissing: "\u4e0b\u8f7d\u7ba1\u7406\u5668\u7f3a\u5c11\u90e8\u5206\u7ec4\u4ef6\u3002\u8bf7\u4ece\u201c\u5f00\u59cb\u201d\u83dc\u5355\u91cd\u65b0\u8fd0\u884c\u5176\u8bbe\u7f6e\u3002",
      errReason: 'YouTube \u63d0\u793a\uff1a{reason}',
      errUnavailable: '\u65e0\u6cd5\u4e0b\u8f7d\u6b64\u89c6\u9891\u3002',
      errFormats: '\u65e0\u6cd5\u52a0\u8f7d\u6b64\u89c6\u9891\u7684\u683c\u5f0f\u3002',
      errNoThumb: '\u6b64\u89c6\u9891\u6ca1\u6709\u53ef\u7528\u7684\u7f29\u7565\u56fe\u3002',
      errNoSubs: 'YouTube \u8fd4\u56de\u4e86\u7a7a\u5b57\u5e55\u3002',
      errClip: '\u6240\u9009\u7247\u6bb5\u8d85\u51fa\u4e86\u89c6\u9891\u8303\u56f4\u3002',
      errNotReady: '\u89c6\u9891\u5c1a\u672a\u51c6\u5907\u597d\u3002',
      errFrame: '\u65e0\u6cd5\u622a\u53d6\u6b64\u753b\u9762\u3002',
      errFolder: '\u6ca1\u6709\u4e0b\u8f7d\u6587\u4ef6\u5939\u7684\u6743\u9650\u3002',
      errMoved: '\u6587\u4ef6\u5df2\u88ab\u79fb\u52a8\u6216\u5220\u9664\u3002',
      errDecode: '\u65e0\u6cd5\u8f6c\u6362\u6b64\u97f3\u9891\u3002',
      errGeneric: '\u51fa\u4e86\u70b9\u95ee\u9898\uff0c\u8bf7\u91cd\u8bd5\u3002',
      backToVideo: '\u8fd4\u56de\u89c6\u9891', goHome: '\u7ee7\u7eed\u64ad\u653e\u5e76\u8fd4\u56de\u9996\u9875',
      preparingEngine: '\u6b63\u5728\u51c6\u5907\u8f6c\u6362\u5de5\u5177\uff08\u4ec5\u9996\u6b21\uff09 \u00b7 {p}%',
      converting: '\u6b63\u5728\u8f6c\u6362 \u00b7 {p}%',
      folderTitle: '\u4e0b\u8f7d\u6587\u4ef6\u5939',
      folderHint: '\u9009\u62e9\u4e00\u4e2a\u6587\u4ef6\u5939\u6216\u65b0\u5efa\u4e00\u4e2a\uff0c\u4f8b\u5982\u201c\u4e0b\u8f7d \u203a YouTube\u201d\u3002\u6d4f\u89c8\u5668\u4e0d\u5141\u8bb8\u7f51\u7ad9\u76f4\u63a5\u4fdd\u5b58\u5230\u201c\u4e0b\u8f7d\u201d\u201c\u6587\u6863\u201d\u6216\u201c\u684c\u9762\u201d\u4e3b\u6587\u4ef6\u5939\u4e2d\uff0c\u8bf7\u4f7f\u7528\u5176\u4e2d\u7684\u5b50\u6587\u4ef6\u5939\u3002\u9009\u62e9\u7a97\u53e3\u4e2d\u6709\u201c\u65b0\u5efa\u6587\u4ef6\u5939\u201d\u6309\u94ae\u3002',
      folderChoose: '\u9009\u62e9\u6587\u4ef6\u5939\u2026',
      folderNotWritable: '\u65e0\u6cd5\u5728\u6b64\u6587\u4ef6\u5939\u4e2d\u4fdd\u5b58\u6587\u4ef6\u3002\u8bf7\u9009\u62e9\u5176\u4ed6\u6587\u4ef6\u5939\u3002',
      folderPickFailed: '\u65e0\u6cd5\u4f7f\u7528\u6b64\u6587\u4ef6\u5939\u3002\u8bf7\u9009\u62e9\u5176\u4ed6\u6587\u4ef6\u5939\u3002',
      folderMissing: '\u6587\u4ef6\u5939\u201c{name}\u201d\u5df2\u4e0d\u53ef\u7528\u3002\u5b83\u53ef\u80fd\u5df2\u88ab\u79fb\u52a8\u6216\u5220\u9664\uff0c\u6216\u8005\u6240\u5728\u7684\u9a71\u52a8\u5668\u5df2\u65ad\u5f00\u8fde\u63a5\u3002',
      folderMissingSaved: '\u4e0b\u8f7d\u6587\u4ef6\u5939\u4e0d\u53ef\u7528\uff0c\u6587\u4ef6\u5df2\u4fdd\u5b58\u5230\u6d4f\u89c8\u5668\u4e0b\u8f7d\u3002',
      folderPermission: '\u9700\u8981\u6743\u9650',
      folderAllow: '\u5141\u8bb8\u8bbf\u95ee',
      folderUnavailable: '\u4e0d\u53ef\u7528',
      folderRestartNote: '\u91cd\u542f\u6d4f\u89c8\u5668\u540e\uff0c\u53ef\u80fd\u9700\u8981\u518d\u5141\u8bb8\u4e00\u6b21\u8bbf\u95ee\u3002',
      errConvert: '\u65e0\u6cd5\u8f6c\u6362\u6b64\u6587\u4ef6\u3002',
    },
  };

  const settings = {
    autoOpenPanel: false, barHidden: false, syncTrim: true, lang: 'auto', pipFit: false,
    videoKey: '', audioKey: 'mp3-320', thumbKey: 'maxresdefault', tallThumbKey: 'oardefault', subFmt: 'srt', subsKey: '',
    ...GM_getValue('settings', {}),
  };
  const saveSettings = () => GM_setValue('settings', settings);

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
    return new Promise((resolve, reject) => GM_xmlhttpRequest({
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
    try { return pageWin.ytcfg?.get?.(key); } catch { return undefined; }
  }
  const ytHl = () => (LANG === 'zh' ? 'zh-CN' : LANG);

  // Requests go through the page's own fetch first: same connection (and IP address) as YouTube's
  // own player, which matters because stream URLs are bound to the IP that asked for them. The
  // userscript manager's request API is the fallback when the page context can't reach an address.
  const net = { page: true, pageOk: false };
  const noPage = () => { if (!net.pageOk && navigator.onLine !== false) net.page = false; };

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
    try {
      const pr = pageWin.document.querySelector(onShorts() ? '#shorts-player' : '#movie_player')?.getPlayerResponse?.();
      return pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    } catch { return []; }
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

  const qualityBadge = (h) => (h >= 4320 ? '8K' : h >= 2160 ? '4K' : h >= 1440 ? '2K' : h >= 720 ? 'HD' : '');

  // A quality from the app's list (yt-dlp's view of the video: every codec, HDR, up to 8K). `own` is the
  // browser's option for the same height, kept for a download without the app; without it, only the app
  // can download this one.
  const appVideoOpt = (v, own) => ({
    ...(own || {}),
    kind: 'video', key: `v${v.height}`, format: 'MP4', quality: `${v.height}p${v.fps > 30 ? v.fps : ''}`, height: v.height,
    badge: qualityBadge(v.height), codec: `${v.codec || 'MP4'}${v.hdr ? ' HDR' : ''}`, size: Math.max(0, +v.size || 0), trimmable: true,
    appOnly: !own,
  });

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
      badge: qualityBadge(h),
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

  // The same through the userscript manager (fallback transport).
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
      req = GM_xmlhttpRequest({
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

  // Moves a stream to the other connection (page <-> userscript manager): used when a link fetched
  // moments ago is still refused, which happens when the link request and the stream request leave
  // over different routes (IPv4 vs IPv6, a VPN or proxy that covers only one of them), or when the
  // page's connection keeps failing. The page route is only chosen if it has worked in this tab.
  function switchRoute(src) {
    if (src.switched) return false;
    const to = routeOf(src) === 'page' ? 'gm' : 'page';
    if (to === 'page' && !net.pageOk) return false;
    Object.assign(src, { via: to, switched: true });
    src.gen++;
    return true;
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
        if (e.status) throw e; // fall through to the manager's request API
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
  GM_addStyle(`
    html{--ysd-bg:#fff;--ysd-text:#0f0f0f;--ysd-text2:#606060;--ysd-hover:rgba(0,0,0,.05);--ysd-active:rgba(0,0,0,.1);
      --ysd-divider:rgba(0,0,0,.1);--ysd-border:rgba(0,0,0,.14);--ysd-surface:#fff;--ysd-raised:#fff;--ysd-field:rgba(0,0,0,.04);
      --ysd-accent:#065fd4;--ysd-on-accent:#fff;--ysd-red:#cc0000;--ysd-green:#188038;--ysd-amber:#b25e00;
      --ysd-track:rgba(0,0,0,.12);--ysd-toast-bg:#0f0f0f;--ysd-toast-fg:#fff;--ysd-toast-act:#3ea6ff;--ysd-shadow:0 4px 24px rgba(0,0,0,.14);
      --ysd-ease:cubic-bezier(.2,0,0,1);--ysd-dock-w:clamp(260px,30vw,440px)}
    html[dark]{--ysd-bg:#0f0f0f;--ysd-text:#f1f1f1;--ysd-text2:#aaa;--ysd-hover:rgba(255,255,255,.1);--ysd-active:rgba(255,255,255,.14);
      --ysd-divider:rgba(255,255,255,.1);--ysd-border:rgba(255,255,255,.14);--ysd-surface:#212121;--ysd-raised:#2c2c2c;--ysd-field:rgba(255,255,255,.05);
      --ysd-accent:#3ea6ff;--ysd-on-accent:#0f0f0f;--ysd-red:#ff6b62;--ysd-green:#4cc26e;--ysd-amber:#f5b041;
      --ysd-track:rgba(255,255,255,.18);--ysd-toast-bg:#f1f1f1;--ysd-toast-fg:#0f0f0f;--ysd-toast-act:#065fd4;--ysd-shadow:0 8px 32px rgba(0,0,0,.55)}
    @media (max-width:700px){html{--ysd-dock-w:min(340px,calc(100vw - 84px))}}
    .ysd-ui,.ysd-ui *{box-sizing:border-box}
    .ysd-ui{font-family:Roboto,Arial,sans-serif;color:var(--ysd-text)}
    .ysd-ui button{font-family:inherit}
    .ysd-ui svg{flex:none}

    #ysd-bar{display:flex;align-items:center;justify-content:space-between;gap:4px;min-height:48px;margin-top:8px;padding:0 2px;
      background:var(--ysd-bg);border-bottom:1px solid var(--ysd-divider);user-select:none}
    .ysd-group{display:flex;align-items:center;gap:2px;min-width:0}
    .ysd-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:none;width:36px;height:36px;padding:0;margin:0;
      border:0;border-radius:18px;background:transparent;color:var(--ysd-text);cursor:pointer;outline:none;
      transition:background-color .15s var(--ysd-ease),color .15s var(--ysd-ease)}
    .ysd-btn:hover,.ysd-btn.ysd-open{background:var(--ysd-hover)}
    .ysd-btn.ysd-on{background:var(--ysd-active)}
    .ysd-btn.ysd-open{color:var(--ysd-accent)}
    .ysd-btn svg,.ysd-ibtn svg{transition:transform .12s var(--ysd-ease)}
    .ysd-btn:active svg,.ysd-ibtn:active svg{transform:scale(.86)}
    .ysd-btn.ysd-sm{width:32px;height:32px}
    .ysd-btn.ysd-labeled{width:auto;max-width:100%;padding:0 14px 0 10px;font-size:14px;font-weight:500}
    .ysd-btn.ysd-labeled span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #ysd-bar[data-mode=compact] .ysd-btn:not(.ysd-sm){width:34px;height:34px}
    #ysd-bar[data-mode=tiny] .ysd-btn:not(.ysd-labeled){width:32px;height:32px}
    .ysd-btn:focus-visible,.ysd-ibtn:focus-visible,.ysd-primary:focus-visible,.ysd-select:focus-visible,#ysd-hist:focus-visible{outline:2px solid var(--ysd-accent);outline-offset:1px}
    .ysd-sep{width:1px;height:20px;margin:0 6px;background:var(--ysd-divider)}
    /* Shorts: our buttons at the top of YouTube's column, in YouTube's own look (see borrowShortsLook) */
    #ysd-shorts{display:flex;flex-direction:column;align-items:center;color:inherit}
    #ysd-shorts .ysd-sbtn{cursor:pointer}
    #ysd-shorts .ysd-sbtn.ysd-open .ysd-sico{color:var(--ysd-accent)}
    #ysd-shorts .ysd-sbtn:focus-visible{outline:2px solid var(--ysd-accent);outline-offset:2px}
    #ysd-shorts .ysd-stext{display:block;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #ysd-shorts.ysd-compact .ysd-sitem:last-child{display:none}
    /* A Short's video YouTube left at an old size: fitted into its player (see checkShortFit) */
    #shorts-player.ysd-fit .html5-video-container{position:absolute;inset:0}
    #shorts-player.ysd-fit video.html5-main-video{left:0!important;top:0!important;width:100%!important;height:100%!important;object-fit:contain!important}
    #ysd-shorts.ysd-own .ysd-sitem{padding-bottom:8px}
    #ysd-shorts.ysd-own .ysd-shost{display:flex;flex-direction:column;align-items:center}
    #ysd-shorts.ysd-own .ysd-sbtn{display:flex;align-items:center;justify-content:center;width:48px;height:48px;padding:0;border:0;border-radius:50%;
      background:var(--ysd-hover);color:var(--ysd-text);transition:background-color .15s var(--ysd-ease)}
    #ysd-shorts.ysd-own .ysd-sbtn:hover,#ysd-shorts.ysd-own .ysd-sbtn.ysd-open{background:var(--ysd-active)}
    #ysd-shorts.ysd-own .ysd-slab{margin-top:4px;font-size:12px;line-height:18px;text-align:center}

    .ysd-tip{position:fixed;z-index:2600;max-width:min(280px,calc(100vw - 16px));padding:6px 8px;border-radius:4px;background:rgba(97,97,97,.95);color:#fff;
      font:400 12px/16px Roboto,Arial,sans-serif;pointer-events:none;opacity:0;transform:translateY(-2px);
      transition:opacity .12s var(--ysd-ease),transform .12s var(--ysd-ease)}
    .ysd-tip.show{opacity:1;transform:none}

    .ysd-ibtn{display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;padding:0;border:0;border-radius:50%;
      background:none;color:var(--ysd-text2);cursor:pointer;transition:background-color .15s,color .15s}
    .ysd-ibtn:hover{background:var(--ysd-hover);color:var(--ysd-text)}
    .ysd-ibtn.ysd-on{color:var(--ysd-accent)}
    .ysd-ibtn.ysd-danger:hover{color:var(--ysd-red)}
    .ysd-ibtn.ysd-xs{width:28px;height:28px}

    .ysd-pop{position:fixed;z-index:2300;width:340px;max-width:calc(100vw - 16px);overflow-x:hidden;overflow-y:auto;background:var(--ysd-surface);
      border-radius:12px;box-shadow:var(--ysd-shadow);font-size:14px;line-height:20px;animation:ysd-pop-in .14s var(--ysd-ease)}
    .ysd-pop.ysd-menu{width:auto;min-width:240px;max-width:min(340px,calc(100vw - 16px));padding:8px 0}
    .ysd-pop.ysd-moving{transition:left .18s var(--ysd-ease),top .18s var(--ysd-ease)}
    .ysd-pop.ysd-anim-swap>*{animation:ysd-fade .16s var(--ysd-ease)}
    .ysd-pop.ysd-anim-fwd>*{animation:ysd-slide-l .16s var(--ysd-ease)}
    .ysd-pop.ysd-anim-back>*{animation:ysd-slide-r .16s var(--ysd-ease)}
    @keyframes ysd-pop-in{from{opacity:0;transform:translateY(-4px) scale(.98)}}
    @keyframes ysd-fade{from{opacity:0}}
    /* Closing: the way they came in, reversed and a little quicker (see leave()). */
    @keyframes ysd-out{to{opacity:0;transform:translateY(-4px) scale(.98)}}
    @keyframes ysd-fade-out{to{opacity:0}}
    .ysd-pop.ysd-leave,.ysd-dd.ysd-leave,#ysd-panel.ysd-leave{animation:ysd-out .14s var(--ysd-ease) forwards;pointer-events:none}
    .ysd-viewer.ysd-leave{animation:ysd-fade-out .14s var(--ysd-ease) forwards;pointer-events:none}
    @keyframes ysd-slide-l{from{opacity:0;transform:translateX(14px)}}
    @keyframes ysd-slide-r{from{opacity:0;transform:translateX(-14px)}}
    .ysd-pop-head{display:flex;align-items:center;gap:4px;padding:10px 6px 2px 16px}
    .ysd-pop-title{flex:1;min-width:0;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500}
    .ysd-pop-title svg{color:var(--ysd-text2)}
    .ysd-pop-body{display:flex;flex-direction:column;gap:14px;padding:10px 16px 16px}
    .ysd-label{margin-bottom:6px;color:var(--ysd-text2);font-size:12px;line-height:16px;font-weight:500}
    .ysd-msg{display:flex;align-items:center;gap:10px;padding:6px 0;color:var(--ysd-text2);font-size:13px;line-height:18px}
    .ysd-msg.ysd-err{align-items:flex-start;color:var(--ysd-text)}
    .ysd-msg.ysd-err svg{color:var(--ysd-red)}
    .ysd-note{display:flex;align-items:flex-start;gap:6px;color:var(--ysd-text2);font-size:12px;line-height:16px}
    .ysd-note svg{margin-top:1px}

    .ysd-select{display:flex;align-items:center;gap:8px;width:100%;min-height:40px;padding:0 10px 0 12px;border:1px solid var(--ysd-border);
      border-radius:8px;background:var(--ysd-field);color:var(--ysd-text);font-size:14px;text-align:left;cursor:pointer;transition:border-color .15s}
    .ysd-select:hover,.ysd-select.ysd-open{border-color:var(--ysd-text2)}
    .ysd-select .ysd-opt{flex:1}
    .ysd-select>svg{color:var(--ysd-text2);transition:transform .18s var(--ysd-ease)}
    .ysd-select.ysd-open>svg{transform:rotate(180deg)}
    .ysd-opt{display:flex;align-items:center;gap:8px;min-width:0}
    .ysd-opt-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ysd-opt-hint{color:var(--ysd-text2);font-size:12px;white-space:nowrap}
    .ysd-opt-right{margin-left:auto;padding-left:12px;color:var(--ysd-text2);font-size:12px;white-space:nowrap}
    .ysd-opt>svg{color:var(--ysd-accent)}
    .ysd-badge{margin-left:-4px;color:#ff0033;font-size:9px;font-weight:700;line-height:1;align-self:flex-start;padding-top:9px}
    .ysd-dd{position:fixed;z-index:2350;min-width:200px;overflow-y:auto;padding:6px 0;background:var(--ysd-raised);border-radius:10px;
      box-shadow:var(--ysd-shadow);border:1px solid var(--ysd-divider);animation:ysd-pop-in .12s var(--ysd-ease)}
    .ysd-dd-item{display:flex;align-items:center;gap:8px;width:100%;min-height:36px;padding:6px 12px;border:0;background:none;color:var(--ysd-text);
      font-size:14px;text-align:left;cursor:pointer}
    .ysd-dd-item .ysd-opt-label{white-space:normal}
    .ysd-dd-item:hover,.ysd-dd-item:focus-visible{background:var(--ysd-hover);outline:none}
    .ysd-dd-item:disabled{opacity:.4;cursor:default;background:none}
    .ysd-dd-item .ysd-opt{flex:1}
    .ysd-dd-item>.ysd-check{display:flex;width:18px;flex:none;color:var(--ysd-accent)}

    .ysd-seg{display:grid;grid-template-columns:repeat(auto-fit,minmax(64px,1fr));padding:3px;border-radius:8px;background:var(--ysd-field);border:1px solid var(--ysd-border)}
    .ysd-seg button{min-height:30px;padding:0 6px;border:0;border-radius:6px;background:none;color:var(--ysd-text2);font-size:13px;font-weight:500;cursor:pointer;
      transition:background-color .15s,color .15s}
    .ysd-seg button:hover{color:var(--ysd-text)}
    .ysd-seg button.ysd-sel{background:var(--ysd-raised);color:var(--ysd-text);box-shadow:0 1px 3px rgba(0,0,0,.2)}

    .ysd-trim{display:flex;flex-direction:column;gap:10px}
    .ysd-trim.ysd-disabled .ysd-range,.ysd-trim.ysd-disabled .ysd-range-ends,.ysd-trim.ysd-disabled .ysd-times{opacity:.4;pointer-events:none}
    .ysd-trim-top{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px}
    .ysd-trim-top .ysd-label{margin:0;display:flex;align-items:center;gap:6px}
    .ysd-trim-sum{flex:1;text-align:right;color:var(--ysd-text2);font-size:12px;white-space:nowrap}
    .ysd-trim-sum b{color:var(--ysd-text);font-weight:500}
    .ysd-mini{padding:0;border:0;background:none;color:var(--ysd-accent);font-size:12px;font-weight:500;cursor:pointer}
    .ysd-mini:hover{text-decoration:underline}
    .ysd-mini[hidden]{display:none}
    .ysd-range{position:relative;height:24px;margin:0 8px}
    .ysd-range-track,.ysd-range-fill{position:absolute;top:10px;height:4px;border-radius:2px}
    .ysd-range-track{left:0;right:0;background:var(--ysd-track)}
    .ysd-range-fill{background:var(--ysd-accent)}
    .ysd-range input{position:absolute;left:-8px;top:0;width:calc(100% + 16px);height:24px;margin:0;background:none;pointer-events:none;-webkit-appearance:none;appearance:none}
    .ysd-range input::-webkit-slider-runnable-track{background:none;height:24px}
    .ysd-range input::-moz-range-track{background:none}
    .ysd-range input::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:16px;height:16px;margin-top:4px;border-radius:50%;
      background:#fff;border:2px solid var(--ysd-accent);box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:grab;transition:transform .12s}
    .ysd-range input::-moz-range-thumb{pointer-events:auto;width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid var(--ysd-accent);cursor:grab}
    .ysd-range input:active::-webkit-slider-thumb{cursor:grabbing;transform:scale(1.15)}
    .ysd-range input:focus-visible::-webkit-slider-thumb{outline:2px solid var(--ysd-accent);outline-offset:2px}
    .ysd-range-ends{display:flex;justify-content:space-between;margin-top:-6px;color:var(--ysd-text2);font-size:11px;font-variant-numeric:tabular-nums}
    .ysd-times{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px}
    .ysd-time .ysd-label{margin-bottom:4px}
    .ysd-time-box{display:flex;align-items:center;height:36px;padding:0 2px 0 10px;border:1px solid var(--ysd-border);border-radius:8px;background:var(--ysd-field);transition:border-color .15s}
    .ysd-time-box:focus-within{border-color:var(--ysd-accent)}
    .ysd-time-box input{flex:1;width:100%;min-width:0;border:0;outline:0;background:none;color:var(--ysd-text);font:500 14px/1 Roboto,Arial,sans-serif;font-variant-numeric:tabular-nums}
    .ysd-switch-row{display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;user-select:none}
    .ysd-switch{position:relative;width:34px;height:20px;flex:none}
    .ysd-switch input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}
    .ysd-switch i,.ysd-mswitch{position:absolute;inset:0;border-radius:10px;background:var(--ysd-track);transition:background .18s var(--ysd-ease)}
    .ysd-switch i::after,.ysd-mswitch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;
      box-shadow:0 1px 2px rgba(0,0,0,.3);transition:transform .18s var(--ysd-ease)}
    .ysd-switch input:checked+i,.ysd-mswitch.ysd-on{background:var(--ysd-accent)}
    .ysd-switch input:checked+i::after,.ysd-mswitch.ysd-on::after{transform:translateX(14px)}
    .ysd-switch input:focus-visible+i{outline:2px solid var(--ysd-accent);outline-offset:2px}

    .ysd-pop-foot{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;padding-top:2px}
    .ysd-pop-sum{flex:1 1 120px;min-width:0;color:var(--ysd-text2);font-size:12px;line-height:16px}
    .ysd-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:36px;margin-left:auto;padding:0 16px;border:0;border-radius:18px;
      background:var(--ysd-accent);color:var(--ysd-on-accent);font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap;
      transition:filter .15s,transform .1s}
    .ysd-primary:hover{filter:brightness(1.08)}
    .ysd-primary:active{transform:scale(.97)}
    .ysd-primary:disabled{opacity:.6;cursor:default;filter:none;transform:none}
    .ysd-secondary{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 12px;border:1px solid var(--ysd-border);border-radius:16px;
      background:none;color:var(--ysd-text);font-size:13px;cursor:pointer;align-self:flex-start}
    .ysd-secondary:hover{background:var(--ysd-hover)}
    .ysd-thumb{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;background:var(--ysd-field)}
    .ysd-thumb.ysd-tall{width:auto;height:240px;aspect-ratio:9/16;margin:0 auto}
    .ysd-spin{width:16px;height:16px;flex:none;border:2px solid var(--ysd-track);border-top-color:var(--ysd-accent);border-radius:50%;animation:ysd-rot .8s linear infinite}
    @keyframes ysd-rot{to{transform:rotate(360deg)}}
    .ysd-folder-cur{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--ysd-border);border-radius:12px;background:var(--ysd-field)}
    .ysd-folder-ico{display:flex;align-items:center;justify-content:center;flex:none;width:40px;height:40px;border-radius:10px;
      color:var(--ysd-accent);background:color-mix(in srgb,var(--ysd-accent) 14%,transparent)}
    .ysd-folder-cur.ysd-bad .ysd-folder-ico{color:var(--ysd-amber);background:color-mix(in srgb,var(--ysd-amber) 16%,transparent)}
    .ysd-folder-cur>div{flex:1;min-width:0}
    .ysd-folder-cur .ysd-label{margin:0 0 2px}
    .ysd-folder-cur b{display:block;font-size:15px;line-height:20px;font-weight:500;overflow-wrap:anywhere}
    .ysd-folder-note{padding:0 2px}
    .ysd-folder-note p{margin:0}
    .ysd-folder-note p+p{margin-top:6px}
    .ysd-actions{display:flex;flex-direction:column;gap:8px}
    .ysd-actions>button{align-self:stretch;width:100%;height:36px;min-height:36px;margin:0;padding:0 16px;justify-content:center;gap:8px;
      border-radius:18px;font-size:14px;font-weight:500}
    .ysd-actions>button>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ysd-actions>.ysd-secondary svg{color:var(--ysd-text2)}

    .ysd-mhead{display:flex;align-items:center;gap:4px;padding:6px 16px;color:var(--ysd-text2);font-size:12px;line-height:16px;font-weight:500}
    .ysd-mhead.ysd-back{padding:0 16px 4px 6px;color:var(--ysd-text);font-size:14px}
    .ysd-mitem{display:flex;align-items:center;gap:12px;width:100%;min-height:36px;padding:6px 16px;border:0;background:none;color:var(--ysd-text);
      font-size:14px;line-height:20px;text-align:left;cursor:pointer}
    .ysd-mitem:hover,.ysd-mitem:focus-visible{background:var(--ysd-hover);outline:none}
    .ysd-mitem:disabled{opacity:.45;cursor:default;background:none}
    .ysd-mitem>.ysd-mlead{display:flex;width:20px;flex:none;color:var(--ysd-text2)}
    .ysd-mitem>.ysd-mlabel{flex:1;min-width:0}
    .ysd-mitem .ysd-opt-hint{max-width:45%;overflow:hidden;text-overflow:ellipsis}
    .ysd-mswitch{position:relative;inset:auto;display:block;width:34px;height:20px;flex:none}
    .ysd-msep{height:1px;margin:8px 0;background:var(--ysd-divider)}
    .ysd-mtext{padding:6px 16px;color:var(--ysd-text2);font-size:13px;line-height:18px}

    /* History: a button in YouTube's top bar, next to its own; a ring shows download progress. */
    #ysd-hist{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:40px;height:40px;margin:0 8px 0 0;padding:0;
      border:0;border-radius:50%;background:transparent;color:var(--ysd-text);cursor:pointer;transition:background-color .15s,color .15s}
    #ysd-hist:hover{background:var(--ysd-hover)}
    #ysd-hist:active{background:var(--ysd-active)}
    #ysd-hist.ysd-on{color:var(--ysd-accent);background:var(--ysd-hover)}
    #ysd-hist[hidden]{display:none}
    #ysd-hist .ysd-hist-ring{position:absolute;inset:0;width:40px;height:40px;transform:rotate(-90deg);pointer-events:none}
    #ysd-hist .ysd-hist-ring circle{fill:none;stroke-width:2.5}
    #ysd-hist .ysd-hist-track{stroke:currentColor;opacity:.14}
    #ysd-hist .ysd-hist-arc{stroke:var(--ysd-accent);stroke-linecap:round;transition:stroke-dashoffset .6s linear,stroke .3s}
    #ysd-hist.ysd-idle .ysd-hist-ring{display:none}
    #ysd-hist.ysd-paused .ysd-hist-arc{stroke:var(--ysd-amber)}
    #ysd-hist.ysd-failed .ysd-hist-arc{stroke:var(--ysd-red)}
    #ysd-hist.ysd-flash-done .ysd-hist-ring,#ysd-hist.ysd-flash-failed .ysd-hist-ring{display:block}
    #ysd-hist.ysd-flash-done .ysd-hist-arc{stroke:var(--ysd-green);stroke-dashoffset:0!important}
    #ysd-hist.ysd-flash-failed .ysd-hist-arc{stroke:var(--ysd-red);stroke-dashoffset:0!important}
    /* Starting the app for a download: a short arc turns. */
    #ysd-hist.ysd-starting .ysd-hist-ring{display:block;animation:ysd-hist-spin 1s linear infinite}
    #ysd-hist.ysd-starting .ysd-hist-arc{stroke-dashoffset:84.8!important;transition:none}
    @keyframes ysd-hist-spin{from{transform:rotate(-90deg)}to{transform:rotate(270deg)}}
    /* Everything finished: a check mark takes the clock's place for a moment. */
    #ysd-hist .ysd-hist-ico,#ysd-hist .ysd-hist-check{transition:opacity .2s var(--ysd-ease),transform .2s var(--ysd-ease)}
    #ysd-hist .ysd-hist-check{position:absolute;color:var(--ysd-green);opacity:0;transform:scale(.5);pointer-events:none}
    #ysd-hist.ysd-flash-done .ysd-hist-check{opacity:1;transform:none}
    #ysd-hist.ysd-flash-done .ysd-hist-ico{opacity:0;transform:scale(.5)}
    /* Results not seen yet: a dot until the panel is opened (red after a failure). */
    #ysd-hist .ysd-hist-dot{position:absolute;top:5px;right:5px;width:8px;height:8px;border-radius:50%;background:var(--ysd-accent);
      box-shadow:0 0 0 2px var(--yt-spec-base-background,var(--ysd-surface));pointer-events:none}
    #ysd-hist .ysd-hist-dot.ysd-dot-red{background:var(--ysd-red)}
    #ysd-hist .ysd-hist-dot[hidden]{display:none}
    /* Small and out at the corner, so it covers as little of the ring as possible. */
    #ysd-hist .ysd-count{top:-7px;right:-9px;min-width:16px;height:16px;padding:0 4px;border-radius:8px;font-size:10px;line-height:16px;
      box-shadow:0 0 0 2px var(--yt-spec-base-background,var(--ysd-surface))}
    .ysd-count{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--ysd-accent);
      color:var(--ysd-on-accent);font-size:11px;font-weight:500;line-height:18px;text-align:center}
    .ysd-count[hidden]{display:none}

    /* The history panel opens under its button in the top bar and grows downwards with its list. */
    #ysd-panel{position:fixed;left:auto;top:64px;z-index:2200;display:flex;flex-direction:column;width:min(400px,calc(100vw - 16px));
      max-height:min(440px,calc(100vh - 110px));background:var(--ysd-surface);border-radius:12px;box-shadow:var(--ysd-shadow);overflow:hidden;
      transform-origin:top right;animation:ysd-panel-in .18s var(--ysd-ease)}
    @keyframes ysd-panel-in{from{opacity:0;transform:translateY(-8px) scale(.97)}}
    #ysd-panel[hidden]{display:none}
    .ysd-phead{display:flex;align-items:center;gap:6px;flex:none;padding:8px 6px 8px 16px;border-bottom:1px solid var(--ysd-divider)}
    /* A message the ring can't carry (why a download couldn't start, "Download again"), above the list. */
    .ysd-pnote{display:flex;align-items:center;gap:10px;flex:none;padding:6px 6px 6px 16px;border-bottom:1px solid var(--ysd-divider);
      background:color-mix(in srgb,var(--c,var(--ysd-red)) 10%,transparent);color:var(--ysd-text);font-size:13px;line-height:18px}
    .ysd-pnote[hidden]{display:none}
    .ysd-pnote>svg{flex:none;color:var(--c,var(--ysd-red))}
    .ysd-pnote>span{flex:1;min-width:0;padding:4px 0;overflow-wrap:anywhere}
    .ysd-ptitle{flex:1;min-width:0;display:flex;align-items:baseline;gap:8px;font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden}
    .ysd-ptitle small{min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--ysd-text2);font-size:12px;font-weight:400}
    .ysd-textbtn{flex:none;max-width:40%;height:30px;padding:0 10px;border:0;border-radius:15px;background:none;color:var(--ysd-text2);font-size:13px;font-weight:500;
      cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:opacity .15s,background-color .15s}
    .ysd-textbtn:hover{background:var(--ysd-hover);color:var(--ysd-text)}
    .ysd-textbtn.ysd-invisible{visibility:hidden;opacity:0}
    .ysd-plist-wrap{display:flex;flex-direction:column;flex:0 1 auto;min-height:0} /* as tall as the list, up to the panel's limit */
    .ysd-plist{flex:0 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain}
    .ysd-row{display:grid;grid-template-rows:1fr;transition:grid-template-rows .24s var(--ysd-ease),opacity .2s var(--ysd-ease)}
    .ysd-row>div{min-height:0;overflow:hidden}
    .ysd-row.ysd-enter,.ysd-row.ysd-leave{grid-template-rows:0fr;opacity:0}
    .ysd-row.ysd-leave{pointer-events:none}
    .ysd-row+.ysd-row .ysd-item{box-shadow:inset 0 1px var(--ysd-divider)} /* a border would add a pixel that vanishes with the row above */
    .ysd-item{display:flex;gap:8px;padding:12px 6px 12px 16px}
    .ysd-item-main{flex:1;min-width:0}
    .ysd-item-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--ysd-text);font-size:14px;line-height:20px;
      font-weight:500;text-decoration:none;word-break:break-word}
    .ysd-item-title:hover{text-decoration:underline}
    .ysd-item-meta{display:flex;align-items:center;flex-wrap:wrap;gap:2px 10px;margin-top:4px;font-size:12px;line-height:18px;color:var(--ysd-text2)}
    .ysd-item-meta b{color:var(--ysd-text);font-weight:500}
    .ysd-item-author{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ysd-clip{display:inline-flex;align-items:center;gap:3px}
    .ysd-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:10px;font-size:11px;font-weight:500;white-space:nowrap;
      color:var(--c,var(--ysd-text2));background:color-mix(in srgb,var(--c,var(--ysd-text2)) 14%,transparent);transition:color .2s,background-color .2s}
    .ysd-c-accent{--c:var(--ysd-accent)}.ysd-c-green{--c:var(--ysd-green)}.ysd-c-red{--c:var(--ysd-red)}.ysd-c-amber{--c:var(--ysd-amber)}
    .ysd-item-sub{margin-top:4px;color:var(--ysd-text2);font-size:12px;line-height:16px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
    .ysd-item-sub.ysd-notice{color:var(--ysd-amber)}
    .ysd-item.ysd-st-failed .ysd-item-sub{color:var(--ysd-text)}
    .ysd-bar{position:relative;height:3px;margin-top:8px;border-radius:2px;background:var(--ysd-track);overflow:hidden}
    .ysd-bar i{position:absolute;inset:0 auto 0 0;width:0;border-radius:2px;background:var(--ysd-accent);transition:width .3s}
    .ysd-item.ysd-st-paused .ysd-bar i{background:var(--ysd-amber)}
    .ysd-bar.ysd-indet i{width:35%!important;animation:ysd-indet 1.1s ease-in-out infinite}
    @keyframes ysd-indet{from{left:-35%}to{left:100%}}
    .ysd-item-actions{display:flex;align-items:flex-start;flex-wrap:wrap;justify-content:flex-end;max-width:72px;padding-top:2px}
    .ysd-pempty{display:grid;grid-template-rows:1fr;flex:none;color:var(--ysd-text2);font-size:13px;line-height:18px;
      transition:grid-template-rows .24s var(--ysd-ease),opacity .2s var(--ysd-ease)}
    .ysd-pempty>div{min-height:0;overflow:hidden}
    .ysd-pempty.ysd-hide{grid-template-rows:0fr;opacity:0;pointer-events:none}
    .ysd-pempty-in{display:flex;align-items:center;gap:12px;padding:14px 16px}
    .ysd-pempty-in svg{flex:none;opacity:.5}
    .ysd-pempty-in b{display:block;color:var(--ysd-text);font-weight:500}
    .ysd-pfoot{display:flex;align-items:center;gap:8px;flex:none;min-height:44px;padding:6px 8px 6px 16px;border-top:1px solid var(--ysd-divider);font-size:12px;color:var(--ysd-text2)}
    .ysd-pfoot>span{flex:1;min-width:0;display:flex;align-items:center;gap:6px;overflow:hidden;white-space:nowrap}
    .ysd-pfoot b{min-width:0;color:var(--ysd-text);font-weight:500;overflow:hidden;text-overflow:ellipsis}
    .ysd-pfoot .ysd-chip{flex:none}
    .ysd-link{flex:none;padding:4px 6px;border:0;border-radius:6px;background:none;color:var(--ysd-accent);font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap}
    .ysd-link:hover{background:var(--ysd-hover)}

    .ysd-toast{position:fixed;left:16px;bottom:20px;z-index:2500;display:flex;align-items:center;gap:8px;max-width:min(520px,calc(100vw - 32px));
      padding:8px 8px 8px 16px;border-radius:8px;background:var(--ysd-toast-bg);color:var(--ysd-toast-fg);font-size:14px;line-height:20px;
      box-shadow:var(--ysd-shadow);opacity:0;transform:translateY(8px);transition:opacity .18s var(--ysd-ease),transform .18s var(--ysd-ease);pointer-events:none}
    .ysd-toast.show{opacity:1;transform:none;pointer-events:auto}
    .ysd-toast-msg{min-width:0;padding:4px 8px 4px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
    .ysd-toast button{flex:none;min-height:32px;padding:0 10px;border:0;border-radius:16px;background:none;color:var(--ysd-toast-act);font-size:14px;font-weight:500;cursor:pointer}
    .ysd-toast button:hover{background:rgba(128,128,128,.18)}

    .ysd-viewer{position:fixed;inset:0;z-index:2450;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.8);animation:ysd-fade .15s}
    .ysd-vbox{display:flex;flex-direction:column;width:min(960px,94vw);max-height:92vh;background:var(--ysd-surface);border-radius:12px;overflow:hidden}
    .ysd-vhead{display:flex;align-items:center;gap:12px;padding:6px 6px 6px 16px;font-size:14px;font-weight:500}
    .ysd-vhead span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ysd-vbox video,.ysd-vbox img{display:block;width:100%;max-height:calc(92vh - 48px);object-fit:contain;background:#000}
    .ysd-vbox audio{width:calc(100% - 32px);margin:12px 16px 20px}
    .ysd-vbox pre{margin:0;padding:12px 16px;max-height:70vh;overflow:auto;font:13px/1.5 ui-monospace,Consolas,monospace;white-space:pre-wrap}

    /* Big Picture: once the player scrolls out of view it docks in the corner (YouTube's own player
       container moves; its space stays reserved). */
    html.ysd-docked:not(.ysd-fs) #player-container{position:fixed!important;left:auto!important;top:auto!important;right:16px!important;bottom:16px!important;
      width:var(--ysd-dock-w)!important;height:calc(var(--ysd-dock-w) * 9 / 16)!important;z-index:2140!important;border-radius:12px;overflow:hidden;
      box-shadow:0 12px 40px rgba(0,0,0,.45)}
    #ysd-dockbar{position:fixed;right:16px;bottom:calc(24px + var(--ysd-dock-w) * 9 / 16);z-index:2141;display:flex;gap:2px;padding:3px;border-radius:18px;
      background:var(--ysd-surface);box-shadow:var(--ysd-shadow);opacity:0;visibility:hidden;transform:translateY(6px);
      transition:opacity .2s var(--ysd-ease),transform .2s var(--ysd-ease),visibility 0s linear .2s}
    html.ysd-docked #ysd-dockbar{opacity:1;visibility:visible;transform:none;transition:opacity .2s var(--ysd-ease),transform .2s var(--ysd-ease)}
    /* The player while its video plays in picture-in-picture: covers the browser's own note (which follows
       the browser's language) with ours, and the way back. Under YouTube's controls, which keep working.
       Solid from the first frame (black, and the video's last frame on top), so the browser's note never
       shows; the background and text fade in over that frame, so the video seems to fade into it. */
    #ysd-pipcover{position:absolute;inset:0;z-index:37;container-type:size;background:#000;color:#fff;text-align:center;
      font:14px/20px Roboto,Arial,sans-serif;cursor:default}
    #ysd-pipcover>*{position:absolute;inset:0;width:100%;height:100%}
    #ysd-pipcover>.ysd-pip-frame{object-fit:contain}
    #ysd-pipcover>.ysd-pip-bg{background:radial-gradient(circle at center,#212121,#000 75%);animation:ysd-fade .3s var(--ysd-ease)}
    /* Sized by the player it covers (the full page, Shorts, the mini player): the text gets smaller, then the
       hint, the icon and the heading make way, the way back always stays. */
    #ysd-pipcover>.ysd-pip-body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(6px,2.2cqh,12px);
      padding:clamp(10px,6cqh,40px) clamp(12px,7cqw,40px);padding-right:max(clamp(12px,7cqw,40px),var(--ysd-pip-right,0px));
      animation:ysd-fade .3s var(--ysd-ease)}
    /* Shorts: YouTube's buttons stay on top of the player and its title and channel at the bottom; the note sits between them. */
    #shorts-player>#ysd-pipcover>.ysd-pip-body{padding-top:clamp(10px,11cqh,84px);padding-bottom:clamp(10px,16cqh,128px)}
    /* A video's own player: its control bar (and ad notes) at the bottom. */
    #movie_player>#ysd-pipcover>.ysd-pip-body{padding-bottom:clamp(10px,18cqh,72px)}
    /* Back in the page: our note fades out over the (drawn) live video. */
    #ysd-pipcover.ysd-out>:not(.ysd-pip-frame){animation:ysd-fade-out .28s var(--ysd-ease) forwards}
    .ysd-pip-body>svg{width:clamp(28px,8cqmin,44px);height:clamp(28px,8cqmin,44px);opacity:.8}
    .ysd-pip-body>b{max-width:min(520px,100%);font-size:clamp(15px,4.4cqw,20px);line-height:1.3;font-weight:500}
    .ysd-pip-body .ysd-pip-hint{max-width:min(440px,100%);color:rgba(255,255,255,.72);font-size:clamp(12px,3.4cqw,14px);line-height:1.45}
    .ysd-pip-body .ysd-primary{flex:none;max-width:100%;margin:clamp(2px,1cqh,6px) 0 0}
    .ysd-pip-body .ysd-primary span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    @container (max-height:360px){.ysd-pip-body .ysd-pip-hint{display:none}}
    @container (max-height:280px) or (max-width:250px){.ysd-pip-body>svg{display:none}}
    @container (max-height:150px){.ysd-pip-body>b{display:none}}
    @container (max-width:200px){.ysd-pip-body .ysd-primary{padding:0 12px}.ysd-pip-body .ysd-primary span{display:none}}
    /* The way back to the full video, next to YouTube's mini player (placed every frame, see followMini). */
    #ysd-back{position:fixed;left:0;top:0;z-index:2141;display:flex;align-items:center;gap:6px;height:36px;padding:0 14px 0 10px;border:0;
      border-radius:18px;background:var(--ysd-surface);color:var(--ysd-text);box-shadow:var(--ysd-shadow);font:500 14px Roboto,Arial,sans-serif;
      white-space:nowrap;cursor:pointer;will-change:transform;animation:ysd-fade .22s var(--ysd-ease)}
    #ysd-back:hover{background:var(--ysd-surface2,var(--ysd-surface));color:var(--ysd-accent)}
    #ysd-back[hidden]{display:none}

    /* Fullscreen video: only the player. Everything of ours is removed from rendering. */
    html.ysd-fs #ysd-bar,html.ysd-fs #ysd-hist,html.ysd-fs #ysd-panel,html.ysd-fs .ysd-toast,html.ysd-fs .ysd-pop,html.ysd-fs .ysd-dd,
    html.ysd-fs .ysd-tip,html.ysd-fs #ysd-back,html.ysd-fs #ysd-dockbar{display:none!important}

    @media (max-width:420px){.ysd-select .ysd-opt-hint{display:none}}
    @media (max-width:520px){
      .ysd-toast{left:12px;bottom:12px;max-width:calc(100vw - 24px)}
      html.ysd-docked:not(.ysd-fs) #player-container{right:12px!important;bottom:12px!important}
    }
    @media (prefers-reduced-motion:reduce){
      .ysd-ui,.ysd-ui *,.ysd-tip,#ysd-back,#ysd-dockbar,html.ysd-docked #player-container{animation:none!important;transition:none!important}
    }
  `);

  // ---------- download folder ----------
  let history = GM_getValue('history', []);
  const saveHistory = () => GM_setValue('history', history);
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
  if (typeof GM_addValueChangeListener === 'function') {
    GM_addValueChangeListener('history', (_n, _o, value, remote) => { if (remote) { history = value || []; renderPanel(); } });
    GM_addValueChangeListener('folderRev', (_n, _o, _v, remote) => { if (remote) reloadFolder(); });
  }

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
  const pickerHost = typeof pageWin.showDirectoryPicker === 'function' ? pageWin : typeof window.showDirectoryPicker === 'function' ? window : null;
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
    GM_setValue('folderRev', Date.now()); // other tabs pick up the same folder
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
    GM_setValue('folderRev', Date.now());
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
    if ((info.viaApp || opt.appOnly) && !dmOn()) { noteNoApp(); return null; }
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
    if (opt.appOnly) { noteNoApp(); return null; } // a quality only the app can get (see addAppQualities)
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
    port: GM_getValue('dmPort', 17724),
    token: GM_getValue('dmToken', ''),
    state: 'unknown', // unknown | absent | offline | unpaired | ready
    status: GM_getValue('dmStatus', null),
    jobs: GM_getValue('dmJobs', []), // last known list, so the history shows while the app is closed
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
    return new Promise((resolve, reject) => GM_xmlhttpRequest({
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
      extensionOnDisk(r.extension);
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
    GM_setValue('dmToken', '');
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
        const handler = (typeof GM_info !== 'undefined' && GM_info?.scriptHandler) || 'userscript';
        const r = await dmReq('POST', '/v1/pair', { client: `${browserName()} (${handler})` }, 130000);
        DM.token = r.token;
        DM.port = r.port || DM.port;
        GM_setValue('dmToken', DM.token);
        GM_setValue('dmPort', DM.port);
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
        GM_setValue('dmToken', DM.token);
        GM_setValue('dmPort', DM.port);
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
      GM_setValue('dmJobs', DM.jobs.slice(0, 150));
      GM_setValue('dmStatus', DM.status);
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
    const video = (r.video || []).map((v) => appVideoOpt(v));
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
        noteNoApp(opt.appOnly || info.viaApp ? null : { label: t('dmBrowserInstead'), run: () => startBrowserOption(opt, info, o) });
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
        GM_setValue('dmStatus', DM.status);
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
    // The highest quality, or the one picked before (the next lower one where a video doesn't have it).
    const want = +String(settings.videoKey || '').slice(1) || Infinity;
    const opt = info.video.find((o) => o.height <= want) || info.video[info.video.length - 1];
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
    registerMenu();
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
    const detail = pageWin.JSON.parse(JSON.stringify({
      actionName: `yt-signal-action-toggle-dark-theme-${sig}`, optionalAction: false,
      args: [{ signalAction: { signal: `TOGGLE_DARK_THEME_${sig.toUpperCase()}` } }], returnValue: [],
    }));
    pageWin.document.querySelector('ytd-app')?.dispatchEvent(new pageWin.CustomEvent('yt-action', { bubbles: true, composed: true, detail }));
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
    return Promise.resolve(null);
  }

  // The YT Download Manager app (when it runs) takes over drags on Chrome's own border of the window, so it
  // follows the pointer in the video's shape there as well; it is told the window's shape and limits.
  function pipNative(info) {
    return Promise.resolve(null);
  }

  // The version of the browser extension the app keeps next to itself: the extension build reloads itself
  // when that copy is newer. Nothing to do for the userscript (its manager updates it).
  function extensionOnDisk(version) {}

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
    const detail = pageWin.JSON.parse(JSON.stringify({ endpoint: {
      commandMetadata: { webCommandMetadata: { url: `/shorts/${vid}`, webPageType: 'WEB_PAGE_TYPE_SHORTS', rootVe: 37414 } },
      reelWatchEndpoint: { videoId: vid },
    } }));
    pageWin.document.querySelector('ytd-app')?.dispatchEvent(new pageWin.CustomEvent('yt-navigate', { bubbles: true, composed: true, detail }));
  }
  // YouTube takes the buttons away again for every Short: on Shorts pages that becomes ours.
  let mediaKeysHooked = false;
  function shortsMediaKeys() {
    const ms = pageWin.navigator.mediaSession;
    if (!ms?.setActionHandler) return;
    const toPage = (fn) => (typeof exportFunction === 'function' ? exportFunction(fn, pageWin) : fn);
    const ours = { nexttrack: toPage(() => shortsStep(1)), previoustrack: toPage(() => shortsStep(-1)) };
    const set = ms.setActionHandler.bind(ms);
    if (!mediaKeysHooked) {
      mediaKeysHooked = true;
      ms.setActionHandler = toPage((action, handler) => set(action, !handler && ours[action] && onShorts() ? ours[action] : handler));
    }
    for (const [action, fn] of Object.entries(ours)) {
      try { set(action, fn); } catch { /* not supported here */ }
    }
  }

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
      GM_setValue('dmJobs', DM.jobs);
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
      if (!info.viaApp && !info.appList && dmOn()) info.appList = addAppQualities(vid, info); // once per lookup
    } catch (e) {
      console.debug('[YSD] could not load formats', e);
      if (state.vid === vid) state.err = errInfo(e, 'errFormats');
    }
    if (state.vid === vid) {
      state.loading = false;
      if (pop.el && ![settingsMenu, helpMenu, viewMenu, folderPop].includes(pop.build)) renderPopover();
    }
  }

  // YouTube gives the browser's requests fewer formats than the app gets: often nothing above 1080p, no
  // VP9 and no HDR, so 1440p, 4K and 8K would be missing. With the app connected, its list (what it
  // will download, highest first) replaces the browser's as soon as it arrives.
  async function addAppQualities(vid, info) {
    let r;
    try {
      r = await dmReq('GET', `/v1/info?v=${encodeURIComponent(vid)}&auth=0`, null, 120000);
    } catch (e) {
      console.debug('[YSD] the app has no quality list for this video', e);
      return;
    }
    const list = (r?.video || []).filter((v) => +v.height > 0).sort((a, b) => b.height - a.height);
    if (!list.length || !dmOn()) return;
    const own = new Map(info.video.map((o) => [o.height, o]));
    info.video = list.map((v) => appVideoOpt(v, own.get(v.height)));
    if (state.info === info && pop.el && ![settingsMenu, helpMenu, viewMenu, folderPop].includes(pop.build)) renderPopover();
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

  // Tampermonkey menu entries, re-registered when the language changes. The manager draws its own
  // gear in front of every entry and has no icon option, so each label starts with its own symbol.
  let menuIds = [];
  const MENU_ICON = { toolbar: String.fromCodePoint(0x1F9F0), history: String.fromCodePoint(0x1F552) };
  function registerMenu() {
    if (typeof GM_unregisterMenuCommand === 'function') for (const id of menuIds) GM_unregisterMenuCommand(id);
    else if (menuIds.length) return;
    menuIds = [
      GM_registerMenuCommand(`${MENU_ICON.toolbar} ${t('menuShowToolbar')}`, () => { settings.barHidden = false; saveSettings(); mount(); }),
      GM_registerMenuCommand(`${MENU_ICON.history} ${t('menuOpenHistory')}`, () => openPanel()),
    ];
  }
  registerMenu();
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
