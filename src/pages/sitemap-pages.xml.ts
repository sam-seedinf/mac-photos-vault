import type { APIRoute } from 'astro';
import { sitemapGroups, urlset, xml } from '../lib/sitemap';

export const GET: APIRoute = async () => xml(urlset((await sitemapGroups()).pages));
