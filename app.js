require('dotenv').config();
const express = require('express');
const {createServer} = require("http");
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {errors} = require('celebrate');
const router = require('./routes/index');
const limiter = require('./middleware/limiter')
const {requestLogger, errorLogger} = require('./middleware/logger');
const handleAllowedCors = require('./middleware/handleAllowedCors');
const handleErrors = require('./middleware/handleErrors');
const {Server} = require("socket.io");
const Message = require('./models/Message')
const NotFoundError = require("./errors/NotFoundError");
const ValidationError = require("./errors/ValidationError");

const {PORT} = process.env;
const {MONGO_URL} = process.env;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    // ПОМЕНЯТЬ ПРИ ДЕПЛОЕ
    origin: '*'
  }
});

app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  limit: '100mb',
  extended: true
}));
app.use(helmet());

app.use(requestLogger);

app.use(handleAllowedCors);

app.use(limiter);

let clients = [];

io.on("connection", (socket) => {
  console.log(`Client with id ${socket.id} connected`)
  clients.push(socket.id)

  // socket.on("message", (msg) => {
  //   Message.create({...msg, expiresIn: Date.now(), owner: "6261a2668262051dc186f528"}).then((message) => {
  //     socket.broadcast.emit("message", message);
  //   })
  // });
})

app.use('/api', router);

app.get('/api/clients-count', (req, res) => {
  console.log('Count', io.engine.clientsCount)
  res.send({
    count: io.engine.clientsCount,
  })
})

app.post('/api/chats/:chatId/messages', (req, res, next) => {
  console.log(req.user, req.body, req.params);
  const { chatId } = req.params;
  Message.create({...req.body, chatId: chatId, expiresIn: Date.now(), owner: req.user._id})
    .then((message) => {
      io.emit(message);
      res.send(message);
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Неверно введены данные для сообщения'))
      }
      return next(err);
    })
})

app.use(/.*/, (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
})

app.use(errorLogger);

app.use(errors());

app.use(handleErrors);

async function start() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    httpServer.listen(PORT, () => {
      console.log(`App has been started port ${PORT}`)
    })
  } catch (e) {
    console.log('Server error', e.message);
    process.exit(1);
  }
}

start();
