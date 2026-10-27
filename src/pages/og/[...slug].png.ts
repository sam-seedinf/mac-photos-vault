import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { allPages, langOf, pathOf } from '../../lib/content';

const fontDir = 'node_modules/@fontsource/inter/files';
const fonts = async () => [
  { name: 'Inter', data: await readFile(`${fontDir}/inter-latin-400-normal.woff`), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: await readFile(`${fontDir}/inter-latin-700-normal.woff`), weight: 700 as const, style: 'normal' as const },
];

const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export async function getStaticPaths() {
  const pages = (await allPages()).filter((p) => langOf(p) !== 'ja');
  return [
    { params: { slug: 'default' }, props: { title: 'Privacy guides & encrypted vault for Mac', kicker: '' } },
    ...pages.map((p) => ({
      params: { slug: `${langOf(p) === 'en' ? '' : langOf(p) + '/'}${pathOf(p)}` },
      props: { title: p.data.h1 ?? p.data.title, kicker: p.data.category ?? '' },
    })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const { title, kicker } = props as { title: string; kicker: string };
  const size = title.length > 60 ? 48 : title.length > 40 ? 56 : 64;
  const tree = el('div', { width: 1200, height: 630, display: 'flex', background: 'linear-gradient(135deg,#dfe7fb,#f5f5f7)', padding: 56, fontFamily: 'Inter' }, [
    el('div', { display: 'flex', flexDirection: 'column', width: '100%', background: '#ffffff', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }, [
      el('div', { display: 'flex', alignItems: 'center', height: 64, padding: '0 28px', background: '#ececf0', borderBottom: '1px solid #d8d8de' }, [
        el('div', { display: 'flex', width: 18, height: 18, borderRadius: 9, background: '#ff5f57', marginRight: 10 }),
        el('div', { display: 'flex', width: 18, height: 18, borderRadius: 9, background: '#febc2e', marginRight: 10 }),
        el('div', { display: 'flex', width: 18, height: 18, borderRadius: 9, background: '#28c840' }),
      ]),
      el('div', { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '0 64px' }, [
        el('div', { display: 'flex', fontSize: 26, color: '#6e6e73', marginBottom: 20 }, kicker || 'Secure Mac App'),
        el('div', { display: 'flex', fontSize: size, fontWeight: 700, color: '#1d1d1f', lineHeight: 1.15, letterSpacing: -1 }, title),
      ]),
      el('div', { display: 'flex', padding: '0 64px 36px', fontSize: 26, fontWeight: 700, color: '#2f6fed' }, 'securemacapp.com'),
    ]),
  ]);
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts: await fonts() });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
};
