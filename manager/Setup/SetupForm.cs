using System;
using System.Diagnostics;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace YTDM
{
    // The whole installer: Install, then "Installing…", then "Ready." with Open. Run again on a PC that has the
    // app, it offers Update (a newer version) or Repair (the same one), and Uninstall. Everything else (tools,
    // folders, settings, shortcuts) is taken care of without asking. Light or dark like Windows' apps.
    sealed class SetupForm : Form
    {
        readonly BundleInstaller bundle;
        readonly Label status;
        readonly SlimBar bar;
        readonly Button primary, secondary;
        readonly LinkLabel details;
        enum Stage { Start, Maintain, ConfirmRemove, Working, Done, Removed, Failed }
        enum Job { Install, Update, Repair, Remove }
        Stage stage = Stage.Start;
        Job job = Job.Install;

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
            Ui.Theme(this);
            Font = Ui.Body;
            ClientSize = new Size(Ui.S(420), Ui.S(300));
            int w = ClientSize.Width;

            var logo = new PictureBox { Image = Ui.AppBitmap(128), SizeMode = PictureBoxSizeMode.Zoom, Size = new Size(Ui.S(80), Ui.S(80)) };
            logo.Location = new Point((w - logo.Width) / 2, Ui.S(30));
            var title = new Label { Text = S.T("AppName"), Font = Ui.Title, ForeColor = Ui.Text, AutoSize = false, TextAlign = ContentAlignment.MiddleCenter, UseMnemonic = false };
            title.SetBounds(0, logo.Bottom + Ui.S(12), w, Ui.S(32));
            status = new Label { Font = Ui.Body, ForeColor = Ui.Text2, AutoSize = false, TextAlign = ContentAlignment.TopCenter, UseMnemonic = false };
            status.SetBounds(Ui.S(32), title.Bottom + Ui.S(4), w - Ui.S(64), Ui.S(44));
            bar = new SlimBar { Visible = false };
            bar.SetBounds(Ui.S(64), status.Top + Ui.S(32), w - Ui.S(128), Ui.S(4));
            details = new LinkLabel { Text = S.T("SetDetails"), AutoSize = true, Font = Ui.Small, LinkColor = Ui.Text2, ActiveLinkColor = Ui.Text, LinkBehavior = LinkBehavior.HoverUnderline, Visible = false, UseMnemonic = false };
            details.Location = new Point(Ui.S(20), ClientSize.Height - Ui.S(38));
            details.LinkClicked += (s, e) =>
            {
                try { Process.Start(new ProcessStartInfo("explorer.exe", Args.Quote(Paths.Logs)) { UseShellExecute = true }); } catch { }
            };

            primary = Ui.Button("", (s, e) => OnPrimary(), true);
            secondary = Ui.Button("", (s, e) => OnSecondary());
            Controls.AddRange(new Control[] { logo, title, status, bar, details, primary, secondary });
            bar.BringToFront(); // it lies inside the status text's area (room for two lines)
            AcceptButton = primary;
            Show(bundle.InstalledVersion == null ? Stage.Start : Stage.Maintain);
        }

        // -1: an older version is installed, 0: this one, 1: a newer one.
        int Installed()
        {
            if (!Version.TryParse(bundle.InstalledVersion ?? "", out var have) || !Version.TryParse(bundle.Version, out var mine)) return -1;
            return Math.Sign(have.CompareTo(mine));
        }

        void Show(Stage s)
        {
            stage = s;
            string first = null, second = null, text = "";
            var color = Ui.Text2;
            switch (s)
            {
                case Stage.Start:
                    first = S.T("SetInstall");
                    break;
                case Stage.Maintain:
                    var have = bundle.InstalledVersion;
                    int c = Installed();
                    text = c < 0 ? S.T("SetCanUpdate", have, bundle.Version) : c == 0 ? S.T("SetUpToDate", have) : S.T("SetNewerInstalled", have);
                    first = c < 0 ? S.T("SetUpdate") : c == 0 ? S.T("SetRepair") : S.T("SetInstallVersion", bundle.Version);
                    second = S.T("SetUninstall");
                    break;
                case Stage.ConfirmRemove:
                    text = S.T("SetRemoveAsk");
                    color = Ui.Text;
                    first = S.T("SetUninstall");
                    second = S.T("Cancel");
                    break;
                case Stage.Working:
                    text = S.T(job == Job.Remove ? "SetRemoving" : job == Job.Update ? "SetUpdating" : job == Job.Repair ? "SetRepairing" : "SetInstalling");
                    break;
                case Stage.Done:
                    text = S.T(job == Job.Update ? "SetUpdated" : job == Job.Repair ? "SetRepaired" : "SetReady");
                    color = Ui.Text;
                    first = S.T("Open");
                    second = S.T("Close");
                    break;
                case Stage.Removed:
                    text = S.T("SetRemoved");
                    color = Ui.Text;
                    first = S.T("Close");
                    break;
                case Stage.Failed:
                    text = S.T("SetFailed");
                    color = Ui.Bad;
                    first = S.T("TryAgain");
                    second = S.T("Close");
                    break;
            }
            status.Text = text;
            status.ForeColor = color;
            primary.Text = first ?? "";
            secondary.Text = second ?? "";
            bar.Visible = s == Stage.Working && job != Job.Remove;
            details.Visible = s == Stage.Failed;
            primary.Visible = first != null;
            secondary.Visible = second != null;
            ControlBox = s != Stage.Working;
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
                case Stage.Removed:
                    Close();
                    return;
                case Stage.Start:
                    job = Job.Install;
                    await Install();
                    return;
                case Stage.Maintain:
                    job = Installed() < 0 ? Job.Update : Job.Repair;
                    await Install();
                    return;
                case Stage.ConfirmRemove:
                    job = Job.Remove;
                    await Remove();
                    return;
                case Stage.Failed:
                    if (job == Job.Remove) await Remove();
                    else await Install();
                    return;
            }
        }

        void OnSecondary()
        {
            switch (stage)
            {
                case Stage.Maintain:
                    Show(Stage.ConfirmRemove);
                    return;
                case Stage.ConfirmRemove:
                    Show(Stage.Maintain);
                    return;
                default:
                    Close();
                    return;
            }
        }

        async Task Install()
        {
            Show(Stage.Working);
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

        async Task Remove()
        {
            Show(Stage.Working);
            try
            {
                await bundle.Remove();
                Show(Stage.Removed);
            }
            catch (Exception e)
            {
                Log.Error("setup remove", e);
                Show(Stage.Failed);
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (stage == Stage.Working) e.Cancel = true; // a few seconds; stopping halfway would leave a broken install
            base.OnFormClosing(e);
        }
    }
}
