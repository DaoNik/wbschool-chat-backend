const { model, Schema, Types } = require('mongoose');
const validator = require('validator');

const messageSchema = new Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
    maxLength: 1000
  },
  imageOrFile: {
    type: String,
    validate: {
      validator: (value) => validator.isBase64(value)
    }
  },
  owner: {
    type: Types.ObjectId,
    ref: 'user',
    required: true
  }
})

module.exports = model('message', messageSchema);
