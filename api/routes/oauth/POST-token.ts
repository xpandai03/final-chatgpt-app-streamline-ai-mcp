import { RouteHandler, Config } from "gadget-server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * Route handler for POST oauth/token
 *
 * See: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route: RouteHandler<{
  Body: {
    grant_type: string;
    code: string;
    redirect_uri: string;
    code_verifier: string;
  };
}> = async ({ request, reply, api, logger, connections, session }) => {
  const { grant_type, code: oauthCode, redirect_uri, code_verifier } = request.body;

  if (grant_type !== "authorization_code") {
    await reply.code(400).send({ error: "unsupported_grant_type" });
    return;
  }

  const code = await api.oauth.code.findByCode(oauthCode);

  if (!code || !code.userId) return reply.code(400).send({ error: "invalid_grant" });
  if (!code.expiresAt || code.expiresAt < new Date())
    return await reply.code(400).send({ error: "expired_code" });
  if (code.redirectUri !== redirect_uri)
    return await reply.code(400).send({ error: "invalid_redirect_uri" });

  const expected = crypto
    .createHash("sha256")
    .update(code_verifier)
    .digest("base64url");
  if (expected !== code.challenge)
    return await reply.code(400).send({ error: "invalid_code_verifier" });

  let sessionRecord: any;
  if (!session || !session.id) {
    sessionRecord = await api.internal.session.create({
      user: { _link: code.userId },
    });
  } else {
    sessionRecord = await api.internal.session.update(session.id, {
      user: { _link: code.userId },
    });
  }

  const accessToken = jwt.sign(
    {
      aud: Config.primaryDomain,
      sub: sessionRecord.id,
    },
    process.env.GADGET_ENVIRONMENT_JWT_SIGNING_KEY
  );

  await reply.status(200).send({
    access_token: accessToken,
    token_type: "Bearer",
    scope: code.scope,
  });
};

export default route;
