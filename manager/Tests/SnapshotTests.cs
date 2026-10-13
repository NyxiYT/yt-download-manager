using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // The job list the browsers read: whether finished files are still there.
    [TestClass]
    public class SnapshotTests
    {
        static JobManager With(Job j)
        {
            File.WriteAllText(Paths.JobsFile, Json.Write(new object[] { j.ToJson(false) }));
            var m = new JobManager();
            m.Load();
            return m;
        }

        static bool Exists(JobManager m, string id) =>
            (bool)m.Snapshot().Cast<Dictionary<string, object>>().Single(d => (string)d["id"] == id)["exists"];

        [TestMethod]
        public void ExistsIsLookedUpAndKeptForTenSeconds()
        {
            using (var t = new TempDir())
            {
                var f = Path.Combine(t.Dir, "Bunny.mp4");
                File.WriteAllText(f, "x");
                var m = With(new Job { Id = "done000001", Vid = "aqz-KE-bpKQ", Kind = "video", Title = "Bunny", Status = "completed", File = f, Dedupe = "d1" });
                Assert.IsTrue(Exists(m, "done000001"));
                File.Delete(f);
                Assert.IsTrue(Exists(m, "done000001"), "looked up again within 10 s");
                m.Find("done000001").ExistsAt -= 11000;
                Assert.IsFalse(Exists(m, "done000001"));
            }
        }

        [TestMethod]
        public void JobsWithoutAFileAreNotLookedUp()
        {
            var m = With(new Job { Id = "queued0001", Vid = "aqz-KE-bpKQ", Kind = "video", Title = "Bunny", Status = "paused", Dedupe = "d2" });
            var d = m.Snapshot().Cast<Dictionary<string, object>>().Single(x => (string)x["id"] == "queued0001");
            Assert.IsFalse(d.ContainsKey("exists"));
            Assert.AreEqual(0, m.Find("queued0001").ExistsAt);
        }

        // Asking for a download that is done and still there answers with that one.
        [TestMethod]
        public void RepeatOfAFinishedDownloadIsRecognized()
        {
            using (var t = new TempDir())
            {
                var f = Path.Combine(t.Dir, "Bunny.mp4");
                File.WriteAllText(f, "x");
                var m = With(new Job { Id = "done000002", Vid = "aqz-KE-bpKQ", Kind = "video", Title = "Bunny", Status = "completed", File = f, Dedupe = "same" });
                var (job, dup) = m.Add(new Job { Id = "new0000001", Vid = "aqz-KE-bpKQ", Kind = "video", Title = "Bunny", Dedupe = "same" }, false);
                Assert.AreEqual("done", dup);
                Assert.AreEqual("done000002", job.Id);
                Assert.IsTrue(job.Exists);
            }
        }
    }
}
