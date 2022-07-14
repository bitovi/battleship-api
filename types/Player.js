const { v4: createUuid } = require('uuid');
const BattleShip = require('../types/ships/BattleShip');
module.exports = class Player {
  constructor(payload = {}) {
    this.id = payload.id ?? createUuid();
    this.name = payload.name;
    this.ships = payload.ships ?? [];
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      ships: this.ships.map(s => s.serialize()),
    }
  }

  static deserialize(payload) {
    payload.ships = payload.ships.map(BattleShip.deserialize)
    return new Player(payload);;
  }
}