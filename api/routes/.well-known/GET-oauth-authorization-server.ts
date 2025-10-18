import { RouteHandler, Config } from "gadget-server";

/**
 * Route handler for GET .well-known/oauth-authorization-server
 *
 * See: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route: RouteHandler = async ({ request, reply, api, logger, connections }) => {
  await reply.status(200).send({
    issuer: Config.appUrl,
    authorization_endpoint: (new URL("/oauth/start", Config.appUrl)).toString(),
    token_endpoint: (new URL("/oauth/token", Config.appUrl)).toString(),
    jwks_uri: (new URL("/oauth/jwks.json", Config.appUrl)).toString(),
    registration_endpoint: (new URL("/oauth/register", Config.appUrl)).toString(),
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"]
  });
};

export default route;
