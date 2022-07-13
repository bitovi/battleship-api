const Ship = require('./Ship');

module.exports = class BattleShip extends Ship {
  constructor(payload) {
    super({length: 4, userId: payload.userId});
  }
}