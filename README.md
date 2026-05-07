# chrmod.net

Personal blog. Astro static site, deployed to Cloudflare Pages on `git push`.

## Stack

- **Astro** — static site generator, zero JS by default
- **Markdown** content collection in `src/content/posts/`
- **System fonts only**, no external assets
- **Cloudflare Pages** — Git-integrated build & deploy

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output → dist/
npm run preview  # serve the built dist/
```

## Write a post

Add a Markdown file under `src/content/posts/<slug>.md` with frontmatter:

```yaml
---
title: "..."
description: "..."
date: 2026-05-07
tags: ["..."]
readTime: "X min read"
draft: false
excerpt: "Shown on the homepage."
hnUrl: "https://news.ycombinator.com/item?id=..."   # optional
---
```

Set `draft: true` to list it on the homepage as a draft (no page generated).

## Keyboard

- `/` — open command palette
- `g h` — go home
- `g g` / `G` — top / bottom of post (post pages only)
- `?` — show shortcuts
- `esc` — close palette

## Deploy to Cloudflare Pages

One-time setup:

1. Push `main` to GitHub (or your Git host of choice).
2. In the Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Pick this repo. Production branch: `main`.
4. Build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version** (env var `NODE_VERSION`): `20`
5. Save and deploy.

After that, every push to `main` triggers a build. Pull request previews deploy to a unique URL per branch.

### Custom domain

In the Pages project → **Custom domains → Set up a custom domain** → `chrmod.net`. Cloudflare handles TLS automatically.

## Layout

```
src/
  components/   Topbar, CommandPalette
  content/
    posts/      Markdown source for the archive
  layouts/      Base.astro shared shell
  lib/          small helpers
  pages/        index.astro + archive/[...slug].astro
  styles/       global.css (the design system)
```
