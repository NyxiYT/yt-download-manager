// The version and date on the page come from the build, and the site is rebuilt after every release and once a day.
// Only if this copy is more than a day old (the daily build failed) does the browser ask GitHub itself; asking on
// every visit would run into GitHub's limit of 60 requests an hour per address. Failures keep the built values.
import { formatDate, formatDateShort } from '../lib/format';

const built = Date.parse(document.documentElement.dataset.built ?? '');
if (!(Date.now() - built < 24 * 3600e3)) {
  fetch('https://api.github.com/repos/NyxiYT/yt-download-manager/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rel) => {
      const version = String(rel.tag_name ?? '').replace(/^v/, '');
      const date = String(rel.published_at ?? '').slice(0, 10);
      if (/^\d+\.\d+\.\d+$/.test(version)) document.querySelectorAll('[data-release-version]').forEach((e) => (e.textContent = version));
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        document.querySelectorAll('[data-release-date]').forEach((e) => (e.textContent = formatDate(date)));
        document.querySelectorAll('[data-release-date-short]').forEach((e) => (e.textContent = formatDateShort(date)));
      }
    })
    .catch(() => { /* keep what the page was built with */ });
}
