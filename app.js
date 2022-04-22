require('dotenv').config();
const express = require('express');
const { createServer } = require("http");
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const router = require('./routes/index');
const limiter = require('./middleware/limiter')
const {requestLogger, errorLogger} = require('./middleware/logger');
const handleAllowedCors = require('./middleware/handleAllowedCors');
const handleErrors = require('./middleware/handleErrors');
const {Server} = require("socket.io");
const Message = require('./models/Message')

const { PORT } = process.env;
const { MONGO_URL } = process.env;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4200"
  }
});

app.use(bodyParser.json({ limit: '100mb'}));
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

  socket.emit('message', 'I\'m server');
  socket.on("message", (msg) => {
    Message.create({ ...msg, expiresIn: Date.now(), owner: "6261a2668262051dc186f528" }).then((message) => {
      socket.broadcast.emit("message", message);
    })
  });
})

app.use('/api', router);

app.post('/api')

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
