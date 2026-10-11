# Queue

A Matter-style read-later web app: sign in, paste a public article URL, save it to your queue, and open it in a quiet reader.

Articles are **per user**. Signed-out visitors see a login surface on `/` — never another user’s queue. No audio.

## Run locally

```bash
npm install
npx convex dev
```

In a second terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). When signed out you get the Queue login screen; after sign-in you see only your saved articles.

`npx convex dev` writes `.env.local` with `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`. Cloud agents can set `CONVEX_AGENT_MODE=anonymous` so Convex uses an isolated anonymous deployment instead of a personal login.

## Auth (Clerk + Convex)

1. **Clerk app keys** in `.env.local`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and the redirect URLs (see `.env.example`).
2. **Convex JWT issuer** on the Convex deployment (already set for the linked dev deployment if you used this repo’s setup):

   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://YOUR_SUBDOMAIN.clerk.accounts.dev
   ```

   Get the URL from Clerk Dashboard → [Convex integration](https://dashboard.clerk.com/~/integrations) (activate Convex) or API Keys → Frontend API URL.
3. **Clerk JWT for Convex** (required unless the Convex integration already issues `aud: "convex"`):
   - Clerk Dashboard → **JWT Templates** → **New template** → **Convex**
   - Name must be exactly `convex`
   - Save, then reload the app

`convex/auth.config.ts` validates tokens with `applicationID: "convex"`. The client uses `ConvexProviderWithClerk`.

### Existing articles (pre-auth)

Rows saved before per-user auth have no `userId`. They are left **orphaned** and do not appear in anyone’s queue. New saves always attach `userId` from `ctx.auth.getUserIdentity().tokenIdentifier`.

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
- Clerk (auth UI + JWT)
- Astryx (UI) + shadcn/ui + Tailwind CSS v4
- Convex (per-user article storage)
- `@extractus/article-extractor` (title, author, date, body)
