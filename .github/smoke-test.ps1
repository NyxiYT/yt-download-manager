# Installs one installer quietly and checks that it works: every tool is there, runs, and is built for the
# right kind of Windows, and the app starts and answers on its local port. Used by the release workflow,
# and works the same on a developer's PC (it installs over an existing copy, keeping its settings).
param(
  [Parameter(Mandatory)][string]$Setup,
  [Parameter(Mandatory)][ValidateSet('x64', 'x86')][string]$Arch
)
$ErrorActionPreference = 'Stop'
$data = Join-Path $env:LOCALAPPDATA 'YT Download Manager'
$bin = Join-Path $data 'bin'
$exe = Join-Path $env:LOCALAPPDATA 'Programs\YT Download Manager\YTDownloadManager.exe'
$js = if ($Arch -eq 'x64') { 'deno.exe' } else { 'node.exe' }

function Show-Log { $log = Join-Path $data 'logs\manager.log'; if (Test-Path $log) { Get-Content $log -Tail 40 } }

Get-Process YTDownloadManager -ErrorAction SilentlyContinue | Stop-Process -Force
if ($env:CI -and (Test-Path $bin)) { Remove-Item -Recurse -Force $bin } # on the runner each installer starts clean

$p = Start-Process $Setup -ArgumentList '--quiet' -PassThru -Wait
if ($p.ExitCode -ne 0) { Show-Log; throw "The installer failed with exit code $($p.ExitCode)" }
if (-not (Test-Path $exe)) { throw 'The app was not installed' }

# 0x14c is a 32-bit (x86) program, 0x8664 a 64-bit (x64) one.
function Get-Machine([string]$file) {
  $b = [IO.File]::ReadAllBytes($file)
  [BitConverter]::ToUInt16($b, [BitConverter]::ToInt32($b, 0x3c) + 4)
}
$want = if ($Arch -eq 'x64') { 0x8664 } else { 0x14c }
foreach ($t in 'yt-dlp.exe', 'ffmpeg.exe', 'ffprobe.exe', $js) {
  $f = Join-Path $bin $t
  if (-not (Test-Path $f)) { throw "$t is missing" }
  $m = Get-Machine $f
  if ($m -ne $want) { throw ('{0} is built for 0x{1:x}, expected 0x{2:x}' -f $t, $m, $want) }
}
& (Join-Path $bin 'yt-dlp.exe') --version
if ($LASTEXITCODE) { throw 'yt-dlp does not run' }
& (Join-Path $bin 'ffmpeg.exe') -hide_banner -version | Select-Object -First 1
if ($LASTEXITCODE) { throw 'FFmpeg does not run' }
& (Join-Path $bin $js) --version
if ($LASTEXITCODE) { throw "$js does not run" }

Add-Type -Namespace Smoke -Name K -MemberDefinition '[DllImport("kernel32.dll")] public static extern bool IsWow64Process(System.IntPtr h, out bool wow);'
$app = Start-Process $exe -ArgumentList '--background' -PassThru
try {
  $hello = $null
  for ($i = 0; $i -lt 30 -and -not $hello; $i++) {
    Start-Sleep 1
    try { $hello = Invoke-RestMethod 'http://127.0.0.1:17724/v1/hello' -TimeoutSec 2 } catch { }
  }
  if (-not $hello -or $hello.app -ne 'ytdm') { Show-Log; throw 'The app did not start or does not answer' }
  if ($env:VERSION -and $hello.version -ne $env:VERSION) { throw "The app reports version $($hello.version), expected $env:VERSION" }
  $wow = $false
  [void][Smoke.K]::IsWow64Process($app.Handle, [ref]$wow)
  if ([Environment]::Is64BitOperatingSystem -and $wow -ne ($Arch -eq 'x86')) { throw "The app runs as the wrong kind of program (32-bit: $wow)" }
  "The $Arch app $($hello.version) works (32-bit process: $wow)"
} finally {
  Stop-Process -Id $app.Id -Force -ErrorAction SilentlyContinue
}

# On the build server only: the installer removes the app again, with its data and its Windows entries.
if ($env:CI) {
  $u = Start-Process $Setup -ArgumentList '--uninstall', '--quiet' -PassThru -Wait
  if ($u.ExitCode -ne 0) { throw "Uninstalling failed with exit code $($u.ExitCode)" }
  if (Test-Path (Split-Path -Parent $exe)) { throw 'The program folder is still there after uninstalling' }
  if (Test-Path $data) { throw 'The app data is still there after uninstalling' }
  if (Test-Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\YTDownloadManager') { throw 'The uninstall entry is still there' }
  "The $Arch installer uninstalls cleanly"
}
