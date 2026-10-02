using System;
using System.Diagnostics;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows.Forms;
using Microsoft.Win32;

namespace YTDM
{
    // Helps add the browser extension: browsers only allow an unpacked extension to be added by hand,
    // so this opens the right extensions page and puts the folder path on the clipboard.
    static class ExtensionHelp
    {
        public static bool Available => Directory.Exists(Paths.ExtensionDir) && File.Exists(Path.Combine(Paths.ExtensionDir, "manifest.json"));

        public static void CopyPath()
        {
            try { Clipboard.SetText(Paths.ExtensionDir); }
            catch (Exception e) { Log.Warn("clipboard: " + e.Message); }
        }

        // The default browser's own extensions page (chrome://extensions, edge://extensions, ...).
        public static void OpenExtensionsPage()
        {
            var exe = DefaultBrowserExe();
            var name = Path.GetFileName(exe ?? "").ToLowerInvariant();
            string page = name == "msedge.exe" ? "edge://extensions" : name == "brave.exe" ? "brave://extensions"
                : name == "opera.exe" || name == "launcher.exe" ? "opera://extensions" : name == "vivaldi.exe" ? "vivaldi://extensions" : "chrome://extensions";
            if (exe == null || !File.Exists(exe) || name == "firefox.exe")
            {
                // No Chromium browser as the default: try Chrome, then Edge.
                exe = new[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                }.FirstOrDefaultExisting();
                page = exe != null && exe.EndsWith("msedge.exe", StringComparison.OrdinalIgnoreCase) ? "edge://extensions" : "chrome://extensions";
            }
            if (exe == null) return;
            try { Process.Start(new ProcessStartInfo(exe, page) { UseShellExecute = false }); }
            catch (Exception e) { Log.Warn("open extensions page: " + e.Message); }
        }

        static string FirstOrDefaultExisting(this string[] paths)
        {
            foreach (var p in paths) if (File.Exists(p)) return p;
            return null;
        }

        static string DefaultBrowserExe()
        {
            try
            {
                string progId;
                using (var k = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\Shell\Associations\UrlAssociations\https\UserChoice"))
                    progId = k?.GetValue("ProgId") as string;
                if (string.IsNullOrEmpty(progId)) return null;
                using (var k = Registry.ClassesRoot.OpenSubKey(progId + @"\shell\open\command"))
                {
                    var cmd = k?.GetValue("") as string ?? "";
                    var m = Regex.Match(cmd, "^\\s*\"([^\"]+)\"|^\\s*(\\S+)");
                    return m.Success ? (m.Groups[1].Success ? m.Groups[1].Value : m.Groups[2].Value) : null;
                }
            }
            catch { return null; }
        }
    }
}
