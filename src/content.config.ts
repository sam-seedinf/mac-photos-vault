import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const step = z.object({
  title: z.string(),
  body: z.string(),
  keys: z.array(z.string()).optional(),
  shot: z.object({ src: z.string(), alt: z.string() }).optional(),
});

const item = z.object({
  name: z.string(),
  tagline: z.string(),
  price: z.string(),
  platforms: z.string(),
  openSource: z.boolean().nullable(),
  url: z.url().optional(),
  ours: z.boolean().default(false),
  affiliate: z.boolean().default(false),
  bestFor: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: z.object({
    kind: z.enum(['guide', 'best', 'compare', 'alternative']),
    title: z.string().max(60),
    h1: z.string().optional(),
    description: z.string().max(155),
    keyword: z.string(),
    category: z.string().optional(),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    /** macOS version the steps were verified on. Leave unset until a human has verified. */
    testedOn: z.string().optional(),
    /** Date prices / features were last verified. Leave unset until verified. */
    lastChecked: z.coerce.date().optional(),
    /** Override the per-language review flag in src/lib/i18n.ts. */
    reviewed: z.boolean().optional(),
    /** Translation group key; defaults to the path without the language prefix. */
    group: z.string().optional(),
    answer: z.string(),
    methods: z.object({ head: z.array(z.string()), rows: z.array(z.array(z.string())) }).optional(),
    steps: z.array(step).optional(),
    items: z.array(item).optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    /** Group keys of related pages. */
    related: z.array(z.string()).default([]),
    /** Group key of the matching best-of page. */
    best: z.string().optional(),
    external: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  }),
});

export const collections = { pages };
