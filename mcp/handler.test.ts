// @vitest-environment node
import { beforeEach, afterEach, expect, test, vi } from "vitest";
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("./save", () => ({ listArticlesForMcp: vi.fn(async () => []), saveArticleForMcp: vi.fn() }));
import { handleMcpRequest } from "./create-handler";
import { GET } from "../src/app/.well-known/oauth-protected-resource/api/mcp/route";
beforeEach(() => {
  vi.stubEnv("CLERK_JWT_ISSUER_DOMAIN", "https://clerk.example.com");
  vi.stubEnv("MCP_RESOURCE_URL", "https://reader.example.com/api/mcp");
});
afterEach(() => vi.unstubAllEnvs());
test("unauthenticated MCP requests advertise the public discovery endpoint", async () => {
  const response = await handleMcpRequest(new Request("https://reader.example.com/api/mcp", { method: "POST" }));
  expect(response.status).toBe(401);
  expect(response.headers.get("www-authenticate")).toContain("https://reader.example.com/.well-known/oauth-protected-resource/api/mcp");
});
test("metadata uses the configured canonical resource and issuer", async () => {
  const response = GET();
  expect(await response.json()).toMatchObject({ resource: "https://reader.example.com/api/mcp", authorization_servers: ["https://clerk.example.com"], scopes_supported: ["profile"] });
  expect(response.headers.get("access-control-allow-origin")).toBe("*");
});
