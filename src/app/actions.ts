"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { extractArticle } from "@/lib/extract-article";
import type { Id } from "../../convex/_generated/dataModel";

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is missing. Run `npx convex dev` and reload.",
    );
  }
  return new ConvexHttpClient(url);
}

export async function saveArticleAction(
  rawUrl: string,
): Promise<{ id: Id<"articles"> } | { error: string }> {
  try {
    const extracted = await extractArticle(rawUrl);
    const convex = getConvex();
    const id = await convex.mutation(api.articles.save, extracted);
    return { id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save that article.";
    return { error: message };
  }
}
