import type { RouteHandler } from "gadget-server";
import { createMCPServer } from "../../mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

/**
 * GET /mcp — opens the MCP SSE stream (discovery/handshake).
 */
const route: RouteHandler = async ({ request, reply }) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless OK
    enableJsonResponse: true,
  });

  const server = await createMCPServer(request);

  // Prevent Fastify from sending its own response
  reply.hijack();

  try {
    await server.connect(transport);
    await transport.handleRequest(request.raw, reply.raw);
  } catch (error) {
    console.error("Failed to start StreamableHTTPServerTransport session", error);
    if (!reply.raw.headersSent) {
      reply.raw.writeHead(500, { "Content-Type": "text/plain" });
      reply.raw.end("Failed to establish MCP stream");
    }
  }
};

export default route;