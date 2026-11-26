# Matheus D. Santos · Portfolio

My personal portfolio. One painted landscape sits behind every page and moves through a day as you scroll; projects hang on a 3D ring as paintings generated from their real screenshots.

Next.js 15 (App Router), React 19, TypeScript, plain CSS. No UI or animation libraries: the background and the project paintings are WebGL fragment shaders.

## Run it

Requires Node 22 and pnpm.

```bash
pnpm install
cp .env.example .env.local   # fill in to make the contact form send email
pnpm dev                     # http://localhost:3000
```

| Script | What it does |
|---|---|
| `pnpm build` / `pnpm start` | Production build (every page is prerendered) and server |
| `pnpm test` | Vitest: content integrity and contact validation |
| `pnpm test:e2e` | Playwright on desktop and mobile; builds and starts the app itself |
| `pnpm lint` / `pnpm typecheck` | ESLint and `tsc` |
| `pnpm paint` | Renders the project paintings from their screenshots into `public/paintings/` |

First e2e run: `pnpm exec playwright install chromium`.

## Where things live

| Path | Contents |
|---|---|
| `src/content/` | All copy: profile, jobs, tools, socials, projects and their case studies |
| `src/lib/paint/` | Shaders and WebGL helpers for the landscape and the project paintings |
| `src/components/` | Client islands (background, gallery ring, contact form, effects) and shared markup |
| `src/app/` | Routes: `/`, `/projects`, `/projects/[slug]`, `POST /api/contact`, sitemap and robots |
| `Matheus D. Santos Portfolio v2.html` | The design source. The site should match it. |
| `docs/design/` | Design decisions |

## Adding a project

1. Add a screenshot to `public/projects/<slug>.webp` (about 960px wide).
2. Add an entry to `src/content/projects.ts`. `art` frames the painting: `focus` is the point to center on, `zoom` crops in, `exposure` lifts dark screenshots or dims bright ones.
3. Run `pnpm paint` to render its painting into `public/paintings/<slug>.webp`, and commit the file. Re-run it whenever the screenshot, palette or `art` changes. Paintings are rendered once, ahead of time, because the shader is too heavy to run in visitors' browsers.
4. `pnpm test` checks the slug, links, palette, screenshot, painting and case study.

## Environment

See `.env.example`. Without the Resend variables, the contact API answers 503 and the form shows an error, so the site still builds and runs.
