# Queue

A Matter-style read-later web app: paste a public article URL, save its content, and open it in a quiet reader.

No login. No audio.

## Run locally

```bash
npm install
npx convex dev
```

In a second terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste a public article URL, and save it.

`npx convex dev` writes `.env.local` with `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`. Cloud agents can set `CONVEX_AGENT_MODE=anonymous` so Convex uses an isolated anonymous deployment instead of a personal login.

## Astryx

Installed from [Getting Started](https://astryx.atmeta.com/docs/getting-started):

```bash
npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral @astryxdesign/cli
npx @astryxdesign/cli init --all
npm run astryx -- theme add neutral
```

Astryx is a design system (Theme, Button, tokens, CSS). It does not store or fetch article content. Persistence is Convex. There are no Astryx environment variables.

CLI 0.6.6 does not support `theme add --import` from the public docs; `theme add neutral` scaffolds the Neutral theme into `src/themes/neutral/`. CSS follows the documented Tailwind path in `src/app/globals.css`.

## Stack

- Next.js App Router 16
- Astryx (UI) + shadcn/ui + Tailwind CSS v4
- Convex (article storage)
- `@extractus/article-extractor` (title, author, date, body)
