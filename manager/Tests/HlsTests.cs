using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    [TestClass]
    public class HlsTests
    {
        // ---------- a stream that changed on YouTube (JobManager.StartOver) ----------

        static Fmt Link(string clen, string lmt) => new Fmt { Id = "137", Url = $"https://rr1---sn-example.googlevideo.com/videoplayback?itag=137&clen={clen}&lmt={lmt}" };

        [TestMethod]
        public void SameStreamContinues()
        {
            var s = new StreamPart { Fp = Link("100", "1").Fp };
            bool restarted = false;
            Assert.IsFalse(JobManager.StartOver(s, Link("100", "1"), ref restarted));
            Assert.IsFalse(restarted);
        }

        [TestMethod]
        public void ChangedStreamStartsOverOnceThenFails()
        {
            var s = new StreamPart { Fp = Link("100", "1").Fp };
            bool restarted = false;
            Assert.IsTrue(JobManager.StartOver(s, Link("120", "2"), ref restarted));
            Assert.IsTrue(restarted);
            s.Fp = Link("120", "2").Fp;
            try
            {
                JobManager.StartOver(s, Link("130", "3"), ref restarted);
                Assert.Fail("no failure");
            }
            catch (Fail f) { Assert.AreEqual("errFormatGone", f.Key); }
        }
    }
}
