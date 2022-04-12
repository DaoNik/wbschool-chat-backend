const Notification = require('../models/Notification');

const getNotification = (req, res, next) => {
  Notification.find({})
    .then((notification) => {
      res.send(notification)
    })
    .catch(next);
}