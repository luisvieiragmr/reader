import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    url: v.string(),
    title: v.string(),
    author: v.optional(v.string()),
    source: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    excerpt: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    bodyHtml: v.string(),
    wordCount: v.number(),
  }).index("by_url", ["url"]),
});
