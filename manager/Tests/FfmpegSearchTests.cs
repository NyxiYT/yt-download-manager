using System;
using System.IO;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    [TestClass]
    public class FfmpegSearchTests
    {
        static string Norm(string d) => Path.GetFullPath(d).TrimEnd('\\').ToLowerInvariant();

        [TestMethod]
        public void SharedFoldersAreNotSearched()
        {
            var dirs = Components.FfmpegDirs(null).Select(Norm).ToList();
            foreach (var shared in new[] { @"C:\ffmpeg\bin", @"C:\ffmpeg", @"C:\ProgramData\chocolatey\bin" })
                CollectionAssert.DoesNotContain(dirs, Norm(shared));
        }

        [TestMethod]
        public void UsersOwnFolderComesFirst()
        {
            var dirs = Components.FfmpegDirs(@"D:\Tools\ffmpeg\bin");
            Assert.AreEqual(@"D:\Tools\ffmpeg\bin", dirs[0]);
            Assert.AreEqual(Norm(Paths.Bin), Norm(dirs[1]));
        }

        [TestMethod]
        public void WingetAndScoopAreSearched()
        {
            var dirs = Components.FfmpegDirs(null).Select(Norm).ToList();
            CollectionAssert.Contains(dirs, Norm(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Microsoft", "WinGet", "Links")));
            CollectionAssert.Contains(dirs, Norm(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "scoop", "shims")));
        }
    }
}
