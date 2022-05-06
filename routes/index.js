const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const privateChatsRouter = require('./privateChats');
const groupChatsRouter = require('./groupChats');
const chatsRouter = require('./chats');
const usersRouter = require('./users');
const auth = require('../middleware/auth');
const {register, login} = require('../controllers/users');
const NotFoundError = require('../errors/NotFoundError')

router.get('/', (req, res) => {
  res.send('Hello');
})

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8).max(100),
      username: Joi.string().required().min(4).max(30).regex(RegExp('^[a-zA-Z0-9а-яёА-ЯЁ]*[-_— .]?[a-zA-Z0-9а-яёА-ЯЁ]*$', '')),
      userRights: Joi.string().min(2).max(10),
      about: Joi.string().min(2).max(100),
      avatar: Joi.string().base64()
    })
  }),
  register
);

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      emailOrUser: Joi.string().required().min(4).max(100),
      password: Joi.string().required().min(8).max(100)
    })
  }),
  login
);

router.use(auth);

router.use('/chats/privates', privateChatsRouter);
router.use('/chats/groups', groupChatsRouter);
router.use('/chats', chatsRouter);
router.use('/users', usersRouter);

module.exports = router;
