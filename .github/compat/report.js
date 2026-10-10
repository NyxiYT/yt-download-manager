// Merges the result files of a compatibility run into one table (Markdown): a row per machine and browser,
// a column per area, each cell pass, FAIL or skip. Notes for failures and skips follow the table.
// usage: node report.js <results dir> [out.md]
const fs = require('fs');
const path = require('path');

const [, , dir, out = 'compat-report.md'] = process.argv;
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.json')) files.push(p);
  }
})(dir);

const runs = files.map((f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } })
  .filter((r) => r && r.areas).sort((a, b) => String(a.name).localeCompare(String(b.name)));
const apps = runs.filter((r) => r.arch);
const browsers = runs.filter((r) => !r.arch);

function table(list, title) {
  if (!list.length) return '';
  const areas = [...new Set(list.flatMap((r) => Object.keys(r.areas)))];
  const cell = (a) => (!a ? '' : a.result === 'pass' ? 'pass' : a.result === 'fail' ? '**FAIL**' : 'skip');
  let md = `### ${title}\n\n| Run | ${areas.join(' | ')} |\n|---|${areas.map(() => '---').join('|')}|\n`;
  for (const r of list) md += `| ${r.name}<br><sub>${r.os || r.version || ''} ${r.session || ''}</sub> | ${areas.map((a) => cell(r.areas[a])).join(' | ')} |\n`;
  const notes = list.flatMap((r) => Object.entries(r.areas).filter(([, a]) => a.result !== 'pass').map(([k, a]) => `- ${r.name}, ${k}: ${a.result}. ${a.note}`));
  const errors = list.filter((r) => r.error).map((r) => `- ${r.name}: ${r.error.split('\n')[0]}`);
  return md + (notes.length || errors.length ? `\n${[...errors, ...notes].join('\n')}\n` : '') + '\n';
}

const md = `## Compatibility\n\n${table(apps, 'Windows app')}${table(browsers, 'Browser extension')}`;
fs.writeFileSync(out, md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
console.log(md);
const failed = runs.some((r) => r.gate !== false && (r.error || Object.values(r.areas).some((a) => a.result === 'fail')));
process.exit(failed ? 1 : 0);
