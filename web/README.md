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
