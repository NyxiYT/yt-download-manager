using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // Saving finished downloads into the download folder (JobManager.Deliver).
    [TestClass]
    public class DeliveryTests
    {
        static Job NewJob(string title)
        {
            var j = new Job { Id = Rand.Id(), Vid = "aqz-KE-bpKQ", Kind = "video", Title = title, Opts = new Dictionary<string, object>() };
            Directory.CreateDirectory(j.Work);
            return j;
        }

        // The finished file in the job's work folder, with content of its own.
        static string Finished(Job j)
        {
            var f = Path.Combine(j.Work, "out.mp4");
            File.WriteAllText(f, "content of " + j.Id + new string('.', 8 << 20)); // big enough that copies overlap
            return f;
        }

        [TestMethod]
        public void SameTitleDeliveredAtOnceGetsDifferentNames()
        {
            using (var t = new TempDir())
            {
                // In the \\?\ form the folder doesn't count as the work folder's drive, so files are copied (slowly)
                // rather than moved: the deliveries overlap the way they do onto another drive.
                Settings.Current.Folder = @"\\?\" + t.Dir;
                var m = new JobManager();
                for (int round = 0; round < 5; round++)
                {
                    var js = Enumerable.Range(0, 6).Select(_ => NewJob("Same title " + round)).ToList();
                    var srcs = js.Select(Finished).ToList();
                    var all = js.Select((j, i) => Task.Run(() => m.Deliver(j, srcs[i], "mp4", CancellationToken.None))).ToArray();
                    Task.WaitAll(all);
                    var dests = all.Select(x => x.Result).ToList();
                    Assert.AreEqual(js.Count, dests.Distinct().Count(), string.Join(", ", dests));
                    for (int i = 0; i < js.Count; i++) StringAssert.StartsWith(File.ReadAllText(dests[i]), "content of " + js[i].Id + ".");
                }
                Assert.AreEqual(0, Directory.GetFiles(t.Dir, "*.partial").Length);
            }
        }

        [TestMethod]
        public void ReservedNamesAreNotGivenTwice()
        {
            using (var t = new TempDir())
            {
                var a = JobManager.ReserveName(t.Dir, "Bunny", "mp4");
                var b = JobManager.ReserveName(t.Dir, "Bunny", "mp4");
                Assert.AreEqual(Path.Combine(t.Dir, "Bunny.mp4"), a);
                Assert.AreEqual(Path.Combine(t.Dir, "Bunny (2).mp4"), b);
            }
        }

        [TestMethod]
        public void TemporaryNameIsTheJobsOwn()
        {
            var j = new Job { Id = "abc123def0" };
            Assert.AreEqual(@"C:\d\Bunny.mp4.abc123def0.partial", JobManager.PartialFor(j, @"C:\d\Bunny.mp4"));
        }
    }
}
