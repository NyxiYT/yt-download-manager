# Installs the app through Scoop from a manifest file, checks it, and uninstalls it again (build server only:
# it installs Scoop if it isn't there and removes the app with its data).
param([Parameter(Mandatory)][string]$Manifest)
$ErrorActionPreference = 'Stop'
$exe = Join-Path $env:LOCALAPPDATA 'Programs\YT Download Manager\YTDownloadManager.exe'
$data = Join-Path $env:LOCALAPPDATA 'YT Download Manager'
$want = (Get-Content $Manifest -Raw | ConvertFrom-Json).version

if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
  Invoke-Expression "& {$(Invoke-RestMethod https://get.scoop.sh)} -RunAsAdmin"
  $env:PATH = "$env:USERPROFILE\scoop\shims;$env:PATH"
}

scoop install (Resolve-Path $Manifest).Path # a full path: "dir/file.json" would be read as bucket/app
if ($LASTEXITCODE) { throw "scoop install failed ($LASTEXITCODE)" }
if (-not (Test-Path $exe)) { throw 'Scoop ran the installer, but the app is not installed' }
$have = ([Version](Get-Item $exe).VersionInfo.FileVersion).ToString(3)
if ($have -ne $want) { throw "Scoop installed version $have, the manifest says $want" }
"Scoop installs version $have"

scoop uninstall yt-download-manager
if ($LASTEXITCODE) { throw "scoop uninstall failed ($LASTEXITCODE)" }
Start-Sleep 6 # anything still in use is removed a few seconds later
$left = @((Split-Path -Parent $exe), $data | Where-Object { Test-Path $_ })
if (Test-Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\YTDownloadManager') { $left += 'its Uninstall registry key' }
if ($left.Count) { throw "Left behind after scoop uninstall: $($left -join '; ')" }
'Scoop uninstalls it cleanly'
