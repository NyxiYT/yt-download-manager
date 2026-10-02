# Downloads the official builds of yt-dlp, FFmpeg (yt-dlp's shared build) and a JavaScript runtime for
# yt-dlp (Deno, or Node.js for 32-bit Windows, which Deno doesn't support), verifies their published
# SHA-256 checksums and packs what the Download Manager needs into vendor\components-<arch>.zip, which the
# installer carries inside itself. Existing downloads are reused unless -Refresh is given.
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

$ytdlp = if ($Arch -eq 'x64') { 'yt-dlp.exe' } else { 'yt-dlp_x86.exe' }
$ffmpeg = if ($Arch -eq 'x64') { 'ffmpeg-master-latest-win64-gpl-shared.zip' } else { 'ffmpeg-master-latest-win32-gpl-shared.zip' }
$files = @(
  @{ Url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/$ytdlp"; Sums = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/SHA2-256SUMS' },
  @{ Url = "https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/$ffmpeg"; Sums = 'https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/checksums.sha256' }
)
if ($Arch -eq 'x64') {
  $js = 'deno-x86_64-pc-windows-msvc.zip'
  $files += @{ Url = "https://github.com/denoland/deno/releases/latest/download/$js"; Sums = "https://github.com/denoland/deno/releases/latest/download/$js.sha256sum" }
} else {
  # Node.js 22 is the newest line with 32-bit Windows builds; its file names carry the exact version.
  $sumsUrl = 'https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt'
  $sumsPath = Join-Path $dl 'node-SHASUMS256.txt'
  if ($Refresh -or -not (Test-Path $sumsPath)) { Invoke-WebRequest -UseBasicParsing $sumsUrl -OutFile $sumsPath }
  $js = [regex]::Match((Get-Content -Raw $sumsPath), 'node-v22\.[0-9.]+-win-x86\.zip').Value
  if (-not $js) { throw 'No 32-bit Windows build of Node.js 22 listed' }
  $files += @{ Url = "https://nodejs.org/dist/latest-v22.x/$js"; Sums = $sumsUrl; SumsFile = 'node-SHASUMS256.txt' }
}

function Get-Expected([string]$sumsFile, [string]$name) {
  $hashes = @()
  foreach ($line in Get-Content $sumsFile) {
    $m = [regex]::Match($line, '\b([0-9a-fA-F]{64})\b')
    if (-not $m.Success) { continue }
    if ($line -match ('(^|[\s*/\\])' +[regex]::Escape($name) + '\s*$')) { return $m.Groups[1].Value.ToLower() }
    if ($line -notmatch '\.(zip|exe|7z|tar|xz|gz|msi|pkg)\b') { $hashes += $m.Groups[1].Value.ToLower() }
  }
  if ($hashes.Count -eq 1) { return $hashes[0] }
  throw "No checksum for $name in $sumsFile"
}

foreach ($f in $files) {
  $name = Split-Path -Leaf $f.Url
  $path = Join-Path $dl $name
  $sums = Join-Path $dl $(if ($f.SumsFile) { $f.SumsFile } else { Split-Path -Leaf $f.Sums })
  # "latest" builds change: a file kept from before that no longer matches the list is downloaded again,
  # and every new download is checked against a new list.
  foreach ($try in 1, 2) {
    $fresh = $Refresh -or $try -eq 2 -or -not (Test-Path $path)
    if ($fresh) { Write-Host "Downloading $name"; Invoke-WebRequest -UseBasicParsing $f.Url -OutFile $path }
    if ($fresh -or -not (Test-Path $sums)) { Invoke-WebRequest -UseBasicParsing $f.Sums -OutFile $sums }
    $ok = (Get-Expected $sums $name) -eq (Get-FileHash -Algorithm SHA256 $path).Hash.ToLower()
    if ($ok -or $fresh) { break }
  }
  if (-not $ok) { throw "Checksum mismatch for $name" }
  Write-Host "Verified $name"
}

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

$jsLine = if ($Arch -eq 'x64') { 'Deno     https://github.com/denoland/deno          MIT License' } else { 'Node.js  https://nodejs.org                        MIT License, see Node.js-LICENSE.txt' }
@"
Components installed by YT Download Manager
===========================================

yt-dlp   https://github.com/yt-dlp/yt-dlp          The Unlicense (public domain)
FFmpeg   https://ffmpeg.org  (build: https://github.com/yt-dlp/FFmpeg-Builds)
         GNU GPL version 3 or later, see FFmpeg-LICENSE.txt. Source code: https://github.com/FFmpeg/FFmpeg
$jsLine

Each is the unmodified official release build.
"@ | Set-Content -Encoding UTF8 (Join-Path $stage 'licenses\README.txt')

if (Test-Path $zip) { Remove-Item -Force $zip }
[IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip, [IO.Compression.CompressionLevel]::Optimal, $false)
"{0} ({1:N0} MB)" -f $zip, ((Get-Item $zip).Length / 1MB)
