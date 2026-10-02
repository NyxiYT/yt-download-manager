@echo off
rem Builds the Download Manager and its installers (needs the .NET SDK), then puts the installers, the
rem browser extension as a zip and the userscript into ..\dist. Each installer carries yt-dlp, FFmpeg and
rem a JavaScript runtime for its kind of Windows; fetch-components.ps1 downloads and verifies them (once,
rem or again with -Refresh). "build x64" or "build x86" builds only that installer.
setlocal
cd /d "%~dp0"
set ARCHS=%~1
if "%ARCHS%"=="" set ARCHS=x64 x86
if not exist ..\dist mkdir ..\dist
rem The browser extension ships inside the installers, and on its own for browsers without the app.
powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; $z = Join-Path (Resolve-Path vendor) 'extension.zip'; if (Test-Path $z) { Remove-Item $z }; [IO.Compression.ZipFile]::CreateFromDirectory((Resolve-Path ..\extension), $z, 'Optimal', $false)" || exit /b 1
copy /y vendor\extension.zip ..\dist\YTStandaloneDownloader-Extension.zip >nul || exit /b 1
for %%A in (%ARCHS%) do (
  call :installer %%A || exit /b 1
)
copy /y ..\yt-standalone-downloader.user.js ..\dist\ >nul || exit /b 1
echo Built into %~dp0..\dist
exit /b 0

:installer
powershell -NoProfile -ExecutionPolicy Bypass -File fetch-components.ps1 -Arch %1 || exit /b 1
copy /y vendor\components-%1.zip vendor\components.zip >nul || exit /b 1
rem The 32-bit installer's app runs as a 32-bit program everywhere, like on 32-bit Windows.
set PT=AnyCPU
if "%1"=="x86" set PT=x86
dotnet build YTDownloadManager\YTDownloadManager.csproj -c Release -nologo --no-incremental -p:PlatformTarget=%PT% || exit /b 1
dotnet build Setup\Setup.csproj -c Release -nologo --no-incremental || exit /b 1
copy /y Setup\bin\Release\net48\YTDownloadManager-Setup.exe ..\dist\YTDownloadManager-Setup-%1.exe >nul || exit /b 1
echo Built YTDownloadManager-Setup-%1.exe
exit /b 0
