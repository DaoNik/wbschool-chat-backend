const Message = require('../models/Message');
const User = require('../models/User');
const NotFoundError = require("../errors/NotFoundError");
const AllowsError = require("../errors/AllowsError");
const ValidationError = require("../errors/ValidationError");

const getMessages = (req, res, next) => {
  const { chatId } = req.params;
  Message.find({ chatId })
    .then((messages) => {
      res.send(messages)
    })
    .catch(next);
}

async function createMessage({ chatId, message }) {
  try {
    const socket = this;
    const currentUser = await User.findById(socket.data.payload._id);
    const currentMessage = await Message.create({
      ...message, username: currentUser.username, chatId: chatId, expiresIn: Date.now(), owner: currentUser._id
    })
    console.log('message', currentMessage)
    socket.emit(`messages:create`, currentMessage)
    socket.to(chatId).emit(`messages:create`, currentMessage)
  } catch (err) {
    console.log(err);
  }
}

function updateMessage({ chatId, message }) {
  try {
    const socket = this;
    const { text, imageOrFile, formatImage, _id: id } = message;
    const expiresIn = Date.now();

    return Message.findById(id)
      .then(message => {
        // if (!message) {
        //   throw new NotFoundError('Нет сообщения с таким id')
        // }
        // const messageOwnerId = message.owner.toString();
        // if (messageOwnerId !== socket.data.payload._id) {
        //   throw new AllowsError('Вы не можете изменить это сообщение')
        // }
        return message;
      })
      .then(() => Message.findByIdAndUpdate(
        id,
        { text, imageOrFile, expiresIn, formatImage },
        { new: true, runValidators: true }
      ))
      .then((message) => {
        socket.emit(`messages:update`, message)
        socket.to(chatId).emit(`messages:update`, message)
      })
  } catch (err) {
    console.log(err);
  }
}

async function deleteMessage({ chatId, messageId }) {
  const socket = this;
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError('Нет сообщения с таким id')
    }
    await Message.findByIdAndDelete(messageId);
    socket.emit(`messages:delete`, messageId)
    socket.to(chatId).emit(`messages:delete`, messageId)
  } catch (err) {
    console.error(err);
  }
  //     .then(message => {
  //       if (!message) {
  //         throw new NotFoundError('Нет сообщения с таким id')
  //       }
  //       const messageOwnerId = message.owner.toString();
  //       if (messageOwnerId !== req.user._id) {
  //         throw new AllowsError('Вы не можете удалить это сообщение')
  //       }
  //       return message;
  //     })
  //     .then(() => Message.findByIdAndDelete(id))
  //     .then((message) => {
  //       console.log('Мы туут)')
  //       socket.emit('messages:delete', message._id);
  //     })
  //     .catch((err) => {
  //       if (err.name === 'CastError') {
  //         return next(new ValidationError('Невалидный id сообщения'))
  //       }
  //       return next(err);
  //     })
}

module.exports = { getMessages, deleteMessage, createMessage, updateMessage }
