import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { articleDoc, articleSummary } from "./lib/validators";

export const list = query({
  args: {},
  returns: v.array(articleSummary),
  handler: async (ctx) => {
    const rows = await ctx.db.query("articles").order("desc").take(100);
    return rows.map(
      ({
        _id,
        _creationTime,
        url,
        title,
        author,
        source,
        publishedAt,
        excerpt,
        imageUrl,
        wordCount,
      }) => ({
        _id,
        _creationTime,
        url,
        title,
        author,
        source,
        publishedAt,
        excerpt,
        imageUrl,
        wordCount,
      }),
    );
  },
});

export const get = query({
  args: { id: v.id("articles") },
  returns: v.union(articleDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("articles", args.id);
  },
});

export const getByUrl = query({
  args: { url: v.string() },
  returns: v.union(articleDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();
  },
});

export const save = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    author: v.optional(v.string()),
    source: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    excerpt: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bodyHtml: v.string(),
    wordCount: v.number(),
  },
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("articles")
      .withIndex("by_url", (q) => q.eq("url", args.url))
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

    return await ctx.db.insert("articles", args);
  },
});
