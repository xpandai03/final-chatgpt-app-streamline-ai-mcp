import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "oauth/client" model, go to https://streamlineai.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "oo1XdZpowizI",
  fields: {
    clientId: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "k_8RMl2tq4P2",
    },
    codes: {
      type: "hasMany",
      children: { model: "oauth/code", belongsToField: "client" },
      storageKey: "3r10qPuaQBVN",
    },
    details: {
      type: "json",
      default: {},
      storageKey: "YM5Ej2Nq99Yg",
    },
    issuedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "xWnb2MI1PnNC",
    },
  },
};
