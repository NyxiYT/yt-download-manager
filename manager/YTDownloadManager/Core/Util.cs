using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;

namespace YTDM
{
    static class Paths
    {
        public const string AppName = "YT Download Manager";
        public const string ExeName = "YTDownloadManager.exe";
        static readonly string LocalAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

        // Tests run a second copy next to the installed one: YTDM_DATA_DIR gives it its own data folder, and
        // with it its own settings (and port), and its own instance lock and signals.
        static readonly string DataOverride = Environment.GetEnvironmentVariable("YTDM_DATA_DIR");

        // Everything the app writes lives here (settings, queue, logs, downloaded components, work files).
        public static readonly string Data = string.IsNullOrEmpty(DataOverride) ? Path.Combine(LocalAppData, AppName) : Path.GetFullPath(DataOverride);
        public static readonly string InstanceSuffix = string.IsNullOrEmpty(DataOverride) ? "" : "." + Rand.Sha256(Data.ToLowerInvariant()).Substring(0, 8);
        public static readonly string InstallDir = Path.Combine(LocalAppData, "Programs", AppName);
        // The browser extension the installer puts next to the app (loaded with "Load unpacked").
        public static string ExtensionDir => Path.Combine(InstallDir, "extension");

        public static string Bin => Ensure(Path.Combine(Data, "bin"));
        public static string Work => Ensure(Path.Combine(Data, "work"));
        public static string InfoDir => Ensure(Path.Combine(Data, "work", "_info"));
        public static string Logs => Ensure(Path.Combine(Data, "logs"));
        public static string Cache => Ensure(Path.Combine(Data, "cache"));
        public static string Temp => Ensure(Path.Combine(Data, "work", "tmp"));
        public static string SettingsFile => Path.Combine(Ensure(Data), "settings.json");
        public static string JobsFile => Path.Combine(Ensure(Data), "jobs.json");
        public static string Exe => System.Reflection.Assembly.GetExecutingAssembly().Location;

        static string Ensure(string p)
        {
            Directory.CreateDirectory(p);
            return p;
        }

        [DllImport("shell32.dll")]
        static extern int SHGetKnownFolderPath([MarshalAs(UnmanagedType.LPStruct)] Guid rfid, uint flags, IntPtr token, out IntPtr path);

        public static string KnownDownloads()
        {
            try
            {
                if (SHGetKnownFolderPath(new Guid("374DE290-123F-4565-9164-39C4925E467B"), 0, IntPtr.Zero, out var p) == 0)
                {
                    try { return Marshal.PtrToStringUni(p); }
                    finally { Marshal.FreeCoTaskMem(p); }
                }
            }
            catch { }
            return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads");
        }

        public static string DefaultFolder => KnownDownloads(); // the same place the browser saves to
    }

    static class Mem
    {
        // Frees what the app no longer uses, then hands its pages to Windows. They stay on Windows' standby
        // list and come back without reading the disk the moment the app touches them again.
        public static void Trim()
        {
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();
            SetProcessWorkingSetSize(GetCurrentProcess(), (IntPtr)(-1), (IntPtr)(-1));
        }

        [DllImport("kernel32.dll")] static extern IntPtr GetCurrentProcess();
        [DllImport("kernel32.dll")] static extern bool SetProcessWorkingSetSize(IntPtr process, IntPtr min, IntPtr max);
    }

    static class Log
    {
        static readonly object L = new object();
        public static bool Off; // set while uninstalling, so nothing recreates the data folder

        public static void Info(string msg) => Write("INFO ", msg);
        public static void Warn(string msg) => Write("WARN ", msg);
        public static void Error(string msg, Exception e = null) => Write("ERROR", e == null ? msg : msg + ": " + e);

