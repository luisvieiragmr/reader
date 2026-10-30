# Reader MCP (HTTP)

A small **Model Context Protocol** server that saves articles into Queue using the same extract → Convex pipeline as the web app.

**Transport:** Streamable HTTP (not stdio).  
**Vercel:** Yes — mount the handler as a Next.js route (`/api/mcp`) on this app, or point a Vercel project at this repo. Serverless caveats: cold starts and the Function request timeout (article fetch + extract can be slow; raise `maxDuration` if needed).

## How it works

1. Cursor (or any MCP client) calls `POST /api/mcp` with `Authorization: Bearer <MCP_SECRET>`.
2. Tool `save_article` extracts the URL (same code as the app) and calls Convex `articles.saveFromMcp`.
3. That mutation checks the secret again and attaches the article to `MCP_USER_TOKEN_IDENTIFIER` (your Clerk `tokenIdentifier`), so it shows up in that user’s queue.

No Clerk login inside MCP for v1 — saves always go to the configured user.

## Tools

| Tool | Args | What it does |
|------|------|----------------|
| `save_article` | `url` (required) | Extract + save |
| `list_articles` | (none) | List recent articles for the configured user |

## Env vars (names only)

Set in **Next.js** (`.env.local` / Vercel project):

- `MCP_SECRET` — bearer token for MCP HTTP
- `MCP_USER_TOKEN_IDENTIFIER` — also required on Convex (see below)
- `NEXT_PUBLIC_CONVEX_URL` — already used by the app

Set on the **Convex deployment** (`npx convex env set …`):

- `MCP_SECRET` — same value as Next (mutation double-check)
- `MCP_USER_TOKEN_IDENTIFIER` — Clerk tokenIdentifier for the owner (same string as `articles.userId` in the Convex dashboard for a row you saved while logged in)

## Run locally

```bash
# Terminal 1 — Convex
npx convex env set MCP_SECRET <your-secret>
npx convex env set MCP_USER_TOKEN_IDENTIFIER <your-tokenIdentifier>
npx convex dev

# Terminal 2 — Next (serves /api/mcp)
# Add MCP_SECRET to .env.local (same value)
npm run dev
```

Endpoint: `http://localhost:3000/api/mcp`

## Cursor MCP config

Add to `.cursor/mcp.json` (or Cursor Settings → MCP). Do not put the real secret in the file — use an env var:

```json
{
  "mcpServers": {
    "reader": {
      "url": "http://localhost:3000/api/mcp",
      "headers": {
        "Authorization": "Bearer ${env:MCP_SECRET}"
      }
    }
  }
}
```

Production:

```json
{
  "mcpServers": {
    "reader": {
      "url": "https://YOUR_DEPLOYMENT.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer ${env:MCP_SECRET}"
      }
    }
  }
}
```

## Deploy on Vercel

1. Deploy this Next.js app as usual.
2. Set `MCP_SECRET` and `NEXT_PUBLIC_CONVEX_URL` on the Vercel project.
3. Set `MCP_SECRET` and `MCP_USER_TOKEN_IDENTIFIER` on the Convex deployment.
4. Point Cursor at `https://<your-app>.vercel.app/api/mcp` with the Bearer header above.

Code lives in `mcp/` (easy to read). The Next route `src/app/api/mcp/route.ts` is a thin wrapper so Vercel can host it.

## Custom OAuth consent page

Reader hosts Clerk's prebuilt consent screen at `/oauth-consent` for instances
that cannot use the hosted Account Portal (including production `vercel.app`
instances). The route uses the existing Clerk session protection; signed-out
visitors are sent to the home page. In the OAuth flow, Clerk handles sign-in
before redirecting to consent and supplies the authorization query parameters.

After deploying this route:

1. Select the matching application and instance in Clerk Dashboard.
2. Under **Configure → Paths → Component paths → OAuth consent**, set the
   production URL to `https://<your-app>.vercel.app/oauth-consent` (use your actual
   app domain). In development, use `/oauth-consent` relative to the development host.
3. Save the path, then enable consent for the OAuth application. Keep consent enabled.
4. Start a real OAuth authorization request and verify that both Allow and Deny
   return to the registered client callback. Opening the page without OAuth query
   parameters is not a complete consent-flow test.

The page preserves Clerk's application identity, scope display, and Allow/Deny
handling. Its referrer policy allows Clerk's cross-origin consent submission.
This route alone does **not** enable OAuth on `/api/mcp`: that endpoint still uses
`MCP_SECRET` until discovery and OAuth access-token validation are implemented.

Reference: [Clerk custom consent setup](https://clerk.com/docs/nextjs/guides/configure/auth-strategies/oauth/custom-consent-page).
