import type { APIRoute } from 'astro';
import { allPages, urlOf, langOf } from '../lib/content';
import { abs } from '../lib/site';

export const GET: APIRoute = async () => {
  const en = (await allPages()).filter((p) => langOf(p) === 'en');
  const line = (p: (typeof en)[number]) => `- [${p.data.h1 ?? p.data.title}](${abs(urlOf(p))}): ${p.data.description}`;
  const out = [
    '# Secure Mac App',
    '> Practical guides and honest comparisons for keeping files and photos private on a Mac, plus Secure Vault, our encrypted vault app for macOS (private beta).',
    '',
    '## Guides',
    ...en.filter((p) => p.data.kind === 'guide').map(line),
    '',
    '## Comparisons',
    ...en.filter((p) => p.data.kind !== 'guide').map(line),
    '',
    '## Tools',
    `- [Hidden File Checker](${abs('/tools/hidden-file-checker/')}): paste a Terminal listing to see what is hidden; runs in the browser`,
    '',
    '## Apps',
    `- [Secure Vault for Mac](${abs('/vault/')}): encrypted vault for photos and files (beta)`,
    '',
    '## About',
    `- [About](${abs('/about/')}): who writes this and how we test`,
    '',
    `Full text of the core guides: ${abs('/llms-full.txt')}`,
    '',
  ];
  return new Response(out.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
