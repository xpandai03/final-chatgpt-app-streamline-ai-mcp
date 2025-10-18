import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://streamlineai.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-AppAuth-User",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "TNQ-VgtqIB7h",
    },
    emailVerificationToken: {
      type: "string",
      storageKey: "bHfxtFns7plD",
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "8_tKKazwv7Pa",
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey: "RCAw0RNo11-C",
    },
    firstName: { type: "string", storageKey: "7nMxxoQLgmJD" },
    googleImageUrl: { type: "url", storageKey: "szh2kC85Pl-Z" },
    googleProfileId: { type: "string", storageKey: "LRk74VJJEhe6" },
    lastName: { type: "string", storageKey: "oBl1nVQ7ZKuy" },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "XU7-2WY1oqYo",
    },
    password: {
      type: "password",
      validations: { strongPassword: true },
      storageKey: "bdOosmdRYA5o",
    },
    profilePicture: {
      type: "file",
      allowPublicAccess: true,
      storageKey: "zrmFedMvbbct",
    },
    resetPasswordToken: {
      type: "string",
      storageKey: "U5jFeH-uSs6d",
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "LhAmCgryckzH",
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "vB2gE2a5wOR-",
    },
  },
};
