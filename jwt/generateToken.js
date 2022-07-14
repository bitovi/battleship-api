const JWT_SECRET_KEY = 'fish';
const casual = require('casual');
const { v4: createUuid } = require('uuid');
const jwt = require('jsonwebtoken');

function generateJWTToken(payload = {}) {
  var token = jwt.sign(payload, JWT_SECRET_KEY);
  return token;
}

function createUser({ gameId, name }) {
  const userId = createUuid();
  let specialName = name ?? casual.name.toUpperCase();
  const userName =
    casual.name.toUpperCase() +
    ' ' +
    specialName +
    ' ' +
    casual.name.toUpperCase();
  let jwtToken = generateJWTToken({ gameId, userName, userId });
  return jwtToken;
}

module.exports = createUser;
