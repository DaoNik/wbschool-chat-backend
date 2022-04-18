const Contacts = require('../models/Contacts');
const User = require('../models/User');
const NotFoundError = require("../errors/NotFoundError");

const getContacts = (req, res, next) => {
  Contacts.find({})
    .where('owner')
    .equals(req.user._id)
    .then(contacts => {
      if (!contacts) {
        throw new NotFoundError('У вас нет контактов')
      }
      res.send(contacts)
    })
    .catch(next)
}

const addContact = (req, res, next) => {
  const { id } = req.body;
  User.findById(id)
    .then(user => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id')
      }
      Contacts.findOne({owner: req.user._id})
        .then(contactsUser => {
          if (!contactsUser) {
            Contacts.create({contacts: [user], owner: req.user._id})
              .then(contacts => res.send(contacts))
          }
          const newContacts = [...contactsUser.contacts, user];
          Contacts.findByIdAndUpdate(
            contactsUser._id,
            {contacts: newContacts},
            {new: true, runValidators: true}
          )
            .then(() => res.send(user))
        })
    })
    .catch(next)
}

module.exports = { getContacts, addContact };
