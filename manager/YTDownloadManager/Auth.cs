using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;

namespace YTDM
{
    // The user's YouTube sign-in, for videos YouTube only shows to signed-in, eligible accounts (age
    // restricted, members only). The browser extension hands over the youtube.com cookies of the
    // signed-in browser when such a video comes up. They live in memory only, are written to disk just
    // for the moment yt-dlp needs them (a file in the work folder, deleted right after), never logged,
    // and forgotten after a while. Normal videos never use them.
    static class Session
    {
        static readonly object L = new object();
        static string cookies;
        static long at, noAccountAt;
        const long KeepMs = 2 * 3600 * 1000;
        static int wanted;

        public static void Set(string netscapeCookies)
        {
            string names = "";
            lock (L)
            {
                cookies = string.IsNullOrWhiteSpace(netscapeCookies) ? null : netscapeCookies;
                at = Time.Now;
                noAccountAt = cookies == null ? Time.Now : 0;
                if (cookies != null) names = SignInNames(cookies);
            }
            // Only which sign-in cookies came (by name), never their values.
            Log.Info(cookies == null ? "session: the browser isn't signed in to YouTube"
                : $"session: received from the browser ({names}{(Complete(names) ? "" : "; incomplete, YouTube will treat it as signed out")})");
        }

        // yt-dlp counts a sign-in only with LOGIN_INFO and one of the SAPISID cookies.
        static readonly string[] Known = { "LOGIN_INFO", "SAPISID", "__Secure-1PAPISID", "__Secure-3PAPISID", "SID", "__Secure-1PSIDTS", "__Secure-3PSIDTS" };

        static string SignInNames(string netscape)
        {
            var have = new HashSet<string>(netscape.Split('\n').Select(l => l.Split('\t')).Where(p => p.Length == 7).Select(p => p[5].Trim()));
            return string.Join(", ", Known.Where(have.Contains));
        }

        static bool Complete(string names)
        {
            var n = names.Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries);
            return n.Contains("LOGIN_INFO") && n.Any(x => x.EndsWith("SAPISID"));
        }

        // YouTube replaced the sign-in in the browser since it was handed over: the copy is useless now.
        public static void Expire()
        {
            lock (L) cookies = null;
            Log.Info("session: YouTube no longer accepts this copy of the sign-in (rotated in the browser); waiting for a fresh one");
        }

        public static string Cookies
        {
            get
            {
                lock (L)
                {
                    if (cookies != null && Time.Now - at > KeepMs) cookies = null;
                    return cookies;
                }
            }
        }

        public static bool Available => Cookies != null;

        // The browser said it isn't signed in (recently): waiting for a sign-in can't help.
        public static bool NoAccount
        {
            get { lock (L) return cookies == null && noAccountAt > 0 && Time.Now - noAccountAt < 60000; }
        }

        // Jobs waiting for a sign-in; the browsers see this in the status and hand one over.
        public static bool Wanted => Volatile.Read(ref wanted) > 0;
        public static void Want(bool on) => Interlocked.Add(ref wanted, on ? 1 : -1);

        // Errors after which the user's own sign-in may help.
        public static readonly HashSet<string> Helps = new HashSet<string> { "errAge", "errMembers", "errPrivate" };

        // The same refusal once signed in: this account can't watch the video.
        public static string AsAccountError(string key) =>
            key == "errAge" ? "errAgeAccount" : key == "errMembers" ? "errMembersAccount" : key == "errPrivate" ? "errPrivateAccount" : key;
    }

    // A cookies.txt for one yt-dlp run; deleted again when disposed.
    sealed class CookieFile : IDisposable
    {
        public readonly string Path;

        CookieFile(string path) { Path = path; }

        public static CookieFile For(bool auth)
        {
            if (!auth) return null;
            var c = Session.Cookies ?? throw new Fail("errSignIn");
            var dir = Directory.CreateDirectory(System.IO.Path.Combine(Paths.Work, "_auth")).FullName;
            var p = System.IO.Path.Combine(dir, Rand.Id() + ".txt");
            File.WriteAllText(p, c);
            return new CookieFile(p);
        }

        public IEnumerable<string> Args => new[] { "--cookies", Path };

        public void Dispose() => Files.TryDelete(Path);
    }
}
