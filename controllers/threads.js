const NotFoundError = require("../errors/NotFoundError");
const Thread = require("../models/Thread");
const User = require("../models/User");

const getThreads = (req, res, next) => {
  Thread.find({})
    .then((threads) => {
      const yourThreads = [];
      threads.forEach((thread) => {
        for (let i = 0; i < thread.comments.length; i++) {
          if (thread.comments[i].authorId === req.user._id) {
            yourThreads.push(thread);
            break;
          }
        }
      });
      return yourThreads;
    })
    .then((yourThreads) => res.send(yourThreads))
    .catch(next);
};

const getThread = (req, res, next) => {
  const { messageId } = req.params;

  Thread.findOne({})
    .where("owner")
    .equals(messageId)
    .then((thread) => {
      if (!thread) {
        throw new NotFoundError("У этого сообщения нет треда");
      }
      res.send(thread);
    })
    .catch(next);
};

async function createComment({ chatId, threadId, comment }) {
  try {
    const socket = this;
    const currentUser = await User.findById(socket.data.payload._id);
    const thread = await Thread.findById(threadId);
    const newComment = {
      ...comment,
      authorId: currentUser._id,
      authorName: currentUser.username,
      date: Date.now(),
    };
    const newComments = [...thread.comments, newComment];

    const newThread = await Thread.findByIdAndUpdate(
      threadId,
      { comments: newComments },
      { new: true, runValidators: true }
    );
    socket.emit(`comments:create`, { chatId, threadId, comment: newComment });
    socket
      .to(chatId)
      .emit(`comments:create`, { chatId, threadId, comment: newComment });
  } catch (err) {
    console.log(err);
  }
}

async function deleteComment({ chatId, threadId, authorId, date }) {
  try {
    const socket = this;
    const thread = await Thread.findById(threadId);
    const newComments = [...thread.comments];
    for (let i = 0; i < thread.comments.length; i++) {
      if (
        thread.comments[i].authorId === authorId &&
        thread.comments[i].date === date
      ) {
        newComments.splice(i, 1);
        break;
      }
    }
    const newThread = Thread.findByIdAndUpdate(
      threadId,
      { comments: newComments },
      { new: true, runValidators: true }
    );
    socket.emit("comments:delete", { chatId, threadId, authorId, date });
    socket
      .to(chatId)
      .emit("comments:delete", { chatId, threadId, authorId, date });
  } catch (err) {
    console.log(err);
  }
}

async function updateComment({ chatId, threadId, comment }) {
  try {
    const socket = this;
    const thread = await Thread.findById(threadId);
    const newComments = [...thread.comments];
    for (let i = 0; i < thread.comments.length; i++) {
      if (
        thread.comments[i].authorId === comment.authorId &&
        thread.comments[i].date === comment.date
      ) {
        newComments[i] = comment;
        break;
      }
    }
    const newThread = Thread.findByIdAndUpdate(
      threadId,
      { comments: newComments },
      { new: true, runValidators: true }
    );
    socket.emit("comments:delete", { chatId, threadId, comment });
    socket.to(chatId).emit("comments:delete", { chatId, threadId, comment });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getThreads,
  getThread,
  createComment,
  deleteComment,
  updateComment,
};
