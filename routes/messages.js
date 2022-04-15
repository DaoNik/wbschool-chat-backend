const router = require('express').Router();
const {celebrate, Joi} = require('celebrate');
const {
  getMessages,
  createMessage,
  deleteMessage,
  updateMessage
} = require('../controllers/messages');

router.get('/:chatId/messages', getMessages);

router.post(
  '/:chatId/messages',
  celebrate({
    body: Joi.object().keys({
      text: Joi.string().required().min(1).max(1000),
      imageOrFile: Joi.string().base64(),
      formatImage: Joi.string().min(1).max(50)
    })
  }),
  createMessage
)

router.delete(
  '/:chatId/messages/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
      chatId: Joi.string().length(24).hex(),
    })
  }),
  deleteMessage
)

router.patch(
  '/:chatId/messages/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
      chatId: Joi.string().length(24).hex(),
    }),
    body: Joi.object().keys({
      text: Joi.string().min(1).max(1000),
      imageOrFile: Joi.string().base64(),
      expiresIn: Joi.date(),
      formatImage: Joi.string().min(1).max(50)
    })
  }),
  updateMessage
)

module.exports = router;
