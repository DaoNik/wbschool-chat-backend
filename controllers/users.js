const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuthorizationError = require('../errors/AuthorizationError');
const ValidationError = require('../errors/ValidationError')
const ConflictError = require("../errors/ConflictError");

const { JWT_SECRET = 'secret' } = process.env;

const register = (req, res, next) => {
  const {email, password, username} = req.body;

  bcrypt
    .hash(password, 12)
    .then((hash) => User.create({email, password: hash, username}))
    .then((user) => {
      res.send(user.email);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError('Неверно введены данные для пользователя')
        )
      }
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(
          new ConflictError('Данный пользователь уже зарегистрирован')
        )
      }

      return next(err);
    })
}

const login = (req, res, next) => {
  const {emailOrUser, password} = req.body;
  return User.findOne({emailOrUser})
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthorizationError('Неправильные почта или пароль')
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new AuthorizationError('Неправильные почта или пароль')
        }
        const newUser = user.toObject();
        delete newUser.password;
        const token = jwt.sign({_id: user._id}, JWT_SECRET, {
          expiresIn: '7d'
        })
        return res.send({token, newUser})
      })
    })
    .catch(next);
}

module.exports = {register, login}
