# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Astro dev server on http://localhost:4321 (renders drafts)
- `npm run build` — static build → `dist/`
- `npm run preview` — serve the built `dist/`

No lint, no tests, no TypeScript. Plain JS modules + `.astro`.

Node is pinned via `.mise.toml` (`node = "latest"`).

## Architecture

Astro 6 static site, Cloudflare Pages auto-deploys on push to `main`. README has the deploy setup.

- **Content collection** is defined in `src/content.config.js` with a Zod schema. Posts live as Markdown at `src/content/posts/<slug>.md` and are rendered by `src/pages/archive/[...slug].astro` at `/archive/<slug>/` (this is the canonical URL — not `/posts/`).
- **Homepage** (`src/pages/index.astro`) lists posts sorted newest-first. Drafts (`draft: true`) appear only in dev (`import.meta.env.DEV`) — production filters them out via `getCollection("posts", ({ data }) => !data.draft)`. The post route's `getStaticPaths` does the same, so drafts don't generate a page in `dist/`.
- **Shell**: `src/layouts/Base.astro` wraps every page with `Topbar` and `CommandPalette`. The palette items are passed per-page as `paletteItems`.
- **Design system** lives entirely in `src/styles/global.css`. No CSS modules, no Tailwind, no per-component scoped styles for shared chrome.
- **Static assets** go in `public/<post-slug>/` (e.g. `public/cookie-banners-vision/slate-vanilla.png` → `/cookie-banners-vision/slate-vanilla.png`).

## Post frontmatter

Schema lives in `src/content.config.js`. Required: `title`, `description`, `date`, `excerpt`. Optional: `tags[]`, `readTime`, `draft`, `hnUrl`.

Setting `hnUrl` is the only thing needed to expose a "Discuss on Hacker News" footer (`.hn-strip`) on the post and a "Discuss on Hacker News" entry in the Cmd-K palette. Both are already wired in `src/pages/archive/[...slug].astro`. **Don't hand-roll inline HN links inside post bodies** — use the frontmatter field so it stays consistent across posts.

## Per-post style overrides — important gotcha

Posts can ship their own `<style>` block inside the Markdown body to take over the layout (see `src/content/posts/cookie-banners-vision-models.md` for the prior-art pattern). The convention is:

1. Wrap the post body in a container with a unique class (e.g. `.cookies-post`).
2. Use `body:has(.cookies-post)` selectors to hide the default chrome elements the template renders: `.crumbs`, `h1.title`, `.meta-strip`, `.endmark`.
3. Often uses `margin: ... calc(50% - 50vw) ...` + `padding: ... calc(50vw - 50%) ...` to break out of the page's max-width and run a colored background to the viewport edges.

**Footnote**: if a post does the negative-bottom-margin trick to extend its background, the default `.hn-strip` (rendered when `hnUrl` is set) sits *after* the closing wrapper and will visually overlap the colored region. Either add `.hn-strip` to the per-post `display: none` rules and bake a styled discuss link inside the wrapper, or drop the negative bottom margin. When adding/removing `hnUrl` on such posts, eyeball the rendered bottom of the page.

## Forcing a Cloudflare Pages redeploy

Cloudflare Pages redeploys on every push to `main`. To force a rebuild without a real change, the conventional move in this repo is an empty commit: `git commit --allow-empty -m "..." && git push`. Wrangler is not set up.
