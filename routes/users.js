const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  updateUser,
  updateUserPassword
} = require('../controllers/users');

router.get('/', getUsers);

router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      about: Joi.string().min(2).max(100),
      avatar: Joi.string().base64(),
      email: Joi.string().email(),
      username: Joi.string().min(4).max(30).regex(RegExp('^[a-zA-Z0-9а-яёА-ЯЁ]*[-_— .]?[a-zA-Z0-9а-яёА-ЯЁ]*$', '')),
    })
  }),
  updateUser
)

router.patch(
  '/me/newPass',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8).max(100),
      newPassword: Joi.string().required().min(8).max(100)
    })
  }),
  updateUserPassword
)

module.exports = router;
