const { Schema, model, Types } = require("mongoose");
const validator = require("validator");

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 100,
      minLength: 4
    },
    description: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 200,
    },
    content: {
      type: String,
      required: true,
      minLength: 10,
    },
    dateCreate: {
      type: String,
      required: true,
    },
    dateUpdate: {
      type: String,
      required: true,
    },
    authors: {
      type: [String],
      required: true,
      default: [],
    },
    respondents: {
      type: [String],
      required: true,
      default: [
        "я не я, жопа не моя)",
      ],
    },
    tags: {
      type: [String],
      required: true,
      default: [],
    },
    category: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 100,
    }
  },
  { versionKey: false }
);

module.exports = model('article', articleSchema);