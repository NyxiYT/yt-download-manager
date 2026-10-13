using System.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    [TestClass]
    public class ComponentsTests
    {
        static string Download(TempDir t)
        {
            var f = Path.Combine(t.Dir, "yt-dlp.exe");
            File.WriteAllText(f, "pretend tool");
            return f;
        }

        [TestMethod]
        public void MatchingChecksumIsUsed()
        {
            using (var t = new TempDir())
            {
                var f = Download(t);
                Components.Verify(f, Files.Sha256(f).ToUpperInvariant(), "yt-dlp");
                Assert.IsTrue(File.Exists(f));
            }
        }

        [TestMethod]
        public void WrongChecksumStopsTheInstall()
        {
            using (var t = new TempDir())
            {
                var f = Download(t);
                Assert.ThrowsException<InvalidDataException>(() => Components.Verify(f, new string('0', 64), "yt-dlp"));
                Assert.IsFalse(File.Exists(f));
            }
        }

        [TestMethod]
        public void MissingChecksumStopsTheInstall()
        {
            using (var t = new TempDir())
            {
                var f = Download(t);
                Assert.ThrowsException<InvalidDataException>(() => Components.Verify(f, null, "yt-dlp"));
                Assert.IsFalse(File.Exists(f));
            }
        }
    }
}
