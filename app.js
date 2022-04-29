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
const { fetchChats } = require("./controllers/chats");
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
  addNotification,
} = require("./controllers/notification");

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

  const chats = await fetchChats(socket);
  chats.forEach((chat) => socket.join(chat._id.toString()));
  console.log(io.sockets.adapter.rooms);

  socket.on("messages:delete", deleteMessage);
  socket.on("messages:create", createMessage);
  socket.on("messages:update", updateMessage);

  socket.on("notifications:delete", deleteNotification);
  socket.on("notifications:create", createNotification);
  socket.on("notifications:clear", clearNotifications);
  socket.on("notifications:addNotification", addNotification);
});

app.use("/api", router);

app.get("/api/clients-count", (req, res) => {
  console.log("Count", io.engine.clientsCount);
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
//               return next(new ValidationError('Неверно введены данные для сообщения'))
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
//           throw new NotFoundError('Нет сообщения с таким id')
//         }
//         const messageOwnerId = message.owner.toString();
//         if (messageOwnerId !== req.user._id) {
//           throw new AllowsError('Вы не можете удалить это сообщение')
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
//           return next(new ValidationError('Невалидный id сообщения'))
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
//           throw new NotFoundError('Нет сообщения с таким id')
//         }
//         const messageOwnerId = message.owner.toString();
//         if (messageOwnerId !== req.user._id) {
//           throw new AllowsError('Вы не можете изменить это сообщение')
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
//           next(new ValidationError('Неверно введены данные для текста или файла'))
//         } else if (err.name === 'CastError') {
//           next(new ValidationError('Неверный идентификатор сообщения'))
//         } else {
//           next(err)
//         }
//       })
//
//   })

app.use(/.*/, (req, res, next) => {
  next(new NotFoundError("Страница не найдена"));
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
