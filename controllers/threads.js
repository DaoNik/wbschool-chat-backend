const NotFoundError = require("../errors/NotFoundError");
const Thread = require("../models/Thread");

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

  Thread.find({})
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

module.exports = { getThreads, getThread };
