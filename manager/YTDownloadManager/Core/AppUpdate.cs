using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace YTDM
{
    // New versions of the app come from the project's GitHub releases. The app asks at most every 12 hours
    // (at start when the last check is older, then while it runs) and sends back the ETag of the last
    // answer: as long as nothing new was released, GitHub answers "304 Not Modified" without any content.
    // Only a new release is read and remembered. Nothing about the PC or its user is sent.
    // Updating downloads that release's installer for this build (64-bit or 32-bit), checks it against the
    // release's SHA256SUMS.txt, and runs it quietly; the installer closes this copy, keeps the settings and
    // the queue, and starts the new version. "checkUpdates": false in settings.json turns the check off.
    static class AppUpdate
    {
        const string Latest = "https://api.github.com/repos/NyxiYT/yt-download-manager/releases/latest";
        static readonly long Every = 12L * 3600 * 1000;
        static string Arch => Environment.Is64BitProcess ? "x64" : "x86";
        static string Asset => "YTDownloadManager-Setup-" + Arch + ".exe";
        static string Dir => Path.Combine(Paths.Data, "work", "update");

        static int checking;
        public static bool Busy { get; private set; }
        public static bool Failed { get; private set; }
        public static double Progress { get; private set; }
        public static event Action Changed;

        // The newer version that can be installed, or null.
        public static string Available
        {
            get
            {
                var u = Settings.Current.Update;
                return !string.IsNullOrEmpty(u.Url) && Newer(u.Version, App.Version) ? u.Version : null;
            }
        }

        public static bool Newer(string a, string b) =>
            System.Version.TryParse(a ?? "", out var x) && System.Version.TryParse(b ?? "", out var y) && x > y;

        // Called every few seconds by the app; asks GitHub only when the last check is old enough.
        public static void Tick()
        {
            if (!Settings.Current.CheckUpdates || Busy || !Net.Online) return;
            if (Time.Now - Settings.Current.Update.Checked < Every) return;
            if (Interlocked.Exchange(ref checking, 1) == 1) return;
            Task.Run(async () =>
            {
                try { await Check(); }
                finally { Interlocked.Exchange(ref checking, 0); }
            });
        }

        static async Task Check()
        {
            var u = Settings.Current.Update;
            if (!Busy) Files.DeleteDir(Dir); // the installer of the last update
            var url = Environment.GetEnvironmentVariable("YTDM_UPDATE_URL"); // tests: another release list
            var req = (HttpWebRequest)WebRequest.Create(string.IsNullOrEmpty(url) ? Latest : url);
            req.UserAgent = "YTDownloadManager/" + App.Version;
            req.Accept = "application/vnd.github+json";
            req.Headers["X-GitHub-Api-Version"] = "2022-11-28";
            req.Timeout = 30000;
            req.ReadWriteTimeout = 30000;
            if (!string.IsNullOrEmpty(u.Etag) && !string.IsNullOrEmpty(u.Version)) req.Headers[HttpRequestHeader.IfNoneMatch] = u.Etag;
            var before = Available;
            try
            {
                using (var resp = (HttpWebResponse)await req.GetResponseAsync())
                using (var r = new StreamReader(resp.GetResponseStream()))
                {
                    var d = Json.ParseObj(await r.ReadToEndAsync());
                    var version = (d.Str("tag_name") ?? "").TrimStart('v', 'V');
                    var assets = (d.Arr("assets") ?? new object[0]).OfType<Dictionary<string, object>>().ToList();
                    Dictionary<string, object> Find(string name) => assets.FirstOrDefault(a => string.Equals(a.Str("name"), name, StringComparison.OrdinalIgnoreCase));
                    var exe = Find(Asset);
                    var sums = Find("SHA256SUMS.txt");
                    if (!System.Version.TryParse(version, out _) || d.Bool("draft") || d.Bool("prerelease")) throw new InvalidDataException("unexpected release " + version);
                    u.Version = version;
                    u.Url = exe?.Str("browser_download_url");
                    u.Size = exe?.Long("size") ?? 0;
                    var digest = exe?.Str("digest") ?? "";
                    u.Sha256 = digest.StartsWith("sha256:", StringComparison.OrdinalIgnoreCase) ? digest.Substring(7).ToLowerInvariant() : null;
                    u.SumsUrl = sums?.Str("browser_download_url");
                    u.Etag = resp.Headers[HttpResponseHeader.ETag];
                    Log.Info("app update check: latest " + version + (Available != null ? " (newer)" : ""));
                }
                u.Checked = Time.Now;
            }
            catch (WebException e) when (e.Response is HttpWebResponse r && r.StatusCode == HttpStatusCode.NotModified)
            {
                u.Checked = Time.Now; // nothing new
            }
            catch (Exception e)
            {
                Log.Warn("app update check: " + e.Message);
                u.Checked = Time.Now - Every + 3600 * 1000; // try again in an hour
            }
            Settings.Current.Save();
            if (Available != before) Changed?.Invoke();
        }

        // Downloads and runs the new installer. `open`: the new version opens its window afterwards.
        public static async Task Install(bool open)
        {
            var v = Available;
            if (v == null || Busy) return;
            var u = Settings.Current.Update;
            Busy = true;
            Failed = false;
            Progress = 0;
            Changed?.Invoke();
            try
            {
                Files.DeleteDir(Dir);
                Directory.CreateDirectory(Dir);
                var file = Path.Combine(Dir, Asset);
                string listed = null;
                if (!string.IsNullOrEmpty(u.SumsUrl))
                {
                    var m = Regex.Match(await Net.GetText(u.SumsUrl, CancellationToken.None), "(?im)^([0-9a-f]{64})\\s+\\*?" + Regex.Escape(Asset) + "\\s*$");
                    if (m.Success) listed = m.Groups[1].Value.ToLowerInvariant();
                }
                if (listed == null) throw new InvalidDataException("the release lists no checksum for " + Asset);
                if (u.Sha256 != null && u.Sha256 != listed) throw new InvalidDataException("the release's checksums disagree");
                double shown = 0;
                await Net.DownloadFile(u.Url, file, (got, total) =>
                {
                    Progress = Math.Min(1, (double)got / Math.Max(1, total > 0 ? total : u.Size));
                    if (Progress - shown < 0.01) return;
                    shown = Progress;
                    Changed?.Invoke();
                }, CancellationToken.None);
                string sha;
                using (var s = File.OpenRead(file))
                using (var h = SHA256.Create())
                    sha = BitConverter.ToString(h.ComputeHash(s)).Replace("-", "").ToLowerInvariant();
                if (sha != listed) throw new InvalidDataException("checksum mismatch for " + Asset);
                var fv = FileVersionInfo.GetVersionInfo(file).FileVersion;
                if (!System.Version.TryParse(fv ?? "", out var got2) || got2.ToString(3) != v) throw new InvalidDataException("the installer is version " + fv + ", expected " + v);
                Log.Info("updating to " + v);
                // Started through the shell, so it inherits nothing from this process.
                Process.Start(new ProcessStartInfo(file, "--quiet " + (open ? "--open" : "--start"))
                {
                    UseShellExecute = true,
                    WorkingDirectory = Environment.GetFolderPath(Environment.SpecialFolder.Windows),
                });
                // The installer closes this copy now (it saves the queue first) and starts the new one.
                _ = Task.Delay(120000).ContinueWith(t =>
                {
                    Log.Warn("app update: still running two minutes after the installer started");
                    Busy = false;
                    Failed = true;
                    Changed?.Invoke();
                });
            }
            catch (Exception e)
            {
                Log.Error("app update", e);
                Failed = true;
                Busy = false;
                Files.DeleteDir(Dir);
            }
            Changed?.Invoke();
        }
    }
}
