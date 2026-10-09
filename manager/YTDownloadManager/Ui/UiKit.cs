using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Globalization;
using System.Linq;
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

        // A popup menu in the theme (tray menu, dropdowns).
        public static ContextMenuStrip Menu()
        {
            var m = new ContextMenuStrip { Font = Body, Renderer = new MenuRenderer(), ShowImageMargin = false, ShowCheckMargin = false, Padding = new Padding(S(2), S(4), S(2), S(4)) };
            m.HandleCreated += (s, e) => Draw.RoundWindow(m.Handle);
            m.Opening += (s, e) =>
            {
                // A check margin only when an item is checked (the dropdowns); the tray menu has none.
                m.ShowCheckMargin = false;
                foreach (ToolStripItem i in m.Items) if (i is ToolStripMenuItem t && t.Checked) m.ShowCheckMargin = true;
                foreach (ToolStripItem i in m.Items) if (!(i is ToolStripSeparator)) i.Padding = new Padding(S(4), S(5), S(10), S(5));
            };
            return m;
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

    static class Draw
    {
        public static GraphicsPath Round(RectangleF r, float radius)
        {
            var p = new GraphicsPath();
            float d = Math.Min(radius * 2, Math.Min(r.Width, r.Height));
            if (d <= 0) { p.AddRectangle(r); return p; }
            p.AddArc(r.X, r.Y, d, d, 180, 90);
            p.AddArc(r.Right - d, r.Y, d, d, 270, 90);
            p.AddArc(r.Right - d, r.Bottom - d, d, d, 0, 90);
            p.AddArc(r.X, r.Bottom - d, d, d, 90, 90);
            p.CloseFigure();
            return p;
        }

        public static Color Mix(Color a, Color b, double t) =>
            Color.FromArgb((int)(a.R + (b.R - a.R) * t), (int)(a.G + (b.G - a.G) * t), (int)(a.B + (b.B - a.B) * t));

        [DllImport("dwmapi.dll")] static extern int DwmSetWindowAttribute(IntPtr h, int attr, ref int value, int size);

        // Rounded corners for a popup (Windows 11; older Windows keeps square ones).
        public static void RoundWindow(IntPtr h)
        {
            int round = 2; // DWMWCP_ROUND
            try { DwmSetWindowAttribute(h, 33, ref round, 4); } catch { }
        }
    }

    // A section of the window: a rounded box with a title and one control per row.
    sealed class Card : TableLayoutPanel
    {
        public readonly int Inner;

        public Card(int width, string title = null)
        {
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.ResizeRedraw, true);
            ColumnCount = 1;
            AutoSize = true;
            AutoSizeMode = AutoSizeMode.GrowAndShrink;
            MinimumSize = MaximumSize = new Size(width, 0);
            Padding = new Padding(Ui.S(16), Ui.S(12), Ui.S(16), Ui.S(14));
            Margin = new Padding(0, 0, 0, Ui.S(12));
            BackColor = Ui.Card;
            Inner = width - Padding.Horizontal;
            if (title != null)
                Controls.Add(new Label { Text = title, AutoSize = true, Font = Ui.Small, ForeColor = Ui.Text2, Margin = new Padding(0, 0, 0, Ui.S(6)), UseMnemonic = false });
        }

        // A row with text on the left and a control on the right.
        public void Line(string text, Control right, bool divider = false)
        {
            if (divider) Controls.Add(new Panel { Height = 1, Width = Inner, BackColor = Ui.Border, Margin = new Padding(0, Ui.S(6), 0, Ui.S(6)) });
            var row = new TableLayoutPanel { ColumnCount = 2, AutoSize = true, MinimumSize = new Size(Inner, 0), MaximumSize = new Size(Inner, 0), Margin = new Padding(0) };
            row.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            row.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            row.Controls.Add(new Label { Text = text, AutoSize = true, MaximumSize = new Size(Inner - right.Width - Ui.S(12), 0), ForeColor = Ui.Text, Anchor = AnchorStyles.Left, Margin = new Padding(0), UseMnemonic = false }, 0, 0);
            right.Anchor = AnchorStyles.Right;
            right.Margin = new Padding(Ui.S(12), Ui.S(2), 0, Ui.S(2));
            row.Controls.Add(right, 1, 0);
            Controls.Add(row);
        }

        protected override void OnPaintBackground(PaintEventArgs e)
        {
            var g = e.Graphics;
            g.Clear(Parent?.BackColor ?? Ui.Back);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            using (var p = Draw.Round(new RectangleF(0.5f, 0.5f, Width - 1.5f, Height - 1.5f), Ui.S(8)))
            using (var b = new SolidBrush(Ui.Card))
            using (var pen = new Pen(Ui.Border))
            {
                g.FillPath(b, p);
                g.DrawPath(pen, p);
            }
        }
    }

    // A status badge: a colored dot and a word on a lightly tinted pill ("Connected").
    sealed class Pill : Control
    {
        Color color = Ui.Text2;

        public Pill()
        {
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
            Font = Ui.BodyBold;
            AccessibleRole = AccessibleRole.StaticText;
        }

        public void Set(string text, Color c)
        {
            if (Text == text && color == c) return;
            Text = text;
            AccessibleName = text;
            color = c;
            var t = TextRenderer.MeasureText(text, Font, Size.Empty, TextFormatFlags.NoPadding);
            Size = new Size(t.Width + Ui.S(36), Math.Max(t.Height, Ui.S(16)) + Ui.S(10));
            Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            var back = Parent?.BackColor ?? Ui.Back;
            g.Clear(back);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            using (var p = Draw.Round(new RectangleF(0, 0, Width - 1, Height - 1), (Height - 1) / 2f))
            using (var b = new SolidBrush(Draw.Mix(back, color, Ui.Dark ? 0.16 : 0.12)))
                g.FillPath(b, p);
            float d = Ui.S(8), x = Ui.S(12), y = (Height - d) / 2f;
            using (var halo = new SolidBrush(Color.FromArgb(70, color))) g.FillEllipse(halo, x - Ui.S(2), y - Ui.S(2), d + Ui.S(4), d + Ui.S(4));
            using (var dot = new SolidBrush(color)) g.FillEllipse(dot, x, y, d, d);
            var r = new Rectangle(Ui.S(26), 0, Width - Ui.S(26), Height);
            TextRenderer.DrawText(g, Text, Font, r, color, TextFormatFlags.VerticalCenter | TextFormatFlags.NoPadding | TextFormatFlags.SingleLine);
        }
    }

    // An on/off switch like Windows 11's.
    sealed class Toggle : Control
    {
        bool on, hover;
        public event EventHandler CheckedChanged;

        public Toggle(string name)
        {
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.Selectable, true);
            Size = new Size(Ui.S(40), Ui.S(20));
            TabStop = true;
            Cursor = Cursors.Hand;
            AccessibleRole = AccessibleRole.CheckButton;
            AccessibleName = name;
        }

        public bool Checked
        {
            get => on;
            set
            {
                if (on == value) return;
                on = value;
                AccessibleDescription = on ? "on" : "off";
                Invalidate();
                CheckedChanged?.Invoke(this, EventArgs.Empty);
            }
        }

        protected override void OnClick(EventArgs e) { Focus(); Checked = !Checked; base.OnClick(e); }
        protected override void OnKeyDown(KeyEventArgs e) { if (e.KeyCode == Keys.Space) { Checked = !Checked; e.Handled = true; } base.OnKeyDown(e); }
        protected override void OnMouseEnter(EventArgs e) { hover = true; Invalidate(); base.OnMouseEnter(e); }
        protected override void OnMouseLeave(EventArgs e) { hover = false; Invalidate(); base.OnMouseLeave(e); }
        protected override void OnGotFocus(EventArgs e) { Invalidate(); base.OnGotFocus(e); }
        protected override void OnLostFocus(EventArgs e) { Invalidate(); base.OnLostFocus(e); }

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            g.Clear(Parent?.BackColor ?? Ui.Back);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            var r = new RectangleF(1, 1, Width - 3, Height - 3);
            using (var track = Draw.Round(r, r.Height / 2))
            {
                if (on)
                    using (var b = new SolidBrush(hover ? Ui.AccentHover : Ui.Accent)) g.FillPath(b, track);
                else
                    using (var pen = new Pen(Ui.Text2, Math.Max(1, Ui.Scale))) g.DrawPath(pen, track);
            }
            float k = on ? r.Height - Ui.S(8) : r.Height - Ui.S(10);
            float cx = on ? r.Right - Ui.S(4) - k : r.X + Ui.S(5), cy = r.Y + (r.Height - k) / 2;
            using (var knob = new SolidBrush(on ? Ui.AccentText : Ui.Text2)) g.FillEllipse(knob, cx, cy, k, k);
            if (Focused && ShowFocusCues)
                using (var p = Draw.Round(new RectangleF(0, 0, Width - 1, Height - 1), (Height - 1) / 2f))
                using (var pen = new Pen(Ui.Text) { DashStyle = DashStyle.Dot }) g.DrawPath(pen, p);
        }
    }

    // A dropdown in the theme: a rounded box with the choice and a chevron, opening a themed menu.
    sealed class DropDown : Control
    {
        readonly List<KeyValuePair<string, string>> items = new List<KeyValuePair<string, string>>();
        string value;
        bool hover, open;
        public event Action<string> Picked;

        public DropDown(string name, int width)
        {
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.Selectable | ControlStyles.ResizeRedraw, true);
            Font = Ui.Body;
            Size = new Size(width, Ui.S(32));
            TabStop = true;
            Cursor = Cursors.Hand;
            AccessibleRole = AccessibleRole.ComboBox;
            AccessibleName = name;
        }

        public void Add(string key, string text) => items.Add(new KeyValuePair<string, string>(key, text));

        public string Value
        {
            get => value;
            set
            {
                this.value = value;
                AccessibleDescription = Current;
                Invalidate();
            }
        }

        string Current => items.FirstOrDefault(i => i.Key == value).Value ?? "";

        protected override void OnClick(EventArgs e) { Focus(); ShowMenu(); base.OnClick(e); }
        protected override void OnKeyDown(KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Space || e.KeyCode == Keys.Enter || e.KeyCode == Keys.Down || (e.Alt && e.KeyCode == Keys.Down)) { ShowMenu(); e.Handled = true; }
            base.OnKeyDown(e);
        }
        protected override bool IsInputKey(Keys k) => k == Keys.Down || k == Keys.Enter || base.IsInputKey(k);
        protected override void OnMouseEnter(EventArgs e) { hover = true; Invalidate(); base.OnMouseEnter(e); }
        protected override void OnMouseLeave(EventArgs e) { hover = false; Invalidate(); base.OnMouseLeave(e); }
        protected override void OnGotFocus(EventArgs e) { Invalidate(); base.OnGotFocus(e); }
        protected override void OnLostFocus(EventArgs e) { Invalidate(); base.OnLostFocus(e); }

        void ShowMenu()
        {
            var menu = Ui.Menu();
            menu.Font = Font;
            foreach (var i in items)
            {
                var key = i.Key;
                var item = new ToolStripMenuItem(i.Value) { Checked = key == value };
                item.Click += (s, e) =>
                {
                    if (key == value) return;
                    Value = key;
                    Picked?.Invoke(key);
                };
                menu.Items.Add(item);
            }
            menu.MinimumSize = new Size(Width, 0);
            menu.Closed += (s, e) =>
            {
                open = false;
                Invalidate();
                BeginInvoke((Action)menu.Dispose);
            };
            open = true;
            Invalidate();
            menu.Show(this, new Point(0, Height + Ui.S(4)));
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            g.Clear(Parent?.BackColor ?? Ui.Back);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            var fill = Ui.Dark ? (hover || open ? Color.FromArgb(0x38, 0x38, 0x38) : Color.FromArgb(0x2D, 0x2D, 0x2D)) : (hover || open ? Color.FromArgb(0xF5, 0xF5, 0xF5) : Color.White);
            var edge = open || Focused ? Ui.Accent : hover ? Ui.Text2 : Ui.Dark ? Color.FromArgb(0x4A, 0x4A, 0x4A) : Color.FromArgb(0xC8, 0xC8, 0xC8);
            using (var p = Draw.Round(new RectangleF(0.5f, 0.5f, Width - 1.5f, Height - 1.5f), Ui.S(6)))
            using (var b = new SolidBrush(fill))
            using (var pen = new Pen(edge, open || Focused ? Math.Max(1, Ui.Scale) : 1))
            {
                g.FillPath(b, p);
                g.DrawPath(pen, p);
            }
            int arrowZone = Ui.S(36);
            var text = new Rectangle(Ui.S(12), 0, Width - Ui.S(12) - arrowZone, Height);
            TextRenderer.DrawText(g, Current, Font, text, Ui.Text, TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis | TextFormatFlags.NoPadding | TextFormatFlags.SingleLine);
            // The chevron: small, in the secondary text color, well inside the right edge.
            float cx = Width - Ui.S(18), cy = Height / 2f, w = Ui.S(5), h = Ui.S(3);
            using (var pen = new Pen(hover || open ? Ui.Text : Ui.Text2, Math.Max(1.4f, 1.4f * Ui.Scale)) { StartCap = LineCap.Round, EndCap = LineCap.Round, LineJoin = LineJoin.Round })
                g.DrawLines(pen, open
                    ? new[] { new PointF(cx - w, cy + h / 2), new PointF(cx, cy - h), new PointF(cx + w, cy + h / 2) }
                    : new[] { new PointF(cx - w, cy - h / 2), new PointF(cx, cy + h), new PointF(cx + w, cy - h / 2) });
        }
    }

    // Menus (tray and dropdowns) in the window's light or dark colors, with rounded corners on Windows 11.
    sealed class MenuColors : ProfessionalColorTable
    {
        static readonly Color Pop = Ui.Dark ? Color.FromArgb(0x2C, 0x2C, 0x2C) : Color.FromArgb(0xF9, 0xF9, 0xF9);
        static readonly Color Hot = Ui.Dark ? Color.FromArgb(0x3D, 0x3D, 0x3D) : Color.FromArgb(0xE9, 0xE9, 0xE9);
        public override Color ToolStripDropDownBackground => Pop;
        public override Color ImageMarginGradientBegin => Pop;
        public override Color ImageMarginGradientMiddle => Pop;
        public override Color ImageMarginGradientEnd => Pop;
        public override Color MenuBorder => Ui.Dark ? Color.FromArgb(0x45, 0x45, 0x45) : Color.FromArgb(0xD5, 0xD5, 0xD5);
        public override Color MenuItemBorder => Hot;
        public override Color MenuItemSelected => Hot;
        public override Color MenuItemSelectedGradientBegin => Hot;
        public override Color MenuItemSelectedGradientEnd => Hot;
        public override Color SeparatorDark => Ui.Border;
        public override Color SeparatorLight => Ui.Border;
        public override Color CheckBackground => Pop;
        public override Color CheckSelectedBackground => Hot;
        public override Color CheckPressedBackground => Hot;
    }

    sealed class MenuRenderer : ToolStripProfessionalRenderer
    {
        public MenuRenderer() : base(new MenuColors()) { RoundedEdges = false; }

        protected override void OnRenderItemText(ToolStripItemTextRenderEventArgs e)
        {
            e.TextColor = e.Item.Enabled ? Ui.Text : Ui.Text2;
            base.OnRenderItemText(e);
        }

        protected override void OnRenderArrow(ToolStripArrowRenderEventArgs e)
        {
            e.ArrowColor = Ui.Text2;
            base.OnRenderArrow(e);
        }

        protected override void OnRenderItemCheck(ToolStripItemImageRenderEventArgs e)
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            var r = e.ImageRectangle;
            float s = Math.Min(r.Width, r.Height) * 0.5f, x = r.X + (r.Width - s) / 2, y = r.Y + (r.Height - s) / 2;
            using (var pen = new Pen(Ui.Accent, Math.Max(1.6f, 1.6f * Ui.Scale)) { StartCap = LineCap.Round, EndCap = LineCap.Round, LineJoin = LineJoin.Round })
                g.DrawLines(pen, new[] { new PointF(x, y + s * 0.55f), new PointF(x + s * 0.38f, y + s * 0.9f), new PointF(x + s, y + s * 0.12f) });
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
