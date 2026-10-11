import type { AuthConfig } from "convex/server";

/**
 * Clerk JWT issuer for Convex.
 * Set CLERK_JWT_ISSUER_DOMAIN on the Convex deployment
 * (Dashboard → Settings → Environment Variables, or `npx convex env set`).
 * Value is the Clerk Frontend API URL, e.g. https://verb-noun-00.clerk.accounts.dev
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
