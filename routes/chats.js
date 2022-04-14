const router = require('express').Router();
const {celebrate, Joi} = require('celebrate');
const {
  getFriends,
  getGroups,
  createChat,
  deleteChat,
  updateChat,
  getChat,
} = require('../controllers/chats');
const messagesRouter = require("./messages");

router.get('/', getFriends);
router.get('/groups', getGroups);
router.get('/:id', getChat)
router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(4).max(40),
      avatar: Joi.string().base64(),
      about: Joi.string().min(4).max(100),
      isNotifications: Joi.boolean(),
      isRead: Joi.boolean(),
      isActive: Joi.boolean(),
      users: Joi.array().required()
    })
  }),
  createChat
)

router.delete(
  '/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex()
    })
  }),
  deleteChat
)

router.patch(
  '/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex()
    }),
    body: Joi.object().keys({
      name: Joi.string().min(4).max(40),
      avatar: Joi.string().base64(),
      about: Joi.string().min(4).max(100),
      isNotifications: Joi.boolean(),
      isRead: Joi.boolean(),
      isActive: Joi.boolean(),
      users: Joi.array()
    })
  }),
  updateChat
)

// router.use('/:id/messages', celebrate({
//   params: Joi.object().keys({
//     id: Joi.string().length(24).hex()
//   })
// }), messagesRouter);

router.use('/', messagesRouter);

module.exports = router;
