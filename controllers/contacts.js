const Contacts = require("../models/Contacts");
const User = require("../models/User");
const NotFoundError = require("../errors/NotFoundError");

const getContacts = (req, res, next) => {
  Contacts.findOne({ owner: req.user._id })
    .then((contacts) => {
      if (!contacts) {
        throw new NotFoundError("У вас нет контактов");
      }
      res.send(contacts);
    })
    .catch(next);
};

const addContact = (req, res, next) => {
  const { id } = req.body;
  User.findById(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError("Нет пользователя с таким id");
      }
      const newUser = user.toObject();
      delete newUser.userRights;
      delete newUser.email;
      Contacts.findOne({ owner: req.user._id }).then((contactsUser) => {
        if (!contactsUser) {
          throw new NotFoundError("Ты кто я тебя не звал");
        }
        const newContacts = [...contactsUser.contacts, newUser];
        Contacts.findByIdAndUpdate(
          contactsUser._id,
          { contacts: newContacts },
          { new: true, runValidators: true }
        ).then(() => res.send(newUser));
      });
    })
    .catch(next);
};

const updateContacts = (req, res, next) => {
  const { id } = req.body;
  Contacts.findOne({ owner: req.user._id })
    .then((contactsUser) => {
      if (!contactsUser) {
        throw new NotFoundError("Ты кто я тебя не звал");
      }
      const newContacts = contactsUser.contacts.filter(
        (contact) => contact._id.toString() !== id
      );
      Contacts.findByIdAndUpdate(
        contactsUser._id,
        { contacts: newContacts },
        { new: true, runValidators: true }
      ).then(() => res.send({ id }));
    })
    .catch(next);
};

module.exports = { getContacts, addContact, updateContacts };
