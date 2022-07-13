var jwt = require('jsonwebtoken');

const getTokenForGame = (playerId) => {
  return jwt.sign({ playerId }, 'shhhhh');
}

module.exports = {
  getTokenForGame
};