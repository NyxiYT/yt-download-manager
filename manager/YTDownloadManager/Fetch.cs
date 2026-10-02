using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace YTDM
{
    // How the videos playing in the connected browsers are doing. While downloads run, each tab reports
    // every few seconds whether its video plays and how many seconds are buffered ahead.
    static class Playback
    {
        sealed class Report
        {
            public long At;
            public bool Playing, Live;
            public double Buffer;
        }

        static readonly object L = new object();
        static readonly Dictionary<string, Report> reports = new Dictionary<string, Report>();
        const long FreshMs = 8000;

        public static void Set(string tab, bool playing, double buffer, bool live)
        {
            lock (L)
            {
                var now = Time.Now;
                reports[tab] = new Report { At = now, Playing = playing, Buffer = buffer, Live = live };
                foreach (var k in reports.Where(kv => now - kv.Value.At > 60000).Select(kv => kv.Key).ToList()) reports.Remove(k);
            }
        }

        // 0: no video playing. 1: playing with a comfortable buffer. 2: the buffer is getting short.
        // 3: the video is about to run dry (or already waits for data).
        public static int Pressure
        {
            get
            {
                lock (L)
                {
                    var now = Time.Now;
                    int p = 0;
                    foreach (var r in reports.Values)
                    {
                        if (now - r.At > FreshMs || !r.Playing) continue;
                        // YouTube's player keeps only a short stretch buffered by design (often 10 to 30 s, less
                        // while it streams bit by bit), and plays fine with it. Only a buffer about to run dry
                        // means a download is taking the line from the video. Live streams keep less ahead.
                        double low = r.Live ? 1 : 2.5, ok = r.Live ? 2.5 : 5;
                        p = Math.Max(p, r.Buffer >= ok ? 1 : r.Buffer >= low ? 2 : 3);
                    }
                    return p;
                }
            }
        }
    }

    // One budget for all downloads together. Unlimited normally; while a video in the browser runs short
    // of buffer, downloads drop to a share of what the connection can carry, so the video gets the rest.
    static class Bandwidth
    {
        static readonly object L = new object();
        static readonly Stopwatch Clock = Stopwatch.StartNew();
        static double next;            // ms on Clock when the budget allows the next byte
        static double capacity;        // best rate (bytes/s) measured recently while unrestricted
        static double capacityAt;
        static double windowStart;
        static long windowBytes;
        static bool windowLimited;

        public static bool Shaping => Playback.Pressure >= 2;

        static int lastPressure = -1;
        static double lastLogAt = -60000;

        // Changes of the playback pressure downloads react to, for the log (at most one line in 10 s).
        static void Note(int pressure, double now)
        {
            pressure = Math.Max(1, pressure); // nothing playing and playing comfortably: both full speed
            if (pressure == lastPressure || now - lastLogAt < 10000) return;
            Log.Info(pressure >= 3 ? "playback: a video in the browser is about to run out of buffer, downloads slowed down a lot"
                : pressure == 2 ? "playback: a video in the browser is short of buffer, downloads slowed down"
                : "playback: videos in the browser are buffered, downloads at full speed");
            lastPressure = pressure;
            lastLogAt = now;
        }

        static double Limit(int pressure)
        {
            var cap = capacity > 0 ? capacity : 0;
            switch (pressure)
            {
                case 2: return Math.Max(512 * 1024, cap > 0 ? cap * 0.5 : 4 * 1024 * 1024);
                case 3: return Math.Max(256 * 1024, cap > 0 ? cap * 0.15 : 1024 * 1024);
                default: return double.PositiveInfinity;
            }
        }

        // Called after every block a download has read; waits as long as the budget requires.
        public static Task Take(int bytes, CancellationToken ct)
        {
            double wait;
            var pressure = Playback.Pressure;
            lock (L)
            {
                var now = Clock.Elapsed.TotalMilliseconds;
                Note(pressure, now);
                var limit = Limit(pressure);
                Measure(bytes, now, !double.IsInfinity(limit));
                if (double.IsInfinity(limit))
                {
                    next = now;
                    return Task.CompletedTask;
                }
                next = Math.Max(next, now - 200) + bytes * 1000.0 / limit; // up to 200 ms of burst
                wait = next - now;
            }
            return wait < 4 ? Task.CompletedTask : Task.Delay(TimeSpan.FromMilliseconds(Math.Min(wait, 3000)), ct);
        }

        // Throughput per second across all downloads; unrestricted seconds tell what the connection can do.
        static void Measure(int bytes, double now, bool limited)
        {
            windowBytes += bytes;
            windowLimited |= limited;
            var span = now - windowStart;
            if (span < 1000) return;
            var rate = windowBytes * 1000.0 / span;
            if (!windowLimited && span < 3000)
            {
                if (rate >= capacity || now - capacityAt > 120000)
                {
                    capacity = rate;
                    capacityAt = now;
                }
            }
            windowStart = now;
            windowBytes = 0;
            windowLimited = limited;
        }
    }

    sealed class HttpStatus : Exception
    {
        public readonly int Code;
        public HttpStatus(int code) : base("HTTP " + code) { Code = code; }
    }

    // The manager's own downloader for plain HTTPS streams (the usual case): ranged requests into
    // "<role>.<ext>.part" in the job's work folder, continued from where it stopped after a pause, a
    // dropped connection or a restart, with fresh links when YouTube's expire or are refused, and the
    // shared bandwidth budget above. Clips and anything else still go through yt-dlp.
    sealed partial class JobManager
    {
        const int ChunkSize = 10 << 20; // googlevideo slows down very large single requests
        // One 10 MiB piece at a time gets about a third of a fast line (each request waits for its answer
        // and starts slow); six at once fill it. While a video in the browser needs the line: one.
        const int Pieces = 6;
        const int HlsPieces = 10; // HLS segments are small (a few seconds each): more at once
        const int StallMs = 30000;

        static bool IsDiskFull(Exception e) => e is IOException && ((e.HResult & 0xFFFF) == 112 || (e.HResult & 0xFFFF) == 39);

        static bool IsTransient(Exception e) =>
            e is HttpStatus h ? h.Code >= 500 || h.Code == 429 || h.Code == 408 : e is WebException || (e is IOException && !IsDiskFull(e)) || e is TimeoutException;

        // Pieces are fetched side by side but written in order, so the partial file is always one complete
        // stretch from the start (which is what continuing after a stop relies on).
        async Task FetchStream(Job j, StreamPart s, long before, CancellationToken ct)
        {
            var info = await InfoFor(j, false, ct);
            var f = Media.Match(info, s) ?? throw new Fail("errFormatGone");
            var dest = Path.Combine(j.Work, s.Role + "." + (string.IsNullOrEmpty(f.Ext) ? "bin" : f.Ext));
            var part = dest + ".part";
            Directory.CreateDirectory(j.Work);
            // A partial file of a different version of the stream can't be continued.
            if (s.Fp != null && s.Fp != f.Fp)
            {
                Log.Info($"job {j.Id}: {s.Role} stream changed, starting it over");
                Files.TryDelete(part);
            }
            long total = f.ExactSize;
            lock (L)
            {
                s.FormatId = f.Id;
                s.Fp = f.Fp;
                if (total > 0) s.Size = total;
            }
            SaveSoon();

            long have = File.Exists(part) ? new FileInfo(part).Length : 0;
            if (total > 0 && have > total)
            {
                Log.Warn($"job {j.Id}: {s.Role} partial file is longer than the stream, starting it over");
                Files.TryDelete(part);
                have = 0;
            }
            if (have > 0) Log.Info($"job {j.Id}: continuing {s.Role} at {have} of {total}");

            var meter = new SpeedMeter();
            var clock = Stopwatch.StartNew();
            long startedAt = have;
            double slowedMs = 0, lastByteAt = 0;
            var pl = new object();
            long pending = 0; // bytes of pieces still in flight
            int transient = 0, refused = 0;
            long sinceRefresh = 0;
            bool restarted = false;
            Action<int> onBytes = n =>
            {
                var shaping = Bandwidth.Shaping;
                double speed;
                long shown;
                lock (pl)
                {
                    pending += n;
                    sinceRefresh += n;
                    speed = meter.Add(n);
                    shown = have + Math.Max(0, pending);
                    var t = clock.Elapsed.TotalMilliseconds;
                    if (shaping) slowedMs += t - lastByteAt;
                    lastByteAt = t;
                }
                lock (L)
                {
                    j.Shaping = shaping;
                    if (j.Notice == "reconnecting" || j.Notice == "refreshingLink") j.Notice = null;
                }
                StreamProgress(j, s, before, shown, total, speed);
            };

            // start, piece (bytes and the stream's length as the server states it)
            var window = new Queue<KeyValuePair<long, Task<KeyValuePair<byte[], long>>>>();
            CancellationTokenSource batch = null;
            long next = have;
            void Drop()
            {
                batch?.Cancel();
                foreach (var w in window) w.Value.ContinueWith(x => { var _ = x.Exception; }, TaskScheduler.Default);
                window.Clear();
                batch?.Dispose();
                batch = null;
                lock (pl) pending = 0;
                next = have;
            }

            try
            {
                while (total <= 0 || have < total)
                {
                    ct.ThrowIfCancellationRequested();
                    await WaitOnline(j, ct);
                    await WaitAvailable(f, ct);
                    try
                    {
                        if (batch == null) batch = CancellationTokenSource.CreateLinkedTokenSource(ct);
                        // Until the stream's length is known, one piece at a time: the answer states it.
                        int width = total <= 0 ? 1 : Bandwidth.Shaping ? 1 : Pieces;
                        while (window.Count < width && (total <= 0 ? window.Count == 0 : next < total))
                        {
                            long to = total > 0 ? Math.Min(total, next + ChunkSize) - 1 : next + ChunkSize - 1;
                            window.Enqueue(new KeyValuePair<long, Task<KeyValuePair<byte[], long>>>(next, GetPiece(f, next, to, onBytes, batch.Token)));
                            next = to + 1;
                        }
                        var piece = await window.Peek().Value;
                        window.Dequeue();
                        var data = piece.Key;
                        using (var fs = new FileStream(part, FileMode.Append, FileAccess.Write, FileShare.Read, 1 << 16, true))
                        {
                            if (fs.Length != have) throw new IOException("partial file changed while downloading");
                            await fs.WriteAsync(data, 0, data.Length);
                        }
                        lock (pl)
                        {
                            have += data.Length;
                            pending -= data.Length;
                        }
                        if (total <= 0 && piece.Value > 0)
                        {
                            total = piece.Value;
                            lock (L) s.Size = total;
                        }
                        if (total <= 0 && data.Length < ChunkSize) total = have; // no length stated and the server ended early: that's the end
                        transient = 0;
                        if (sinceRefresh > 2 << 20) refused = 0;
                    }
                    catch (Exception e) when (ct.IsCancellationRequested)
                    {
                        throw new OperationCanceledException(e.Message, e, ct);
                    }
                    catch (HttpStatus h) when (h.Code == 403 || h.Code == 404 || h.Code == 410)
                    {
                        // Expired or refused link. One fetched moments ago and still refused: ask YouTube the next way.
                        Drop();
                        if (++refused > 5) throw new Fail("errBlocked");
                        SetNotice(j, "refreshingLink");
                        var fresh = Time.Now - info.FetchedAt < 90000;
                        Log.Info($"job {j.Id}: {s.Role} got HTTP {h.Code} at {have}, fetching {(fresh ? "links another way" : "fresh links")}");
                        info = await Media.Relink(j.Vid, info, fresh, i => Media.Match(i, s) != null, ct);
                        var nf = Media.Match(info, s);
                        if (nf.Fp != s.Fp)
                        {
                            if (restarted) throw new Fail("errFormatGone");
                            restarted = true;
                            Log.Info($"job {j.Id}: {s.Role} stream changed on YouTube, starting it over");
                            Files.TryDelete(part);
                            have = 0;
                            next = 0;
                            total = nf.ExactSize;
                            lock (L)
                            {
                                s.Fp = nf.Fp;
                                if (total > 0) s.Size = total;
                            }
                        }
                        lock (L) s.FormatId = nf.Id;
                        f = nf;
                        lock (pl) sinceRefresh = 0;
                        SaveSoon();
                    }
                    catch (HttpStatus h) when (h.Code == 416)
                    {
                        // Asked past the end: the stream is shorter than the partial file says. Start it over once.
                        Drop();
                        if (total <= 0 && have > 0) { total = have; break; }
                        if (restarted) throw new Fail("errGeneric");
                        restarted = true;
                        Log.Warn($"job {j.Id}: {s.Role} range {have}- refused (416), starting it over");
                        Files.TryDelete(part);
                        have = 0;
                        next = 0;
                    }
                    catch (Exception e) when (IsDiskFull(e))
                    {
                        throw new Fail("errDiskFull");
                    }
                    catch (Exception e) when (IsTransient(e))
                    {
                        Drop();
                        if (!Net.Online) continue;
                        if (++transient > 8) throw new Fail("errNetwork");
                        Log.Info($"job {j.Id}: {s.Role} at {have}: {e.Message} (attempt {transient})");
                        SetNotice(j, "reconnecting");
                        await Task.Delay(Backoff(transient, e is HttpStatus hs && hs.Code == 429), ct);
                    }
                }
            }
            finally
            {
                Drop();
            }

            if (File.Exists(dest)) File.Delete(dest);
            File.Move(part, dest);
            var secs = Math.Max(0.001, clock.Elapsed.TotalSeconds);
            Log.Info($"job {j.Id}: {s.Role} complete, {have} bytes in {secs:0.0}s ({(have - startedAt) / 1048576.0 / secs:0.0} MB/s), slowed for playback {slowedMs / 1000:0}s");
            lock (L)
            {
                s.File = dest;
                s.Done = true;
                s.Size = new FileInfo(dest).Length;
                j.Shaping = false;
            }
            SetNotice(j, null);
            SaveSoon();
            Media.Worked(info);
        }

        // One piece in memory, and the stream's length if the server states it.
        static async Task<KeyValuePair<byte[], long>> GetPiece(Fmt f, long from, long to, Action<int> onBytes, CancellationToken ct)
        {
            using (var ms = new MemoryStream((int)Math.Min(to - from + 1, ChunkSize)))
            {
                var total = await GetRange(f, from, to, null, onBytes, ct, ms);
                return new KeyValuePair<byte[], long>(ms.ToArray(), total);
            }
        }

        // Some links only become valid a few seconds after YouTube hands them out.
        static async Task WaitAvailable(Fmt f, CancellationToken ct)
        {
            if (f.AvailableAt <= 0) return;
            var ms = f.AvailableAt * 1000 - Time.Now;
            if (ms > 0) await Task.Delay(TimeSpan.FromMilliseconds(Math.Min(ms, 300000)), ct);
        }

        // YouTube's HLS streams (the finished video+sound streams of the Safari app, all a signed-in
        // session gets for some videos): the segment list, then the segments into "<role>.ts.part" in
        // order, through the same bandwidth budget and with the same recovery as FetchStream. Segments are
        // small, so a few are fetched at once; only one while a video in the browser needs the connection.
        // Continues after the last complete segment. Lists this doesn't handle (encrypted, byte ranges)
        // go to yt-dlp.
        async Task FetchHls(Job j, StreamPart s, long before, CancellationToken ct)
        {
            var info = await InfoFor(j, false, ct);
            var f = Media.Match(info, s) ?? throw new Fail("errFormatGone");
            var dest = Path.Combine(j.Work, s.Role + ".ts");
            var part = dest + ".part";
            Directory.CreateDirectory(j.Work);
            long have = 0;
            if (File.Exists(part) && s.Seg > 0 && s.Fp == f.Fp && new FileInfo(part).Length >= s.SegAt)
            {
                Truncate(part, s.SegAt);
                have = s.SegAt;
                Log.Info($"job {j.Id}: continuing {s.Role} after segment {s.Seg}");
            }
            else
            {
                Files.TryDelete(part);
                lock (L) { s.Seg = 0; s.SegAt = 0; }
            }
            long estimate = f.SizeOr(info.Duration);
            lock (L)
            {
                s.FormatId = f.Id;
                s.Fp = f.Fp;
                if (s.Size <= 0) s.Size = estimate;
            }
            SaveSoon();

            List<string> segs = null;
            var meter = new SpeedMeter();
            var clock = Stopwatch.StartNew();
            double slowedMs = 0, lastByteAt = 0;
            long startedAt = have;
            var pl = new object();
            long pending = 0; // bytes of segments still in flight
            int transient = 0, refused = 0;
            Action<int> onBytes = n =>
            {
                double speed;
                long shown;
                var shaping = Bandwidth.Shaping;
                lock (pl)
                {
                    pending += n;
                    speed = meter.Add(n);
                    shown = have + Math.Max(0, pending);
                    var t = clock.Elapsed.TotalMilliseconds;
                    if (shaping) slowedMs += t - lastByteAt;
                    lastByteAt = t;
                }
                lock (L)
                {
                    j.Shaping = shaping;
                    if (j.Notice == "reconnecting" || j.Notice == "refreshingLink") j.Notice = null;
                }
                StreamProgress(j, s, before, shown, Math.Max(estimate, shown), speed);
            };

            var window = new Queue<KeyValuePair<int, Task<byte[]>>>();
            CancellationTokenSource batch = null;
            int next = s.Seg;
            void Drop()
            {
                batch?.Cancel();
                foreach (var w in window) w.Value.ContinueWith(t => { var _ = t.Exception; }, TaskScheduler.Default);
                window.Clear();
                batch?.Dispose();
                batch = null;
                lock (pl) pending = 0;
                next = s.Seg;
            }

            try
            {
                while (true)
                {
                    ct.ThrowIfCancellationRequested();
                    await WaitOnline(j, ct);
                    try
                    {
                        if (segs == null)
                        {
                            segs = await Playlist(f, ct);
                            if (s.Seg > segs.Count) throw new IOException("segment list got shorter");
                        }
                        if (s.Seg >= segs.Count) break;
                        if (batch == null) batch = CancellationTokenSource.CreateLinkedTokenSource(ct);
                        int width = Bandwidth.Shaping ? 1 : HlsPieces;
                        while (window.Count < width && next < segs.Count)
                        {
                            window.Enqueue(new KeyValuePair<int, Task<byte[]>>(next, GetSegment(new Fmt { Url = segs[next], Headers = f.Headers }, onBytes, batch.Token)));
                            next++;
                        }
                        var data = await window.Peek().Value;
                        window.Dequeue();
                        using (var fs = new FileStream(part, FileMode.Append, FileAccess.Write, FileShare.Read, 1 << 16, true))
                        {
                            if (fs.Length != have) throw new IOException("partial file changed while downloading");
                            await fs.WriteAsync(data, 0, data.Length);
                        }
                        lock (pl)
                        {
                            have += data.Length;
                            pending -= data.Length;
                        }
                        lock (L)
                        {
                            s.Seg++;
                            s.SegAt = have;
                        }
                        if (s.Seg >= 5)
                        {
                            estimate = have * segs.Count / s.Seg; // the real average beats the bit-rate guess
                            lock (L) s.Size = estimate;
                        }
                        if (s.Seg % 20 == 0) SaveSoon();
                        transient = 0;
                        refused = 0;
                    }
                    catch (Exception e) when (ct.IsCancellationRequested)
                    {
                        throw new OperationCanceledException(e.Message, e, ct);
                    }
                    catch (HttpStatus h) when (h.Code == 403 || h.Code == 404 || h.Code == 410)
                    {
                        Drop();
                        if (++refused > 5) throw new Fail("errBlocked");
                        SetNotice(j, "refreshingLink");
                        var fresh = Time.Now - info.FetchedAt < 90000;
                        Log.Info($"job {j.Id}: {s.Role} segment {s.Seg} got HTTP {h.Code}, fetching {(fresh ? "links another way" : "fresh links")}");
                        info = await Media.Relink(j.Vid, info, fresh, i => Media.Match(i, s) != null, ct);
                        f = Media.Match(info, s);
                        lock (L) s.FormatId = f.Id;
                        segs = null;
                        SaveSoon();
                    }
                    catch (Exception e) when (IsDiskFull(e))
                    {
                        throw new Fail("errDiskFull");
                    }
                    catch (Exception e) when (IsTransient(e))
                    {
                        Drop();
                        if (!Net.Online) continue;
                        if (++transient > 8) throw new Fail("errNetwork");
                        Log.Info($"job {j.Id}: {s.Role} segment {s.Seg}: {e.Message} (attempt {transient})");
                        SetNotice(j, "reconnecting");
                        await Task.Delay(Backoff(transient, e is HttpStatus hs && hs.Code == 429), ct);
                    }
                }
            }
            finally
            {
                Drop();
            }

            if (File.Exists(dest)) File.Delete(dest);
            File.Move(part, dest);
            var secs = Math.Max(0.001, clock.Elapsed.TotalSeconds);
            Log.Info($"job {j.Id}: {s.Role} complete, {segs.Count} segments, {have} bytes in {secs:0}s ({(have - startedAt) / 1024 / secs:0} kB/s), slowed for playback {slowedMs / 1000:0}s");
            lock (L)
            {
                s.File = dest;
                s.Done = true;
                s.Size = new FileInfo(dest).Length;
                j.Shaping = false;
            }
            SetNotice(j, null);
            SaveSoon();
        }

        // One whole segment, in memory.
        static async Task<byte[]> GetSegment(Fmt f, Action<int> onBytes, CancellationToken ct)
        {
            using (var ms = new MemoryStream())
            {
                await GetRange(f, 0, long.MaxValue - 1, null, onBytes, ct, ms);
                return ms.ToArray();
            }
        }

        static void Truncate(string path, long length)
        {
            using (var fs = new FileStream(path, FileMode.Open, FileAccess.Write, FileShare.Read)) fs.SetLength(length);
        }

        // The segment links of an HLS media list, in order.
        static async Task<List<string>> Playlist(Fmt f, CancellationToken ct)
        {
            var tmp = Path.Combine(Paths.Work, "_hls-" + Rand.Id() + ".m3u8");
            string text;
            try
            {
                await GetRange(f, 0, (4 << 20) - 1, tmp, _ => { }, ct);
                text = File.ReadAllText(tmp);
            }
            finally { Files.TryDelete(tmp); }
            if (!text.StartsWith("#EXTM3U", StringComparison.Ordinal)) throw new IOException("not an HLS list");
            if (text.Contains("#EXT-X-STREAM-INF") || text.Contains("#EXT-X-BYTERANGE") || Regex.IsMatch(text, "#EXT-X-KEY:(?!METHOD=NONE)"))
                throw new NotSupportedException("HLS list the own downloader doesn't handle");
            var baseUri = new Uri(f.Url);
            var list = new List<string>();
            var map = Regex.Match(text, "#EXT-X-MAP:[^\\n]*URI=\"([^\"]+)\"");
            if (map.Success) list.Add(new Uri(baseUri, map.Groups[1].Value).AbsoluteUri);
            foreach (var raw in text.Split('\n'))
            {
                var l = raw.Trim();
                if (l.Length > 0 && l[0] != '#') list.Add(new Uri(baseUri, l).AbsoluteUri);
            }
            if (list.Count == 0) throw new IOException("empty HLS list");
            return list;
        }

        // Appends bytes [from, to] of the stream to `part` (or to `sink`). Returns the stream's total length
        // when the server states it. A connection that stalls for 30 seconds is dropped (and retried by
        // the caller).
        static async Task<long> GetRange(Fmt f, long from, long to, string part, Action<int> onBytes, CancellationToken ct, Stream sink = null)
        {
            var req = (HttpWebRequest)WebRequest.Create(f.Url);
            req.Method = "GET";
            req.AllowAutoRedirect = true;
            req.Timeout = StallMs;
            req.AutomaticDecompression = DecompressionMethods.None;
            if (from > 0 || to < long.MaxValue - 1) req.AddRange(from, to); // otherwise: the whole file
            foreach (var h in f.Headers)
            {
                try
                {
                    switch (h.Key.ToLowerInvariant())
                    {
                        case "user-agent": req.UserAgent = h.Value; break;
                        case "accept": req.Accept = h.Value; break;
                        case "referer": req.Referer = h.Value; break;
                        case "range": case "connection": case "host": case "content-length": case "accept-encoding": break;
                        default: req.Headers[h.Key] = h.Value; break;
                    }
                }
                catch (ArgumentException) { }
            }
            if (string.IsNullOrEmpty(req.UserAgent)) req.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";

            using (var stall = CancellationTokenSource.CreateLinkedTokenSource(ct))
            using (stall.Token.Register(req.Abort))
            {
                stall.CancelAfter(StallMs);
                HttpWebResponse resp;
                try
                {
                    resp = (HttpWebResponse)await req.GetResponseAsync().ConfigureAwait(false);
                }
                catch (WebException we) when (we.Response is HttpWebResponse r)
                {
                    var code = (int)r.StatusCode;
                    r.Dispose();
                    throw new HttpStatus(code);
                }
                catch (WebException) when (stall.IsCancellationRequested && !ct.IsCancellationRequested)
                {
                    throw new TimeoutException("no answer");
                }
                using (resp)
                {
                    var code = (int)resp.StatusCode;
                    long total = 0;
                    if (code == 206)
                    {
                        var m = Regex.Match(resp.Headers["Content-Range"] ?? "", @"bytes (\d+)-(\d+)/(\d+)");
                        if (!m.Success || long.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture) != from) throw new IOException("unexpected range in answer");
                        total = long.Parse(m.Groups[3].Value, CultureInfo.InvariantCulture);
                    }
                    else if (code == 200)
                    {
                        if (from > 0) throw new IOException("range not honored");
                        total = resp.ContentLength;
                    }
                    else throw new HttpStatus(code);

                    long want = to - from + 1;
                    long read = 0;
                    var buf = new byte[1 << 16];
                    using (var rs = resp.GetResponseStream())
                    using (var fs = sink ?? new FileStream(part, FileMode.Append, FileAccess.Write, FileShare.Read, 1 << 16, true))
                    {
                        if (sink == null && fs.Length != from) throw new IOException("partial file changed while downloading");
                        try
                        {
                            while (true)
                            {
                                int n = await rs.ReadAsync(buf, 0, buf.Length, stall.Token).ConfigureAwait(false);
                                if (n <= 0) break;
                                if (code == 200 && read + n > want) n = (int)(want - read); // server sent the whole file: take this chunk only
                                await fs.WriteAsync(buf, 0, n).ConfigureAwait(false);
                                read += n;
                                stall.CancelAfter(StallMs);
                                onBytes(n);
                                if (read >= want) break;
                                await Bandwidth.Take(n, ct).ConfigureAwait(false);
                            }
                        }
                        catch (Exception e) when (!(e is IOException && IsDiskFull(e)) && stall.IsCancellationRequested && !ct.IsCancellationRequested)
                        {
                            throw new TimeoutException("stalled");
                        }
                    }
                    bool atEnd = total > 0 && from + read >= total;
                    if (read < want && !atEnd && total > 0) throw new IOException("connection closed early");
                    return total;
                }
            }
        }

        // Speed over the last couple of seconds.
        sealed class SpeedMeter
        {
            readonly Stopwatch clock = Stopwatch.StartNew();
            double windowStart, speed;
            long windowBytes;

            public double Add(int n)
            {
                windowBytes += n;
                var now = clock.Elapsed.TotalMilliseconds;
                var span = now - windowStart;
                if (span >= 500)
                {
                    var inst = windowBytes * 1000.0 / span;
                    speed = speed > 0 ? speed * 0.7 + inst * 0.3 : inst;
                    windowStart = now;
                    windowBytes = 0;
                }
                return speed;
            }
        }
    }
}
