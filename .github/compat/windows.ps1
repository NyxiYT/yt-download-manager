# Compatibility run of one installer on one Windows machine (a build server; it changes users, locales and
# firewall rules there). Areas: upgrade over the last release, install and uninstall (smoke-test.ps1), a
# standard user whose profile folder has a space and non-ASCII letters, file names and paths longer than 260
# characters, other locales, the window in every language and in light and dark mode, downloads (single at
# the highest quality, parallel, pause, resume, cancel, retry), a dropped connection, and Defender.
# Each area's result goes to <Out>/<name>.json; the script fails when any area fails. Areas that need
# YouTube to answer this machine count as skipped when YouTube refuses it.
param(
  [Parameter(Mandatory)][string]$Setup,
  [Parameter(Mandatory)][ValidateSet('x64', 'x86')][string]$Arch,
  [string]$Out = 'compat-results',
  [string]$Name = "windows-$Arch",
  [string]$Previous # the last release's installer; by default downloaded with gh
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$Setup = (Resolve-Path $Setup).Path
$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$data = Join-Path $env:LOCALAPPDATA 'YT Download Manager'
$exe = Join-Path $env:LOCALAPPDATA 'Programs\YT Download Manager\YTDownloadManager.exe'
$settingsFile = Join-Path $data 'settings.json'
$origin = 'chrome-extension://cgjpjebkpfjhaedhimgenbemfmgmkmjj'
$work = 'C:\compat'
New-Item -ItemType Directory -Force $work, $Out, (Join-Path $Out 'screens') | Out-Null
$version = ([xml](Get-Content (Join-Path $repo 'manager\YTDownloadManager\YTDownloadManager.csproj'))).Project.PropertyGroup.Version | Where-Object { $_ } | Select-Object -First 1
$os = Get-CimInstance Win32_OperatingSystem
$results = [ordered]@{
  name = $Name; arch = $Arch; version = $version
  os = "$($os.Caption) $($os.Version) ($($os.OSArchitecture), $env:PROCESSOR_ARCHITECTURE)"
  areas = [ordered]@{}
}
$youtube = $null # $false once YouTube refused this machine

function Save { [IO.File]::WriteAllText((Join-Path $Out "$Name.json"), ($results | ConvertTo-Json -Depth 6)) }

# Runs one area. It passes unless it throws; it returns "skip: why" to count as skipped.
function Area([string]$area, [scriptblock]$body) {
  Write-Host "::group::$area"
  $t0 = Get-Date
  try {
    $r = & $body
    $note = ($r | Where-Object { $_ -is [string] } | Select-Object -Last 1)
    $state = if ("$note" -like 'skip:*') { 'skip' } else { 'pass' }
    $results.areas[$area] = [ordered]@{ result = $state; note = "$note" -replace '^skip: ', ''; seconds = [int]((Get-Date) - $t0).TotalSeconds }
  } catch {
    $msg = $_.Exception.Message
    Write-Host "::error title=$Name $area::$msg"
    Show-Log
    $results.areas[$area] = [ordered]@{ result = 'fail'; note = $msg; seconds = [int]((Get-Date) - $t0).TotalSeconds }
  } finally {
    Stop-App
    Save
    Write-Host "$area -> $($results.areas[$area].result) $($results.areas[$area].note)"
    Write-Host '::endgroup::'
  }
}

function Show-Log { $log = Join-Path $data 'logs\manager.log'; if (Test-Path $log) { Get-Content $log -Tail 30 | Write-Host } }

function Install-App([string]$file = $Setup) {
  Stop-App
  $p = Start-Process $file -ArgumentList '--quiet' -PassThru -Wait
  if ($p.ExitCode -ne 0) { throw "the installer failed with exit code $($p.ExitCode)" }
  if (-not (Test-Path $exe)) { throw 'the app was not installed' }
}

function Uninstall-App {
  Stop-App
  if (Test-Path $exe) {
    $p = Start-Process $Setup -ArgumentList '--uninstall', '--quiet' -PassThru -Wait
    if ($p.ExitCode -ne 0) { throw "uninstalling failed with exit code $($p.ExitCode)" }
    Start-Sleep 6
  }
}

# Settings the app reads when it starts: the tools the installer brought, plus the given values.
function Set-Settings([hashtable]$values) {
  Stop-App
  $s = if (Test-Path $settingsFile) { Get-Content $settingsFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { [pscustomobject]@{} }
  foreach ($k in $values.Keys) { $s | Add-Member -NotePropertyName $k -NotePropertyValue $values[$k] -Force }
  [IO.File]::WriteAllText($settingsFile, ($s | ConvertTo-Json -Depth 6), (New-Object Text.UTF8Encoding $false))
}

function Start-App([string[]]$Arguments = @('--background')) {
  Stop-App
  $script:app = if ($Arguments.Count) { Start-Process $exe -ArgumentList $Arguments -PassThru } else { Start-Process $exe -PassThru }
  $script:port = 17724
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 500
    try {
      $s = Get-Content $settingsFile -Raw -Encoding UTF8 -ErrorAction Stop | ConvertFrom-Json
      if ($s.port) { $script:port = [int]$s.port }
      $h = Invoke-RestMethod "http://127.0.0.1:$script:port/v1/hello" -TimeoutSec 2
      if ($h.app -eq 'ytdm') { break }
    } catch { }
  }
  if (-not $h -or $h.app -ne 'ytdm') { throw 'the app did not start or does not answer' }
  $pair = Invoke-RestMethod -Method Post "http://127.0.0.1:$script:port/v1/pair" -ContentType 'application/json' `
    -Body '{"client":"compatibility test","auto":true}' -Headers @{ Origin = $origin } -TimeoutSec 10
  $script:token = $pair.token
  $h
}

function Stop-App {
  Get-Process YTDownloadManager -ErrorAction SilentlyContinue | Where-Object { $_.SessionId -eq (Get-Process -Id $PID).SessionId } | Stop-Process -Force
  Get-Process yt-dlp, ffmpeg, ffprobe, deno, node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$data*" } | Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 500
}

function Api([string]$Method, [string]$Path, $Body, [int]$Timeout = 60) {
  $p = @{ Method = $Method; Uri = "http://127.0.0.1:$script:port$Path"; Headers = @{ 'X-YDM-Token' = $script:token; Origin = $origin }; TimeoutSec = $Timeout }
  if ($null -ne $Body) { $p.ContentType = 'application/json; charset=utf-8'; $p.Body = [Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Compress -Depth 6)) }
  Invoke-RestMethod @p
}

function Job([string]$id) { (Api GET '/v1/jobs').jobs | Where-Object { $_.id -eq $id } }

function Wait-Job2([string]$id, [string[]]$states = @('completed', 'failed', 'canceled'), [int]$sec = 900) {
  $t0 = Get-Date
  while (((Get-Date) - $t0).TotalSeconds -lt $sec) {
    $j = Job $id
    if ($states -contains $j.status) { return $j }
    Start-Sleep -Milliseconds 700
  }
  $j = Job $id
  throw "job $id is still '$($j.status)' after $sec s ($($j.detail) $($j.notice))"
}

# A screenshot of the app's window (drawn by the window itself, so other windows don't matter), and how many
# different colors it has: a blank or black window has one or two.
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices;
public static class CompatShot {
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] static extern bool PrintWindow(IntPtr h, IntPtr dc, uint flags);
  [StructLayout(LayoutKind.Sequential)] struct RECT { public int L, T, R, B; }
  public static int Save(IntPtr h, string file) {
    RECT r; GetWindowRect(h, out r);
    using (var b = new Bitmap(Math.Max(1, r.R - r.L), Math.Max(1, r.B - r.T))) {
      using (var g = Graphics.FromImage(b)) { var dc = g.GetHdc(); PrintWindow(h, dc, 2); g.ReleaseHdc(dc); }
      b.Save(file, ImageFormat.Png);
      var seen = new System.Collections.Generic.HashSet<int>();
      for (int y = 0; y < b.Height; y += 3) for (int x = 0; x < b.Width; x += 3) seen.Add(b.GetPixel(x, y).ToArgb());
      return seen.Count;
    }
  }
}
'@

Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices; using System.Security.Principal;
public static class CompatLsa {
  [StructLayout(LayoutKind.Sequential)] struct LSA_STRING { public ushort Length, MaximumLength; public IntPtr Buffer; }
  [StructLayout(LayoutKind.Sequential)] struct LSA_ATTR { public int Length; public IntPtr Root, Name; public uint Attributes; public IntPtr Sd, Qos; }
  [DllImport("advapi32.dll")] static extern uint LsaOpenPolicy(IntPtr system, ref LSA_ATTR attr, uint access, out IntPtr handle);
  [DllImport("advapi32.dll")] static extern uint LsaAddAccountRights(IntPtr handle, byte[] sid, LSA_STRING[] rights, uint count);
  [DllImport("advapi32.dll")] static extern uint LsaClose(IntPtr handle);
  [DllImport("advapi32.dll")] static extern int LsaNtStatusToWinError(uint status);
  public static int Grant(string account, string right) {
    var sid = (SecurityIdentifier)new NTAccount(account).Translate(typeof(SecurityIdentifier));
    var b = new byte[sid.BinaryLength]; sid.GetBinaryForm(b, 0);
    var attr = new LSA_ATTR(); IntPtr h;
    uint r = LsaOpenPolicy(IntPtr.Zero, ref attr, 0x000F0FFF, out h);
    if (r != 0) return LsaNtStatusToWinError(r);
    var u = new LSA_STRING { Buffer = Marshal.StringToHGlobalUni(right), Length = (ushort)(right.Length * 2), MaximumLength = (ushort)(right.Length * 2 + 2) };
    r = LsaAddAccountRights(h, b, new[] { u }, 1);
    LsaClose(h);
    return r == 0 ? 0 : LsaNtStatusToWinError(r);
  }
}
'@

function Shoot-Window([string]$file) {
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 500
    $p = Get-Process -Id $script:app.Id
    $p.Refresh()
    if ($p.MainWindowHandle -ne [IntPtr]::Zero) { break }
  }
  if ($p.MainWindowHandle -eq [IntPtr]::Zero) { throw 'the window did not open' }
  Start-Sleep 1
  [CompatShot]::Save($p.MainWindowHandle, (Join-Path $Out "screens\$file"))
}

# ---------- upgrade over the last release ----------
Area 'upgrade' {
  if ($Previous) { $prevSetup = (Resolve-Path $Previous).Path; $prev = (Get-Item $prevSetup).VersionInfo.FileVersion }
  else {
    $tags = @(gh release list --repo NyxiYT/yt-download-manager --exclude-drafts --exclude-pre-releases --limit 10 --json tagName -q '.[].tagName')
    $prev = $tags | Where-Object { $_ -ne "v$version" } | Select-Object -First 1
    if (-not $prev) { throw 'no earlier release found' }
    $dir = Join-Path $work 'prev'
    New-Item -ItemType Directory -Force $dir | Out-Null
    gh release download $prev --repo NyxiYT/yt-download-manager --pattern "YTDownloadManager-Setup-$Arch.exe" --dir $dir --clobber
    if ($LASTEXITCODE) { throw "could not download $prev" }
    $prevSetup = Join-Path $dir "YTDownloadManager-Setup-$Arch.exe"
  }
  Uninstall-App
  Install-App $prevSetup
  $keep = Join-Path $work 'kept folder'
  New-Item -ItemType Directory -Force $keep | Out-Null
  Set-Settings @{ folder = $keep; lang = 'de' }
  $h = Start-App
  $png = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $repo 'extension\assets\icons\icon128.png')))
  $j = Api POST '/v1/files' @{ name = 'kept.png'; data = $png; title = 'Kept across the upgrade'; vid = 'dQw4w9WgXcQ' }
  $id = if ($j.job) { $j.job.id } else { $j.id }
  $null = Wait-Job2 $id
  # As on a user's PC, the new installer runs while the app does; it closes the app, which saves its queue.
  $p = Start-Process $Setup -ArgumentList '--quiet' -PassThru -Wait
  if ($p.ExitCode -ne 0) { throw "the upgrade failed with exit code $($p.ExitCode)" }
  $h2 = Start-App
  if ($h2.version -ne $version) { throw "after the upgrade the app reports $($h2.version), expected $version" }
  $s = Get-Content $settingsFile -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($s.folder -ne $keep -or $s.lang -ne 'de') { throw "settings were not kept (folder '$($s.folder)', language '$($s.lang)')" }
  if (-not ((Api GET '/v1/jobs').jobs | Where-Object { $_.title -eq 'Kept across the upgrade' -and $_.status -eq 'completed' })) { throw 'the download history was not kept' }
  "$prev ($($h.version)) to $version, settings and history kept"
}

# ---------- install, tools, start, uninstall ----------
Area 'install-uninstall' {
  Set-Settings @{ folder = $null; lang = $null }
  & (Join-Path $repo '.github\smoke-test.ps1') -Setup $Setup -Arch $Arch | Write-Host
  'installs, every tool runs, starts, uninstalls cleanly'
}

# ---------- a standard user, profile folder with a space and non-ASCII letters ----------
Area 'standard-user' {
  $user = "J$([char]0xFC)rgen M$([char]0xFC)ller"
  $pw = 'Cp9!' + [guid]::NewGuid().ToString('N').Substring(0, 16)
  if (Get-LocalUser -Name $user -ErrorAction SilentlyContinue) { Remove-LocalUser -Name $user }
  $null = New-LocalUser -Name $user -Password (ConvertTo-SecureString $pw -AsPlainText -Force) -PasswordNeverExpires -AccountNeverExpires
  $granted = [CompatLsa]::Grant($user, 'SeBatchLogonRight')
  if ($granted -ne 0) { throw "could not let $user run a scheduled task (0x$('{0:x}' -f $granted))" }
  $shared = Join-Path $work 'user'
  New-Item -ItemType Directory -Force $shared | Out-Null
  $acl = Get-Acl $shared
  $acl.AddAccessRule((New-Object Security.AccessControl.FileSystemAccessRule($user, 'Modify', 'ContainerInherit,ObjectInherit', 'None', 'Allow')))
  Set-Acl $shared $acl
  Copy-Item $Setup (Join-Path $shared 'setup.exe') -Force
  $script = @'
$ErrorActionPreference = 'Stop'
$r = [ordered]@{}
try {
  $id = [Security.Principal.WindowsIdentity]::GetCurrent()
  $r.user = $id.Name
  $r.admin = (New-Object Security.Principal.WindowsPrincipal $id).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  $r.profile = $env:USERPROFILE
  $p = Start-Process "$PSScriptRoot\setup.exe" -ArgumentList '--quiet' -PassThru -Wait
  $r.install = $p.ExitCode
  $exe = Join-Path $env:LOCALAPPDATA 'Programs\YT Download Manager\YTDownloadManager.exe'
  $r.installed = Test-Path $exe
  $app = Start-Process $exe -ArgumentList '--background' -PassThru
  $s = Join-Path $env:LOCALAPPDATA 'YT Download Manager\settings.json'
  for ($i = 0; $i -lt 40 -and -not $r.hello; $i++) {
    Start-Sleep -Milliseconds 500
    try { $port = (Get-Content $s -Raw | ConvertFrom-Json).port; if (-not $port) { $port = 17724 }; $r.hello = (Invoke-RestMethod "http://127.0.0.1:$port/v1/hello" -TimeoutSec 2).version } catch { }
  }
  $r.tools = @(Get-ChildItem (Join-Path $env:LOCALAPPDATA 'YT Download Manager\bin') -Filter *.exe | ForEach-Object Name)
  Stop-Process -Id $app.Id -Force
  Start-Sleep 1
  $u = Start-Process "$PSScriptRoot\setup.exe" -ArgumentList '--uninstall', '--quiet' -PassThru -Wait
  $r.uninstall = $u.ExitCode
  Start-Sleep 6
  $r.leftover = (Test-Path $exe) -or (Test-Path (Join-Path $env:LOCALAPPDATA 'YT Download Manager'))
} catch { $r.error = $_.Exception.Message }
[IO.File]::WriteAllText("$PSScriptRoot\result.json", ($r | ConvertTo-Json))
'@
  [IO.File]::WriteAllText((Join-Path $shared 'run.ps1'), $script, (New-Object Text.UTF8Encoding $true))
  Remove-Item (Join-Path $shared 'result.json') -ErrorAction SilentlyContinue
  $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$shared\run.ps1`""
  Unregister-ScheduledTask -TaskName 'compat-user' -Confirm:$false -ErrorAction SilentlyContinue
  $null = Register-ScheduledTask -TaskName 'compat-user' -Action $action -User $user -Password $pw -RunLevel Limited
  Start-ScheduledTask -TaskName 'compat-user'
  $t0 = Get-Date
  while (-not (Test-Path (Join-Path $shared 'result.json')) -and ((Get-Date) - $t0).TotalSeconds -lt 300) { Start-Sleep 2 }
  $task = Get-ScheduledTaskInfo -TaskName 'compat-user' -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName 'compat-user' -Confirm:$false -ErrorAction SilentlyContinue
  if (-not (Test-Path (Join-Path $shared 'result.json'))) { throw "the run as $user did not finish (task result 0x$('{0:x}' -f [int64]$task.LastTaskResult))" }
  $r = Get-Content (Join-Path $shared 'result.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  Write-Host ($r | ConvertTo-Json)
  if ($r.error) { throw "as $user`: $($r.error)" }
  if ($r.admin) { throw 'the test user is an administrator' }
  if ($r.profile -notlike "*$user") { throw "unexpected profile folder $($r.profile)" }
  if ($r.install -ne 0 -or -not $r.installed) { throw "install as a standard user failed ($($r.install))" }
  if ($r.hello -ne $version) { throw "the app did not answer for the standard user ($($r.hello))" }
  if ($r.uninstall -ne 0 -or $r.leftover) { throw "uninstall as a standard user failed or left files ($($r.uninstall))" }
  "installed, ran and uninstalled without admin rights in $($r.profile)"
}

# ---------- file names and long paths ----------
Area 'names-paths' {
  Install-App
  # A folder of about 205 characters with spaces and non-ASCII letters, where a long title would make the
  # path longer than Windows' limit of 259 characters. That limit is on by default, as on a home PC.
  Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name LongPathsEnabled -Value 0 -Type DWord
  $deep = Join-Path $work ("Ordner mit Leerzeichen $([char]0xC4)$([char]0xD6)$([char]0xDC) " + (@(1..8 | ForEach-Object { "Unterordner Nummer $_" }) -join '\'))
  $null = [IO.Directory]::CreateDirectory("\\?\$deep")
  Set-Settings @{ folder = $deep; lang = $null }
  $null = Start-App
  $png = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $repo 'extension\assets\icons\icon128.png')))
  $emoji = [char]::ConvertFromUtf32(0x1F3AC)
  $long = ('Ein sehr langer Titel ' * 8) + $emoji + ' Ende'
  $cases = [ordered]@{
    'a<b>c:d"e/f\g|h?i*j' = 'a_b_c_d_e_f_g_h_i_j'
    "$emoji Emoji Titel $([char]::ConvertFromUtf32(0x1F600))" = "$emoji Emoji Titel $([char]::ConvertFromUtf32(0x1F600))"
    'CON' = '_CON'
    'nul' = '_nul'
    'COM1' = '_COM1'
    'Trailing dots... ' = 'Trailing dots'
    $long = $null # cut to fit the path, never inside an emoji
  }
  $made = @()
  foreach ($title in $cases.Keys) {
    $j = Api POST '/v1/jobs' @{ vid = 'jNQXAC9IVRw'; title = $title; author = ''; kind = 'thumb'; key = 'thumb'; format = 'JPG'; quality = 'HD'; opts = @{ thumb = 'hqdefault' }; force = $true }
    $done = Wait-Job2 $j.job.id @('completed', 'failed') 90
    if ($done.status -ne 'completed') { throw "saving '$title' failed: $($done.err.key)" }
    $file = $done.file
    $base = [IO.Path]::GetFileNameWithoutExtension($file)
    $want = $cases[$title]
    if ($null -ne $want -and $base -ne $want) { throw "'$title' was saved as '$base', expected '$want'" }
    if ($null -eq $want) {
      if ($base.Length -ge 150) { throw "a long title wasn't cut to fit the path ($($base.Length) characters)" }
      if ([char]::IsHighSurrogate($base[$base.Length - 1])) { throw 'a long title was cut inside an emoji' }
    }
    if (-not [IO.File]::Exists("\\?\$file")) { throw "$file is missing" }
    $made += $file
  }
  $longest = ($made | Measure-Object Length -Maximum).Maximum
  if ($longest -gt 259) { throw "a saved file's path is $longest characters, longer than Windows takes as it is" }
  # A folder so deep (about 230 characters) that not even a short name fits: the file is still saved.
  $deeper = $deep + '\' + ((@(1..2 | ForEach-Object { "Noch tiefer $_" })) -join '\')
  $null = [IO.Directory]::CreateDirectory("\\?\$deeper")
  Set-Settings @{ folder = $deeper }
  $null = Start-App
  $j = Api POST '/v1/jobs' @{ vid = 'jNQXAC9IVRw'; title = $long; author = ''; kind = 'thumb'; key = 'thumb'; format = 'JPG'; quality = 'HD'; opts = @{ thumb = 'hqdefault' }; force = $true }
  $done = Wait-Job2 $j.job.id @('completed', 'failed') 90
  if ($done.status -ne 'completed' -or -not [IO.File]::Exists("\\?\$($done.file)")) { throw "saving into a $($deeper.Length)-character folder failed: $($done.err.key)" }
  $deepest = $done.file.Length
  # A screenshot from the browser keeps the name the extension gave it.
  $j = Api POST '/v1/files' @{ name = 'Screenshot 0-07.png'; data = $png; title = 'Screenshot'; vid = 'jNQXAC9IVRw' }
  $done = Wait-Job2 $j.job.id @('completed', 'failed') 60
  if ($done.status -ne 'completed' -or [IO.Path]::GetFileName($done.file) -ne 'Screenshot 0-07.png') { throw "a screenshot was saved as '$($done.file)' ($($done.err.key))" }
  "7 titles and a screenshot saved with the expected names, paths up to $longest characters; a $deepest-character path in a deeper folder"
}

# ---------- locales: formats, right-to-left, other calendars ----------
Area 'locales' {
  $before = (Get-Culture).Name
  $notes = @()
  try {
    foreach ($c in 'de-DE', 'ar-SA', 'he-IL', 'th-TH', 'fa-IR') {
      Set-Culture $c
      # Set-Culture applies to new processes; the installer and the app run as new processes.
      Install-App
      $d = (Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\YTDownloadManager').InstallDate
      $today = (Get-Date).ToString('yyyyMMdd', [Globalization.CultureInfo]::InvariantCulture)
      if ([math]::Abs([int64]$d - [int64]$today) -gt 1) { throw "$c`: the install date in Windows' app list is '$d', expected $today" }
      $null = Start-App
      $null = Api GET '/v1/status'
      $png = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $repo 'extension\assets\icons\icon128.png')))
      $j = Api POST '/v1/files' @{ name = 'shot.png'; data = $png; title = "Locale $c"; vid = 'dQw4w9WgXcQ' }
      $id = if ($j.job) { $j.job.id } else { $j.id }
      $done = Wait-Job2 $id @('completed', 'failed') 60
      if ($done.status -ne 'completed') { throw "$c`: saving failed: $($done.err.key)" }
      $log = Get-Content (Join-Path $data 'logs\manager.log') -Tail 3
      if ($log -match '^\d{4}' -and $log -notmatch '^20\d\d-') { throw "$c`: log times are not in the usual calendar: $($log[-1])" }
      $notes += $c
    }
  } finally { Set-Culture $before }
  "installs, runs and saves under $($notes -join ', ')"
}

