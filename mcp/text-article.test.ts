// @vitest-environment node
import { expect, test, vi } from "vitest";
const { setAuth, mutation } = vi.hoisted(() => ({
  setAuth: vi.fn(),
  mutation: vi.fn(async () => "saved-id"),
}));
vi.mock("convex/browser", () => ({
  ConvexHttpClient: class { setAuth = setAuth; mutation = mutation; },
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
import { createReaderMcpHandler } from "./create-handler";

test("saving conversation text forwards identity, escapes markup and returns the private Reader link", async () => {
  vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://test.convex.cloud");
  vi.stubEnv("MCP_RESOURCE_URL", "https://reader.example.com/api/mcp");
  try {
    const request = new Request("https://reader.example.com/api/mcp", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: {
        name: "save_text_article", arguments: { title: "An idea", content: "First line.\n\n<script>alert(1)</script>" },
      } }),
    });
    request.auth = { token: "user-access-token", clientId: "client", scopes: ["profile"] };
    const response = await createReaderMcpHandler()(request);
    expect(await response.text()).toContain("https://reader.example.com/read/saved-id");
    expect(setAuth).toHaveBeenCalledWith("user-access-token");
    expect(mutation).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      title: "An idea", source: "ChatGPT", bodyHtml: "<p>First line.</p><p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
      url: expect.stringMatching(/^urn:reader:text:[a-f0-9]{64}$/),
    }));
  } finally {
    vi.unstubAllEnvs();
  }
});
