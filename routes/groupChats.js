const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getGroups,
  createGroupChat,
  deleteChat,
  updateChat,
  getUsersChat,
  getChats,
  getChat,
  exitChat,
} = require("../controllers/groupChats");
const messagesRouter = require("./messages");

// router.get("/", getChats);

router.get("/", getGroups);

router.get(
  "/:id",
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
  }),
  getChat
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
  "/",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(4).max(40),
      formatImage: Joi.string().min(10).max(50),
      avatar: Joi.string().base64(),
      about: Joi.string().min(4).max(100),
      isNotifications: Joi.boolean(),
      isRead: Joi.boolean(),
      users: Joi.array().required(),
    }),
  }),
  createGroupChat
);

router.delete(
  "/:id",
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
  }),
  deleteChat
);

router.patch(
  "/:id",
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
    body: Joi.object().keys({
      name: Joi.string().min(4).max(40),
      formatImage: Joi.string().min(10).max(50),
      avatar: Joi.string().base64(),
      about: Joi.string().min(4).max(100),
      isNotifications: Joi.boolean(),
      isRead: Joi.boolean(),
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
    body: Joi.object().keys({
      owner: Joi.string().length(24).hex(),
    }),
  }),
  exitChat
);

router.use("/", messagesRouter);

module.exports = router;
