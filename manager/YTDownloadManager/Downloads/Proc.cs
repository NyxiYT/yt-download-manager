using System;
using System.IO;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace YTDM
{
    // A child process (yt-dlp, FFmpeg) inside its own Windows job object: stopping it also stops
    // everything it started, and if the manager itself dies Windows closes the job and ends them too,
    // so nothing keeps running in the background. The job also runs everything at below-normal
    // priority, so converting never takes processor time from the browser playing a video.
    sealed class Proc : IDisposable
    {
        [StructLayout(LayoutKind.Sequential)]
        struct BasicLimit
        {
            public long PerProcessUserTimeLimit;
            public long PerJobUserTimeLimit;
            public uint LimitFlags;
            public UIntPtr MinimumWorkingSetSize;
            public UIntPtr MaximumWorkingSetSize;
            public uint ActiveProcessLimit;
            public UIntPtr Affinity;
            public uint PriorityClass;
            public uint SchedulingClass;
        }

        [StructLayout(LayoutKind.Sequential)]
        struct IoCounters
        {
            public ulong ReadOperationCount, WriteOperationCount, OtherOperationCount, ReadTransferCount, WriteTransferCount, OtherTransferCount;
        }

        [StructLayout(LayoutKind.Sequential)]
        struct ExtendedLimit
        {
            public BasicLimit Basic;
            public IoCounters Io;
            public UIntPtr ProcessMemoryLimit;
            public UIntPtr JobMemoryLimit;
            public UIntPtr PeakProcessMemoryUsed;
            public UIntPtr PeakJobMemoryUsed;
        }

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode)] static extern IntPtr CreateJobObject(IntPtr attrs, string name);
        [DllImport("kernel32.dll")] static extern bool SetInformationJobObject(IntPtr job, int cls, ref ExtendedLimit info, uint len);
        [DllImport("kernel32.dll")] static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
        [DllImport("kernel32.dll")] static extern bool TerminateJobObject(IntPtr job, uint code);
        [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);

        const uint KillOnJobClose = 0x2000;
        const uint LimitPriorityClass = 0x20;
        const uint BelowNormal = 0x4000;

        readonly Process p;
        IntPtr job;
        readonly TaskCompletionSource<int> done = new TaskCompletionSource<int>();
        readonly StringBuilder err = new StringBuilder();
        public bool Killed { get; private set; }

        public Task<int> Exit => done.Task;

        public string ErrText
        {
            get { lock (err) return err.ToString(); }
        }

        Proc(Process p) { this.p = p; }

        public static Proc Start(string exe, IEnumerable<string> args, Action<string> onOut = null, Action<string> onErr = null, string cwd = null)
        {
            var psi = new ProcessStartInfo(exe, Args.Join(args))
            {
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                RedirectStandardInput = true,
                StandardOutputEncoding = new UTF8Encoding(false),
                StandardErrorEncoding = new UTF8Encoding(false),
                WorkingDirectory = cwd ?? Paths.Work,
            };
            psi.EnvironmentVariables["PYTHONUTF8"] = "1";
            psi.EnvironmentVariables["PYTHONIOENCODING"] = "utf-8";
            // Temporary files (yt-dlp unpacks itself on every start) and Deno's cache stay in the app's own data
            // folder: nothing is left in Windows' temp folder, and uninstalling removes all of it.
            psi.EnvironmentVariables["TEMP"] = psi.EnvironmentVariables["TMP"] = Paths.Temp;
            psi.EnvironmentVariables["DENO_DIR"] = Path.Combine(Paths.Cache, "deno");
            psi.EnvironmentVariables["PYTHONUNBUFFERED"] = "1";

            var proc = new Process { StartInfo = psi, EnableRaisingEvents = true };
            var me = new Proc(proc);
            proc.OutputDataReceived += (s, e) => { if (e.Data != null) onOut?.Invoke(e.Data); };
            proc.ErrorDataReceived += (s, e) =>
            {
                if (e.Data == null) return;
                lock (me.err)
                {
                    me.err.AppendLine(e.Data);
                    if (me.err.Length > 65536) me.err.Remove(0, me.err.Length - 32768);
                }
                onErr?.Invoke(e.Data);
            };
            Log.Info("run " + System.IO.Path.GetFileName(exe) + " " + Redact(psi.Arguments));
            proc.Start();
            try { proc.PriorityClass = ProcessPriorityClass.BelowNormal; } catch { }
            me.job = CreateJobObject(IntPtr.Zero, null);
            if (me.job != IntPtr.Zero)
            {
                var info = new ExtendedLimit();
                info.Basic.LimitFlags = KillOnJobClose | LimitPriorityClass;
                info.Basic.PriorityClass = BelowNormal;
                SetInformationJobObject(me.job, 9, ref info, (uint)Marshal.SizeOf(typeof(ExtendedLimit)));
                AssignProcessToJobObject(me.job, proc.Handle);
            }
            try { proc.StandardInput.Close(); } catch { }
            proc.BeginOutputReadLine();
            proc.BeginErrorReadLine();
            Task.Run(() =>
            {
                try
                {
                    proc.WaitForExit(); // also waits until both output streams are drained
                    me.done.TrySetResult(proc.ExitCode);
                }
                catch (Exception e) { me.done.TrySetException(e); }
            });
            return me;
        }

        public void Kill()
        {
            Killed = true;
            try { if (job != IntPtr.Zero) TerminateJobObject(job, 1); } catch { }
            try { if (!p.HasExited) p.Kill(); } catch { }
        }

        public void Dispose()
        {
            if (job != IntPtr.Zero)
            {
                CloseHandle(job);
                job = IntPtr.Zero;
            }
            p.Dispose();
        }

        // Runs to completion; the token kills the process tree.
        public static async Task<(int code, string stdout, string stderr, bool killed)> Run(string exe, IEnumerable<string> args, CancellationToken ct, int timeoutMs = 0, Action<string> onOut = null, bool keepOut = true)
        {
            var sb = new StringBuilder();
            using (var p = Start(exe, args, line =>
            {
                if (keepOut) lock (sb) sb.AppendLine(line);
                onOut?.Invoke(line);
            }))
            using (ct.Register(p.Kill))
            {
                Task finished = p.Exit;
                if (timeoutMs > 0 && await Task.WhenAny(finished, Task.Delay(timeoutMs)).ConfigureAwait(false) != finished)
                {
                    p.Kill();
                }
                int code;
                try { code = await p.Exit.ConfigureAwait(false); } catch { code = -1; }
                lock (sb) return (code, sb.ToString(), p.ErrText, p.Killed);
            }
        }

        // Stream URLs carry signatures; keep them out of the log.
        static string Redact(string s) => System.Text.RegularExpressions.Regex.Replace(s ?? "", "https://[^\\s\"]*googlevideo[^\\s\"]*", "<stream-url>");
    }
}
