// @vitest-environment node
import { beforeAll, afterAll, expect, test, vi } from "vitest";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { verifyMcpJwt } from "./oauth";
const issuer = "https://clerk.example.com";
const audience = "https://reader.example.com/api/mcp";
let keys: Awaited<ReturnType<typeof generateKeyPair>>;
beforeAll(async () => {
  vi.stubEnv("CLERK_JWT_ISSUER_DOMAIN", issuer);
  vi.stubEnv("MCP_RESOURCE_URL", audience);
  keys = await generateKeyPair("RS256");
  const jwk = await exportJWK(keys.publicKey);
  vi.stubGlobal("fetch", async () => Response.json({ keys: [{ ...jwk, kid: "test", alg: "RS256", use: "sig" }] }));
});
afterAll(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
async function token(aud = audience, exp = "5m", scope = "profile", iss = issuer) {
  return new SignJWT({ scope }).setProtectedHeader({ alg: "RS256", kid: "test" })
    .setIssuer(iss).setAudience(aud).setSubject("user_a").setIssuedAt().setExpirationTime(exp).sign(keys.privateKey);
}
test("accepts signed OAuth JWT for the configured resource", async () => {
  expect((await verifyMcpJwt(await token())).sub).toBe("user_a");
});
test("rejects wrong audience, issuer, expired, missing scope and shared secrets", async () => {
  for (const value of [await token("other"), await token(audience, "-1s"), await token(audience, "5m", "email"), await token(audience, "5m", "profile", "https://other.example.com"), "legacy-secret"]) {
    await expect(verifyMcpJwt(value)).rejects.toThrow();
  }
});
