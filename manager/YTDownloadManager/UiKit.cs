using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace YTDM
{
    static class Ui
    {
        public static readonly Color Accent = Color.FromArgb(0x0F, 0x6C, 0xBD);
        public static readonly Color AccentHover = Color.FromArgb(0x11, 0x5E, 0xA3);
        public static readonly Color Text = Color.FromArgb(0x1B, 0x1B, 0x1B);
        public static readonly Color Text2 = Color.FromArgb(0x5F, 0x5F, 0x5F);
        public static readonly Color Border = Color.FromArgb(0xE0, 0xE0, 0xE0);
        public static readonly Color Footer = Color.FromArgb(0xF3, 0xF3, 0xF3);
        public static readonly Color Card = Color.FromArgb(0xF7, 0xF7, 0xF7);
        public static readonly Color Ok = Color.FromArgb(0x0F, 0x7B, 0x0F);
        public static readonly Color Bad = Color.FromArgb(0xC4, 0x2B, 0x1C);
        public static readonly Color Warn = Color.FromArgb(0x9D, 0x5D, 0x00);

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
                UseVisualStyleBackColor = !primary,
                UseMnemonic = false,
            };
            if (primary)
            {
                b.FlatStyle = FlatStyle.Flat;
                b.FlatAppearance.BorderSize = 0;
                b.BackColor = Accent;
                b.ForeColor = Color.White;
                b.FlatAppearance.MouseOverBackColor = AccentHover;
                b.FlatAppearance.MouseDownBackColor = AccentHover;
                b.EnabledChanged += (s, e) =>
                {
                    b.BackColor = b.Enabled ? Accent : Color.FromArgb(0xC8, 0xC8, 0xC8);
                    b.ForeColor = b.Enabled ? Color.White : Color.FromArgb(0x70, 0x70, 0x70);
                };
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
