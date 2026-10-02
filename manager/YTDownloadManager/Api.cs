using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace YTDM
{
    // HTTP on 127.0.0.1 only. Every call except hello/pair needs a token that a browser only gets after
    // the user approves it in the manager, or that our own browser extension gets on its own (recognized
    // by its fixed extension ID, which the browser puts in the Origin header and no web page can fake). Requests from web pages (a foreign Origin) and DNS-rebinding
    // tricks (a foreign Host) are refused, and nothing sends CORS headers, so no website can use it.
    sealed class ApiServer
    {
        sealed class Req
        {
            public string Method, Path, Query;
            public Dictionary<string, string> Headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            public byte[] Body = new byte[0];
            public Dictionary<string, object> Json;

            public string Q(string k)
            {
                foreach (var part in (Query ?? "").Split('&'))
                {
                    var i = part.IndexOf('=');
                    if (i > 0 && Uri.UnescapeDataString(part.Substring(0, i)) == k) return Uri.UnescapeDataString(part.Substring(i + 1).Replace('+', ' '));
                }
                return null;
            }
        }

        sealed class Resp
        {
            public int Code = 200;
            public object Body;
        }

        sealed class ApiError : Exception
        {
            public readonly int Code;
            public readonly string Key;
            public ApiError(int code, string key) : base(key) { Code = code; Key = key; }
        }

        TcpListener listener;
        public int Port { get; private set; }
        public DateTime LastActivity = DateTime.UtcNow;
        const int MaxBody = 30 * 1024 * 1024;
        static readonly HashSet<string> Kinds = new HashSet<string> { "video", "mp3", "m4a", "opus", "wav", "thumb", "subs" };
        static readonly HashSet<string> SubFormats = new HashSet<string> { "srt", "vtt", "ttml", "srv3" };
        static readonly HashSet<string> Thumbs = new HashSet<string> { "oardefault", "maxresdefault", "sddefault", "hqdefault", "mqdefault" };

        public bool Start(int preferred)
        {
            for (int p = preferred; p < preferred + 10; p++)
            {
                try
                {
                    var l = new TcpListener(IPAddress.Loopback, p);
                    l.Server.ExclusiveAddressUse = true;
                    l.Start(64);
                    listener = l;
                    Port = p;
                    Log.Info("api listening on 127.0.0.1:" + p);
                    Task.Run(AcceptLoop);
                    return true;
                }
                catch (SocketException) { }
            }
            Log.Error("api: no free port");
            return false;
        }

        public void Stop()
        {
            try { listener?.Stop(); } catch { }
        }

        async Task AcceptLoop()
        {
            while (true)
            {
                TcpClient c;
                try { c = await listener.AcceptTcpClientAsync(); }
                catch (ObjectDisposedException) { return; }
                catch (InvalidOperationException) { return; }
                catch (Exception e)
                {
                    Log.Warn("accept: " + e.Message);
                    continue;
                }
                _ = Task.Run(() => Handle(c));
            }
        }

        async Task Handle(TcpClient c)
        {
            using (c)
            {
                try
                {
                    c.NoDelay = true;
                    c.ReceiveTimeout = 15000;
                    c.SendTimeout = 15000;
                    var s = c.GetStream();
                    Req req;
                    try { req = Read(s); }
                    catch (ApiError e)
                    {
                        Write(s, new Resp { Code = e.Code, Body = Err(e.Key) });
                        return;
                    }
                    if (req == null) return;
                    Resp resp;
                    try { resp = await Route(req); }
                    catch (ApiError e) { resp = new Resp { Code = e.Code, Body = Err(e.Key) }; }
                    catch (Fail f) { resp = new Resp { Code = 422, Body = new Dictionary<string, object> { ["error"] = ErrObj(f.Key, f.Vars) } }; }
                    catch (Exception e)
                    {
                        Log.Error("api " + req.Method + " " + req.Path, e);
                        resp = new Resp { Code = 500, Body = Err("errGeneric") };
                    }
                    Write(s, resp);
                }
                catch (IOException) { }
                catch (Exception e) { Log.Warn("api connection: " + e.Message); }
            }
        }

        static Dictionary<string, object> Err(string key) => new Dictionary<string, object> { ["error"] = ErrObj(key, null) };
        static Dictionary<string, object> ErrObj(string key, Dictionary<string, object> vars) => new Dictionary<string, object> { ["key"] = key, ["vars"] = vars, ["text"] = Errors.Text(key, vars) };

        static Req Read(NetworkStream s)
        {
            var buf = new byte[8192];
            var head = new MemoryStream();
            int end = -1;
            while (end < 0)
            {
                int n = s.Read(buf, 0, buf.Length);
                if (n <= 0) return null;
                head.Write(buf, 0, n);
                if (head.Length > 32768) throw new ApiError(431, "errGeneric");
                end = IndexOf(head.GetBuffer(), (int)head.Length, new byte[] { 13, 10, 13, 10 });
            }
            var all = head.ToArray();
            var text = Encoding.ASCII.GetString(all, 0, end);
            var lines = text.Split(new[] { "\r\n" }, StringSplitOptions.None);
            var first = lines[0].Split(' ');
            if (first.Length < 3) throw new ApiError(400, "errGeneric");
            var req = new Req { Method = first[0].ToUpperInvariant() };
            var target = first[1];
            var q = target.IndexOf('?');
            req.Path = q >= 0 ? target.Substring(0, q) : target;
            req.Query = q >= 0 ? target.Substring(q + 1) : "";
            foreach (var line in lines.Skip(1))
            {
                var i = line.IndexOf(':');
                if (i > 0) req.Headers[line.Substring(0, i).Trim()] = line.Substring(i + 1).Trim();
            }
            if (req.Headers.TryGetValue("Content-Length", out var clText))
            {
                if (!int.TryParse(clText, NumberStyles.None, CultureInfo.InvariantCulture, out var cl) || cl < 0) throw new ApiError(400, "errGeneric");
                if (cl > MaxBody) throw new ApiError(413, "errGeneric");
                var body = new byte[cl];
                int have = all.Length - (end + 4);
                Array.Copy(all, end + 4, body, 0, Math.Min(have, cl));
                s.ReadTimeout = 60000;
                while (have < cl)
                {
                    int n = s.Read(body, have, cl - have);
                    if (n <= 0) throw new IOException("closed");
                    have += n;
                }
                req.Body = body;
            }
            else if (req.Headers.TryGetValue("Transfer-Encoding", out var te) && te.IndexOf("chunked", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                req.Body = ReadChunked(s, all, end + 4);
            }
            return req;
        }

        // Chunked request bodies (some HTTP clients send these instead of a Content-Length).
        static byte[] ReadChunked(NetworkStream s, byte[] head, int start)
        {
            var pending = new MemoryStream();
            pending.Write(head, start, head.Length - start);
            var body = new MemoryStream();
            var buf = new byte[8192];
            s.ReadTimeout = 60000;
            int pos = 0;
            while (true)
            {
                var data = pending.GetBuffer();
                int len = (int)pending.Length;
                int lineEnd = IndexOf(Slice(data, pos, len), len - pos, new byte[] { 13, 10 });
                if (lineEnd < 0)
                {
                    int n = s.Read(buf, 0, buf.Length);
                    if (n <= 0) throw new IOException("closed");
                    pending.Write(buf, 0, n);
                    continue;
                }
                var sizeText = Encoding.ASCII.GetString(data, pos, lineEnd).Split(';')[0].Trim();
                if (!int.TryParse(sizeText, NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var size) || size < 0) throw new ApiError(400, "errGeneric");
                if (body.Length + size > MaxBody) throw new ApiError(413, "errGeneric");
                int need = pos + lineEnd + 2 + size + 2;
                while (pending.Length < need)
                {
                    int n = s.Read(buf, 0, buf.Length);
                    if (n <= 0) throw new IOException("closed");
                    pending.Write(buf, 0, n);
                }
                data = pending.GetBuffer();
                if (size == 0) return body.ToArray();
                body.Write(data, pos + lineEnd + 2, size);
                pos = need;
            }
        }

        static byte[] Slice(byte[] a, int from, int to)
        {
            var r = new byte[Math.Max(0, to - from)];
            Array.Copy(a, from, r, 0, r.Length);
            return r;
        }

        static int IndexOf(byte[] hay, int len, byte[] needle)
        {
            for (int i = 0; i + needle.Length <= len; i++)
            {
                int k = 0;
                while (k < needle.Length && hay[i + k] == needle[k]) k++;
                if (k == needle.Length) return i;
            }
            return -1;
        }

        static void Write(NetworkStream s, Resp r)
        {
            var body = Encoding.UTF8.GetBytes(Json.Write(r.Body ?? new Dictionary<string, object>()));
            var head = "HTTP/1.1 " + r.Code + " " + Reason(r.Code) + "\r\n" +
                       "Content-Type: application/json; charset=utf-8\r\n" +
                       "Content-Length: " + body.Length + "\r\n" +
                       "Cache-Control: no-store\r\n" +
                       "X-Content-Type-Options: nosniff\r\n" +
                       "Connection: close\r\n\r\n";
            var h = Encoding.ASCII.GetBytes(head);
            s.Write(h, 0, h.Length);
            s.Write(body, 0, body.Length);
            s.Flush();
        }

        static string Reason(int code)
        {
            switch (code)
            {
                case 200: return "OK";
                case 400: return "Bad Request";
                case 401: return "Unauthorized";
                case 403: return "Forbidden";
                case 404: return "Not Found";
                case 409: return "Conflict";
                case 413: return "Payload Too Large";
                case 422: return "Unprocessable Entity";
                case 431: return "Request Header Fields Too Large";
                default: return code >= 500 ? "Server Error" : "Error";
            }
        }

        bool HostOk(Req r)
        {
            if (!r.Headers.TryGetValue("Host", out var host)) return false;
            return host == "127.0.0.1:" + Port || host.Equals("localhost:" + Port, StringComparison.OrdinalIgnoreCase);
        }

        // Userscript managers send no Origin or their own extension origin; a web page always sends its own.
        static bool OriginOk(Req r)
        {
            if (!r.Headers.TryGetValue("Origin", out var o) || o.Length == 0 || o == "null") return true;
            return Regex.IsMatch(o, "^([a-z]+-)?extension://", RegexOptions.IgnoreCase) // chrome-, moz-, safari-web-, edge's extension://
                   || o == "https://www.youtube.com" || o == "https://m.youtube.com";
        }

        bool Authed(Req r) => r.Headers.TryGetValue("X-YDM-Token", out var t) && Settings.Current.TokenValid(t);

        // The YT Standalone Downloader extension; its ID is fixed by the key in extension/manifest.json.
        public const string OwnExtensionId = "cgjpjebkpfjhaedhimgenbemfmgmkmjj";

        static bool FromOwnExtension(Req r) =>
            r.Headers.TryGetValue("Origin", out var o) && Regex.IsMatch(o, "^([a-z]+-)?extension://" + OwnExtensionId + "$", RegexOptions.IgnoreCase);

        void Parse(Req r)
        {
            if (r.Body.Length == 0) { r.Json = new Dictionary<string, object>(); return; }
            try { r.Json = Json.ParseObj(Encoding.UTF8.GetString(r.Body)) ?? throw new FormatException(); }
            catch { throw new ApiError(400, "errGeneric"); }
        }

        async Task<Resp> Route(Req r)
        {
            if (!HostOk(r) || !OriginOk(r)) throw new ApiError(403, "errForbidden");
            if (r.Path != "/v1/playback" && r.Path != "/v1/pip") LastActivity = DateTime.UtcNow; // watching a video alone doesn't keep the app open
            var app = App.Current;
            var jobs = app.Jobs;

            if (r.Method == "GET" && r.Path == "/v1/hello")
            {
                return Ok(new Dictionary<string, object>
                {
                    ["app"] = "ytdm", ["version"] = App.Version, ["api"] = 1, ["port"] = Port,
                    ["paired"] = Authed(r), ["pairing"] = false,
                });
            }
            if (r.Method == "POST" && r.Path == "/v1/pair")
            {
                Parse(r);
                var client = r.Json.Str("client") ?? "Browser";
                if (client.Length > 80) client = client.Substring(0, 80);
                if (app.PairBusy) throw new ApiError(409, "errGeneric"); // another tab is already asking
                bool own = FromOwnExtension(r);
                // Automatic attempts never open a prompt: only our own extension is connected that way.
                if (!own && r.Json.Bool("auto")) throw new ApiError(403, "errDenied");
                var ok = own ? app.AutoPair(client) : await app.RequestPairing(client);
                if (!ok) throw new ApiError(403, "errDenied");
                return Ok(new Dictionary<string, object> { ["token"] = Settings.Current.AddToken(), ["port"] = Port });
            }
            if (!Authed(r)) throw new ApiError(401, "errUnauthorized");

            var m = Regex.Match(r.Path, "^/v1/jobs/([a-z0-9]{6,40})/(pause|resume|cancel|retry|remove|reveal)$");
            if (r.Method == "POST" && m.Success)
            {
                var id = m.Groups[1].Value;
                bool ok;
                if (m.Groups[2].Value != "reveal") Log.Info($"api {m.Groups[2].Value} {id}");
                switch (m.Groups[2].Value)
                {
                    case "pause": ok = jobs.Pause(id); break;
                    case "resume": ok = jobs.Resume(id); break;
                    case "cancel": ok = jobs.Cancel(id); break;
                    case "retry": ok = jobs.Retry(id); break;
                    case "remove": ok = jobs.Remove(id); break;
                    default: ok = app.Reveal(jobs.Find(id)?.File); break;
                }
                if (!ok) throw new ApiError(409, "errGeneric");
                return Ok(new Dictionary<string, object> { ["ok"] = true, ["rev"] = jobs.Rev });
            }

            switch (r.Method + " " + r.Path)
            {
                case "GET /v1/status":
                    return Ok(app.Status());
                case "GET /v1/jobs":
                {
                    long.TryParse(r.Q("since") ?? "0", NumberStyles.Integer, CultureInfo.InvariantCulture, out var since);
                    int.TryParse(r.Q("wait") ?? "0", NumberStyles.Integer, CultureInfo.InvariantCulture, out var wait);
                    wait = Math.Max(0, Math.Min(30, wait));
                    if (wait > 0) await jobs.WaitChange(since, wait * 1000);
                    LastActivity = DateTime.UtcNow;
                    return Ok(new Dictionary<string, object> { ["rev"] = jobs.Rev, ["jobs"] = jobs.Snapshot(), ["status"] = app.Status() });
                }
                case "POST /v1/jobs":
                {
                    Parse(r);
                    var job = BuildJob(r.Json);
                    var (j, dup) = jobs.Add(job, r.Json.Bool("force"));
                    return Ok(new Dictionary<string, object> { ["job"] = j.ToJson(true), ["duplicate"] = dup, ["rev"] = jobs.Rev });
                }
                case "POST /v1/session":
                {
                    // The browser's YouTube sign-in (Netscape cookies), or "not signed in". Memory only.
                    Parse(r);
                    var c = r.Json.Str("cookies") ?? "";
                    if (c.Length > 256 * 1024) throw new ApiError(413, "errGeneric");
                    if (c.Length > 0 && !c.Split('\n').Any(l => l.Split('\t').Length == 7 && l.Split('\t')[0].EndsWith("youtube.com"))) throw new ApiError(400, "errGeneric");
                    Session.Set(c);
                    return Ok(new Dictionary<string, object> { ["ok"] = true });
                }
                case "POST /v1/playback":
                {
                    // A tab reporting its video while downloads run (see Playback and Bandwidth).
                    Parse(r);
                    r.Headers.TryGetValue("X-YDM-Token", out var token);
                    var tab = Clip(r.Json.Str("tab") ?? "", 40);
                    Playback.Set(Rand.Sha256(token) + "|" + tab, r.Json.Bool("playing"), Math.Max(0, Math.Min(3600, r.Json.Num("buffer"))), r.Json.Bool("live"));
                    return Ok(new Dictionary<string, object> { ["shaping"] = Bandwidth.Shaping, ["busy"] = jobs.Busy });
                }
                case "POST /v1/pip":
                {
                    // The extension's Shorts picture-in-picture window opened, changed or closed (see PipSizer).
                    Parse(r);
                    r.Headers.TryGetValue("X-YDM-Token", out var token);
                    if (!PipSizer.Set(r.Json, Rand.Sha256(token) + "|" + Clip(r.Json.Str("tab") ?? "", 40))) throw new ApiError(400, "errGeneric");
                    return Ok(new Dictionary<string, object> { ["ok"] = true });
                }
                case "POST /v1/jobs/clear":
                    return Ok(new Dictionary<string, object> { ["removed"] = jobs.ClearFinished(), ["rev"] = jobs.Rev });
                case "POST /v1/files":
                {
                    Parse(r);
                    var job = BuildFileJob(r.Json);
                    var (j, _) = jobs.Add(job, true);
                    return Ok(new Dictionary<string, object> { ["job"] = j.ToJson(true), ["rev"] = jobs.Rev });
                }
                case "GET /v1/info":
                {
                    // Availability, then the user's own access when YouTube wants a sign-in.
                    var vid = r.Q("v");
                    if (!Media.ValidId(vid)) throw new ApiError(400, "errGeneric");
                    Info info;
                    try
                    {
                        // The browser asks here only after YouTube refused it without a sign-in (newer versions
                        // say so with auth=1): both lookups start at once (see Media.GetInfoFor).
                        // auth=0: the extension's quality list for any video; only YouTube's anonymous answer.
                        info = await Media.GetInfoFor(vid, null, CancellationToken.None, likely: r.Q("auth") != "0");
                    }
                    catch (Fail f) when (Session.Helps.Contains(f.Key) && !Session.Available)
                    {
                        Log.Info($"info {vid}: {f.Key}, no sign-in available");
                        throw new Fail(Session.NoAccount ? "errSignIn" : f.Key, f.Vars);
                    }
                    catch (Fail f)
                    {
                        Log.Info($"info {vid}: {f.Key}");
                        throw;
                    }
                    try
                    {
                        var sum = Media.Summary(info);
                        sum["auth"] = info.Auth;
                        return Ok(sum);
                    }
                    catch (Fail f)
                    {
                        Log.Info($"info {vid}{(info.Auth ? " (signed in)" : "")}: {f.Key}");
                        throw;
                    }
                }
                case "POST /v1/folder/choose":
                {
                    var chosen = await app.ChooseFolder();
                    return Ok(new Dictionary<string, object> { ["canceled"] = chosen == null, ["status"] = app.Status() });
                }
                case "POST /v1/folder/open":
                    return Ok(new Dictionary<string, object> { ["ok"] = app.OpenFolder() });
            }
            throw new ApiError(404, "errGeneric");
        }

        static Resp Ok(object body) => new Resp { Code = 200, Body = body };

        static string Clip(string s, int max) => s == null ? null : s.Length <= max ? s : s.Substring(0, max);

        // Everything from the browser is checked; anything malformed is rejected before it reaches the queue.
        static Job BuildJob(Dictionary<string, object> b)
        {
            var vid = b.Str("vid");
            if (!Media.ValidId(vid)) throw new ApiError(400, "errGeneric");
            var kind = b.Str("kind");
            var key = b.Str("key") ?? "";
            if (!Regex.IsMatch(key, "^[A-Za-z0-9._-]{1,64}$")) throw new ApiError(400, "errGeneric");
            var src = b.Obj("opts") ?? new Dictionary<string, object>();
            var opts = new Dictionary<string, object>();
            // The browser script calls M4A and Opus both "audio"; tell them apart by extension.
            if (kind == "audio") kind = (src.Str("ext") ?? "m4a") == "m4a" ? "m4a" : "opus";
            if (!Kinds.Contains(kind)) throw new ApiError(400, "errGeneric");
            switch (kind)
            {
                case "video":
                    var h = src.Int("height");
                    if (h < 100 || h > 10000) throw new ApiError(400, "errGeneric");
                    opts["height"] = h;
                    break;
                case "mp3":
                    opts["kbps"] = Math.Max(64, Math.Min(320, src.Int("kbps", 320)));
                    break;
                case "thumb":
                    var t = src.Str("thumb") ?? "maxresdefault";
                    if (!Thumbs.Contains(t)) throw new ApiError(400, "errGeneric");
                    opts["thumb"] = t;
                    break;
                case "subs":
                    var lang = src.Str("lang") ?? "";
                    var sf = src.Str("subFormat") ?? "srt";
                    if (!Regex.IsMatch(lang, "^[A-Za-z0-9._-]{1,32}$") || !SubFormats.Contains(sf)) throw new ApiError(400, "errGeneric");
                    opts["lang"] = lang;
                    opts["auto"] = src.Bool("auto");
                    opts["subFormat"] = sf;
                    break;
            }
            if (src.Bool("auth")) opts["auth"] = true; // only available to the signed-in user
            var trim = src.Obj("trim");
            string trimKey = "";
            if (trim != null && kind != "thumb" && kind != "subs")
            {
                double s = trim.Num("start", -1), e = trim.Num("end", -1);
                if (s < 0 || e <= s || e > 86400 || e - s < 0.5) throw new ApiError(400, "errGeneric");
                opts["trim"] = new Dictionary<string, object> { ["start"] = Math.Round(s, 3), ["end"] = Math.Round(e, 3) };
                trimKey = s.Inv() + "-" + e.Inv();
            }
            return new Job
            {
                Id = Rand.Id(), Vid = vid, Kind = kind, Key = key, Opts = opts, At = Time.Now,
                Title = Clip(b.Str("title"), 400), Author = Clip(b.Str("author"), 200),
                Format = Clip(b.Str("format"), 16), Quality = Clip(b.Str("quality"), 32),
                Dedupe = string.Join("|", vid, key, trimKey, opts.Str("subFormat") ?? ""),
            };
        }

        // Files the browser made itself (screenshots) are saved to the same folder through the queue.
        static Job BuildFileJob(Dictionary<string, object> b)
        {
            var name = b.Str("name") ?? "";
            var ext = Path.GetExtension(name).TrimStart('.').ToLowerInvariant();
            if (ext != "png" && ext != "jpg" && ext != "jpeg" && ext != "webp") throw new ApiError(400, "errGeneric");
            byte[] data;
            try { data = Convert.FromBase64String(b.Str("data") ?? ""); }
            catch { throw new ApiError(400, "errGeneric"); }
            if (data.Length == 0 || data.Length > 25 * 1024 * 1024) throw new ApiError(400, "errGeneric");
            var vid = b.Str("vid");
            var j = new Job
            {
                Id = Rand.Id(), Vid = Media.ValidId(vid) ? vid : "", Kind = "file", Key = "file", At = Time.Now,
                Title = Clip(b.Str("title"), 400), Author = Clip(b.Str("author"), 200), Format = Clip(b.Str("format"), 16) ?? ext.ToUpperInvariant(),
                Quality = Clip(b.Str("quality"), 32), Opts = new Dictionary<string, object> { ["name"] = Clip(name, 200), ["ext"] = ext },
            };
            j.Dedupe = "file|" + j.Id;
            Directory.CreateDirectory(j.Work);
            File.WriteAllBytes(Path.Combine(j.Work, "file." + ext), data);
            return j;
        }
    }
}
