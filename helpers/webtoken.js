const jwt = require('jsonwebtoken')

function generateTokenFromPayload(payload) {
  const salt = 'Token'
  const token = jwt.sign(payload, salt)
  return token
}

function generatePayloadFromToken(token) {
  const salt = 'Token'
  const payload = jwt.verify(token, salt)
  return payload
}

module.exports = {
  generatePayloadFromToken,
  generateTokenFromPayload
}