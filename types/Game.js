const { v4: createUuid } = require('uuid');
const GridCell = require('./GridCell');

module.exports = class Game {
  constructor(payload = {}) {
    this.id = payload.id ?? createUuid();
    this.grid = payload.grid ?? this.createGrid(payload.gridSize ?? 10);
    this.players = payload.players ?? [];
    this.owner = payload.owner;
  }

  createGrid(gridSize) {
    return Array(gridSize).fill().map(() => Array(gridSize).fill(new GridCell()));
  }

  serialize() {
    return {
      id: this.id,
      grid: this.grid.map(row => row.map(cell => cell.serialize())),
      players: this.players.map(p => p.serialize()),
      owner: this.owner.serialize()
    }
  }

  static deserialize(payload) {
    const game = new Game(payload) 

    game.grid = payload.grid.map(row => row.map(cell => new GridCell(cell)))

    return game;
  }
};
