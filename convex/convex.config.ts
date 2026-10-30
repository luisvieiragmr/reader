import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    CLERK_JWT_ISSUER_DOMAIN: v.string(),
    MCP_RESOURCE_URL: v.optional(v.string()),
  },
});

export default app;
