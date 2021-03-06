require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { errors } = require("celebrate");
const router = require("./routes/index");
const limiter = require("./middleware/limiter");
const { requestLogger, errorLogger } = require("./middleware/logger");
const handleAllowedCors = require("./middleware/handleAllowedCors");
const handleErrors = require("./middleware/handleErrors");
const { Server } = require("socket.io");
const NotFoundError = require("./errors/NotFoundError");
const { fetchGroups } = require("./controllers/groupChats");
const { fetchPrivates } = require("./controllers/privateChats");
const {
  deleteMessage,
  createMessage,
  updateMessage,
} = require("./controllers/messages");
const jwt = require("jsonwebtoken");

const {
  createNotification,
  deleteNotification,
  clearNotifications,
} = require("./controllers/notification");
const Notification = require("./models/Notification");
const {
  createComment,
  deleteComment,
  updateComment,
} = require("./controllers/threads");

const { PORT } = process.env;
const { MONGO_URL } = process.env;
const { JWT_SECRET } = process.env;

const allowedCors = [
  "http://localhost:4200",
  "http://localhost:4201",
  "http://localhost:4202",
  "https://wbschool-chat.ru",
];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: "/api/socket",
  cors: {
    origin: allowedCors,
  },
});

app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    limit: "100mb",
    extended: true,
  })
);
app.use(helmet());

app.use(requestLogger);

app.use(handleAllowedCors);

app.use(limiter);

let clients = [];

io.on("connection", async (socket) => {
  console.log(
    `Client with id ${socket.id} connected ${socket.handshake.auth.token}`
  );
  clients.push(socket.id);

  let payload;

  try {
    payload = jwt.verify(socket.handshake.auth.token, JWT_SECRET);
  } catch (e) {
    socket.on("disconnect", () => {
      clients.splice(clients.indexOf(socket.id), 1);
      console.log(`Client with id ${socket.id} disconnected`);
    });
  }
  socket.data.payload = payload;

  socket.on("disconnect", () => {
    clients.splice(clients.indexOf(socket.id), 1);
    console.log(`Client with id ${socket.id} disconnected`);
  });

  const groups = await fetchGroups(socket);
  groups.forEach((groups) => socket.join(groups._id.toString()));
  const privates = await fetchPrivates(socket);
  privates.forEach((private) => socket.join(private._id.toString()));

  socket.on("messages:delete", deleteMessage);
  socket.on("messages:create", createMessage);
  socket.on("messages:update", updateMessage);

  socket.on("comments:create", createComment);
  socket.on("comments:delete", deleteComment);
  socket.on("comments:update", updateComment);

  socket.on("notifications:delete", deleteNotification);
  socket.on("notifications:create", createNotification);
  socket.on("notifications:clear", clearNotifications);
  socket.on(
    "notifications:addNotification",
    async ({ notification, chatId, usersId }) => {
      try {
        const sockets = await io.fetchSockets();
        sockets.forEach((socket) => {
          if (usersId.includes(socket.data.payload._id)) {
            // ??????????????????, ?????? notifications:create
            socket.emit("notifications:addInGroup", notification);
          }
        });
        usersId.forEach((userId) => {
          Notification.create({
            ...notification,
            expiresIn: Date.now(),
            owner: userId,
          }).then((notification) => {
            console.log("???? ??????????", notification);
          });
        });
      } catch (err) {
        console.log(err);
      }
    }
  );
});

app.use("/api", router);

app.get("/api/clients-count", (req, res) => {
  res.send({
    count: io.engine.clientsCount,
  });
});

