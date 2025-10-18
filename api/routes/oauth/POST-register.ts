import { RouteHandler } from "gadget-server";
import { nanoid } from "nanoid";

/**
 * Route handler for POST oauth/register
 *
 * See: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route: RouteHandler<{
  Body: {
    client_name: string;
    redirect_uris: string[];
    grant_types: string[];
    response_types: string[];
    token_endpoint_auth_method: string;
  }
}> = async ({ request, reply, api, logger, connections }) => {
  const { client_name, redirect_uris, grant_types, response_types, token_endpoint_auth_method } = request.body;

  if (!client_name || !redirect_uris || !grant_types || !response_types || !token_endpoint_auth_method) {
    await reply.status(400).send({ error: "invalid dynamic client registration" });
    return;
  }

  const clientId = nanoid(24);
  const issuedAt = new Date();

  const client = await api.internal.oauth.client.create({
    clientId,
    issuedAt,
    details: {
      client_name,
      redirect_uris,
      grant_types,
      response_types,
      token_endpoint_auth_method
    }
  });

  await reply.status(200).send({
    client_id: clientId,
    client_id_issued_at: Math.floor(issuedAt.getTime() / 1000),
    redirect_uris,
    grant_types,
    response_types,
    token_endpoint_auth_method,
  });
}

export default route;
