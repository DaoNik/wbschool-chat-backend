const GroupChat = require("../models/GroupChat");
const User = require("../models/User");
const ValidationError = require("../errors/ValidationError");
const AllowsError = require("../errors/AllowsError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");

// Нахрен не надо
const getUsersChat = (req, res, next) => {
  const { id } = req.params;
  GroupChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      User.find({})
        .where("_id")
        .in(chat.users)
        .then((users) => {
          console.log(users);
          const usersChat = [];
          users.map((user) => {
            const newUser = user.toObject();
            delete newUser.userRights;
            delete newUser.email;
            delete newUser.about;
            delete newUser.__v;
            usersChat.push(newUser);
          });
          res.send(usersChat);
        });
    })
    .catch((err) => {
      if (err.name === "MongoServerError" && err.code === 11000) {
        return next(ConflictError("Это имя чата уже занято"));
      }
      return next(err);
    });
};

const getChats = (req, res, next) => {
  GroupChat.find({})
    .where("users")
    .equals(req.user._id)
    .then((chats) => {
      res.send(chats);
    })
    .catch(next);
};

async function fetchGroupChats(socket) {
  const chats = await GroupChat.find({})
    .where("users")
    .equals(socket.data.payload._id);
  return chats;
}

const getChat = (req, res, next) => {
  const { id } = req.params;
  GroupChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      res.send(chat);
    })
    .catch(next);
};

const getGroups = (req, res, next) => {
  GroupChat.find({})
    .where("users")
    .equals(req.user._id)
    .then((chats) => {
      // const newArr = [];
      // chats.map((chat) => {
      //   if (chat.isPrivate === false) {
      //     newArr.push(chat);
      //   }
      // });
      res.send(chats);
    })
    .catch(next);
};

const createGroupChat = (req, res, next) => {
  GroupChat.create({
    ...req.body,
    users: [req.user._id, ...req.body.users],
    owners: [req.user._id]
  })
    .then((chat) => {
      res.send(chat);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new ValidationError("Неверно введены данные для чата"));
      }
      return next(err);
    });
};

const deleteChat = (req, res, next) => {
  const { id } = req.params;
  return GroupChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      chat.owners.forEach(owner => {
        if (owner.toString() !== req.user._id) {
          throw new AllowsError("Вы не можете удалить этот чат");
        }
      })
      return chat;
    })
    .then(() => GroupChat.findByIdAndDelete(id).then(() => res.send({ id })))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new ValidationError("Невалидный id чата"));
      }
      return next(err);
    });
};

const updateChat = (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    avatar,
    formatImage,
    about,
    users,
    isNotifications,
    isRead,
  } = req.body;

  return GroupChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      chat.owners.forEach(owner => {
        if (owner.toString() !== req.user._id) {
          throw new AllowsError("Вы не можете изменить этот чат");
        }
      })
      return chat;
    })
    .then(() =>
    GroupChat.findByIdAndUpdate(
        id,
        {
          name,
          avatar,
          formatImage,
          about,
          users,
          isNotifications,
          isRead,
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
  let { owner } = req.body;

  return GroupChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      chat.owners.forEach(ownerId => {
        if (ownerId.toString() === req.user._id && !owner) {
          owner = chat.users.find((user) => {
            if (user._id.toString() !== ownerId.toString()) {
              return user;
            }
          });
        }
      })
      const newUsers = chat.users.filter((user) => {
        if (user._id.toString() !== req.user._id) {
          return user;
        }
      });
      if (newUsers.length <= 0) {
        return GroupChat.findByIdAndDelete(id).then(() => res.send({ id }));
      } else {
        GroupChat.findByIdAndUpdate(
          id,
          { owner, users: newUsers },
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
  getChats,
  getChat,
  getGroups,
  createGroupChat,
  deleteChat,
  updateChat,
  getUsersChat,
  fetchGroupChats,
  exitChat,
};
