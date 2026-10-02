using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace YTDM
{
    // The extension's picture-in-picture window for Shorts (Chrome's Document Picture-in-Picture) has no fixed
    // shape: Chrome's own border changes one side only, and the extension can put the window back in shape
    // only after the drag. While such a window is open the extension tells the app about it (POST /v1/pip), and
    // the app takes over drags on that border: a press on it is kept from Chrome, and the window follows the
    // pointer in the video's shape, the edges across from the one dragged staying put, like the browser's own
    // picture-in-picture window. Nothing else is touched; the hook watching the mouse exists only while that
    // window is open. All sizes here are physical pixels (the threads are per-monitor DPI aware).
    static class PipSizer
    {
        sealed class Reg
        {
            public string Owner, Title;
            public double Ratio, Dpr, MinW, MaxW; // the video's width / height; CSS pixel scale; inner width limits in CSS pixels
            public int InnerW, InnerH; // in CSS pixels, as the window's page last saw them
            public long At;
        }

        sealed class Drag
        {
            public int Dir; // HTLEFT .. HTBOTTOMRIGHT
            public int X0, Y0, X, Y;
            public RECT Start, Work; // the window when the drag began; its screen's work area
            public int Cw, Ch, Fw, Fh; // content size, and frame (borders and title bar) around it
            public double Ratio, Min, Max;
            public long At = Time.Now;
            public bool Done;
        }

        static readonly object L = new object();
        static Reg reg;
        static IntPtr win; // the window, once found
        static int topBar = -1; // Chrome's title bar inside the window's client area
        static volatile Drag drag;
        static int gen; // the current pair of threads (the mouse hook's, the sizing one's)
        static bool running;
        static uint hookThreadId;
        static readonly AutoResetEvent Wake = new AutoResetEvent(false);
        static HookProc hookProc;

        // False for values that make no sense.
        public static bool Set(Dictionary<string, object> j, string owner)
        {
            lock (L)
            {
                if (!j.Bool("open"))
                {
                    if (reg != null && reg.Owner == owner) Stop();
                    return true;
                }
                var r = new Reg
                {
                    Owner = owner,
                    Title = (j.Str("title") ?? "").Trim(),
                    Ratio = j.Num("ratio"),
                    Dpr = j.Num("dpr", 1),
                    MinW = j.Num("minW"),
                    MaxW = j.Num("maxW"),
                    InnerW = j.Int("iw"),
                    InnerH = j.Int("ih"),
                    At = Time.Now,
                };
                if (r.Ratio < 0.2 || r.Ratio > 5 || r.Dpr < 0.5 || r.Dpr > 8 || r.InnerW < 50 || r.InnerH < 50
                    || r.MinW < 50 || r.MaxW < r.MinW || r.MaxW > 20000 || r.Title.Length > 400) return false;
                if (reg == null || reg.Owner != owner) { win = IntPtr.Zero; topBar = -1; }
                reg = r;
                if (win != IntPtr.Zero)
                {
                    var was = SetThreadDpiAwarenessContext(PER_MONITOR_AWARE_V2); // the window's real pixels on any screen
                    try { Measure(); } finally { SetThreadDpiAwarenessContext(was); }
                }
                if (!running) Start();
            }
            return true;
        }

        static void Start()
        {
            int g = ++gen;
            running = true;
            hookThreadId = 0;
            new Thread(() => HookLoop(g)) { IsBackground = true, Name = "pip hook" }.Start();
            new Thread(() => SizeLoop(g)) { IsBackground = true, Name = "pip size" }.Start();
        }

        static void Stop()
        {
            reg = null;
            win = IntPtr.Zero;
            drag = null;
            if (hookThreadId != 0) PostThreadMessage(hookThreadId, WM_QUIT, IntPtr.Zero, IntPtr.Zero);
        }

        // The extension's window: a topmost Chrome window of its page's size, preferably with its page's title
        // (Chrome may not have taken a new one over yet).
        static IntPtr Find(Reg r)
        {
            IntPtr best = IntPtr.Zero;
            int bestOff = int.MaxValue;
            var cls = new StringBuilder(64);
            var text = new StringBuilder(512);
            int cw = (int)Math.Round(r.InnerW * r.Dpr), ch = (int)Math.Round(r.InnerH * r.Dpr);
            EnumWindows((h, _) =>
            {
                if (!IsWindowVisible(h) || GetWindow(h, GW_OWNER) != IntPtr.Zero || (GetWindowLong(h, GWL_EXSTYLE) & WS_EX_TOPMOST) == 0) return true;
                cls.Clear();
                GetClassName(h, cls, cls.Capacity);
                if (cls.ToString() != "Chrome_WidgetWin_1") return true;
                GetClientRect(h, out var c);
                if (Math.Abs(c.R - cw) > 2 || c.B < ch - 2 || c.B > ch + 80 * r.Dpr) return true;
                text.Clear();
                GetWindowText(h, text, text.Capacity);
                int off = Math.Abs(c.R - cw) + (text.ToString().Trim() == r.Title ? 0 : 100);
                if (off < bestOff) { best = h; bestOff = off; }
                return true;
            }, IntPtr.Zero);
            return best;
        }

        // Chrome's title bar is part of the client area: what isn't the page's height.
        static void Measure()
        {
            var r = reg;
            if (r == null || win == IntPtr.Zero || !GetClientRect(win, out var c)) return;
            if (Math.Abs(c.R - r.InnerW * r.Dpr) > 2) return; // changed since the page measured it
            int bar = c.B - (int)Math.Round(r.InnerH * r.Dpr);
            if (bar >= 0 && bar <= 80 * r.Dpr) topBar = bar;
        }

        static void HookLoop(int g)
        {
            SetThreadDpiAwarenessContext(PER_MONITOR_AWARE_V2);
            hookProc = OnMouse;
            var hook = SetWindowsHookEx(WH_MOUSE_LL, hookProc, GetModuleHandle(null), 0);
            if (hook == IntPtr.Zero) Log.Warn("pip: no mouse hook (" + Marshal.GetLastWin32Error() + ")");
            lock (L) if (gen == g) hookThreadId = GetCurrentThreadId();
            SetTimer(IntPtr.Zero, IntPtr.Zero, 500, IntPtr.Zero);
            bool told = false;
            while (hook != IntPtr.Zero && GetMessage(out var m, IntPtr.Zero, 0, 0) > 0)
            {
                if (m.message != WM_TIMER) continue;
                lock (L)
                {
                    var r = reg;
                    if (r == null || gen != g) break;
                    if (win != IntPtr.Zero && !IsWindow(win)) { Stop(); break; } // closed
                    if (win == IntPtr.Zero)
                    {
                        win = Find(r);
                        if (win != IntPtr.Zero) { Measure(); if (!told) Log.Info("pip: Shorts window found, its border resizes it in shape"); told = true; }
                        else if (Time.Now - r.At > 10000) { Stop(); break; } // not there (another browser, or closed already)
                    }
                    var d = drag;
                    if (d != null && Time.Now - d.At > 120000) drag = null; // its release was never seen
                }
            }
            if (hook != IntPtr.Zero) UnhookWindowsHookEx(hook);
            lock (L)
            {
                if (gen != g) return;
                running = false;
                hookThreadId = 0;
                drag = null;
                Wake.Set(); // the sizing thread ends as well
                if (reg != null) Start(); // opened again meanwhile
            }
        }

        // Runs for every mouse event in the system while the window is open: only a press on its border, and the
        // moves and the release that follow it, are acted on; everything else passes straight through.
        static IntPtr OnMouse(int code, IntPtr wp, IntPtr lp)
        {
            if (code >= 0)
            {
                int msg = wp.ToInt32();
                var d = drag;
                if (d != null && !d.Done)
                {
                    if (msg == WM_MOUSEMOVE || msg == WM_LBUTTONUP)
                    {
                        var p = Marshal.PtrToStructure<MSLLHOOKSTRUCT>(lp);
                        d.X = p.x;
                        d.Y = p.y;
                        if (msg == WM_LBUTTONUP) d.Done = true;
                        Wake.Set();
                        if (msg == WM_LBUTTONUP) return (IntPtr)1;
                    }
                    else if (msg == WM_LBUTTONDOWN) drag = null; // its release was missed: this press is a new one
                }
                else if (msg == WM_LBUTTONDOWN)
                {
                    var p = Marshal.PtrToStructure<MSLLHOOKSTRUCT>(lp);
                    if (TryStart(p.x, p.y)) return (IntPtr)1;
                }
            }
            return CallNextHookEx(IntPtr.Zero, code, wp, lp);
        }

        static bool TryStart(int x, int y)
        {
            IntPtr w;
            Reg r;
            int bar;
            lock (L) { w = win; r = reg; bar = topBar; }
            if (w == IntPtr.Zero || r == null || bar < 0 || !GetWindowRect(w, out var rc)) return false;
            if (x < rc.L || x >= rc.R || y < rc.T || y >= rc.B) return false;
            var pt = new POINT { x = x, y = y };
            if (GetAncestor(WindowFromPoint(pt), GA_ROOT) != w) return false; // something lies on top of it there
            if (SendMessageTimeout(w, WM_NCHITTEST, IntPtr.Zero, (IntPtr)((y << 16) | (x & 0xFFFF)), SMTO_ABORTIFHUNG, 50, out var hit) == IntPtr.Zero) return false;
            int dir = hit.ToInt32();
            if (dir < HTLEFT || dir > HTBOTTOMRIGHT || !GetClientRect(w, out var c)) return false;
            int fw = rc.R - rc.L - c.R;
            int fh = rc.B - rc.T - c.B + bar;
            var mi = new MONITORINFO { size = Marshal.SizeOf(typeof(MONITORINFO)) };
            if (!GetMonitorInfo(MonitorFromWindow(w, MONITOR_DEFAULTTONEAREST), ref mi)) return false;
            drag = new Drag
            {
                Dir = dir, X0 = x, Y0 = y, X = x, Y = y, Start = rc, Work = mi.work,
                Cw = c.R, Ch = c.B - bar, Fw = fw, Fh = fh,
                Ratio = r.Ratio, Min = r.MinW * r.Dpr, Max = r.MaxW * r.Dpr,
            };
            return true;
        }

        // Puts the window where the pointer asks, one change at a time (Chrome lays the page out for each),
        // always to the latest position; never on the hook's thread, so the mouse never waits for Chrome.
        static void SizeLoop(int g)
        {
            SetThreadDpiAwarenessContext(PER_MONITOR_AWARE_V2);
            while (true)
            {
                Wake.WaitOne(1000);
                IntPtr w;
                lock (L)
                {
                    if (gen != g || !running) return;
                    w = win;
                }
                var d = drag;
                if (d == null || w == IntPtr.Zero) continue;
                var to = Target(d);
                SetWindowPos(w, IntPtr.Zero, to.L, to.T, to.R - to.L, to.B - to.T, SWP_NOZORDER | SWP_NOACTIVATE | SWP_NOOWNERZORDER);
                if (d.Done && drag == d) drag = null;
            }
        }

        static RECT Target(Drag d)
        {
            bool w = d.Dir == HTLEFT || d.Dir == HTTOPLEFT || d.Dir == HTBOTTOMLEFT;
            bool e = d.Dir == HTRIGHT || d.Dir == HTTOPRIGHT || d.Dir == HTBOTTOMRIGHT;
            bool n = d.Dir == HTTOP || d.Dir == HTTOPLEFT || d.Dir == HTTOPRIGHT;
            bool s = d.Dir == HTBOTTOM || d.Dir == HTBOTTOMLEFT || d.Dir == HTBOTTOMRIGHT;
            int dx = d.X - d.X0, dy = d.Y - d.Y0;
            double nw = d.Cw + (e ? dx : w ? -dx : 0);
            double nh = d.Ch + (s ? dy : n ? -dy : 0);
            if (!n && !s) nh = nw / d.Ratio;
            else if (!w && !e) nw = nh * d.Ratio;
            else if (Math.Abs(nw / d.Cw - 1) >= Math.Abs(nh / d.Ch - 1)) nh = nw / d.Ratio; // a corner: the side pulled further leads
            else nw = nh * d.Ratio;
            // Not past its screen's edges (the title bar stays reachable), unless it already was when the drag began.
            var a = d.Work;
            double roomW = (w ? d.Start.R - a.L : a.R - d.Start.L) - d.Fw;
            double roomH = (n ? d.Start.B - a.T : a.B - d.Start.T) - d.Fh;
            nw = Math.Min(nw, Math.Max(d.Cw, Math.Min(roomW, roomH * d.Ratio)));
            nw = Math.Max(d.Min, Math.Min(d.Max, nw));
            int iw = (int)Math.Round(nw);
            int ih = (int)Math.Round(nw / d.Ratio);
            int ow = iw + d.Fw, oh = ih + d.Fh;
            int left = w ? d.Start.R - ow : d.Start.L;
            int top = n ? d.Start.B - oh : d.Start.T;
            return new RECT { L = left, T = top, R = left + ow, B = top + oh };
        }

        const int WH_MOUSE_LL = 14, WM_TIMER = 0x113, WM_QUIT = 0x12, WM_MOUSEMOVE = 0x200, WM_LBUTTONDOWN = 0x201, WM_LBUTTONUP = 0x202;
        const int WM_NCHITTEST = 0x84, HTLEFT = 10, HTRIGHT = 11, HTTOP = 12, HTTOPLEFT = 13, HTTOPRIGHT = 14, HTBOTTOMLEFT = 16, HTBOTTOM = 15, HTBOTTOMRIGHT = 17;
        const int GWL_EXSTYLE = -20, WS_EX_TOPMOST = 0x8;
        const uint GW_OWNER = 4, GA_ROOT = 2, SMTO_ABORTIFHUNG = 2, MONITOR_DEFAULTTONEAREST = 2;
        const uint SWP_NOZORDER = 0x4, SWP_NOACTIVATE = 0x10, SWP_NOOWNERZORDER = 0x200;
        static readonly IntPtr PER_MONITOR_AWARE_V2 = new IntPtr(-4);

        [StructLayout(LayoutKind.Sequential)] struct RECT { public int L, T, R, B; }
        [StructLayout(LayoutKind.Sequential)] struct POINT { public int x, y; }
        [StructLayout(LayoutKind.Sequential)] struct MONITORINFO { public int size; public RECT monitor, work; public uint flags; }
        [StructLayout(LayoutKind.Sequential)] struct MSLLHOOKSTRUCT { public int x, y; public uint data, flags, time; public IntPtr extra; }
        [StructLayout(LayoutKind.Sequential)] struct MSG { public IntPtr hwnd; public uint message; public IntPtr wParam, lParam; public uint time; public POINT pt; }

        delegate IntPtr HookProc(int code, IntPtr wp, IntPtr lp);
        delegate bool EnumProc(IntPtr h, IntPtr l);

        [DllImport("user32.dll", SetLastError = true)] static extern IntPtr SetWindowsHookEx(int id, HookProc proc, IntPtr mod, uint thread);
        [DllImport("user32.dll")] static extern bool UnhookWindowsHookEx(IntPtr hook);
        [DllImport("user32.dll")] static extern IntPtr CallNextHookEx(IntPtr hook, int code, IntPtr wp, IntPtr lp);
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode)] static extern IntPtr GetModuleHandle(string name);
        [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
        [DllImport("user32.dll")] static extern int GetMessage(out MSG m, IntPtr h, uint min, uint max);
        [DllImport("user32.dll")] static extern bool PostThreadMessage(uint thread, uint msg, IntPtr wp, IntPtr lp);
        [DllImport("user32.dll")] static extern UIntPtr SetTimer(IntPtr h, IntPtr id, uint ms, IntPtr proc);
        [DllImport("user32.dll")] static extern IntPtr SetThreadDpiAwarenessContext(IntPtr ctx);
        [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc f, IntPtr l);
        [DllImport("user32.dll")] static extern bool IsWindow(IntPtr h);
        [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
        [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr h, uint cmd);
        [DllImport("user32.dll")] static extern int GetWindowLong(IntPtr h, int i);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(IntPtr h, StringBuilder s, int n);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
        [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h, out RECT r);
        [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr h, out RECT r);
        [DllImport("user32.dll")] static extern IntPtr WindowFromPoint(POINT p);
        [DllImport("user32.dll")] static extern IntPtr GetAncestor(IntPtr h, uint flags);
        [DllImport("user32.dll")] static extern IntPtr SendMessageTimeout(IntPtr h, uint msg, IntPtr wp, IntPtr lp, uint flags, uint ms, out IntPtr result);
        [DllImport("user32.dll")] static extern IntPtr MonitorFromWindow(IntPtr h, uint flags);
        [DllImport("user32.dll")] static extern bool GetMonitorInfo(IntPtr mon, ref MONITORINFO mi);
        [DllImport("user32.dll")] static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
    }
}
