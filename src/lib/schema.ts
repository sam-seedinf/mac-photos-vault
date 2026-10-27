import { SITE, NAME, AUTHOR, abs, isoDate } from './site';
import type { Page } from './content';
import { urlOf, ogFor } from './content';

const org = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: NAME,
  url: SITE,
  logo: abs('/favicon.svg'),
};

export const homeSchema = () => [
  { '@context': 'https://schema.org', ...org },
  { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#site`, url: SITE, name: NAME, publisher: { '@id': org['@id'] } },
];

export const breadcrumbSchema = (crumbs: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.url) })),
});

export const faqSchema = (faq: { q: string; a: string }[]) =>
  faq.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }
    : null;

export function pageSchemas(e: Page, crumbs: { name: string; url: string }[], lang: string) {
  const d = e.data;
  const url = abs(urlOf(e));
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: d.h1 ?? d.title,
    description: d.description,
    inLanguage: lang,
    datePublished: isoDate(d.published),
    dateModified: isoDate(d.updated),
    author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    publisher: { '@id': org['@id'] },
    mainEntityOfPage: url,
    image: abs(ogFor(e)),
  };
  const out: unknown[] = [article, breadcrumbSchema(crumbs)];
  if (d.kind === 'guide' && d.steps?.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: d.h1 ?? d.title,
      description: d.description,
      step: d.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.body })),
    });
  }
  if ((d.kind === 'best' || d.kind === 'alternative') && d.items?.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: d.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
    });
  }
  const faq = faqSchema(d.faq);
  if (faq) out.push(faq);
  return out;
}
