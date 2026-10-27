import type { APIRoute } from 'astro';
import { allPages, urlOf, langOf } from '../lib/content';
import { abs } from '../lib/site';

const plain = (s: string) =>
  s.replace(/<\/?(Callout|Kbd|CompareTable)[^>]*>/g, '').replace(/`/g, '').replace(/\*\*/g, '').replace(/\*/g, '');

export const GET: APIRoute = async () => {
  const en = (await allPages()).filter((p) => langOf(p) === 'en');
  const docs = en.map((p) => {
    const d = p.data;
    const parts = [`# ${d.h1 ?? d.title}`, `URL: ${abs(urlOf(p))}`, `Updated: ${d.updated.toISOString().slice(0, 10)}`, '', plain(d.answer)];
    if (d.methods) parts.push('', d.methods.head.join(' | '), ...d.methods.rows.map((r) => plain(r.join(' | '))));
    if (d.items) parts.push('', ...d.items.map((i) => `- ${i.name}${i.ours ? ' (ours)' : ''}: ${i.tagline} Price: ${i.price}. Platforms: ${i.platforms}. Pros: ${i.pros.join('; ')}. Cons: ${i.cons.join('; ')}.`));
    if (d.steps) parts.push('', 'Steps:', ...d.steps.map((s, i) => `${i + 1}. ${s.title}: ${plain(s.body)}`));
    if (p.body) parts.push('', plain(p.body));
    if (d.faq.length) parts.push('', 'FAQ:', ...d.faq.map((f) => `Q: ${f.q}\nA: ${plain(f.a)}`));
    return parts.join('\n');
  });
  return new Response(`# Secure Mac App: full text\n\n${docs.join('\n\n---\n\n')}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
