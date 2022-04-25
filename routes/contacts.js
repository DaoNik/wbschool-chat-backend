const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getContacts,
  addContact,
  updateContacts
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

router.patch(
  '/',
  celebrate({
    body: Joi.object().keys({
      id: Joi.string().length(24).hex()
    })
  }),
  updateContacts
)

module.exports = router;
