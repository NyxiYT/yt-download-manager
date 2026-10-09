using System;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;

namespace YTDM
{
    // The app's window (Start menu, tray): where files go, whether a browser is connected, and its few
    // settings (start with Windows, language). Each part sits on its own card.
    sealed class HomeForm : Form
    {
        readonly App app;
        readonly Label state, folderPath, addHint, updText;
        readonly Pill browser;
        readonly SlimBar prep, updBar;
        readonly Button add, retry, updButton;
        readonly Card updCard;
        readonly Toggle startup;
        bool updating;

        public HomeForm(App app)
        {
            this.app = app;
            Text = S.T("AppName");
            Icon = Ui.AppIcon();
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            Ui.Theme(this);
            Font = Ui.Body;
            AutoSize = true;
            AutoSizeMode = AutoSizeMode.GrowAndShrink;
            int w = Ui.S(400);

            var flow = new FlowLayoutPanel { FlowDirection = FlowDirection.TopDown, WrapContents = false, AutoSize = true, Padding = new Padding(Ui.S(20), Ui.S(18), Ui.S(20), Ui.S(14)) };

            var head = new TableLayoutPanel { ColumnCount = 2, AutoSize = true, Margin = new Padding(0, 0, 0, Ui.S(16)) };
            head.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, Ui.S(60)));
            head.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            var logo = new PictureBox { Image = Ui.AppBitmap(48), SizeMode = PictureBoxSizeMode.Zoom, Size = new Size(Ui.S(48), Ui.S(48)), Margin = new Padding(0) };
            head.Controls.Add(logo, 0, 0);
            head.SetRowSpan(logo, 2);
            head.Controls.Add(new Label { Text = S.T("AppName"), AutoSize = true, Font = Ui.Title, ForeColor = Ui.Text, Margin = new Padding(0), UseMnemonic = false }, 1, 0);
            state = new Label { AutoSize = true, MaximumSize = new Size(w - Ui.S(60), 0), ForeColor = Ui.Text2, Margin = new Padding(Ui.S(2), Ui.S(2), 0, 0), UseMnemonic = false };
            head.Controls.Add(state, 1, 1);
            flow.Controls.Add(head);

            // A newer version: which one, and one button that installs it.
            updCard = new Card(w) { Visible = false };
            var updRow = new TableLayoutPanel { ColumnCount = 2, AutoSize = true, MinimumSize = new Size(updCard.Inner, 0), MaximumSize = new Size(updCard.Inner, 0), Margin = new Padding(0) };
            updRow.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            updRow.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            updText = new Label { AutoSize = true, MaximumSize = new Size(updCard.Inner - Ui.S(140), 0), ForeColor = Ui.Text, Anchor = AnchorStyles.Left, Margin = new Padding(0), UseMnemonic = false };
            updButton = Ui.Button(S.T("UpdNow"), (s, e) => app.InstallUpdate(true), true);
            updButton.Anchor = AnchorStyles.Right;
            updButton.Margin = new Padding(Ui.S(8), 0, 0, 0);
            updRow.Controls.Add(updText, 0, 0);
            updRow.Controls.Add(updButton, 1, 0);
            updCard.Controls.Add(updRow);
            updBar = new SlimBar { Width = updCard.Inner, Margin = new Padding(0, Ui.S(10), 0, 0), Visible = false };
            updCard.Controls.Add(updBar);
            flow.Controls.Add(updCard);

            prep = new SlimBar { Width = w, Margin = new Padding(0, 0, 0, Ui.S(14)), Visible = false };
            flow.Controls.Add(prep);
            retry = Ui.Button(S.T("TryAgain"), (s, e) => app.PrepareComponents());
            retry.Margin = new Padding(0, 0, 0, Ui.S(14));
            retry.Visible = false;
            flow.Controls.Add(retry);

