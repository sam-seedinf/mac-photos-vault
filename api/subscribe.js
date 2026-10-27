// Vercel serverless function: POST /api/subscribe
// Adds an email to Buttondown with tags for the waitlist, language and source page.
// Buttondown handles double opt-in (enable it in Buttondown > Settings > Subscribing).

const ALLOWED_ORIGINS = [/^https:\/\/(www\.)?securemacapp\.com$/, /^https:\/\/[a-z0-9-]+\.vercel\.app$/, /^http:\/\/localhost(:\d+)?$/];
const LANGS = new Set(['en', 'ja', 'de']);
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const clean = (v, max = 100) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
const tagSafe = (v) => clean(v, 60).toLowerCase().replace(/[^a-z0-9/_-]+/g, '-').replace(/^-+|-+$/g, '');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.some((re) => re.test(origin))) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body ?? {};
  // Honeypot: bots fill the hidden "company" field. Pretend success.
  if (clean(body.company)) return res.status(200).json({ ok: true });

  const email = clean(body.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'invalid_email' });

  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) return res.status(503).json({ error: 'not_configured' });

  const lang = LANGS.has(body.lang) ? body.lang : 'en';
  const app = tagSafe(body.app) || 'vault';
  const src = tagSafe(body.source_path || body.source).replace(/\//g, '-').replace(/^-|-$/g, '') || 'home';
  const tags = [`waitlist-${app}`, `lang-${lang}`, `src-${src}`.slice(0, 60)];
  if (body.tips === true) tags.push('newsletter');

  const metadata = { app, lang, source_path: clean(body.source_path, 200) };
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) if (body[k]) metadata[k] = clean(body[k]);

  try {
    const r = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_address: email, tags, metadata, referrer_url: clean(body.source_path, 200) }),
    });
    // 409 / "already subscribed" is a success from the visitor's point of view.
    if (r.ok || r.status === 409) return res.status(200).json({ ok: true });
    const detail = await r.text();
    if (r.status === 400 && /already|exists/i.test(detail)) return res.status(200).json({ ok: true });
    console.error('buttondown error', r.status, detail.slice(0, 300));
    return res.status(502).json({ error: 'upstream' });
  } catch (e) {
    console.error('subscribe failed', e);
    return res.status(502).json({ error: 'upstream' });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }
