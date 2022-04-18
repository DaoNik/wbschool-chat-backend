const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getContacts,
  addContact,
} = require('../controllers/contacts')

router.get('/', getContacts);

router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      id: Joi.string().length(24).hex()
    })
  }),
  addContact
)

module.exports = router;
