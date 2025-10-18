import { RouteHandler } from "gadget-server";
import crypto from "crypto";

/**
 * Route handler for GET oauth/
 *
 * @type { RouteHandler } route handler - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route: RouteHandler<{
  Querystring: {
    client_id: string;
    code_challenge: string;
    code_challenge_method: string;
    redirect_uri: string;
    state: string;
    response_type: string;
    scope: string;
  };
}> = async ({ request, reply, api, logger, connections, session }) => {
  const { scope, client_id, code_challenge, code_challenge_method, response_type, redirect_uri, state } = request.query;

  if (response_type !== "code") {
    await reply.code(400).send("invalid response_type");
  }

  const client = client_id && await api.oauth.client.findByClientId(client_id);

  if (!client) {
    await reply.code(400).send("unknown client_id");
    return;
  }

  const allowedRedirects = (client.details as any)?.redirect_uris ?? [];

  if (!allowedRedirects.includes(redirect_uri)) {
    await reply.code(400).send("invalid redirect_uri");
    return;
  }

  if (code_challenge_method !== "S256" || !code_challenge) {
    await reply.code(400).send("missing PKCE parameters");
    return;
  }

  const code = crypto.randomBytes(32).toString('hex');

  await api.internal.oauth.code.create({
    code: {
      code,
      client: { _link: client.id },
      redirectUri: redirect_uri,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      challenge: code_challenge,
      challengeMethod: code_challenge_method,
      scope,
    }
  });

  const userId = session?.get("user");
  const user = userId && await api.internal.user.findOne(userId);

  const queryString = `code=${code}&state=${state}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

  if (!user) {
    const redirectTo = encodeURIComponent(`/authorize?${queryString}`);
    await reply.redirect(`/sign-in?redirectTo=${redirectTo}`);
    return;
  }

  await reply.redirect(`/authorize?${queryString}`);
};

export default route;
