const PrivateChat = require("../models/PrivateChat");
const User = require("../models/User");
const ValidationError = require("../errors/ValidationError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");

//нахрен не надо
const getUsersChat = (req, res, next) => {
  const { id } = req.params;
  PrivateChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      User.find({})
        .where("_id")
        .in(chat.users)
        .then((users) => {
          const usersChat = [];
          users.map((user) => {
            const newUser = user.toObject();
            delete newUser.userRights;
            delete newUser.email;
            delete newUser.about;
            usersChat.push(newUser);
          });
          res.send(usersChat);
        });
    })
    .catch((err) => {
      return next(err);
    });
};

async function fetchPrivates(socket) {
  const chats = await PrivateChat.find({})
    .where("users")
    .equals(socket.data.payload._id);
  return chats;
}

const getPrivateChat = (req, res, next) => {
  const { id } = req.params;
  PrivateChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      res.send(chat);
    })
    .catch(next);
};

const getPrivateChats = (req, res, next) => {
  PrivateChat.find({})
    .where("users")
    .equals(req.user._id)
    .then((chats) => {
      res.send(chats);
    })
    .catch(next);
};

const createPrivateChat = (req, res, next) => {
  const { username } = req.query;
  const { ownerUsername, ownerAvatar, ownerFormatImage } = req.body;
  if (!username) {
    throw new NotFoundError("Вы не передали пользователя!")
  }
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        throw new NotFoundError("Нет такого пользователя");
      }
      return user;
    })
    .then((user) => {
      PrivateChat.create({
        users: [user._id, req.user._id],
        usernames: [user.username, ownerUsername],
        avatars: [
          { ownerAvatar, ownerFormatImage },
          { avatar: user.avatar, formatImage: user.formatImage },
        ],
        owners: [user._id, req.user._id],
      })
        .then((chat) => {
          res.send(chat);
        })
        .catch((err) => {
          if (err.name === "ValidationError") {
            return next(
              new ValidationError("Неверно введены данные для чата")
            );
          }
          return next(err);
        });
    })
    .catch(next);
};

const ownersChat = (req, res, next) => {
  const { userId } = req.body;
  PrivateChat.findOne({})
    .where("owners")
    .all([req.user._id, userId] || [userId, req.user._id])
    .then((chats) => {
      res.send(chats);
    })
    .catch(next);
};

const updateChat = (req, res, next) => {
  const { id } = req.params;
  const { users, isNotifications, isRead, isActive } = req.body;

  return PrivateChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      return chat;
    })
    .then(() =>
      PrivateChat.findByIdAndUpdate(
        id,
        {
          users,
          isNotifications,
          isRead,
          isActive,
        },
        { new: true, runValidators: true }
      )
    )
    .then((chat) => {
      res.send(chat);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new ValidationError("Неверно введены данные для чата"));
      } else if (err.name === "CastError") {
        next(new ValidationError("Неверный идентификатор чата"));
      } else {
        next(err);
      }
    });
};

const exitChat = (req, res, next) => {
  const { id } = req.params;

  return PrivateChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      const newUsers = chat.users.filter((user) => {
        if (user._id.toString() !== req.user._id) {
          return user;
        }
      });
      if (newUsers.length <= 0) {
        return PrivateChat.findByIdAndDelete(id).then(() => res.send({ id }));
      } else {
        PrivateChat.findByIdAndUpdate(
          id,
          { users: newUsers },
          { new: true, runValidators: true }
        ).then((chat) => res.send({ chat }));
      }
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new ValidationError("Неверно введены данные для чата"));
      } else if (err.name === "CastError") {
        next(new ValidationError("Неверный идентификатор чата"));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getPrivateChat,
  getPrivateChats,
  createPrivateChat,
  updateChat,
  getUsersChat,
  fetchPrivates,
  exitChat,
  ownersChat,
};
