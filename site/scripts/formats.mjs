// Turns yt-dlp's answer for a video (yt-dlp -J <url>) into the lists the toolbar shows for it when the Windows
// app is running, so the demos on the page offer exactly what the real pickers would. It follows the app's
// Media.Summary (manager/YTDownloadManager/Downloads/Media.cs) and the extension's appVideoOpt and audio list
// (extension/content/content.js) step by step; if those change, change this too.
//
//   node scripts/formats.mjs <yt-dlp.json> [more.json ...]   -> src/data/videos/<id>.json
//   npm run formats                                          -> all fixtures listed below
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const DEFAULTS = ['../manager/Tests/Fixtures/info/big-buck-bunny.json'];

// ---------- Media.cs: Fmt ----------
const fmt = (f) => {
  const note = f.format_note ?? '';
  const id = f.format_id ?? '';
  return {
    id,
    vcodec: f.vcodec ?? null,
    acodec: f.acodec ?? null,
    protocol: f.protocol ?? null,
    width: f.width | 0,
    height: f.height | 0,
    fps: +f.fps || 0,
    tbr: +f.tbr || 0,
    abr: +f.abr || 0,
    size: f.filesize > 0 ? f.filesize : f.filesize_approx > 0 ? f.filesize_approx : 0,
    drc: !!f.has_drc || note.includes('DRC') || id.endsWith('-drc'),
    hdr: !!f.dynamic_range && f.dynamic_range !== 'SDR',
  };
};
const hasVideo = (f) => !!f.vcodec && f.vcodec !== 'none';
const hasAudio = (f) => !!f.acodec && f.acodec !== 'none';
const short = (f) => (f.width > 0 && f.height > 0 ? Math.min(f.width, f.height) : f.height);
const http = (f) => f.protocol === 'https' || f.protocol === 'http';
const hls = (f) => (f.protocol ?? '').startsWith('m3u8');
const combined = (f) => hasVideo(f) && hasAudio(f) && (http(f) || hls(f)) && short(f) > 0;
const sizeOr = (f, secs) => (f.size > 0 ? f.size : Math.trunc(f.tbr * 125 * Math.max(0, secs)));
const codecName = (f) => (f.vcodec == null ? '' : f.vcodec.startsWith('avc1') ? 'H.264' : f.vcodec.startsWith('av01') ? 'AV1'
  : f.vcodec.startsWith('vp9') || f.vcodec.startsWith('vp09') ? 'VP9' : f.vcodec);
const codecScore = (f) => (f.vcodec == null ? 0 : f.vcodec.startsWith('avc1') ? 3 : f.vcodec.startsWith('av01') ? 2
  : f.vcodec.startsWith('vp9') || f.vcodec.startsWith('vp09') ? 1 : 0);
const audioKbps = (f) => Math.round(f.abr > 0 ? f.abr : !hasVideo(f) && f.tbr > 0 ? f.tbr : 128);

// LINQ's OrderByDescending(...).ThenByDescending(...): a stable sort on several keys, highest first.
const byDesc = (...keys) => (a, b) => {
  for (const k of keys) {
    const d = +k(b) - +k(a);
    if (d) return d;
  }
  return 0;
};

// ---------- Media.cs: the pickers ----------
function pickAudio(fs, prefix) {
  let list = fs.filter((f) => !hasVideo(f) && hasAudio(f) && http(f) && (prefix == null || (f.acodec ?? '').startsWith(prefix)));
  const plain = list.filter((f) => !f.drc);
  if (plain.length) list = plain;
  return list.at(-1) ?? null;
}
function pickVideo(fs, height) {
  const vids = fs.filter((f) => hasVideo(f) && !hasAudio(f) && http(f) && short(f) > 0);
  if (!vids.length) return null;
  let pool = vids.filter((f) => short(f) === height);
  if (!pool.length) {
    const below = vids.filter((f) => short(f) <= height);
    const best = below.length ? Math.max(...below.map(short)) : Math.min(...vids.map(short));
    pool = vids.filter((f) => short(f) === best);
  }
  return [...pool].sort(byDesc((f) => Math.round(f.fps), (f) => f.hdr, codecScore, (f) => f.tbr))[0];
}
function pickCombined(fs, height) {
  const list = fs.filter(combined);
  if (!list.length) return null;
  const below = list.filter((f) => short(f) <= height);
  const h = below.length ? Math.max(...below.map(short)) : Math.min(...list.map(short));
  return list.filter((f) => short(f) === h).sort(byDesc(http, codecScore, (f) => f.tbr))[0];
}
const pickCombinedAudio = (fs) => fs.filter((f) => combined(f) && (f.acodec ?? '').startsWith('mp4a'))
  .sort((a, b) => (short(a) < 360) - (short(b) < 360) || short(a) - short(b) || http(b) - http(a))[0] ?? null;

