import { RouteHandler, Config } from "gadget-server";

/**
 * Route handler for GET .well-known/oauth-protected-resource
 *
 * See: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route: RouteHandler = async ({ request, reply, api, logger, connections }) => {
  await reply.status(200).send({
    resource: Config.appUrl,
    authorization_servers: [Config.appUrl],
    scopes_supported: ["user"] ,
    bearer_methods_supported: ["header"]
  });
};

export default route;
