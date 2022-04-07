const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');


const {register, login} = require('../controllers/users');

router.get('/', (req, res) => {
  res.send('Hello');
})

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8).max(100),
      username: Joi.string().required().min(4).max(30),
      userRights: Joi.string().min(2).max(10),
      avatar: Joi.string().base64()
    })
  }),
  register
);

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      emailOrUser: Joi.string().required().min(4).max(200),
      password: Joi.string().required().min(8).max(100)
    })
  }),
  login
);

module.exports = router;
