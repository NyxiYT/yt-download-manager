using System;
using System.Diagnostics;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;

namespace YTDM
{
    // Which program on this PC is at the other end of a local connection: the pairing prompt names it, so a
    // request that claims to be a browser but comes from something else shows what it really is.
    static class LocalPeer
    {
        // The program that connected from 127.0.0.1:clientPort to our listenPort: its full path, or null when
        // Windows doesn't tell (the connection is gone, or the program runs as another user and can't be read).
        public static string ExePath(int clientPort, int listenPort)
        {
            var pid = Pid(clientPort, listenPort);
            return pid > 0 ? ProcessPath(pid) : null;
        }

        // The table of IPv4 TCP connections with their owning process. Each row: state, local address and port,
        // remote address and port, process ID; ports in network byte order in the low 16 bits.
        public static int Pid(int clientPort, int listenPort)
        {
            int size = 0;
            const int AF_INET = 2, TCP_TABLE_OWNER_PID_CONNECTIONS = 4;
            GetExtendedTcpTable(IntPtr.Zero, ref size, false, AF_INET, TCP_TABLE_OWNER_PID_CONNECTIONS, 0);
            for (int attempt = 0; attempt < 3; attempt++)
            {
                var buf = Marshal.AllocHGlobal(size);
                try
                {
                    var r = GetExtendedTcpTable(buf, ref size, false, AF_INET, TCP_TABLE_OWNER_PID_CONNECTIONS, 0);
                    if (r == 122) continue; // ERROR_INSUFFICIENT_BUFFER: the table grew meanwhile
                    if (r != 0) return 0;
                    int rows = Marshal.ReadInt32(buf);
                    var loopback = BitConverter.ToUInt32(IPAddress.Loopback.GetAddressBytes(), 0);
                    for (int i = 0; i < rows; i++)
                    {
                        var row = buf + 4 + i * 24;
                        var localAddr = (uint)Marshal.ReadInt32(row, 4);
                        var localPort = Port(Marshal.ReadInt32(row, 8));
                        var remotePort = Port(Marshal.ReadInt32(row, 16));
                        if (localAddr == loopback && localPort == clientPort && remotePort == listenPort) return Marshal.ReadInt32(row, 20);
                    }
                    return 0;
                }
                finally { Marshal.FreeHGlobal(buf); }
            }
            return 0;
        }

        static int Port(int raw) => ((raw & 0xff) << 8) | ((raw >> 8) & 0xff);

        static string ProcessPath(int pid)
        {
            const int PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
            var h = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);
            if (h == IntPtr.Zero) return null;
            try
            {
                var sb = new StringBuilder(1024);
                int len = sb.Capacity;
                return QueryFullProcessImageName(h, 0, sb, ref len) ? sb.ToString(0, len) : null;
            }
            finally { CloseHandle(h); }
        }

        // "Google Chrome (C:\...\chrome.exe)", or just the path when the program has no description.
        public static string Describe(string exe)
        {
            if (string.IsNullOrEmpty(exe)) return null;
            string name = null;
            try { name = FileVersionInfo.GetVersionInfo(exe).FileDescription?.Trim(); } catch { }
            return string.IsNullOrEmpty(name) ? exe : name + " (" + exe + ")";
        }

        [DllImport("iphlpapi.dll")]
        static extern uint GetExtendedTcpTable(IntPtr table, ref int size, bool order, int af, int tableClass, uint reserved);

        [DllImport("kernel32.dll", SetLastError = true)]
        static extern IntPtr OpenProcess(int access, bool inherit, int pid);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        static extern bool QueryFullProcessImageName(IntPtr process, int flags, StringBuilder name, ref int size);

        [DllImport("kernel32.dll")]
        static extern bool CloseHandle(IntPtr h);
    }
}
