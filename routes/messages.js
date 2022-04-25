const router = require('express').Router();
const {
  getMessages,
} = require('../controllers/messages');

router.get('/:chatId/messages', getMessages);

module.exports = router;
