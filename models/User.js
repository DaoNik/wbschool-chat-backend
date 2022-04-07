const { Schema, model } = require('mongoose');
const validator = require('validator');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value)
    }
  },
  password: {
    type: String,
    required: true,
    select: false,
    minLength: 8,
    maxLength: 100
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
    maxLength: 30
  },
  userRights: {
    type: String,
    default: 'basic'
  },
  avatar: {
    type: String,
    validate: {
      validator: (value) => validator.isBase64(value)
    },
    default: 'PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjRTRDRjBFIi8+CjxjaXJjbGUgY3g9IjM0IiBjeT0iMjkiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI2NyIgY3k9IjI5IiByPSIxMCIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMzMuNSIgY3k9IjI4LjUiIHI9IjIuNSIgZmlsbD0iIzExMTExMSIvPgo8Y2lyY2xlIGN4PSI2Ni41IiBjeT0iMjguNSIgcj0iMi41IiBmaWxsPSIjMTExMTExIi8+CjxwYXRoIGQ9Ik03OCA2OUM1Ni4yMDE4IDkyLjU0NDMgMzIuOTE3NCA3OC44MTAxIDI0IDY5IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjMiLz4KPC9zdmc+Cg=='
  }
})

module.exports = model('user', userSchema);
