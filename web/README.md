# InboxTap web

The marketing site and documentation for [inboxtap.dev](https://inboxtap.dev). It is a
fully static Next.js application and does not expose or proxy the local InboxTap API.

```bash
bun install
bun --cwd web run dev
```

## Vercel project

Import this repository as one Vercel project with these settings:

- Root Directory: `web`
- Framework Preset: Next.js
- Install Command: auto-detected from the root `bun.lock`
- Build Command: `bun run build`
- Output Directory: `out`
- Production domain: `inboxtap.dev`
- Redirect `www.inboxtap.dev` to the apex domain

Enable Web Analytics in the Vercel project after the production deployment. No environment
variables are required.

## Localization

The site ships in English (`/`), French (`/fr`), and Spanish (`/es`). English is the default;
the other locales use localized URL slugs (for example `/fr/docs/demarrage-rapide`).

- UI strings and page metadata live in `lib/i18n/dictionaries/`; docs titles, descriptions,
  localized slugs, and table-of-contents anchors live in `lib/i18n/docs/`.
- Docs bodies live in `content/docs/{en,fr,es}/` with identical filenames per locale.
- Any change to an English doc or UI string must update the French and Spanish counterparts
  in the same pull request. The `Record<DocKey, …>` dictionary types and the parity tests
  keep the structure complete; keeping the translated content current is on the author.
- Table-of-contents anchor ids are derived from the translated headings by `rehype-slug`, so
  a changed heading must be mirrored in that locale's `lib/i18n/docs/` entry —
  `bun run verify` fails if they drift. Published localized slugs must never change.
