var jwt = require('jsonwebtoken');

const SECRET = 'shhhh';

const getTokenForGame = (playerId) => {
  return jwt.sign({ playerId }, SECRET);
}

const getIdFromToken = tkn => {
  return jwt.decode(tkn, SECRET);
}

module.exports = {
  getTokenForGame
};