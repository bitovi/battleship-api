const { v4: createUuid } = require('uuid');
module.exports = class BattleShip {
  static size = 4;
  static name = 'battleship';
  constructor(payload) {
    this.id = payload.id ?? createUuid();
    this.userId = payload.userId;
    this.hitCount = 0;
  }

  static describeShip () {
    return {
      size: BattleShip.size,
      name: BattleShip.name
    };
  }

  serialize() {
    return {
      name: BattleShip.name,
      id: this.id,
      userId: this.userId
    }
  }

  static deserialize(payload) {
    return new BattleShip(payload);
  }
}