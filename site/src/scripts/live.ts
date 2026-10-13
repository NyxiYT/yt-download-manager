// The version, its date and the star count. The page shows what the build read from the GitHub API, and the site
// is rebuilt after every release and once a day, so it is current. Only if this copy is older than a day (the daily
// build failed) does the browser ask GitHub itself, once the browser is idle: asking on every visit would run into
// GitHub's limit of 60 requests an hour per address. Failures (offline, that limit) leave the built values.
import { STAR_THRESHOLD, formatDate } from '../lib/format';

const API = 'https://api.github.com/repos/NyxiYT/yt-download-manager';

async function refresh() {
  try {
    const [rel, repo] = await Promise.all(
      [`${API}/releases/latest`, API].map((u) => fetch(u, { headers: { Accept: 'application/vnd.github+json' } }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))),
    );
    const version = String(rel.tag_name ?? '').replace(/^v/, '');
    const date = String(rel.published_at ?? '').slice(0, 10);
    if (/^\d+\.\d+\.\d+$/.test(version)) document.querySelectorAll('[data-release-version]').forEach((e) => (e.textContent = version));
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) document.querySelectorAll('[data-release-date]').forEach((e) => (e.textContent = formatDate(date)));
    const stars = Number(repo.stargazers_count);
    document.querySelectorAll<HTMLElement>('[data-star-count]').forEach((e) => {
      e.hidden = !(stars >= STAR_THRESHOLD);
      if (stars >= STAR_THRESHOLD) e.textContent = new Intl.NumberFormat('en-US').format(stars);
    });
  } catch {
    // keep what the page was built with
  }
}

const built = Date.parse(document.documentElement.dataset.built ?? '');
if (!(Date.now() - built < 24 * 3600e3)) {
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (idle) idle(refresh);
  else setTimeout(refresh, 1500);
}
