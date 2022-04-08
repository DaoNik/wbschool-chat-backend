const jwt = require('jsonwebtoken');
const AuthorizationError = require('../errors/AuthorizationError');

const { JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new AuthorizationError('Необходима авторизация'))
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    next(new AuthorizationError('Необходима авторизация'))
  }

  req.user = payload;
  next();
}
