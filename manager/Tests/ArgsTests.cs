using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // Args.Quote has to survive Windows' own command-line splitting: yt-dlp and FFmpeg get their arguments
    // back the way CommandLineToArgvW reads them.
    [TestClass]
    public class ArgsTests
    {
        [DllImport("shell32.dll", SetLastError = true)]
        static extern IntPtr CommandLineToArgvW([MarshalAs(UnmanagedType.LPWStr)] string cmdLine, out int numArgs);

        [DllImport("kernel32.dll")]
        static extern IntPtr LocalFree(IntPtr mem);

        static string[] Split(string cmdLine)
        {
            var p = CommandLineToArgvW(cmdLine, out var n);
            if (p == IntPtr.Zero) throw new InvalidOperationException("CommandLineToArgvW failed: " + Marshal.GetLastWin32Error());
            try
            {
                var r = new string[n];
                for (int i = 0; i < n; i++) r[i] = Marshal.PtrToStringUni(Marshal.ReadIntPtr(p, i * IntPtr.Size));
                return r;
            }
            finally { LocalFree(p); }
        }

        // The program's own name comes first and follows other rules, so a plain one goes in front.
        static string[] RoundTrip(params string[] args)
        {
            var all = Split("yt-dlp.exe " + Args.Join(args));
            var r = new string[all.Length - 1];
            Array.Copy(all, 1, r, 0, r.Length);
            return r;
        }

        static readonly string[] Samples =
        {
            "plain",
            "",
            " ",
            "two words",
            "tab\there",
            "say \"hi\"",
            "\"",
            "\"\"",
            "\\",
            "\\\\",
            "trailing\\",
            "trailing\\\\",
            "C:\\Program Files\\YT Download Manager\\",
            "C:\\Users\\me\\Downloads\\Big Buck Bunny (2).mp4",
            "\\\\server\\share\\folder with space\\",
            "back\\\"quote",
            "back\\\\\"quote",
            "\\\"",
            "a\\\\b\\\\\\c",
            "--cookies=C:\\a b\\c.txt",
            "title=Ünïcødé 日本語 Привет",
            "emoji 😀🎬 and \"quotes\"",
            "line\nbreak",
            "carriage\rreturn",
            "-metadata",
            "comment=She said \"no\\\" \\\\\"",
        };

        [TestMethod]
        public void EachSampleRoundTrips()
        {
            foreach (var s in Samples)
            {
                var back = RoundTrip(s);
                Assert.AreEqual(1, back.Length, "split apart: [" + s + "] -> " + Args.Join(new[] { s }));
                Assert.AreEqual(s, back[0], "changed: [" + s + "] -> " + Args.Join(new[] { s }));
            }
        }

        [TestMethod]
        public void AllSamplesTogetherRoundTrip() => CollectionAssert.AreEqual(Samples, RoundTrip(Samples));

        [TestMethod]
        public void NullBecomesAnEmptyArgument() => CollectionAssert.AreEqual(new[] { "" }, RoundTrip(new string[] { null }));

        [TestMethod]
        public void PlainArgumentsStayUnquoted()
        {
            Assert.AreEqual("--no-playlist", Args.Quote("--no-playlist"));
            Assert.AreEqual("C:\\a\\b.mp4", Args.Quote("C:\\a\\b.mp4"));
        }

        // Random strings from the characters that matter to the rules, many times over.
        [TestMethod]
        public void RandomStringsRoundTrip()
        {
            var rnd = new Random(1234);
            var chars = new[] { 'a', ' ', '\t', '\n', '"', '\\', 'é', '日' };
            for (int round = 0; round < 2000; round++)
            {
                var list = new List<string>();
                for (int k = rnd.Next(1, 4); k > 0; k--)
                {
                    var c = new char[rnd.Next(0, 12)];
                    for (int i = 0; i < c.Length; i++) c[i] = chars[rnd.Next(chars.Length)];
                    list.Add(new string(c));
                }
                CollectionAssert.AreEqual(list, RoundTrip(list.ToArray()), Args.Join(list));
            }
        }
    }
}
