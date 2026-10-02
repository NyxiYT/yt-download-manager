using System;
using System.Diagnostics;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace YTDM
{
    // The whole installer: Install, then "Installing…", then "Ready." with Open. Everything else
    // (tools, folders, settings, shortcuts, updates) is taken care of without asking.
    sealed class SetupForm : Form
    {
        readonly BundleInstaller bundle;
        readonly Label status;
        readonly SlimBar bar;
        readonly Button primary, secondary;
        readonly LinkLabel details;
        enum Stage { Start, Installing, Done, Failed }
        Stage stage = Stage.Start;

        public bool OpenApp { get; private set; }

        public SetupForm(BundleInstaller bundle)
        {
            this.bundle = bundle;
            Text = S.T("SetWindow");
            Icon = Ui.AppIcon();
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = true;
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.White;
            Font = Ui.Body;
            ClientSize = new Size(Ui.S(420), Ui.S(300));
            int w = ClientSize.Width;

            var logo = new PictureBox { Image = Ui.AppBitmap(128), SizeMode = PictureBoxSizeMode.Zoom, Size = new Size(Ui.S(80), Ui.S(80)) };
            logo.Location = new Point((w - logo.Width) / 2, Ui.S(34));
            var title = new Label { Text = S.T("AppName"), Font = Ui.Title, ForeColor = Ui.Text, AutoSize = false, TextAlign = ContentAlignment.MiddleCenter, UseMnemonic = false };
            title.SetBounds(0, logo.Bottom + Ui.S(14), w, Ui.S(32));
            status = new Label { Font = Ui.Body, ForeColor = Ui.Text2, AutoSize = false, TextAlign = ContentAlignment.MiddleCenter, UseMnemonic = false };
            status.SetBounds(Ui.S(24), title.Bottom + Ui.S(2), w - Ui.S(48), Ui.S(24));
            bar = new SlimBar { Visible = false };
            bar.SetBounds(Ui.S(64), status.Bottom + Ui.S(12), w - Ui.S(128), Ui.S(4));
            details = new LinkLabel { Text = S.T("SetDetails"), AutoSize = true, Font = Ui.Small, LinkColor = Ui.Text2, ActiveLinkColor = Ui.Text, LinkBehavior = LinkBehavior.HoverUnderline, Visible = false, UseMnemonic = false };
            details.Location = new Point(Ui.S(20), ClientSize.Height - Ui.S(38));
            details.LinkClicked += (s, e) =>
            {
                try { Process.Start(new ProcessStartInfo("explorer.exe", Args.Quote(Paths.Logs)) { UseShellExecute = true }); } catch { }
            };

            primary = Ui.Button("", (s, e) => OnPrimary(), true);
            secondary = Ui.Button(S.T("Close"), (s, e) => Close());
            Controls.AddRange(new Control[] { logo, title, status, bar, details, primary, secondary });
            AcceptButton = primary;
            Show(Stage.Start);
        }

        void Show(Stage s)
        {
            stage = s;
            bool update = bundle.InstalledVersion != null;
            switch (s)
            {
                case Stage.Start:
                    status.Text = "";
                    primary.Text = S.T(update ? "SetUpdate" : "SetInstall");
                    break;
                case Stage.Installing:
                    status.Text = S.T("SetInstalling");
                    status.ForeColor = Ui.Text2;
                    break;
                case Stage.Done:
                    status.Text = S.T("SetReady");
                    status.ForeColor = Ui.Text;
                    primary.Text = S.T("Open");
                    break;
                case Stage.Failed:
                    status.Text = S.T("SetFailed");
                    status.ForeColor = Ui.Bad;
                    primary.Text = S.T("TryAgain");
                    break;
            }
            bar.Visible = s == Stage.Installing;
            details.Visible = s == Stage.Failed;
            primary.Visible = s != Stage.Installing;
            secondary.Visible = s == Stage.Done || s == Stage.Failed;
            ControlBox = s != Stage.Installing;
            PlaceButtons();
            if (primary.Visible) primary.Focus();
        }

        void PlaceButtons()
        {
            foreach (var b in new[] { primary, secondary })
            {
                b.AutoSize = false;
                var p = b.GetPreferredSize(Size.Empty);
                b.Size = new Size(Math.Max(p.Width + Ui.S(8), b.MinimumSize.Width), Math.Max(p.Height, b.MinimumSize.Height));
            }
            int right = ClientSize.Width - Ui.S(20), bottom = ClientSize.Height - Ui.S(20);
            primary.Location = new Point(right - primary.Width, bottom - primary.Height);
            secondary.Location = new Point(primary.Left - Ui.S(8) - secondary.Width, primary.Top);
        }

        async void OnPrimary()
        {
            switch (stage)
            {
                case Stage.Done:
                    OpenApp = true;
                    Close();
                    return;
                case Stage.Start:
                case Stage.Failed:
                    await Install();
                    return;
            }
        }

        async Task Install()
        {
            Show(Stage.Installing);
            bar.Value = 0;
            try
            {
                await bundle.Run(p => BeginInvoke((Action)(() => bar.Value = p)), CancellationToken.None);
                bar.Value = 1;
                Show(Stage.Done);
            }
            catch (Exception e)
            {
                Log.Error("setup", e);
                Show(Stage.Failed);
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (stage == Stage.Installing) e.Cancel = true; // a few seconds; stopping halfway would leave a broken install
            base.OnFormClosing(e);
        }
    }
}
