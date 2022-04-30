const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { getMessages } = require("../controllers/messages");
const threadsRouter = require("./threads");

router.get(
  "/:chatId/messages",
  celebrate({
    params: Joi.object().keys({
      chatId: Joi.string().length(24).hex(),
    }),
  }),
  getMessages
);

router.use("/:chatId/messages", threadsRouter);

module.exports = router;
