const Notification = require('../models/Notification');
const ValidationError = require("../errors/ValidationError");

const getNotifications = (req, res, next) => {
  Notification.find({})
    .then((notification) => {
      res.send(notification)
    })
    .catch(next);
}

createNotification = (req, res, next) => {
  Notification.create({...req.body, expiresIn: Date.now(), owner: req.user._id})
    .then(notification => {
      res.send(notification);
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Неверно введены данные для оповещения'))
      }
      return next(err);
    })
}

const deleteNotification = (req, res, next) => {
  const {id} = req.params;

  return Notification.findById(id)
    .then(notification => {
      if (!notification) {
        throw new NotFoundError('Нет оповещения с таким id')
      }
    })
    .then(() => Notification.findByIdAndDelete(id))
    .then(() => res.send(id))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Невалидный id оповещения'))
      }

      return next(err);
    })
}

module.exports = {getNotifications, deleteNotification, createNotification};