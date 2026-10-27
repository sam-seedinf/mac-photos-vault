/* Site-wide behaviour: theme, consent, tracking, fake-door modal, subscribe forms. Keep this small (JS budget: 50KB). */
const w = window as any;
const body = document.body;
const lang = body.dataset.lang ?? 'en';
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

const track = (name: string, params: Record<string, unknown> = {}) => {
  if (typeof w.gtag === 'function') w.gtag('event', name, params);
};
w.track = track;

/* Theme toggle */
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const next = dark ? 'light' : 'dark';
  root.dataset.theme = next;
  store.set('theme', next);
});

/* Consent (default denied everywhere; analytics only after Accept) */
function applyConsent(granted: boolean) {
  if (typeof w.gtag === 'function') {
    w.gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
  }
  const cid = body.dataset.clarity;
  if (granted && cid && !w.__clarityLoaded) {
    w.__clarityLoaded = true;
    (function (c: any, l: Document, a: string, r: string, i: string) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      const t = l.createElement(r) as HTMLScriptElement; t.async = true; t.src = 'https://www.clarity.ms/tag/' + i;
      l.head.appendChild(t);
    })(window, document, 'clarity', 'script', cid);
    w.clarity?.('set', 'masked', true);
  }
}
const banner = document.getElementById('consent');
const saved = store.get('consent');
if (saved) applyConsent(saved === 'granted');
else if (banner) banner.hidden = false;
banner?.addEventListener('click', (e) => {
  const v = (e.target as HTMLElement).closest<HTMLElement>('[data-consent]')?.dataset.consent;
  if (!v) return;
  store.set('consent', v);
  applyConsent(v === 'granted');
  banner.hidden = true;
});

/* UTM capture (kept for the session so it survives navigation to the signup page) */
const utm: Record<string, string> = {};
try {
  const q = new URLSearchParams(location.search);
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const v = q.get(k) ?? sessionStorage.getItem(k);
    if (v) { utm[k] = v.slice(0, 100); sessionStorage.setItem(k, utm[k]); }
  }
} catch { /* ignore */ }

/* Fake door */
const modal = document.getElementById('fd-modal') as HTMLDialogElement | null;
document.addEventListener('click', (e) => {
  const el = e.target as HTMLElement;
  const btn = el.closest<HTMLElement>('[data-fakedoor]');
  if (btn && modal) {
    track('fake_door_click', { app: btn.dataset.app, page_path: location.pathname, lang });
    modal.querySelector<HTMLElement>('.fd-form')!.hidden = false;
    modal.querySelector<HTMLElement>('.fd-done')!.hidden = true;
    modal.showModal();
    modal.querySelector<HTMLInputElement>('input[type=email]')?.focus();
    return;
  }
  if (el.closest('[data-close-modal]')) { e.preventDefault(); modal?.close(); return; }
  if (modal && el === modal) modal.close(); // click on backdrop
  const out = el.closest<HTMLElement>('[data-outbound]');
  if (out) track('outbound_click', { app_name: out.dataset.appName, affiliate: out.dataset.affiliate === 'true' });
  if (el.closest('[data-toc]')) track('toc_click');
});

/* Subscribe forms */
document.querySelectorAll<HTMLFormElement>('form[data-subscribe]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('.status')!;
  const say = (msg: string, cls: 'ok' | 'err') => { status.hidden = false; status.className = `status ${cls}`; status.textContent = msg; };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') ?? '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return say({ en: 'Please enter a valid email address.', ja: '有効なメールアドレスを入力してください。', de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }[lang as 'en'] ?? '', 'err');
    }
    const btn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    btn.disabled = true;
    const source = form.dataset.source === 'modal' || !form.dataset.source ? location.pathname : form.dataset.source;
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email, company: fd.get('company'), tips: fd.get('tips') === 'on',
          app: form.dataset.app, lang: form.dataset.lang, source_path: location.pathname, source, ...utm,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track('generate_lead', { app: form.dataset.app, source: location.pathname, lang });
      if (modal?.contains(form)) {
        modal.querySelector<HTMLElement>('.fd-form')!.hidden = true;
        modal.querySelector<HTMLElement>('.fd-done')!.hidden = false;
      } else {
        say({ en: "You're on the list. Check your inbox to confirm.", ja: '登録しました。受信トレイで確認してください。', de: 'Sie stehen auf der Liste. Bitte bestätigen Sie per E-Mail.' }[lang as 'en'] ?? '', 'ok');
        form.reset();
      }
    } catch {
      say({ en: 'Something went wrong. Please try again in a moment.', ja: 'エラーが発生しました。しばらくしてからもう一度お試しください。', de: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es gleich erneut.' }[lang as 'en'] ?? '', 'err');
    } finally { btn.disabled = false; }
  });
});

/* scroll_75 */
let fired = false;
addEventListener('scroll', () => {
  if (fired) return;
  const h = document.documentElement;
  if ((h.scrollTop + innerHeight) / h.scrollHeight >= 0.75) { fired = true; track('scroll_75'); }
}, { passive: true });

/* Mobile menu sheet */
const burger = document.getElementById('burger');
const sheet = document.getElementById('sheet');
burger?.addEventListener('click', () => {
  const open = sheet!.hidden;
  sheet!.hidden = !open;
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

/* Scroll reveal: once, at 15% visible, children staggered by 80ms */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll<HTMLElement>('.reveal');
if (reduce || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('in'));
else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      const sibs = [...(el.parentElement?.querySelectorAll(':scope > .reveal') ?? [])];
      el.style.transitionDelay = `${Math.max(0, sibs.indexOf(el)) * 80}ms`;
      el.classList.add('in');
      io.unobserve(el);
    }
  }, { threshold: 0.15 });
  reveals.forEach((el) => io.observe(el));
}

/* Hero window: rises up to 40px on scroll */
const hw = document.querySelector<HTMLElement>('[data-parallax]');
if (hw && !reduce) {
  let tick = false;
  addEventListener('scroll', () => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(() => { hw.style.setProperty('--py', `${-Math.min(40, scrollY / 10)}px`); tick = false; });
  }, { passive: true });
}
