import { env, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./lib/auth";
import { articleDoc, articleSummary } from "./lib/validators";
import type { Id } from "./_generated/dataModel";

const saveFields = {
  url: v.string(),
  title: v.string(),
  author: v.optional(v.string()),
  source: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  excerpt: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  bodyHtml: v.string(),
  wordCount: v.number(),
};

type SaveFields = {
  url: string;
  title: string;
  author?: string;
  source?: string;
  publishedAt?: number;
  excerpt?: string;
  imageUrl?: string;
  bodyHtml: string;
  wordCount: number;
};

function requireMcpSecret(secret: string): void {
  const expected = env.MCP_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("Unauthorized");
  }
}

function requireMcpUserId(): string {
  const userId = env.MCP_USER_TOKEN_IDENTIFIER;
  if (!userId) {
    throw new Error("MCP_USER_TOKEN_IDENTIFIER is not configured on Convex");
  }
  return userId;
}

async function upsertArticle(
  ctx: MutationCtx,
  userId: string,
  args: SaveFields,
): Promise<Id<"articles">> {
  const existing = await ctx.db
    .query("articles")
    .withIndex("by_user_and_url", (q) =>
      q.eq("userId", userId).eq("url", args.url),
    )
    .unique();

  if (existing) {
    await ctx.db.patch("articles", existing._id, {
      title: args.title,
      author: args.author,
      source: args.source,
      publishedAt: args.publishedAt,
      excerpt: args.excerpt,
      imageUrl: args.imageUrl,
      bodyHtml: args.bodyHtml,
      wordCount: args.wordCount,
    });
    return existing._id;
  }

  return await ctx.db.insert("articles", {
    userId,
    ...args,
  });
}

function toSummary(
  row: {
    _id: Id<"articles">;
    _creationTime: number;
    userId?: string;
    url: string;
    title: string;
    author?: string;
    source?: string;
    publishedAt?: number;
    excerpt?: string;
    imageUrl?: string;
    wordCount: number;
  },
) {
  return {
    _id: row._id,
    _creationTime: row._creationTime,
    userId: row.userId,
    url: row.url,
    title: row.title,
    author: row.author,
    source: row.source,
    publishedAt: row.publishedAt,
    excerpt: row.excerpt,
    imageUrl: row.imageUrl,
    wordCount: row.wordCount,
  };
}

export const list = query({
  args: {},
  returns: v.array(articleSummary),
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("articles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    return rows.map(toSummary);
  },
});

export const get = query({
  args: { id: v.id("articles") },
  returns: v.union(articleDoc, v.null()),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const article = await ctx.db.get("articles", args.id);
    if (!article || article.userId !== userId) {
      return null;
    }
    return article;
  },
});

export const getByUrl = query({
  args: { url: v.string() },
  returns: v.union(articleDoc, v.null()),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("articles")
      .withIndex("by_user_and_url", (q) =>
        q.eq("userId", userId).eq("url", args.url),
      )
      .unique();
  },
});

export const save = mutation({
  args: saveFields,
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await upsertArticle(ctx, userId, args);
  },
});

/** MCP / server-secret save. Attributes to MCP_USER_TOKEN_IDENTIFIER. */
export const saveFromMcp = mutation({
  args: {
    secret: v.string(),
    ...saveFields,
  },
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    requireMcpSecret(args.secret);
    const userId = requireMcpUserId();
    const { secret, ...fields } = args;
    void secret;
    return await upsertArticle(ctx, userId, fields);
  },
});

/** MCP / server-secret list for the configured user. */
export const listFromMcp = query({
  args: { secret: v.string() },
  returns: v.array(articleSummary),
  handler: async (ctx, args) => {
    requireMcpSecret(args.secret);
    const userId = requireMcpUserId();
    const rows = await ctx.db
      .query("articles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    return rows.map(toSummary);
  },
});
