# ChatGPT App SDK template

This guide walks you through setting up an app in ChatGPT.

This template handles OAuth and MCP server setup. You just need to build your widgets and define your resource and tool calls.

## Requirements

- An OpenAI Pro or Plus account

## Set up connection in ChatGPT

To get started in ChatGPT:

1. [Enable developer mode and create a new connection in ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt#enable-the-connector-in-a-conversation)
2. Give your app a name, and enter your app's URL
  - It will be of the format: `https://<your-gadget-app-name>--<your-environment>.gadget.app/mcp`
  - For example: `https://chatgpt-todos--development.gadget.app/mcp`
3. Once your app is created, the included listTodos action should be registered. Open a new chat, add your app, and ask something like "Show me my todos". ChatGPT should use a tool call to display the todo list.

## Template overview

This template includes:

- OAuth 2.1 routes and required data models
  - `api/routes/.well-known/*`
  - `api/routes/oauth/*`
  - `api/models/oauth/*`
  - `api/models/user`
- MCP server setup and endpoints
  - `api/mcp.ts`
  - `api/routes/mcp/*`
- A sample widget
  - `web/chatgpt-widgets/TodoList.tsx`

Once OAuth is complete, ChatGPT will open a connection to your MCP server through `GET /mcp` and perform action discovery. Additional tool calls will be made through `POST /mcp`.

The Gadget API client is used to create new todos, and mark existing todos as complete. A `Provider` from `@gadgetinc/react-chatgpt-apps` is set up in `web/chatgpt-widgets/root.tsx`.
This Provider makes the `__getGadgetAuthTokenV1` tool call to fetch the required OAuth token from ChatGPT, then adds that token as an `Authorization: Bearer` header to requests made using the API client.
This enables authenticated API requests from within the ChatGPT iframe without making tool calls (and is much faster than making tool calls to run backend logic)!

Note: Soon, this template will be updated to support React components!

## Resources

- [OpenAI's Apps SDK](https://developers.openai.com/apps-sdk)
- [MCP docs](https://modelcontextprotocol.io/docs/getting-started/intro)
- [Gadget documentation](https://docs.gadget.dev/)

Happy building!
