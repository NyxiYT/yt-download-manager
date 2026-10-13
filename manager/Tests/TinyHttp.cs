using System;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace YTDM.Tests
{
    // A one-file web server on 127.0.0.1 for the downloader's tests: answers GET with `body`, honoring a
    // "Range: bytes=a-b" header with 206 (unless ranges are off), one request per connection.
    sealed class TinyHttp : IDisposable
    {
        readonly TcpListener listener = new TcpListener(IPAddress.Loopback, 0);
        readonly byte[] body;
        readonly bool ranges;
        int requests;

        public readonly string Url;
        public int Requests => Volatile.Read(ref requests);

        public TinyHttp(byte[] body, bool ranges = true, string path = "/api/manifest/hls_playlist/itag/96/playlist/index.m3u8")
        {
            this.body = body;
            this.ranges = ranges;
            listener.Start();
            Url = "http://127.0.0.1:" + ((IPEndPoint)listener.LocalEndpoint).Port + path;
            Task.Run(Loop);
        }

        async Task Loop()
        {
            while (true)
            {
                TcpClient c;
                try { c = await listener.AcceptTcpClientAsync(); }
                catch { return; }
                _ = Task.Run(() => Serve(c));
            }
        }

        void Serve(TcpClient c)
        {
            using (c)
            {
                try
                {
                    var s = c.GetStream();
                    var head = new StringBuilder();
                    while (!head.ToString().EndsWith("\r\n\r\n", StringComparison.Ordinal))
                    {
                        int b = s.ReadByte();
                        if (b < 0) return;
                        head.Append((char)b);
                    }
                    Interlocked.Increment(ref requests);
                    var m = Regex.Match(head.ToString(), @"\r\nRange: bytes=(\d+)-(\d*)", RegexOptions.IgnoreCase);
                    long from = 0, to = body.Length - 1;
                    string status = "200 OK", range = "";
                    if (ranges && m.Success)
                    {
                        from = long.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture);
                        if (m.Groups[2].Value.Length > 0) to = Math.Min(to, long.Parse(m.Groups[2].Value, CultureInfo.InvariantCulture));
                        status = "206 Partial Content";
                        range = "Content-Range: bytes " + from + "-" + to + "/" + body.Length + "\r\n";
                    }
                    var len = to - from + 1;
                    var h = Encoding.ASCII.GetBytes("HTTP/1.1 " + status + "\r\nContent-Type: application/vnd.apple.mpegurl\r\n" + range +
                                                    "Content-Length: " + len + "\r\nConnection: close\r\n\r\n");
                    s.Write(h, 0, h.Length);
                    s.Write(body, (int)from, (int)len);
                    s.Flush();
                }
                catch (IOException) { } // the client stopped reading
            }
        }

        public void Dispose() => listener.Stop();
    }
}
