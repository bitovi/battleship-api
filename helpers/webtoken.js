const jwt = require('jsonwebtoken')
const { getSecretFromEnvironment } = require("../helpers/secrets-manager");
const { createError } = require("../helpers/error");

function generateTokenFromPayload(payload, privateKey) {
  const token = jwt.sign(payload, privateKey)
  return token
}

function validateUserToken(token, publicKey) {
  try {
    return jwt.verify(token, publicKey);
  } catch (err) {
    return createError(403, 'Unable to validate token');
  }
}

async function getJWTKeyPair() {
  const rawKeyPair = await getSecretFromEnvironment('JWT_KEY_PAIR');
  const keyPar = JSON.parse(rawKeyPair);
  return keyPar;
}


module.exports = {
  validateUserToken,
  generateTokenFromPayload,
  getJWTKeyPair
}