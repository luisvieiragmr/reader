import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    // Bearer shared with the Next MCP route (Authorization: Bearer …).
    // Optional so the app still runs before MCP is configured.
    MCP_SECRET: v.optional(v.string()),
    // Clerk tokenIdentifier for the user who owns MCP-saved articles.
    MCP_USER_TOKEN_IDENTIFIER: v.optional(v.string()),
  },
});

export default app;
