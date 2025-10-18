import { api } from "../api";
import { redirect } from "react-router";
import type { Route } from "./+types/authorize";
import openAILogo from "../assets/openai-logo.png";
import { useAction } from "@gadgetinc/react";
import { Button } from "@/components/ui/button";

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const { session, gadgetConfig } = context;

  const userId = session?.get("user");
  const user = userId ? await context.api.user.findOne(userId) : undefined;

  if (!user) {
    return redirect(gadgetConfig.authentication!.signInPath);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const redirectUri = url.searchParams.get("redirect_uri");

  if (!code || !state || !redirectUri) {
    throw new Error("Missing required OAuth parameters: code, state, or redirect_uri");
  }

  return {
    user,
    oauthParams: {
      code,
      state,
      redirectUri
    }
  };
};

const ChatGPTLogo = () => (
  <div className="flex justify-center mb-8">
    <img src={openAILogo} alt="ChatGPT Logo" className="w-16 h-16" />
  </div>
);

export default function ({ loaderData }: Route.ComponentProps) {
  const { user, oauthParams } = loaderData;
  const [{ fetching: authorizing}, authorize] = useAction(api.user.authorize);

  const handleConsent = async () => {
    try {
      await authorize({id: user.id, code: oauthParams.code});
      const redirectUrl = new URL(oauthParams.redirectUri);
      redirectUrl.searchParams.set("code", oauthParams.code);
      redirectUrl.searchParams.set("state", oauthParams.state);
      
      window.location.href = redirectUrl.toString();
    } catch (error) {
      console.error("Error handling OAuth consent:", error);
    }
  };

  const appName = process.env.GADGET_APP;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <ChatGPTLogo />
          
          <div className="mb-8">
            <h1 className="text-xl font-normal text-gray-900 mb-2">
              <span className="font-semibold">ChatGPT</span> would like to access
            </h1>
            <p className="text-gray-700 text-base">your account and be able to:</p>
          </div>

          <div className="mb-8 text-left">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-green-500"
                >
                  <path
                    d="M13.5 4.5L6 12L2.5 8.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-base text-gray-700">
                Connect to chat-gpt-real-auth's remote MCP server
              </p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-500 leading-relaxed">
              Use of the chat-gpt-real-auth platform is subject to your existing agreement with chat-gpt-real-auth. If you do not have an existing agreement, chat-gpt-real-auth's{" "}
              <a
                href="#"
                className="text-blue-600 hover:underline"
              >
                Terms of Service
              </a>{" "}
              apply. Please note, chat-gpt-real-auth's MCP server is in beta.
            </p>
          </div>

          <Button
            onClick={handleConsent}
            disabled={authorizing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 mb-6 text-base"
          >
            Agree & Allow Access
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Logged in as {user.email || "Unknown User"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
