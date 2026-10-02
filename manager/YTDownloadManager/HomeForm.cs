using System;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;

namespace YTDM
{
    // The app's window (Start menu, tray): where files go, whether a browser is connected, and whether
    // it starts with Windows. Nothing else.
    sealed class HomeForm : Form
    {
        readonly App app;
        readonly Label state, folderPath, browserState, addHint;
        readonly SlimBar prep;
        readonly Button add, retry;
        readonly CheckBox startup;
        bool updating;

        public HomeForm(App app)
        {
            this.app = app;
            Text = S.T("AppName");
            Icon = Ui.AppIcon();
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.White;
            Font = Ui.Body;
            AutoSize = true;
            AutoSizeMode = AutoSizeMode.GrowAndShrink;
            int w = Ui.S(380);

            var flow = new FlowLayoutPanel { FlowDirection = FlowDirection.TopDown, WrapContents = false, AutoSize = true, Padding = new Padding(Ui.S(24), Ui.S(20), Ui.S(24), Ui.S(14)) };

            var head = new TableLayoutPanel { ColumnCount = 2, AutoSize = true, Margin = new Padding(0, 0, 0, Ui.S(18)) };
            head.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, Ui.S(60)));
            head.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            var logo = new PictureBox { Image = Ui.AppBitmap(48), SizeMode = PictureBoxSizeMode.Zoom, Size = new Size(Ui.S(48), Ui.S(48)), Margin = new Padding(0) };
            head.Controls.Add(logo, 0, 0);
            head.SetRowSpan(logo, 2);
            head.Controls.Add(new Label { Text = S.T("AppName"), AutoSize = true, Font = Ui.Title, ForeColor = Ui.Text, Margin = new Padding(0), UseMnemonic = false }, 1, 0);
            state = new Label { AutoSize = true, MaximumSize = new Size(w - Ui.S(60), 0), ForeColor = Ui.Text2, Margin = new Padding(Ui.S(2), Ui.S(2), 0, 0), UseMnemonic = false };
            head.Controls.Add(state, 1, 1);
            flow.Controls.Add(head);

            prep = new SlimBar { Width = w, Margin = new Padding(0, 0, 0, Ui.S(14)), Visible = false };
            flow.Controls.Add(prep);
            retry = Ui.Button(S.T("TryAgain"), (s, e) => app.PrepareComponents());
            retry.Margin = new Padding(0, 0, 0, Ui.S(14));
            retry.Visible = false;
            flow.Controls.Add(retry);

            flow.Controls.Add(Section(S.T("HomeSaving")));
            folderPath = new Label { AutoSize = true, MaximumSize = new Size(w, 0), ForeColor = Ui.Text, Margin = new Padding(0, 0, 0, Ui.S(8)), UseMnemonic = false };
            flow.Controls.Add(folderPath);
            var fb = Row();
            fb.Controls.Add(Ui.Button(S.T("Open"), (s, e) => app.OpenFolder()));
            fb.Controls.Add(Ui.Button(S.T("Change"), async (s, e) => { await app.ChooseFolder(); RefreshState(); }));
            flow.Controls.Add(fb);

            flow.Controls.Add(Section(S.T("HomeBrowser")));
            browserState = new Label { AutoSize = true, MaximumSize = new Size(w, 0), Margin = new Padding(0, 0, 0, Ui.S(8)), UseMnemonic = false };
            flow.Controls.Add(browserState);
            // The extension can't be added from outside the browser: open its extensions page with the
            // folder path ready on the clipboard.
            add = Ui.Button(S.T("HomeAdd"), (s, e) =>
            {
                ExtensionHelp.CopyPath();
                ExtensionHelp.OpenExtensionsPage();
                addHint.Visible = true;
            });
            add.Margin = new Padding(0, 0, 0, Ui.S(8));
            flow.Controls.Add(add);
            addHint = new Label { Text = S.T("HomeAddHint"), AutoSize = true, MaximumSize = new Size(w, 0), ForeColor = Ui.Text2, Font = Ui.Small, Margin = new Padding(0, 0, 0, Ui.S(8)), Visible = false, UseMnemonic = false };
            flow.Controls.Add(addHint);

            startup = new CheckBox { Text = S.T("HomeStartup"), AutoSize = true, Margin = new Padding(0, Ui.S(8), 0, Ui.S(16)), UseMnemonic = false };
            startup.CheckedChanged += (s, e) => { if (!updating) app.SetKeepRunning(startup.Checked); };
            flow.Controls.Add(startup);

            flow.Controls.Add(new Panel { Height = 1, Width = w, BackColor = Ui.Border, Margin = new Padding(0, 0, 0, Ui.S(12)) });
            var bottom = new TableLayoutPanel { ColumnCount = 2, Width = w, Height = Ui.S(34), Margin = new Padding(0) };
            bottom.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            bottom.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            var log = new LinkLabel { Text = S.T("HomeLog"), AutoSize = true, Font = Ui.Small, LinkColor = Ui.Text2, ActiveLinkColor = Ui.Text, LinkBehavior = LinkBehavior.HoverUnderline, Anchor = AnchorStyles.Left, Margin = new Padding(0), UseMnemonic = false };
            log.LinkClicked += (s, e) =>
            {
                try { Process.Start(new ProcessStartInfo("explorer.exe", Args.Quote(Paths.Logs)) { UseShellExecute = true }); } catch { }
            };
            var close = Ui.Button(S.T("Close"), (s, e) => Close(), true);
            close.Margin = new Padding(0);
            close.Anchor = AnchorStyles.Right;
            bottom.Controls.Add(log, 0, 0);
            bottom.Controls.Add(close, 1, 0);
            flow.Controls.Add(bottom);

            Controls.Add(flow);
            AcceptButton = close;
            CancelButton = close;
            ActiveControl = close;
            RefreshState();
        }

        static Label Section(string text) => new Label { Text = text, AutoSize = true, Font = Ui.Small, ForeColor = Ui.Text2, Margin = new Padding(0, 0, 0, Ui.S(4)), UseMnemonic = false };

        static FlowLayoutPanel Row()
        {
            var p = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, AutoSize = true, Margin = new Padding(0, 0, 0, Ui.S(16)) };
            p.ControlAdded += (s, e) => e.Control.Margin = new Padding(0, 0, Ui.S(8), 0);
            return p;
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

            var st = app.FolderState();
            folderPath.Text = Settings.Current.Folder + (st == "ok" ? "" : "\n" + S.T(st == "missing" ? "FolderMissing" : "FolderReadonly"));
            folderPath.ForeColor = st == "ok" ? Ui.Text : Ui.Bad;
            browserState.Text = app.Paired ? S.T("HomeConnected") : S.T("HomeNotConnected");
            browserState.ForeColor = app.Paired ? Ui.Ok : Ui.Text2;
            add.Visible = !app.Paired && ExtensionHelp.Available;
            if (app.Paired) addHint.Visible = false;
            startup.Checked = Settings.Current.KeepRunning;
            updating = false;
        }
    }
}
