export const langs = ['en', 'ja', 'de'] as const;
export type Lang = (typeof langs)[number];

export const langNames: Record<Lang, string> = { en: 'EN', ja: '日本語', de: 'DE' };
export const htmlLang: Record<Lang, string> = { en: 'en', ja: 'ja', de: 'de' };

/**
 * Languages cleared for indexing. JA and DE need a native-speaker review
 * (spec §3.5) before they go in sitemaps / hreflang / get indexed.
 * Flip to true once reviewed. A page can override with `reviewed: true`.
 */
export const reviewedLangs: Record<Lang, boolean> = { en: true, ja: false, de: false };

export const prefix = (lang: Lang) => (lang === 'en' ? '' : `/${lang}`);

export const ui = {
  en: {
    nav: { guides: 'Guides', apps: 'Vault', best: 'Compare', tools: 'Tools' },
    download: 'Download for Mac',
    downloadShort: 'Download',
    contents: 'Contents',
    quickAnswer: 'Quick answer',
    methods: 'Methods at a glance',
    steps: 'Step by step',
    vaultHeading: 'When to use a vault instead',
    vaultBody:
      'Built-in tools protect one folder at a time and leave you managing passwords, mounts and sync yourself. A vault app keeps photos and files encrypted by default and unlocks them with Touch ID.',
    vaultCta: 'See Secure Vault for Mac',
    faq: 'FAQ',
    related: 'Related guides',
    updated: 'Last updated',
    testedOn: 'Steps written for',
    breadcrumbHome: 'Home',
    emailLabel: 'Email address',
    emailCta: 'Get early access',
    emailMicro: 'No spam. One email when the beta opens.',
    tipsOpt: 'Also send me Mac privacy tips',
    unofficial: 'Unofficial; not affiliated with Apple Inc.',
    ours: 'Ours',
    homeTitle: 'Mac privacy guides',
    tagline: 'Practical guides and honest comparisons for keeping files and photos private on a Mac.',
  },
  ja: {
    nav: { guides: 'ガイド', apps: 'Vault', best: '比較', tools: 'ツール' },
    download: 'Mac 版をダウンロード',
    downloadShort: 'ダウンロード',
    contents: '目次',
    quickAnswer: '結論',
    methods: '方法の比較',
    steps: '手順',
    vaultHeading: 'Vault アプリを使うべきとき',
    vaultBody:
      '標準機能は 1 つのフォルダずつ保護する仕組みで、パスワードやマウントの管理は自分で行う必要があります。Vault アプリなら写真とファイルを常に暗号化し、Touch ID で開けます。',
    vaultCta: 'Secure Vault for Mac を見る',
    faq: 'よくある質問',
    related: '関連ガイド',
    updated: '最終更新',
    testedOn: '対象バージョン',
    breadcrumbHome: 'ホーム',
    emailLabel: 'メールアドレス',
    emailCta: '先行アクセスに登録',
    emailMicro: 'スパムは送りません。ベータ公開時に 1 通だけお送りします。',
    tipsOpt: 'Mac のプライバシー情報も受け取る',
    unofficial: '非公式サイトです。Apple Inc. とは関係ありません。',
    ours: '自社製',
    homeTitle: 'Mac のプライバシーガイド',
    tagline: 'Mac で写真やファイルを守るための、実用的なガイドと正直な比較。',
  },
  de: {
    nav: { guides: 'Anleitungen', apps: 'Vault', best: 'Vergleich', tools: 'Tools' },
    download: 'Für Mac laden',
    downloadShort: 'Laden',
    contents: 'Inhalt',
    quickAnswer: 'Kurz gesagt',
    methods: 'Methoden im Überblick',
    steps: 'Schritt für Schritt',
    vaultHeading: 'Wann sich eine Vault-App lohnt',
    vaultBody:
      'Die eingebauten Werkzeuge schützen jeweils nur einen Ordner und überlassen Passwörter, Einbindung und Synchronisierung Ihnen. Eine Vault-App hält Fotos und Dateien standardmäßig verschlüsselt und öffnet sie per Touch ID.',
    vaultCta: 'Secure Vault for Mac ansehen',
    faq: 'Häufige Fragen',
    related: 'Weitere Anleitungen',
    updated: 'Zuletzt aktualisiert',
    testedOn: 'Geschrieben für',
    breadcrumbHome: 'Start',
    emailLabel: 'E-Mail-Adresse',
    emailCta: 'Frühen Zugang sichern',
    emailMicro: 'Kein Spam. Eine E-Mail, sobald die Beta startet.',
    tipsOpt: 'Auch Mac-Datenschutztipps senden',
    unofficial: 'Inoffiziell; nicht mit Apple Inc. verbunden.',
    ours: 'Von uns',
    homeTitle: 'Mac-Datenschutz: Anleitungen',
    tagline: 'Praktische Anleitungen und ehrliche Vergleiche, um Dateien und Fotos auf dem Mac privat zu halten.',
  },
} as const;
