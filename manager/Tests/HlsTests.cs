using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    [TestClass]
    public class HlsTests
    {
        // A media list like YouTube's: an init segment, then `n` segments with relative links.
        static string List(int n, int pad = 0)
        {
            var sb = new StringBuilder("#EXTM3U\n#EXT-X-VERSION:6\n#EXT-X-TARGETDURATION:5\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXT-X-MAP:URI=\"init.mp4\"\n");
            var filler = new string('x', pad);
            for (int i = 0; i < n; i++) sb.Append("#EXTINF:5.005,\nsq/").Append(i).Append("/lmt/1755571386394671/").Append(filler).Append("seg.ts\n");
            sb.Append("#EXT-X-ENDLIST\n");
            return sb.ToString();
        }

        [TestMethod]
        public void ParsesALongList()
        {
            var text = List(100000);
            Assert.IsTrue(text.Length > 4 << 20);
            var segs = JobManager.ParsePlaylist(text, "https://manifest.googlevideo.com/api/manifest/hls_playlist/itag/96/playlist/index.m3u8");
            Assert.AreEqual(100001, segs.Count);
            Assert.AreEqual("https://manifest.googlevideo.com/api/manifest/hls_playlist/itag/96/playlist/init.mp4", segs[0]);
            StringAssert.EndsWith(segs[100000], "/playlist/sq/99999/lmt/1755571386394671/seg.ts");
        }

        [DataTestMethod]
        [DataRow("#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\nlow.m3u8\n")]                   // a list of lists
        [DataRow("#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI=\"k\"\n#EXTINF:5,\na.ts\n")]        // encrypted
        [DataRow("#EXTM3U\n#EXT-X-BYTERANGE:100@0\n#EXTINF:5,\na.ts\n")]                     // byte ranges
        public void ListsItDoesNotHandleGoToYtDlp(string text) =>
            Assert.ThrowsException<NotSupportedException>(() => JobManager.ParsePlaylist(text, "https://example.com/a/index.m3u8"));

        // Before, only the first 4 MiB were read, and the segments after them were left out without a word.
        [TestMethod]
        public void ReadsAListLongerThanOnePiece()
        {
            var text = List(70000, 40);
            Assert.IsTrue(text.Length > 6 << 20 && text.Length < JobManager.PlaylistCap);
            using (var srv = new TinyHttp(Encoding.ASCII.GetBytes(text)))
            {
                var segs = JobManager.Playlist(new Fmt { Url = srv.Url }, CancellationToken.None).GetAwaiter().GetResult();
                Assert.AreEqual(70001, segs.Count);
                StringAssert.Contains(segs.Last(), "/sq/69999/");
                Assert.AreEqual(2, srv.Requests);
            }
        }

        [TestMethod]
        public void ReadsAShortListInOneGo()
        {
            using (var srv = new TinyHttp(Encoding.ASCII.GetBytes(List(100))))
            {
                Assert.AreEqual(101, JobManager.Playlist(new Fmt { Url = srv.Url }, CancellationToken.None).GetAwaiter().GetResult().Count);
                Assert.AreEqual(1, srv.Requests);
            }
        }

        [TestMethod]
        public void AListPastTheCapGoesToYtDlp()
        {
            var text = List(200000, 150);
            Assert.IsTrue(text.Length > JobManager.PlaylistCap);
            using (var srv = new TinyHttp(Encoding.ASCII.GetBytes(text)))
            {
                Assert.ThrowsException<NotSupportedException>(() => JobManager.Playlist(new Fmt { Url = srv.Url }, CancellationToken.None).GetAwaiter().GetResult());
                Assert.AreEqual(1, srv.Requests);
            }
        }

        // A server that sends the whole list for every request can't be read in pieces: that fails (and the
        // download goes to yt-dlp) instead of using the first piece as if it were all.
        [TestMethod]
        public void ALongListWithoutRangesIsNotCutShort()
        {
            using (var srv = new TinyHttp(Encoding.ASCII.GetBytes(List(70000, 40)), ranges: false))
                Assert.ThrowsException<IOException>(() => JobManager.Playlist(new Fmt { Url = srv.Url }, CancellationToken.None).GetAwaiter().GetResult());
        }

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
