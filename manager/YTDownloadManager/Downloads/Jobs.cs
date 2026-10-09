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
    sealed class StreamPart
    {
        public string Role, FormatId, Ext, Codec, File, Fp;
        public long Size;
        public bool Done;
        public int Seg;     // HLS: segments complete in the partial file
        public long SegAt;  // HLS: the partial file's length after them

        public Dictionary<string, object> ToJson() => new Dictionary<string, object>
        {
            ["role"] = Role, ["formatId"] = FormatId, ["ext"] = Ext, ["codec"] = Codec, ["file"] = File, ["size"] = Size, ["done"] = Done, ["fp"] = Fp,
            ["seg"] = Seg, ["segAt"] = SegAt,
        };

        public static StreamPart From(Dictionary<string, object> d) => new StreamPart
        {
            Role = d.Str("role"), FormatId = d.Str("formatId"), Ext = d.Str("ext"), Codec = d.Str("codec"), File = d.Str("file"),
            Size = d.Long("size"), Done = d.Bool("done"), Fp = d.Str("fp"), Seg = d.Int("seg"), SegAt = d.Long("segAt"),
        };
    }

    sealed class Job
    {
        public string Id, Vid, Title, Author, Kind, Key, Format, Quality, Dedupe;
        public Dictionary<string, object> Opts = new Dictionary<string, object>();
        public string Status = "queued", Detail, Notice;
        public double Pct, Speed, Eta;
        public long Got, Total;
        public bool Indet;
        public string ErrKey, ErrText;
        public Dictionary<string, object> ErrVars;
        public string File;
        public long Size, At, FinishedAt;
        public List<StreamPart> Streams;
        public int Refreshes;
        public bool Updated;

        // Runtime only.
        public CancellationTokenSource Cts;
        public string Stop;
        public bool Running;
        public bool Shaping; // slowed down so a video playing in the browser keeps its buffer
        public long LastTouch;

        public string Work => Path.Combine(Paths.Work, Id);
        public bool Finished => Status == "completed" || Status == "failed" || Status == "canceled";
        public bool Busy => Running || Status == "queued";

        public Dictionary<string, object> ToJson(bool api)
        {
            var d = new Dictionary<string, object>
            {
                ["id"] = Id, ["vid"] = Vid, ["title"] = Title, ["author"] = Author, ["kind"] = Kind, ["key"] = Key,
                ["format"] = Format, ["quality"] = Quality, ["opts"] = Opts, ["status"] = Status, ["at"] = At,
                ["finishedAt"] = FinishedAt, ["file"] = File, ["size"] = Size, ["dedupe"] = Dedupe,
            };
            if (ErrKey != null) d["err"] = new Dictionary<string, object> { ["key"] = ErrKey, ["vars"] = ErrVars, ["text"] = ErrText };
            if (api)
            {
                d["detail"] = Detail;
                d["notice"] = Notice;
                d["pct"] = Math.Round(Pct, 1);
                d["got"] = Got;
                d["total"] = Total;
                d["speed"] = Math.Round(Speed);
                d["eta"] = Eta >= 0 ? Math.Round(Eta) : -1;
                d["indet"] = Indet;
                d["shaping"] = Shaping && Status == "downloading";
                if (File != null)
                {
                    d["fileName"] = Path.GetFileName(File);
                    d["folder"] = Path.GetDirectoryName(File);
                    d["exists"] = System.IO.File.Exists(File);
                }
            }
            else
            {
                d["streams"] = Streams?.Select(s => (object)s.ToJson()).ToArray();
                d["refreshes"] = Refreshes;
                d["pct"] = Pct;
                d["got"] = Got;
                d["total"] = Total;
            }
            return d;
        }

        public static Job From(Dictionary<string, object> d)
        {
            var j = new Job
            {
                Id = d.Str("id"), Vid = d.Str("vid"), Title = d.Str("title"), Author = d.Str("author"), Kind = d.Str("kind"),
                Key = d.Str("key"), Format = d.Str("format"), Quality = d.Str("quality"), Dedupe = d.Str("dedupe"),
                Opts = d.Obj("opts") ?? new Dictionary<string, object>(), Status = d.Str("status") ?? "failed",
                At = d.Long("at"), FinishedAt = d.Long("finishedAt"), File = d.Str("file"), Size = d.Long("size"),
                Refreshes = d.Int("refreshes"), Pct = d.Num("pct"), Got = d.Long("got"), Total = d.Long("total"),
            };
            var err = d.Obj("err");
            if (err != null)
            {
                j.ErrKey = err.Str("key");
                j.ErrText = err.Str("text");
                j.ErrVars = err.Obj("vars");
            }
            var streams = d.Arr("streams");
            if (streams != null) j.Streams = streams.OfType<Dictionary<string, object>>().Select(StreamPart.From).ToList();
            return j;
        }
    }

    static class Folders
    {
        // ok | missing (drive or folder not there) | readonly (can't write) | invalid
        public static string Check(string folder, bool create)
        {
            if (string.IsNullOrWhiteSpace(folder)) return "invalid";
            try
            {
                var full = Path.GetFullPath(folder);
                var root = Path.GetPathRoot(full);
                if (string.IsNullOrEmpty(root) || !Directory.Exists(root)) return "missing";
                if (!Directory.Exists(full))
                {
                    if (!create) return "missing";
                    var parent = Path.GetDirectoryName(full);
                    // Recreate a deleted folder, but don't build a whole path on a different disk that took the old letter.
                    if (parent != null && !Directory.Exists(parent) && !string.Equals(parent.TrimEnd('\\'), root.TrimEnd('\\'), StringComparison.OrdinalIgnoreCase)
                        && !full.StartsWith(Paths.KnownDownloads(), StringComparison.OrdinalIgnoreCase)) return "missing";
                    Directory.CreateDirectory(full);
                }
                var test = Path.Combine(full, ".ydm-write-test-" + Rand.Token(4) + ".tmp");
                System.IO.File.WriteAllBytes(test, new byte[] { 1 });
                System.IO.File.Delete(test);
                return "ok";
            }
            catch (UnauthorizedAccessException) { return "readonly"; }
            catch (System.Security.SecurityException) { return "readonly"; }
            catch (IOException e) when (e is DirectoryNotFoundException || e is DriveNotFoundException) { return "missing"; }
            catch (IOException) { return "readonly"; }
            catch { return "invalid"; }
        }
    }

    // The download queue: persistent, resumable, at most two downloads at a time.
    sealed partial class JobManager
    {
        readonly object L = new object();
        readonly object saveLock = new object(); // one writer at a time for jobs.json
        readonly List<Job> jobs = new List<Job>();
        readonly List<TaskCompletionSource<bool>> waiters = new List<TaskCompletionSource<bool>>();
        const int MaxActive = 2;
        Timer saveTimer;
        public long Rev { get; private set; } = 1;
        public event Action Changed;

        const string YdmpTemplate = "download:YDMP %(progress.downloaded_bytes)s %(progress.total_bytes)s %(progress.total_bytes_estimate)s %(progress.speed)s %(progress.eta)s";

        // ---------- state ----------

        public void Load()
        {
            try
            {
                if (System.IO.File.Exists(Paths.JobsFile))
                {
                    var arr = Json.Parse(System.IO.File.ReadAllText(Paths.JobsFile)) as object[] ?? new object[0];
                    foreach (var o in arr.OfType<Dictionary<string, object>>())
                    {
                        var j = Job.From(o);
                        if (j.Id == null || j.Kind == null) continue;
                        // Interrupted by a crash or a restart: continue where it stopped.
                        if (j.Status == "downloading" || j.Status == "processing") j.Status = "queued";
                        jobs.Add(j);
                    }
                }
            }
            catch (Exception e) { Log.Error("jobs load", e); }
            Cleanup();
        }

        // Removes work files nothing refers to any more, and partial data of downloads that failed long ago.
        void Cleanup()
        {
            try
            {
                var keep = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "_info" };
                lock (L)
                {
                    foreach (var j in jobs)
                    {
                        if (j.Status == "failed" && Time.Now - j.FinishedAt > 24 * 3600 * 1000) j.Streams = null;
                        if (!j.Finished || (j.Status == "failed" && j.Streams != null)) keep.Add(j.Id);
                    }
                }
                foreach (var dir in Directory.GetDirectories(Paths.Work))
                    if (!keep.Contains(Path.GetFileName(dir))) Files.DeleteDir(dir);
                foreach (var f in Directory.GetFiles(Paths.InfoDir))
                    if (DateTime.UtcNow - System.IO.File.GetLastWriteTimeUtc(f) > TimeSpan.FromDays(1)) Files.TryDelete(f);
            }
            catch (Exception e) { Log.Warn("cleanup: " + e.Message); }
        }

        public void Save()
        {
            List<object> data;
            lock (L)
            {
                // Keep the list bounded: drop the oldest finished entries.
                var finished = jobs.Where(j => j.Finished).OrderByDescending(j => j.At).Skip(300).ToList();
                foreach (var j in finished) jobs.Remove(j);
                data = jobs.Select(j => (object)j.ToJson(false)).ToList();
            }
            try
            {
                var text = Json.Write(data);
                lock (saveLock) Files.WriteAtomic(Paths.JobsFile, text);
            }
            catch (Exception e) { Log.Error("jobs save", e); }
        }

        void SaveSoon()
        {
            lock (L)
            {
                if (saveTimer != null) return;
                saveTimer = new Timer(_ =>
                {
                    lock (L)
                    {
                        saveTimer?.Dispose();
                        saveTimer = null;
                    }
                    Save();
                }, null, 1500, Timeout.Infinite);
            }
        }

        void Touch(bool persist)
        {
            List<TaskCompletionSource<bool>> w;
            lock (L)
            {
                Rev++;
                w = waiters.ToList();
                waiters.Clear();
            }
            foreach (var t in w) t.TrySetResult(true);
            if (persist) SaveSoon();
            try { Changed?.Invoke(); } catch { }
        }

        // Something the browsers show besides the queue changed (the download folder): wake their long-polls.
        public void Notify() => Touch(false);

        // Progress updates are frequent: tell waiting clients at most four times a second, don't write to disk.
        void Progress(Job j)
        {
            var now = Time.Now;
            if (now - j.LastTouch < 250) return;
            j.LastTouch = now;
            Touch(false);
        }

        public Task WaitChange(long since, int ms)
        {
            TaskCompletionSource<bool> tcs;
            lock (L)
            {
                if (Rev > since) return Task.CompletedTask;
                tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
                waiters.Add(tcs);
            }
            return Task.WhenAny(tcs.Task, Task.Delay(ms)).ContinueWith(_ => { lock (L) waiters.Remove(tcs); });
        }

        public List<object> Snapshot()
        {
            lock (L) return jobs.OrderByDescending(j => j.At).Select(j => (object)j.ToJson(true)).ToList();
        }

        public Job Find(string id)
        {
            lock (L) return jobs.FirstOrDefault(j => j.Id == id);
        }

        public bool HasQueued
        {
            get { lock (L) return jobs.Any(j => j.Status == "queued"); }
        }

        public bool Busy
        {
            get { lock (L) return jobs.Any(j => j.Busy); }
        }

        public int ActiveCount
        {
            get { lock (L) return jobs.Count(j => j.Busy); }
        }

        // ---------- commands ----------

        // Returns the new job, or the existing one plus "active" / "done" when it's a repeat.
        public (Job job, string dup) Add(Job j, bool force)
        {
            lock (L)
            {
                var active = jobs.FirstOrDefault(x => x.Dedupe == j.Dedupe && !x.Finished);
                if (active != null) return (active, "active");
                var done = jobs.Where(x => x.Dedupe == j.Dedupe && x.Status == "completed" && x.File != null && System.IO.File.Exists(x.File)).OrderByDescending(x => x.At).FirstOrDefault();
                if (done != null && !force) return (done, "done");
                jobs.Add(j);
            }
            Touch(true);
            Pump();
            return (j, null);
        }

        public bool Pause(string id)
        {
            var j = Find(id);
            if (j == null) return false;
            lock (L)
            {
                if (j.Running)
                {
                    j.Stop = "pause";
                    j.Cts?.Cancel();
                }
                else if (j.Status == "queued") j.Status = "paused";
                else return false;
            }
            Touch(true);
            return true;
        }

        public bool Resume(string id)
        {
            var j = Find(id);
            if (j == null) return false;
            lock (L)
            {
                if (j.Status != "paused") return false;
                j.Status = "queued";
                j.Notice = null;
            }
            Touch(true);
            Pump();
            return true;
        }

        public bool Cancel(string id)
        {
            var j = Find(id);
            if (j == null) return false;
            lock (L)
            {
                if (j.Running)
                {
                    j.Stop = "cancel";
                    j.Cts?.Cancel();
                    return true;
                }
                if (j.Status == "completed" || j.Status == "canceled") return false;
                MarkCanceled(j);
            }
            Files.DeleteDir(j.Work);
            Touch(true);
            return true;
        }

        void MarkCanceled(Job j)
        {
            j.Status = "canceled";
            j.FinishedAt = Time.Now;
            j.Streams = null;
            j.Notice = null;
            j.Speed = 0;
            j.Pct = 0;
            j.Got = 0;
        }

        public bool Retry(string id)
        {
            var j = Find(id);
            if (j == null) return false;
            lock (L)
            {
                if (j.Status != "failed" && j.Status != "canceled") return false;
                j.Status = "queued";
                j.ErrKey = j.ErrText = null;
                j.ErrVars = null;
                j.Refreshes = 0;
                j.Updated = false;
                j.Notice = null;
                j.FinishedAt = 0;
            }
            Touch(true);
            Pump();
            return true;
        }

        public bool Remove(string id)
        {
            var j = Find(id);
            if (j == null) return false;
            lock (L)
            {
                if (j.Running)
                {
                    j.Stop = "remove";
                    j.Cts?.Cancel();
                    return true;
                }
                jobs.Remove(j);
            }
            Files.DeleteDir(j.Work);
            Touch(true);
            return true;
        }

        public int ClearFinished()
        {
            List<Job> gone;
            lock (L)
            {
                gone = jobs.Where(j => j.Finished && !j.Running).ToList();
                foreach (var j in gone) jobs.Remove(j);
            }
            foreach (var j in gone) Files.DeleteDir(j.Work);
            Touch(true);
            return gone.Count;
        }

        public void Pump()
        {
            if (App.Current?.Preparing == true) return; // the tools are still being fetched; jobs wait
            var start = new List<Job>();
            lock (L)
            {
                int running = jobs.Count(j => j.Running);
                foreach (var j in jobs.Where(x => x.Status == "queued" && !x.Running).OrderBy(x => x.At))
                {
                    if (running >= MaxActive) break;
                    j.Running = true;
                    running++;
                    start.Add(j);
                }
            }
            foreach (var j in start) Task.Run(() => Run(j));
        }

        // Stops running downloads so they continue on the next start (manager closing).
        public void Shutdown()
        {
            lock (L)
            {
                foreach (var j in jobs.Where(x => x.Running))
                {
                    j.Stop = "shutdown";
                    j.Cts?.Cancel();
                }
            }
            var until = DateTime.UtcNow.AddSeconds(5);
            while (DateTime.UtcNow < until)
            {
                lock (L) if (!jobs.Any(x => x.Running)) break;
                Thread.Sleep(100);
            }
            lock (L)
            {
                foreach (var j in jobs.Where(x => x.Running || x.Status == "downloading" || x.Status == "processing")) j.Status = "queued";
            }
            Save();
        }

        // ---------- pipeline ----------

        void Set(Job j, string status = null, string detail = null, bool? indet = null)
        {
            lock (L)
            {
                if (status != null) j.Status = status;
                if (detail != null) j.Detail = detail;
                if (indet.HasValue) j.Indet = indet.Value;
            }
            Touch(status != null);
        }

        void SetNotice(Job j, string notice)
        {
            lock (L)
            {
                if (j.Notice == notice) return;
                j.Notice = notice;
                if (notice != null) j.Speed = 0;
            }
            Touch(false);
        }

        async Task Run(Job j)
        {
            var cts = new CancellationTokenSource();
            lock (L)
            {
                j.Cts = cts;
                j.Stop = null;
                j.Status = "downloading";
                j.Detail = "starting";
                j.Notice = null;
                j.Speed = 0;
                j.Eta = -1;
                j.Shaping = false;
                j.ErrKey = j.ErrText = null;
            }
            Touch(true);
            try
            {
                Directory.CreateDirectory(j.Work);
                var dest = await Pipeline(j, cts.Token);
                lock (L)
                {
                    j.Status = "completed";
                    j.File = dest;
                    j.Size = new FileInfo(dest).Length;
                    j.FinishedAt = Time.Now;
                    j.Pct = 100;
                    j.Got = j.Total = j.Size;
                    j.Notice = j.Detail = null;
                    j.Indet = false;
                    j.Streams = null;
                }
                Save(); // at once: a job that ran again after a crash here would save the file twice
                Files.DeleteDir(j.Work);
                Log.Info($"job {j.Id} completed: {dest}");
            }
            catch (Exception e) when (cts.IsCancellationRequested)
            {
                string stop;
                lock (L) stop = j.Stop;
                Log.Info($"job {j.Id} stopped ({stop ?? "cancel"}) {(e is OperationCanceledException ? "" : e.Message)}");
                switch (stop)
                {
                    case "pause":
                        lock (L) { j.Status = "paused"; j.Notice = null; j.Speed = 0; }
                        break;
                    case "shutdown":
                        lock (L) { j.Status = "queued"; j.Notice = null; }
                        break;
                    case "remove":
                        lock (L) jobs.Remove(j);
                        Files.DeleteDir(j.Work);
                        break;
                    default:
                        lock (L) MarkCanceled(j);
                        Files.DeleteDir(j.Work);
                        break;
                }
            }
            catch (Fail f)
            {
                FailJob(j, f.Key, f.Vars);
            }
            catch (Exception e)
            {
                Log.Error($"job {j.Id} crashed", e);
                FailJob(j, "errGeneric", null);
            }
            finally
            {
                lock (L)
                {
                    j.Running = false;
                    j.Cts = null;
                }
                cts.Dispose();
                Touch(!j.Finished);
                if (j.Finished) Save();
                Pump();
            }
        }

        void FailJob(Job j, string key, Dictionary<string, object> vars)
        {
            Log.Warn($"job {j.Id} failed: {key} {Errors.Text(key, vars)}");
            lock (L)
            {
                j.Status = "failed";
                j.ErrKey = key;
                j.ErrVars = vars;
                j.ErrText = Errors.Text(key, vars);
                j.FinishedAt = Time.Now;
                j.Notice = null;
                j.Speed = 0;
                if (Errors.Final.Contains(key)) j.Streams = null;
            }
            // Partial data stays for Retry, unless retrying can't help.
            if (Errors.Final.Contains(key)) Files.DeleteDir(j.Work);
        }

        Task<string> Pipeline(Job j, CancellationToken ct)
        {
            switch (j.Kind)
            {
                case "thumb": return RunThumb(j, ct);
                case "subs": return RunSubs(j, ct);
                case "file": return Deliver(j, Directory.GetFiles(j.Work, "file.*").FirstOrDefault() ?? throw new Fail("errGeneric"), j.Opts.Str("ext") ?? "png", ct);
                default: return RunMedia(j, ct);
            }
        }

        // ---------- signed-in access ----------

        static bool Auth(Job j) => j.Opts.Bool("auth");

        Task<Info> InfoFor(Job j, bool force, CancellationToken ct, int variant = -1) => Media.GetInfo(j.Vid, force, ct, variant, Auth(j));

        // Availability first, then the user's own access. A video YouTube only shows to eligible
        // signed-in accounts (age restricted, members only) continues as the signed-in user: the job
        // remembers that, and waits for the browser to hand over the sign-in when the app doesn't have it.
        async Task<Info> CheckAccess(Job j, CancellationToken ct)
        {
            Info info;
            if (Auth(j)) info = await SignedInInfo(j, ct);
            else
            {
                try
                {
                    info = await InfoFor(j, false, ct);
                }
                catch (Fail f) when (Session.Helps.Contains(f.Key))
                {
                    Log.Info($"job {j.Id}: {f.Key} without a sign-in, continuing as the signed-in user");
                    lock (L) j.Opts["auth"] = true;
                    SaveSoon();
                    info = await SignedInInfo(j, ct);
                }
            }
            Log.Info($"job {j.Id}: access {(info.Auth ? "as the signed-in user" : "without a sign-in")} ok");
            return info;
        }

        // A sign-in YouTube has since replaced in the browser is dropped; the job waits for a fresh one once.
        async Task<Info> SignedInInfo(Job j, CancellationToken ct)
        {
            await WaitSession(j, ct);
            try
            {
                return await InfoFor(j, false, ct);
            }
            catch (Fail f) when (f.Key == "errSessionExpired")
            {
                await WaitSession(j, ct);
                return await InfoFor(j, false, ct);
            }
        }

        async Task WaitSession(Job j, CancellationToken ct)
        {
            if (Session.Available) return;
            Session.Want(true);
            try
            {
                SetNotice(j, "waitingSession");
                var until = Time.Now + 10 * 60 * 1000;
                while (!Session.Available)
                {
                    if (Session.NoAccount || Time.Now > until) throw new Fail("errSignIn");
                    await Task.Delay(1000, ct);
                }
            }
            finally
            {
                Session.Want(false);
            }
            SetNotice(j, null);
        }

        async Task<string> RunMedia(Job j, CancellationToken ct)
        {
            if (!Components.Ready) throw new Fail("errEngineMissing");
            await WaitOnline(j, ct);
            var info = await CheckAccess(j, ct);
            if (info.Live) throw new Fail("errLive");
            lock (L)
            {
                if (string.IsNullOrEmpty(j.Title)) j.Title = info.Title;
                if (string.IsNullOrEmpty(j.Author)) j.Author = info.Uploader;
            }
            // A file that turns out damaged (or can't be converted) is downloaded once more from scratch
            // before the download is reported as failed.
            for (int pass = 1; ; pass++)
            {
                try
                {
                    var outFile = await DownloadAndProcess(j, info, ct);
                    return await Deliver(j, outFile, Media.OutputExt(j), ct);
                }
                catch (Fail f) when ((f.Key == "errVerify" || f.Key == "errConvert") && pass == 1)
                {
                    Log.Warn($"job {j.Id}: {f.Key}, downloading the streams again");
                    List<StreamPart> old;
                    lock (L)
                    {
                        old = j.Streams;
                        j.Streams = null;
                    }
                    foreach (var p in old ?? new List<StreamPart>()) Files.TryDelete(p.File);
                    info = await InfoFor(j, true, ct);
                }
                catch (Fail f) when (f.Key == "errVerify")
                {
                    lock (L) j.Streams = null; // a Retry starts these streams from scratch
                    throw;
                }
            }
        }

        async Task<string> DownloadAndProcess(Job j, Info info, CancellationToken ct)
        {
            Set(j, status: "downloading");
            if (j.Streams == null || j.Streams.Count == 0)
            {
                var plan = Media.Plan(j, info);
                lock (L) j.Streams = plan;
                SaveSoon();
            }

            var remaining = j.Streams.Where(s => !s.Done).Sum(s => Math.Max(0, s.Size));
            if (remaining > 0 && Files.FreeSpace(Paths.Work) < remaining * 11 / 10 + 64L * 1024 * 1024) throw new Fail("errDiskFull");

            foreach (var s in j.Streams.ToList())
            {
                if (s.Done && s.File != null && System.IO.File.Exists(s.File)) continue;
                s.Done = false;
                await DownloadStream(j, s, ct);
            }

            var trim = j.Opts.Obj("trim");
            double duration = trim != null ? trim.Num("end") - trim.Num("start") : info.Duration;
            lock (L)
            {
                j.Status = "processing";
                j.Detail = j.Kind == "video" ? "merging" : "converting";
                j.Pct = 0;
                j.Indet = false;
                j.Speed = 0;
                j.Notice = null;
            }
            Touch(true);
            var outFile = await Media.Process(j, j.Streams, duration, p =>
            {
                lock (L) j.Pct = p * 100;
                Progress(j);
            }, ct);
            Set(j, detail: "verifying", indet: true);
            try
            {
                await Media.Verify(j, outFile, duration, ct);
            }
            catch (Fail f) when (f.Key == "errVerify")
            {
                Files.TryDelete(outFile);
                throw;
            }
            return outFile;
        }

        async Task DownloadStream(Job j, StreamPart s, CancellationToken ct)
        {
            var trim = j.Opts.Obj("trim");
            long before = j.Streams.Where(x => x.Done && x != s).Sum(x => x.Size);
            Set(j, detail: j.Kind != "video" ? "downloading" : s.Role == "audio" ? "downloadingAudio" : "downloadingVideo", indet: trim != null);
            if (trim == null)
            {
                var f = Media.Match(await InfoFor(j, false, ct), s);
                if (f != null && (f.Http || f.Hls) && !string.IsNullOrEmpty(f.Url))
                {
                    try
                    {
                        if (f.Hls) await FetchHls(j, s, before, ct);
                        else await FetchStream(j, s, before, ct);
                        return;
                    }
                    catch (Exception e) when (!(e is Fail) && !ct.IsCancellationRequested)
                    {
                        // Something the own downloader doesn't know how to handle: let yt-dlp try the same stream.
                        Log.Warn($"job {j.Id}: {s.Role} download failed ({e.GetType().Name}: {e.Message}), trying yt-dlp");
                        lock (L) j.Shaping = false;
                    }
                }
            }
            await RunYt(j, info =>
            {
                var f = Media.Match(info, s) ?? throw new Fail("errFormatGone");
                lock (L) s.FormatId = f.Id;
                var a = new List<string>
                {
                    "--load-info-json", info.Path, "-f", s.FormatId, "-o", Path.Combine(j.Work, s.Role + ".%(ext)s"),
                    "--newline", "--progress-template", YdmpTemplate, "--concurrent-fragments", "6",
                };
                if (trim != null)
                {
                    a.AddRange(new[] { "--download-sections", "*" + trim.Num("start").Inv() + "-" + trim.Num("end").Inv() });
                    if (s.Role != "audio") a.Add("--force-keyframes-at-cuts"); // exact cut for video, re-encoding only around it
                }
                return a;
            }, line => OnProgress(j, s, before, line), ct, i => Media.Match(i, s) != null, signIn: false);
            var file = FindOutput(j.Work, s.Role) ?? throw new Fail("errGeneric");
            lock (L)
            {
                s.File = file;
                s.Done = true;
                s.Size = new FileInfo(file).Length;
            }
            SaveSoon();
        }

        static string FindOutput(string dir, string role)
        {
            return Directory.GetFiles(dir, role + ".*")
                .Where(f =>
                {
                    var e = Path.GetExtension(f).ToLowerInvariant();
                    return e != ".part" && e != ".ytdl" && e != ".temp" && e != ".tmp" && e != ".json" && f.IndexOf(".part-Frag", StringComparison.OrdinalIgnoreCase) < 0;
                })
                .OrderByDescending(f => new FileInfo(f).Length)
                .FirstOrDefault();
        }

        void OnProgress(Job j, StreamPart s, long before, string line)
        {
            if (!line.StartsWith("YDMP ", StringComparison.Ordinal)) return;
            var p = line.Split(' ');
            if (p.Length < 6) return;
            long Lng(string x) => long.TryParse(x.Split('.')[0], NumberStyles.Integer, CultureInfo.InvariantCulture, out var v) ? v : 0;
            double Dbl(string x) => double.TryParse(x, NumberStyles.Float, CultureInfo.InvariantCulture, out var v) ? v : 0;
            long total = Lng(p[2]);
            if (total <= 0) total = Lng(p[3]);
            StreamProgress(j, s, before, Lng(p[1]), total, Dbl(p[4]));
        }

        void StreamProgress(Job j, StreamPart s, long before, long got, long total, double speed)
        {
            lock (L)
            {
                if (s.Size <= 0 && total > 0) s.Size = total;
                long streamTotal = s.Size > 0 ? s.Size : total;
                j.Got = before + got;
                j.Total = j.Streams.Sum(x => x == s ? Math.Max(streamTotal, got) : Math.Max(0, x.Size));
                j.Speed = speed;
                j.Indet = j.Total <= 0;
                j.Pct = j.Total > 0 ? Math.Min(99.9, j.Got * 100.0 / j.Total) : 0;
                j.Eta = speed > 0 && j.Total > 0 ? (j.Total - j.Got) / speed : -1;
                if (j.Notice == "reconnecting" || j.Notice == "refreshingLink") j.Notice = null;
            }
            Progress(j);
        }

        static TimeSpan Backoff(int n, bool rateLimited)
        {
            var baseSec = rateLimited ? Math.Min(300, 30 * (1 << Math.Min(4, n - 1))) : Math.Min(60, 1 << Math.Min(6, n));
            return TimeSpan.FromMilliseconds(baseSec * 1000 + new Random().Next(0, 1000));
        }

        async Task WaitOnline(Job j, CancellationToken ct)
        {
            if (Net.Online) return;
            SetNotice(j, "waitingOnline");
            while (!Net.Online) await Task.Delay(3000, ct);
            SetNotice(j, null);
        }

        // Runs yt-dlp until it succeeds. Recovers on its own from expired or refused links (fresh links,
        // then resume), dropped connections (bounded retries with growing pauses), going offline (waits)
        // and an outdated yt-dlp (one self-update). Stops at once on failures retrying can't fix.
        // `signIn`: the run itself talks to YouTube (subtitles). Streams come from the saved answer's links
        // on googlevideo, which never need the sign-in, so their runs don't get it.
        async Task RunYt(Job j, Func<Info, List<string>> makeArgs, Action<string> onLine, CancellationToken ct, Func<Info, bool> usable = null, bool signIn = true)
        {
            int transient = 0, unknown = 0;
            while (true)
            {
                ct.ThrowIfCancellationRequested();
                await WaitOnline(j, ct);
                var info = await InfoFor(j, false, ct);
                var args = Components.YtArgs();
                args.AddRange(makeArgs(info));
                (int code, string stdout, string stderr, bool killed) r;
                using (var cookies = CookieFile.For(signIn && Auth(j)))
                {
                    if (cookies != null) args.InsertRange(0, cookies.Args);
                    r = await Proc.Run(Components.YtDlp.Exe, Components.YtDlp.With(args), ct, 0, onLine, keepOut: false);
                }
                ct.ThrowIfCancellationRequested();
                if (r.code == 0)
                {
                    Media.Worked(info);
                    SetNotice(j, null);
                    return;
                }
                var c = Errors.Classify(r.stderr);
                var tail = (r.stderr ?? "").Trim();
                if (tail.Length > 600) tail = tail.Substring(tail.Length - 600);
                Log.Warn($"job {j.Id}: {c.cls} {(c.cls == Cls.Unknown ? string.Join(" | ", tail.Split(new[] { (char)13, (char)10 }, StringSplitOptions.RemoveEmptyEntries)) : Errors.LastError(r.stderr))}");
                switch (c.cls)
                {
                    case Cls.Expired:
                        if (++j.Refreshes > 5) throw new Fail("errBlocked");
                        SetNotice(j, "refreshingLink");
                        // Links fetched moments ago and still refused: ask YouTube the next way.
                        var fresh = Time.Now - info.FetchedAt < 90000;
                        await Media.Relink(j.Vid, info, fresh, usable, ct);
                        break;
                    case Cls.Transient:
                    case Cls.RateLimited:
                        if (!Net.Online) break;
                        if (++transient > 6) throw new Fail("errNetwork");
                        SetNotice(j, "reconnecting");
                        await Task.Delay(Backoff(transient, c.cls == Cls.RateLimited), ct);
                        break;
                    case Cls.Broken:
                        if (!j.Updated && Components.YtDlp.Managed)
                        {
                            j.Updated = true;
                            SetNotice(j, "updatingEngine");
                            await Components.UpdateYtDlp(ct);
                            await InfoFor(j, true, ct);
                            break;
                        }
                        if (++unknown > 1) throw new Fail("errEngine");
                        await Task.Delay(3000, ct);
                        await InfoFor(j, true, ct);
                        break;
                    case Cls.Permanent:
                        throw new Fail(Auth(j) ? Session.AsAccountError(c.key) : c.key, c.vars);
                    default:
                        if (++unknown > 1) throw new Fail("errGeneric");
                        await Task.Delay(3000, ct);
                        await InfoFor(j, true, ct);
                        break;
                }
            }
        }

        // oardefault: a Short's picture in its own (portrait) format; the others are landscape.
        static readonly string[] ThumbOrder = { "oardefault", "maxresdefault", "sddefault", "hqdefault", "mqdefault" };
        static readonly Dictionary<string, string> ThumbRes = new Dictionary<string, string>
        {
            ["oardefault"] = "1080x1920", ["maxresdefault"] = "1280x720", ["sddefault"] = "640x480", ["hqdefault"] = "480x360", ["mqdefault"] = "320x180",
        };

        // The file is named after the video: look the title up when the request didn't bring it.
        async Task EnsureTitle(Job j, CancellationToken ct)
        {
            if (!string.IsNullOrEmpty(j.Title) || !Components.Ready) return;
            try
            {
                var info = await InfoFor(j, false, ct);
                lock (L)
                {
                    j.Title = info.Title;
                    if (string.IsNullOrEmpty(j.Author)) j.Author = info.Uploader;
                }
            }
            catch (Exception e) when (!ct.IsCancellationRequested) { Log.Warn($"job {j.Id}: no title: {e.Message}"); }
        }

        async Task<string> RunThumb(Job j, CancellationToken ct)
        {
            Set(j, detail: "fetchingImage", indet: true);
            await EnsureTitle(j, ct);
            var want = j.Opts.Str("thumb") ?? "maxresdefault";
            foreach (var k in ThumbOrder.Skip(Math.Max(0, Array.IndexOf(ThumbOrder, want))))
            {
                byte[] b = null;
                for (int attempt = 1; ; attempt++)
                {
                    await WaitOnline(j, ct);
                    try
                    {
                        b = await Net.GetBytes($"https://i.ytimg.com/vi/{j.Vid}/{k}.jpg", ct);
                        break;
                    }
                    catch (Exception e) when (!ct.IsCancellationRequested)
                    {
                        Log.Warn("thumb: " + e.Message);
                        if (attempt >= 5) throw new Fail("errNetwork");
                        SetNotice(j, "reconnecting");
                        await Task.Delay(Backoff(attempt, false), ct);
                    }
                }
                SetNotice(j, null);
                if (b == null || b.Length < 1500) continue;
                if (k != want)
                {
                    lock (L)
                    {
                        j.Opts["thumb"] = k;
                        j.Quality = ThumbRes[k];
                    }
                }
                var p = Path.Combine(j.Work, "thumb.jpg");
                System.IO.File.WriteAllBytes(p, b);
                return await Deliver(j, p, "jpg", ct);
            }
            throw new Fail("errNoThumb");
        }

        async Task<string> RunSubs(Job j, CancellationToken ct)
        {
            if (!Components.Ready) throw new Fail("errEngineMissing");
            var lang = j.Opts.Str("lang");
            var auto = j.Opts.Bool("auto");
            var fmt = j.Opts.Str("subFormat") ?? "srt";
            var src = fmt == "srt" ? "vtt" : fmt;
            Set(j, detail: "fetchingSubs", indet: true);
            await CheckAccess(j, ct);
            await EnsureTitle(j, ct);
            await RunYt(j, info => new List<string>
            {
                "--load-info-json", info.Path, "--skip-download", auto ? "--write-auto-subs" : "--write-subs",
                "--sub-langs", Regex.Escape(lang), "--sub-format", src, "-o", Path.Combine(j.Work, "subs.%(ext)s"),
            }, null, ct);
            var exact = Path.Combine(j.Work, "subs." + lang + "." + src);
            var file = System.IO.File.Exists(exact) ? exact : Directory.GetFiles(j.Work, "subs.*." + src).FirstOrDefault();
            if (file == null) throw new Fail("errNoSubs");
            if (fmt == "srt")
            {
                var srt = Path.Combine(j.Work, "out.srt");
                var r = await Proc.Run(Components.Ffmpeg.Exe, new[] { "-hide_banner", "-nostdin", "-y", "-loglevel", "error", "-i", file, srt }, ct, 60000);
                ct.ThrowIfCancellationRequested();
                if (r.code != 0 || !System.IO.File.Exists(srt)) throw new Fail("errConvert");
                file = srt;
            }
            return await Deliver(j, file, fmt, ct);
        }

        // Moves the finished file into the download folder under a free name. It gets its final name
        // only once it is complete, so an interrupted copy never looks like a finished download. If the
        // folder's drive is disconnected, the download waits (and resumes by itself when it's back).
        async Task<string> Deliver(Job j, string src, string ext, CancellationToken ct)
        {
            lock (L)
            {
                j.Status = "processing";
                j.Detail = "saving";
                j.Indet = true;
            }
            Touch(true);
            string folder;
            bool told = false;
            while (true)
            {
                folder = Settings.Current.Folder;
                var st = Folders.Check(folder, true);
                if (st == "ok") break;
                SetNotice(j, "waitingFolder");
                if (!told)
                {
                    told = true;
                    App.Current?.FolderProblem(folder);
                }
                await Task.Delay(4000, ct);
            }
            SetNotice(j, null);
            var size = new FileInfo(src).Length;
            if (Files.FreeSpace(folder) < size + 16L * 1024 * 1024) throw new Fail("errDiskFull");
            var name = Media.BaseName(j);
            var dest = Files.UniquePath(folder, name, ext);
            var tmp = dest + ".partial";
            try
            {
                if (Files.SameVolume(src, folder)) System.IO.File.Move(src, tmp);
                else await CopyFile(src, tmp, ct);
                if (System.IO.File.Exists(dest)) dest = Files.UniquePath(folder, name, ext);
                System.IO.File.Move(tmp, dest);
            }
            catch
            {
                Files.TryDelete(tmp);
                throw;
            }
            return dest;
        }

        static async Task CopyFile(string src, string dest, CancellationToken ct)
        {
            using (var i = new FileStream(src, FileMode.Open, FileAccess.Read, FileShare.Read, 1 << 20, true))
            using (var o = new FileStream(dest, FileMode.Create, FileAccess.Write, FileShare.None, 1 << 20, true))
                await i.CopyToAsync(o, 1 << 20, ct);
        }
    }
}
