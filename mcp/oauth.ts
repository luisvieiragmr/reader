import { createRemoteJWKSet, jwtVerify } from "jose";

export function getMcpConfig() {
  const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN;
  const resource = process.env.MCP_RESOURCE_URL;
  if (!issuer || !resource) throw new Error("MCP OAuth environment is not configured");
  return { issuer, resource };
}

let keys: ReturnType<typeof createRemoteJWKSet> | undefined;
export async function verifyMcpJwt(token: string) {
  const { issuer, resource } = getMcpConfig();
  keys ??= createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  const { payload } = await jwtVerify(token, keys, {
    issuer, audience: resource, algorithms: ["RS256"],
    requiredClaims: ["sub", "exp", "iat"],
  });
  if (!payload.sub || typeof payload.scope !== "string" || !payload.scope.split(" ").includes("profile")) {
    throw new Error("Missing user or scope");
  }
  return payload;
}
