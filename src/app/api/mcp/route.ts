import { handleMcpRequest } from "../../../../mcp/create-handler";

/** Article extract + save can exceed the default serverless budget. */
export const maxDuration = 60;

export async function GET(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}
