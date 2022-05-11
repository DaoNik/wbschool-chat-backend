const Message = require("../models/Message");
const User = require("../models/User");
const NotFoundError = require("../errors/NotFoundError");
const Thread = require("../models/Thread");

const getMessages = (req, res, next) => {
  const { chatId } = req.params;
  Message.find({ chatId })
    .then((messages) => {
      res.send(messages);
    })
    .catch(next);
};

async function createMessage({ chatId, message, isPrivate }) {
  try {
    const socket = this;
    const currentUser = await User.findById(socket.data.payload._id);
    const currentMessage = await Message.create({
      ...message,
      username: currentUser.username,
      chatId: chatId,
      expiresIn: Date.now(),
      owner: currentUser._id,
    });
    socket.emit(`messages:create`, currentMessage);
    socket.to(chatId).emit(`messages:create`, currentMessage);
    if (!isPrivate) {
      await Thread.create({
        owner: currentMessage._id,
        avatar: currentUser.avatar,
        formatImage: currentUser.formatImage,
      });
    }
  } catch (err) {
    console.log(err);
  }
}

function updateMessage({ chatId, message }) {
  try {
    const socket = this;
    const { text, imageOrFile, formatImage, _id: id } = message;
    return Message.findById(id)
      .then((message) => {
        // if (!message) {
        //   throw new NotFoundError('Нет сообщения с таким id')
        // }
        if (message.owner === socket.data.payload._id) {
          return message;
        } else {
          // throw new AllowsError('Вы не можете изменить это сообщение');
          console.log("У вас нет прав, вы НИКТО!");
        }
      })
      .then(() =>
        Message.findByIdAndUpdate(
          id,
          { text, imageOrFile, formatImage },
          { new: true, runValidators: true }
        )
      )
      .then((message) => {
        socket.emit(`messages:update`, message);
        socket.to(chatId).emit(`messages:update`, message);
      });
  } catch (err) {
    console.log(err);
  }
}

async function deleteMessage({ chatId, messageId }) {
  const socket = this;
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError("Нет сообщения с таким id");
    }
    if (message.owner === socket.data.payload._id) {
      await Message.findByIdAndDelete(messageId);
      socket.emit(`messages:delete`, { messageId, chatId });
      socket.to(chatId).emit(`messages:delete`, { messageId, chatId });
    } else {
      // throw new AllowsError('Вы не можете удалить это сообщение');
      console.log("У вас нет прав, вы НИКТО!");
    }
  } catch (err) {
    console.error(err);
  }
  //     .then(message => {
  //       if (!message) {
  //         throw new NotFoundError('Нет сообщения с таким id')
  //       }
  //     })
  //     .catch((err) => {
  //       if (err.name === 'CastError') {
  //         return next(new ValidationError('Невалидный id сообщения'))
  //       }
  //       return next(err);
  //     })
}

module.exports = { getMessages, deleteMessage, createMessage, updateMessage };
