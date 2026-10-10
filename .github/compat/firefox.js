// Firefox (not a supported browser yet): runs Mozilla's add-on linter on the extension and records what it
// reports, so the table shows where Firefox stands. It doesn't hold back a release.
// usage: node firefox.js <out.json>
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || 'firefox.json';
const ext = path.join(__dirname, '..', '..', 'extension');
const result = { name: 'Firefox and Firefox ESR', session: 'web-ext lint', gate: false, areas: {} };
let raw = '';
try {
  raw = execSync(`npx --yes web-ext@8 lint --source-dir "${ext}" --output json --no-config-discovery`,
    { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) {
  raw = e.stdout || ''; // the linter exits with an error when it finds errors; its report is still on stdout
}
let report;
try { report = JSON.parse(raw.slice(raw.indexOf('{'))); } catch { result.error = `no report from the linter: ${raw.slice(0, 300)}`; }
if (report) {
  const list = (k) => (report[k] || []).map((m) => `${m.code}${m.file ? ` (${m.file})` : ''}: ${m.message}`);
  const errors = list('errors'), warnings = list('warnings');
  result.areas['web-ext-lint'] = {
    result: errors.length ? 'fail' : 'pass',
    note: `${errors.length} errors, ${warnings.length} warnings. ${errors.slice(0, 6).join(' | ')}`,
  };
  result.lint = { errors, warnings, notices: list('notices') };
}
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, JSON.stringify(result, null, 1));
console.log(JSON.stringify(result.areas, null, 1));
