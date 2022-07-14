var jwt = require('jsonwebtoken');
const GameError = require('./types/GameError');
const SECRET = 'shhhh';

const getTokenForGame = (userId) => {
  return jwt.sign({ userId }, SECRET);
}
 
const getIdForUser = (event) => {
  const header = event.headers.authorization;
  const [,tkn] = header.split('Bearer ');
  const {userId} = jwt.verify(tkn, SECRET);
  return userId;
}

module.exports = {
  getTokenForGame,
  getIdForUser
};