using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using Microsoft.Win32;

namespace YTDM
{
    static class Ui
    {
        // Light or dark like Windows' own apps (Settings > Personalization > Colors > app mode).
        // YTDM_THEME=light or dark overrides it.
        public static readonly bool Dark = ReadDark();

        public static readonly Color Back = Dark ? Color.FromArgb(0x20, 0x20, 0x20) : Color.White;
        public static readonly Color Accent = Dark ? Color.FromArgb(0x4C, 0xC2, 0xFF) : Color.FromArgb(0x0F, 0x6C, 0xBD);
        public static readonly Color AccentHover = Dark ? Color.FromArgb(0x47, 0xB1, 0xE8) : Color.FromArgb(0x11, 0x5E, 0xA3);
        public static readonly Color AccentText = Dark ? Color.Black : Color.White;
        public static readonly Color Text = Dark ? Color.White : Color.FromArgb(0x1B, 0x1B, 0x1B);
        public static readonly Color Text2 = Dark ? Color.FromArgb(0xB0, 0xB0, 0xB0) : Color.FromArgb(0x5F, 0x5F, 0x5F);
        public static readonly Color Border = Dark ? Color.FromArgb(0x3D, 0x3D, 0x3D) : Color.FromArgb(0xE0, 0xE0, 0xE0);
        public static readonly Color Footer = Dark ? Color.FromArgb(0x2B, 0x2B, 0x2B) : Color.FromArgb(0xF3, 0xF3, 0xF3);
        public static readonly Color Card = Dark ? Color.FromArgb(0x2B, 0x2B, 0x2B) : Color.FromArgb(0xF7, 0xF7, 0xF7);
        public static readonly Color Ok = Dark ? Color.FromArgb(0x6C, 0xCB, 0x5F) : Color.FromArgb(0x0F, 0x7B, 0x0F);
        public static readonly Color Bad = Dark ? Color.FromArgb(0xFF, 0x99, 0xA4) : Color.FromArgb(0xC4, 0x2B, 0x1C);
        public static readonly Color Warn = Dark ? Color.FromArgb(0xFC, 0xE1, 0x00) : Color.FromArgb(0x9D, 0x5D, 0x00);
        static readonly Color ButtonBack = Color.FromArgb(0x2D, 0x2D, 0x2D);
        static readonly Color ButtonHover = Color.FromArgb(0x38, 0x38, 0x38);
        static readonly Color ButtonBorder = Color.FromArgb(0x4A, 0x4A, 0x4A);

