// Content rubric audit (spec §3.5). Reports what a human or the agent loop still has to do
// before a page may be treated as "publishable". Usage: npm run audit [-- --strict]
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

const ROOT = 'src/content/pages';
const strict = process.argv.includes('--strict');
const reviewedLangs = { en: true, ja: false, de: false }; // keep in sync with src/lib/i18n.ts

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (p.endsWith('.mdx')) yield p;
  }
}

const pages = [];
for await (const f of walk(ROOT)) {
  const raw = await readFile(f, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) continue;
  const id = relative(ROOT, f).replace(/\.mdx$/, '');
  pages.push({ id, lang: id.split('/')[0], fm: parse(m[1]), body: m[2] });
}

const titles = new Map(), descs = new Map();
let problems = 0;
const rows = [];
for (const { id, lang, fm, body } of pages) {
  const gaps = [];
  const words = String(fm.answer).trim().split(/\s+/).length;
  if (words > 60) gaps.push(`answer is ${words} words (max 60)`);
  if (fm.kind === 'guide') {
    if (!fm.testedOn) gaps.push('testedOn: steps not yet verified on a named macOS version');
    const shots = (fm.steps ?? []).filter((s) => s.shot?.alt).length;
    if (shots < 2) gaps.push(`${shots}/2 screenshots with alt text`);
  }
  if (['best', 'alternative'].includes(fm.kind) && !fm.lastChecked) gaps.push('lastChecked: prices/features not yet verified');
  if (!/^##\s+(Limits|限界|Grenzen)/m.test(body) && fm.kind !== 'best' && fm.kind !== 'alternative') gaps.push('no "Limits and risks" section');
  const internal = (fm.related?.length ?? 0) + (fm.best ? 1 : 0) + 1; // +1: template always links /vault/
  if (internal < 3) gaps.push(`only ${internal} internal links (need 3+)`);
  if (!(fm.external?.length)) gaps.push('no external authoritative link (e.g. Apple Support)');
  if (!(fm.faq?.length >= 3 && fm.faq.length <= 5) && fm.faq?.length !== 0) gaps.push(`FAQ has ${fm.faq.length} items (3-5)`);
  if (!reviewedLangs[lang] && fm.reviewed !== true) gaps.push('native-speaker review pending (page is noindex)');
  for (const [map, key, label] of [[titles, fm.title, 'title'], [descs, fm.description, 'description']]) {
    if (map.has(key)) gaps.push(`duplicate ${label} with ${map.get(key)}`);
    map.set(key, id);
  }
  problems += gaps.length;
  rows.push({ id, gaps });
}

for (const r of rows) {
  console.log(`${r.gaps.length ? '✗' : '✓'} ${r.id}`);
  for (const g of r.gaps) console.log(`    - ${g}`);
}
console.log(`\n${pages.length} pages, ${rows.filter((r) => r.gaps.length).length} with open items (${problems} total).`);
if (strict && problems) process.exit(1);
