import { metadataCorsOptionsRequestHandler } from "@clerk/mcp-tools/next";
import { getMcpConfig } from "../../../../../../mcp/oauth";

export function GET() {
  const { issuer, resource } = getMcpConfig();
  return Response.json({
    resource,
    authorization_servers: [issuer],
    scopes_supported: ["profile"],
    bearer_methods_supported: ["header"],
  }, { headers: { "Access-Control-Allow-Origin": "*" } });
}
export const OPTIONS = metadataCorsOptionsRequestHandler();