# ---------- the window: every language, light and dark ----------
Area 'window' {
  Install-App
  $theme = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize'
  $was = (Get-ItemProperty $theme -Name AppsUseLightTheme -ErrorAction SilentlyContinue).AppsUseLightTheme
  $shots = @()
  try {
    foreach ($mode in 'light', 'dark') {
      New-Item -Force $theme -ErrorAction SilentlyContinue | Out-Null
      Set-ItemProperty $theme -Name AppsUseLightTheme -Value ([int]($mode -eq 'light')) -Type DWord
      foreach ($lang in 'en', 'de', 'es', 'fr', 'it', 'pt', 'pl', 'ru', 'ja', 'zh') {
        if ($mode -eq 'dark' -and $lang -ne 'en' -and $lang -ne 'de') { continue }
        Set-Settings @{ lang = $lang }
        $null = Start-App @()
        $colors = Shoot-Window "$mode-$lang.png"
        if ($colors -lt 8) { throw "the $mode window in '$lang' looks empty ($colors colors)" }
        $shots += "$mode-$lang"
      }
    }
  } finally { if ($null -ne $was) { Set-ItemProperty $theme -Name AppsUseLightTheme -Value $was -Type DWord } }
  "$($shots.Count) screenshots: $($shots -join ', ')"
}

