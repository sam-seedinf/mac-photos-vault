import { getCollection, type CollectionEntry } from 'astro:content';
import { langs, prefix, reviewedLangs, type Lang } from './i18n';

export type Page = CollectionEntry<'pages'>;

export const langOf = (e: Page): Lang => e.id.split('/')[0] as Lang;
export const pathOf = (e: Page) => e.id.split('/').slice(1).join('/');
export const groupOf = (e: Page) => e.data.group ?? pathOf(e);
export const urlOf = (e: Page) => `${prefix(langOf(e))}/${pathOf(e)}/`;
export const isReviewed = (e: Page) => e.data.reviewed ?? reviewedLangs[langOf(e)];

export async function allPages(): Promise<Page[]> {
  return (await getCollection('pages')).sort((a, b) => a.id.localeCompare(b.id));
}

/** hreflang alternates for a page: reviewed translations plus x-default → English. */
export function alternatesFor(entry: Page, all: Page[]): Record<string, string> {
  const g = groupOf(entry);
  const out: Record<string, string> = {};
  for (const e of all.filter((p) => groupOf(p) === g && isReviewed(p))) out[langOf(e)] = urlOf(e);
  if (out.en) out['x-default'] = out.en;
  return out;
}

/** Language switch targets: every translation that exists, reviewed or not. */
export function translationsFor(entry: Page, all: Page[]): Partial<Record<Lang, string>> {
  const g = groupOf(entry);
  const out: Partial<Record<Lang, string>> = {};
  for (const e of all.filter((p) => groupOf(p) === g)) out[langOf(e)] = urlOf(e);
  return out;
}

/** Resolve a group key to a page in the given language (falls back to none). */
export function resolve(all: Page[], group: string, lang: Lang): Page | undefined {
  return all.find((p) => groupOf(p) === group && langOf(p) === lang);
}

export const homeUrl = (lang: Lang) => (lang === 'en' ? '/' : `/${lang}/`);
export { langs };

/** OG image path for a page. Japanese pages share the default card (no CJK font is bundled). */
export const ogFor = (e: Page) => (langOf(e) === 'ja' ? '/og/default.png' : `/og/${langOf(e) === 'en' ? '' : langOf(e) + '/'}${pathOf(e)}.png`);
