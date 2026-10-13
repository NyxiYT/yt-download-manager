using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // POST /v1/files: screenshots the browser made, as they are or (older browsers) as base64 in JSON.
    [TestClass]
    public class FileUploadTests
    {
        static Func<string, string> Meta(Dictionary<string, string> d) => k => d.TryGetValue(k, out var v) ? v : null;

        static readonly Dictionary<string, string> Shot = new Dictionary<string, string>
        {
            ["name"] = "Big Buck Bunny 1.23.png", ["vid"] = "aqz-KE-bpKQ", ["title"] = "Big Buck Bunny", ["author"] = "Blender",
            ["format"] = "PNG", ["quality"] = "7680x4320",
        };

        [TestMethod]
        public void LargeFileAsItIs()
        {
            var data = new byte[40 << 20];
            data[0] = 0x89;
            data[data.Length - 1] = 0x42;
            var j = ApiServer.BuildFileJob(Meta(Shot), data);
            Assert.AreEqual("file", j.Kind);
            Assert.AreEqual("aqz-KE-bpKQ", j.Vid);
            Assert.AreEqual("7680x4320", j.Quality);
            Assert.AreEqual("png", j.Opts["ext"]);
            var saved = File.ReadAllBytes(Path.Combine(j.Work, "file.png"));
            CollectionAssert.AreEqual(data, saved);
            Files.DeleteDir(j.Work);
        }

        [TestMethod]
        public void UpTo64MB()
        {
            AssertRefused(() => ApiServer.BuildFileJob(Meta(Shot), new byte[ApiServer.MaxFile + 1]));
            AssertRefused(() => ApiServer.BuildFileJob(Meta(Shot), new byte[0]));
        }

        [DataTestMethod]
        [DataRow("shot.exe")]
        [DataRow("shot")]
        [DataRow(null)]
        public void OnlyPicturesAreTaken(string name)
        {
            var d = new Dictionary<string, string>(Shot) { ["name"] = name };
            AssertRefused(() => ApiServer.BuildFileJob(Meta(d), new byte[10]));
        }

        [TestMethod]
        public void OnlyFilesSentAsTheyAreMayBeLarge()
        {
            Assert.AreEqual(ApiServer.MaxFile, ApiServer.MaxBodyFor("/v1/files", "application/octet-stream"));
            Assert.AreEqual(ApiServer.MaxFile, ApiServer.MaxBodyFor("/v1/files", "Application/Octet-Stream; charset=binary"));
            Assert.IsTrue(ApiServer.MaxBodyFor("/v1/files", "application/json") < ApiServer.MaxFile);
            Assert.IsTrue(ApiServer.MaxBodyFor("/v1/jobs", "application/octet-stream") < ApiServer.MaxFile);
            Assert.IsTrue(ApiServer.MaxBodyFor("/v1/files", null) < ApiServer.MaxFile);
        }

        static void AssertRefused(Action a)
        {
            try { a(); }
            catch (ApiServer.ApiError e)
            {
                Assert.AreEqual(400, e.Code);
                return;
            }
            Assert.Fail("accepted");
        }
    }
}
