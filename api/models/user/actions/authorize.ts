import { applyParams, save, ActionOptions } from "gadget-server";

export const run: ActionRun = async ({ params, record, logger, api, connections }) => {
  const code = params.code && await api.oauth.code.findByCode(params.code);

  if (!code) {
    throw new Error("cannot authorize without a code");
  }

  await api.internal.oauth.code.update(code.id, { code: { user: { _link: record.id } } });
};

export const options: ActionOptions = {
  actionType: "custom",
};

export const params = {
  code: { type: "string" }
};
