const Chat = require('../models/Chat');
const User = require('../models/User');
const ValidationError = require("../errors/ValidationError");
const AllowsError = require("../errors/AllowsError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");

const getUsersChat = (req, res, next) => {
  const {id} = req.params;
  Chat.findById(id)
    .then(chat => {
      if (!chat){
        throw new NotFoundError('Нет чата с таким id');
      }
      User.find({})
        .where('_id')
        .in(chat.users)
        .then(users => {
          console.log(users);
          const usersChat = [];
          users.map(user => {
            const newUser = user.toObject();
            delete newUser.userRights;
            delete newUser.email;
            delete newUser.about;
            delete newUser.__v;
            usersChat.push(newUser);
          })
          res.send(usersChat);
        })
    })
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(
          ConflictError('Это имя чата уже занято')
        )
      }
      return next(err);
    })
}

const getChats = (req, res, next) => {
  Chat.find({})
    .where('users')
    .equals(req.user._id)
    .then((chats) => {
      res.send(chats);
    })
    .catch(next)
}

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
  const { username } = req.query;
  let usersData;
  if (!username) {
    usersData =  User.findOne({username})
      .then(user => {
        if (!user) {
          throw new NotFoundError('Нет такого пользователя')
        }
        res.send(user);
      })
      .catch(next)
  }

  Chat.create({...req.body, users: [req.user._id, ...req.body.users], owner: req.user._id})
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
  const {id} = req.params;
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
  const {id} = req.params;
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

module.exports = {getChats, getFriends, getGroups, createChat, deleteChat, updateChat, getUsersChat };