# ---------- downloads ----------
function Probe([string]$file) {
  $probe = Join-Path $data 'bin\ffprobe.exe'
  $j = & $probe -v error -show_entries stream=codec_type,codec_name,width,height -of json $file 2>$null | ConvertFrom-Json
  $v = $j.streams | Where-Object { $_.codec_type -eq 'video' } | Select-Object -First 1
  $a = $j.streams | Where-Object { $_.codec_type -eq 'audio' } | Select-Object -First 1
  [pscustomobject]@{ height = [int]$v.height; video = $v.codec_name; audio = $a.codec_name }
}

function Start-Video([string]$vid, [int]$height, [string]$title) {
  $r = Api POST '/v1/jobs' @{ vid = $vid; title = $title; author = ''; kind = 'video'; key = "v$height"; format = 'MP4'; quality = "${height}p"; opts = @{ height = $height }; force = $true }
  $r.job.id
}

# YouTube refuses some build servers ("confirm you're not a bot"). That is YouTube's decision about the
# machine, not a fault of the app; anything else is.
function Refused($job) { $job.status -eq 'failed' -and @('errBlocked', 'errSignIn') -contains $job.err.key }

Area 'downloads' {
  Install-App
  $dl = Join-Path $work 'downloads'
  New-Item -ItemType Directory -Force $dl | Out-Null
  Set-Settings @{ folder = $dl; lang = $null }
  $null = Start-App
  try { $info = Api GET '/v1/info?v=dQw4w9WgXcQ' $null 240 }
  catch {
    $body = $_.ErrorDetails.Message
    if ($body -match 'errBlocked|errSignIn') { $script:youtube = $false; return 'skip: YouTube refuses this build server' }
    throw
  }
  $max = ($info.video | ForEach-Object { [int]$_.height } | Measure-Object -Maximum).Maximum
  $notes = @()
  $j = Wait-Job2 (Start-Video 'dQw4w9WgXcQ' $max 'Highest quality')
  if (Refused $j) { $script:youtube = $false; return 'skip: YouTube refuses this build server' }
  if ($j.status -ne 'completed') { throw "the highest quality failed: $($j.err.key)" }
  $p = Probe $j.file
  if ($p.height -lt [math]::Min($max, 1080) -or -not $p.audio) { throw "the highest quality file is $($p.height)p $($p.video)/$($p.audio)" }
  $notes += "max $($p.height)p $($p.video)+$($p.audio)"
  $script:youtube = $true

  $ids = @((Start-Video 'jNQXAC9IVRw' 240 'Parallel one'), (Start-Video 'R6DiFlAXrS0' 720 'Parallel two'), (Start-Video 'aqz-KE-bpKQ' 360 'Parallel three'))
  $refusedNow = 0
  foreach ($id in $ids) {
    $j = Wait-Job2 $id
    if (Refused $j) { $refusedNow++ } elseif ($j.status -ne 'completed') { throw "a parallel download failed: $($j.err.key)" }
  }
  if ($refusedNow -eq $ids.Count) { return "skip: YouTube refused this machine after the first download ($($notes -join ', '))" }
  $notes += "3 parallel ($refusedNow refused by YouTube)"

  $id = Start-Video 'aqz-KE-bpKQ' 1080 'Pause and resume'
  $null = Wait-Job2 $id @('downloading', 'failed') 180
  if (Refused (Job $id)) { return "skip: YouTube refused this machine part way ($($notes -join ', '))" }
  Start-Sleep 2
  $null = Api POST "/v1/jobs/$id/pause"
  $p = Wait-Job2 $id @('paused') 30
  $at = $p.got; Start-Sleep 4
  if ((Job $id).got -ne $at) { throw 'a paused download kept going' }
  $null = Api POST "/v1/jobs/$id/resume"
  $j = Wait-Job2 $id
  if ($j.status -ne 'completed') { throw "the resumed download failed: $($j.err.key)" }
  $notes += 'pause/resume'

  $id = Start-Video 'aqz-KE-bpKQ' 720 'Cancel and retry'
  $null = Wait-Job2 $id @('downloading', 'failed') 180
  if (Refused (Job $id)) { return "skip: YouTube refused this machine part way ($($notes -join ', '))" }
  $null = Api POST "/v1/jobs/$id/cancel"
  $null = Wait-Job2 $id @('canceled') 30
  if (Get-ChildItem $dl -File -Filter 'Cancel and retry*') { throw 'a canceled download left files' }
  $null = Api POST "/v1/jobs/$id/retry"
  $j = Wait-Job2 $id
  if ($j.status -ne 'completed') { throw "the retried download failed: $($j.err.key)" }
  $notes += 'cancel/retry'
  $notes -join ', '
}

