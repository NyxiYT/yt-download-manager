using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // Which streams a download takes, from saved yt-dlp answers (see Fixtures/README.md).
    [TestClass]
    public class MediaTests
    {
        static Info Load(string name) => Media.Parse(Fixture.Text("info", name), Fixture.Path("info", name));

        static Job NewJob(string kind, int height = 0)
        {
            var opts = new Dictionary<string, object>();
            if (height > 0) opts["height"] = height;
            return new Job { Id = "test", Vid = "aqz-KE-bpKQ", Kind = kind, Title = "test", Opts = opts };
        }

        // "role formatId" for each part, for short comparisons.
        static string Plan(Info i, string kind, int height = 0) =>
            string.Join(", ", Media.Plan(NewJob(kind, height), i).Select(p => p.Role + " " + p.FormatId));

        [TestMethod]
        public void ParsesTheSavedAnswers()
        {
            var i = Load("big-buck-bunny.json");
            Assert.AreEqual("aqz-KE-bpKQ", i.Id);
            Assert.AreEqual(635, i.Duration);
            Assert.IsFalse(i.Live);
            Assert.IsFalse(i.NeedsAccount);
            var f = i.Formats.Single(x => x.Id == "299");
            Assert.AreEqual(1080, f.Short);
            Assert.AreEqual("H.264", f.CodecName);
            Assert.IsTrue(f.Http);
            Assert.AreEqual("299|257619653|", f.Fp.Substring(0, "299|257619653|".Length));
            Assert.IsTrue(i.Formats.Single(x => x.Id == "140-drc").Drc);
            Assert.IsTrue(i.Formats.Single(x => x.Id == "312").Hls);
        }

        // ---------- PickAudio ----------

        [DataTestMethod]
        [DataRow("big-buck-bunny.json", "mp4a", "140")]
        [DataRow("big-buck-bunny.json", "opus", "251")]
        [DataRow("big-buck-bunny.json", null, "251")]
        [DataRow("short-portrait.json", "mp4a", "140")]
        [DataRow("me-at-the-zoo.json", "opus", "251")]
        public void PicksTheBestPlainAudio(string file, string codec, string expected)
        {
            var a = Media.PickAudio(Load(file), codec);
            Assert.AreEqual(expected, a.Id);
            Assert.IsFalse(a.Drc);
        }

        [TestMethod]
        public void AudioWithDrcOnlyWhenThereIsNothingElse()
        {
            var i = Load("big-buck-bunny.json");
            i.Formats.RemoveAll(f => f.Id == "140" || f.Id == "139");
            Assert.AreEqual("140-drc", Media.PickAudio(i, "mp4a").Id);
        }

        [TestMethod]
        public void NoSeparateAudioInCombinedOnlyAnswers() => Assert.IsNull(Media.PickAudio(Load("hand-made-combined-only.json"), null));

        // ---------- PickVideo ----------

        [DataTestMethod]
        [DataRow("big-buck-bunny.json", 1080, "299")]  // H.264 before AV1 and VP9 at the same height and frame rate
        [DataRow("big-buck-bunny.json", 2160, "401")]  // no H.264 at 4K: AV1 before VP9
        [DataRow("big-buck-bunny.json", 1440, "400")]
        [DataRow("big-buck-bunny.json", 900, "298")]   // the next lower height
        [DataRow("big-buck-bunny.json", 50, "160")]    // below everything: the smallest
        [DataRow("big-buck-bunny.json", 9999, "401")]
        [DataRow("short-portrait.json", 1080, "137")]  // portrait: the short side counts
        [DataRow("short-portrait.json", 720, "136")]
        [DataRow("short-portrait.json", 640, "788")]   // the 608x1080 streams YouTube labels 480p
        [DataRow("short-portrait.json", 480, "135")]
        [DataRow("me-at-the-zoo.json", 1080, "133")]   // two H.264 streams at 240p: the higher bit rate
        public void PicksTheClosestVideo(string file, int height, string expected) =>
            Assert.AreEqual(expected, Media.PickVideo(Load(file), height).Id);

        [TestMethod]
        public void HlsVideoIsNeverPickedAsASeparateStream()
        {
            var i = Load("big-buck-bunny.json");
            foreach (var h in new[] { 144, 240, 360, 480, 720, 1080, 1440, 2160 }) Assert.IsTrue(Media.PickVideo(i, h).Http, h.ToString());
        }

        [TestMethod]
        public void NoSeparateVideoInCombinedOnlyAnswers() => Assert.IsNull(Media.PickVideo(Load("hand-made-combined-only.json"), 1080));

        // ---------- Plan ----------

        [DataTestMethod]
        [DataRow("big-buck-bunny.json", "video", 1080, "video 299, audio 140")]
        [DataRow("big-buck-bunny.json", "video", 2160, "video 401, audio 140")]
        [DataRow("big-buck-bunny.json", "mp3", 0, "audio 140")]
        [DataRow("big-buck-bunny.json", "m4a", 0, "audio 140")]
        [DataRow("big-buck-bunny.json", "wav", 0, "audio 140")]
        [DataRow("big-buck-bunny.json", "opus", 0, "audio 251")]
        [DataRow("short-portrait.json", "video", 1080, "video 137, audio 140")]
        [DataRow("me-at-the-zoo.json", "video", 1080, "video 133, audio 140")]
        [DataRow("hand-made-combined-only.json", "video", 1080, "av 96")]
        [DataRow("hand-made-combined-only.json", "video", 720, "av 95")]
        [DataRow("hand-made-combined-only.json", "video", 360, "av 18")]  // HTTPS before HLS at the same height
        [DataRow("hand-made-combined-only.json", "video", 100, "av 91")]
        [DataRow("hand-made-combined-only.json", "mp3", 0, "audio 18")]   // sound from the smallest finished stream of 360p or more
        public void PlansTheDownload(string file, string kind, int height, string expected) =>
            Assert.AreEqual(expected, Plan(Load(file), kind, height));

        [TestMethod]
        public void VideoWithoutHeightAsksFor1080() => Assert.AreEqual("video 299, audio 140", Plan(Load("big-buck-bunny.json"), "video"));

        [TestMethod]
        public void PlannedPartsCarryTheirDetails()
        {
            var parts = Media.Plan(NewJob("video", 1080), Load("big-buck-bunny.json"));
            Assert.AreEqual("mp4", parts[0].Ext);
            Assert.AreEqual(257619653, parts[0].Size);
            StringAssert.StartsWith(parts[0].Codec, "avc1");
            Assert.AreEqual("m4a", parts[1].Ext);
            Assert.AreEqual("mp4a.40.2", parts[1].Codec);
        }

        [TestMethod]
        public void OpusFromCombinedOnlyAnswersFails() => AssertFails("errFormatGone", () => Media.Plan(NewJob("opus"), Load("hand-made-combined-only.json")));

        [TestMethod]
        public void NothingToDownloadFails()
        {
            var i = Load("big-buck-bunny.json");
            i.Formats.Clear();
            AssertFails("errNoDownload", () => Media.Plan(NewJob("video", 1080), i));
            i.Diag.Drm = true;
            AssertFails("errDrm", () => Media.Plan(NewJob("video", 1080), i));
        }

        [TestMethod]
        public void AudioOnlyAnswersStillGiveSound()
        {
            var i = Load("big-buck-bunny.json");
            i.Formats.RemoveAll(f => f.HasVideo);
            Assert.AreEqual("audio 140", Plan(i, "mp3"));
            AssertFails("errFormatGone", () => Media.Plan(NewJob("video", 1080), i));
        }

        static void AssertFails(string key, System.Action a)
        {
            try
            {
                a();
            }
            catch (Fail f)
            {
                Assert.AreEqual(key, f.Key);
                return;
            }
            Assert.Fail("no failure, expected " + key);
        }
    }
}
