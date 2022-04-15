const { Schema, model, Types } = require('mongoose');
const  validator = require('validator');

const chatSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
    maxLength: 40
  },
  avatar: {
    type: String,
    validate: {
      validator: (value) => validator.isBase64(value)
    }
  },
  about: {
    type: String,
    minLength: 4,
    maxLength: 100,
    default: 'Чат для мемного общения'
  },
  isNotifications: {
    type: Boolean,
    default: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  users: {
    type: [Types.ObjectId],
    required: true,
    ref: 'user',
    default: []
  },
  owner: {
    type: Types.ObjectId,
    ref: 'user',
    required: true
  },
})

module.exports = model('chat', chatSchema);
