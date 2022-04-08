const Message = require('../models/Message');
const ValidationError = require("../errors/ValidationError");
const AllowsError = require("../errors/AllowsError");

const getMessages = (req, res, next) => {
  Message.find({})
    .then((messages) => {
      res.send(messages)
    })
    .catch(next);
}

const createMessage = (req, res, next) => {
  console.log(req.user, req.body);
  Message.create({...req.body, owner: req.user._id})
    .then((message) => {
      res.send(message);
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Неверно введены данные для фильма'))
      }
      return next(err);
    })
}

const deleteMessage = (req, res, next) => {
  const { id } = req.params;

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
    .then((message) => res.send(message))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Невалидный id сообщения'))
      }

      return next(err);
    })
}

const updateMessage = (req, res, next) => {
  const { id } = req.params;
  const { text, imageOrFile } = req.body;

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
      { text, imageOrFile },
      { new: true, runValidators: true }
    ))
    .then((message) => {
      res.send(message)
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Неверно введены данные для текста или файла'))
      } else if (err.name === 'CastError') {
        next(new ValidationError('Неверный идентификатор пользователя'))
      } else {
        next(err)
      }
    })
}

module.exports = {getMessages, createMessage, deleteMessage, updateMessage}
