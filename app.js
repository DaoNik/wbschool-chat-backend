require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const router = require('./routes/index');
const limiter = require('./middleware/limiter')
const {requestLogger, errorLogger} = require('./middleware/logger');
const handleAllowedCors = require('./middleware/handleAllowedCors');
const handleErrors = require('./middleware/handleErrors');

const { PORT } = process.env;
const { MONGO_URL } = process.env;

const app = express();
// app.use(express.json({limit: '10mb'}))
app.use(bodyParser.json({ limit: '10mb'}));
app.use(helmet());

app.use(requestLogger);

app.use(handleAllowedCors);

app.use(limiter);

app.use(router);

app.use(errorLogger);

app.use(errors());

app.use(handleErrors);

async function start() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    app.listen(PORT, () => {
      console.log(`App has been started port ${PORT}`)
    })
  } catch (e) {
    console.log('Server error', e.message);
    process.exit(1);
  }
}

start();
