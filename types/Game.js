const { v4: createUuid } = require('uuid');
const GridCell = require('./GridCell');
const Player = require('./Player');
module.exports = class Game {
  constructor(payload = {}) {
    this.id = payload.id ?? createUuid();
    this.gridSize = payload.gridSize;
    this.grid = payload.grid ?? this.createGrid(payload.gridSize ?? 10);
    this.players = payload.players ?? {};
    this.owner = payload.owner;
  }

  createGrid(gridSize) {
    return Array(gridSize).fill().map(() => Array(gridSize).fill(new GridCell()));
  }

  serialize() {
    const players = {}
    for(let key in this.players) {
      players[key] = this.players[key].serialize()
    }
    return {
      id: this.id,
      gridSize: this.gridSize,
      grid: this.grid.map(row => row.map(cell => cell.serialize())),
      players,
      owner: this.owner.serialize()
    }
  }

  static deserialize(payload) {
    const game = new Game(payload) 
    const players = {}
    for(let key in payload.players) {
      players[key] = Player.deserialize(payload.players[key])
    }

    game.grid = payload.grid.map(row => row.map(cell => new GridCell(cell)));
    game.owner = Player.deserialize(payload.owner);
    game.players = players
    return game;
  }
};
