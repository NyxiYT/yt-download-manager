using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    [TestClass]
    public class AppUpdateTests
    {
        // The tests run against the Release build, as published: it ignores YTDM_UPDATE_URL.
        [TestMethod]
        public void PublishedBuildIgnoresAnotherReleaseList()
        {
            Environment.SetEnvironmentVariable("YTDM_UPDATE_URL", "http://127.0.0.1:9/releases.json");
            try
            {
#if DEBUG
                Assert.Inconclusive("only meaningful for a Release build");
#else
                Assert.IsNull(AppUpdate.ReleaseListOverride());
#endif
            }
            finally { Environment.SetEnvironmentVariable("YTDM_UPDATE_URL", null); }
        }
    }
}
