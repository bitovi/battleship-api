var jwt = require('jsonwebtoken');
const SECRET = 'shhhh';

const getTokenForGame = (userId) => {
  return jwt.sign({ userId }, SECRET);
}
 
const getUserIdFromToken = (event) => {
  const header = event.headers.authorization;
  const [,tkn] = header.split('Bearer ');
  const {userId} = jwt.verify(tkn, SECRET);
  return userId;
}

module.exports = {
  getTokenForGame,
  getUserIdFromToken
};