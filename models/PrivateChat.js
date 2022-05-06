const { Schema, model, Types } = require("mongoose");
const validator = require("validator");

const privateChatSchema = new Schema(
  {
    isNotifications: {
      type: Boolean,
      default: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    users: {
      type: [Types.ObjectId],
      required: true,
      ref: "user",
      default: [],
    },
    usernames: {
      type: [],
      required: true,
      default: [],
    },
    avatars: {
      type: [],
      default: [],
    },
    owners: {
      type: [Types.ObjectId],
      ref: "user",
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = model("privateChat", privateChatSchema);
