import { getWidgets } from "vite-plugin-chatgpt-widgets";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FastifyRequest } from "fastify";
import path from "path";
import { readFile } from "fs/promises"; // ✅ Added line — ensures widget file reading works
import { processVideo } from "./lib/replit";
import { z } from "zod";

export const createMCPServer = async (
  request: FastifyRequest,
) => {
  const mcpServer = new McpServer({
    name: "chatgpt-todo-list",
    version: "1.0.0",
  });

  // a session-aware API client for multi-tenant reads and writes
  const api = request.api.actAsSession;

  // Get the vite dev server instance from Gadget
  const devServer = await (
    request.server as any
  ).frontendServerManager?.devServerManager?.getServer();

  // Get the HTML snippet for each widget
  const widgets = await getWidgets(
    "web/chatgpt-widgets",
    devServer && process.env["NODE_ENV"] != "production"
      ? { devServer }
      : {
          manifestPath: path.resolve(
            process.cwd(),
            ".gadget/remix-dist/build/client/.vite/manifest.json",
          ),
        },
  );

  // Register each widget's HTML snippet as a resource for exposure to ChatGPT
  for (const widget of widgets) {
    const resourceName = `widget-${widget.name.toLowerCase()}`;
    const resourceUri = `ui://widget/${widget.name}.html`;

    mcpServer.registerResource(
      resourceName,
      resourceUri,
      {
        title: widget.name,
        description: `ChatGPT widget for ${widget.name}`,
      },
      async () => {
        return {
          contents: [
            {
              uri: resourceUri,
              mimeType: "text/html+skybridge",
              text: widget.content,
            },
          ],
        };
      },
    );
  }

  // --- EXISTING TOOL: listTodos (leave untouched) ---
  mcpServer.registerTool(
    "listTodos",
    {
      title: "list todos",
      description: "this will list all of my todos",
      annotations: { readOnlyHint: true },
      _meta: {
        "openai/outputTemplate": "ui://widget/TodoList.html",
        "openai/toolInvocation/invoking": "Prepping your todo items",
        "openai/toolInvocation/invoked": "Here's your todo list",
        "openai/widgetAccessible": true,
      },
    },
    async () => {
      const todos = await api.todo.findMany();

      return {
        structuredContent: { todos },
        content: [
          {
            type: "text",
            text: "The todo list: " + todos.map((todo) => todo.item).join("\n"),
          },
        ],
      };
    },
  );

  // --- ✅ NEW TOOL: clipVideo (connects to Replit backend) ---
  mcpServer.registerTool(
    "clipVideo",
    {
      title: "Clip YouTube Video",
      description:
        "Submits a YouTube video to be processed into viral short clips using AI. IMPORTANT: You MUST ask the user for their email address BEFORE calling this tool. Always confirm the email address with the user first, as they will receive links to view and download their clips via email when processing is complete (typically 5-15 minutes).",
      inputSchema: {
        url: z.string().url().describe("YouTube video URL to clip (e.g., https://www.youtube.com/watch?v=...)"),
        email: z.string().email().describe("Email address to send clip links when processing is complete (REQUIRED - always ask user first)"),
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/VideoClipper.html",
        "openai/toolInvocation/invoking": "Submitting your video for processing...",
        "openai/toolInvocation/invoked": "Video submitted successfully!",
        "openai/widgetAccessible": true,
      },
    },
    async (args) => {
      // args is already validated by inputSchema
      const { url, email } = args;

      const result = await processVideo({ url, email });

      return {
        structuredContent: {
          taskId: result.taskId,
          status: result.status,
          email: email,
          url: url,
          submittedAt: new Date().toISOString(),
        },
        content: [
          {
            type: "text",
            text: `✅ Your video is being clipped into viral shorts!\n\nTask ID: ${result.taskId}\n📧 Results will be emailed to: ${email}\n⏱️ Estimated time: 5-15 minutes\n\nYou'll receive an email with links to view and download your clips when ready.`,
          },
        ],
      };
    },
  );

  // --- INTERNAL AUTH TOOL (leave as is) ---
  mcpServer.registerTool(
    "__getGadgetAuthTokenV1",
    {
      title: "Get the gadget auth token",
      description:
        "Gets the gadget auth token. Should never be called by LLMs or ChatGPT -- only used for internal auth machinery.",
      _meta: {
        "openai/widgetAccessible": true,
      },
    },
    async () => {
      if (!request.headers["authorization"]) {
        return {
          structuredContent: {
            token: null,
            error: "no token found",
          },
          content: [],
        };
      }

      const [scheme, token] = request.headers["authorization"].split(" ", 2);
      if (scheme !== "Bearer") {
        return {
          structuredContent: {
            token: null,
            error: "incorrect token scheme",
          },
          content: [],
        };
      }

      return {
        structuredContent: {
          token,
          scheme,
        },
        content: [],
      };
    },
  );

  return mcpServer;
};