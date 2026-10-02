using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace YTDM
{
    sealed class Fmt
    {
        public string Id, Ext, VCodec, ACodec, Protocol, Note, Lang, Url;
        public int Width, Height, Index;
        public double Fps, Tbr, Abr;
        public long Size, AvailableAt;
        public bool Drc;
        public bool Hdr; // HDR10, HLG or Dolby Vision (yt-dlp's dynamic_range)
        public Dictionary<string, string> Headers = new Dictionary<string, string>();

        public bool HasVideo => !string.IsNullOrEmpty(VCodec) && VCodec != "none";

        string Param(string name)
        {
            var m = Regex.Match(Url ?? "", "[?&]" + name + "=([^&]*)");
            return m.Success ? m.Groups[1].Value : "";
        }

        // Identifies the exact file behind a link: a partial download can only be continued from a fresh
        // link that has the same fingerprint (YouTube sometimes re-encodes a stream).
        public string Fp => (Param("itag").Length > 0 ? Param("itag") : Id.Split('-')[0]) + "|" + Param("clen") + "|" + Param("lmt");

        // The exact length in bytes when the link states it (clen); `Size` can be an estimate.
        public long ExactSize => long.TryParse(Param("clen"), NumberStyles.None, CultureInfo.InvariantCulture, out var n) ? n : 0;
        public bool HasAudio => !string.IsNullOrEmpty(ACodec) && ACodec != "none";
        public int Short => Width > 0 && Height > 0 ? Math.Min(Width, Height) : Height;
        public bool Http => Protocol == "https" || Protocol == "http";
        public bool Hls => (Protocol ?? "").StartsWith("m3u8", StringComparison.Ordinal);

        // Video and sound in one stream (YouTube's progressive MP4, the Safari app's HLS streams).
        public bool Combined => HasVideo && HasAudio && (Http || Hls) && Short > 0;

        // Bytes, or an estimate from the bit rate when YouTube doesn't state them (HLS).
        public long SizeOr(double seconds) => Size > 0 ? Size : (long)(Tbr * 125 * Math.Max(0, seconds));

        public long Expires
        {
            get
            {
                var m = Regex.Match(Url ?? "", "[?&]expire=(\\d+)");
                return m.Success ? long.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture) * 1000 : 0;
            }
        }

        public string CodecName => VCodec == null ? "" : VCodec.StartsWith("avc1") ? "H.264" : VCodec.StartsWith("av01") ? "AV1" : VCodec.StartsWith("vp9") || VCodec.StartsWith("vp09") ? "VP9" : VCodec;
        public int CodecScore => VCodec == null ? 0 : VCodec.StartsWith("avc1") ? 3 : VCodec.StartsWith("av01") ? 2 : VCodec.StartsWith("vp9") || VCodec.StartsWith("vp09") ? 1 : 0;
    }

    sealed class Info
    {
        public string Id, Title, Uploader, Path;
        public double Duration;
        public long FetchedAt;
        public int Variant;
        public bool Live;
        public bool Auth; // fetched with the user's YouTube sign-in
        public bool NeedsAccount; // YouTube's own label: only for signed-in, eligible viewers (age, members, private)
        public Diag Diag = new Diag(); // what yt-dlp noticed while asking (only for fresh answers)
        public List<Fmt> Formats = new List<Fmt>();
        public Dictionary<string, object> Subs, Auto;

        // Links are bound to the address that asked for them and expire after about six hours.
        public bool Stale
        {
            get
            {
                if (Time.Now - FetchedAt > 30 * 60 * 1000) return true;
                var exp = Formats.Select(f => f.Expires).Where(x => x > 0).DefaultIfEmpty(0).Min();
                return exp > 0 && exp - Time.Now < 20 * 60 * 1000;
            }
        }
    }

    static class Media
    {
        static readonly object L = new object();
        static readonly Dictionary<string, Info> cache = new Dictionary<string, Info>();
        static readonly Dictionary<string, Task<Info>> inflight = new Dictionary<string, Task<Info>>();

        public static bool ValidId(string vid) => vid != null && Regex.IsMatch(vid, "^[A-Za-z0-9_-]{11}$");

        // Ways of asking YouTube for stream links, tried in turn when fresh links are still refused:
        // yt-dlp's own choice first, then the iPhone app's links (on some connections YouTube serves only
        // the first megabyte of the default links), then the TV app's.
        public static readonly string[] Variants =
        {
            null,
            "youtube:player_client=ios;formats=missing_pot",
            "youtube:player_client=tv;formats=missing_pot",
        };
        // Signed in, YouTube answers each app differently: the web app often gets only its SABR stream
        // (nothing a download can use except one 360p file), the Safari app gets finished HLS streams up
        // to 1080p for signed-in sessions, the TV apps get separate streams (up to 4K) unless the account
        // is in an experiment that gives them DRM or SABR-only answers, and the embedded player plays many
        // age-restricted videos that allow embedding. All three are asked at once (FetchSignedIn); a run
        // takes about as long with one app as with several. None needs anything the account doesn't have.
        public static readonly string[] AuthVariants =
        {
            "youtube:player_client=web_safari",
            "youtube:player_client=tv_downgraded,tv",
            "youtube:player_client=web_embedded,web",
        };

        static string[] Ways(bool auth) => auth ? AuthVariants : Variants;

        static int preferred = -1; // the way that last worked; new videos start with it

        static int Preferred
        {
            get
            {
                if (preferred < 0) preferred = Math.Max(0, Math.Min(Variants.Length - 1, Settings.Current.LinkVariant));
                return preferred;
            }
        }

        public static int NextVariant(int v, bool auth = false) => (v + 1) % Ways(auth).Length;

        public static void Worked(Info i)
        {
            if (i.Auth || Preferred == i.Variant) return;
            Log.Info("links now fetched with variant " + i.Variant);
            preferred = i.Variant;
            Settings.Current.LinkVariant = i.Variant;
            Settings.Current.Save();
        }

        // Video details and stream links. Reused while fresh; `force` asks YouTube again (expired or
        // refused links), `variant` picks how (default: the way that last worked). `auth` asks as the
        // signed-in user (see Session); those answers are kept apart from the anonymous ones.
        public static Task<Info> GetInfo(string vid, bool force, CancellationToken ct, int variant = -1, bool auth = false)
        {
            var key = auth ? vid + "~auth" : vid;
            lock (L)
            {
                if (!force && cache.TryGetValue(key, out var hit) && !hit.Stale) return Task.FromResult(hit);
                if (inflight.TryGetValue(key, out var running)) return running;
                if (!force)
                {
                    var fromDisk = LoadFile(key, auth);
                    if (fromDisk != null && !fromDisk.Stale)
                    {
                        fromDisk.Auth = auth;
                        cache[key] = fromDisk;
                        return Task.FromResult(fromDisk);
                    }
                }
                var ways = Ways(auth);
                var t = variant >= 0 && variant < ways.Length ? Fetch(vid, key, variant, auth, ct)
                    : auth ? FetchSignedIn(vid, key, ct)
                    : Fetch(vid, key, Preferred, false, ct);
                inflight[key] = t;
                t.ContinueWith(_ => { lock (L) inflight.Remove(key); });
                return t;
            }
        }

        // Availability first, then the user's own access: the anonymous answer when there is one; for a
        // video YouTube only shows to eligible signed-in accounts, the signed-in answer. `auth` null
        // means "only if needed". `likely`: the browser was already refused without a sign-in, so both
        // lookups start at once. The signed-in answer is taken as soon as it is in when YouTube marks the
        // video as for signed-in viewers only; otherwise the anonymous one decides (a video that turns out
        // open to everyone is never fetched with the account).
        public static async Task<Info> GetInfoFor(string vid, bool? auth, CancellationToken ct, bool likely = false)
        {
            if (auth == true) return await GetInfo(vid, false, ct, -1, true);
            if (likely && auth == null && Session.Available)
            {
                using (var open = CancellationTokenSource.CreateLinkedTokenSource(ct))
                using (var signedIn = CancellationTokenSource.CreateLinkedTokenSource(ct))
                {
                    var anon = GetInfo(vid, false, open.Token);
                    var withAccount = GetInfo(vid, false, signedIn.Token, -1, true);
                    void Drop(CancellationTokenSource cts, Task t)
                    {
                        cts.Cancel();
                        _ = t.ContinueWith(x => { var _ = x.Exception; }, TaskScheduler.Default);
                    }
                    if (await Task.WhenAny(anon, withAccount) == withAccount && withAccount.Status == TaskStatus.RanToCompletion && withAccount.Result.NeedsAccount)
                    {
                        Log.Info($"info {vid}: only for signed-in viewers, using the signed-in answer");
                        Drop(open, anon);
                        return withAccount.Result;
                    }
                    try
                    {
                        var info = await anon;
                        Drop(signedIn, withAccount);
                        return info;
                    }
                    catch (Fail f) when (Session.Helps.Contains(f.Key))
                    {
                        Log.Info($"info {vid}: {f.Key} without a sign-in, using the signed-in answer");
                        return await withAccount;
                    }
                    catch
                    {
                        Drop(signedIn, withAccount);
                        throw;
                    }
                }
            }
            try
            {
                return await GetInfo(vid, false, ct);
            }
            catch (Fail f) when (auth == null && Session.Helps.Contains(f.Key) && Session.Available)
            {
                Log.Info($"info {vid}: {f.Key} without a sign-in, asking as the signed-in user");
                return await GetInfo(vid, false, ct, -1, true);
            }
        }

        // Fresh links after refused ones: the same way again, or the next one when `rotate`. A way whose
        // answer lacks what `usable` needs (not every app is offered every stream) is skipped.
        public static async Task<Info> Relink(string vid, Info old, bool rotate, Func<Info, bool> usable, CancellationToken ct)
        {
            bool auth = old.Auth;
            int v = rotate ? NextVariant(old.Variant, auth) : old.Variant;
            Fail first = null, fromDefault = null;
            for (int i = 0; i < Ways(auth).Length; i++, v = NextVariant(v, auth))
            {
                try
                {
                    var fresh = await GetInfo(vid, true, ct, v, auth);
                    if (usable == null || usable(fresh)) return fresh;
                    Log.Info($"links for {vid} fetched with variant {v} lack the stream, trying the next way");
                }
                catch (Fail f) when (!Stops(f))
                {
                    // Some ways fail for some videos ("page needs to be reloaded", no formats): try the others.
                    first = first ?? f;
                    if (v == 0) fromDefault = f;
                    Log.Info($"links for {vid} could not be fetched with variant {v} ({f.Key}), trying the next way");
                }
            }
            throw fromDefault ?? first ?? new Fail("errFormatGone");
        }

        // Failures another way of asking can't change.
        static bool Stops(Fail f) => f.Key == "errEngineMissing" || f.Key == "errDiskFull" || f.Key == "errSignIn" || f.Key == "errSessionExpired";

        // How good an answer is for downloading: the highest video it offers, separate streams (any
        // quality, merged here) ahead of a finished file of the same height. 0: nothing to download.
        static int Score(Info i)
        {
            bool audio = i.Formats.Any(f => !f.HasVideo && f.HasAudio && f.Http);
            int sep = audio ? i.Formats.Where(f => f.HasVideo && !f.HasAudio && f.Http && f.Short > 0).Select(f => f.Short).DefaultIfEmpty(0).Max() : 0;
            int comb = i.Formats.Where(f => f.Combined).Select(f => f.Short).DefaultIfEmpty(0).Max();
            int s = Math.Max(sep * 2 + (sep > 0 ? 1 : 0), comb * 2);
            return s > 0 ? s : audio ? 1 : 0;
        }

        static bool HasSeparate(Info i) => i.Formats.Any(f => f.HasVideo && !f.HasAudio && f.Http && f.Short > 0) && i.Formats.Any(f => !f.HasVideo && f.HasAudio && f.Http);

        // As the signed-in user: all ways at once. The first answer with separate streams (full quality)
        // wins at once and the other runs stop; otherwise the best answer once all are in. The others'
        // files are removed.
        static async Task<Info> FetchSignedIn(string vid, string key, CancellationToken ct)
        {
            var clock = System.Diagnostics.Stopwatch.StartNew();
            using (var all = CancellationTokenSource.CreateLinkedTokenSource(ct))
            {
                var pending = Enumerable.Range(0, AuthVariants.Length).Select(v => Fetch(vid, key, v, true, all.Token)).ToList();
                Info best = null;
                Fail first = null;
                var tried = new List<Info>();
                try
                {
                    while (pending.Count > 0)
                    {
                        var done = await Task.WhenAny(pending);
                        pending.Remove(done);
                        try
                        {
                            var i = await done;
                            tried.Add(i);
                            if (best == null || Score(i) > Score(best)) best = i;
                            if (HasSeparate(i)) break;
                        }
                        catch (Fail f) when (!Stops(f))
                        {
                            first = first ?? f;
                        }
                    }
                }
                finally
                {
                    all.Cancel(); // the runs still going aren't needed any more
                    foreach (var t in pending) _ = t.ContinueWith(x => { var _ = x.Exception; }, TaskScheduler.Default);
                }
                if (best == null) throw first ?? new Fail("errGeneric");
                foreach (var i in tried) if (i != best) Files.TryDelete(i.Path);
                Log.Info($"info {vid} (signed in): using way {best.Variant} after {clock.Elapsed.TotalSeconds:0.0}s");
                lock (L) cache[key] = best;
                return best;
            }
        }

        // Each fetch gets its own file: a yt-dlp process may still be reading the previous one.
        // Signed-in answers go to "<id>~auth-..." files, so the anonymous "<id>-*" pattern never picks them up.
        static string NewInfoPath(string key, int variant) => System.IO.Path.Combine(Paths.InfoDir, key + "-" + Time.Now + "-v" + variant + ".json");

        static Info LoadFile(string key, bool auth)
        {
            try
            {
                var p = Directory.GetFiles(Paths.InfoDir, key + "-*.json").OrderByDescending(f => f).FirstOrDefault();
                if (p == null) return null;
                var i = Parse(File.ReadAllText(p), p);
                i.FetchedAt = new DateTimeOffset(File.GetLastWriteTimeUtc(p)).ToUnixTimeMilliseconds();
                var m = Regex.Match(p, @"-v(\d+)\.json$");
                i.Variant = m.Success ? Math.Min(Ways(auth).Length - 1, int.Parse(m.Groups[1].Value)) : 0;
                return i;
            }
            catch { return null; }
        }

        static async Task<Info> Fetch(string vid, string key, int variant, bool auth, CancellationToken ct)
        {
            if (Components.YtDlp == null) throw new Fail("errEngineMissing");
            var way = Ways(auth)[variant];
            var who = $"info {vid}{(auth ? " (signed in)" : "")} way {variant}";
            bool updated = false;
            for (int attempt = 1; ; attempt++)
            {
                ct.ThrowIfCancellationRequested();
                var args = Components.YtArgs();
                args.Add("-v"); // yt-dlp's per-app notes (refusals, skipped streams) go to the log, see Diag
                if (way != null) args.AddRange(new[] { "--extractor-args", way });
                args.AddRange(new[] { "-J", "https://www.youtube.com/watch?v=" + vid });
                (int code, string stdout, string stderr, bool killed) r;
                using (var cookies = CookieFile.For(auth))
                {
                    if (cookies != null) args.InsertRange(0, cookies.Args);
                    r = await Proc.Run(Components.YtDlp.Exe, Components.YtDlp.With(args), ct, 120000);
                }
                ct.ThrowIfCancellationRequested();
                var diag = Diag.Read(r.stderr);
                foreach (var n in diag.Notes) Log.Info($"{who}: {n}");
                // The browser's sign-in was replaced since it was handed over (YouTube rotates it).
                if (auth && diag.SignInRotated)
                {
                    Session.Expire();
                    throw new Fail("errSessionExpired");
                }
                var json = (r.stdout ?? "").Trim();
                if (r.code == 0 && json.StartsWith("{"))
                {
                    var path = NewInfoPath(key, variant);
                    Files.WriteAtomic(path, json);
                    foreach (var f in Directory.GetFiles(Paths.InfoDir, key + "-*.json"))
                        if (f != path && DateTime.UtcNow - File.GetLastWriteTimeUtc(f) > TimeSpan.FromMinutes(2)) Files.TryDelete(f);
                    var info = Parse(json, path);
                    info.FetchedAt = Time.Now;
                    info.Variant = variant;
                    info.Auth = auth;
                    info.Diag = diag;
                    Log.Info($"{who}: {Describe(info)}");
                    lock (L) cache[key] = info;
                    return info;
                }
                var plain = Diag.Plain(r.stderr);
                var c = Errors.Classify(plain);
                Log.Warn($"{who} attempt {attempt}: {c.cls} {Diag.Clean(Errors.LastError(plain))}");
                // Signed in and still refused: this account isn't eligible.
                if (c.cls == Cls.Permanent) throw new Fail(auth ? Session.AsAccountError(c.key) : c.key, c.vars);
                if (c.cls == Cls.Broken && !updated && Components.YtDlp.Managed)
                {
                    updated = true;
                    await Components.UpdateYtDlp(ct);
                    continue;
                }
                if (attempt >= 4) throw new Fail(c.cls == Cls.Broken ? "errEngine" : c.cls == Cls.Unknown ? "errGeneric" : "errNetwork");
                await Task.Delay(TimeSpan.FromSeconds(Math.Min(20, 2 << attempt)), ct);
            }
        }

        static Info Parse(string json, string path)
        {
            var d = Json.ParseObj(json) ?? throw new InvalidDataException("bad info");
            var info = new Info
            {
                Id = d.Str("id"),
                Title = d.Str("title") ?? d.Str("fulltitle") ?? "video",
                Uploader = d.Str("uploader") ?? d.Str("channel") ?? "",
                Duration = d.Num("duration"),
                Path = path,
                Live = d.Str("live_status") == "is_live" || d.Str("live_status") == "is_upcoming",
                NeedsAccount = d.Num("age_limit") >= 18 || new[] { "needs_auth", "subscriber_only", "premium_only", "private" }.Contains(d.Str("availability") ?? ""),
                Subs = d.Obj("subtitles"),
                Auto = d.Obj("automatic_captions"),
            };
            int i = 0;
            foreach (var o in d.Arr("formats") ?? new object[0])
            {
                if (!(o is Dictionary<string, object> f)) continue;
                var note = f.Str("format_note") ?? "";
                var id = f.Str("format_id") ?? "";
                var headers = new Dictionary<string, string>();
                var h = f.Obj("http_headers");
                if (h != null) foreach (var kv in h) if (kv.Value is string hv) headers[kv.Key] = hv;
                info.Formats.Add(new Fmt
                {
                    Headers = headers,
                    AvailableAt = f.Long("available_at"),
                    Index = i++,
                    Id = id,
                    Ext = f.Str("ext"),
                    VCodec = f.Str("vcodec"),
                    ACodec = f.Str("acodec"),
                    Protocol = f.Str("protocol"),
                    Note = note,
                    Lang = f.Str("language"),
                    Url = f.Str("url"),
                    Width = f.Int("width"),
                    Height = f.Int("height"),
                    Fps = f.Num("fps"),
                    Tbr = f.Num("tbr"),
                    Abr = f.Num("abr"),
                    Size = f.Long("filesize") > 0 ? f.Long("filesize") : f.Long("filesize_approx"),
                    Drc = f.Bool("has_drc") || note.IndexOf("DRC", StringComparison.Ordinal) >= 0 || id.EndsWith("-drc"),
                    Hdr = !string.IsNullOrEmpty(f.Str("dynamic_range")) && f.Str("dynamic_range") != "SDR",
                });
            }
            return info;
        }

        // One line for the log: what YouTube offered this time, by kind.
        static string Describe(Info i)
        {
            string Heights(IEnumerable<Fmt> fs) => string.Join(",", fs.Select(f => f.Short + (f.Hls ? "hls" : "")).Distinct());
            var video = i.Formats.Where(f => f.HasVideo && !f.HasAudio && f.Http).OrderBy(f => f.Short).ToList();
            var audio = i.Formats.Where(f => !f.HasVideo && f.HasAudio && f.Http).ToList();
            var comb = i.Formats.Where(f => f.Combined).OrderBy(f => f.Short).ToList();
            int other = i.Formats.Count - video.Count - audio.Count - comb.Count;
            return $"{i.Formats.Count} formats: {video.Count} video{(video.Count > 0 ? " (" + Heights(video) + ")" : "")}, {audio.Count} audio, "
                + $"{comb.Count} combined{(comb.Count > 0 ? " (" + Heights(comb) + ")" : "")}, {other} other"
                + (i.Live ? ", live" : "") + (Score(i) == 0 ? "; nothing downloadable" : "");
        }

        // The same stream in freshly fetched details (format ids can differ between ways of asking).
        public static Fmt Match(Info i, StreamPart s)
        {
            var exact = i.Formats.FirstOrDefault(f => f.Id == s.FormatId);
            if (exact != null) return exact;
            var itag = s.FormatId.Split('-')[0];
            return i.Formats.FirstOrDefault(f => f.Id.Split('-')[0] == itag && (f.Http ? s.Size <= 0 || f.Size == s.Size : f.Hls));
        }

        // Nothing to download in this answer: why, as the message the user gets.
        public static string NothingKey(Info i) => i.Diag.Drm ? "errDrm" : "errNoDownload";

        // A finished video+sound stream of about this height (HTTPS before HLS), or null.
        public static Fmt PickCombined(Info i, int height)
        {
            var list = i.Formats.Where(f => f.Combined).ToList();
            if (list.Count == 0) return null;
            var below = list.Where(f => f.Short <= height).ToList();
            int h = below.Count > 0 ? below.Max(f => f.Short) : list.Min(f => f.Short);
            return list.Where(f => f.Short == h).OrderByDescending(f => f.Http).ThenByDescending(f => f.CodecScore).ThenByDescending(f => f.Tbr).First();
        }

        // Sound from a combined stream when there is no separate one: the smallest at least 360p (the
        // smaller ones carry low-rate sound), HTTPS first.
        static Fmt PickCombinedAudio(Info i) =>
            i.Formats.Where(f => f.Combined && (f.ACodec ?? "").StartsWith("mp4a"))
                .OrderBy(f => f.Short < 360 ? 1 : 0).ThenBy(f => f.Short).ThenByDescending(f => f.Http).FirstOrDefault();

        static int AudioKbps(Fmt f) => (int)Math.Round(f.Abr > 0 ? f.Abr : !f.HasVideo && f.Tbr > 0 ? f.Tbr : 128);

        // Closer to the wanted height wins: at or below it the higher, above it the lower.
        static int Fit(Fmt f, int height) => f == null ? int.MinValue : f.Short <= height ? f.Short : -f.Short;

        // yt-dlp lists formats from worst to best by its own ranking (which already puts the original
        // language first), so the last matching entry is the one to take.
        public static Fmt PickAudio(Info i, string codecPrefix)
        {
            var list = i.Formats.Where(f => !f.HasVideo && f.HasAudio && f.Http && (codecPrefix == null || (f.ACodec ?? "").StartsWith(codecPrefix))).ToList();
            var plain = list.Where(f => !f.Drc).ToList();
            if (plain.Count > 0) list = plain;
            return list.LastOrDefault();
        }

        // Height is the short side (portrait videos are labelled by their width, like YouTube does).
        public static Fmt PickVideo(Info i, int height)
        {
            var vids = i.Formats.Where(f => f.HasVideo && !f.HasAudio && f.Http && f.Short > 0).ToList();
            if (vids.Count == 0) return null;
            var pool = vids.Where(f => f.Short == height).ToList();
            if (pool.Count == 0)
            {
                var below = vids.Where(f => f.Short <= height).ToList();
                if (below.Count > 0)
                {
                    var best = below.Max(f => f.Short);
                    pool = below.Where(f => f.Short == best).ToList();
                }
                else
                {
                    var least = vids.Min(f => f.Short);
                    pool = vids.Where(f => f.Short == least).ToList();
                }
            }
            // The smoothest first (60 fps before 30), then HDR where the video has it, then the codec that plays
            // most widely (H.264, AV1, VP9), then the higher bit rate.
            return pool.OrderByDescending(f => Math.Round(f.Fps)).ThenByDescending(f => f.Hdr).ThenByDescending(f => f.CodecScore).ThenByDescending(f => f.Tbr).First();
        }

        public static List<StreamPart> Plan(Job j, Info i)
        {
            var parts = new List<StreamPart>();
            StreamPart Part(string role, Fmt f) => new StreamPart { Role = role, FormatId = f.Id, Ext = f.Ext, Size = f.Size, Codec = role == "audio" ? f.ACodec : f.VCodec };
            if (Score(i) == 0) throw new Fail(NothingKey(i));
            switch (j.Kind)
            {
                case "video":
                {
                    var h = j.Opts.Int("height", 1080);
                    var a = PickAudio(i, "mp4a") ?? PickAudio(i, null);
                    var v = a != null ? PickVideo(i, h) : null;
                    var c = PickCombined(i, h);
                    if (v != null && Fit(v, h) >= Fit(c, h))
                    {
                        parts.Add(Part("video", v));
                        parts.Add(Part("audio", a));
                    }
                    else if (c != null) parts.Add(Part("av", c));
                    else throw new Fail("errFormatGone");
                    break;
                }
                case "opus":
                {
                    var a = PickAudio(i, "opus") ?? throw new Fail("errFormatGone");
                    parts.Add(Part("audio", a));
                    break;
                }
                default: // mp3, m4a, wav; from a combined stream when there is no separate sound
                {
                    var a = PickAudio(i, "mp4a") ?? PickAudio(i, null) ?? PickCombinedAudio(i) ?? throw new Fail("errFormatGone");
                    parts.Add(Part("audio", a));
                    break;
                }
            }
            Log.Info($"job {j.Id} plan: " + string.Join(", ", parts.Select(p =>
            {
                var f = i.Formats.First(x => x.Id == p.FormatId);
                return $"{p.Role} {f.Id} {f.Ext} {(f.HasVideo ? f.Short + "p " : "")}{f.Protocol}";
            })));
            return parts;
        }

        // What the browser script needs to list options when it can't read them from the page itself.
        // Separate video streams count only with separate sound to go with them; finished video+sound
        // streams fill in the heights they don't cover. Sound options come from a finished stream's
        // sound when there is no separate one. An answer with nothing to download throws.
        public static Dictionary<string, object> Summary(Info i)
        {
            if (Score(i) == 0) throw new Fail(NothingKey(i));
            var sepAudio = PickAudio(i, "mp4a") ?? PickAudio(i, null);
            var best = PickAudio(i, "mp4a");
            var opus = PickAudio(i, "opus");
            var fromComb = best == null ? PickCombinedAudio(i) : null;
            var sep = sepAudio == null ? new List<int>() : i.Formats.Where(f => f.HasVideo && !f.HasAudio && f.Http && f.Short > 0).Select(f => f.Short).Distinct().ToList();
            var heights = sep.Concat(i.Formats.Where(f => f.Combined).Select(f => f.Short)).Distinct().OrderByDescending(h => h);
            var video = heights.Select(h =>
            {
                var v = sep.Contains(h) ? PickVideo(i, h) : PickCombined(i, h);
                var size = v.HasAudio ? v.SizeOr(i.Duration) : v.SizeOr(i.Duration) + sepAudio.SizeOr(i.Duration);
                return new Dictionary<string, object>
                {
                    ["height"] = h,
                    ["fps"] = (int)Math.Round(v.Fps),
                    ["codec"] = v.CodecName,
                    ["hdr"] = v.Hdr,
                    ["size"] = size,
                };
            }).ToArray();
            var aac = best ?? fromComb;
            var subs = new List<object>();
            void AddSubs(Dictionary<string, object> src, bool auto)
            {
                if (src == null) return;
                foreach (var kv in src)
                {
                    if (kv.Key == "live_chat") continue;
                    if (auto && kv.Key.Contains("-") && !kv.Key.EndsWith("-orig")) continue; // machine translations
                    var first = (kv.Value as object[])?.OfType<Dictionary<string, object>>().FirstOrDefault();
                    subs.Add(new Dictionary<string, object> { ["lang"] = kv.Key, ["name"] = first?.Str("name") ?? kv.Key, ["auto"] = auto });
                }
            }
            AddSubs(i.Subs, false);
            AddSubs(i.Auto, true);
            return new Dictionary<string, object>
            {
                ["vid"] = i.Id,
                ["title"] = i.Title,
                ["author"] = i.Uploader,
                ["duration"] = i.Duration,
                ["video"] = video,
                ["aac"] = aac == null ? null : new Dictionary<string, object>
                {
                    ["kbps"] = AudioKbps(aac),
                    ["size"] = aac == best ? best.SizeOr(i.Duration) : (long)(AudioKbps(aac) * 125 * i.Duration),
                },
                ["opus"] = opus == null ? null : new Dictionary<string, object> { ["kbps"] = AudioKbps(opus), ["size"] = opus.SizeOr(i.Duration) },
                ["subs"] = subs.ToArray(),
            };
        }

        // ---------- local processing (FFmpeg) ----------

        static List<string> FfBase() => new List<string> { "-hide_banner", "-nostdin", "-y", "-loglevel", "error", "-progress", "pipe:1", "-nostats" };

        static IEnumerable<string> Meta(Job j)
        {
            var m = new List<string>();
            if (!string.IsNullOrEmpty(j.Title)) m.AddRange(new[] { "-metadata", "title=" + j.Title });
            if (!string.IsNullOrEmpty(j.Author)) m.AddRange(new[] { "-metadata", "artist=" + j.Author });
            m.AddRange(new[] { "-metadata", "comment=https://www.youtube.com/watch?v=" + j.Vid });
            return m;
        }

        public static string OutputExt(Job j)
        {
            switch (j.Kind)
            {
                case "video": return "mp4";
                case "mp3": return "mp3";
                case "wav": return "wav";
                case "opus": return "opus";
                default: return "m4a";
            }
        }

        // Turns the downloaded streams into the requested file. Returns its path in the work folder.
        public static async Task<string> Process(Job j, List<StreamPart> parts, double duration, Action<double> progress, CancellationToken ct)
        {
            var ext = OutputExt(j);
            var outFile = System.IO.Path.Combine(j.Work, "out." + ext);
            Files.TryDelete(outFile);
            var a = FfBase();
            var video = parts.FirstOrDefault(p => p.Role == "video");
            var audio = parts.FirstOrDefault(p => p.Role == "audio");
            var av = parts.FirstOrDefault(p => p.Role == "av");
            switch (j.Kind)
            {
                case "video":
                    if (video != null && audio != null)
                        a.AddRange(new[] { "-i", video.File, "-i", audio.File, "-map", "0:v:0", "-map", "1:a:0", "-c", "copy" });
                    else
                        a.AddRange(new[] { "-i", (video ?? av).File, "-map", "0:v:0", "-map", "0:a:0?", "-c", "copy" });
                    a.AddRange(new[] { "-movflags", "+faststart" });
                    a.AddRange(Meta(j));
                    break;
                case "mp3":
                {
                    var cover = await Cover(j, ct);
                    a.AddRange(new[] { "-i", audio.File });
                    if (cover != null) a.AddRange(new[] { "-i", cover });
                    a.AddRange(new[] { "-map", "0:a:0" });
                    if (cover != null) a.AddRange(new[] { "-map", "1:v:0", "-c:v", "copy", "-disposition:v:0", "attached_pic", "-metadata:s:v", "title=Album cover", "-metadata:s:v", "comment=Cover (front)" });
                    a.AddRange(new[] { "-c:a", "libmp3lame", "-b:a", Math.Max(64, Math.Min(320, j.Opts.Int("kbps", 320))) + "k", "-id3v2_version", "3" });
                    a.AddRange(Meta(j));
                    break;
                }
                case "wav":
                    a.AddRange(new[] { "-i", audio.File, "-map", "0:a:0", "-c:a", "pcm_s16le" });
                    break;
                case "opus":
                    a.AddRange(new[] { "-i", audio.File, "-map", "0:a:0", "-c:a", "copy" });
                    a.AddRange(Meta(j));
                    break;
                default: // m4a: keep the original AAC stream; anything else is converted
                    a.AddRange(new[] { "-i", audio.File, "-map", "0:a:0" });
                    a.AddRange((audio.Codec ?? "").StartsWith("mp4a") ? new[] { "-c:a", "copy" } : new[] { "-c:a", "aac", "-b:a", "192k" });
                    a.AddRange(new[] { "-movflags", "+faststart" });
                    a.AddRange(Meta(j));
                    break;
            }
            a.Add(outFile);
            var r = await Proc.Run(Components.Ffmpeg.Exe, a, ct, 0, line =>
            {
                var m = Regex.Match(line, "^out_time_(?:us|ms)=(\\d+)");
                if (m.Success && duration > 0) progress(Math.Min(1, long.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture) / 1e6 / duration));
            }, keepOut: false);
            ct.ThrowIfCancellationRequested();
            if (r.code != 0 || !File.Exists(outFile))
            {
                Log.Warn("ffmpeg failed: " + r.stderr);
                if (Regex.IsMatch(r.stderr ?? "", "No space left|Errno 28|not enough space", RegexOptions.IgnoreCase)) throw new Fail("errDiskFull");
                throw new Fail("errConvert");
            }
            return outFile;
        }

        static async Task<string> Cover(Job j, CancellationToken ct)
        {
            foreach (var k in new[] { "maxresdefault", "hqdefault" })
            {
                try
                {
                    var b = await Net.GetBytes($"https://i.ytimg.com/vi/{j.Vid}/{k}.jpg", ct);
                    if (b != null && b.Length > 2000)
                    {
                        var p = System.IO.Path.Combine(j.Work, "cover.jpg");
                        File.WriteAllBytes(p, b);
                        return p;
                    }
                }
                catch (Exception e) when (!ct.IsCancellationRequested) { Log.Warn("cover: " + e.Message); }
            }
            return null;
        }

        // Only a file FFmpeg can read end to end, with the expected streams and length, is handed over.
        public static async Task Verify(Job j, string file, double expected, CancellationToken ct)
        {
            var r = await Proc.Run(Components.Ffprobe.Exe, new[] { "-v", "error", "-print_format", "json", "-show_entries", "format=duration:stream=codec_type", file }, ct, 60000);
            ct.ThrowIfCancellationRequested();
            Dictionary<string, object> d = null;
            try { d = Json.ParseObj(r.stdout); } catch { }
            var types = (d?.Arr("streams") ?? new object[0]).OfType<Dictionary<string, object>>().Select(s => s.Str("codec_type")).ToList();
            var dur = d?.Obj("format")?.Num("duration") ?? 0;
            bool ok = r.code == 0 && d != null && types.Contains(j.Kind == "video" ? "video" : "audio");
            if (ok && expected > 5 && dur > 0 && dur < expected * 0.9 - 2) ok = false; // noticeably cut short
            if (ok && dur <= 0 && j.Kind != "video") ok = false;
            if (!ok)
            {
                Log.Warn($"verify failed for {j.Id}: code={r.code} types={string.Join(",", types)} dur={dur} expected={expected} {r.stderr}");
                throw new Fail("errVerify");
            }
        }

        static string Clock(double s)
        {
            var t = (long)Math.Round(Math.Max(0, s));
            var h = t / 3600;
            return h > 0 ? $"{h}.{(t / 60) % 60:00}.{t % 60:00}" : $"{t / 60}.{t % 60:00}";
        }

        // Same naming as the browser script: just the title ("Title.mp4", "Title.mp3"), plus the clip's
        // time range or the subtitles' language where there is one. No video ID, quality or format;
        // a second copy becomes "Title (2).mp4".
        public static string BaseName(Job j)
        {
            var b = Files.SafeName(j.Title);
            var trim = j.Opts.Obj("trim");
            var clip = trim != null ? $" ({Clock(trim.Num("start"))}-{Clock(trim.Num("end"))})" : "";
            switch (j.Kind)
            {
                case "video": return b + clip;
                case "thumb": return b;
                case "subs": return b + "." + Files.SafeName(j.Opts.Str("lang") ?? "sub", 32);
                case "file": return Files.SafeName(System.IO.Path.GetFileNameWithoutExtension(j.Opts.Str("name") ?? "file"));
                default: return b + clip;
            }
        }
    }
}
