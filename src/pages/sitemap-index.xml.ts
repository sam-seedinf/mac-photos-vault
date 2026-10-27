import type { APIRoute } from 'astro';
import { sitemapGroups, xml } from '../lib/sitemap';
import { abs } from '../lib/site';

export const GET: APIRoute = async () => {
  const groups = await sitemapGroups();
  const rows = Object.entries(groups)
    .filter(([, entries]) => entries.length)
    .map(([name, entries]) => `  <sitemap>\n    <loc>${abs(`/sitemap-${name}.xml`)}</loc>\n    <lastmod>${entries.map((e) => e.lastmod).sort().at(-1)}</lastmod>\n  </sitemap>`);
  return xml(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</sitemapindex>\n`);
};