// ---------- Media.Summary: what the app answers on GET /v1/info ----------
function summary(d) {
  const fs = (d.formats ?? []).map(fmt);
  const secs = +d.duration || 0;
  const sepAudio = pickAudio(fs, 'mp4a') ?? pickAudio(fs, null);
  const best = pickAudio(fs, 'mp4a');
  const opus = pickAudio(fs, 'opus');
  const fromComb = best == null ? pickCombinedAudio(fs) : null;
  const sep = sepAudio == null ? [] : [...new Set(fs.filter((f) => hasVideo(f) && !hasAudio(f) && http(f) && short(f) > 0).map(short))];
  const heights = [...new Set([...sep, ...fs.filter(combined).map(short)])].sort((a, b) => b - a);
  const video = heights.map((h) => {
    const v = sep.includes(h) ? pickVideo(fs, h) : pickCombined(fs, h);
    const size = hasAudio(v) ? sizeOr(v, secs) : sizeOr(v, secs) + sizeOr(sepAudio, secs);
    return { height: h, fps: Math.round(v.fps), codec: codecName(v), hdr: v.hdr, size };
  });
  const aac = best ?? fromComb;
  return {
    vid: d.id, title: d.title, author: d.uploader ?? d.channel ?? '', duration: secs, video,
    aac: aac && { kbps: audioKbps(aac), size: aac === best ? sizeOr(best, secs) : Math.trunc(audioKbps(aac) * 125 * secs) },
    opus: opus && { kbps: audioKbps(opus), size: sizeOr(opus, secs) },
  };
}

// ---------- content.js: the options the pickers list ----------
const qualityBadge = (h) => (h >= 4320 ? '8K' : h >= 2160 ? '4K' : h >= 1440 ? '2K' : h >= 720 ? 'HD' : '');
function options(r) {
  const secs = +r.duration || 0;
  const video = r.video.map((v) => ({
    key: `v${v.height}`, quality: `${v.height}p${v.fps > 30 ? v.fps : ''}`, height: v.height, badge: qualityBadge(v.height),
    codec: `${v.codec || 'MP4'}${v.hdr ? ' HDR' : ''}`, size: Math.max(0, +v.size || 0),
  }));
  const audio = [];
  if (r.aac) {
    for (const k of [320, 192, 128]) audio.push({ key: `mp3-${k}`, format: 'MP3', kbps: k, hint: 'with cover art', size: secs * k * 125, approx: true, trimmable: true });
    audio.push({ key: 'm4a', format: 'M4A', kbps: r.aac.kbps, hint: 'original quality', size: r.aac.size, approx: false, trimmable: true });
  }
  if (r.opus) audio.push({ key: 'opus', format: 'OPUS', kbps: r.opus.kbps, hint: 'original quality', size: r.opus.size, approx: false, trimmable: false });
  if (r.aac) audio.push({ key: 'wav', format: 'WAV', kbps: 0, hint: '', size: Math.round(secs * 44100 * 4), approx: true, trimmable: true });
  return { vid: r.vid, title: r.title, author: r.author, duration: secs, video, audio };
}

const inputs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULTS;
const out = new URL('../src/data/videos/', import.meta.url);
await mkdir(out, { recursive: true });
for (const file of inputs) {
  const d = JSON.parse((await readFile(file, 'utf8')).replace(/^﻿/, ''));
  const o = options(summary(d));
  await writeFile(new URL(`${o.vid}.json`, out), `${JSON.stringify({ source: `yt-dlp -J, read ${d.epoch ? new Date(d.epoch * 1000).toISOString().slice(0, 10) : 'from a test fixture'}`, ...o }, null, 2)}\n`);
  console.log(`${o.vid}: ${o.video.map((v) => `${v.quality}${v.badge ? ` ${v.badge}` : ''}`).join(', ')}`);
}
