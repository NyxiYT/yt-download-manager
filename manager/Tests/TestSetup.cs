using System;
using System.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    [TestClass]
    public static class TestSetup
    {
        static string data;

        // The app writes its log and work files into its data folder. Tests get their own, so they never touch
        // the installed app's settings or queue. Set before any test touches Paths (which reads it once).
        [AssemblyInitialize]
        public static void Init(TestContext _)
        {
            data = Path.Combine(Path.GetTempPath(), "ytdm-tests-" + Guid.NewGuid().ToString("N").Substring(0, 8));
            Directory.CreateDirectory(data);
            Environment.SetEnvironmentVariable("YTDM_DATA_DIR", data);
        }

        [AssemblyCleanup]
        public static void Done()
        {
            try { Directory.Delete(data, true); } catch { }
        }
    }

    static class Fixture
    {
        public static string Path(params string[] parts) =>
            System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Fixtures", System.IO.Path.Combine(parts));

        public static string Text(params string[] parts) => File.ReadAllText(Path(parts));
    }

    // A fresh folder under the system's temp folder, removed afterwards.
    sealed class TempDir : IDisposable
    {
        public readonly string Dir = Path.Combine(Path.GetTempPath(), "ytdm-test-" + Guid.NewGuid().ToString("N").Substring(0, 8));

        public TempDir() => Directory.CreateDirectory(Dir);

        // Always in the \\?\ form: a test may have put files past the path limit inside it.
        public void Dispose()
        {
            try { Directory.Delete(@"\\?\" + Dir, true); } catch { }
        }
    }
}
