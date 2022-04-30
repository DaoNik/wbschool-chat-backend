const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { getThreads, getThread } = require("../controllers/threads");

// Для тредов в которых ты учавствовал
router.get("/threads", getThreads);

router.get(
  "/:messageId/thread",
  celebrate({
    params: Joi.object().keys({
      messageId: Joi.string().length(24).hex(),
    }),
  }),
  getThread
);

// router.patch(
//   "/:messagesId/thread",
//   celebrate({
//     params: Joi.object().keys({
//       messageId: Joi.string().length(24).hex(),
//     }),
//     body: Joi.object().keys({
//       authorName: Joi.string().min(4).max(40),
//       imageOrFile: Joi.string().base64(),
//       formatImage: Joi.string().min(10).max(50),
//     }),
//   }),
//   createComment
// );

module.exports = router;
