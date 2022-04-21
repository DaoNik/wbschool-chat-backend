const Message = require('../models/Message');
const User = require('../models/User')
const ValidationError = require("../errors/ValidationError");
const AllowsError = require("../errors/AllowsError");
const NotFoundError = require("../errors/NotFoundError");

const getMessages = (req, res, next) => {
  console.log(req.params);
  const {chatId} = req.params;
  Message.find({chatId})
    .then((messages) => {
      res.send(messages)
    })
    .catch(next);
}

const createMessage = (req, res, next) => {
  console.log(req.user, req.body, req.params);
  const {chatId} = req.params;
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет такого пользователя')
      }
      Message.create({...req.body, chatId: chatId, expiresIn: Date.now(), owner: req.user._id, username: user.username})
        .then((message) => {
          res.send(message);
        })
        .catch(err => {
          if (err.name === 'ValidationError') {
            return next(new ValidationError('Неверно введены данные для сообщения'))
          }
          return next(err);
        })
    })
}

const deleteMessage = (req, res, next) => {
  const {id} = req.params;

  return Message.findById(id)
    .then(message => {
      if (!message) {
        throw new NotFoundError('Нет сообщения с таким id')
      }
      const messageOwnerId = message.owner.toString();
      if (messageOwnerId !== req.user._id) {
        throw new AllowsError('Вы не можете удалить это сообщение')
      }
      return message;
    })
    .then(() => Message.findByIdAndDelete(id))
    .then((message) => res.send(message._id))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Невалидный id сообщения'))
      }

      return next(err);
    })
}

const updateMessage = (req, res, next) => {
  const {id} = req.params;
  const {text, imageOrFile, formatImage} = req.body;
  const expiresIn = Date.now();

  return Message.findById(id)
    .then(message => {
      if (!message) {
        throw new NotFoundError('Нет сообщения с таким id')
      }
      const messageOwnerId = message.owner.toString();
      if (messageOwnerId !== req.user._id) {
        throw new AllowsError('Вы не можете изменить это сообщение')
      }
      return message;
    })
    .then(() => Message.findByIdAndUpdate(
      id,
      {text, imageOrFile, expiresIn, formatImage},
      {new: true, runValidators: true}
    ))
    .then((message) => {
      res.send(message)
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Неверно введены данные для текста или файла'))
      } else if (err.name === 'CastError') {
        next(new ValidationError('Неверный идентификатор сообщения'))
      } else {
        next(err)
      }
    })
}

module.exports = {getMessages, createMessage, deleteMessage, updateMessage}