        static bool ReadDark()
        {
            var over = (Environment.GetEnvironmentVariable("YTDM_THEME") ?? "").Trim().ToLowerInvariant();
            if (over == "dark" || over == "light") return over == "dark";
            try
            {
                using (var k = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"))
                    return k?.GetValue("AppsUseLightTheme") is int v && v == 0;
            }
            catch { return false; }
        }

        [DllImport("dwmapi.dll")] static extern int DwmSetWindowAttribute(IntPtr h, int attr, ref int value, int size);

        // A window in the theme: its colors, and in dark mode a dark title bar.
        public static void Theme(Form f)
        {
            f.BackColor = Back;
            f.ForeColor = Text;
            if (!Dark) return;
            f.HandleCreated += (s, e) =>
            {
                int on = 1;
                if (DwmSetWindowAttribute(f.Handle, 20, ref on, 4) != 0) DwmSetWindowAttribute(f.Handle, 19, ref on, 4); // 19: Windows 10 before 20H1
            };
        }

        public static CheckBox CheckBox(string text)
        {
            var c = new CheckBox { Text = text, AutoSize = true, ForeColor = Text, UseMnemonic = false };
            if (Dark)
            {
                c.FlatStyle = FlatStyle.Flat;
                c.FlatAppearance.BorderColor = Text2;
                c.FlatAppearance.CheckedBackColor = Back;
                c.FlatAppearance.MouseOverBackColor = ButtonHover;
            }
            return c;
        }

        public static readonly Font Body = new Font("Segoe UI", 9.75f);
        public static readonly Font BodyBold = new Font("Segoe UI Semibold", 9.75f);
        public static readonly Font Small = new Font("Segoe UI", 9f);
        public static readonly Font Title = new Font("Segoe UI Semibold", 15f);

        static float scale;
        public static float Scale
        {
            get
            {
                if (scale == 0)
                {
                    using (var g = Graphics.FromHwnd(IntPtr.Zero)) scale = g.DpiX / 96f;
                }
                return scale;
            }
        }

        public static int S(int px) => (int)Math.Round(px * Scale);

        static Icon appIcon;
        public static Icon AppIcon(int size = 0)
        {
            try
            {
                using (var s = Assembly.GetExecutingAssembly().GetManifestResourceStream("app.ico"))
                {
                    if (s == null) return SystemIcons.Application;
                    return size > 0 ? new Icon(s, size, size) : (appIcon ?? (appIcon = new Icon(s)));
                }
            }
            catch { return SystemIcons.Application; }
        }

        public static Bitmap AppBitmap(int size)
        {
            using (var ic = AppIcon(size)) return ic.ToBitmap();
        }

        public static Label Para(string text, int width, Font font = null, Color? color = null)
        {
            return new Label
            {
                Text = text,
                AutoSize = true,
                MaximumSize = new Size(width, 0),
                Font = font ?? Body,
                ForeColor = color ?? Text,
                Margin = new Padding(0, 0, 0, S(10)),
                UseMnemonic = false,
            };
        }

        public static Button Button(string text, EventHandler click, bool primary = false)
        {
            var b = new Button
            {
                Text = text,
                AutoSize = true,
                AutoSizeMode = AutoSizeMode.GrowAndShrink,
                MinimumSize = new Size(S(96), S(32)),
                Padding = new Padding(S(10), 0, S(10), 0),
                Font = Body,
                UseVisualStyleBackColor = !primary && !Dark,
                UseMnemonic = false,
            };
            if (primary)
            {
                b.FlatStyle = FlatStyle.Flat;
                b.FlatAppearance.BorderSize = 0;
                b.BackColor = Accent;
                b.ForeColor = AccentText;
                b.FlatAppearance.MouseOverBackColor = AccentHover;
                b.FlatAppearance.MouseDownBackColor = AccentHover;
                b.EnabledChanged += (s, e) =>
                {
                    b.BackColor = b.Enabled ? Accent : Dark ? Color.FromArgb(0x43, 0x43, 0x43) : Color.FromArgb(0xC8, 0xC8, 0xC8);
                    b.ForeColor = b.Enabled ? AccentText : Dark ? Color.FromArgb(0x9D, 0x9D, 0x9D) : Color.FromArgb(0x70, 0x70, 0x70);
                };
            }
            else if (Dark) // the system's buttons are always light
            {
                b.FlatStyle = FlatStyle.Flat;
                b.BackColor = ButtonBack;
                b.ForeColor = Text;
                b.FlatAppearance.BorderColor = ButtonBorder;
                b.FlatAppearance.MouseOverBackColor = ButtonHover;
                b.FlatAppearance.MouseDownBackColor = ButtonBack;
            }
            if (click != null) b.Click += click;
            return b;
        }

        public static string FormatBytes(long bytes)
        {
            if (bytes <= 0) return "?";
            string[] u = { "B", "KB", "MB", "GB" };
            double v = bytes;
            int i = 0;
            while (v >= 1000 && i < u.Length - 1) { v /= 1000; i++; }
            return v.ToString(i >= 2 ? "0.#" : "0", CultureInfo.CurrentCulture) + " " + u[i];
        }

        [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
        [DllImport("user32.dll")] static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extra);

        // Windows doesn't let a background app take the focus; a tapped Alt key lifts that lock.
        public static void Front(Form f)
        {
            try
            {
                if (f.WindowState == FormWindowState.Minimized) f.WindowState = FormWindowState.Normal;
                keybd_event(0x12, 0, 0, UIntPtr.Zero);
                keybd_event(0x12, 0, 2, UIntPtr.Zero);
                SetForegroundWindow(f.Handle);
                f.Activate();
            }
            catch { }
        }
    }

    // Thin rounded progress bar in the accent color.
    sealed class SlimBar : Control
    {
        double value;

        public SlimBar()
        {
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
            Height = Ui.S(4);
        }

        public double Value
        {
            get => value;
            set
            {
                var v = Math.Max(0, Math.Min(1, value));
                if (Math.Abs(v - this.value) < 0.002) return;
                this.value = v;
                Invalidate();
            }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            g.Clear(Parent?.BackColor ?? Color.White);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            float h = Height, r = h / 2;
            void Pill(Brush b, float w)
            {
                if (w < h) w = h;
                using (var p = new GraphicsPath())
                {
                    p.AddArc(0, 0, h, h, 90, 180);
                    p.AddArc(w - h, 0, h, h, 270, 180);
                    p.CloseFigure();
                    g.FillPath(b, p);
                }
            }
            using (var track = new SolidBrush(Ui.Border)) Pill(track, Width - 1);
            if (value > 0) using (var fill = new SolidBrush(Ui.Accent)) Pill(fill, (float)((Width - 1) * value));
        }
    }
}
