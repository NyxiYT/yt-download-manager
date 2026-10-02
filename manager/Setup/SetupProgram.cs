using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace YTDM
{
    // YTDownloadManager-Setup.exe: the only file needed. It carries the app, the browser extension and
    // the tools the app uses (yt-dlp, FFmpeg, Deno). One window: Install, Installing, Ready, Open.
    // "--quiet" installs without any window.
    static class SetupProgram
    {
        [STAThread]
        static int Main(string[] args)
        {
            System.Net.ServicePointManager.SecurityProtocol = (System.Net.SecurityProtocolType)(3072 | 12288);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Settings.Load();
            var a = args.Select(x => x.Trim().ToLowerInvariant()).ToArray();
            var bundle = new BundleInstaller { Quiet = a.Contains("--quiet") };
            Log.Info($"setup {bundle.Version} [{string.Join(" ", args)}]");

            if (bundle.Quiet)
            {
                try
                {
                    Task.Run(() => bundle.Run(p => { }, CancellationToken.None)).GetAwaiter().GetResult();
                    return 0;
                }
                catch (Exception e)
                {
                    Log.Error("setup (quiet)", e);
                    return 1;
                }
            }

            Application.ThreadException += (s, e) => Log.Error("setup ui", e.Exception);
            AppDomain.CurrentDomain.UnhandledException += (s, e) => Log.Error("setup fatal", e.ExceptionObject as Exception);
            var form = new SetupForm(bundle);
            try
            {
                Application.Run(form);
            }
            finally
            {
                bundle.ReleaseInstance();
            }
            if (!bundle.Installed || !File.Exists(BundleInstaller.Exe)) return 0;
            // Open: the app's window. Closed instead: the app still starts quietly when it's set to
            // start with Windows, so the browser can use it right away.
            try
            {
                if (form.OpenApp) Process.Start(new ProcessStartInfo(BundleInstaller.Exe) { UseShellExecute = false, WorkingDirectory = Paths.InstallDir });
                else if (Settings.Current.KeepRunning) Process.Start(new ProcessStartInfo(BundleInstaller.Exe, "--background") { UseShellExecute = false, WorkingDirectory = Paths.InstallDir });
            }
            catch (Exception e) { Log.Warn("start app: " + e.Message); }
            return 0;
        }
    }

    // Installs from the bundle inside this exe: the app into the user's Programs folder, the tools
    // into the app's data folder. Updates keep settings, the download queue and a newer yt-dlp.
    sealed class BundleInstaller
    {
        const string MutexName = @"Local\YTDownloadManager.Instance";
        public static string Exe => Path.Combine(Paths.InstallDir, Paths.ExeName);

        public bool Quiet;
        public bool Installed { get; private set; }
        Mutex instance;

        public string Version => Assembly.GetExecutingAssembly().GetName().Version.ToString(3);

        // The version already installed, or null for a fresh install.
        public string InstalledVersion
        {
            get
            {
                if (!File.Exists(Exe)) return null;
                var v = Registration.InstalledVersion();
                if (!string.IsNullOrEmpty(v)) return v;
                try { return new Version(FileVersionInfo.GetVersionInfo(Exe).FileVersion).ToString(3); }
                catch { return "?"; }
            }
        }

        static Stream Res(string name) => Assembly.GetExecutingAssembly().GetManifestResourceStream(name) ?? throw new InvalidDataException(name + " is missing from the installer");

        static bool Running() => Process.GetProcessesByName(Path.GetFileNameWithoutExtension(Paths.ExeName)).Length > 0;

        static string PartOf(string entry)
        {
            var name = Path.GetFileName(entry.Replace('\\', '/').TrimEnd('/')).ToLowerInvariant();
            if (name == "yt-dlp.exe") return "yt-dlp";
            if (name == "deno.exe" || name == "node.exe") return "js"; // the JavaScript runtime yt-dlp uses
            return "ffmpeg"; // ffmpeg.exe, ffprobe.exe, their DLLs and the license files
        }

        // Share of the work per step, for one progress bar: the bytes each step writes.
        static Dictionary<string, double> Weights()
        {
            long app;
            using (var st = Res("payload.exe")) app = st.Length;
            var w = new Dictionary<string, double> { ["app"] = app, ["extension"] = ExtensionBytes(), ["yt-dlp"] = 0, ["ffmpeg"] = 0, ["js"] = 0 };
            using (var z = new ZipArchive(Res("components.zip"), ZipArchiveMode.Read))
                foreach (var e in z.Entries)
                    if (e.Length > 0) w[PartOf(e.FullName)] += e.Length;
            var total = w.Values.Sum();
            w["close"] = w["register"] = total * 0.03;
            return w;
        }

        // progress: 0..1 for the whole installation.
        public async Task Run(Action<double> progress, CancellationToken ct)
        {
            var weights = Weights();
            var total = weights.Values.Sum();
            var done = new Dictionary<string, double>();
            void Report(string step, double f)
            {
                lock (done)
                {
                    done[step] = Math.Max(0, Math.Min(1, f)) * weights[step];
                    progress(Math.Min(1, done.Values.Sum() / total));
                }
            }

            bool fresh = InstalledVersion == null;
            if (Running()) await Task.Run(() => Program.StopRunning(15000));
            Report("close", 1);
            // From here on this process is "the" Download Manager: a copy the browser starts meanwhile
            // sees it and doesn't start a second one.
            if (!Quiet) AcquireInstance();
            await Task.Run(() => InstallApp());
            Report("app", 1);
            await Task.Run(() => InstallExtension());
            Report("extension", 1);
            await Task.Run(() => Extract(Report, ct));
            // A new install starts with Windows, so the browser can use it at once; an update keeps what
            // was set. The download folder is created when the first file arrives.
            if (fresh)
            {
                Settings.Current.KeepRunning = true;
                Settings.Current.Save();
            }
            await Task.Run(() => Register());
            Report("register", 1);
            Components.Detect();
            Installed = true;
            Log.Info("installed " + Version + " to " + Paths.InstallDir);
        }

        void InstallApp()
        {
            Directory.CreateDirectory(Paths.InstallDir);
            var tmp = Exe + ".new";
            using (var s = Res("payload.exe"))
            using (var f = File.Create(tmp))
                s.CopyTo(f);
            Retry(() => Components.MoveInto(tmp, Exe));
        }

        static long ExtensionBytes()
        {
            using (var z = new ZipArchive(Res("extension.zip"), ZipArchiveMode.Read))
                return z.Entries.Sum(e => e.Length);
        }

        // The extension folder is replaced as a whole, so files removed in a newer version don't linger.
        // A browser that loaded it picks up the new files when its reload button is clicked.
        void InstallExtension()
        {
            var dir = Paths.ExtensionDir;
            var tmp = dir + ".new";
            if (Directory.Exists(tmp)) Directory.Delete(tmp, true);
            using (var z = new ZipArchive(Res("extension.zip"), ZipArchiveMode.Read))
            {
                foreach (var e in z.Entries)
                {
                    if (e.Length == 0 && e.FullName.EndsWith("/")) continue;
                    var dest = Path.GetFullPath(Path.Combine(tmp, e.FullName.Replace('/', '\\')));
                    if (!dest.StartsWith(Path.GetFullPath(tmp), StringComparison.OrdinalIgnoreCase)) continue;
                    Directory.CreateDirectory(Path.GetDirectoryName(dest));
                    e.ExtractToFile(dest, true);
                }
            }
            if (Directory.Exists(dir))
            {
                var old = dir + ".old";
                if (Directory.Exists(old)) Directory.Delete(old, true);
                Retry(() => Directory.Move(dir, old));
                try { Directory.Delete(old, true); } catch { }
            }
            Retry(() => Directory.Move(tmp, dir));
        }

        void Extract(Action<string, double> report, CancellationToken ct)
        {
            var bin = Paths.Bin;
            using (var z = new ZipArchive(Res("components.zip"), ZipArchiveMode.Read))
            {
                foreach (var group in new[] { "yt-dlp", "ffmpeg", "js" })
                {
                    var entries = z.Entries.Where(e => e.Length > 0 && PartOf(e.FullName) == group).ToList();
                    long total = Math.Max(1, entries.Sum(e => e.Length)), done = 0, last = 0;
                    report(group, 0);
                    foreach (var e in entries)
                    {
                        ct.ThrowIfCancellationRequested();
                        var dest = Path.GetFullPath(Path.Combine(bin, e.FullName.Replace('/', '\\')));
                        if (!dest.StartsWith(Path.GetFullPath(bin), StringComparison.OrdinalIgnoreCase)) continue; // no paths outside bin
                        Directory.CreateDirectory(Path.GetDirectoryName(dest));
                        var tmp = dest + ".new";
                        using (var i = e.Open())
                        using (var o = File.Create(tmp))
                        {
                            var buf = new byte[1 << 20];
                            int n;
                            while ((n = i.Read(buf, 0, buf.Length)) > 0)
                            {
                                o.Write(buf, 0, n);
                                done += n;
                                if (done - last > (2 << 20))
                                {
                                    last = done;
                                    report(group, (double)done / total);
                                }
                            }
                        }
                        // yt-dlp updates itself; don't replace a newer copy with the bundled one.
                        if (group == "yt-dlp" && File.Exists(dest) && Newer(dest, tmp))
                        {
                            File.Delete(tmp);
                            Log.Info("kept the newer yt-dlp that is already installed");
                        }
                        else Retry(() => Components.MoveInto(tmp, dest));
                    }
                    report(group, 1);
                }
            }
        }

        static bool Newer(string installed, string bundled)
        {
            string Ver(string exe)
            {
                try { return (Proc.Run(exe, new[] { "--version" }, CancellationToken.None, 30000).GetAwaiter().GetResult().stdout ?? "").Trim(); }
                catch { return ""; }
            }
            var a = Ver(installed);
            return a.Length > 0 && string.CompareOrdinal(a, Ver(bundled)) > 0;
        }

        void Register()
        {
            Registration.RegisterProtocol(Exe);
            Registration.CreateShortcuts(Exe);
            long size = new FileInfo(Exe).Length;
            try { size += new DirectoryInfo(Paths.Bin).EnumerateFiles("*", SearchOption.AllDirectories).Sum(f => f.Length); } catch { }
            Registration.RegisterUninstall(Exe, Version, size / 1024);
            Registration.SetAutostart(Exe, Settings.Current.KeepRunning);
            SHChangeNotify(0x08000000, 0, IntPtr.Zero, IntPtr.Zero); // shortcuts and the taskbar show the new icon at once
        }

        [System.Runtime.InteropServices.DllImport("shell32.dll")]
        static extern void SHChangeNotify(int eventId, uint flags, IntPtr item1, IntPtr item2);

        static void Retry(Action a)
        {
            for (int i = 0; ; i++)
            {
                try
                {
                    a();
                    return;
                }
                catch (IOException) when (i < 10) { Thread.Sleep(500); }
                catch (UnauthorizedAccessException) when (i < 10) { Thread.Sleep(500); }
            }
        }

        void AcquireInstance()
        {
            if (instance != null) return;
            try
            {
                instance = new Mutex(false, MutexName);
                try
                {
                    if (!instance.WaitOne(5000))
                    {
                        instance.Dispose();
                        instance = null;
                    }
                }
                catch (AbandonedMutexException) { } // the old copy was stopped hard; it's ours now
            }
            catch { instance = null; }
        }

        public void ReleaseInstance()
        {
            try { instance?.ReleaseMutex(); } catch { }
            instance?.Dispose();
            instance = null;
        }
    }
}