            var save = new Card(w, S.T("HomeSaving"));
            folderPath = new Label { AutoSize = true, MaximumSize = new Size(save.Inner, 0), ForeColor = Ui.Text, Margin = new Padding(0, 0, 0, Ui.S(10)), UseMnemonic = false };
            save.Controls.Add(folderPath);
            var fb = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, AutoSize = true, WrapContents = false, Margin = new Padding(0) };
            fb.ControlAdded += (s, e) => e.Control.Margin = new Padding(0, 0, Ui.S(8), 0);
            fb.Controls.Add(Ui.Button(S.T("Open"), (s, e) => app.OpenFolder()));
            fb.Controls.Add(Ui.Button(S.T("Change"), async (s, e) => { await app.ChooseFolder(); RefreshState(); }));
            save.Controls.Add(fb);
            flow.Controls.Add(save);

            var br = new Card(w, S.T("HomeBrowser"));
            browser = new Pill { Margin = new Padding(0, Ui.S(2), 0, 0) };
            br.Controls.Add(browser);
            // The extension can't be added from outside the browser: open its extensions page with the
            // folder path ready on the clipboard.
            add = Ui.Button(S.T("HomeAdd"), (s, e) =>
            {
                ExtensionHelp.CopyPath();
                ExtensionHelp.OpenExtensionsPage();
                addHint.Visible = true;
            }, true);
            add.Margin = new Padding(0, Ui.S(12), 0, 0);
            br.Controls.Add(add);
            addHint = new Label { Text = S.T("HomeAddHint"), AutoSize = true, MaximumSize = new Size(br.Inner, 0), ForeColor = Ui.Text2, Font = Ui.Small, Margin = new Padding(0, Ui.S(8), 0, 0), Visible = false, UseMnemonic = false };
            br.Controls.Add(addHint);
            flow.Controls.Add(br);

            var set = new Card(w, S.T("HomeSettings"));
            startup = new Toggle(S.T("HomeStartup"));
            startup.CheckedChanged += (s, e) => { if (!updating) app.SetKeepRunning(startup.Checked); };
            set.Line(S.T("HomeStartup"), startup);
            var language = new DropDown(S.T("HomeLanguage"), Ui.S(190));
            language.Add("", S.T("LangAuto") + " (" + S.Name(S.SystemLang) + ")");
            foreach (var l in S.Languages) language.Add(l.Key, l.Value);
            language.Value = Array.Exists(S.Languages, l => l.Key == Settings.Current.Lang) ? Settings.Current.Lang : "";
            language.Picked += code => app.SetLanguage(code.Length == 0 ? null : code);
            set.Line(S.T("HomeLanguage"), language, true);
            flow.Controls.Add(set);

            var bottom = new TableLayoutPanel { ColumnCount = 2, Width = w, Height = Ui.S(36), Margin = new Padding(0, Ui.S(4), 0, 0) };
            bottom.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            bottom.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            var left = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, AutoSize = true, WrapContents = false, Anchor = AnchorStyles.Left, Margin = new Padding(0) };
            var log = new LinkLabel { Text = S.T("HomeLog"), AutoSize = true, Font = Ui.Small, LinkColor = Ui.Text2, ActiveLinkColor = Ui.Text, LinkBehavior = LinkBehavior.HoverUnderline, Margin = new Padding(0), UseMnemonic = false };
            log.LinkClicked += (s, e) =>
            {
                try { Process.Start(new ProcessStartInfo("explorer.exe", Args.Quote(Paths.Logs)) { UseShellExecute = true }); } catch { }
            };
            left.Controls.Add(log);
            left.Controls.Add(new Label { Text = "·  " + S.T("HomeVersion", App.Version), AutoSize = true, Font = Ui.Small, ForeColor = Ui.Text2, Margin = new Padding(Ui.S(6), 0, 0, 0), UseMnemonic = false });
            var close = Ui.Button(S.T("Close"), (s, e) => Close(), true);
            close.Margin = new Padding(0);
            close.Anchor = AnchorStyles.Right;
            bottom.Controls.Add(left, 0, 0);
            bottom.Controls.Add(close, 1, 0);
            flow.Controls.Add(bottom);

            Controls.Add(flow);
            AcceptButton = close;
            CancelButton = close;
            ActiveControl = close;
            RefreshState();
        }

        public void RefreshState()
        {
            if (IsDisposed) return;
            if (InvokeRequired)
            {
                BeginInvoke((Action)RefreshState);
                return;
            }
            updating = true;
            var n = app.Jobs.ActiveCount;
            if (app.Preparing)
            {
                state.Text = S.T("HomePreparing");
                state.ForeColor = Ui.Text2;
            }
            else if (app.PrepareFailed)
            {
                state.Text = S.T("HomePrepareFailed");
                state.ForeColor = Ui.Bad;
            }
            else
            {
                state.Text = n > 0 ? S.T("HomeActive", n) : S.T("HomeReady");
                state.ForeColor = Ui.Text2;
            }
            prep.Visible = app.Preparing;
            prep.Value = app.PrepareProgress;
            retry.Visible = app.PrepareFailed && !app.Preparing;

            var v = AppUpdate.Available;
            updCard.Visible = v != null;
            if (v != null)
            {
                bool busy = AppUpdate.Busy, failed = AppUpdate.Failed && !busy;
                updText.Text = busy ? S.T("UpdLoading", v) : failed ? S.T("UpdFailed") : S.T("UpdAvail", v);
                updText.ForeColor = failed ? Ui.Bad : Ui.Text;
                updButton.Text = failed ? S.T("TryAgain") : S.T("UpdNow");
                updButton.Visible = !busy;
                updBar.Visible = busy;
                updBar.Value = AppUpdate.Progress;
            }

            var st = app.FolderState();
            folderPath.Text = Settings.Current.Folder + (st == "ok" ? "" : "\n" + S.T(st == "missing" ? "FolderMissing" : "FolderReadonly"));
            folderPath.ForeColor = st == "ok" ? Ui.Text : Ui.Bad;
            browser.Set(app.Paired ? S.T("HomeConnected") : S.T("HomeNotConnected"), app.Paired ? Ui.Ok : Ui.Text2);
            add.Visible = !app.Paired && ExtensionHelp.Available;
            if (app.Paired) addHint.Visible = false;
            startup.Checked = Settings.Current.KeepRunning;
            updating = false;
        }
    }
}