        static void Write(string level, string msg)
        {
            if (Off) return;
            try
            {
                lock (L)
                {
                    var f = Path.Combine(Paths.Logs, "manager.log");
                    var fi = new FileInfo(f);
                    if (fi.Exists && fi.Length > 1000000)
                    {
                        var f1 = f + ".1";
                        var f2 = f + ".2";
                        if (File.Exists(f2)) File.Delete(f2);
                        if (File.Exists(f1)) File.Move(f1, f2);
                        File.Move(f, f1);
                    }
                    File.AppendAllText(f, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff", CultureInfo.InvariantCulture) + " " + level + " " + msg + "\r\n", new UTF8Encoding(false));
                }
            }
            catch { }
        }
    }

    static class Json
    {
        static JavaScriptSerializer Ser() => new JavaScriptSerializer { MaxJsonLength = int.MaxValue, RecursionLimit = 1000 };
        public static object Parse(string s) => Ser().DeserializeObject(s);
        public static Dictionary<string, object> ParseObj(string s) => Parse(s) as Dictionary<string, object>;
        public static string Write(object o) => Ser().Serialize(o);
    }

    static class Ext
    {
        public static object Get(this Dictionary<string, object> d, string k) => d != null && k != null && d.TryGetValue(k, out var v) ? v : null;

        public static string Str(this Dictionary<string, object> d, string k)
        {
            var v = d.Get(k);
            return v == null ? null : v as string ?? Convert.ToString(v, CultureInfo.InvariantCulture);
        }

        public static double Num(this Dictionary<string, object> d, string k, double def = 0)
        {
            var v = d.Get(k);
            if (v == null || v is bool || (v is string s && s.Length == 0)) return def;
            try
            {
                var n = Convert.ToDouble(v, CultureInfo.InvariantCulture);
                return double.IsNaN(n) || double.IsInfinity(n) ? def : n;
            }
            catch { return def; }
        }

        public static long Long(this Dictionary<string, object> d, string k, long def = 0) => (long)Math.Round(d.Num(k, def));
        public static int Int(this Dictionary<string, object> d, string k, int def = 0) => (int)Math.Max(int.MinValue, Math.Min(int.MaxValue, Math.Round(d.Num(k, def))));
        public static bool Bool(this Dictionary<string, object> d, string k) => d.Get(k) is bool b && b;
        public static Dictionary<string, object> Obj(this Dictionary<string, object> d, string k) => d.Get(k) as Dictionary<string, object>;

        public static object[] Arr(this Dictionary<string, object> d, string k)
        {
            var v = d.Get(k);
            return v as object[] ?? (v is ArrayList al ? al.ToArray() : null);
        }

        public static string Inv(this double v, string fmt = "0.###") => v.ToString(fmt, CultureInfo.InvariantCulture);
    }

    static class Files
    {
        // Write to a temporary file first, then swap it in, so a crash never leaves a half-written file.
        public static void WriteAtomic(string path, string text)
        {
            var tmp = path + ".tmp";
            File.WriteAllText(tmp, text, new UTF8Encoding(false));
            try
            {
                if (File.Exists(path)) File.Replace(tmp, path, null, true);
                else File.Move(tmp, path);
            }
            catch
            {
                File.Copy(tmp, path, true);
                File.Delete(tmp);
            }
        }

        // Lower-case hex, as release checksum lists write it.
        public static string Sha256(string file)
        {
            using (var s = File.OpenRead(file))
            using (var h = SHA256.Create())
                return BitConverter.ToString(h.ComputeHash(s)).Replace("-", "").ToLowerInvariant();
        }

        public static void DeleteDir(string dir)
        {
            for (int i = 0; i < 3; i++)
            {
                try
                {
                    if (Directory.Exists(dir)) Directory.Delete(dir, true);
                    return;
                }
                catch (Exception e)
                {
                    if (i == 2) Log.Warn("could not remove " + dir + ": " + e.Message);
                    System.Threading.Thread.Sleep(300);
                }
            }
        }

        public static void TryDelete(string file)
        {
            try { if (file != null && File.Exists(file)) File.Delete(file); } catch { }
        }

