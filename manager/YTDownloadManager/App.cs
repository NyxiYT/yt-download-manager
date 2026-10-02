using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace YTDM
{
    // The running manager: queue, local API, tray icon and its window. Closes itself when it's no
    // longer needed (nothing downloading, no browser talking to it for a few minutes), unless it is set
    // to start with Windows.
    sealed class App : ApplicationContext
    {
        public static App Current { get; private set; }

        public static string Version => Assembly.GetExecutingAssembly().GetName().Version.ToString(3);

        public const string ShowEvent = @"Local\YTDownloadManager.Show";
        public const string SetupEvent = @"Local\YTDownloadManager.Setup";
        public const string ExitEvent = @"Local\YTDownloadManager.Exit";

        public readonly JobManager Jobs = new JobManager();
        public readonly ApiServer Api = new ApiServer();
        readonly Control ui = new Control();
        readonly NotifyIcon tray = new NotifyIcon();
        ToolStripMenuItem keepItem;
        readonly System.Windows.Forms.Timer idleTimer = new System.Windows.Forms.Timer { Interval = 15000 };
        readonly DateTime started = DateTime.UtcNow;
        readonly SemaphoreSlim pairLock = new SemaphoreSlim(1, 1);
        readonly List<EventWaitHandle> events = new List<EventWaitHandle>();
        HomeForm home;
        Form pairPrompt;
        DateTime lastFolderWarning = DateTime.MinValue;
        bool exiting, apiStarted;
        (string state, DateTime at, string folder) folderCache;

        public App(bool background)
        {
            Current = this;
            ui.CreateControl();
            _ = ui.Handle;

            Components.Detect();
            Jobs.Load();
            Jobs.Changed += () => Post(UpdateTray);
            StartApi();
            BuildTray();
            WatchEvents();
            if (!background) ShowHome();
            if (!Components.Ready) PrepareComponents();

            idleTimer.Tick += (s, e) => CheckIdle();
            idleTimer.Start();
            ScheduleUpdateCheck();
        }

        // Tools the app needs but doesn't have (only when it wasn't installed with the setup program)
        // are fetched on their own. Downloads wait in the queue meanwhile.
        public bool Preparing { get; private set; }
        public bool PrepareFailed { get; private set; }
        public double PrepareProgress { get; private set; }

        public void PrepareComponents()
        {
            if (Preparing) return;
            var missing = Components.Missing();
            if (missing.Count == 0) return;
            Preparing = true;
            PrepareFailed = false;
            PrepareProgress = 0;
            home?.RefreshState();
            Task.Run(async () =>
            {
                try
                {
                    double shown = 0;
                    for (int i = 0; i < missing.Count; i++)
                    {
                        int k = i;
                        await Components.Install(missing[i], (got, total) =>
                        {
                            PrepareProgress = (k + (total > 0 ? Math.Min(1, (double)got / total) : 0)) / missing.Count;
                            if (PrepareProgress - shown < 0.01) return;
                            shown = PrepareProgress;
                            home?.RefreshState();
                        }, CancellationToken.None);
                    }
                    Log.Info("components ready");
                }
                catch (Exception e)
                {
                    Log.Error("preparing components", e);
                    PrepareFailed = true;
                }
                finally
                {
                    Preparing = false;
                    Components.Detect();
                    Post(() =>
                    {
                        home?.RefreshState();
                        Jobs.Pump();
                    });
                }
            });
        }

        public void StartApi()
        {
            if (apiStarted) return;
            apiStarted = true;
            if (!Api.Start(Settings.Current.Port))
            {
                MessageBox.Show(S.T("ApiFail"), S.T("AppName"), MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            else if (Api.Port != Settings.Current.Port)
            {
                Settings.Current.Port = Api.Port;
                Settings.Current.Save();
            }
            Jobs.Pump();
        }

        public void Post(Action a)
        {
            try { if (!ui.IsDisposed) ui.BeginInvoke(a); } catch { }
        }

        Task<T> OnUi<T>(Func<T> f)
        {
            var tcs = new TaskCompletionSource<T>();
            Post(() =>
            {
                try { tcs.TrySetResult(f()); }
                catch (Exception e) { tcs.TrySetException(e); }
            });
            return tcs.Task;
        }

        // ---------- tray ----------

        void BuildTray()
        {
            var menu = new ContextMenuStrip { Font = Ui.Body };
            menu.Items.Add(S.T("MnOpen"), null, (s, e) => ShowHome());
            menu.Items.Add(S.T("MnOpenFolder"), null, (s, e) => OpenFolder());
            menu.Items.Add(S.T("MnChangeFolder"), null, async (s, e) => await ChooseFolder());
            keepItem = new ToolStripMenuItem(S.T("HomeStartup")) { Checked = Settings.Current.KeepRunning };
            keepItem.Click += (s, e) => SetKeepRunning(!Settings.Current.KeepRunning);
            menu.Items.Add(keepItem);
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add(S.T("MnExit"), null, (s, e) => ExitApp(true));
            tray.ContextMenuStrip = menu;
            tray.Icon = Ui.AppIcon(SystemInformation.SmallIconSize.Width);
            tray.DoubleClick += (s, e) => ShowHome();
            tray.BalloonTipClicked += async (s, e) => await ChooseFolder();
            UpdateTray();
            tray.Visible = true;
        }

        void UpdateTray()
        {
            if (exiting) return;
            var n = Jobs.ActiveCount;
            var text = n > 0 ? S.T("TrayActive", n) : S.T("AppName");
            tray.Text = text.Length > 63 ? text.Substring(0, 63) : text;
            home?.RefreshState();
        }

        public void SetKeepRunning(bool on)
        {
            Settings.Current.KeepRunning = on;
            Settings.Current.Save();
            Registration.SetAutostart(Paths.Exe, on);
            if (keepItem != null) keepItem.Checked = on;
            home?.RefreshState();
        }

        // The download folder went away (drive unplugged): say so once in a while, with a way to change it.
        public void FolderProblem(string folder, string state)
        {
            Post(() =>
            {
                if (DateTime.UtcNow - lastFolderWarning < TimeSpan.FromMinutes(10)) return;
                lastFolderWarning = DateTime.UtcNow;
                tray.ShowBalloonTip(10000, S.T("FolderGoneTitle"), S.T("FolderGoneText", folder), ToolTipIcon.Warning);
            });
        }

        // ---------- windows ----------

        // `force` pulls the window in front of other apps; only for requests that came from elsewhere
        // (a second start from the Start menu). Otherwise Windows' normal focus rules apply, so a window
        // never jumps in front of something the user is typing into.
        public void ShowHome() => ShowHome(false);

        public void ShowHome(bool force)
        {
            if (home != null && !home.IsDisposed)
            {
                Raise(home, force);
                return;
            }
            home = new HomeForm(this);
            home.FormClosed += (s, e) => home = null;
            home.Show();
            Raise(home, force);
        }

        static void Raise(Form f, bool force)
        {
            if (force) Ui.Front(f);
            else f.Activate();
        }

        public bool Paired => Settings.Current.Paired;

        // ---------- pairing ----------

        public bool PairBusy => pairLock.CurrentCount == 0;

        public static void OpenUrl(string url)
        {
            try { Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }); }
            catch (Exception e) { Log.Warn("open url: " + e.Message); }
        }

        // Our own browser extension is connected without asking (see ApiServer.FromOwnExtension).
        public bool AutoPair(string client)
        {
            Log.Info("pairing " + client + ": allowed (own extension)");
            Post(() => home?.RefreshState());
            return true;
        }

        // Anything else that asks for access (the Tampermonkey script): the user decides in a small prompt.
        public async Task<bool> RequestPairing(string client)
        {
            if (!await pairLock.WaitAsync(0)) return false;
            try
            {
                var tcs = new TaskCompletionSource<bool>();
                Post(() => ShowPairPrompt(client, tcs));
                var done = await Task.WhenAny(tcs.Task, Task.Delay(120000));
                bool ok = done == tcs.Task && tcs.Task.Result;
                Post(() =>
                {
                    pairPrompt?.Close();
                    pairPrompt = null;
                    home?.RefreshState();
                });
                Log.Info("pairing " + client + ": " + (ok ? "allowed" : "not allowed"));
                return ok;
            }
            finally { pairLock.Release(); }
        }

        void ShowPairPrompt(string client, TaskCompletionSource<bool> tcs)
        {
            var f = new Form
            {
                Text = S.T("PairTitle"),
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false,
                StartPosition = FormStartPosition.CenterScreen,
                TopMost = true,
                ShowInTaskbar = true,
                Icon = Ui.AppIcon(),
                BackColor = System.Drawing.Color.White,
                Font = Ui.Body,
                AutoSize = true,
                AutoSizeMode = AutoSizeMode.GrowAndShrink,
            };
            // Placed with a margin on every side (an auto-sized form ignores its own padding here).
            var flow = new FlowLayoutPanel
            {
                FlowDirection = FlowDirection.TopDown, AutoSize = true, WrapContents = false,
                Location = new System.Drawing.Point(Ui.S(24), Ui.S(20)), Margin = new Padding(0, 0, Ui.S(24), Ui.S(20)),
            };
            flow.Controls.Add(Ui.Para(S.T("PairAsk", client), Ui.S(380)));
            var buttons = new FlowLayoutPanel { FlowDirection = FlowDirection.RightToLeft, WrapContents = false, Size = new System.Drawing.Size(Ui.S(380), Ui.S(40)), Margin = new Padding(0, Ui.S(10), 0, 0) };
            var allow = Ui.Button(S.T("Allow"), (s, e) => { tcs.TrySetResult(true); f.Close(); }, true);
            var deny = Ui.Button(S.T("Deny"), (s, e) => { tcs.TrySetResult(false); f.Close(); });
            allow.Margin = new Padding(Ui.S(8), 0, 0, 0);
            deny.Margin = new Padding(0);
            buttons.Controls.Add(allow);
            buttons.Controls.Add(deny);
            flow.Controls.Add(buttons);
            f.Controls.Add(flow);
            f.AcceptButton = allow;
            f.CancelButton = deny;
            f.FormClosed += (s, e) => tcs.TrySetResult(false);
            pairPrompt = f;
            f.Show();
            Ui.Front(f);
        }

        // ---------- folder ----------

        public string FolderState()
        {
            var folder = Settings.Current.Folder;
            if (folderCache.folder == folder && DateTime.UtcNow - folderCache.at < TimeSpan.FromSeconds(10)) return folderCache.state;
            var st = Folders.Check(folder, false);
            folderCache = (st, DateTime.UtcNow, folder);
            return st;
        }

        // Native Windows folder picker, in front of the browser. Returns null when canceled or unusable.
        public Task<string> ChooseFolder()
        {
            return OnUi(() =>
            {
                Form owner = null;
                try
                {
                    owner = home;
                    bool temp = owner == null || !owner.Visible;
                    if (temp)
                    {
                        owner = new Form { ShowInTaskbar = false, FormBorderStyle = FormBorderStyle.None, Size = new System.Drawing.Size(1, 1), StartPosition = FormStartPosition.CenterScreen, TopMost = true, Opacity = 0 };
                        owner.Show();
                    }
                    Ui.Front(owner);
                    try
                    {
                        while (true)
                        {
                            var path = FolderPicker.Pick(owner, S.T("PickFolder"), Settings.Current.Folder);
                            if (path == null) return null;
                            if (Folders.Check(path, true) == "ok")
                            {
                                Settings.Current.Folder = path;
                                Settings.Current.Save();
                                folderCache = default;
                                Log.Info("folder: " + path);
                                home?.RefreshState();
                                Jobs.Notify(); // open YouTube tabs show the new folder at once
                                return path;
                            }
                            MessageBox.Show(owner, S.T("FolderBad"), S.T("AppName"), MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        }
                    }
                    finally
                    {
                        if (temp) owner.Dispose();
                    }
                }
                catch (Exception e)
                {
                    Log.Error("choose folder", e);
                    return null;
                }
            });
        }

        public bool OpenFolder()
        {
            var folder = Settings.Current.Folder;
            if (Folders.Check(folder, true) != "ok") return false;
            try
            {
                Process.Start(new ProcessStartInfo("explorer.exe", Args.Quote(folder)) { UseShellExecute = true });
                return true;
            }
            catch { return false; }
        }

        public bool Reveal(string file)
        {
            try
            {
                if (file != null && File.Exists(file))
                {
                    Process.Start(new ProcessStartInfo("explorer.exe", "/select," + Args.Quote(file)) { UseShellExecute = true });
                    return true;
                }
                return OpenFolder();
            }
            catch { return false; }
        }

        public Dictionary<string, object> Status()
        {
            var folder = Settings.Current.Folder;
            return new Dictionary<string, object>
            {
                ["version"] = Version,
                ["folder"] = folder,
                ["folderName"] = string.IsNullOrEmpty(folder) ? "" : (Path.GetFileName(folder.TrimEnd('\\')) is string n && n.Length > 0 ? n : folder),
                ["folderState"] = FolderState(),
                ["ready"] = Components.Ready,
                ["keepRunning"] = Settings.Current.KeepRunning,
                ["active"] = Jobs.ActiveCount,
                ["sessionWanted"] = Session.Wanted,
            };
        }

        // ---------- lifetime ----------

        void WatchEvents()
        {
            void Watch(string name, Action a)
            {
                try
                {
                    var h = new EventWaitHandle(false, EventResetMode.AutoReset, name);
                    events.Add(h);
                    ThreadPool.RegisterWaitForSingleObject(h, (st, to) => Post(a), null, -1, false);
                }
                catch (Exception e) { Log.Warn("event " + name + ": " + e.Message); }
            }
            Watch(ShowEvent, () => ShowHome(true));
            Watch(SetupEvent, () => ShowHome(true));
            Watch(ExitEvent, () => ExitApp(false));
        }

        void CheckIdle()
        {
            if (exiting || Settings.Current.KeepRunning || Jobs.Busy) return;
            if (home != null || pairPrompt != null) return;
            var idle = TimeSpan.FromMinutes(3);
            if (DateTime.UtcNow - Api.LastActivity < idle || DateTime.UtcNow - started < idle) return;
            Log.Info("idle, closing");
            ExitApp(false);
        }

        void ScheduleUpdateCheck()
        {
            // The yt-dlp copy we installed is refreshed about once a week, only while nothing is downloading.
            if (Components.YtDlp == null || !Components.YtDlp.Managed) return;
            if (Time.Now - Settings.Current.LastUpdateCheck < 7L * 24 * 3600 * 1000) return;
            Task.Run(async () =>
            {
                await Task.Delay(20000);
                if (!Jobs.Busy && !exiting) await Components.UpdateYtDlp(CancellationToken.None);
            });
        }

        public void ExitApp(bool ask)
        {
            if (exiting) return;
            var n = Jobs.ActiveCount;
            if (ask && n > 0 && MessageBox.Show(S.T("ExitAsk", n), S.T("AppName"), MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return;
            exiting = true;
            idleTimer.Stop();
            tray.Visible = false;
            try { home?.Close(); } catch { }
            Jobs.Shutdown();
            Api.Stop();
            foreach (var h in events) h.Dispose();
            Log.Info("exit");
            ExitThread();
        }

        // Last words on a crash: keep the queue on disk so it continues next time.
        public void Emergency()
        {
            try { Jobs.Save(); } catch { }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                tray.Dispose();
                idleTimer.Dispose();
                ui.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
