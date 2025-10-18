import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "oauth/code" model, go to https://streamlineai.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "1228jRrtyn31",
  fields: {
    challenge: {
      type: "string",
      validations: { required: true },
      storageKey: "OIqsI-A8MXaD",
    },
    challengeMethod: { type: "string", storageKey: "9RAP8v9RZs5R" },
    client: {
      type: "belongsTo",
      validations: { required: true },
      parent: { model: "oauth/client" },
      storageKey: "dTDMyS-lJg0Y",
    },
    code: {
      type: "string",
      validations: { required: true, unique: true },
      storageKey: "SMqnGVn0Whql",
    },
    expiresAt: {
      type: "dateTime",
      includeTime: true,
      validations: { required: true },
      storageKey: "Srf9llpSYDuS",
    },
    redirectUri: {
      type: "string",
      validations: { required: true },
      storageKey: "AeBWPXgc5s6I",
    },
    scope: { type: "string", storageKey: "YdVgkmYgZrci" },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "1228jRrtyn31-BelongsTo-User",
    },
  },
};
