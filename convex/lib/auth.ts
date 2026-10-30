import { env } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export async function requireIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const audiences = Array.isArray(identity.aud) ? identity.aud : [identity.aud];
  if (env.MCP_RESOURCE_URL && audiences.includes(env.MCP_RESOURCE_URL)) {
    if (typeof identity.scope !== "string" || !identity.scope.split(" ").includes("profile")) {
      throw new Error("Missing MCP scope");
    }
  }
  return identity;
}

/** Stable per-user key for ownership (Clerk tokenIdentifier). */
export async function requireUserId(ctx: AuthCtx): Promise<string> {
  const identity = await requireIdentity(ctx);
  return identity.tokenIdentifier;
}
