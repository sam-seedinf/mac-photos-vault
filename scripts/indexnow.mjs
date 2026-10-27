// Ping IndexNow (Bing, Yandex, etc.) with every URL in the built sitemaps.
// Usage: INDEXNOW_KEY=... node scripts/indexnow.mjs [--site https://securemacapp.com]
// The key file is served at /<key>.txt by src/pages/[key].txt.ts, so deploy before pinging.
import { readFile, readdir } from 'node:fs/promises';

const key = process.env.INDEXNOW_KEY;
if (!key) { console.log('INDEXNOW_KEY not set; skipping.'); process.exit(0); }
const site = (process.argv.includes('--site') ? process.argv[process.argv.indexOf('--site') + 1] : 'https://securemacapp.com').replace(/\/$/, '');
const host = new URL(site).host;

const urls = new Set();
for (const f of (await readdir('dist')).filter((n) => /^sitemap-(?!index).*\.xml$/.test(n))) {
  for (const m of (await readFile(`dist/${f}`, 'utf8')).matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1]);
}
if (!urls.size) { console.log('No URLs found in dist/. Run the build first.'); process.exit(1); }

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `${site}/${key}.txt`, urlList: [...urls] }),
});
console.log(`IndexNow: ${res.status} for ${urls.size} URLs`);
if (!res.ok && res.status !== 202) process.exit(1);
