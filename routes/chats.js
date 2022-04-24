const router = require('express').Router();
const {celebrate, Joi} = require('celebrate');
const {
  getFriends,
  getGroups,
  createPrivateChat,
  createChat,
  deleteChat,
  updateChat,
  getUsersChat,
  getChats,
  getChat
} = require('../controllers/chats');
const messagesRouter = require("./messages");

router.get('/', getChats);

router.get('/friends', getFriends);

router.get('/groups', getGroups);

router.get('/:id', getChat);

router.get('/:id/users', getUsersChat);

router.post(
  '/private',
  celebrate({
    body: Joi.object().keys({
      ownerUsername: Joi.string().required(),
      name: Joi.string().min(4).max(40),
      formatImage: Joi.string().min(10).max(50),
      avatar: Joi.string().base64(),
      about: Joi.string().min(4).max(100),
      isNotifications: Joi.boolean(),
      isRead: Joi.boolean(),
      isActive: Joi.boolean(),
      users: Joi.array()
    })
  }),
  createPrivateChat
)

router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(4).max(40),
      formatImage: Joi.string().min(10).max(50),
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
      formatImage: Joi.string().min(10).max(50),
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

router.use('/', messagesRouter);

module.exports = router;
