/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test, vi } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";
const modules = import.meta.glob("./**/*.ts");
const article = { url: "https://example.com/article", title: "Article", bodyHtml: "<p>Hi</p>", wordCount: 1 };

describe("per-user article authorization", () => {
  test("OAuth and web identities share a queue; other users cannot read or overwrite it", async () => {
    const t = convexTest(schema, modules);
    const identity = { issuer: "https://clerk.example.com", subject: "user_a", tokenIdentifier: "https://clerk.example.com|user_a" };
    const web = t.withIdentity({ ...identity, aud: "convex" });
    const oauth = t.withIdentity({ ...identity, aud: "https://reader.example.com/api/mcp", scope: "profile" });
    const other = t.withIdentity({ issuer: identity.issuer, subject: "user_b", tokenIdentifier: `${identity.issuer}|user_b` });
    const id = await web.mutation(api.articles.save, article);
    expect((await oauth.query(api.articles.list, {}))[0]._id).toBe(id);
    expect(await other.query(api.articles.list, {})).toEqual([]);
    expect(await other.query(api.articles.get, { id })).toBeNull();
    expect(await other.query(api.articles.getByUrl, { url: article.url })).toBeNull();
    const otherId = await other.mutation(api.articles.save, { ...article, title: "Other" });
    expect(otherId).not.toBe(id);
    expect((await web.query(api.articles.get, { id }))?.title).toBe("Article");
    await oauth.mutation(api.articles.save, { ...article, title: "Updated" });
    expect((await web.query(api.articles.get, { id }))?.title).toBe("Updated");
  });
  test("anonymous access and user-ID impersonation are rejected", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.articles.list, {})).rejects.toThrow("Not authenticated");
    await expect(t.mutation(api.articles.save, article)).rejects.toThrow("Not authenticated");
    const user = t.withIdentity({ subject: "user_a" });
    // The public API must not accept a caller-selected owner.
    // @ts-expect-error Deliberately invalid caller-supplied ownership.
    await expect(user.mutation(api.articles.save, { ...article, userId: "user_b" })).rejects.toThrow();
  });
});

test("Convex rejects MCP tokens lacking the queue scope", async () => {
  vi.stubEnv("MCP_RESOURCE_URL", "https://reader.example.com/api/mcp");
  try {
    const t = convexTest(schema, modules).withIdentity({ subject: "user_a", aud: "https://reader.example.com/api/mcp", scope: "email" });
    await expect(t.query(api.articles.list, {})).rejects.toThrow("Missing MCP scope");
    await expect(t.mutation(api.articles.save, article)).rejects.toThrow("Missing MCP scope");
  } finally { vi.unstubAllEnvs(); }
});
