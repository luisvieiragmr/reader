import { createHash } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { extractArticle } from "../src/lib/extract-article";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function getConvex(token: string): ConvexHttpClient {
  const client = new ConvexHttpClient(requireEnv("NEXT_PUBLIC_CONVEX_URL"));
  client.setAuth(token);
  return client;
}

export async function saveArticleForMcp(rawUrl: string, token: string): Promise<{
  id: string;
  url: string;
  title: string;
}> {
  const extracted = await extractArticle(rawUrl);
  const id = await getConvex(token).mutation(api.articles.save, {
    ...extracted,
  });
  return { id, url: extracted.url, title: extracted.title };
}

function readerUrl(id: string) {
  return new URL(`/read/${id}`, requireEnv("MCP_RESOURCE_URL")).href;
}

export async function saveTextArticleForMcp(
  { title, content, source = "ChatGPT" }: { title: string; content: string; source?: string },
  token: string,
) {
  const text = content.replace(/\r\n?/g, "\n");
  // The per-user URL index also makes retrying the same text save idempotent.
  const key = createHash("sha256").update(JSON.stringify([title, text, source])).digest("hex");
  const escaped = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const bodyHtml = escaped.split(/\n[ \t]*\n+/).map(p => `<p>${p.replaceAll("\n", "<br>")}</p>`).join("");
  const id = await getConvex(token).mutation(api.articles.save, {
    url: `urn:reader:text:${key}`, title, source, bodyHtml,
    excerpt: text.slice(0, 240), wordCount: text.split(/\s+/).length,
  });
  return { id, url: readerUrl(id) };
}

export async function listArticlesForMcp(token: string): Promise<
  Array<{
    id: string;
    url: string;
    title: string;
    source?: string;
    wordCount: number;
  }>
> {
  const rows = await getConvex(token).query(api.articles.list, {});
  return rows.map((row) => ({
    id: row._id,
    url: row.url.startsWith("urn:reader:text:") ? readerUrl(row._id) : row.url,
    title: row.title,
    source: row.source,
    wordCount: row.wordCount,
  }));
}