// app.post('/api/chats/:chatId/messages',
//   celebrate({
//     params: Joi.object().keys({
//       chatId: Joi.string().length(24).hex(),
//     }),
//     body: Joi.object().keys({
//       text: Joi.string().min(1).max(1000),
//       imageOrFile: Joi.string().base64(),
//       expiresIn: Joi.date(),
//       formatImage: Joi.string().min(10).max(50)
//     })
//   }),
//   (req, res, next) => {
//     const {chatId} = req.params;
//     User.findById(req.user._id)
//       .then((user) => {
//         Message.create({
//           ...req.body, username: user.username, chatId: chatId, expiresIn: Date.now(), owner: req.user._id
//         })
//           .then((message) => {
//             console.log(message);
//             io.emit('message', message);
//             res.send(message);
//           })
//           .catch(err => {
//             if (err.name === 'ValidationError') {
//               return next(new ValidationError('?????????????? ?????????????? ???????????? ?????? ??????????????????'))
//             }
//             return next(err);
//           })
//       })
//       .catch(next)
//   })

// app.delete(
//   '/api/chats/:chatId/messages/:id',
//   celebrate({
//     params: Joi.object().keys({
//       id: Joi.string().length(24).hex(),
//       chatId: Joi.string().length(24).hex(),
//     })
//   }),
//   (req, res, next) => {
//     const {id} = req.params;
//
//     return Message.findById(id)
//       .then(message => {
//         if (!message) {
//           throw new NotFoundError('?????? ?????????????????? ?? ?????????? id')
//         }
//         const messageOwnerId = message.owner.toString();
//         if (messageOwnerId !== req.user._id) {
//           throw new AllowsError('???? ???? ???????????? ?????????????? ?????? ??????????????????')
//         }
//         return message;
//       })
//       .then(() => Message.findByIdAndDelete(id))
//       .then((message) => {
//         io.emit('delete message', message._id);
//         res.send(message._id)
//       })
//       .catch((err) => {
//         if (err.name === 'CastError') {
//           return next(new ValidationError('???????????????????? id ??????????????????'))
//         }
//         return next(err);
//       })
//   }
// )

// app.patch('/api/chats/:chatId/messages/:id',
//   celebrate({
//     params: Joi.object().keys({
//       id: Joi.string().length(24).hex(),
//       chatId: Joi.string().length(24).hex(),
//     }),
//     body: Joi.object().keys({
//       text: Joi.string().min(1).max(1000),
//       imageOrFile: Joi.string().base64(),
//       expiresIn: Joi.date(),
//       formatImage: Joi.string().min(10).max(50)
//     })
//   }),
//   (req, res, next) => {
//     const {id} = req.params;
//     const {text, imageOrFile, formatImage} = req.body;
//     const expiresIn = Date.now();
//
//     return Message.findById(id)
//       .then(message => {
//         if (!message) {
//           throw new NotFoundError('?????? ?????????????????? ?? ?????????? id')
//         }
//         const messageOwnerId = message.owner.toString();
//         if (messageOwnerId !== req.user._id) {
//           throw new AllowsError('???? ???? ???????????? ???????????????? ?????? ??????????????????')
//         }
//         return message;
//       })
//       .then(() => Message.findByIdAndUpdate(
//         id,
//         {text, imageOrFile, expiresIn, formatImage},
//         {new: true, runValidators: true}
//       ))
//       .then((message) => {
//         io.emit('update message', message);
//         res.send(message)
//       })
//       .catch((err) => {
//         if (err.name === 'ValidationError') {
//           next(new ValidationError('?????????????? ?????????????? ???????????? ?????? ???????????? ?????? ??????????'))
//         } else if (err.name === 'CastError') {
//           next(new ValidationError('???????????????? ?????????????????????????? ??????????????????'))
//         } else {
//           next(err)
//         }
//       })
//
//   })

app.use(/.*/, (req, res, next) => {
  next(new NotFoundError("???????????????? ???? ??????????????"));
});

app.use(errorLogger);

app.use(errors());

app.use(handleErrors);

async function start() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    httpServer.listen(PORT, () => {
      console.log(`App has been started port ${PORT}`);
    });
  } catch (e) {
    console.log("Server error", e.message);
    process.exit(1);
  }
}

start();
