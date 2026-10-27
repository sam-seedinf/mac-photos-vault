export const SITE = 'https://securemacapp.com';
export const NAME = 'Secure Mac App';
export const AUTHOR = { name: 'Sumeet', url: `${SITE}/about/` };
export const EMAIL = 'hello@securemacapp.com';
export const GA_ID: string = import.meta.env.PUBLIC_GA_ID ?? '';
export const CLARITY_ID: string = import.meta.env.PUBLIC_CLARITY_ID ?? '';

export const abs = (path: string) => new URL(path, SITE).href;

export const fmtDate = (d: Date, lang = 'en') =>
  new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(d);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
