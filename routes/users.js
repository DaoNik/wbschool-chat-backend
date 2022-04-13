const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  updateUserPassword
} = require('../controllers/users');
const notificationsRouter =require('./notification');

router.get('/', getUsers);

router.get('/me', getUser);

router.delete(
  '/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex()
    }),
    body: Joi.object().keys({
      password: Joi.string().required().min(8).max(100),
    })
  }),
  deleteUser
)

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

router.use('/notifications', notificationsRouter);

module.exports = router;
