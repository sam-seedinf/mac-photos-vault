# Agent loop (every 3 days, on the Mac Mini)

Runbook for spec §4.8. Each run appends to `logs/agent-log.md`.

1. **Pull Search Console data** → `data/gsc/YYYY-MM-DD.json` (queries, pages, positions) using a read-only service account.
   No script is bundled yet; use the Search Console API (`searchanalytics.query`, dimensions `query,page`).
2. **Find opportunities:** queries at positions 8–30 with rising impressions; pages that aren't indexed.
3. **Write or refresh 3–5 pages** under `src/content/pages/`. Run `npm run audit`; a page is only "done" when the audit is clean
   *and* a human has verified the steps on macOS (set `testedOn`) and prices (set `lastChecked`). Open a pull request; Sumeet merges.
4. Republish one guide on Medium / Blogger / WordPress.com with a canonical link to the original.
5. Submit to one directory (spec §5) and email one listicle author.
6. After the production deploy, run `INDEXNOW_KEY=… npm run indexnow`, then append to `logs/agent-log.md`.
7. Monthly: ship one new free tool; refresh `lastChecked` on best-of pages after re-verifying them.

Rules the loop must not break: no invented screenshots, prices, credentials or reviews; our own app is always labelled "ours";
JA/DE stay `noindex` until a native speaker reviews them.
