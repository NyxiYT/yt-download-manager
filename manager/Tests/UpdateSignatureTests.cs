using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Numerics;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // Signed update checksums: the Ed25519 check and how an update is judged by it.
    [TestClass]
    public class UpdateSignatureTests
    {
        static byte[] Hex(string h) => Enumerable.Range(0, h.Length / 2).Select(i => Convert.ToByte(h.Substring(i * 2, 2), 16)).ToArray();

        // RFC 8032, section 7.1, tests 1 to 3 (also checked with Python's cryptography).
        [DataTestMethod]
        [DataRow("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", "",
            "e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b")]
        [DataRow("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c", "72",
            "92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00")]
        [DataRow("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025", "af82",
            "6291d657deec24024827e69c3abe01a30ce548a284743a445e3680d7db5ac3ac18ff9b538d16f290ae67f760984dc6594a7c15e9716ed28dc027beceea1ec40a")]
        public void RfcVectors(string pub, string msg, string sig)
        {
            Assert.IsTrue(Ed25519.Verify(Hex(pub), Hex(msg), Hex(sig)));
            var bad = Hex(sig);
            bad[5] ^= 1;
            Assert.IsFalse(Ed25519.Verify(Hex(pub), Hex(msg), bad));
            Assert.IsFalse(Ed25519.Verify(Hex(pub), Hex(msg + "00"), Hex(sig)));
        }

        // A signature can be made a second one by adding the group order to S; only the canonical form counts.
        [TestMethod]
        public void NonCanonicalSignatureIsRefused()
        {
            var pub = Hex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a");
            var sig = Hex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b");
            var l = BigInteger.Pow(2, 252) + BigInteger.Parse("27742317777372353535851937790883648493");
            var s = new BigInteger(sig.Skip(32).Concat(new byte[] { 0 }).ToArray()) + l;
            var sb = s.ToByteArray().Concat(new byte[32]).Take(32).ToArray();
            Assert.IsFalse(Ed25519.Verify(pub, new byte[0], sig.Take(32).Concat(sb).ToArray()));
        }

        [TestMethod]
        public void WrongSizesAreRefused()
        {
            Assert.IsFalse(Ed25519.Verify(new byte[31], new byte[0], new byte[64]));
            Assert.IsFalse(Ed25519.Verify(new byte[32], new byte[0], new byte[63]));
            Assert.IsFalse(Ed25519.Verify(null, new byte[0], new byte[64]));
        }

        // Made the way the release workflow makes it: openssl pkeyutl -sign -rawin, base64.
        static byte[] Sums => File.ReadAllBytes(Fixture.Path("update-signing", "SHA256SUMS.txt"));
        static string Sig => File.ReadAllText(Fixture.Path("update-signing", "SHA256SUMS.txt.sig"));
        static List<byte[]> TestKeys => UpdateSignature.ParseKeys(File.ReadAllText(Fixture.Path("update-signing", "test-key.pem")));

        [TestMethod]
        public void OpenSslSignatureIsAccepted()
        {
            Assert.AreEqual(1, TestKeys.Count);
            Assert.IsTrue(UpdateSignature.Signed(Sums, Sig, TestKeys));
        }

        [TestMethod]
        public void ChangedListIsRefused()
        {
            var changed = Encoding.UTF8.GetBytes(Encoding.UTF8.GetString(Sums).Replace("4bf5122f", "4bf5122e"));
            Assert.IsFalse(UpdateSignature.Signed(changed, Sig, TestKeys));
            Assert.ThrowsException<InvalidDataException>(() => UpdateSignature.ListedSum(changed, Sig, TestKeys, "YTDownloadManager-Setup-x64.exe"));
        }

        [TestMethod]
        public void SignedListGivesTheChecksum()
        {
            var sum = UpdateSignature.ListedSum(Sums, Sig, TestKeys, "YTDownloadManager-Setup-x86.exe");
            StringAssert.Matches(sum, new System.Text.RegularExpressions.Regex("^[0-9a-f]{64}$"));
            StringAssert.Contains(Encoding.UTF8.GetString(Sums), sum + "  YTDownloadManager-Setup-x86.exe");
        }

        [TestMethod]
        public void UnsignedListIsRefusedOnceTheAppHasAKey() =>
            Assert.ThrowsException<InvalidDataException>(() => UpdateSignature.ListedSum(Sums, null, TestKeys, "YTDownloadManager-Setup-x64.exe"));

        [TestMethod]
        public void SignatureFromAnotherKeyIsRefused()
        {
            var other = new List<byte[]> { Hex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a") };
            Assert.ThrowsException<InvalidDataException>(() => UpdateSignature.ListedSum(Sums, Sig, other, "YTDownloadManager-Setup-x64.exe"));
        }

        // A build without a key behaves as earlier versions: checksums only.
        [TestMethod]
        public void WithoutAKeyTheChecksumsAloneCount() =>
            Assert.IsNotNull(UpdateSignature.ListedSum(Sums, null, new List<byte[]>(), "YTDownloadManager-Setup-x64.exe"));

        // While the key changes, the app knows both: either one's signature counts.
        [TestMethod]
        public void TwoKeysInOneFile()
        {
            var pem = File.ReadAllText(Fixture.Path("update-signing", "test-key.pem"));
            var both = UpdateSignature.ParseKeys("-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA11qYAYKxCrfVS/7TyWQHOg7hcvPapiMlrwIaaPcHURo=\n-----END PUBLIC KEY-----\n" + pem);
            Assert.AreEqual(2, both.Count);
            Assert.IsTrue(UpdateSignature.Signed(Sums, Sig, both));
        }

        [TestMethod]
        public void OtherKindsOfKeysAreIgnored() =>
            Assert.AreEqual(0, UpdateSignature.ParseKeys("-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\n-----END PUBLIC KEY-----\nnot a key").Count);
    }
}
