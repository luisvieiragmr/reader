/**
 * Reader MCP server — Streamable HTTP tools for saving articles.
 *
 * Auth is a plain Bearer token (MCP_SECRET). We intentionally do not
 * publish OAuth discovery endpoints so Cursor can send static headers.
 */
import { createMcpHandler } from "mcp-handler";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { listArticlesForMcp, saveArticleForMcp } from "./save";

function bearerMatches(header: string | null, secret: string): boolean {
  if (!header?.startsWith("Bearer ")) {
    return false;
  }
  const token = header.slice("Bearer ".length);
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

/** Build the MCP request handler (tools only — auth is applied in handleMcpRequest). */
export function createReaderMcpHandler() {
  return createMcpHandler(
    (server) => {
      server.registerTool(
        "save_article",
        {
          title: "Save Article",
          description:
            "Fetch a public article URL, extract readable content, and save it to the Reader queue for the configured MCP user.",
          inputSchema: z.object({
            url: z
              .string()
              .describe("Public http(s) URL of the article to save"),
          }),
        },
        async ({ url }) => {
          try {
            const result = await saveArticleForMcp(url);
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
          description:
            "List recent articles in the configured MCP user’s Reader queue.",
          inputSchema: z.object({}),
        },
        async () => {
          try {
            const articles = await listArticlesForMcp();
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

/**
 * HTTP entry: require Authorization: Bearer <MCP_SECRET>, then MCP.
 */
export async function handleMcpRequest(request: Request): Promise<Response> {
  const secret = process.env.MCP_SECRET;
  if (!secret) {
    return new Response("Server misconfigured: MCP_SECRET is not set", {
      status: 500,
    });
  }

  if (!bearerMatches(request.headers.get("authorization"), secret)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Bearer" },
    });
  }

  return mcpHandler(request);
}
