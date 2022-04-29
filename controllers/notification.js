const Notification = require("../models/Notification");
const ValidationError = require("../errors/ValidationError");
const NotFoundError = require("../errors/NotFoundError");
const AllowsError = require("../errors/AllowsError");
const User = require("../models/User");

const getNotifications = (req, res, next) => {
  Notification.find({})
    .where("owner")
    .equals(req.user._id)
    .then((notification) => {
      res.send(notification);
    })
    .catch(next);
};

// const createNotification = (req, res, next) => {
//   Notification.create({...req.body, expiresIn: Date.now(), owner: req.user._id})
//     .then(notification => {
//       res.send(notification);
//     })
//     .catch(err => {
//       if (err.name === 'ValidationError') {
//         return next(new ValidationError('Неверно введены данные для оповещения'))
//       }
//       return next(err);
//     })
// }

function createNotification({ notification }) {
  try {
    const socket = this;
    Notification.create({
      ...notification,
      expiresIn: Date.now(),
      owner: socket.data.payload._id,
    }).then((notification) => {
      socket.emit("notifications:create", notification);
    });
  } catch (err) {
    console.log(err);
  }
}

function addNotification({ notification, chatId, usersId }) {
  try {
    const socket = this;
    // Notification.create({
    //   ...notification,
    //   expiresIn: Date.now(),
    //   owner: userId,
    // }).then((notification) => {
    //   socket.to(chatId).emit("notifications:create", notification);
    // });
    usersId.forEach((userId) => {
      Notification.create({
        ...notification,
        expiresIn: Date.now(),
        owner: userId,
      });
    });
    socket.to(chatId).emit("notifications:create", notification);
  } catch (err) {
    console.log(err);
  }
}

// const deleteNotification = (req, res, next) => {
//   const { id } = req.params;

//   return Notification.findById(id)
//     .then(notification => {
//       if (!notification) {
//         throw new NotFoundError('Нет оповещения с таким id')
//       }
//       const notificationOwnerId = notification.owner.toString();
//       if (notificationOwnerId !== req.user._id) {
//         throw new AllowsError('Вы не можете удалить это уведомление')
//       }
//       return notification;
//     })
//     .then(() => Notification.findByIdAndDelete(id))
//     .then(() => res.send(id))
//     .catch((err) => {
//       if (err.name === 'CastError') {
//         return next(new ValidationError('Невалидный id оповещения'))
//       }

//       return next(err);
//     })
// }

function deleteNotification({ notificationId }) {
  try {
    const socket = this;
    Notification.findByIdAndDelete(notificationId).then(() => {
      socket.emit("notifications:delete", notificationId);
    });
  } catch (err) {
    console.log(err);
  }
}
// const clearNotifications = (req, res, next) => {
//   return Notification.find({})
//     .where('owner')
//     .equals(req.user._id)
//     .then(notifications => {
//       if (!notifications) {
//         throw new NotFoundError('У вас нет оповещений')
//       }
//       notifications.map(notification => {
//         Notification.findByIdAndDelete(notification._id)
//           .then(() => res.write('Ok'))
//       })
//     })
//     .then(() => res.send([]))
//     .catch(next)
// }

function clearNotifications() {
  try {
    const socket = this;
    Notification.deleteMany(
      { owner: socket.data.payload._id },
      (notifications) => {
        socket.emit("notifications:clear", notifications);
      }
    );
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getNotifications,
  deleteNotification,
  clearNotifications,
  createNotification,
  addNotification,
};
