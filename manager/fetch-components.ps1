# Downloads the exact builds listed in components.lock.json: yt-dlp, FFmpeg (shared, with its DLLs) and a
# JavaScript runtime for yt-dlp (Deno, or Node.js for 32-bit Windows, which Deno doesn't support), checks
# each against its SHA-256 from the same file, and packs what the Download Manager needs into
# vendor\components-<arch>.zip, which the installer carries inside itself. Downloads that still match are
# reused unless -Refresh is given. .github/components-lock.py updates the list.
param([ValidateSet('x64', 'x86')][string]$Arch = 'x64', [switch]$Refresh)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dl = Join-Path $root 'vendor\dl'
$stage = Join-Path $root "vendor\stage-$Arch"
$zip = Join-Path $root "vendor\components-$Arch.zip"
New-Item -ItemType Directory -Force $dl | Out-Null

$lock = (Get-Content -Raw (Join-Path $root 'components.lock.json') | ConvertFrom-Json).tools
$ytdlpBuild = $lock.'yt-dlp'.$Arch
$ffmpegBuild = $lock.ffmpeg."$Arch-shared"
$jsBuild = if ($Arch -eq 'x64') { $lock.deno.x64 } else { $lock.node.x86 }

$names = @{}
foreach ($f in $ytdlpBuild, $ffmpegBuild, $jsBuild) {
  $name = Split-Path -Leaf ([Uri]$f.url).AbsolutePath
  $path = Join-Path $dl $name
  $names[$f.url] = $name
  $ok = (Test-Path $path) -and -not $Refresh -and (Get-FileHash -Algorithm SHA256 $path).Hash.ToLower() -eq $f.sha256
  if (-not $ok) {
    Write-Host "Downloading $name"
    Invoke-WebRequest -UseBasicParsing $f.url -OutFile $path
    if ((Get-FileHash -Algorithm SHA256 $path).Hash.ToLower() -ne $f.sha256) { Remove-Item $path; throw "Checksum mismatch for $name" }
  }
  Write-Host "Verified $name ($($f.version))"
}
$ytdlp = $names[$ytdlpBuild.url]
$ffmpeg = $names[$ffmpegBuild.url]
$js = $names[$jsBuild.url]

if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Force $stage, (Join-Path $stage 'licenses') | Out-Null
Copy-Item (Join-Path $dl $ytdlp) (Join-Path $stage 'yt-dlp.exe')

$z = [IO.Compression.ZipFile]::OpenRead((Join-Path $dl $ffmpeg))
try {
  foreach ($e in $z.Entries) {
    $rel = $e.FullName.Substring($e.FullName.IndexOf('/') + 1)
    if ($rel -match '^bin/(ffmpeg\.exe|ffprobe\.exe|.+\.dll)$') { [IO.Compression.ZipFileExtensions]::ExtractToFile($e, (Join-Path $stage $e.Name), $true) }
    elseif ($rel -eq 'LICENSE.txt') { [IO.Compression.ZipFileExtensions]::ExtractToFile($e, (Join-Path $stage 'licenses\FFmpeg-LICENSE.txt'), $true) }
  }
} finally { $z.Dispose() }

$z = [IO.Compression.ZipFile]::OpenRead((Join-Path $dl $js))
try {
  if ($Arch -eq 'x64') {
    [IO.Compression.ZipFileExtensions]::ExtractToFile(($z.Entries | Where-Object Name -eq 'deno.exe'), (Join-Path $stage 'deno.exe'), $true)
  } else {
    [IO.Compression.ZipFileExtensions]::ExtractToFile(($z.Entries | Where-Object { $_.FullName -match '^[^/]+/node\.exe$' }), (Join-Path $stage 'node.exe'), $true)
    [IO.Compression.ZipFileExtensions]::ExtractToFile(($z.Entries | Where-Object { $_.FullName -match '^[^/]+/LICENSE$' }), (Join-Path $stage 'licenses\Node.js-LICENSE.txt'), $true)
  }
} finally { $z.Dispose() }

$jsLine = if ($Arch -eq 'x64') { "Deno $($jsBuild.version)  https://github.com/denoland/deno  MIT License" } else { "Node.js $($jsBuild.version)  https://nodejs.org  MIT License, see Node.js-LICENSE.txt" }
$ffmpegFrom = if ($Arch -eq 'x64') { 'https://github.com/BtbN/FFmpeg-Builds' } else { 'https://github.com/yt-dlp/FFmpeg-Builds' }
@"
Components installed by YT Download Manager
===========================================

yt-dlp $($ytdlpBuild.version)  https://github.com/yt-dlp/yt-dlp  The Unlicense (public domain)
FFmpeg $($ffmpegBuild.version)  https://ffmpeg.org  (build: $ffmpegFrom)
         GNU GPL version 3 or later, see FFmpeg-LICENSE.txt. Source code: https://github.com/FFmpeg/FFmpeg
$jsLine

Each is an unmodified build from the project named above.
"@ | Set-Content -Encoding UTF8 (Join-Path $stage 'licenses\README.txt')

if (Test-Path $zip) { Remove-Item -Force $zip }
[IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip, [IO.Compression.CompressionLevel]::Optimal, $false)
"{0} ({1:N0} MB)" -f $zip, ((Get-Item $zip).Length / 1MB)
