const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");

// Для тредов в которых ты учавствовал
router.get("/threads", getThreads); //P.S. когда-нибудь потом

router.get(
  "/:messagesId/thread",
  celebrate({
    params: Joi.object().keys({
      messageId: Joi.string().length(24).hex(),
    }),
  }),
  getThread
);

module.exports = router;
