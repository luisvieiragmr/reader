import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { auth } from "@clerk/nextjs/server";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { z } from "zod";
import { listArticlesForMcp, saveArticleForMcp } from "./save";
import { getMcpConfig, verifyMcpJwt } from "./oauth";

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
    if (!token) return undefined;
    try {
      await verifyMcpJwt(token);
      return verifyClerkToken(await auth({ acceptsToken: "oauth_token" }), token);
    } catch {
      return undefined;
    }
  }, {
    required: true,
    requiredScopes: ["profile"],
    resourceUrl: new URL(resource).origin,
    resourceMetadataPath: "/.well-known/oauth-protected-resource/api/mcp",
  })(request);
}
