// @vitest-environment node
import { expect, test, vi } from "vitest";
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
import { createReaderMcpHandler } from "./create-handler";
test("authenticated protocol initialization and tool discovery", async () => {
 const handler = createReaderMcpHandler();
 for (const [method, params] of [["initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" } }], ["tools/list", {}]] as const) {
  const req = new Request("https://reader.example.com/api/mcp", {method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json, text/event-stream"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})});
  req.auth = {token:"test",clientId:"test",scopes:["profile"]};
  const response = await handler(req);
  const body = await response.text();
  expect(response.status, body).toBe(200);
  expect(body).not.toContain('"error":');
  if (method === "tools/list") { expect(body).toContain('save_article'); expect(body).toContain('list_articles'); }
 }
});
