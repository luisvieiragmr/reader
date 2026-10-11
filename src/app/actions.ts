"use server";

import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { extractArticle } from "@/lib/extract-article";
import type { Id } from "../../convex/_generated/dataModel";

async function getAuthedConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is missing. Run `npx convex dev` and reload.",
    );
  }

  const session = await auth();
  if (!session.userId) {
    throw new Error("Sign in to save articles.");
  }

  // Prefer the Convex JWT template; fall back to the session token when the
  // Clerk Convex integration sets aud=convex on the default session JWT.
  const token =
    (await session.getToken({ template: "convex" })) ??
    (await session.getToken());
  if (!token) {
    throw new Error(
      'Missing Convex auth token. In Clerk, create a JWT template named "convex" (or enable the Convex integration), then try again.',
    );
  }

  const client = new ConvexHttpClient(url);
  client.setAuth(token);
  return client;
}

export async function saveArticleAction(
  rawUrl: string,
): Promise<{ id: Id<"articles"> } | { error: string }> {
  try {
    const extracted = await extractArticle(rawUrl);
    const convex = await getAuthedConvex();
    const id = await convex.mutation(api.articles.save, extracted);
    return { id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save that article.";
    return { error: message };
  }
}
