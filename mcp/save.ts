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
    url: row.url,
    title: row.title,
    source: row.source,
    wordCount: row.wordCount,
  }));
}
