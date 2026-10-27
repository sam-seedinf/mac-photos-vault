# securemacapp.com

Astro (static) site for **Secure Mac App**: Mac privacy guides, a directory of apps, free tools, and the
**Secure Vault for Mac** waitlist (a "fake door" until demand is proven). Built from the day-1 setup spec.

```
npm install
npm run dev        # http://localhost:4321
npm run build      # astro build + pagefind index → dist/
npm run audit      # content rubric report (spec §3.5)
```

Node ≥ 22.22 (see `engines`).

## Layout

| Path | What |
|---|---|
| `src/content/pages/{en,ja,de}/…` | All guides, best-of, compare and alternatives pages (MDX + frontmatter). One file = one URL. |
| `src/pages/[...slug].astro` | Template for every collection page (answer → table → steps → body → vault CTA → FAQ → related) and its JSON-LD |
| `src/pages/*.astro` | Hand-built pages: home, `/vault/`, indexes, trust pages, the Hidden File Checker tool, 404 |
| `src/components/` | `MacWindow`, `Steps`, `Kbd`, `Callout`, `CompareTable`, `AppCard`, `FakeDoorButton`, `SubscribeForm`, `EmailCapture`, `FAQ`, `LastUpdated`, `LangSwitch`, `Breadcrumbs` |
| `src/scripts/site.ts` | Theme toggle, consent, GA4 events, fake-door modal, subscribe forms (tiny, bundled inline) |
| `api/subscribe.js` | Vercel function → Buttondown (tags `waitlist-vault`, `lang-xx`, `src-<path>`) |
| `src/pages/sitemap-*.xml.ts`, `llms*.txt.ts`, `og/` | Generated sitemaps (with hreflang), llms.txt / llms-full.txt, OG images |
| `public/robots.txt`, `vercel.json` | Crawler rules; headers (HSTS, CSP…), www / alt-domain redirects |
| `scripts/audit.mjs`, `scripts/indexnow.mjs` | Rubric audit; IndexNow ping |
| `docs/` | README for the public `secure-vault-mac` repo; agent-loop runbook |

## Adding a page

Create `src/content/pages/en/guides/<slug>.mdx`. The frontmatter schema is in `src/content.config.ts`
(title ≤ 60 chars, description ≤ 155 are enforced at build). The URL is the path under `en/`; `ja/` and `de/`
get a prefix. Link translations by giving them the same path, or an explicit `group:`.

## Publishing gates (important)

* **JA and DE are `noindex` and excluded from sitemaps/hreflang** until a native speaker reviews them.
  Flip `reviewedLangs` in `src/lib/i18n.ts` (and `scripts/audit.mjs`) when done.
* **`testedOn`** (guides) and **`lastChecked`** (comparisons) are left unset on purpose: the page then makes no
  claim that steps were tested or prices verified. Set them only after a human has actually done so.
* **Screenshots**: add `shot: {src, alt}` to steps. Real macOS screenshots only; no Apple imagery.
* `npm run audit` lists every open item. `--strict` exits non-zero (used in CI as informational today).

## Config (env vars)

See `.env.example`. Nothing breaks if they're unset: analytics and the consent banner simply don't load, and
`/api/subscribe` returns 503 until `BUTTONDOWN_API_KEY` is set.

* `PUBLIC_GA_ID`, `PUBLIC_CLARITY_ID`: analytics. Consent Mode v2 starts **denied for everyone** (a static site
  can't geolocate EU visitors); Clarity loads only after Accept.
* `BUTTONDOWN_API_KEY`: also enable double opt-in in Buttondown → Settings → Subscribing.
* `INDEXNOW_KEY`: serves `/<key>.txt`; run `npm run indexnow` after each production deploy.

## Deviations from the spec (and why)

* **Vercel instead of Cloudflare Pages** (the owner chose Vercel for deploys): redirects/headers live in `vercel.json`;
  the form handler is a Vercel function; Cloudflare Web Analytics is not used (GA4 + Clarity only).
* **Plain CSS with design-token variables instead of Tailwind**: keeps the bundle tiny and the tokens in §1.2 literal.
* **Consent default is denied everywhere**, not only EEA/UK/CH (no geo on a static site).
* **Contact page uses `mailto:` links** rather than a press/listing form.
* **No Cloudflare `_headers` / `_redirects`**; equivalents are in `vercel.json`.
