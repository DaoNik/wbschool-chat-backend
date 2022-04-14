const router = require('express').Router();
const {celebrate, Joi} = require('celebrate');
const {
  getMessages,
  createMessage,
  deleteMessage,
  updateMessage
} = require('../controllers/messages');

router.get('/', getMessages);

router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      text: Joi.string().required().min(1).max(1000),
      imageOrFile: Joi.string(),
    })
  }),
  createMessage
)

router.delete(
  '/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex()
    })
  }),
  deleteMessage
)

router.patch(
  '/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex()
    }),
    body: Joi.object().keys({
      text: Joi.string().min(1).max(1000),
      imageOrFile: Joi.string(),
      expiresIn: Joi.date()
    })
  }),
  updateMessage
)

module.exports = router;
