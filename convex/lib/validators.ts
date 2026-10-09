import { v } from "convex/values";

export const articleDoc = v.object({
  _id: v.id("articles"),
  _creationTime: v.number(),
  url: v.string(),
  title: v.string(),
  author: v.optional(v.string()),
  source: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  excerpt: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  bodyHtml: v.string(),
  wordCount: v.number(),
});

export const articleSummary = v.object({
  _id: v.id("articles"),
  _creationTime: v.number(),
  url: v.string(),
  title: v.string(),
  author: v.optional(v.string()),
  source: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  excerpt: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  wordCount: v.number(),
});
