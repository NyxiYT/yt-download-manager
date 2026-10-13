using System;
using System.IO;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    // The proof /v1/hello gives the browser (see AppProof). The vectors in Fixtures/proof-vectors.json were made
    // with Python's hmac; the extension's own test checks its code against the same file.
    [TestClass]
    public class AppProofTests
    {
        static byte[] Bytes(string hex) => Enumerable.Range(0, hex.Length / 2).Select(i => Convert.ToByte(hex.Substring(i * 2, 2), 16)).ToArray();

        [TestMethod]
        public void ProofMatchesTheVectors()
        {
            var v = Json.ParseObj(Fixture.Text("proof-vectors.json"));
            int port = v.Int("port");
            Assert.AreEqual(v.Str("proof"), AppProof.Of(Bytes(v.Str("key")), v.Str("nonce"), port));
            Assert.AreEqual(v.Str("otherPortProof"), AppProof.Of(Bytes(v.Str("key")), v.Str("nonce"), 17725));
            Assert.AreEqual(v.Str("tokenProof"), AppProof.Of(Bytes(v.Str("tokenHash")), v.Str("nonce"), port));
        }

        // The app stores exactly the token hash the browser works out.
        [TestMethod]
        public void StoredTokenHashIsTheBrowsersKey()
        {
            var v = Json.ParseObj(Fixture.Text("proof-vectors.json"));
            Assert.AreEqual(v.Str("tokenHash"), Rand.Sha256(v.Str("token")));
        }

        [TestMethod]
        public void HelloCarriesBothKindsOfProof()
        {
            var v = Json.ParseObj(Fixture.Text("proof-vectors.json"));
            var d = AppProof.Hello(v.Str("nonce"), v.Int("port"), Bytes(v.Str("key")), new[] { v.Str("tokenHash"), "not a hash", null });
            Assert.AreEqual(v.Str("proof"), d["proof"]);
            CollectionAssert.AreEqual(new object[] { v.Str("tokenProof") }, (object[])d["tokenProofs"]);
        }

        // Without an install key the app still shows it can prove itself (an empty list is enough).
        [TestMethod]
        public void HelloWithoutInstallKey()
        {
            var d = AppProof.Hello("0123456789abcdef", 17724, null, new string[0]);
            Assert.IsFalse(d.ContainsKey("proof"));
            Assert.AreEqual(0, ((object[])d["tokenProofs"]).Length);
        }

        [DataTestMethod]
        [DataRow(null, false)]
        [DataRow("", false)]
        [DataRow("0123456789abcde", false)] // 15
        [DataRow("0123456789abcdef", true)]
        [DataRow("0123456789abcdef0123456789abcdef", true)]
        [DataRow("0123456789abcdef\n", false)]
        [DataRow("0123456789abcdef|1", false)]
        [DataRow("0123456789abcdef%7C", false)]
        public void NonceIsChecked(string nonce, bool ok) => Assert.AreEqual(ok, AppProof.ValidNonce(nonce));

        // The installer keeps the key through updates and puts the same one next to the extension.
        [TestMethod]
        public void InstallKeyIsMadeOnceAndCopied()
        {
            var first = AppProof.Ensure();
            Assert.AreEqual(32, first.Length);
            CollectionAssert.AreEqual(first, AppProof.Ensure());
            CollectionAssert.AreEqual(first, AppProof.Key);
            using (var t = new TempDir())
            {
                AppProof.WriteTo(t.Dir);
                var key = Json.ParseObj(File.ReadAllText(Path.Combine(t.Dir, "app-key.json"))).Str("key");
                CollectionAssert.AreEqual(first, Bytes(key));
            }
        }
    }
}
