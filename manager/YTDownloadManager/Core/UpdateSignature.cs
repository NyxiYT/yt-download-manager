using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

namespace YTDM
{
    // Releases come with SHA256SUMS.txt and its Ed25519 signature, SHA256SUMS.txt.sig (base64), made by the
    // release workflow with a key only it has. The app installs an update only when the list is signed by one
    // of the public keys built into it (update-keys.pem, one PEM block per key: two while the key changes),
    // so a changed release or download server can't hand it another installer. A build without any key (one
    // made before the key existed) checks the checksums only, as earlier versions do.
    static class UpdateSignature
    {
        public const string SumsName = "SHA256SUMS.txt";
        public const string SigName = SumsName + ".sig";

        static List<byte[]> keys;

        public static List<byte[]> Keys
        {
            get
            {
                if (keys != null) return keys;
                using (var s = Assembly.GetExecutingAssembly().GetManifestResourceStream("update-keys.pem"))
                    keys = s == null ? new List<byte[]>() : ParseKeys(new StreamReader(s).ReadToEnd());
                return keys;
            }
        }

        // Ed25519 public keys in PEM (SubjectPublicKeyInfo: a fixed 12-byte header, then the 32-byte key).
        static readonly byte[] Header = { 0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00 };

        internal static List<byte[]> ParseKeys(string pem)
        {
            var list = new List<byte[]>();
            foreach (Match m in Regex.Matches(pem ?? "", "-----BEGIN PUBLIC KEY-----([A-Za-z0-9+/=\\s]+)-----END PUBLIC KEY-----"))
            {
                byte[] der;
                try { der = Convert.FromBase64String(Regex.Replace(m.Groups[1].Value, "\\s", "")); }
                catch (FormatException) { continue; }
                if (der.Length == 44 && der.Take(12).SequenceEqual(Header)) list.Add(der.Skip(12).ToArray());
            }
            return list;
        }

        internal static bool Signed(byte[] sums, string sigText, IEnumerable<byte[]> keys)
        {
            byte[] sig;
            try { sig = Convert.FromBase64String((sigText ?? "").Trim()); }
            catch (FormatException) { return false; }
            return keys.Any(k => Ed25519.Verify(k, sums, sig));
        }

        // The SHA-256 the release lists for `asset`, once the list's signature checks out. sigText: null when
        // the release has no signature. Throws when the list can't be trusted or doesn't name the asset.
        internal static string ListedSum(byte[] sums, string sigText, IList<byte[]> keys, string asset)
        {
            if (keys.Count > 0)
            {
                if (sigText == null) throw new InvalidDataException("the release's checksums aren't signed");
                if (!Signed(sums, sigText, keys)) throw new InvalidDataException("the release's checksums aren't signed with the app's key");
            }
            var m = Regex.Match(Encoding.UTF8.GetString(sums), "(?im)^([0-9a-f]{64})\\s+\\*?" + Regex.Escape(asset) + "\\s*$");
            if (!m.Success) throw new InvalidDataException("the release lists no checksum for " + asset);
            return m.Groups[1].Value.ToLowerInvariant();
        }
    }
}
