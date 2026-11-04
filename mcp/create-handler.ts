import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { auth } from "@clerk/nextjs/server";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { z } from "zod";
import { listArticlesForMcp, saveArticleForMcp, saveTextArticleForMcp } from "./save";
import { getMcpConfig, verifyMcpJwt } from "./oauth";
import { authFailureReason } from "./auth-diagnostics";

/** Build the MCP request handler (tools only — auth is applied in handleMcpRequest). */
export function createReaderMcpHandler() {
  return createMcpHandler(
    (server) => {
      server.registerTool(
        "save_article",
        {
          title: "Save Article",
          _meta: { securitySchemes: [{ type: "oauth2", scopes: ["profile"] }] },
          description:
            "Fetch a public article URL, extract readable content, and save it to the Reader queue for the authenticated user.",
          inputSchema: z.object({
            url: z
              .string()
              .describe("Public http(s) URL of the article to save"),
          }),
        },
        async ({ url }, { http }) => {
          try {
            const result = await saveArticleForMcp(url, http!.authInfo!.token);
            return {
              content: [
                {
                  type: "text" as const,
                  text: `Saved “${result.title}” (${result.id})\n${result.url}`,
                },
              ],
            };
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Could not save article.";
            return {
              content: [{ type: "text" as const, text: message }],
              isError: true,
            };
          }
        },
      );

      server.registerTool(
        "save_text_article",
        {
          title: "Save Article from Text",
          description: "Save an article directly to the signed-in user's Reader queue. When asked to turn a conversation into an article, compose the article from the conversation and pass its title and finished plain-text body. No public URL is needed.",
          _meta: { securitySchemes: [{ type: "oauth2", scopes: ["profile"] }] },
          inputSchema: z.object({
            title: z.string().trim().min(1).max(500),
            content: z.string().trim().min(1).max(100_000).describe("Plain text, with blank lines between paragraphs."),
            source: z.string().trim().min(1).max(500).optional().describe("Source label. Defaults to ChatGPT."),
          }),
        },
        async (article, { http }) => {
          try {
            const { url } = await saveTextArticleForMcp(article, http!.authInfo!.token);
            return { content: [{ type: "text", text: `Saved “${article.title}”\n${url}` }] };
          } catch (error) {
            return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "Could not save article." }] };
          }
        },
      );

      server.registerTool(
        "list_articles",
        {
          title: "List Articles",
          _meta: { securitySchemes: [{ type: "oauth2", scopes: ["profile"] }] },
          description:
            "List recent articles in the authenticated user’s Reader queue.",
          inputSchema: z.object({}),
        },
        async (_args, { http }) => {
          try {
            const articles = await listArticlesForMcp(http!.authInfo!.token);
            return {
              content: [
                {
                  type: "text" as const,
                  text:
                    articles.length === 0
                      ? "No articles yet."
                      : JSON.stringify(articles, null, 2),
                },
              ],
            };
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Could not list articles.";
            return {
              content: [{ type: "text" as const, text: message }],
              isError: true,
            };
          }
        },
      );
    },
    {
      serverInfo: {
        name: "reader",
        version: "1.0.0",
      },
    },
  );
}

const mcpHandler = createReaderMcpHandler();

/** Require a Clerk OAuth token minted for this MCP resource. */
export async function handleMcpRequest(request: Request): Promise<Response> {
  const { resource } = getMcpConfig();
  return withMcpAuth(mcpHandler, async (_, token) => {
    if (!token) {
      console.info("[reader-mcp] auth: missing_bearer_token");
      return undefined;
    }
    try {
      await verifyMcpJwt(token);
    } catch (error) {
      console.warn("[reader-mcp] auth:", authFailureReason(error));
      return undefined;
    }
    try {
      const verified = verifyClerkToken(await auth({ acceptsToken: "oauth_token" }), token);
      if (!verified) console.warn("[reader-mcp] auth: clerk_rejected_token");
      return verified;
    } catch {
      console.warn("[reader-mcp] auth: clerk_verification_failed");
      return undefined;
    }
  }, {
    required: true,
    requiredScopes: ["profile"],
    resourceUrl: new URL(resource).origin,
    resourceMetadataPath: "/.well-known/oauth-protected-resource/api/mcp",
  })(request);
}
