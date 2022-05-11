const GroupChat = require("../models/GroupChat");
const User = require("../models/User");
const ValidationError = require("../errors/ValidationError");
const AllowsError = require("../errors/AllowsError");
const NotFoundError = require("../errors/NotFoundError");

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

async function fetchGroups(socket) {
  const groups = await GroupChat.find({})
    .where("users")
    .equals(socket.data.payload._id);
  return groups;
}

const getGroupChat = (req, res, next) => {
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
      res.send(chats);
    })
    .catch(next);
};

const createGroupChat = (req, res, next) => {
  GroupChat.create({
    ...req.body,
    users: [req.user._id, ...req.body.users],
    owners: [req.user._id],
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
      const result = chat.owners.find((owner) => {
        if (owner.toString() === req.user._id) {
          return owner;
        }
      });
      if (result) {
        return chat;
      } else {
        throw new AllowsError("Вы не можете удалить этот чат");
      }
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
  const { name, avatar, formatImage, about, users, isNotifications, isRead } =
    req.body;

  return GroupChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      const result = chat.owners.find((owner) => {
        if (owner.toString() === req.user._id) {
          return owner;
        }
      });
      if (result) {
        return chat;
      } else {
        throw new AllowsError("Вы не можете удалить этот чат");
      }
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
  owner = [owner];
  return GroupChat.findById(id)
    .then((chat) => {
      if (!chat) {
        throw new NotFoundError("Нет чата с таким id");
      }
      if(!owner){
        owner = chat.owners;
      }
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
          { owners: owner, users: newUsers },
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
  getGroupChat,
  getGroups,
  createGroupChat,
  deleteChat,
  updateChat,
  getUsersChat,
  fetchGroups,
  exitChat,
};
