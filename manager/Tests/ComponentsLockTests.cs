using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // manager/components.lock.json: what the installers carry and what the app fetches when a tool is missing.
    [TestClass]
    public class ComponentsLockTests
    {
        static string LockFile => Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "components.lock.json");

        [TestMethod]
        public void TheAppReadsTheLockBuiltIntoIt()
        {
            foreach (var p in new[] { Components.YtDlpPkg, Components.FfmpegPkg }.Concat(Environment.Is64BitOperatingSystem ? new[] { Components.DenoPkg } : new Components.Package[0]))
            {
                Assert.IsNotNull(p);
                StringAssert.Matches(p.Sha256, new Regex("^[0-9a-f]{64}$"), p.Name);
                StringAssert.StartsWith(p.Url, "https://", p.Name);
                Assert.IsFalse(p.Url.Contains("/latest/"), p.Name + " points at a moving link: " + p.Url);
                Assert.IsFalse(string.IsNullOrEmpty(p.Version), p.Name);
            }
        }

        // Every build the installers and the app use is pinned: exact link, SHA-256, never "latest".
        [TestMethod]
        public void EveryBuildIsPinned()
        {
            var tools = Json.ParseObj(File.ReadAllText(LockFile)).Obj("tools");
            var expected = new[] { "yt-dlp/x64", "yt-dlp/x86", "ffmpeg/x64", "ffmpeg/x64-shared", "ffmpeg/x86", "ffmpeg/x86-shared", "deno/x64", "node/x86" };
            foreach (var key in expected)
            {
                var parts = key.Split('/');
                var f = tools.Obj(parts[0])?.Obj(parts[1]);
                Assert.IsNotNull(f, key);
                StringAssert.Matches(f.Str("sha256"), new Regex("^[0-9a-f]{64}$"), key);
                StringAssert.Matches(f.Str("url"), new Regex("^https://(github\\.com/[^/]+/[^/]+/releases/download/|nodejs\\.org/dist/v)"), key);
                Assert.IsFalse(f.Str("url").Contains("latest"), key + ": " + f.Str("url"));
            }
            // 64-bit FFmpeg from a release branch (nX.Y), not master.
            StringAssert.Matches(tools.Obj("ffmpeg").Obj("x64").Str("version"), new Regex("^n\\d+\\.\\d+"));
        }
    }
}
