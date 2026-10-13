using System.Collections.Generic;
using System.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    [TestClass]
    public class FileNameTests
    {
        // No half of a surrogate pair left on its own (Windows takes it, but the name shows as garbage).
        static void Whole(string s)
        {
            for (int i = 0; i < s.Length; i++)
            {
                if (char.IsHighSurrogate(s[i])) Assert.IsTrue(i + 1 < s.Length && char.IsLowSurrogate(s[i + 1]), "lone high surrogate at " + i + " in " + s);
                else if (char.IsLowSurrogate(s[i])) Assert.IsTrue(i > 0 && char.IsHighSurrogate(s[i - 1]), "lone low surrogate at " + i + " in " + s);
            }
        }

        // ---------- Files.SafeName ----------

        [DataTestMethod]
        [DataRow(null, "video")]
        [DataRow("", "video")]
        [DataRow("   ", "video")]
        [DataRow("...", "video")]
        [DataRow("Big Buck Bunny", "Big Buck Bunny")]
        [DataRow("a/b\\c:d*e?f\"g<h>i|j", "a_b_c_d_e_f_g_h_i_j")]
        [DataRow("AC/DC // live", "AC_DC _ live")]
        [DataRow("tab\there", "tab_here")]
        [DataRow("line\r\nbreak", "line_break")]
        [DataRow("  lots   of\u00a0 space  ", "lots of space")]
        [DataRow("ends with dots...", "ends with dots")]
        [DataRow("ends with . . .", "ends with")]
        [DataRow("Ünïcødé 日本語", "Ünïcødé 日本語")]
        public void CleansNames(string title, string expected) => Assert.AreEqual(expected, Files.SafeName(title));

        [DataTestMethod]
        [DataRow("CON", "_CON")]
        [DataRow("con", "_con")]
        [DataRow("Nul", "_Nul")]
        [DataRow("NUL ", "_NUL")]
        [DataRow("aux.mp4", "_aux.mp4")]
        [DataRow("COM1", "_COM1")]
        [DataRow("LPT9.txt", "_LPT9.txt")]
        [DataRow("PRN.", "_PRN")]
        [DataRow("CONSOLE", "CONSOLE")]
        [DataRow("COM10", "COM10")]
        [DataRow("my CON", "my CON")]
        [DataRow("CONIN$", "_CONIN$")]
        [DataRow("conout$.txt", "_conout$.txt")]
        [DataRow("COM¹", "_COM¹")]
        [DataRow("lpt³.mp4", "_lpt³.mp4")]
        [DataRow("CON .txt", "_CON .txt")]
        [DataRow("nul   .tar.gz", "_nul .tar.gz")]
        [DataRow("AUX cable review", "AUX cable review")]
        [DataRow("COM⁴", "COM⁴")]
        public void ReservedNamesGetAPrefix(string title, string expected) => Assert.AreEqual(expected, Files.SafeName(title));

        [TestMethod]
        public void LongTitlesAreCut()
        {
            Assert.AreEqual(150, Files.SafeName(new string('a', 400)).Length);
            Assert.AreEqual(20, Files.SafeName(new string('a', 400), 20).Length);
            Assert.AreEqual("abc", Files.SafeName("abc", 20));
        }

        [TestMethod]
        public void CutNeverEndsInADotOrSpace()
        {
            var s = Files.SafeName(new string('a', 148) + ". tail");
            Assert.AreEqual(new string('a', 148), s);
        }

        [TestMethod]
        public void CutKeepsSurrogatePairsWhole()
        {
            for (int pad = 0; pad < 4; pad++)
            {
                var title = new string('a', pad) + string.Concat(System.Linq.Enumerable.Repeat("😀", 120));
                var s = Files.SafeName(title);
                Whole(s);
                Assert.IsTrue(s.Length == 150 || s.Length == 149, s.Length.ToString());
            }
        }

        // ---------- Files.UniquePath ----------

        [TestMethod]
        public void FreeNameIsUsedAsIs()
        {
            using (var t = new TempDir())
                Assert.AreEqual(Path.Combine(t.Dir, "Big Buck Bunny.mp4"), Files.UniquePath(t.Dir, "Big Buck Bunny", "mp4"));
        }

        [TestMethod]
        public void TakenNamesGetANumber()
        {
            using (var t = new TempDir())
            {
                File.WriteAllText(Path.Combine(t.Dir, "Bunny.mp4"), "");
                Assert.AreEqual(Path.Combine(t.Dir, "Bunny (2).mp4"), Files.UniquePath(t.Dir, "Bunny", "mp4"));
                File.WriteAllText(Path.Combine(t.Dir, "Bunny (2).mp4"), "");
                Assert.AreEqual(Path.Combine(t.Dir, "Bunny (3).mp4"), Files.UniquePath(t.Dir, "Bunny", "mp4"));
                // Another format of the same title is a different file.
                Assert.AreEqual(Path.Combine(t.Dir, "Bunny.mp3"), Files.UniquePath(t.Dir, "Bunny", "mp3"));
            }
        }

        [TestMethod]
        public void NameBeingWrittenCountsAsTaken()
        {
            using (var t = new TempDir())
            {
                File.WriteAllText(Path.Combine(t.Dir, "Bunny.mp4.partial"), "");
                Assert.AreEqual(Path.Combine(t.Dir, "Bunny (2).mp4"), Files.UniquePath(t.Dir, "Bunny", "mp4"));
            }
        }

        [TestMethod]
        public void NamesDifferingInCaseAreTheSameFile()
        {
            using (var t = new TempDir())
            {
                File.WriteAllText(Path.Combine(t.Dir, "BUNNY.MP4"), "");
                Assert.AreEqual(Path.Combine(t.Dir, "bunny (2).mp4"), Files.UniquePath(t.Dir, "bunny", "mp4"));
            }
        }

        [TestMethod]
        public void TakenNamesPastThePathLimitAreSeen()
        {
            using (var t = new TempDir())
            {
                var deep = Path.Combine(t.Dir, new string('d', 120), new string('e', 120));
                Directory.CreateDirectory(Files.Long(deep));
                var name = new string('n', 40);
                var first = Files.UniquePath(deep, name, "mp4");
                Assert.IsTrue(first.Length > Files.MaxPath);
                File.WriteAllText(Files.Long(first), "");
                Assert.AreEqual(Path.Combine(deep, name + " (2).mp4"), Files.UniquePath(deep, name, "mp4"));
            }
        }

        // ---------- JobManager.FittingName ----------

        static Job VideoJob(string title, Dictionary<string, object> opts = null) =>
            new Job { Id = "test", Kind = "video", Title = title, Opts = opts ?? new Dictionary<string, object>() };

        static void Fits(string folder, string name, string ext) =>
            Assert.IsTrue(Path.Combine(folder, name + " (99)." + ext + ".partial").Length <= Files.MaxPath, name.Length + " chars in " + folder.Length);

        [TestMethod]
        public void ShortPathsKeepTheWholeName()
        {
            var j = VideoJob("Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film");
            Assert.AreEqual(j.Title, JobManager.FittingName(j, @"C:\Users\me\Downloads", "mp4"));
        }

        [DataTestMethod]
        [DataRow(60)]
        [DataRow(100)]
        [DataRow(180)]
        public void LongTitlesAreCutToFit(int folderLength)
        {
            var folder = @"C:\" + new string('f', folderLength - 3);
            var title = "A very long title " + new string('x', 200);
            var name = JobManager.FittingName(VideoJob(title), folder, "mp4");
            Fits(folder, name, "mp4");
            StringAssert.StartsWith(title, name);
            Assert.IsTrue(name.Length >= 16);
        }

        [TestMethod]
        public void TooDeepFoldersKeepTheName()
        {
            var folder = @"C:\" + new string('f', 240);
            var j = VideoJob(new string('t', 100));
            Assert.AreEqual(Media.BaseName(j), JobManager.FittingName(j, folder, "mp4"));
        }

        [TestMethod]
        public void ClipTimesStayWhenTheTitleIsCut()
        {
            var folder = @"C:\" + new string('f', 120);
            var trim = new Dictionary<string, object> { ["start"] = 0.0, ["end"] = 65.0 };
            var name = JobManager.FittingName(VideoJob(new string('t', 200), new Dictionary<string, object> { ["trim"] = trim }), folder, "mp4");
            Fits(folder, name, "mp4");
            StringAssert.EndsWith(name, " (0.00-1.05)");
        }

        [TestMethod]
        public void SubtitleLanguageStaysWhenTheTitleIsCut()
        {
            var folder = @"C:\" + new string('f', 120);
            var j = new Job { Id = "test", Kind = "subs", Title = new string('t', 200), Opts = new Dictionary<string, object> { ["lang"] = "en-US" } };
            var name = JobManager.FittingName(j, folder, "srt");
            Fits(folder, name, "srt");
            StringAssert.EndsWith(name, ".en-US");
        }

        [TestMethod]
        public void FilesUseTheirOwnName()
        {
            var folder = @"C:\" + new string('f', 120);
            var j = new Job { Id = "test", Kind = "file", Title = "ignored", Opts = new Dictionary<string, object> { ["name"] = new string('s', 180) + ".png" } };
            var name = JobManager.FittingName(j, folder, "png");
            Fits(folder, name, "png");
            StringAssert.StartsWith(name, "sss");
        }

        [TestMethod]
        public void CutTitlesKeepSurrogatePairsWhole()
        {
            for (int folderLength = 100; folderLength < 104; folderLength++)
            {
                var folder = @"C:\" + new string('f', folderLength);
                var name = JobManager.FittingName(VideoJob("x" + string.Concat(System.Linq.Enumerable.Repeat("🎬", 90))), folder, "mp4");
                Whole(name);
                Fits(folder, name, "mp4");
            }
        }
    }
}
