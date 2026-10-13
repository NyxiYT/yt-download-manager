using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    [TestClass]
    public class ErrorsTests
    {
        [DataTestMethod]
        [DataRow("403-forbidden.txt", "Expired", null)]
        [DataRow("429-too-many-requests.txt", "RateLimited", null)]
        [DataRow("5xx-server-error.txt", "Transient", null)]
        [DataRow("age-restricted.txt", "Permanent", "errAge")]
        [DataRow("private.txt", "Permanent", "errPrivate")]
        [DataRow("members-only.txt", "Permanent", "errMembers")]
        [DataRow("geo-blocked.txt", "Permanent", "errGeo")]
        [DataRow("not-a-bot.txt", "Permanent", "errBlocked")]
        [DataRow("disk-full-posix.txt", "Permanent", "errDiskFull")]
        [DataRow("disk-full-windows.txt", "Permanent", "errDiskFull")]
        [DataRow("format-gone.txt", "Permanent", "errFormatGone")]
        [DataRow("unknown.txt", "Unknown", null)]
        public void ClassifiesYtDlpOutput(string file, string cls, string key)
        {
            var (c, k, _) = Errors.Classify(Fixture.Text("stderr", file));
            Assert.AreEqual(cls, c.ToString(), file);
            Assert.AreEqual(key, k, file);
        }

        [TestMethod]
        public void BotCheckWithStraightApostrophe()
        {
            var (c, k, _) = Errors.Classify("ERROR: [youtube] aqz-KE-bpKQ: Sign in to confirm you're not a bot. Use --cookies-from-browser or --cookies for the authentication.");
            Assert.AreEqual(Cls.Permanent, c);
            Assert.AreEqual("errBlocked", k);
        }

        // Only the last ERROR line decides: a warning about a 429 earlier doesn't make a 503 a rate limit.
        [TestMethod]
        public void LastErrorLineDecides()
        {
            var (c, _, _) = Errors.Classify("WARNING: HTTP Error 429: Too Many Requests\nERROR: unable to download video data: HTTP Error 503: Service Unavailable\n");
            Assert.AreEqual(Cls.Transient, c);
        }

        // A 403 anywhere in the output still means expired links when the last line is something else.
        [TestMethod]
        public void Earlier403MeansExpired()
        {
            var (c, _, _) = Errors.Classify("[download] Got error: HTTP Error 403: Forbidden. Retrying fragment 3 (1/10)...\nERROR: fragment 3 not found, unable to continue\n");
            Assert.AreEqual(Cls.Expired, c);
        }

        [TestMethod]
        public void YouTubesOwnReasonIsPassedOn()
        {
            var (c, k, vars) = Errors.Classify("ERROR: [youtube] aqz-KE-bpKQ: This video has been made unavailable by its owner for a while\n");
            Assert.AreEqual(Cls.Permanent, c);
            Assert.AreEqual("errReason", k);
            Assert.AreEqual("This video has been made unavailable by its owner for a while", vars["reason"]);
        }

        [TestMethod]
        public void EmptyOutputIsUnknown()
        {
            Assert.AreEqual(Cls.Unknown, Errors.Classify(null).cls);
            Assert.AreEqual(Cls.Unknown, Errors.Classify("").cls);
        }

        [TestMethod]
        public void EveryFinalKeyHasItsOwnText()
        {
            var generic = Errors.Text("no such key");
            foreach (var key in Errors.Final)
                if (key != "errReason") Assert.AreNotEqual(generic, Errors.Text(key), key);
        }
    }
}
