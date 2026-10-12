/**
 * Shared save/list helpers used by the MCP tools.
 * Same extract pipeline as the app; Convex writes use a server secret
 * + configured user id (no Clerk login inside MCP).
 */
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

function getConvex(): ConvexHttpClient {
  return new ConvexHttpClient(requireEnv("NEXT_PUBLIC_CONVEX_URL"));
}

function mcpSecret(): string {
  return requireEnv("MCP_SECRET");
}

export async function saveArticleForMcp(rawUrl: string): Promise<{
  id: string;
  url: string;
  title: string;
}> {
  const extracted = await extractArticle(rawUrl);
  const id = await getConvex().mutation(api.articles.saveFromMcp, {
    secret: mcpSecret(),
    ...extracted,
  });
  return { id, url: extracted.url, title: extracted.title };
}

export async function listArticlesForMcp(): Promise<
  Array<{
    id: string;
    url: string;
    title: string;
    source?: string;
    wordCount: number;
  }>
> {
  const rows = await getConvex().query(api.articles.listFromMcp, {
    secret: mcpSecret(),
  });
  return rows.map((row) => ({
    id: row._id,
    url: row.url,
    title: row.title,
    source: row.source,
    wordCount: row.wordCount,
  }));
}
