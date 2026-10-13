"""Writes manager/components.lock.json: the exact builds of the tools the installers carry and the app fetches
when one is missing, each with its download link and SHA-256.

- yt-dlp: its latest release (yt-dlp.exe, yt-dlp_x86.exe). Installed copies still update themselves.
- FFmpeg, 64-bit: BtbN/FFmpeg-Builds, the newest release branch (n9.0 and so on), static (for the app) and
  shared (for the installers).
- FFmpeg, 32-bit: yt-dlp/FFmpeg-Builds. Nobody builds a release branch for 32-bit Windows, so this is
  FFmpeg's master branch, but a fixed build of it.
  Both from the last dated build of the previous month, the one these projects keep (see autobuild).
- Deno (64-bit) and Node.js 22 (32-bit Windows, which Deno doesn't support): their latest releases.

Every SHA-256 comes from GitHub's digest of the release asset (Node.js: its SHASUMS256.txt) and is checked
against the checksum list the project publishes itself. Nothing is downloaded but those lists.
Run: python .github/components-lock.py   (GITHUB_TOKEN, when set, is used for GitHub's API)
"""
import datetime
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCK = os.path.join(ROOT, 'manager', 'components.lock.json')


def get(url, api=False):
    headers = {'User-Agent': 'yt-download-manager components-lock'}
    if api:
        headers['Accept'] = 'application/vnd.github+json'
        if os.environ.get('GITHUB_TOKEN'):
            headers['Authorization'] = 'Bearer ' + os.environ['GITHUB_TOKEN']
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=120) as r:
        data = r.read()
    return json.loads(data) if api else data.decode('utf-8', 'replace')


def listed(sums_text, name):
    """The SHA-256 a checksum list gives for `name` ("hash  name" lines, or a single hash)."""
    loose = []
    for line in sums_text.splitlines():
        m = re.search(r'\b([0-9a-fA-F]{64})\b', line)
        if not m:
            continue
        if re.search(r'(^|[\s*/])' + re.escape(name) + r'\s*$', line):
            return m.group(1).lower()
        loose.append(m.group(1).lower())
    return loose[0] if len(loose) == 1 else None


def asset(release, name, sums_text):
    a = next((x for x in release['assets'] if x['name'] == name), None)
    if a is None:
        sys.exit(f'{name} is missing in {release["html_url"]}')
    digest = (a.get('digest') or '').removeprefix('sha256:').lower()
    published = listed(sums_text, name)
    if not re.fullmatch(r'[0-9a-f]{64}', digest or '') or digest != published:
        sys.exit(f'{name}: GitHub says {digest or "nothing"}, the published list says {published or "nothing"}')
    return {'url': a['browser_download_url'], 'sha256': digest}


def sums_of(release, name):
    a = next((x for x in release['assets'] if x['name'] == name), None)
    if a is None:
        sys.exit(f'no {name} in {release["html_url"]}')
    return get(a['browser_download_url'])


def autobuild(repo):
    """The last dated build of the previous month. The "latest" release is rebuilt in place (its files change),
    and the daily builds are deleted after about two weeks; the last one of each month stays for about two
    years, so installers and apps that point at it keep working."""
    month = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m')
    for r in get(f'https://api.github.com/repos/{repo}/releases?per_page=100', api=True):
        m = re.match(r'autobuild-(\d{4}-\d{2})-\d{2}-', r['tag_name'])
        if m and m.group(1) < month and not r['draft']:
            return r
    sys.exit(f'no autobuild release of an earlier month in {repo}')


def main():
    tools = {}

    r = get('https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest', api=True)
    sums = sums_of(r, 'SHA2-256SUMS')
    tools['yt-dlp'] = {arch: {'version': r['tag_name'], **asset(r, name, sums)}
                       for arch, name in (('x64', 'yt-dlp.exe'), ('x86', 'yt-dlp_x86.exe'))}

    r = autobuild('BtbN/FFmpeg-Builds')
    sums = sums_of(r, 'checksums.sha256')
    pat = re.compile(r'^ffmpeg-(n(\d+)\.(\d+)[^-]*-\d+-g[0-9a-f]+)-win64-gpl-\d+\.\d+\.zip$')
    found = [(int(m.group(2)), int(m.group(3)), m.group(1), x['name']) for x in r['assets'] if (m := pat.match(x['name']))]
    if not found:
        sys.exit('no 64-bit release-branch build in ' + r['html_url'])
    *_, version, static = max(found)
    shared = static.replace('-win64-gpl-', '-win64-gpl-shared-')
    ffmpeg = {'x64': {'version': version, 'source': r['html_url'], **asset(r, static, sums)},
              'x64-shared': {'version': version, 'source': r['html_url'], **asset(r, shared, sums)}}

    r = autobuild('yt-dlp/FFmpeg-Builds')
    sums = sums_of(r, 'checksums.sha256')
    pat = re.compile(r'^ffmpeg-(N-\d+-g[0-9a-f]+)-win32-gpl\.zip$')
    m = next((m for x in r['assets'] if (m := pat.match(x['name']))), None)
    if not m:
        sys.exit('no 32-bit build in ' + r['html_url'])
    ffmpeg['x86'] = {'version': m.group(1), 'source': r['html_url'], **asset(r, m.group(0), sums)}
    ffmpeg['x86-shared'] = {'version': m.group(1), 'source': r['html_url'],
                            **asset(r, m.group(0).replace('-win32-gpl.zip', '-win32-gpl-shared.zip'), sums)}
    tools['ffmpeg'] = ffmpeg

    r = get('https://api.github.com/repos/denoland/deno/releases/latest', api=True)
    name = 'deno-x86_64-pc-windows-msvc.zip'
    tools['deno'] = {'x64': {'version': r['tag_name'].lstrip('v'), **asset(r, name, sums_of(r, name + '.sha256sum'))}}

    index = json.loads(get('https://nodejs.org/dist/index.json'))
    v = next(e['version'] for e in index if e['version'].startswith('v22.') and 'win-x86-zip' in e['files'])
    name = f'node-{v}-win-x86.zip'
    sha = listed(get(f'https://nodejs.org/dist/{v}/SHASUMS256.txt'), name)
    if not sha:
        sys.exit('no checksum for ' + name)
    tools['node'] = {'x86': {'version': v.lstrip('v'), 'url': f'https://nodejs.org/dist/{v}/{name}', 'sha256': sha}}

    lock = {'about': 'Exact builds of the tools: written by .github/components-lock.py, read by '
                     'manager/fetch-components.ps1 (installers) and the app (a missing tool). Updated weekly by a pull request.',
            'tools': tools}
    text = json.dumps(lock, indent=2, ensure_ascii=True) + '\n'
    old = open(LOCK, encoding='utf-8').read() if os.path.exists(LOCK) else ''
    if old == text:
        print('components.lock.json is up to date')
        return
    with open(LOCK, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    for tool, files in tools.items():
        for arch, x in files.items():
            print(f'{tool:7} {arch:11} {x["version"]}')


if __name__ == '__main__':
    main()
