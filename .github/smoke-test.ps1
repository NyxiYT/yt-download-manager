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
  # The extension reloads itself when this is newer than the version it runs.
  $ext = (Get-Content (Join-Path $PSScriptRoot '..\extension\manifest.json') -Raw | ConvertFrom-Json).version
  if ($hello.extension -ne $ext) { throw "The app reports extension $($hello.extension), the installer carries $ext" }
  $wow = $false
  [void][Smoke.K]::IsWow64Process($app.Handle, [ref]$wow)
  if ([Environment]::Is64BitOperatingSystem -and $wow -ne ($Arch -eq 'x86')) { throw "The app runs as the wrong kind of program (32-bit: $wow)" }
  "The $Arch app $($hello.version) works (32-bit process: $wow)"

  if ($env:CI) {
    # A real lookup runs yt-dlp (and its JavaScript runtime) through the app. Whether YouTube answers the build
    # server doesn't matter here: their temporary and cache files must stay inside the app's data folder.
    $denoBefore = Test-Path (Join-Path $env:LOCALAPPDATA 'deno')
    $since = Get-Date
    $pair = Invoke-RestMethod -Method Post 'http://127.0.0.1:17724/v1/pair' -ContentType 'application/json' -Body '{"client":"smoke test","auto":true}' `
      -Headers @{ Origin = 'chrome-extension://cgjpjebkpfjhaedhimgenbemfmgmkmjj' } -TimeoutSec 10
    try { Invoke-RestMethod 'http://127.0.0.1:17724/v1/info?v=aqz-KE-bpKQ' -Headers @{ 'X-YDM-Token' = $pair.token } -TimeoutSec 180 | Out-Null; 'lookup answered' }
    catch { "lookup without an answer (fine here): $($_.Exception.Message)" }
    $strays = @(Get-ChildItem $env:TEMP -Directory -Filter '_MEI*' -ErrorAction SilentlyContinue | Where-Object { $_.CreationTime -ge $since })
    if ($strays.Count) { throw "yt-dlp left files in Windows' temp folder: $($strays.Name -join ', ')" }
    if (-not $denoBefore -and (Test-Path (Join-Path $env:LOCALAPPDATA 'deno'))) { throw "Deno put its cache outside the app's folder" }
    'tools keep their temporary files inside the app folder'
  }
} finally {
  Stop-Process -Id $app.Id -Force -ErrorAction SilentlyContinue
}

# On the build server only: the installer removes the app again, with its data and its Windows entries.
if ($env:CI) {
  $u = Start-Process $Setup -ArgumentList '--uninstall', '--quiet' -PassThru -Wait
  if ($u.ExitCode -ne 0) { throw "Uninstalling failed with exit code $($u.ExitCode)" }
  Start-Sleep 6 # anything still in use is removed a few seconds later
  $left = @()
  foreach ($p in (Split-Path -Parent $exe), $data,
      (Join-Path ([Environment]::GetFolderPath('Programs')) 'YT Download Manager.lnk'),
      (Join-Path ([Environment]::GetFolderPath('DesktopDirectory')) 'YT Download Manager.lnk')) {
    if (Test-Path $p) { $left += $p }
  }
  foreach ($k in 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\YTDownloadManager', 'HKCU:\Software\Classes\ytdm') {
    if (Test-Path $k) { $left += $k }
  }
  foreach ($v in @(
      @('HKCU:\Software\Microsoft\Windows\CurrentVersion\Run', 'YT Download Manager'),
      @('HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run', 'YT Download Manager'),
      @('HKCU:\Software\Microsoft\Windows\CurrentVersion\ApplicationAssociationToasts', 'ytdm_ytdm'))) {
    if ($null -ne (Get-ItemProperty -Path $v[0] -Name $v[1] -ErrorAction SilentlyContinue)) { $left += "$($v[0]) : $($v[1])" }
  }
  if ($left.Count) { throw "Left behind after uninstalling: $($left -join '; ')" }
  "The $Arch installer uninstalls cleanly (program, data, shortcuts and registry entries all gone)"
}
