# Writes the package manager manifests for one release from its two installers:
#   packages/winget/<version>/*.yaml        the three winget manifests (submitted to microsoft/winget-pkgs)
#   packages/scoop/yt-download-manager.json the Scoop manifest (copied into bucket/ of this repository)
# The installers' hashes come from dist/ after a build or, with -FromRelease, from the published release's
# SHA256SUMS.txt.
param(
  [Parameter(Mandatory)][string]$Version,
  [string]$Dist = 'dist',
  [string]$Out = 'packages',
  [switch]$FromRelease
)
$ErrorActionPreference = 'Stop'
$repo = 'https://github.com/NyxiYT/yt-download-manager'
$id = 'NyxiYT.YTDownloadManager'
$base = "$repo/releases/download/v$Version"
$schema = '1.10.0'

if ($FromRelease) {
  $tmp = Join-Path ([IO.Path]::GetTempPath()) 'ytdm-SHA256SUMS.txt'
  Invoke-WebRequest "$base/SHA256SUMS.txt" -OutFile $tmp -UseBasicParsing
  $sums = Get-Content $tmp -Raw
  Remove-Item $tmp
}
function Get-Sha([string]$arch) {
  $name = "YTDownloadManager-Setup-$arch.exe"
  if ($FromRelease) {
    $m = [regex]::Match($sums, "(?im)^([0-9a-f]{64})\s+\*?$([regex]::Escape($name))\s*$")
    if (-not $m.Success) { throw "SHA256SUMS.txt of v$Version has no $name" }
    return $m.Groups[1].Value.ToUpper()
  }
  (Get-FileHash -Algorithm SHA256 (Join-Path $Dist $name)).Hash
}
$sha = @{ x64 = Get-Sha 'x64'; x86 = Get-Sha 'x86' }
$date = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')

function Write-Text([string]$path, [string]$text) {
  New-Item -ItemType Directory -Force (Split-Path -Parent $path) | Out-Null
  [IO.File]::WriteAllText($path, $text.Replace("`r`n", "`n"), (New-Object Text.UTF8Encoding $false))
}

# ---------- winget ----------
$w = Join-Path $Out "winget/$Version"
Write-Text "$w/$id.yaml" @"
# yaml-language-server: `$schema=https://aka.ms/winget-manifest.version.$schema.schema.json

PackageIdentifier: $id
PackageVersion: $Version
DefaultLocale: en-US
ManifestType: version
ManifestVersion: $schema

"@

Write-Text "$w/$id.installer.yaml" @"
# yaml-language-server: `$schema=https://aka.ms/winget-manifest.installer.$schema.schema.json

PackageIdentifier: $id
PackageVersion: $Version
InstallerType: exe
Scope: user
InstallModes:
- interactive
- silent
- silentWithProgress
InstallerSwitches:
  Silent: --quiet
  SilentWithProgress: --quiet
UpgradeBehavior: install
ProductCode: YTDownloadManager
ReleaseDate: $date
AppsAndFeaturesEntries:
- DisplayName: YT Download Manager
  Publisher: YT Download Manager
  ProductCode: YTDownloadManager
Installers:
- Architecture: x64
  InstallerUrl: $base/YTDownloadManager-Setup-x64.exe
  InstallerSha256: $($sha.x64)
- Architecture: x86
  InstallerUrl: $base/YTDownloadManager-Setup-x86.exe
  InstallerSha256: $($sha.x86)
ManifestType: installer
ManifestVersion: $schema

"@

Write-Text "$w/$id.locale.en-US.yaml" @"
# yaml-language-server: `$schema=https://aka.ms/winget-manifest.defaultLocale.$schema.schema.json

PackageIdentifier: $id
PackageVersion: $Version
PackageLocale: en-US
Publisher: NyxiYT
PublisherUrl: https://github.com/NyxiYT
PublisherSupportUrl: $repo/issues
Author: NyxiYT
PackageName: YT Download Manager
PackageUrl: https://nyxiyt.github.io/yt-download-manager/
License: MIT
LicenseUrl: $repo/blob/main/LICENSE
Copyright: Copyright (c) 2026 NyxiYT
ShortDescription: Free YouTube downloader for Windows. Download videos in up to 8K quality, MP3, Shorts, thumbnails and subtitles.
Description: |-
  YT Download Manager adds a download toolbar under every YouTube video and a Download button beside every Short.
  The Windows app does the downloading in the background: videos in up to 8K quality (with 60 fps and HDR),
  music as MP3, M4A, Opus or WAV, clips of a video, thumbnails and subtitles. It runs locally and is built on
  yt-dlp and FFmpeg. After installing, open the app and click "Add to browser" to add its browser extension.
Moniker: yt-download-manager
Tags:
- youtube
- youtube-downloader
- video-downloader
- downloader
- mp3
- 8k
- shorts
- yt-dlp
ReleaseNotesUrl: $repo/releases/tag/v$Version
ManifestType: defaultLocale
ManifestVersion: $schema

"@

# ---------- Scoop ----------
# The installer puts the app where it always goes, so updates through the app and through Scoop meet.
# Scoop runs the uninstaller when updating too; only a real uninstall removes the app.
$exe = '$env:LOCALAPPDATA\Programs\YT Download Manager\YTDownloadManager.exe'
$scoop = [ordered]@{
  version      = $Version
  description  = 'Free YouTube downloader for Windows. Download videos in up to 8K quality, MP3, Shorts, thumbnails and subtitles.'
  homepage     = 'https://nyxiyt.github.io/yt-download-manager/'
  license      = 'MIT'
  notes        = @(
    'Open YT Download Manager from the Start menu and click "Add to browser" to add its browser extension.',
    'The app updates itself. "scoop update" works too.'
  )
  architecture = [ordered]@{
    '64bit' = [ordered]@{ url = "$base/YTDownloadManager-Setup-x64.exe#/setup.exe"; hash = $sha.x64.ToLower() }
    '32bit' = [ordered]@{ url = "$base/YTDownloadManager-Setup-x86.exe#/setup.exe"; hash = $sha.x86.ToLower() }
  }
  installer    = [ordered]@{ file = 'setup.exe'; args = @('--quiet') }
  uninstaller  = [ordered]@{
    script = @(
      "if (`$cmd -eq 'uninstall' -and (Test-Path `"$exe`")) {",
      "    Start-Process `"$exe`" -ArgumentList '--uninstall', '--quiet' -Wait",
      '}'
    )
  }
  checkver     = [ordered]@{ github = $repo }
  autoupdate   = [ordered]@{
    architecture = [ordered]@{
      '64bit' = [ordered]@{ url = "$repo/releases/download/v`$version/YTDownloadManager-Setup-x64.exe#/setup.exe" }
      '32bit' = [ordered]@{ url = "$repo/releases/download/v`$version/YTDownloadManager-Setup-x86.exe#/setup.exe" }
    }
    hash         = [ordered]@{ url = "$repo/releases/download/v`$version/SHA256SUMS.txt" }
  }
}
$json = $scoop | ConvertTo-Json -Depth 8
# Windows PowerShell escapes ' and other characters as '; Scoop's own manifests keep them readable.
$json = [regex]::Replace($json, '\\u(?<h>0027|003[cCeE]|0026)', { param($m) [char][Convert]::ToInt32($m.Groups['h'].Value, 16) })
Write-Text (Join-Path $Out 'scoop/yt-download-manager.json') ($json + "`n")

Get-ChildItem -Recurse -File $Out | ForEach-Object { $_.FullName }
