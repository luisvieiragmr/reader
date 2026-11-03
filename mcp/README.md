# Reader MCP with Clerk OAuth

Endpoint: `https://<your-app>/api/mcp` (Streamable HTTP).

`save_article` extracts and saves a public URL; `list_articles` returns the user's
100 most recent articles. Both require a Clerk OAuth JWT with `profile` scope.
This integration uses that scope to authorize access to the signed-in user's
Reader queue. The verified token is forwarded to Convex, which derives ownership
from its issuer and subject (`tokenIdentifier`), exactly as the web app does.
There is no client-supplied owner and no shared-secret fallback.

## Deployment configuration

Set in the Next.js deployment:

- Existing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `NEXT_PUBLIC_CONVEX_URL`.
- `CLERK_JWT_ISSUER_DOMAIN`: exact Clerk issuer URL, matching the web app's Convex provider.
- `MCP_RESOURCE_URL`: canonical full HTTPS MCP URL, e.g. `https://reader.example.com/api/mcp`.

Set in the matching Convex deployment:

- Existing `CLERK_JWT_ISSUER_DOMAIN`.
- `MCP_RESOURCE_URL`: the exact same value as Next.js. Deploy the updated backend
  after setting this value; auth.config.ts is evaluated at deployment time.

The original `convex` audience continues to support web sessions. The additional
MCP audience accepts Clerk JWTs minted for this resource. Never omit audience
validation or use an OAuth client ID as the resource URL. The old `MCP_SECRET`
and `MCP_USER_TOKEN_IDENTIFIER` are no longer used and may be removed.

## Clerk settings

1. Use the same production Clerk instance as Reader's web app.
2. Configure **Paths → Sign-in** and **Sign-up** to the full URLs of the app's
   `/sign-in` and `/sign-up` pages. Configure **OAuth consent** to `/oauth-consent`
   on the same app domain. On a production `vercel.app` instance, do not use the
   unavailable `accounts.<app>.vercel.app` Account Portal for any of these paths.
   In Vercel, set `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and
   `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`. Remove any sign-in/sign-up
   `FORCE_REDIRECT_URL` environment variables; use fallback redirects instead
   so the OAuth consent return URL survives login.
3. Enable consent and **Publish CIMD support**. Your selected **Any compatible
   client** admission setting allows ChatGPT to onboard without manual registration.
4. Select **JWT access tokens**. Enable the access-token audience (`aud`) claim
   so the requested OAuth `resource` is included. Opaque tokens and tokens missing
   the MCP audience are rejected.
5. Allow `profile` scope for the client; set it as a default scope for dynamic
   clients if needed. Reconnect existing clients after changing token settings.

## Connect and verify

Create a ChatGPT MCP connection using the canonical `/api/mcp` URL and OAuth.
ChatGPT discovers Clerk through the public endpoint
`/.well-known/oauth-protected-resource/api/mcp`, also advertised by the HTTP 401
challenge. Clerk hosts its own authorization-server discovery document.

Sign in and approve consent. Save an article and verify it appears in that user's
Reader queue. Repeat with a different account and confirm the queues are separate.
Verify Deny cancels authorization. Bare requests, expired tokens, wrong-audience
tokens, and legacy shared secrets must not reach the tools.

Local checks: `npx tsc --noEmit`, `npx vitest run`, and targeted ESLint.
Full login/consent testing requires a deployed URL and configured Clerk instance.

References:
- https://clerk.com/docs/nextjs/guides/ai/mcp/build-mcp-server
- https://clerk.com/docs/nextjs/guides/configure/auth-strategies/oauth/custom-consent-page
