module.exports = class BattleShip {
  static size = 4;
  static name = 'battleship';
  constructor(payload) {
    this.userId = payload.userId;
  }

  static describeShip () {
    return {
      length: BattleShip.size,
      name: BattleShip.name
    };
  }

  serialize() {
    return {
      size,
      userId: this.userId
    }
  }

  deserialize(payload) {
    return new BattleShip(payload);
  }
}