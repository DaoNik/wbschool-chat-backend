const { Schema, model, Types } = require("mongoose");
const validator = require("validator");

const threadSchema = new Schema(
  {
    owner: {
      type: Types.ObjectId,
      ref: "message",
      required: true,
    },
    formatImage: {
      type: String,
      minLength: 10,
      maxLength: 50,
      default: "data:image/png;base64,",
    },
    avatar: {
      type: String,
      validate: {
        validator: (value) => validator.isBase64(value),
      },
    },
    comments: {
      type: [
        {
          authorId: {
            type: Types.ObjectId,
            ref: "user",
            required: true,
          },
          authorName: {
            type: String,
            required: true,
          },
          date: {
            type: String,
            required: true,
          },
          text: {
            type: String,
            required: true,
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
        },
      ],
      required: true,
      default: [],
    },
  },
  { versionKey: false }
);

module.exports = model("thread", threadSchema);
