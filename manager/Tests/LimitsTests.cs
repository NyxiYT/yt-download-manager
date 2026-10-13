using System.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // Downloads at once and the speed limit from the app's window.
    [TestClass]
    public class LimitsTests
    {
        const double MB = 1024 * 1024;

        [TestCleanup]
        public void Reset()
        {
            Settings.Current.SpeedLimitMBps = 0;
            Settings.Current.MaxDownloads = 2;
        }

        [TestMethod]
        public void NoLimitWhileNothingPlays() => Assert.IsTrue(double.IsPositiveInfinity(Bandwidth.Limit(0)));

        [TestMethod]
        public void UserLimitHoldsWithoutAVideoPlaying()
        {
            Settings.Current.SpeedLimitMBps = 5;
            Assert.AreEqual(5 * MB, Bandwidth.Limit(0));
            Assert.AreEqual(5 * MB, Bandwidth.Limit(1));
        }

        // A video short of buffer can ask for less than the user's limit, never for more.
        [TestMethod]
        public void TheLowerLimitWins()
        {
            Settings.Current.SpeedLimitMBps = 50;
            Assert.IsTrue(Bandwidth.Limit(3) < 50 * MB);
            Settings.Current.SpeedLimitMBps = 0.2;
            Assert.AreEqual(0.2 * MB, Bandwidth.Limit(3), 1);
        }

        [TestMethod]
        public void YtDlpGetsAShareOfTheLimit()
        {
            Assert.AreEqual(0, Bandwidth.YtDlpRate(2));
            Settings.Current.SpeedLimitMBps = 8;
            Assert.AreEqual((long)(4 * MB), Bandwidth.YtDlpRate(2));
            Assert.AreEqual((long)(8 * MB), Bandwidth.YtDlpRate(1));
            Settings.Current.SpeedLimitMBps = 0.1;
            Assert.AreEqual(64 * 1024, Bandwidth.YtDlpRate(4)); // never below 64 KB/s
        }

        [DataTestMethod]
        [DataRow(0, 1)]
        [DataRow(1, 1)]
        [DataRow(3, 3)]
        [DataRow(4, 4)]
        [DataRow(9, 4)]
        public void DownloadsAtOnceAreOneToFour(int set, int used)
        {
            Settings.Current.MaxDownloads = set;
            Assert.AreEqual(used, JobManager.MaxActive);
        }

        // Both are kept in settings.json; values out of range fall back to the defaults.
        [TestMethod]
        public void SavedAndReadBack()
        {
            var was = File.Exists(Paths.SettingsFile) ? File.ReadAllText(Paths.SettingsFile) : null;
            try
            {
                Settings.Current.MaxDownloads = 3;
                Settings.Current.SpeedLimitMBps = 2.5;
                Settings.Current.Save();
                var s = Settings.Load();
                Assert.AreEqual(3, s.MaxDownloads);
                Assert.AreEqual(2.5, s.SpeedLimitMBps);
                File.WriteAllText(Paths.SettingsFile, "{\"maxDownloads\":12,\"speedLimitMBps\":-3}");
                s = Settings.Load();
                Assert.AreEqual(4, s.MaxDownloads);
                Assert.AreEqual(0, s.SpeedLimitMBps);
                File.WriteAllText(Paths.SettingsFile, "{}");
                s = Settings.Load();
                Assert.AreEqual(2, s.MaxDownloads);
                Assert.AreEqual(0, s.SpeedLimitMBps);
            }
            finally
            {
                if (was != null) File.WriteAllText(Paths.SettingsFile, was);
                else File.Delete(Paths.SettingsFile);
                Settings.Load();
            }
        }
    }
}