        // Same rules as the userscript, so both engines name files alike.
        public static string SafeName(string s, int max = 150)
        {
            if (string.IsNullOrWhiteSpace(s)) return "video";
            var r = Regex.Replace(s, "[\\\\/:*?\"<>|\\x00-\\x1f]+", "_");
            r = Regex.Replace(r, "\\s+", " ").Trim();
            if (r.Length > max)
            {
                r = r.Substring(0, max);
                if (char.IsHighSurrogate(r[r.Length - 1])) r = r.Substring(0, r.Length - 1);
            }
            r = r.TrimEnd('.', ' ');
            if (Regex.IsMatch(r, "^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])(\\..*)?$", RegexOptions.IgnoreCase)) r = "_" + r;
            return r.Length == 0 ? "video" : r;
        }

        public static bool SameVolume(string a, string b)
        {
            try { return string.Equals(Path.GetPathRoot(Path.GetFullPath(a)), Path.GetPathRoot(Path.GetFullPath(b)), StringComparison.OrdinalIgnoreCase); }
            catch { return false; }
        }

        public static long FreeSpace(string path)
        {
            try
            {
                var root = Path.GetPathRoot(Path.GetFullPath(path));
                if (root.StartsWith("\\\\")) return long.MaxValue; // network share: no reliable number
                return new DriveInfo(root).AvailableFreeSpace;
            }
            catch { return long.MaxValue; }
        }

        // First free "name.ext", "name (2).ext", ... in the folder.
        public static string UniquePath(string folder, string name, string ext)
        {
            var p = Path.Combine(folder, name + "." + ext);
            for (int i = 2; File.Exists(p) || File.Exists(p + ".partial"); i++) p = Path.Combine(folder, name + " (" + i + ")." + ext);
            return p;
        }
    }

    static class Rand
    {
        static readonly RNGCryptoServiceProvider Rng = new RNGCryptoServiceProvider();

        public static byte[] Bytes(int n)
        {
            var b = new byte[n];
            lock (Rng) Rng.GetBytes(b);
            return b;
        }

        public static string Token(int bytes = 32) => Convert.ToBase64String(Bytes(bytes)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

        public static string Id()
        {
            var t = DateTime.UtcNow.Ticks.ToString("x");
            return t.Substring(Math.Max(0, t.Length - 10)) + Token(4).ToLowerInvariant().Replace("-", "a").Replace("_", "b");
        }

        public static string Sha256(string s)
        {
            using (var h = SHA256.Create())
            {
                var b = h.ComputeHash(Encoding.UTF8.GetBytes(s ?? ""));
                var sb = new StringBuilder();
                foreach (var x in b) sb.Append(x.ToString("x2"));
                return sb.ToString();
            }
        }

        public static bool FixedEquals(string a, string b)
        {
            if (a == null || b == null || a.Length != b.Length) return false;
            int d = 0;
            for (int i = 0; i < a.Length; i++) d |= a[i] ^ b[i];
            return d == 0;
        }
    }

    static class Args
    {
        // Windows command-line quoting (CommandLineToArgvW rules).
        public static string Quote(string a)
        {
            if (a == null) a = "";
            if (a.Length > 0 && a.IndexOfAny(new[] { ' ', '\t', '"' }) < 0) return a;
            var sb = new StringBuilder("\"");
            int bs = 0;
            foreach (var c in a)
            {
                if (c == '\\') { bs++; continue; }
                if (c == '"')
                {
                    sb.Append('\\', bs * 2 + 1).Append('"');
                    bs = 0;
                    continue;
                }
                sb.Append('\\', bs);
                bs = 0;
                sb.Append(c);
            }
            sb.Append('\\', bs * 2).Append('"');
            return sb.ToString();
        }

        public static string Join(IEnumerable<string> args)
        {
            var sb = new StringBuilder();
            foreach (var a in args)
            {
                if (sb.Length > 0) sb.Append(' ');
                sb.Append(Quote(a));
            }
            return sb.ToString();
        }
    }

    static class Time
    {
        public static long Now => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }
}
