const {Schema, model, Types} = require('mongoose');
const validator = require('validator');

const notificationSchema = new Schema({
  expiresIn: {
    type: Date,
    validate: {
      validator: (v) => validator.isDate(v)
    }
  },
  owner: {
    type: Types.ObjectId,
    ref: 'user',
    required: true
  },
  text: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 300
  }
})

module.exports = model('notification', notificationSchema);