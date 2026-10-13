using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace YTDM
{
    // How the app shows the browser that it is the real YT Download Manager of this PC, and not another
    // program that took its local port while the app wasn't running (that one would otherwise get the
    // browser's token and its YouTube sign-in). The browser sends a random nonce to /v1/hello; the app answers
    // HMAC-SHA256(key, nonce + "|" + port): once with the install key, which the installer also puts into the
    // extension folder as app-key.json, where only our extension can read it, and once for each paired browser
    // with the SHA-256 of its token, which that browser can work out and the app already stores. The port is
    // part of it, so an answer can't be passed on from the app on another port.
    static class AppProof
    {
        public const string KeyFileName = "app-key.json";

        static readonly object L = new object();
        static byte[] key;
        static long keyCheckedAt;

        static string DataFile => Path.Combine(Paths.Data, KeyFileName);

        // The installer: the key made at the first install (kept through updates), or a new one.
        public static byte[] Ensure()
        {
            lock (L)
            {
                var k = Read(DataFile);
                if (k == null)
                {
                    k = Rand.Bytes(32);
                    Directory.CreateDirectory(Paths.Data);
                    Files.WriteAtomic(DataFile, KeyJson(k));
                }
                key = k;
                return k;
            }
        }

        // The installer, into the extension folder it is about to put in place.
        public static void WriteTo(string extensionDir) => File.WriteAllText(Path.Combine(extensionDir, KeyFileName), KeyJson(Ensure()), new UTF8Encoding(false));

        // The app: null when no installer made one (a build run on its own). Looked for again every minute.
        public static byte[] Key
        {
            get
            {
                lock (L)
                {
                    if (key == null && Time.Now - keyCheckedAt > 60000)
                    {
                        keyCheckedAt = Time.Now;
                        key = Read(DataFile);
                    }
                    return key;
                }
            }
        }

        static string KeyJson(byte[] k) => Json.Write(new Dictionary<string, object> { ["key"] = Hex(k) });

        static byte[] Read(string file)
        {
            try
            {
                if (!File.Exists(file)) return null;
                var h = Json.ParseObj(File.ReadAllText(file)).Str("key");
                return h != null && Regex.IsMatch(h, "^[0-9a-f]{64}\\z") ? FromHex(h) : null;
            }
            catch (Exception e)
            {
                Log.Warn("app key: " + e.Message);
                return null;
            }
        }

        public static bool ValidNonce(string nonce) => nonce != null && Regex.IsMatch(nonce, "^[A-Za-z0-9_-]{16,128}\\z");

        // Lower-case hex of HMAC-SHA256(key, "<nonce>|<port>").
        public static string Of(byte[] k, string nonce, int port)
        {
            using (var h = new HMACSHA256(k))
                return Hex(h.ComputeHash(Encoding.UTF8.GetBytes(nonce + "|" + port.ToString(System.Globalization.CultureInfo.InvariantCulture))));
        }

        // What /v1/hello adds for a nonce: "proof" with the install key (when there is one), "tokenProofs" with
        // each stored token hash (hex of SHA-256 of the token, used as its 32 bytes). An app that sends
        // tokenProofs, even an empty list, can prove itself; older apps send neither.
        public static Dictionary<string, object> Hello(string nonce, int port, byte[] installKey, IEnumerable<string> tokenHashes)
        {
            var d = new Dictionary<string, object>
            {
                ["tokenProofs"] = tokenHashes.Where(t => t != null && Regex.IsMatch(t, "^[0-9a-f]{64}\\z")).Select(t => (object)Of(FromHex(t), nonce, port)).ToArray(),
            };
            if (installKey != null) d["proof"] = Of(installKey, nonce, port);
            return d;
        }

        static string Hex(byte[] b) => BitConverter.ToString(b).Replace("-", "").ToLowerInvariant();

        static byte[] FromHex(string h)
        {
            var b = new byte[h.Length / 2];
            for (int i = 0; i < b.Length; i++) b[i] = Convert.ToByte(h.Substring(i * 2, 2), 16);
            return b;
        }
    }
}
