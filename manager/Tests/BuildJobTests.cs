using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // POST /v1/jobs: everything the browser sends is checked before it reaches the queue.
    [TestClass]
    public class BuildJobTests
    {
        static Job Build(string json) => ApiServer.BuildJob(Json.ParseObj(json));

        static void Refused(string json)
        {
            try
            {
                Build(json);
            }
            catch (ApiServer.ApiError e)
            {
                Assert.AreEqual(400, e.Code, json);
                return;
            }
            Assert.Fail("accepted: " + json);
        }

        static string Video(string extra = "", string opts = "\"height\":1080") =>
            "{\"vid\":\"aqz-KE-bpKQ\",\"kind\":\"video\",\"key\":\"v1080\",\"opts\":{" + opts + "}" + extra + "}";

        [TestMethod]
        public void AcceptsAVideo()
        {
            var j = Build(Video(",\"title\":\"Big Buck Bunny\",\"author\":\"Blender\""));
            Assert.AreEqual("aqz-KE-bpKQ", j.Vid);
            Assert.AreEqual("video", j.Kind);
            Assert.AreEqual(1080, j.Opts["height"]);
            Assert.AreEqual("Big Buck Bunny", j.Title);
            Assert.AreEqual("aqz-KE-bpKQ|v1080||", j.Dedupe);
            Assert.IsFalse(string.IsNullOrEmpty(j.Id));
        }

        [DataTestMethod]
        [DataRow(null)]
        [DataRow("")]
        [DataRow("aqz-KE-bpK")]
        [DataRow("aqz-KE-bpKQX")]
        [DataRow("aqz KE bpKQ")]
        [DataRow("aqz-KE-bpK!")]
        [DataRow("../../a/bcd")]
        [DataRow("aqz-KE-bpKQ\n")]
        public void RefusesBadVideoIds(string vid)
        {
            var b = Json.ParseObj(Video());
            b["vid"] = vid;
            try
            {
                ApiServer.BuildJob(b);
                Assert.Fail("accepted vid " + vid);
            }
            catch (ApiServer.ApiError e) { Assert.AreEqual(400, e.Code); }
        }

        [DataTestMethod]
        [DataRow("\"kind\":\"exe\"")]
        [DataRow("\"kind\":\"VIDEO\"")]
        [DataRow("\"kind\":\"file\"")] // files only come in through /v1/files
        [DataRow("\"kind\":\"\"")]
        [DataRow("\"kind\":null")]
        public void RefusesBadKinds(string kind) =>
            Refused("{\"vid\":\"aqz-KE-bpKQ\"," + kind + ",\"key\":\"k\",\"opts\":{\"height\":1080}}");

        [TestMethod]
        public void RefusesMissingKind() => Refused("{\"vid\":\"aqz-KE-bpKQ\",\"key\":\"k\"}");

        [DataTestMethod]
        [DataRow("")]
        [DataRow("\"height\":99")]
        [DataRow("\"height\":10001")]
        [DataRow("\"height\":-1080")]
        [DataRow("\"height\":\"tall\"")]
        [DataRow("\"height\":true")]
        public void RefusesBadHeights(string opts) => Refused(Video(opts: opts));

        [DataTestMethod]
        [DataRow(100)]
        [DataRow(144)]
        [DataRow(2160)]
        [DataRow(10000)]
        public void AcceptsHeightsInRange(int h) => Assert.AreEqual(h, Build(Video(opts: "\"height\":" + h)).Opts["height"]);

        [DataTestMethod]
        [DataRow("\"start\":-1,\"end\":10")]
        [DataRow("\"start\":10,\"end\":10")]
        [DataRow("\"start\":10,\"end\":5")]
        [DataRow("\"start\":0,\"end\":86400.5")]
        [DataRow("\"start\":1,\"end\":1.4")]
        [DataRow("\"start\":1")]
        [DataRow("\"end\":10")]
        [DataRow("\"start\":\"a\",\"end\":\"b\"")]
        public void RefusesBadTrims(string trim) => Refused(Video(opts: "\"height\":1080,\"trim\":{" + trim + "}"));

        [TestMethod]
        public void AcceptsATrim()
        {
            var j = Build(Video(opts: "\"height\":720,\"trim\":{\"start\":1.23456,\"end\":65}"));
            var t = (Dictionary<string, object>)j.Opts["trim"];
            Assert.AreEqual(1.235, (double)t["start"], 1e-9);
            Assert.AreEqual(65.0, (double)t["end"], 1e-9);
            Assert.AreEqual("aqz-KE-bpKQ|v1080|1.235-65|", j.Dedupe);
        }

        [TestMethod]
        public void ThumbnailsIgnoreTrim()
        {
            var j = Build("{\"vid\":\"aqz-KE-bpKQ\",\"kind\":\"thumb\",\"key\":\"thumb\",\"opts\":{\"thumb\":\"hqdefault\",\"trim\":{\"start\":-5}}}");
            Assert.IsFalse(j.Opts.ContainsKey("trim"));
            Assert.AreEqual("hqdefault", j.Opts["thumb"]);
        }

        [DataTestMethod]
        [DataRow("default")]
        [DataRow("../maxresdefault")]
        [DataRow("https://example.com/x")]
        public void RefusesUnknownThumbnails(string thumb) =>
            Refused("{\"vid\":\"aqz-KE-bpKQ\",\"kind\":\"thumb\",\"key\":\"thumb\",\"opts\":{\"thumb\":\"" + thumb + "\"}}");

        static string Subs(string lang, string format = "srt") =>
            "{\"vid\":\"aqz-KE-bpKQ\",\"kind\":\"subs\",\"key\":\"subs\",\"opts\":{\"lang\":" + Json.Write(lang) + ",\"subFormat\":\"" + format + "\"}}";

        [DataTestMethod]
        [DataRow("")]
        [DataRow("en US")]
        [DataRow("../en")]
        [DataRow("en/US")]
        [DataRow("de\\x")]
        [DataRow("abcdefghijklmnopqrstuvwxyz1234567")] // 33
        [DataRow("en;rm")]
        [DataRow("en\n")]
        public void RefusesBadLanguages(string lang) => Refused(Subs(lang));

        [DataTestMethod]
        [DataRow("en")]
        [DataRow("en-US")]
        [DataRow("zh-Hans")]
        [DataRow("en-orig")]
        [DataRow("abcdefghijklmnopqrstuvwxyz123456")] // 32
        public void AcceptsLanguages(string lang) => Assert.AreEqual(lang, Build(Subs(lang)).Opts["lang"]);

        [TestMethod]
        public void RefusesUnknownSubtitleFormats() => Refused(Subs("en", "exe"));

        [DataTestMethod]
        [DataRow("")]
        [DataRow("a b")]
        [DataRow("a/b")]
        [DataRow("a\\b")]
        [DataRow("ä")]
        [DataRow("v1080\n")]
        [DataRow("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")] // 65
        public void RefusesBadKeys(string key)
        {
            var b = Json.ParseObj(Video());
            b["key"] = key;
            try
            {
                ApiServer.BuildJob(b);
                Assert.Fail("accepted key " + key);
            }
            catch (ApiServer.ApiError e) { Assert.AreEqual(400, e.Code); }
        }

        [TestMethod]
        public void RefusesMissingKey() => Refused("{\"vid\":\"aqz-KE-bpKQ\",\"kind\":\"video\",\"opts\":{\"height\":1080}}");

        [TestMethod]
        public void AcceptsLongestKey()
        {
            var key = new string('k', 64);
            var b = Json.ParseObj(Video());
            b["key"] = key;
            Assert.AreEqual(key, ApiServer.BuildJob(b).Key);
        }

        [DataTestMethod]
        [DataRow("m4a", "m4a")]
        [DataRow("opus", "opus")]
        [DataRow("webm", "opus")]
        [DataRow(null, "m4a")]
        public void AudioIsToldApartByExtension(string ext, string kind)
        {
            var opts = ext == null ? "" : "\"ext\":\"" + ext + "\"";
            Assert.AreEqual(kind, Build("{\"vid\":\"aqz-KE-bpKQ\",\"kind\":\"audio\",\"key\":\"a\",\"opts\":{" + opts + "}}").Kind);
        }

        [DataTestMethod]
        [DataRow(1000, 320)]
        [DataRow(10, 64)]
        [DataRow(192, 192)]
        public void Mp3BitRateIsClamped(int asked, int got) =>
            Assert.AreEqual(got, Build("{\"vid\":\"aqz-KE-bpKQ\",\"kind\":\"mp3\",\"key\":\"mp3\",\"opts\":{\"kbps\":" + asked + "}}").Opts["kbps"]);

        [TestMethod]
        public void LongTextsAreCut()
        {
            var b = Json.ParseObj(Video());
            b["title"] = new string('t', 1000);
            b["author"] = new string('a', 1000);
            b["format"] = new string('f', 100);
            b["quality"] = new string('q', 100);
            var j = ApiServer.BuildJob(b);
            Assert.AreEqual(400, j.Title.Length);
            Assert.AreEqual(200, j.Author.Length);
            Assert.AreEqual(16, j.Format.Length);
            Assert.AreEqual(32, j.Quality.Length);
        }

        [TestMethod]
        public void UnknownOptionsAreDropped()
        {
            var j = Build(Video(opts: "\"height\":1080,\"args\":\"--exec calc\",\"auth\":true"));
            CollectionAssert.AreEquivalent(new[] { "height", "auth" }, new List<string>(j.Opts.Keys));
        }
    }
}
