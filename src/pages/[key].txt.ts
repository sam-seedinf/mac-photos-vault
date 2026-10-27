import type { APIRoute } from 'astro';

// Serves the IndexNow key file at /<INDEXNOW_KEY>.txt when the env var is set at build time.
const key = process.env.INDEXNOW_KEY ?? '';

export function getStaticPaths() {
  return /^[a-zA-Z0-9-]{8,128}$/.test(key) ? [{ params: { key } }] : [];
}

export const GET: APIRoute = () => new Response(key, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
