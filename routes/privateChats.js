const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getPrivateChats,
  createPrivateChat,
  updateChat,
  getUsersChat,
  getPrivateChat,
  exitChat,
  ownersChat,
} = require("../controllers/privateChats");
const messagesRouter = require("./messages");

router.get("/", getPrivateChats);

router.get(
  "/:id",
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
  }),
  getPrivateChat
);

router.get(
  "/:id/users",
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
  }),
  getUsersChat
);

router.post(
  "/owners",
  celebrate({
    body: Joi.object().keys({
      userId: Joi.string().length(24).hex(),
    }),
  }),
  ownersChat
);

router.post(
  "/",
  celebrate({
    body: Joi.object().keys({
      ownerUsername: Joi.string().required(),
      ownerAvatar: Joi.string().required().base64(),
      ownerFormatImage: Joi.string(),
      isNotifications: Joi.boolean(),
      isRead: Joi.boolean(),
      isActive: Joi.boolean(),
      users: Joi.array(),
    }),
  }),
  createPrivateChat
);

router.patch(
  "/:id",
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
    body: Joi.object().keys({
      isNotifications: Joi.boolean(),
      isRead: Joi.boolean(),
      isActive: Joi.boolean(),
      users: Joi.array(),
    }),
  }),
  updateChat
);

router.patch(
  "/:id/exit",
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
  }),
  exitChat
);

router.use("/", messagesRouter);

module.exports = router;
