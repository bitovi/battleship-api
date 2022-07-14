const jwt = require('jsonwebtoken')
const { createError } = require("../helpers/error");
const secret = 'Token';

function generateTokenFromPayload(payload) {
  const token = jwt.sign(payload, secret)
  return token
}

function validateUserToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return createError(403, 'Unable to validate token');
  }
}


module.exports = {
  validateUserToken,
  generateTokenFromPayload
}