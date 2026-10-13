using System;
using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace YTDM.Tests
{
    [TestClass]
    public class PairingTests
    {
        [DataTestMethod]
        [DataRow(null, true)]                                                // userscript managers: no Origin
        [DataRow("", true)]
        [DataRow("chrome-extension://cgjpjebkpfjhaedhimgenbemfmgmkmjj", true)]
        [DataRow("moz-extension://0d9e3c1a-5a8f-4b7e-9c55-123456789abc", true)]
        [DataRow("https://www.youtube.com", true)]
        [DataRow("null", false)]                                             // sandboxed frames, local files
        [DataRow("https://example.com", false)]
        [DataRow("http://127.0.0.1:8080", false)]
        [DataRow("https://www.youtube.com.example.com", false)]
        public void OriginsAreChecked(string origin, bool ok) => Assert.AreEqual(ok, ApiServer.OriginOk(origin));

        // A connection from this test to a port it listens on: the lookup finds this very program.
        [TestMethod]
        public void FindsTheProgramBehindALocalConnection()
        {
            var l = new TcpListener(IPAddress.Loopback, 0);
            l.Start();
            try
            {
                int listen = ((IPEndPoint)l.LocalEndpoint).Port;
                using (var c = new TcpClient())
                {
                    c.Connect(IPAddress.Loopback, listen);
                    using (var server = l.AcceptTcpClient())
                    {
                        int client = ((IPEndPoint)server.Client.RemoteEndPoint).Port;
                        Assert.AreEqual(Process.GetCurrentProcess().Id, LocalPeer.Pid(client, listen));
                        Assert.AreEqual(Process.GetCurrentProcess().MainModule.FileName, LocalPeer.ExePath(client, listen), true);
                    }
                }
            }
            finally { l.Stop(); }
        }

        [TestMethod]
        public void NoProgramForAConnectionThatIsNotThere() => Assert.IsNull(LocalPeer.ExePath(1, 2));

        [TestMethod]
        public void DescribesAProgram()
        {
            var exe = Environment.ExpandEnvironmentVariables(@"%SystemRoot%\System32\notepad.exe");
            StringAssert.EndsWith(LocalPeer.Describe(exe), "(" + exe + ")");
            Assert.IsNull(LocalPeer.Describe(null));
        }
    }
}
