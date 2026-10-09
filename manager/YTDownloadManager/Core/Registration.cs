using System;
using System.IO;
using System.Runtime.InteropServices;
using Microsoft.Win32;

namespace YTDM
{
    // Per-user registration only (no admin rights, nothing machine-wide, no background service):
    // the ytdm: link the browser uses to start the manager, the Start menu and desktop shortcuts, the
    // entry in Settings > Apps, and the start with Windows.
    static class Registration
    {
        public const string Protocol = "ytdm";
        public const string UninstallKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\YTDownloadManager";
        const string RunKey = @"Software\Microsoft\Windows\CurrentVersion\Run";
        const string RunName = "YT Download Manager";

        public static string ShortcutPath => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "YT Download Manager.lnk");
        public static string DesktopShortcutPath => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "YT Download Manager.lnk");

        public static void RegisterProtocol(string exe)
        {
            using (var k = Registry.CurrentUser.CreateSubKey(@"Software\Classes\" + Protocol))
            {
                k.SetValue("", "URL:YT Download Manager");
                k.SetValue("URL Protocol", "");
                using (var icon = k.CreateSubKey("DefaultIcon")) icon.SetValue("", "\"" + exe + "\",0");
                using (var cmd = k.CreateSubKey(@"shell\open\command")) cmd.SetValue("", "\"" + exe + "\" --background \"%1\"");
            }
        }

        public static void RegisterUninstall(string exe, string version, long sizeKb)
        {
            using (var k = Registry.CurrentUser.CreateSubKey(UninstallKey))
            {
                k.SetValue("DisplayName", "YT Download Manager");
                k.SetValue("DisplayVersion", version);
                k.SetValue("Publisher", "YT Download Manager");
                k.SetValue("DisplayIcon", "\"" + exe + "\",0");
                k.SetValue("InstallLocation", Path.GetDirectoryName(exe));
                k.SetValue("UninstallString", "\"" + exe + "\" --uninstall");
                k.SetValue("QuietUninstallString", "\"" + exe + "\" --uninstall --quiet");
                k.SetValue("InstallDate", DateTime.Now.ToString("yyyyMMdd"));
                k.SetValue("EstimatedSize", (int)Math.Max(1, sizeKb), RegistryValueKind.DWord);
                k.SetValue("NoModify", 1, RegistryValueKind.DWord);
                k.SetValue("NoRepair", 1, RegistryValueKind.DWord);
            }
        }

        public static string InstalledVersion()
        {
            try
            {
                using (var k = Registry.CurrentUser.OpenSubKey(UninstallKey)) return k?.GetValue("DisplayVersion") as string;
            }
            catch { return null; }
        }

        public static string InstalledExe()
        {
            try
            {
                using (var k = Registry.CurrentUser.OpenSubKey(UninstallKey))
                {
                    var dir = k?.GetValue("InstallLocation") as string;
                    return dir == null ? null : Path.Combine(dir, Paths.ExeName);
                }
            }
            catch { return null; }
        }

        public static void SetAutostart(string exe, bool on)
        {
            try
            {
                using (var k = Registry.CurrentUser.CreateSubKey(RunKey))
                {
                    if (on) k.SetValue(RunName, "\"" + exe + "\" --background");
                    else if (k.GetValue(RunName) != null) k.DeleteValue(RunName);
                }
            }
            catch (Exception e) { Log.Warn("autostart: " + e.Message); }
        }

        public static void CreateShortcuts(string exe)
        {
            CreateShortcut(exe, ShortcutPath);
            CreateShortcut(exe, DesktopShortcutPath);
        }

        static void CreateShortcut(string exe, string path)
        {
            object shell = null, link = null;
            try
            {
                var t = Type.GetTypeFromProgID("WScript.Shell");
                shell = Activator.CreateInstance(t);
                dynamic sh = shell;
                link = sh.CreateShortcut(path);
                dynamic l = link;
                l.TargetPath = exe;
                l.WorkingDirectory = Path.GetDirectoryName(exe);
                l.Description = "YT Download Manager";
                l.IconLocation = exe + ",0";
                l.Save();
            }
            catch (Exception e) { Log.Warn("shortcut: " + e.Message); }
            finally
            {
                if (link != null) Marshal.FinalReleaseComObject(link);
                if (shell != null) Marshal.FinalReleaseComObject(shell);
            }
        }

        // Everything the app registered, plus the entries Windows itself adds for it: whether its autostart is
        // allowed (Task Manager's Startup apps), the first-use note for its ytdm: links, and its tray icon setting.
        public static void RemoveAll()
        {
            try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Classes\" + Protocol, false); } catch { }
            try { Registry.CurrentUser.DeleteSubKeyTree(UninstallKey, false); } catch { }
            SetAutostart(null, false);
            DeleteValue(@"Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run", RunName);
            DeleteValue(@"Software\Microsoft\Windows\CurrentVersion\ApplicationAssociationToasts", Protocol + "_" + Protocol);
            try
            {
                using (var tray = Registry.CurrentUser.OpenSubKey(@"Control Panel\NotifyIconSettings", true))
                {
                    if (tray != null)
                        foreach (var id in tray.GetSubKeyNames())
                        {
                            string path;
                            using (var k = tray.OpenSubKey(id)) path = k?.GetValue("ExecutablePath") as string;
                            // A full path, or one starting with a known-folder id instead of the user's AppData\Local
                            if (path != null && path.EndsWith(@"\Programs\" + Paths.AppName + @"\" + Paths.ExeName, StringComparison.OrdinalIgnoreCase))
                                tray.DeleteSubKeyTree(id, false);
                        }
                }
            }
            catch { }
            try { if (File.Exists(ShortcutPath)) File.Delete(ShortcutPath); } catch { }
            try { if (File.Exists(DesktopShortcutPath)) File.Delete(DesktopShortcutPath); } catch { }
        }

        static void DeleteValue(string key, string name)
        {
            try
            {
                using (var k = Registry.CurrentUser.OpenSubKey(key, true))
                    if (k?.GetValue(name) != null) k.DeleteValue(name);
            }
            catch { }
        }
    }
}
