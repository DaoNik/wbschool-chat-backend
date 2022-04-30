const { Schema, model, Types } = require("mongoose");
const validator = require("validator");

const contactsSchema = new Schema(
  {
    contacts: {
      type: [],
      ref: "user",
      required: true,
      default: [],
    },
    owner: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = model("contacts", contactsSchema);