# ---------- the connection drops in the middle of a download ----------
Area 'offline' {
  if ($script:youtube -ne $true) { return 'skip: needs downloads, which YouTube refuses here' } # set by the first download
  Install-App
  $dl = Join-Path $work 'offline'
  New-Item -ItemType Directory -Force $dl | Out-Null
  Set-Settings @{ folder = $dl }
  $null = Start-App
  $id = Start-Video 'aqz-KE-bpKQ' 1080 'Connection drops'
  $null = Wait-Job2 $id @('downloading', 'failed') 180
  if (Refused (Job $id)) { return 'skip: YouTube refused this download' }
  $progs = @($exe) + @(Get-ChildItem (Join-Path $data 'bin') -Filter *.exe | ForEach-Object FullName)
  try {
    foreach ($p in $progs) { $null = New-NetFirewallRule -DisplayName 'compat-offline' -Direction Outbound -Program $p -Action Block }
    Start-Sleep 25
    $mid = Job $id
    if (Refused $mid) { return 'skip: YouTube refused this download' }
    if ($mid.status -eq 'failed') { throw "the download failed while offline: $($mid.err.key)" }
  } finally { Remove-NetFirewallRule -DisplayName 'compat-offline' -ErrorAction SilentlyContinue }
  $j = Wait-Job2 $id
  if (Refused $j) { return 'skip: YouTube refused this download after the connection came back' }
  if ($j.status -ne 'completed') { throw "the download did not finish after the connection came back: $($j.err.key)" }
  "kept waiting while offline ($($mid.status), $($mid.notice)), finished afterwards"
}

# ---------- Defender ----------
Area 'defender' {
  $m = Get-MpComputerStatus -ErrorAction SilentlyContinue
  if (-not $m -or -not $m.AntivirusEnabled) { return 'skip: Defender is off on this machine' }
  Install-App
  $since = Get-Date
  Start-MpScan -ScanType CustomScan -ScanPath (Split-Path -Parent $exe)
  Start-MpScan -ScanType CustomScan -ScanPath (Join-Path $data 'bin')
  Start-MpScan -ScanType CustomScan -ScanPath $Setup
  $hits = @(Get-MpThreatDetection -ErrorAction SilentlyContinue | Where-Object { $_.InitialDetectionTime -ge $since })
  if ($hits.Count) { throw "Defender reports: $(($hits | ForEach-Object { $_.Resources }) -join '; ')" }
  "no detections (signatures $($m.AntivirusSignatureVersion))"
}

Uninstall-App
Save
$failed = @($results.areas.Keys | Where-Object { $results.areas[$_].result -eq 'fail' })
if ($failed.Count) { throw "failed: $($failed -join ', ')" }
'all areas passed or were skipped'
