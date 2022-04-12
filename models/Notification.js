const {Schema, model} = require('mongoose');
const validator = require('validator');

const notificationSchema = new Schema({
  expiresIn: {
    type: Date,
    validate: {
      validator: (v) => validator.isDate(v)
    }
  },
  text: {
    type: String,
    require: true,
    maxLength: 300
  }
})

module.exports = model('notification', notificationSchema);