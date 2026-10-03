using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace YTDM
{
    sealed class Settings
    {
        public string Folder;
        public int Port = 17724;
        public bool KeepRunning; // start with Windows and stay in the tray
        public long LastUpdateCheck;
        public int LinkVariant; // which way of fetching stream links worked last (see Media.Variants)
        public string Lang;
        // Hashes of the tokens handed to paired browsers (the tokens themselves are never stored).
        public List<string> Tokens = new List<string>();
        // Advanced overrides, only settable in the file: full paths to specific tools.
        public string YtDlpPath, FfmpegDir, JsRuntime;
        public bool CheckUpdates = true; // only settable in the file
        public UpdateInfo Update = new UpdateInfo();
        public string RanVersion; // the version that ran last, to say "updated" once

        // The newest release GitHub reported (see AppUpdate).
        public sealed class UpdateInfo
        {
            public string Etag, Version, Url, Sha256, SumsUrl, Notified;
            public long Size, Checked;
        }

        static readonly object L = new object();
        public static Settings Current { get; private set; } = new Settings();

        public static Settings Load()
        {
            var s = new Settings();
            try
            {
                if (File.Exists(Paths.SettingsFile))
                {
                    var d = Json.ParseObj(File.ReadAllText(Paths.SettingsFile));
                    s.Folder = d.Str("folder");
                    s.Port = d.Int("port", 17724);
                    s.KeepRunning = d.Bool("keepRunning");
                    s.LastUpdateCheck = d.Long("lastUpdateCheck");
                    s.LinkVariant = d.Int("linkVariant");
                    s.Lang = d.Str("lang");
                    s.Tokens = (d.Arr("tokens") ?? new object[0]).OfType<string>().ToList();
                    s.YtDlpPath = d.Str("ytDlpPath");
                    s.FfmpegDir = d.Str("ffmpegDir");
                    s.JsRuntime = d.Str("jsRuntime");
                    s.CheckUpdates = !(d.Get("checkUpdates") is bool cu) || cu;
                    s.RanVersion = d.Str("ranVersion");
                    var u = d.Obj("update");
                    if (u != null)
                        s.Update = new UpdateInfo
                        {
                            Etag = u.Str("etag"), Version = u.Str("version"), Url = u.Str("url"), Sha256 = u.Str("sha256"),
                            SumsUrl = u.Str("sums"), Notified = u.Str("notified"), Size = u.Long("size"), Checked = u.Long("checked"),
                        };
                }
            }
            catch (Exception e) { Log.Error("settings load", e); }
            if (s.Port < 1024 || s.Port > 65535) s.Port = 17724;
            if (string.IsNullOrWhiteSpace(s.Folder)) s.Folder = Paths.DefaultFolder;
            Current = s;
            return s;
        }

        public void Save()
        {
            lock (L)
            {
                try
                {
                    var d = new Dictionary<string, object>
                    {
                        ["folder"] = Folder,
                        ["port"] = Port,
                        ["keepRunning"] = KeepRunning,
                        ["lastUpdateCheck"] = LastUpdateCheck,
                        ["linkVariant"] = LinkVariant,
                        ["lang"] = Lang,
                        ["tokens"] = Tokens.ToArray(),
                        ["ranVersion"] = RanVersion,
                        ["update"] = new Dictionary<string, object>
                        {
                            ["etag"] = Update.Etag, ["version"] = Update.Version, ["url"] = Update.Url, ["sha256"] = Update.Sha256,
                            ["sums"] = Update.SumsUrl, ["notified"] = Update.Notified, ["size"] = Update.Size, ["checked"] = Update.Checked,
                        },
                    };
                    if (!CheckUpdates) d["checkUpdates"] = false;
                    if (YtDlpPath != null) d["ytDlpPath"] = YtDlpPath;
                    if (FfmpegDir != null) d["ffmpegDir"] = FfmpegDir;
                    if (JsRuntime != null) d["jsRuntime"] = JsRuntime;
                    Files.WriteAtomic(Paths.SettingsFile, Json.Write(d));
                }
                catch (Exception e) { Log.Error("settings save", e); }
            }
        }

        public bool TokenValid(string token)
        {
            if (string.IsNullOrEmpty(token) || token.Length > 200) return false;
            var h = Rand.Sha256(token);
            lock (L) return Tokens.Any(t => Rand.FixedEquals(t, h));
        }

        public string AddToken()
        {
            var token = Rand.Token();
            lock (L)
            {
                Tokens.Add(Rand.Sha256(token));
                while (Tokens.Count > 8) Tokens.RemoveAt(0);
            }
            Save();
            return token;
        }

        public void ClearTokens()
        {
            lock (L) Tokens.Clear();
            Save();
        }

        public bool Paired
        {
            get { lock (L) return Tokens.Count > 0; }
        }
    }
}
