import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "todo" model, go to https://streamlineai.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "WghaweJCTqtL",
  fields: {
    isComplete: {
      type: "boolean",
      default: false,
      storageKey: "rqcQGak0oe5-",
    },
    item: { type: "string", storageKey: "OmHSq7xAfaed" },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "WghaweJCTqtL-BelongsTo-User",
    },
  },
};
