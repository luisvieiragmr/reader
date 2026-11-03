/** Clerk prefers `scp`; standard OAuth JWTs can use a space-delimited `scope`. */
export function oauthScopes(claims: Record<string, unknown>): string[] {
  if (claims.scp !== undefined && claims.scp !== null) {
    return Array.isArray(claims.scp) && claims.scp.every((scope) => typeof scope === "string")
      ? claims.scp
      : [];
  }
  return typeof claims.scope === "string" ? claims.scope.split(" ").filter(Boolean) : [];
}
