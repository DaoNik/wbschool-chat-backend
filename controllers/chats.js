const Chat = require('../models/Chat');
const ValidationError = require("../errors/ValidationError");
const AllowsError = require("../errors/AllowsError");

const getFriends = (req, res, next) => {
  Chat.find({})
    .where('users')
    .equals(req.user._id)
    .then((chats) => {
      const newArr = [];
      chats.map(chat => {
        if (chat.users.length <= 2) {
          newArr.push(chat);
        }
      })
      res.send(newArr);
    })
    .catch(next);
}

const getGroups = (req, res, next) => {
  Chat.find({})
    .where('users')
    .equals(req.user._id)
    .then((chats) => {
      const newArr = [];
      chats.map(chat => {
        if (chat.users.length > 2) {
          newArr.push(chat);
        }
      })
      res.send(newArr);
    })
    .catch(next)
}

const createChat = (req, res, next) => {
  Chat.create({...req.body, users: [req.user._id, ...req.body.users],  owner: req.user._id})
    .then((chat) => {
      res.send(chat);
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Неверно введены данные для чата'))
      }
      return next(err);
    })
}

const deleteChat = (req, res, next) => {
  const { id } = req.params;
  return Chat.findById(id)
    .then(chat => {
      if (!chat) {
        throw new NotFoundError('Нет чата с таким id');
      }
      const chatOwnerId = chat.owner.toString();
      if (chatOwnerId !== req.user._id) {
        throw new AllowsError('Вы не можете удалить этот чат')
      }
      return chat;
    })
    .then(() => Chat.findByIdAndDelete(id))
    .then(() => res.send(id))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Невалидный id чата'))
      }
      return next(err);
    })
}

const updateChat = (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    avatar,
    about,
    users,
    isNotifications,
    isRead,
    isActive
  } = req.body;

  return Chat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError('Нет чата с таким id')
      }
      const chatOwnerId = chat.owner.toString();
      if (chatOwnerId !== req.user._id) {
        throw new AllowsError('Вы не можете изменить этот чат');
      }
      return chat;
    })
    .then(() => Chat.findByIdAndUpdate(
      id,
      {name, avatar, about, users, isNotifications, isRead, isActive},
      {new: true, runValidators: true}
    ))
    .then((chat) => {
      res.send(chat)
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Неверно введены данные для чата'))
      } else if (err.name === 'CastError') {
        next(new ValidationError('Неверный идентификатор чата'))
      } else {
        next(err)
      }
    })
}

module.exports = {getFriends, getGroups, createChat, deleteChat, updateChat};
