using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Windows.Forms;

namespace YTDM
{
    static class Program
    {
        static readonly string MutexName = @"Local\YTDownloadManager.Instance" + Paths.InstanceSuffix;

        [STAThread]
        static int Main(string[] args)
        {
            System.Net.ServicePointManager.SecurityProtocol = (System.Net.SecurityProtocolType)(3072 | 12288); // TLS 1.2 and 1.3
            System.Net.ServicePointManager.DefaultConnectionLimit = 16; // the default of 2 per server would queue parallel downloads
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            var a = args.Select(x => x.Trim().ToLowerInvariant()).ToArray();
            Settings.Load();

            if (a.Contains("--uninstall")) return Uninstaller.Run(a.Contains("--quiet")) ? 0 : 1;

            bool setup = a.Contains("--setup"); // older shortcuts: now just opens the window
            // Started by the browser (ytdm: link) or at sign-in: run quietly in the tray.
            bool background = a.Contains("--background") || a.Any(x => x.StartsWith(Registration.Protocol + ":"));

            using (var mutex = new Mutex(true, MutexName, out bool first))
            {
                if (!first)
                {
                    if (setup) Signal(App.SetupEvent);
                    else if (!background) Signal(App.ShowEvent);
                    return 0;
                }
                Log.Info($"start {App.Version} [{string.Join(" ", args)}]");
                Application.ThreadException += (s, e) => Log.Error("ui thread", e.Exception);
                AppDomain.CurrentDomain.UnhandledException += (s, e) =>
                {
                    Log.Error("fatal", e.ExceptionObject as Exception);
                    App.Current?.Emergency();
                };
                System.Threading.Tasks.TaskScheduler.UnobservedTaskException += (s, e) =>
                {
                    Log.Warn("unobserved: " + e.Exception?.GetBaseException().Message);
                    e.SetObserved();
                };
                try
                {
                    Application.Run(new App(background));
                }
                finally
                {
                    mutex.ReleaseMutex();
                }
            }
            return 0;
        }

        public static void Signal(string name)
        {
            try
            {
                if (EventWaitHandle.TryOpenExisting(name, out var h))
                    using (h) h.Set();
            }
            catch { }
        }

        // Asks a running copy to close (it saves its queue first) and waits for it.
        public static void StopRunning(int timeoutMs = 10000)
        {
            Signal(App.ExitEvent);
            var me = Process.GetCurrentProcess().Id;
            foreach (var p in Process.GetProcessesByName(Path.GetFileNameWithoutExtension(Paths.ExeName)))
            {
                try
                {
                    if (p.Id == me) continue;
                    if (!p.WaitForExit(timeoutMs)) p.Kill();
                }
                catch { }
                finally { p.Dispose(); }
            }
        }
    }

    static class Uninstaller
    {
        public static bool Run(bool quiet)
        {
            if (!quiet && MessageBox.Show(S.T("UnAsk"), S.T("AppName"), MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return false;
            Remove();
            if (!quiet) MessageBox.Show(S.T("UnDone"), S.T("AppName"), MessageBoxButtons.OK, MessageBoxIcon.Information);
            return true;
        }

        // Stops the app and removes everything it put on the PC: its registration, shortcuts and program folder
        // (with the browser extension's copy), and its data (settings, queue, logs, temporary and cache files and
        // the tools). Downloaded videos live in the user's own folder and are not touched. Run by the app itself
        // (Windows' "Uninstall") or by the installer.
        public static void Remove()
        {
            Program.StopRunning();
            Registration.RemoveAll();
            Log.Off = true;
            var running = string.Equals(Path.GetFullPath(Path.GetDirectoryName(Paths.Exe)).TrimEnd('\\'), Path.GetFullPath(Paths.InstallDir).TrimEnd('\\'), StringComparison.OrdinalIgnoreCase);
            Files.DeleteDir(Paths.Data);
            if (!running) Files.DeleteDir(Paths.InstallDir); // the installer, running from somewhere else
            // What can't go yet (the program file of this very process, or a file still held open for a moment)
            // goes a few seconds after this process has ended.
            var left = new[] { Paths.InstallDir, Paths.Data }.Where(Directory.Exists).ToList();
            if (left.Count == 0) return;
            try
            {
                var rm = string.Join(" & ", left.Select(d => "rmdir /s /q " + Args.Quote(d)));
                Process.Start(new ProcessStartInfo("cmd.exe", "/c ping 127.0.0.1 -n 4 > nul & " + rm)
                {
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    WorkingDirectory = Environment.GetFolderPath(Environment.SpecialFolder.Windows),
                });
            }
            catch { }
        }
    }
}
