import { defineConfig } from "vite";
import { gadget } from "gadget-server/vite";
import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { chatGPTWidgetPlugin } from "vite-plugin-chatgpt-widgets";

export default defineConfig({
  plugins: [
    gadget(),
    reactRouter(),
    // mount the chatGPTWidgetPlugin to your Vite config
    chatGPTWidgetPlugin({
      baseUrl: process.env["GADGET_APP_URL"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./web"),
    },
  },
  server: {
    cors: {
      // ensure both the Gadget app and the ChatGPT web sandbox can access your widgets source code cross-origin
      origin: true,
    },
  },
});