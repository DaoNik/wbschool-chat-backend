const { model, Schema, Types } = require("mongoose");
const validator = require("validator");

const messageSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxLength: 1000,
    },
    imageOrFile: {
      type: String,
      validate: {
        validator: (value) => validator.isBase64(value),
      },
    },
    formatImage: {
      type: String,
      minLength: 10,
      maxLength: 50,
    },
    // voice: {
    //   type: Blob,
    //   validate: {
    //     validator:(value) => validator.isBlob(value),
    //   },
    // },
    expiresIn: {
      type: Date,
      validate: {
        validator: (v) => validator.isDate(v),
      },
    },
    owner: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    chatId: {
      type: Types.ObjectId,
      ref: "chat",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = model("message", messageSchema);
