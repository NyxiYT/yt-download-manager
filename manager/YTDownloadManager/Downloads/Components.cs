using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace YTDM
{
    sealed class Tool
    {
        public string Name;              // yt-dlp, ffmpeg, ffprobe, deno, node
        public string Exe;
        public string[] Pre = new string[0]; // arguments in front of every call (python -m yt_dlp)
        public bool Managed;             // installed by us into the bin folder (so we may update or remove it)
        public string Version;

        public IEnumerable<string> With(IEnumerable<string> args) => Pre.Concat(args);
    }

    // The external programs the manager relies on: yt-dlp (retrieval), FFmpeg (local processing) and a
    // JavaScript runtime that yt-dlp uses for YouTube. Existing installs are used when present; missing
    // ones are downloaded from their official release pages into the app's own folder.
    static class Components
    {
        public static Tool YtDlp, Ffmpeg, Ffprobe, Js;
        public static bool Ready => YtDlp != null && Ffmpeg != null && Ffprobe != null;
        public static string FfmpegDir => Ffmpeg == null ? null : Path.GetDirectoryName(Ffmpeg.Exe);

        public sealed class Package
        {
            public string Id, Name, Url, SumsUrl, SumsName;
            public long ApproxBytes;
        }

        // 32-bit Windows gets the 32-bit builds. Deno has none: there the installer brings Node.js instead.
        static readonly bool X64 = Environment.Is64BitOperatingSystem;
        static readonly string YtDlpExe = X64 ? "yt-dlp.exe" : "yt-dlp_x86.exe";
        static readonly string FfmpegZip = X64 ? "ffmpeg-master-latest-win64-gpl.zip" : "ffmpeg-master-latest-win32-gpl.zip";

        public static readonly Package YtDlpPkg = new Package
        {
            Id = "yt-dlp", Name = "yt-dlp",
            Url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/" + YtDlpExe,
            SumsUrl = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/SHA2-256SUMS", SumsName = YtDlpExe,
            ApproxBytes = 18_000_000,
        };

        public static readonly Package FfmpegPkg = new Package
        {
            Id = "ffmpeg", Name = "FFmpeg",
            Url = "https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/" + FfmpegZip,
            SumsUrl = "https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/checksums.sha256", SumsName = FfmpegZip,
            ApproxBytes = 140_000_000,
        };

        public static readonly Package DenoPkg = new Package
        {
            Id = "deno", Name = "Deno",
            Url = "https://github.com/denoland/deno/releases/latest/download/deno-x86_64-pc-windows-msvc.zip",
            SumsUrl = "https://github.com/denoland/deno/releases/latest/download/deno-x86_64-pc-windows-msvc.zip.sha256sum", SumsName = "deno-x86_64-pc-windows-msvc.zip",
            ApproxBytes = 45_000_000,
        };

        public static List<Package> Missing()
        {
            var l = new List<Package>();
            if (YtDlp == null) l.Add(YtDlpPkg);
            if (Ffmpeg == null || Ffprobe == null) l.Add(FfmpegPkg);
            if (Js == null && X64) l.Add(DenoPkg);
            return l;
        }

        public static void Detect()
        {
            var s = Settings.Current;
            YtDlp = FindYtDlp(s.YtDlpPath);
            var ff = FindFfmpeg(s.FfmpegDir);
            Ffmpeg = ff.Item1;
            Ffprobe = ff.Item2;
            Js = FindJs(s.JsRuntime);
            Log.Info($"components: yt-dlp={Describe(YtDlp)} ffmpeg={Describe(Ffmpeg)} js={Describe(Js)}");
        }

        static string Describe(Tool t) => t == null ? "missing" : t.Exe + (t.Pre.Length > 0 ? " " + string.Join(" ", t.Pre) : "") + (t.Managed ? " (managed)" : "");

        static string Which(string exe) => WhichAll(exe).FirstOrDefault();

        static IEnumerable<string> WhichAll(string exe)
        {
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var dir in (Environment.GetEnvironmentVariable("PATH") ?? "").Split(';'))
            {
                string p = null;
                try
                {
                    var d = dir.Trim().Trim('"');
                    if (d.Length == 0 || d.IndexOf("WindowsApps", StringComparison.OrdinalIgnoreCase) >= 0) continue; // store stubs
                    p = Path.GetFullPath(Path.Combine(Environment.ExpandEnvironmentVariables(d), exe));
                    if (!File.Exists(p) || !seen.Add(p)) p = null;
                }
                catch { p = null; }
                if (p != null) yield return p;
            }
        }

        static Tool FindYtDlp(string over)
        {
            if (!string.IsNullOrEmpty(over))
            {
                if (over.EndsWith("python.exe", StringComparison.OrdinalIgnoreCase) && File.Exists(over)) return new Tool { Name = "yt-dlp", Exe = over, Pre = new[] { "-m", "yt_dlp" } };
                if (File.Exists(over)) return new Tool { Name = "yt-dlp", Exe = over };
            }
            var managed = Path.Combine(Paths.Bin, "yt-dlp.exe");
            if (File.Exists(managed)) return new Tool { Name = "yt-dlp", Exe = managed, Managed = true };
            var sys = Which("yt-dlp.exe");
            if (sys != null) return new Tool { Name = "yt-dlp", Exe = sys };
            // A Python installation with the yt-dlp package also works.
            foreach (var py in WhichAll("python.exe").Take(4))
            {
                try
                {
                    var r = Task.Run(() => Proc.Run(py, new[] { "-c", "import yt_dlp" }, CancellationToken.None, 15000)).GetAwaiter().GetResult();
                    if (r.code == 0) return new Tool { Name = "yt-dlp", Exe = py, Pre = new[] { "-m", "yt_dlp" } };
                }
                catch { }
            }
            return null;
        }

        static Tuple<Tool, Tool> FindFfmpeg(string over)
        {
            var dirs = new List<string>();
            if (!string.IsNullOrEmpty(over)) dirs.Add(over);
            dirs.Add(Paths.Bin);
            var onPath = Which("ffmpeg.exe");
            if (onPath != null) dirs.Add(Path.GetDirectoryName(onPath));
            var pf = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            var local = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            var home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            dirs.AddRange(new[]
            {
                Path.Combine(pf, "FFmpeg", "bin"), Path.Combine(pf, "FFmpeg"), @"C:\ffmpeg\bin", @"C:\ffmpeg",
                Path.Combine(local, "Microsoft", "WinGet", "Links"), Path.Combine(home, "scoop", "shims"), @"C:\ProgramData\chocolatey\bin",
            });
            foreach (var d in dirs)
            {
                try
                {
                    var f = Path.Combine(d, "ffmpeg.exe");
                    var p = Path.Combine(d, "ffprobe.exe");
                    if (File.Exists(f) && File.Exists(p))
                    {
                        bool managed = string.Equals(Path.GetFullPath(d).TrimEnd('\\'), Path.GetFullPath(Paths.Bin).TrimEnd('\\'), StringComparison.OrdinalIgnoreCase);
                        return Tuple.Create(new Tool { Name = "ffmpeg", Exe = f, Managed = managed }, new Tool { Name = "ffprobe", Exe = p, Managed = managed });
                    }
                }
                catch { }
            }
            return Tuple.Create<Tool, Tool>(null, null);
        }

        static Tool FindJs(string over)
        {
            if (!string.IsNullOrEmpty(over))
            {
                var i = over.IndexOf(':');
                if (i > 0 && File.Exists(over.Substring(i + 1))) return new Tool { Name = over.Substring(0, i), Exe = over.Substring(i + 1) };
            }
            var managed = Path.Combine(Paths.Bin, "deno.exe");
            if (File.Exists(managed)) return new Tool { Name = "deno", Exe = managed, Managed = true };
            managed = Path.Combine(Paths.Bin, "node.exe"); // the 32-bit installer's
            if (File.Exists(managed)) return new Tool { Name = "node", Exe = managed, Managed = true };
            var deno = Which("deno.exe");
            if (deno != null) return new Tool { Name = "deno", Exe = deno };
            var node = Which("node.exe");
            if (node != null) return new Tool { Name = "node", Exe = node };
            return null;
        }

        // Arguments every yt-dlp call gets.
        public static List<string> YtArgs()
        {
            var a = new List<string>
            {
                "--ignore-config", "--no-update", "--color", "never", "--no-playlist", "--no-mtime",
                "--cache-dir", Paths.Cache, "--socket-timeout", "30", "--retries", "3", "--fragment-retries", "5",
                "--extractor-retries", "2", "--file-access-retries", "5",
            };
            if (FfmpegDir != null) a.AddRange(new[] { "--ffmpeg-location", FfmpegDir });
            if (Js != null) a.AddRange(new[] { "--js-runtimes", Js.Name + ":" + Js.Exe });
            return a;
        }

        public static async Task<string> VersionOf(Tool t, CancellationToken ct)
        {
            if (t == null) return null;
            if (t.Version != null) return t.Version;
            try
            {
                var arg = t.Name == "ffmpeg" || t.Name == "ffprobe" ? "-version" : "--version";
                var r = await Proc.Run(t.Exe, t.With(new[] { arg }), ct, 20000);
                var first = (r.stdout ?? "").Split('\n').Select(l => l.Trim()).FirstOrDefault(l => l.Length > 0) ?? "";
                var m = Regex.Match(first, "version\\s+(\\S+)", RegexOptions.IgnoreCase);
                t.Version = m.Success ? m.Groups[1].Value : first.TrimStart('v');
                if (t.Version.Length > 40) t.Version = t.Version.Substring(0, 40);
            }
            catch { t.Version = ""; }
            return t.Version;
        }

        // Downloads and unpacks one package into the bin folder, verifying its published checksum.
        public static async Task Install(Package pkg, Action<long, long> progress, CancellationToken ct)
        {
            var dl = Directory.CreateDirectory(Path.Combine(Paths.Bin, "download")).FullName;
            var file = Path.Combine(dl, Path.GetFileName(new Uri(pkg.Url).AbsolutePath));
            Files.TryDelete(file);
            await Net.DownloadFile(pkg.Url, file, progress, ct);
            var expected = await ExpectedSum(pkg, ct);
            if (expected != null)
            {
                var actual = Files.Sha256(file);
                if (!string.Equals(actual, expected, StringComparison.OrdinalIgnoreCase))
                {
                    Files.TryDelete(file);
                    throw new InvalidDataException("checksum mismatch for " + pkg.Name);
                }
            }
            else Log.Warn("no checksum published for " + pkg.Name);

            if (pkg.Id == "yt-dlp")
            {
                MoveInto(file, Path.Combine(Paths.Bin, "yt-dlp.exe"));
            }
            else
            {
                using (var zip = ZipFile.OpenRead(file))
                {
                    var want = pkg.Id == "ffmpeg" ? new[] { "ffmpeg.exe", "ffprobe.exe" } : new[] { "deno.exe" };
                    foreach (var name in want)
                    {
                        var entry = zip.Entries.FirstOrDefault(e => string.Equals(e.Name, name, StringComparison.OrdinalIgnoreCase));
                        if (entry == null) throw new InvalidDataException(name + " missing in " + pkg.Name);
                        var tmp = Path.Combine(dl, name + ".new");
                        entry.ExtractToFile(tmp, true);
                        MoveInto(tmp, Path.Combine(Paths.Bin, name));
                    }
                }
                Files.TryDelete(file);
            }
            Files.DeleteDir(dl);
            Detect();
        }

        public static void MoveInto(string src, string dest)
        {
            if (File.Exists(dest))
            {
                var old = dest + ".old";
                Files.TryDelete(old);
                File.Move(dest, old); // works even while the old copy is running
                Files.TryDelete(old);
            }
            File.Move(src, dest);
        }

        static async Task<string> ExpectedSum(Package pkg, CancellationToken ct)
        {
            try
            {
                var text = await Net.GetText(pkg.SumsUrl, ct);
                // "hash  name" lists, or a single hash in any layout (e.g. PowerShell's "Hash : ..." output).
                var loose = new List<string>();
                foreach (var line in text.Split('\n'))
                {
                    var m = Regex.Match(line, "\\b([0-9a-fA-F]{64})\\b");
                    if (!m.Success) continue;
                    if (line.IndexOf(pkg.SumsName, StringComparison.OrdinalIgnoreCase) >= 0) return m.Groups[1].Value;
                    if (!Regex.IsMatch(line, "\\.(zip|exe|7z|tar|xz)\\b", RegexOptions.IgnoreCase)) loose.Add(m.Groups[1].Value);
                }
                if (loose.Count == 1) return loose[0];
            }
            catch (Exception e) { Log.Warn("checksum list for " + pkg.Name + ": " + e.Message); }
            return null;
        }

        // yt-dlp has to keep up with YouTube; the copy we installed updates itself about once a week.
        public static async Task<bool> UpdateYtDlp(CancellationToken ct)
        {
            if (YtDlp == null || !YtDlp.Managed) return false;
            try
            {
                var r = await Proc.Run(YtDlp.Exe, new[] { "-U" }, ct, 180000);
                Log.Info("yt-dlp update: " + (r.stdout + r.stderr).Replace("\r", " ").Replace("\n", " "));
                Settings.Current.LastUpdateCheck = Time.Now;
                Settings.Current.Save();
                YtDlp.Version = null;
                return r.code == 0;
            }
            catch (Exception e)
            {
                Log.Warn("yt-dlp update failed: " + e.Message);
                return false;
            }
        }
    }

    static class Net
    {
        public static bool Online
        {
            get
            {
                try { return NetworkInterface.GetIsNetworkAvailable(); }
                catch { return true; }
            }
        }

        static HttpWebRequest Request(string url)
        {
            var req = (HttpWebRequest)WebRequest.Create(url);
            req.UserAgent = "YTDownloadManager/" + App.Version;
            req.AllowAutoRedirect = true;
            req.Timeout = 30000;
            req.ReadWriteTimeout = 60000;
            req.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;
            return req;
        }

        public static async Task DownloadFile(string url, string dest, Action<long, long> progress, CancellationToken ct)
        {
            Exception last = null;
            for (int attempt = 1; attempt <= 3; attempt++)
            {
                try
                {
                    var req = Request(url);
                    using (ct.Register(req.Abort))
                    using (var resp = (HttpWebResponse)await req.GetResponseAsync())
                    using (var rs = resp.GetResponseStream())
                    using (var fs = new FileStream(dest, FileMode.Create, FileAccess.Write, FileShare.None, 1 << 16))
                    {
                        long total = resp.ContentLength, got = 0;
                        var buf = new byte[1 << 16];
                        int n;
                        while ((n = await rs.ReadAsync(buf, 0, buf.Length, ct)) > 0)
                        {
                            await fs.WriteAsync(buf, 0, n, ct);
                            got += n;
                            progress?.Invoke(got, total);
                        }
                        if (total > 0 && got != total) throw new IOException("incomplete download");
                    }
                    return;
                }
                catch (Exception e) when (!ct.IsCancellationRequested)
                {
                    last = e;
                    Log.Warn($"download {url} attempt {attempt}: {e.Message}");
                    await Task.Delay(2000 * attempt, ct);
                }
            }
            ct.ThrowIfCancellationRequested();
            throw last ?? new IOException("download failed");
        }

        public static async Task<string> GetText(string url, CancellationToken ct)
        {
            var req = Request(url);
            using (ct.Register(req.Abort))
            using (var resp = (HttpWebResponse)await req.GetResponseAsync())
            using (var r = new StreamReader(resp.GetResponseStream()))
                return await r.ReadToEndAsync();
        }

        // Returns null for 404 (so callers can try an alternative); throws on other failures.
        public static async Task<byte[]> GetBytes(string url, CancellationToken ct)
        {
            var req = Request(url);
            try
            {
                using (ct.Register(req.Abort))
                using (var resp = (HttpWebResponse)await req.GetResponseAsync())
                using (var ms = new MemoryStream())
                {
                    await resp.GetResponseStream().CopyToAsync(ms, 81920, ct);
                    return ms.ToArray();
                }
            }
            catch (WebException e) when (e.Response is HttpWebResponse r && (int)r.StatusCode == 404)
            {
                return null;
            }
        }
    }
}
