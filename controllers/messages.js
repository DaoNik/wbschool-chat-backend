const Message = require('../models/Message');

const getMessages = (req, res, next) => {
  console.log(req.params);
  const {chatId} = req.params;
  Message.find({chatId})
    .then((messages) => {
      res.send(messages)
    })
    .catch(next);
}

module.exports = {getMessages}
