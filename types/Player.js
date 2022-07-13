const { v4: createUuid } = require('uuid');

module.exports = class Player {
  constructor(payload = {}) {
    this.id = payload.id ?? createUuid();
    this.name = payload.name;
    this.ships = [] ?? payload.ships;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      ships: this.ships, // todo serialize these
    }
  }

  static deserialize(payload) {
    return new Player(payload);
  }
}