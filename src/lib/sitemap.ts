import { abs, isoDate } from './site';
import { allPages, urlOf, langOf, isReviewed, alternatesFor, type Page } from './content';
import { reviewedLangs, type Lang } from './i18n';

export interface Entry { loc: string; lastmod: string; alternates?: Record<string, string> }

/** Static (non-collection) pages. Bump when the page content changes materially. */
export const STATIC_LASTMOD = '2026-10-27';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function urlset(entries: Entry[]): string {
  const rows = entries.map((e) => {
    const alts = e.alternates && Object.keys(e.alternates).length > 1
      ? Object.entries(e.alternates).map(([hl, h]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${esc(abs(h))}"/>`).join('\n') + '\n'
      : '';
    return `  <url>\n    <loc>${esc(abs(e.loc))}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n${alts}  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${rows.join('\n')}\n</urlset>\n`;
}

export const xml = (body: string) => new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });

const latest = (pages: Page[]) => isoDate(new Date(Math.max(...pages.map((p) => p.data.updated.getTime()))));

export async function sitemapGroups(): Promise<Record<string, Entry[]>> {
  const all = await allPages();
  const indexable = all.filter(isReviewed);
  const toEntry = (p: Page): Entry => ({ loc: urlOf(p), lastmod: isoDate(p.data.updated), alternates: alternatesFor(p, all) });
  const en = indexable.filter((p) => langOf(p) === 'en');
  const guides = en.filter((p) => p.data.kind === 'guide');
  const best = en.filter((p) => p.data.kind !== 'guide');
  const lang = (l: Lang): Entry[] => {
    if (!reviewedLangs[l]) return [];
    const ps = indexable.filter((p) => langOf(p) === l);
    return [{ loc: `/${l}/`, lastmod: ps.length ? latest(ps) : STATIC_LASTMOD, alternates: { en: '/', ja: '/ja/', de: '/de/', 'x-default': '/' } }, ...ps.map(toEntry)];
  };
  return {
    pages: ['/', '/vault/', '/about/', '/contact/'].map((loc) => ({ loc, lastmod: STATIC_LASTMOD })),
    guides: [{ loc: '/guides/', lastmod: latest(guides) }, ...guides.map(toEntry)],
    best: [{ loc: '/best/', lastmod: latest(best) }, ...best.map(toEntry)],
    tools: [{ loc: '/tools/hidden-file-checker/', lastmod: STATIC_LASTMOD }],
    ja: lang('ja'),
    de: lang('de'),
  };
}
