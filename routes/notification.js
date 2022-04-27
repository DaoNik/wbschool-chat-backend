const router = require('express').Router()
const {
  getNotifications,
  // deleteNotification,
  // clearNotifications,
  // createNotification
} = require('../controllers/notification');

router.get('/', getNotifications);

// router.post('/',
//   celebrate({
//     body: Joi.object().keys({
//       text: Joi.string().required().min(1).max(300),
//     })
//   }),
//   createNotification)

// router.delete('/clear', clearNotifications);

// router.delete('/:id',
//   celebrate({
//     params: Joi.object().keys({
//       id: Joi.string().length(24).hex()
//     })
//   }), deleteNotification)

module.exports = router;
