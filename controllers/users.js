const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contacts = require('../models/Contacts')
const AuthorizationError = require('../errors/AuthorizationError');
const ValidationError = require('../errors/ValidationError')
const ConflictError = require("../errors/ConflictError");
const NotFoundError = require("../errors/NotFoundError");
const AllowsError = require("../errors/AllowsError");

const { JWT_SECRET = 'secret' } = process.env;

const register = (req, res, next) => {
  const {email, password, username} = req.body;

  bcrypt
    .hash(password, 12)
    .then((hash) => User.create({email, password: hash, username}))
    .then((user) => {
      const email = user.email;
      Contacts.create({contacts: [], owner: user._id})
        .then(() => (console.log('У тебя есть контакты')));
      res.send({email});
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
  const isEmail = emailOrUser.includes('@');

  function fnEmailOrUser() {
    if (isEmail) {
      return {email: emailOrUser};
    } else {
      return {username: emailOrUser};
    }
  }

  return User.findOne( fnEmailOrUser() )
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

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(next)
}

const getUserData = (req, res, next) => {
  const { username } = req.query;
  User.findOne({username})
    .then(user => {
      if (!user) {
        throw new NotFoundError('Нет такого пользователя')
      }
      if(user.contact )
      res.send(user);
    })
    .catch(next)
}

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id')
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Невалидный id пользователя'))
      }
      if (err.name === 'NotFoundError') {
        return next(new NotFoundError('Неверный идентификатор пользоватлея'))
      }
      return next(err);
    })
}

const deleteUser = (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  User.findById(id)
    .select('+password')
    .then(user => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      if (id !== req.user._id) {
        throw new AllowsError('Вы не можете удалить этого пользователя')
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthorizationError('Неправильный пароль')
          }
          return user;
        })
        .then(() => User.findByIdAndDelete(id))
        .then(() => res.send(id))
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Невалидный id пользователя'))
      }

      return next(err);
    });
}

const updateUser = (req, res, next) => {
  const { email, username, about, avatar, formatImage } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    { email, username, about, avatar, formatImage },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError('Неверно введены данные для пользователя')
        )
      }
      if (err.name === 'CastError') {
        return next(
          new ValidationError('Неверный идентификатор пользователя')
        )
      }
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(
          ConflictError('Вы не можете обновить данные другого пользователя')
        )
      }
      return next(err);
    })
}

const updateUserPassword = (req, res, next) => {
  const {email, password, newPassword} = req.body;

  return User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthorizationError('Неправильные почта или пароль')
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthorizationError('Неправильные почта или пароль')
          }
          const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
            expiresIn: '7d'
          })
          bcrypt.hash(newPassword, 10)
            .then((hash) => User.findByIdAndUpdate(
              user._id,
              {password: hash },
              { new: true, runValidators: true }
            ))
            .then((user) => {
              return res.send({token, user})
            })
            .catch((err) => {
              if (err.name === 'MongoServerError' && err.code === 11000) {
                return next(
                  new ConflictError('Вы не можете обновить данные другого пользователя')
                );
              }
              return next(err);
            })
        })
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError('Неверно введены данные для пользователя')
        );
      }
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(
          new ConflictError('Вы не можете обновить данные другого пользователя')
        );
      }
      return next(err);
    })
}

module.exports = {register, login, getUsers, getUserData, getUser, deleteUser, updateUser, updateUserPassword};
